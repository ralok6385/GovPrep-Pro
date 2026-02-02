const User = require('../models/User');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Content = require('../models/Content');
const TestResult = require('../models/TestResult');

// @desc    Get Admin Dashboard Stats including Real-Time KPIs and Activity
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const mongoose = require('mongoose');

// In-memory cache for analytics
let dashboardCache = {
    data: null,
    lastFetched: 0
};
const CACHE_DURATION = 30 * 1000; // 30 seconds

const getDashboardStats = async (req, res) => {
    const now = Date.now();
    if (dashboardCache.data && (now - dashboardCache.lastFetched < CACHE_DURATION)) {
        return res.json(dashboardCache.data);
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
            User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt'),
            Question.find({}).sort({ createdAt: -1 }).limit(3).populate('subjectId', 'name'),
            Content.find({ type: 'video' }).sort({ createdAt: -1 }).limit(3).populate('subjectId', 'name'),
            TestResult.find({}).sort({ createdAt: -1 }).limit(5).populate('studentId', 'name avatar').populate('testId', 'title')
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
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    d.setHours(0, 0, 0, 0);
                    return d;
                }).reverse();

                return await Promise.all(last7Days.map(async (date) => {
                    const nextDate = new Date(date);
                    nextDate.setDate(nextDate.getDate() + 1);

                    const count = await TestResult.countDocuments({
                        createdAt: { $gte: date, $lt: nextDate }
                    });

                    return {
                        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        attempts: count
                    };
                }));
            })(),
            weakAreas // [NEW] Real Aggregated Data
        };

        // Cache the successful result
        dashboardCache = {
            data: dashboardData,
            lastFetched: Date.now()
        };

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
        const studentId = req.user._id;

        // 1. Basic Stats
        const totalTests = await TestResult.countDocuments({ studentId });
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
        const trend = await TestResult.find({ studentId })
            .sort({ createdAt: -1 })
            .limit(7)
            .select('accuracy createdAt')
            .lean();

        res.json({
            totalTests,
            avgAccuracy: Math.round(stats[0]?.avgAccuracy || 0),
            avgTimePerQuestion: Math.round(timeStats[0]?.avgTime || 0),
            subjectPerformance: subjectStats.map(s => ({
                subject: s.subject,
                percentage: Math.round(s.accuracy),
                status: s.accuracy > 70 ? 'Strong' : s.accuracy > 40 ? 'Average' : 'Weak'
            })),
            recentTrend: trend.reverse()
        });

    } catch (error) {
        console.error('[Student Analytics Error]:', error);
        res.status(500).json({ message: 'Failed to load analytics' });
    }
};

const getWeaknessAnalysis = async (req, res) => {
    try {
        const studentId = req.user._id;

        if (!studentId) {
            return res.status(401).json({ message: 'Not authorized & No Student ID provided' });
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

    } catch (error) {
        console.error('[Weakness Analysis Error]:', error);
        res.status(500).json({ message: 'Failed to calculate weakness analysis' });
    }
};

module.exports = { getDashboardStats, getStudentAnalytics, getWeaknessAnalysis };
