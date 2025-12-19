/**
 * message controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::message.message', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const { data } = ctx.request.body;
        console.log("POST /api/messages payload:", JSON.stringify(data));

        // Ensure sender is the current user
        data.sender = user.id;

        // Robust ID Resolution for product (Strapi 5 Document Service requires documentId)
        if (data.product && !isNaN(Number(data.product))) {
            try {
                const prod = await strapi.entityService.findOne('api::product.product', Number(data.product));
                if (prod && (prod as any).documentId) {
                    console.log(`Resolving numeric product ID ${data.product} to documentId ${(prod as any).documentId}`);
                    data.product = (prod as any).documentId;
                }
            } catch (e) { }
        }

        // Robust ID Resolution for receiver
        if (data.receiver && !isNaN(Number(data.receiver))) {
            try {
                const rec = await strapi.query('plugin::users-permissions.user').findOne({ where: { id: Number(data.receiver) } });
                if (rec && (rec as any).documentId) {
                    console.log(`Resolving numeric receiver ID ${data.receiver} to documentId ${(rec as any).documentId}`);
                    data.receiver = (rec as any).documentId;
                }
            } catch (e) { }
        }

        // 3. Find or Create Conversation
        try {
            // We need Document IDs for robust filtering
            // Note: data.sender/receiver might be ID or DocumentId depending on above logic.
            // Ideally we query by both or standardise.
            // Let's rely on finding by participants.

            // Assume we have valid user documentIds if possible, or fall back to ID.
            // Strapi 5 often needs DocumentId for relation filters in Document Service.
            // Sender is `user.documentId` (from ctx.state.user).
            // Receiver: data.receiver.

            const senderDocId = user.documentId;
            let receiverDocId = data.receiver;
            let productDocId = data.product;

            // If we only have IDs, we might struggle to filter cleanly if mixed. 
            // The existing code standardizes to DocumentId if it finds it.

            if (senderDocId && receiverDocId && productDocId) {
                const conversations = await strapi.documents('api::conversation.conversation').findMany({
                    filters: {
                        $and: [
                            { participants: { documentId: { $eq: senderDocId } } },
                            { participants: { documentId: { $eq: receiverDocId } } },
                            { product: { documentId: { $eq: productDocId } } }
                        ]
                    },
                    status: 'published'
                });

                let conversationId;
                if (conversations.length > 0) {
                    conversationId = conversations[0].documentId;
                    console.log(`Found existing conversation: ${conversationId}`);
                } else {
                    console.log("Creating new conversation...");
                    const newConv = await strapi.documents('api::conversation.conversation').create({
                        data: {
                            participants: [senderDocId, receiverDocId],
                            product: productDocId,
                            publishedAt: new Date()
                        },
                        status: 'published'
                    });
                    conversationId = newConv.documentId;
                }

                // Link message to conversation
                data.conversation = conversationId;
            }
        } catch (convErr) {
            console.error("Error managing conversation:", convErr);
            // Proceed without conversation to avoid blocking message
        }

        try {
            const entry = await strapi.documents('api::message.message').create({
                data,
                status: 'published'
            });
            console.log("Message created successfully ID:", entry.id);
            return { data: entry };
        } catch (err) {
            console.error("Message create error:", err);
            return ctx.badRequest(err.message, { details: err.details });
        }
    },

    async find(ctx) {
        const { filters } = ctx.query;
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        console.log("GET /api/messages Filters:", JSON.stringify(filters));

        // If filtering by sender/receiver ID, bypass standard validator
        if (filters && typeof filters === 'object' && ((filters as any).sender || (filters as any).receiver)) {
            console.log("BYPASS: Detected sender/receiver filter for messages");

            try {
                // Construct a manual query
                const results = await strapi.documents('api::message.message').findMany({
                    filters: filters as any,
                    populate: ['sender', 'receiver', 'product'],
                    status: 'published'
                });
                return { data: results, meta: { bypassed: true } };
            } catch (err) {
                console.error("Message manual find error:", err);
            }
        }

        return await super.find(ctx);
    }
}));
