import sharp from 'sharp';
import fs from 'fs';

const iconPath = './assets/images/icon.png';
const tempPath = './assets/images/icon_trimmed.png';

async function fullSizeIcon() {
    try {
        console.log('--- Trimming Icon Padding to make it Full Size ---');
        
        if (!fs.existsSync(iconPath)) {
            console.error('File not found:', iconPath);
            return;
        }

        // Trim the white space so the logo fills the entire square
        await sharp(iconPath)
            .trim() // Remove white background around the logo
            .resize(1024, 1024, {
                fit: 'contain', // Keep aspect ratio but fill as much as possible
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toFile(tempPath);

        fs.unlinkSync(iconPath);
        fs.renameSync(tempPath, iconPath);
        
        console.log('✅ Success: Icon trimmed and scaled to fill the slot.');
    } catch (err) {
        console.error('❌ Error processing icon:', err);
    }
}

fullSizeIcon();
