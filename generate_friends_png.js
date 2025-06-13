const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const friends = require('./friends.json');

const cardWidth = 600;
const cardHeight = 180;
const avatarSize = 120;
const gap = 40;
const cardsPerRow = 2;

const totalWidth = cardWidth * cardsPerRow + gap * (cardsPerRow - 1);
const totalHeight = Math.ceil(friends.length / cardsPerRow) * (cardHeight + gap) - gap;

const canvas = createCanvas(totalWidth, totalHeight);
const ctx = canvas.getContext('2d');

// 现代感科技风背景
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
  grad.addColorStop(0, '#ffe259'); // 黄
  grad.addColorStop(1, '#38a3d1'); // 蓝
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // 叠加科技感线条
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#fff';
  for (let x = 0; x < totalWidth; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, totalHeight);
    ctx.stroke();
  }
  for (let y = 0; y < totalHeight; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(totalWidth, y);
    ctx.stroke();
  }
  ctx.restore();
}

async function drawCard(friend, index) {
  const row = Math.floor(index / cardsPerRow);
  const col = index % cardsPerRow;
  const x = col * (cardWidth + gap);
  const y = row * (cardHeight + gap);

  // 卡片底色
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 24, y);
  ctx.lineTo(x + cardWidth - 24, y);
  ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + 24);
  ctx.lineTo(x + cardWidth, y + cardHeight - 24);
  ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - 24, y + cardHeight);
  ctx.lineTo(x + 24, y + cardHeight);
  ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - 24);
  ctx.lineTo(x, y + 24);
  ctx.quadraticCurveTo(x, y, x + 24, y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(20, 30, 60, 0.92)';
  ctx.shadowColor = '#ffe259';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.restore();

  // 头像
  const avatarPath = path.join(__dirname, 'Friend_avatar', `${friend.username}.png`);
  let avatarImg;
  if (fs.existsSync(avatarPath)) {
    avatarImg = await loadImage(avatarPath);
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + 80, y + cardHeight / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (avatarImg) {
    ctx.drawImage(avatarImg, x + 20, y + cardHeight / 2 - avatarSize / 2, avatarSize, avatarSize);
  } else {
    ctx.fillStyle = '#ffe259';
    ctx.fillRect(x + 20, y + cardHeight / 2 - avatarSize / 2, avatarSize, avatarSize);
  }
  ctx.restore();

  // 名字
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ffe259';
  ctx.shadowColor = '#38a3d1';
  ctx.shadowBlur = 8;
  ctx.fillText(friend.name, x + 170, y + 70);
  ctx.shadowBlur = 0;

  // 关系标签
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#38a3d1';
  ctx.fillText(friend.relationship, x + cardWidth - 120, y + 50);

  // 简介
  ctx.font = '18px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(friend.bio, x + 170, y + 110);
}

async function main() {
  drawBackground();
  for (let i = 0; i < friends.length; i++) {
    await drawCard(friends[i], i);
  }
  const out = fs.createWriteStream('friends_layout.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => {
    console.log('PNG 好友卡片已生成: friends_layout.png');
  });
}

main(); 