const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressAvatar(username) {
  const filePath = path.join(__dirname, 'Friend_avatar', `${username}.png`);
  const tempPath = path.join(__dirname, 'Friend_avatar', `${username}.tmp.png`);
  if (fs.existsSync(filePath)) {
    await sharp(filePath)
      .resize(64, 64) // 缩放到64x64像素
      .png({ quality: 70, compressionLevel: 9 }) // 压缩
      .toFile(tempPath);
    fs.renameSync(tempPath, filePath);
    console.log(`Compressed avatar for ${username}`);
  }
}

async function compressAllAvatars() {
  const avatarDir = path.join(__dirname, 'Friend_avatar');
  const files = fs.readdirSync(avatarDir);
  for (const file of files) {
    if (file.endsWith('.png')) {
      await compressAvatar(file.replace('.png', ''));
    }
  }
}

compressAllAvatars(); 