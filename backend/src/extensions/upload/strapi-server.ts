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
                    strapi.log.info(`Applying large diagonal watermark to ${file.name}...`);

                    // Get metadata
                    const metadata = await sharp(buffer).metadata();
                    const width = metadata.width || 1000;
                    const height = metadata.height || 1000;

                    // Large watermark calculations
                    // Font size relative to width (e.g. 15% of image width)
                    const fontSize = Math.floor(width * 0.15);

                    // Box size (large enough to hold rotated text)
                    const boxWidth = Math.floor(width * 0.8);
                    const boxHeight = Math.floor(height * 0.8);

                    const svgImage = `
            <svg width="${width}" height="${height}" viewbox="0 0 ${width} ${height}">
              <style>
                .text { 
                    fill: white; 
                    font-size: ${fontSize}px; 
                    font-weight: 900; 
                    font-family: Arial, sans-serif; 
                    opacity: 0.15; /* Very faint */
                    text-shadow: 2px 2px 10px rgba(0,0,0,0.1);
                }
              </style>
              <text 
                x="50%" 
                y="50%" 
                dominant-baseline="middle" 
                text-anchor="middle" 
                class="text"
                transform="rotate(-45, ${width / 2}, ${height / 2})"
              >Dealz</text>
            </svg>
          `;

                    const watermarkedBuffer = await sharp(buffer)
                        .composite([
                            {
                                input: Buffer.from(svgImage),
                                top: 0,
                                left: 0,
                                blend: 'over'
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
