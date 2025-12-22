const sharp = require('sharp');
const fs = require('fs');

module.exports = (plugin) => {
    const uploadService = plugin.services.upload;
    const originalUpload = uploadService.upload;

    plugin.services.upload.upload = async (file) => {
        // Check if this file is flagged for watermarking
        if (file.caption === 'watermark_me') {
            try {
                let buffer = file.buffer;

                // If no buffer (e.g. from temp file), read it
                if (!buffer && file.path) {
                    buffer = fs.readFileSync(file.path);
                }

                if (buffer) {
                    strapi.log.info(`Applying watermark to ${file.name}...`);

                    // Get metadata
                    const metadata = await sharp(buffer).metadata();
                    const width = metadata.width || 1000;

                    // Dynamic size: 20% of width for the box
                    const boxWidth = Math.floor(width * 0.2);
                    const boxHeight = Math.floor(boxWidth * 0.4);
                    const fontSize = Math.floor(boxHeight * 0.5);

                    const svgImage = `
            <svg width="${boxWidth}" height="${boxHeight}">
              <style>
                .text { fill: white; font-size: ${fontSize}px; font-weight: 800; font-family: Arial, sans-serif; }
                .bg { fill: black; opacity: 0.5; }
              </style>
              <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" rx="5" ry="5" class="bg" />
              <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" class="text">Dealz</text>
            </svg>
          `;

                    const watermarkedBuffer = await sharp(buffer)
                        .composite([
                            {
                                input: Buffer.from(svgImage),
                                gravity: 'southeast',
                                blend: 'over',
                                top: Math.floor(metadata.height - boxHeight - 20), // 20px padding from bottom
                                left: Math.floor(width - boxWidth - 20)            // 20px padding from right (though gravity southeast handles this usually, explicit placement is safer if gravity fails or behaves oddly with offsets)
                            }
                        ])
                        .toBuffer();

                    // Update file buffer
                    file.buffer = watermarkedBuffer;
                    file.size = (watermarkedBuffer.length / 1024).toFixed(2); // kb

                    // Clean up caption so it doesn't show "watermark_me" in UI
                    file.caption = "Dealz Ad";
                }
            } catch (err) {
                strapi.log.error('Watermark processing failed:', err);
            }
        }

        // Call original upload (sends to Cloudinary)
        return originalUpload.call(uploadService, file);
    };

    return plugin;
};
