const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const inputSvg = path.join(__dirname, 'public', 'unibase_kabaw_logo.svg');
  const size192 = path.join(__dirname, 'public', 'icon-192x192.png');
  const size512 = path.join(__dirname, 'public', 'icon-512x512.png');

  if (!fs.existsSync(inputSvg)) {
    console.error('SVG file not found at', inputSvg);
    return;
  }

  try {
    await sharp(inputSvg)
      .resize(192, 192)
      .png()
      .toFile(size192);
    console.log('Generated icon-192x192.png');

    await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(size512);
    console.log('Generated icon-512x512.png');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
