/**
 * withdrawal-request controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::withdrawal-request.withdrawal-request', ({ strapi }) => ({
    async create(ctx) {
        // Override create to enforce logic if needed, or rely on custom route 'withdraw'
        // For now, let's keep the standard create for Admin use, and build a custom action for users
        return super.create(ctx);
    },

    async withdraw(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized("You must be logged in");
        }

        const { amount, method, details } = ctx.request.body;

        if (!amount || amount <= 0) {
            return ctx.badRequest("Invalid amount");
        }

        if (!method || !details) {
            return ctx.badRequest("Method and Details are required");
        }

        try {
            // 1. Calculate Available Balance
            // Sum of completed sales (netAmount)
            const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
                filters: {
                    seller: user.id,
                    status: 'completed'
                }
            });

            // Handle TS uncertainity for findMany result
            const completedSales = Array.isArray(transactions) ? transactions : [];

            const totalEarned = completedSales.reduce((sum: number, tx: any) => sum + Number(tx.netAmount || 0), 0);

            // Sum of withdrawal requests (pending or approved)
            const withdrawals = await strapi.entityService.findMany('api::withdrawal-request.withdrawal-request', {
                filters: {
                    user: user.id,
                    status: { $in: ['pending', 'approved'] }
                }
            });

            const withdrawalList = Array.isArray(withdrawals) ? withdrawals : [];
            const totalWithdrawn = withdrawalList.reduce((sum: number, req: any) => sum + Number(req.amount || 0), 0);

            const availableBalance = totalEarned - totalWithdrawn;

            if (Number(amount) > availableBalance) {
                return ctx.badRequest("Insufficient funds", { available: availableBalance, requested: amount });
            }

            // 2. Create Withdrawal Request
            const newRequest = await strapi.entityService.create('api::withdrawal-request.withdrawal-request', {
                data: {
                    amount,
                    method,
                    details,
                    status: 'pending',
                    user: user.id,
                    publishedAt: new Date()
                }
            });

            return {
                data: newRequest,
                message: "Withdrawal request submitted successfully",
                newBalance: availableBalance - Number(amount)
            };

        } catch (err) {
            console.error("Withdrawal Error:", err);
            return ctx.internalServerError("Failed to process withdrawal");
        }
    },

    async getMyWithdrawals(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const requests = await strapi.entityService.findMany('api::withdrawal-request.withdrawal-request', {
            filters: { user: user.id },
            sort: { createdAt: 'desc' }
        });

        return { data: requests };
    }
}));
