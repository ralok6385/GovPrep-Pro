const User = require('../models/User');

// Calculate Level based on XP
// Formula: Level = Floor(Sqrt(XP / 50)) + 1
// Example: 0xp = L1, 50xp = L2, 200xp = L3, 450xp = L4
const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
};

// Check and Update Streak
const updateStreak = async (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

    if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            user.streak += 1;
        } else if (diffDays > 1) {
            // Missed a day (or more)
            user.streak = 1; // Reset to 1 (since they are active today)
        }
        // If diffDays === 0, they already did something today, keep streak same
    } else {
        // First time active
        user.streak = 1;
    }

    user.lastActiveDate = new Date(); // Update to now
    return user;
};

// Award XP to a user
const awardXP = async (userId, amount, reason) => {
    try {
        let user = await User.findById(userId);
        if (!user) return null;

        // 1. Update Streak (if not just a background check)
        user = await updateStreak(user);

        // 2. Add XP
        const oldLevel = user.level || 1;
        user.xp = (user.xp || 0) + amount;

        // 3. Check Level Up
        const newLevel = calculateLevel(user.xp);
        let leveledUp = false;

        if (newLevel > oldLevel) {
            user.level = newLevel;
            leveledUp = true;
            console.log(`[Gamification] User ${user.name} leveled up to ${newLevel}!`);
        }

        await user.save();

        return {
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            leveledUp,
            xpGained: amount,
            message: leveledUp ? `Level Up! You represent Level ${newLevel}!` : `+${amount} XP`
        };

    } catch (error) {
        console.error('[Gamification Error]:', error);
        return null;
    }
};

module.exports = {
    awardXP,
    calculateLevel,
    updateStreak
};
