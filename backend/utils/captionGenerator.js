const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const generateCaptions = (videoPath) => {
    return new Promise((resolve, reject) => {
        const outputDir = path.join(__dirname, '../captions');
        const captionFileName = `${Date.now()}.srt`;
        const captionFilePath = path.join(outputDir, captionFileName);

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const command = `whisper "${videoPath}" --output_format srt --output_dir "${outputDir}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            fs.readFile(captionFilePath, 'utf8', (err, data) => {
                if (err) return reject(err);
                resolve({ data, captionFileName });
            });
        });
    });
};

module.exports = generateCaptions;
