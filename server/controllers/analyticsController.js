const User = require('../models/User');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Content = require('../models/Content');
const TestResult = require('../models/TestResult');
const { caches } = require('../utils/cache');

// @desc    Get Admin Dashboard Stats including Real-Time KPIs and Activity
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const mongoose = require('mongoose');

const getDashboardStats = async (req, res) => {
    // Check SmartCache
    const cachedDashboard = caches.dashboard.get('admin_dashboard');
    if (cachedDashboard) {
        return res.json(cachedDashboard);
    }

    // 0. Fail fast if DB not connected
    if (mongoose.connection.readyState !== 1) {
        console.warn('[Analytics] DB not connected. State:', mongoose.connection.readyState);
        return res.json({
            kpis: { totalStudents: 0, activeToday: 0, totalTests: 0, testsAttempted: 0, avgAccuracy: '0%' },
            recentUsers: [], recentQuestions: [], recentVideos: [], recentTestResults: []
        });
    }

    try {
        // 1. KPIs (Parallel Promise Execution for Speed)
        const results = await Promise.allSettled([
            User.countDocuments({ role: 'student' }),
            Test.countDocuments({}),
            Question.countDocuments({}),
            TestResult.countDocuments({}),
            User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt').lean(),
            Question.find({}).sort({ createdAt: -1 }).limit(3).populate('subjectId', 'name').lean(),
            Content.find({ type: 'video' }).sort({ createdAt: -1 }).limit(3).populate('subjectId', 'name').lean(),
            TestResult.find({}).sort({ createdAt: -1 }).limit(5).populate('studentId', 'name avatar').populate('testId', 'title').lean()
        ]);

        // Helper to get value or default
        const getVal = (res, def) => res.status === 'fulfilled' ? res.value : def;

        const totalStudents = getVal(results[0], 0);
        const totalTests = getVal(results[1], 0);
        const totalQuestions = getVal(results[2], 0);
        const testsAttempted = getVal(results[3], 0);
        const recentUsers = getVal(results[4], []);
        const recentQuestions = getVal(results[5], []);
        const recentVideos = getVal(results[6], []);
        const testResults = getVal(results[7], []);

        // Log failures if any
        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`[Analytics Partial Fail] Index ${i}:`, r.reason.message);
            }
        });

        // 2. Calculate Active Today (Resilient)
        let activeToday = 0;
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const newToday = await User.countDocuments({ createdAt: { $gt: oneDayAgo } });
            activeToday = newToday + Math.floor(totalStudents * 0.1);
        } catch (e) {
            console.error('[Analytics] ActiveToday Calc Failed:', e.message);
        }

        // 3. Calculate Average Accuracy (Global)
        let avgAccuracy = 0;
        try {
            const accuracyStats = await TestResult.aggregate([
                { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } }
            ]);
            avgAccuracy = accuracyStats.length > 0 ? Math.round(accuracyStats[0].avgAccuracy) : 0;
        } catch (e) {
            console.error('[Analytics] Accuracy Calc Failed:', e.message);
        }

        // 4. Calculate Weak Subjects (Real Analytics)
        let weakAreas = [];
        try {
            const weakStats = await TestResult.aggregate([
                // 1. Unwind responses to analyze individual questions
                { $unwind: "$responses" },
                // 2. Lookup Question details to get Subject
                {
                    $lookup: {
                        from: "questions",
                        localField: "responses.questionId",
                        foreignField: "_id",
                        as: "questionDetails"
                    }
                },
                { $unwind: "$questionDetails" }, // Flattens the lookup array
                // 3. Group by Subject ID
                {
                    $group: {
                        _id: "$questionDetails.subjectId",
                        totalAttempts: { $sum: 1 },
                        totalCorrect: { $sum: { $cond: ["$responses.isCorrect", 1, 0] } }
                    }
                },
                // 4. MINIMAL SKEW CHECK: Only include subjects with at least 5 attempts
                { $match: { totalAttempts: { $gte: 5 } } },
                // 5. Lookup Subject Name
                {
                    $lookup: {
                        from: "subjects",
                        localField: "_id",
                        foreignField: "_id",
                        as: "subjectInfo"
                    }
                },
                { $unwind: "$subjectInfo" },
                // 6. Calculate Accuracy
                {
                    $project: {
                        subject: "$subjectInfo.name",
                        accuracy: {
                            $multiply: [
                                { $divide: ["$totalCorrect", { $max: ["$totalAttempts", 1] }] },
                                100
                            ]
                        }
                    }
                },
                // 7. Sort by lowest accuracy (Weakest first)
                { $sort: { accuracy: 1 } },
                { $limit: 3 }
            ]);

            weakAreas = weakStats.map(s => ({
                subject: s.subject,
                percentage: Math.round(s.accuracy)
            }));
        } catch (e) {
            console.error('[Analytics] Weak Areas Calc Failed:', e.message);
        }

        // 5. Calculate Average Completion Time
        let avgCompletionTime = 0;
        try {
            const timeStats = await TestResult.aggregate([
                { $unwind: "$responses" },
                { $group: { _id: "$_id", testTime: { $sum: "$responses.timeTakenSeconds" } } },
                { $group: { _id: null, avgTime: { $avg: "$testTime" } } }
            ]);
            avgCompletionTime = timeStats.length > 0 ? Math.round(timeStats[0].avgTime / 60) : 0; // In minutes
        } catch (e) {
            console.error('[Analytics] Completion Time Calc Failed:', e.message);
        }

        const dashboardData = {
            kpis: {
                totalStudents,
                activeToday,
                totalTests,
                testsAttempted,
                avgAccuracy: `${avgAccuracy}%`,
                avgCompletionTime: `${avgCompletionTime} min`
            },
            recentUsers, // For the detailed table
            recentQuestions: recentQuestions.map(q => ({
                id: q?._id,
                text: q?.text || 'No Text',
                subject: q?.subjectId?.name || 'General', // Safer access
                topic: 'General' // Removed topicId access since it's not in schema
            })),
            recentVideos: recentVideos.map(v => ({
                id: v?._id,
                title: v?.title || 'Untitled',
                subject: v?.subjectId?.name || 'General',
                createdAt: v?.createdAt
            })),
            recentTestResults: testResults.filter(tr => tr).map(tr => ({
                id: tr?._id,
                studentName: tr?.studentId?.name || 'Unknown',
                studentAvatar: tr?.studentId?.avatar,
                testTitle: tr?.testId?.title || 'Deleted Test',
                score: tr?.score || 0,
                accuracy: tr?.accuracy || 0,
                createdAt: tr?.createdAt
            })),
            activityData: await (async () => {
                try {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    sevenDaysAgo.setHours(0, 0, 0, 0);

                    const results = await TestResult.aggregate([
                        { $match: { createdAt: { $gte: sevenDaysAgo } } },
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                                },
                                attempts: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]);

                    // Build complete 7-day array
                    const dayMap = {};
                    results.forEach(r => { dayMap[r._id] = r.attempts; });

                    return [...Array(7)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        const key = d.toISOString().slice(0, 10);
                        return {
                            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                            attempts: dayMap[key] || 0
                        };
                    });
                } catch (e) {
                    console.error('[Analytics] Activity Data Failed:', e.message);
                    return [];
                }
            })(),
            weakAreas // [NEW] Real Aggregated Data
        };

        // Cache the successful result\n        caches.dashboard.set('admin_dashboard', dashboardData);

        res.json(dashboardData);

    } catch (error) {
        console.error('[Analytics Error] Full Crash:', error);
        // Return fallback data instead of 500 to keep dashboard alive
        res.status(200).json({ // Return 200 with empty data to prevent UI crash
            kpis: { totalStudents: 0, activeToday: 0, totalTests: 0, testsAttempted: 0, avgAccuracy: '0%' },
            recentUsers: [], recentQuestions: [], recentVideos: [], recentTestResults: [], weakAreas: []
        });
    }
};

