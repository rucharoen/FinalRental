import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const iconPath = './assets/images/icon.png';
const tempPath = './assets/images/icon_fixed.png';

async function fixIcon() {
    try {
        console.log('--- Processing Icon (Relative Path) ---');
        
        if (!fs.existsSync(iconPath)) {
            console.error('File not found:', iconPath);
            return;
        }

        await sharp(iconPath)
            .trim() 
            .resize(1024, 1024, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toFile(tempPath);

        fs.unlinkSync(iconPath);
        fs.renameSync(tempPath, iconPath);
        
        console.log('✅ Success: Icon fixed.');
    } catch (err) {
        console.error('❌ Error fixing icon:', err);
    }
}

fixIcon();
