const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 下载头像
async function downloadAvatar(username) {
  const url = `https://github.com/${username}.png`;
  const filePath = path.join(__dirname, 'Friend_avatar', `${username}.png`);

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Node.js'
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download avatar for ${username}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filePath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// 创建一个通用函数，用于读取本地头像图片并转换为base64
async function getAvatarImageUrl(username) {
  // 直接返回GitHub raw图片链接
  return `https://github.com/SXP-Simon/SXP-Simon/blob/main/Friend_avatar/${username}.png?raw=true`;
}

// 生成单个好友卡片
async function generateFriendCard(friend, index, cardWidth, cardHeight, cardGap, cardsPerRow) {
  const row = Math.floor(index / cardsPerRow);
  const col = index % cardsPerRow;
  const x = col * (cardWidth + cardGap);
  const y = row * (cardHeight + cardGap);
  const avatarUrl = await getAvatarImageUrl(friend.username);

  return `
    <g transform="translate(${x}, ${y})">
      <!-- Tech Background Pattern -->
      <rect
        x="0" y="0" width="${cardWidth}" height="${cardHeight}"
        rx="24" ry="24"
        fill="url(#techPattern)"
        filter="url(#glow)"
      >
        <animate
          attributeName="fill-opacity"
          values="0.95;1;0.95"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>
      
      <!-- Decorative Tech Lines -->
      <path
        d="M24,0 L${cardWidth-24},0 M0,24 L0,${cardHeight-24} M${cardWidth},24 L${cardWidth},${cardHeight-24} M24,${cardHeight} L${cardWidth-24},${cardHeight}"
        stroke="#4a90e2"
        stroke-width="0.5"
        stroke-dasharray="4 4"
        opacity="0.2"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;8"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      
      <!-- Avatar Border Animation -->
      <circle
        cx="60" cy="80" r="42"
        fill="none"
        stroke="url(#borderGradient)"
        stroke-width="4"
        filter="url(#glow)"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 264;264 0;0 264"
          dur="8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-width"
          values="4;5;4"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      
      <!-- Avatar -->
      <clipPath id="avatarClip${index}">
        <circle cx="60" cy="80" r="40"/>
      </clipPath>
      <image
        href="${avatarUrl}"
        x="20" y="40"
        width="80" height="80"
        clip-path="url(#avatarClip${index})"
      />
      
      <!-- Name with Gradient Animation -->
      <text
        x="120" y="70"
        font-family="'Noto Sans SC', sans-serif"
        font-size="24"
        font-weight="700"
        fill="url(#textGradient)"
        filter="url(#glow)"
      >
        ${friend.name}
        <animate
          attributeName="fill-opacity"
          values="0.8;1;0.8"
          dur="3s"
          repeatCount="indefinite"
        />
      </text>
      
      <!-- Bio -->
      <text
        x="120" y="100"
        font-family="'Noto Sans SC', sans-serif"
        font-size="14"
        fill="#ffffff"
      >${friend.bio}</text>
      
      <!-- Tag with Gradient Animation -->
      <rect
        x="${cardWidth - 100}" y="20"
        width="80" height="28"
        rx="14" ry="14"
        fill="url(#tagGradient)"
        filter="url(#glow)"
      >
        <animate
          attributeName="fill-opacity"
          values="0.9;1;0.9"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      <text
        x="${cardWidth - 60}" y="38"
        font-family="'Noto Sans SC', sans-serif"
        font-size="13"
        fill="white"
        text-anchor="middle"
      >${friend.relationship}</text>
    </g>
  `;
}

// 生成SVG内容
async function generateSVG() {
  try {
    const friendsConfigPath = path.join(__dirname, 'friends.json');
    const friends = JSON.parse(fs.readFileSync(friendsConfigPath, 'utf-8'));
    
    const cardWidth = 340;
    const cardHeight = 160;
    const cardsPerRow = 2;
    const cardGap = 40;
    
    const totalWidth = cardWidth * cardsPerRow + cardGap * (cardsPerRow - 1);
    const totalHeight = Math.ceil(friends.length / cardsPerRow) * (cardHeight + cardGap) - cardGap;

    // 确保 Friend_avatar 目录存在
    const avatarDir = path.join(__dirname, 'Friend_avatar');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir);
    }

    console.log('开始生成好友卡片...');

    // 预先下载所有头像
    for (const friend of friends) {
      await getAvatarImageUrl(friend.username);
    }

    // 生成所有好友卡片
    const friendCardsPromises = friends.map((friend, index) => 
      generateFriendCard(friend, index, cardWidth, cardHeight, cardGap, cardsPerRow)
    );
    
    console.log('正在生成卡片内容...');
    const friendCards = await Promise.all(friendCardsPromises);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- Tech Pattern -->
        <pattern id="techPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#cardGradient)"/>
          <path d="M0 0L50 50M50 0L0 50" stroke="#4a90e2" stroke-width="0.5" opacity="0.1"/>
        </pattern>

        <!-- Card Background Gradient with Tech Theme -->
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a192f">
            <animate
              attributeName="stop-color"
              values="#0a192f;#112240;#0a192f"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="#112240">
            <animate
              attributeName="stop-color"
              values="#112240;#0a192f;#112240"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <!-- Border Gradient -->
        <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4a90e2"/>
          <stop offset="100%" stop-color="#63f5ac"/>
        </linearGradient>

        <!-- Text Gradient -->
        <linearGradient id="textGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#63f5ac"/>
        </linearGradient>

        <!-- Tag Gradient -->
        <linearGradient id="tagGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#4a90e2"/>
          <stop offset="100%" stop-color="#63f5ac"/>
        </linearGradient>

        <!-- Glow Effect -->
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#0a192f"/>
      
      <!-- Friend Cards -->
      ${friendCards.join('\n')}
    </svg>`;

    console.log('正在写入 SVG 文件...');
    const outputPath = path.join(__dirname, 'friends_layout.svg');
    fs.writeFileSync(outputPath, svg, 'utf8');
    console.log('SVG 文件生成成功！');
    
    return svg;
  } catch (error) {
    console.error('生成 SVG 时发生错误:', error);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    console.log('开始执行主函数...');
    console.log('当前工作目录:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // 检查 friends.json 是否存在
    const friendsConfigPath = path.join(__dirname, 'friends.json');
    console.log('检查 friends.json 路径:', friendsConfigPath);
    if (!fs.existsSync(friendsConfigPath)) {
      throw new Error(`friends.json 不存在: ${friendsConfigPath}`);
    }
    
    // 检查 Friend_avatar 目录
    const avatarDir = path.join(__dirname, 'Friend_avatar');
    console.log('检查 Friend_avatar 目录:', avatarDir);
    if (!fs.existsSync(avatarDir)) {
      console.log('创建 Friend_avatar 目录');
      fs.mkdirSync(avatarDir);
    }
    
    await generateSVG();
    
    // 验证 SVG 文件是否生成
    const svgPath = path.join(__dirname, 'friends_layout.svg');
    console.log('检查生成的 SVG 文件:', svgPath);
    if (!fs.existsSync(svgPath)) {
      throw new Error('SVG 文件未生成成功');
    }
    
    console.log('程序执行完成！');
  } catch (error) {
    console.error('程序执行失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 