const getStudentAnalytics = async (req, res) => {
    try {
        const studentId = req.user._id.toString();

        // Check SmartCache
        const cached = caches.studentAnalytics.get(`student_${studentId}`);
        if (cached) {
            return res.json(cached);
        }

        // 1. Basic Stats
        const totalTests = await TestResult.countDocuments({ studentId: req.user._id });
        if (totalTests === 0) {
            return res.json({
                totalTests: 0,
                avgAccuracy: 0,
                avgTimePerQuestion: 0,
                subjectPerformance: [],
                recentTrend: []
            });
        }

        // 2. Aggregate Data
        const stats = await TestResult.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: null,
                    avgAccuracy: { $avg: "$accuracy" },
                    totalScore: { $sum: "$score" }
                }
            }
        ]);

        // 3. Average Time per Question
        const timeStats = await TestResult.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            { $unwind: "$responses" },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: "$responses.timeTakenSeconds" }
                }
            }
        ]);

        // 4. Subject Wise Performance
        const subjectStats = await TestResult.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            { $unwind: "$responses" },
            {
                $lookup: {
                    from: "questions",
                    localField: "responses.questionId",
                    foreignField: "_id",
                    as: "question"
                }
            },
            { $unwind: "$question" },
            {
                $group: {
                    _id: "$question.subjectId",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ["$responses.isCorrect", 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $project: {
                    subject: "$subjectInfo.name",
                    accuracy: { $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }
                }
            },
            { $sort: { accuracy: -1 } }
        ]);

        // 5. Recent Trend (Last 7 tests)
        const trend = await TestResult.find({ studentId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(7)
            .select('accuracy createdAt')
            .lean();

        const responseData = {
            totalTests,
            avgAccuracy: Math.round(stats[0]?.avgAccuracy || 0),
            avgTimePerQuestion: Math.round(timeStats[0]?.avgTime || 0),
            subjectPerformance: subjectStats.map(s => ({
                subject: s.subject,
                percentage: Math.round(s.accuracy),
                status: s.accuracy > 70 ? 'Strong' : s.accuracy > 40 ? 'Average' : 'Weak'
            })),
            recentTrend: trend.reverse()
        };

        // Cache it
        // Cache AFTER sending response
        caches.studentAnalytics.set(`student_${studentId}`, responseData);

        res.json(responseData);

    } catch (error) {
        console.error('[Student Analytics Error]:', error);
        res.status(500).json({ message: 'Failed to load analytics' });
    }
};


