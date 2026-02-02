const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Test = require('../models/Test');

// @desc    Get Student Rank (AIR) & Stats
// @route   GET /api/ranks/my-rank
// @access  Private
const getMyRank = async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1. Calculate Average Score of the current student
        const myResults = await TestResult.find({ studentId });

        if (myResults.length === 0) {
            return res.status(200).json({
                rank: 'N/A',
                averageScore: 0,
                testsTaken: 0,
                percentile: 0,
                message: "No tests taken yet"
            });
        }

        const totalScore = myResults.reduce((acc, curr) => acc + curr.score, 0);
        const myAverageScore = totalScore / myResults.length;

        // 2. Calculate Average Scores of ALL students
        // Aggregate to get average score per student
        const allStudentsStats = await TestResult.aggregate([
            {
                $group: {
                    _id: "$studentId",
                    avgScore: { $avg: "$score" },
                    testsCount: { $sum: 1 }
                }
            },
            {
                $sort: { avgScore: -1 } // Sort by highest average score
            }
        ]);

        // 3. Find Rank
        // Rank is the index + 1 where the student's ID matches
        const myStatsIndex = allStudentsStats.findIndex(s => s._id.toString() === studentId.toString());

        const myRank = myStatsIndex + 1; // 1-based rank
        const totalStudents = allStudentsStats.length;

        // Calculate Percentile: (Number of people behind you / Total people) * 100
        // Or strictly: ((Total - Rank) / Total) * 100
        const percentile = ((totalStudents - myRank) / totalStudents) * 100;

        res.status(200).json({
            rank: myRank,
            totalStudents: totalStudents,
            averageScore: myAverageScore.toFixed(2),
            testsTaken: myResults.length,
            percentile: percentile.toFixed(2),
            leaderboardToken: allStudentsStats.slice(0, 10) // Send top 10 for "nearby" or general leaderboard if needed
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error calculating rank' });
    }
};

// @desc    Get Global Leaderboard
// @route   GET /api/ranks/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        // Top 50 Students by Average Score
        const leaderboard = await TestResult.aggregate([
            {
                $group: {
                    _id: "$studentId",
                    avgScore: { $avg: "$score" },
                    testsCount: { $sum: 1 },
                    totalScore: { $sum: "$score" }
                }
            },
            {
                $sort: { avgScore: -1 }
            },
            {
                $limit: 50
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentDetails"
                }
            },
            {
                $unwind: "$studentDetails"
            },
            {
                $project: {
                    _id: 1,
                    avgScore: 1,
                    testsCount: 1,
                    totalScore: 1,
                    name: "$studentDetails.name",
                    avatar: "$studentDetails.avatar",
                }
            }
        ]);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching leaderboard' });
    }
};

module.exports = { getMyRank, getLeaderboard };
