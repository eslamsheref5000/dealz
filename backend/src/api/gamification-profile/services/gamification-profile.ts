import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::gamification-profile.gamification-profile', ({ strapi }) => ({
    async addPoints(userId: number, amount: number, type: string, description: string) {
        // 1. Get or Create Profile
        let profile = await strapi.db.query('api::gamification-profile.gamification-profile').findOne({
            where: { user: userId },
            populate: ['user']
        });

        if (!profile) {
            profile = await strapi.documents('api::gamification-profile.gamification-profile').create({
                data: {
                    user: userId,
                    points: 0,
                    level: 1,
                    currentStreak: 0
                },
                status: 'published'
            });
        }

        // 2. Add Points
        const newTotal = (profile.points || 0) + amount;

        // 3. Check Level Up (Simple logic: Level = 1 + floor(points / 1000))
        const newLevel = 1 + Math.floor(newTotal / 1000);
        let levelUpMessage = null;

        if (newLevel > (profile.level || 1)) {
            levelUpMessage = `Level Up! You are now Level ${newLevel}`;
            // Could trigger badge logic here
        }

        // 4. Update Profile
        await strapi.documents('api::gamification-profile.gamification-profile').update({
            documentId: profile.documentId,
            data: {
                points: newTotal,
                level: newLevel
            },
            status: 'published'
        });

        // 5. Create Transaction Record
        await strapi.documents('api::point-transaction.point-transaction').create({
            data: {
                profile: profile.documentId,
                amount,
                type,
                description,
                metadata: { prevLevel: profile.level, newLevel }
            },
            status: 'published'
        });

        // 6. Notify User (Real-time)
        const io = (strapi as any).io;
        if (io) {
            // Find socket for this user (Not implemented fully yet, broadcasting for now or skipping)
            // For now, let's just emit a generic event if we had room IDs
        }

        return { newPoints: newTotal, levelUpMessage };
    }
}));