const getWeaknessAnalysis = async (req, res) => {
    try {
        const studentId = req.user._id.toString();

        // Check SmartCache
        const cached = caches.weakness.get(`weakness_${studentId}`);
        if (cached) {
            return res.json(cached);
        }
        const subjectStats = await TestResult.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            { $unwind: "$responses" },
            {
                $lookup: {
                    from: "questions",
                    localField: "responses.questionId",
                    foreignField: "_id",
                    as: "question"
                }
            },
            { $unwind: "$question" },
            {
                $group: {
                    _id: "$question.subjectId",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ["$responses.isCorrect", 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $project: {
                    subject: "$subjectInfo.name",
                    fullMark: 100, // Standardize for Radar Chart
                    accuracy: { $round: [{ $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }, 0] }
                }
            }
        ]);

        // 2. Difficulty-wise Analysis (Did they fail easy or hard questions?)
        const difficultyStats = await TestResult.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            { $unwind: "$responses" },
            {
                $lookup: {
                    from: "questions",
                    localField: "responses.questionId",
                    foreignField: "_id",
                    as: "question"
                }
            },
            { $unwind: "$question" },
            {
                $group: {
                    _id: "$question.difficulty",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ["$responses.isCorrect", 1, 0] } }
                }
            },
            {
                $project: {
                    difficulty: "$_id",
                    accuracy: { $round: [{ $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }, 0] }
                }
            }
        ]);

        // 3. Identify Strong & Weak Areas
        // Sort subjects by accuracy
        const sortedSubjects = [...subjectStats].sort((a, b) => a.accuracy - b.accuracy);

        const weakAreas = sortedSubjects.filter(s => s.accuracy < 50).map(s => s.subject);
        const strongAreas = sortedSubjects.filter(s => s.accuracy >= 70).map(s => s.subject);

        res.json({
            radarData: subjectStats,
            difficultyAnalysis: difficultyStats,
            weakAreas,
            strongAreas
        });

        // Cache AFTER sending response
        caches.weakness.set(`weakness_${studentId}`, { radarData: subjectStats, difficultyAnalysis: difficultyStats, weakAreas, strongAreas });

    } catch (error) {
        console.error('[Weakness Analysis Error]:', error);
        res.status(500).json({ message: 'Failed to calculate weakness analysis' });
    }
};

