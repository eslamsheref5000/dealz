
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

            // Support verify different filepath properties (formidable v2 vs v3)
            const filePath = image.filepath || image.path;

            // Fix: Check for different mimetype property names (type, mimetype) and fallback
            // This prevents "Unsupported MIME type: " errors if the property is missing
            const mimeType = image.type || image.mimetype || 'image/jpeg';

            console.log("Processing Image:", { name: image.name, path: filePath, mime: mimeType });

            if (!filePath) {
                throw new Error("File path not found in request");
            }

            const result = await strapi.service('api::ai.ai').analyzeImage(filePath, mimeType);

            ctx.body = { data: result };
        } catch (err: any) {
            console.error("Controller Error:", err);
            const status = err.message.includes("not found") ? 404 : 500;
            ctx.status = status;
            ctx.body = {
                error: {
                    message: err.message || "AI Analysis Failed",
                    details: err.stack
                }
            };
        }
    },
});
