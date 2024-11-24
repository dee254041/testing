const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Base SVG icon (blue reminder bell)
const baseIcon = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#0f172a"/>
    <path d="M256 64c-70.7 0-128 57.3-128 128v96l-53.3 53.3c-3.1 3.1-4.7 7.2-4.7 11.3V384c0 8.8 7.2 16 16 16h352c8.8 0 16-7.2 16-16v-31.4c0-4.1-1.6-8.2-4.7-11.3L396 288v-96c0-70.7-57.3-128-128-128zm0-64c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm0 512c-35.3 0-64-28.7-64-64h128c0 35.3-28.7 64-64 64z" fill="#0ea5e9"/>
    <circle cx="256" cy="256" r="144" fill="#0ea5e9" fill-opacity="0.2"/>
</svg>
`);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
    // Create icons directory if it doesn't exist
    const iconDir = path.join(__dirname, '../public/icons');
    try {
        await fs.mkdir(iconDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    // Generate icons for each size
    for (const size of sizes) {
        await sharp(baseIcon)
            .resize(size, size)
            .png()
            .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
        console.log(`Generated ${size}x${size} icon`);
    }

    // Generate favicon
    await sharp(baseIcon)
        .resize(32, 32)
        .png()
        .toFile(path.join(__dirname, '../public/favicon.ico'));
    console.log('Generated favicon');
}

generateIcons().catch(console.error); 