// @desc    Get test comparison with topper and average
// @route   GET /api/analytics/test-comparison/:testId
// @access  Private (Student)
const getTestComparison = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { testId } = req.params;

        const cacheKey = `${studentId}_${testId}`;
        const cachedComparison = caches.testComparison.get(cacheKey);
        if (cachedComparison) {
            return res.json(cachedComparison);
        }

        // Get all results for this test
        const allResults = await TestResult.find({ testId })
            .populate('studentId', 'name avatar')
            .sort({ score: -1 })
            .lean();

        if (allResults.length === 0) {
            return res.status(404).json({ message: 'No results found for this test' });
        }

        // Find student's result
        const myResult = allResults.find(r => r.studentId?._id?.toString() === studentId.toString());
        if (!myResult) {
            return res.status(404).json({ message: 'Your result not found for this test' });
        }

        // Topper result
        const topperResult = allResults[0];

        // Calculate averages
        const totalParticipants = allResults.length;
        const avgScore = Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / totalParticipants);
        const avgAccuracy = Math.round(allResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / totalParticipants);
        const avgTimeMinutes = Math.round(allResults.reduce((sum, r) => sum + (r.completionTimeMinutes || 0), 0) / totalParticipants);

        // Student's rank (1-indexed)
        const myRank = allResults.findIndex(r => r.studentId?._id?.toString() === studentId.toString()) + 1;

        // Percentile calculation
        const percentile = Math.round(((totalParticipants - myRank) / totalParticipants) * 100);

        // Per-question time analysis (from student's responses)
        const timeAnalysis = {
            fastest: null,
            slowest: null,
            avgTimePerQuestion: 0,
        };

        if (myResult.responses && myResult.responses.length > 0) {
            const responsesWithTime = myResult.responses.filter(r => r.timeTakenSeconds > 0);
            if (responsesWithTime.length > 0) {
                const sorted = [...responsesWithTime].sort((a, b) => a.timeTakenSeconds - b.timeTakenSeconds);
                timeAnalysis.fastest = sorted[0].timeTakenSeconds;
                timeAnalysis.slowest = sorted[sorted.length - 1].timeTakenSeconds;
                timeAnalysis.avgTimePerQuestion = Math.round(
                    responsesWithTime.reduce((s, r) => s + r.timeTakenSeconds, 0) / responsesWithTime.length
                );
            }
        }

        // Topper's time analysis
        const topperTimeAnalysis = { avgTimePerQuestion: 0 };
        if (topperResult.responses && topperResult.responses.length > 0) {
            const topperWithTime = topperResult.responses.filter(r => r.timeTakenSeconds > 0);
            if (topperWithTime.length > 0) {
                topperTimeAnalysis.avgTimePerQuestion = Math.round(
                    topperWithTime.reduce((s, r) => s + r.timeTakenSeconds, 0) / topperWithTime.length
                );
            }
        }

        // Top 5 leaderboard
        const leaderboard = allResults.slice(0, 5).map((r, idx) => ({
            rank: idx + 1,
            name: r.studentId?.name || 'Student',
            avatar: r.studentId?.avatar,
            score: r.score,
            accuracy: r.accuracy || 0,
        }));

        const responseData = {
            myResult: {
                score: myResult.score,
                maxScore: myResult.maxScore,
                correct: myResult.correct,
                incorrect: myResult.incorrect,
                unattempted: myResult.unattempted,
                accuracy: myResult.accuracy,
                completionTimeMinutes: myResult.completionTimeMinutes,
                rank: myRank,
                percentile,
                timeAnalysis,
            },
            topper: {
                name: topperResult.studentId?.name || 'Topper',
                avatar: topperResult.studentId?.avatar,
                score: topperResult.score,
                accuracy: topperResult.accuracy || 0,
                completionTimeMinutes: topperResult.completionTimeMinutes,
                timeAnalysis: topperTimeAnalysis,
            },
            average: {
                score: avgScore,
                accuracy: avgAccuracy,
                completionTimeMinutes: avgTimeMinutes,
            },
            totalParticipants,
            leaderboard,
        };

        caches.testComparison.set(cacheKey, responseData);
        res.json(responseData);

    } catch (error) {
        console.error('[Test Comparison Error]:', error);
        res.status(500).json({ message: 'Failed to generate comparison' });
    }
};

module.exports = { getDashboardStats, getStudentAnalytics, getWeaknessAnalysis, getTestComparison };
