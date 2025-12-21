
export default ({ strapi }) => ({
    async analyze(ctx) {
        try {
            // detailed logging for debugging
            console.log("AI Analyze Request Received");

            if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
                return ctx.badRequest('No image uploaded');
            }

            // Handle both single file and array of files (though we expect one 'image')
            const imageFiles = ctx.request.files.image || ctx.request.files.files;
            const image = Array.isArray(imageFiles) ? imageFiles[0] : imageFiles;

            if (!image) {
                return ctx.badRequest('Image field not found');
            }

            console.log("Processing Image:", image.name, image.type);

            // Support verify different filepath properties (formidable v2 vs v3)
            const filePath = image.filepath || image.path;

            if (!filePath) {
                throw new Error("File path not found in request");
            }

            const result = await strapi.service('api::ai.ai').analyzeImage(filePath, image.type);

            ctx.body = { data: result };
        } catch (err) {
            console.error("Controller Error:", err);
            ctx.body = { error: { message: "AI Analysis Failed" } };
            ctx.status = 500;
        }
    },
});
