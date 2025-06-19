const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer');

// 配置
const CONFIG = {
  // 文件路径
  paths: {
    output: path.join(process.cwd(), 'assets', 'friends', 'generated'),
    avatars: path.join(process.cwd(), 'assets', 'friends', 'avatars'),
    friendsJson: path.join(process.cwd(), 'assets', 'friends', 'friends.json')
  },
  // 卡片样式
  card: {
    width: 340,
    height: 160,
    gap: 40,
    margin: 60,
    columns: 2,
    cornerRadius: 10
  },
  // 颜色
  colors: {
    background: {
      start: '#93c5fd',
      end: '#fcd34d'
    },
    card: {
      start: 'rgba(30, 58, 138, 0.95)',
      end: 'rgba(202, 138, 4, 0.95)'
    }
  }
};

// 确保目录存在
function ensureDirectories() {
  Object.values(CONFIG.paths).forEach(dir => {
    const dirPath = path.dirname(dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// 下载头像
async function downloadAvatar(username, retries = 3) {
  const url = `https://api.github.com/users/${username}`;
  const filePath = path.join(CONFIG.paths.avatars, `${username}.png`);
  const githubToken = process.env.GITHUB_TOKEN;

  return new Promise((resolve, reject) => {
    const download = (currentRetries) => {
      const headers = {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      };
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }
      const request = https.get(url, {
        timeout: 10000,
        headers
      }, (response) => {
        if (response.statusCode === 404) {
          console.log(`User ${username} not found, using default avatar`);
          resolve();
          return;
        }
        
        if (response.statusCode !== 200) {
          if (currentRetries > 0) {
            console.log(`Retrying download for ${username}, ${currentRetries - 1} attempts left...`);
            setTimeout(() => download(currentRetries - 1), 1000);
            return;
          }
          reject(new Error(`Failed to download avatar for ${username}`));
          return;
        }

        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const userInfo = JSON.parse(data);
            const avatarUrl = userInfo.avatar_url;
            
            https.get(avatarUrl, {
              timeout: 10000,
              headers: { 'User-Agent': 'Node.js' }
            }, (avatarResponse) => {
              if (avatarResponse.statusCode !== 200) {
                reject(new Error(`Failed to download avatar image for ${username}`));
                return;
              }

              const fileStream = fs.createWriteStream(filePath);
              avatarResponse.pipe(fileStream);

              fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded avatar for ${username}`);
                resolve();
              });

              fileStream.on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
              });
            }).on('error', reject);
          } catch (err) {
            reject(new Error(`Failed to parse GitHub API response for ${username}`));
          }
        });
      });

      request.on('error', (err) => {
        if (currentRetries > 0) {
          console.log(`Retrying download for ${username}, ${currentRetries - 1} attempts left...`);
          setTimeout(() => download(currentRetries - 1), 1000);
        } else {
          reject(err);
        }
      });

      request.on('timeout', () => {
        request.destroy();
        if (currentRetries > 0) {
          console.log(`Request timed out for ${username}, retrying...`);
          setTimeout(() => download(currentRetries - 1), 1000);
        } else {
          reject(new Error(`Timeout downloading avatar for ${username}`));
        }
      });
    };

    download(retries);
  });
}

// 生成SVG内容
function generateSVG(friends) {
  const { width: cardWidth, height: cardHeight, gap, margin, columns } = CONFIG.card;
  const totalWidth = margin * 2 + cardWidth * columns + gap * (columns - 1);
  const totalRows = Math.ceil(friends.length / columns);
  const totalHeight = margin * 2 + cardHeight * totalRows + gap * (totalRows - 1);

  return `
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Gradient with Animation -->
        <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${CONFIG.colors.background.start}">
            <animate
              attributeName="stop-color"
              values="${CONFIG.colors.background.start};${CONFIG.colors.background.start};${CONFIG.colors.background.start}"
              dur="10s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="${CONFIG.colors.background.end}">
            <animate
              attributeName="stop-color"
              values="${CONFIG.colors.background.end};${CONFIG.colors.background.end};${CONFIG.colors.background.end}"
              dur="10s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <!-- Card Gradient -->
        <linearGradient id="cardGradient" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="${CONFIG.colors.card.start}">
            <animate
              attributeName="stop-color"
              values="${CONFIG.colors.card.start};${CONFIG.colors.card.start};${CONFIG.colors.card.start}"
              dur="6s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="${CONFIG.colors.card.end}">
            <animate
              attributeName="stop-color"
              values="${CONFIG.colors.card.end};${CONFIG.colors.card.end};${CONFIG.colors.card.end}"
              dur="6s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <!-- Glass Effect -->
        <filter id="glass">
          <feGaussianBlur stdDeviation="0.5"/>
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 0.95 0
          "/>
        </filter>

        <style>
          .friend-card {
            transition: all 0.3s ease;
          }
          .friend-card:hover {
            transform: translateY(-5px);
          }
          .card-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .name {
            font-size: 24px;
            font-weight: bold;
            fill: white;
          }
          .username {
            font-size: 14px;
            fill: rgba(255, 255, 255, 0.8);
          }
          .bio {
            font-size: 14px;
            fill: rgba(255, 255, 255, 0.9);
          }
          .tag {
            font-size: 13px;
            fill: white;
          }
        </style>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#backgroundGradient)"/>

      <!-- Friend Cards -->
      ${generateFriendCards(friends)}
    </svg>
  `;
}

// 生成好友卡片
function generateFriendCards(friends) {
  const { width: cardWidth, height: cardHeight, gap, margin, columns } = CONFIG.card;
  
  return friends.map((friend, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = margin + col * (cardWidth + gap);
    const y = margin + row * (cardHeight + gap);

    return `
      <g class="friend-card" transform="translate(${x}, ${y})">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="${x},${y}; ${x},${y-3}; ${x},${y}"
          dur="3s"
          repeatCount="indefinite"
        />
        <!-- Card Background -->
        <rect
          width="${cardWidth}"
          height="${cardHeight}"
          rx="${CONFIG.card.cornerRadius}"
          ry="${CONFIG.card.cornerRadius}"
          fill="url(#cardGradient)"
          filter="url(#glass)"
        >
          <animate
            attributeName="opacity"
            values="0.95;1;0.95"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        <!-- Card Content -->
        <text x="20" y="40" class="card-text name">${friend.name}</text>
        <text x="20" y="65" class="card-text username">@${friend.username}</text>
        <text x="20" y="90" class="card-text bio">${friend.bio || ''}</text>
        
        <!-- Relationship Tag -->
        <rect
          x="${cardWidth - 100}"
          y="20"
          width="80"
          height="24"
          rx="12"
          fill="rgba(255, 255, 255, 0.15)"
        />
        <text
          x="${cardWidth - 60}"
          y="36"
          class="card-text tag"
          text-anchor="middle"
        >${friend.relationship}</text>
      </g>
    `;
  }).join('');
}

// 用 puppeteer 截图 SVG 生成 PNG
async function svgToPngWithPuppeteer(svgPath, pngPath, width, height) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    await page.setContent(`<body style=\"margin:0;padding:0;background:#fff\">${svgContent}</body>`);
    await page.waitForSelector('svg');
    await page.screenshot({ path: pngPath, omitBackground: true });
    console.log('Successfully generated PNG with puppeteer');
  } finally {
    await browser.close();
  }
}

// === PNG 生成逻辑集成开始 ===
const PNG_CONFIG = {
  cardWidth: 400,
  cardHeight: 150,
  spacing: 60,
  padding: 80,
  columns: 2,
  avatarSize: 90,
  colors: {
    background: '#0d1117',
    grid: {
      primary: 'rgba(88, 166, 255, 0.05)',
      secondary: 'rgba(241, 196, 15, 0.05)'
    },
    card: {
      border: '#58a6ff',
      background: 'rgba(22, 27, 34, 0.9)',
      glow: 'rgba(88, 166, 255, 0.2)',
      text: '#c9d1d9',
      highlight: '#f1c40f'
    }
  }
};
const pngOutputDir = path.join(process.cwd(), 'assets', 'friends', 'generated');
const pngAvatarsDir = path.join(process.cwd(), 'assets', 'friends', 'avatars');
if (!fs.existsSync(pngOutputDir)) {
  fs.mkdirSync(pngOutputDir, { recursive: true });
}
if (!fs.existsSync(pngAvatarsDir)) {
  fs.mkdirSync(pngAvatarsDir, { recursive: true });
}

// 下载头像（带缓存7天）
async function downloadPngAvatar(username) {
  const avatarPath = path.join(pngAvatarsDir, `${username}.png`);
  if (fs.existsSync(avatarPath)) {
    const stats = fs.statSync(avatarPath);
    const age = Date.now() - stats.mtime.getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) {
      return;
    }
  }
  const url = `https://github.com/${username}.png`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode !== 200) {
        resolve(); // 静默失败
        return;
      }
      const fileStream = fs.createWriteStream(avatarPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(avatarPath, () => {});
        resolve();
      });
    }).on('error', resolve);
  });
}

// 获取头像base64
function getPngAvatarBase64(username) {
  const avatarPath = path.join(pngAvatarsDir, `${username}.png`);
  if (fs.existsSync(avatarPath)) {
    const buffer = fs.readFileSync(avatarPath);
    if (buffer.length > 0) {
      return `data:image/png;base64,${buffer.toString('base64')}`;
    }
  }
  // fallback: 可用 default.png
  const defaultPath = path.join(pngAvatarsDir, 'default.png');
  if (fs.existsSync(defaultPath)) {
    const buffer = fs.readFileSync(defaultPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
  return '';
}

// 计算画布尺寸
function calculatePngDimensions(friendsCount) {
  const rows = Math.ceil(friendsCount / PNG_CONFIG.columns);
  const width = PNG_CONFIG.padding * 2 + PNG_CONFIG.columns * PNG_CONFIG.cardWidth + (PNG_CONFIG.columns - 1) * PNG_CONFIG.spacing;
  const height = PNG_CONFIG.padding * 2 + rows * PNG_CONFIG.cardHeight + (rows - 1) * PNG_CONFIG.spacing;
  return { width, height, rows };
}

// 生成HTML内容
function generatePngHTML(friends) {
  const { width, height } = calculatePngDimensions(friends.length);
  const gridLines = [];
  const gridSpacing = 100;
  for (let x = 0; x < width; x += gridSpacing) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${PNG_CONFIG.colors.grid.primary}" stroke-width="1"/>`);
  }
  for (let y = 0; y < height; y += gridSpacing) {
    gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${PNG_CONFIG.colors.grid.primary}" stroke-width="1"/>`);
  }
  for (let i = 0; i < width + height; i += gridSpacing * 2) {
    gridLines.push(`<line x1="${i}" y1="0" x2="0" y2="${i}" stroke="${PNG_CONFIG.colors.grid.secondary}" stroke-width="1"/>`);
  }
  const cards = friends.map((friend, index) => {
    const col = index % PNG_CONFIG.columns;
    const row = Math.floor(index / PNG_CONFIG.columns);
    const x = PNG_CONFIG.padding + col * (PNG_CONFIG.cardWidth + PNG_CONFIG.spacing);
    const y = PNG_CONFIG.padding + row * (PNG_CONFIG.cardHeight + PNG_CONFIG.spacing);
    const avatarBase64 = getPngAvatarBase64(friend.username);
    const avatarContent = avatarBase64
      ? `<image href="${avatarBase64}" x="30" y="30" width="${PNG_CONFIG.avatarSize}" height="${PNG_CONFIG.avatarSize}" clip-path="url(#avatarClip${index})"/>`
      : '';
    return `
      <defs>
        <clipPath id="avatarClip${index}">
          <circle cx="${30 + PNG_CONFIG.avatarSize/2}" cy="${30 + PNG_CONFIG.avatarSize/2}" r="${PNG_CONFIG.avatarSize/2}"/>
        </clipPath>
      </defs>
      <g class="card" transform="translate(${x},${y})">
        <rect class="card-bg" width="${PNG_CONFIG.cardWidth}" height="${PNG_CONFIG.cardHeight}" rx="10"/>
        <circle class="avatar-glow" cx="${30 + PNG_CONFIG.avatarSize/2}" cy="${30 + PNG_CONFIG.avatarSize/2}" r="${PNG_CONFIG.avatarSize/2 + 5}"/>
        ${avatarContent}
        <text class="name" x="150" y="45">${friend.name}</text>
        <text class="bio" x="150" y="85">${friend.bio}</text>
        <text class="relationship" x="150" y="120">${friend.relationship}</text>
        <line x1="150" y1="60" x2="200" y2="60" class="decoration"/>
        <path class="corner" d="M0 15 L0 0 L15 0"/>
        <path class="corner" d="M${PNG_CONFIG.cardWidth - 15} ${PNG_CONFIG.cardHeight} L${PNG_CONFIG.cardWidth} ${PNG_CONFIG.cardHeight} L${PNG_CONFIG.cardWidth} ${PNG_CONFIG.cardHeight - 15}"/>
      </g>
    `;
  }).join('');
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: ${PNG_CONFIG.colors.background}; }
        .card { filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2)); transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        .card-bg { fill: ${PNG_CONFIG.colors.card.background}; stroke: ${PNG_CONFIG.colors.card.border}; stroke-width: 2; filter: drop-shadow(0 0 20px ${PNG_CONFIG.colors.card.glow}); }
        .avatar-glow { fill: none; stroke: ${PNG_CONFIG.colors.card.highlight}; stroke-width: 1; opacity: 0.5; }
        .name { fill: ${PNG_CONFIG.colors.card.highlight}; font-family: "Segoe UI", Arial; font-size: 24px; font-weight: bold; }
        .bio { fill: ${PNG_CONFIG.colors.card.text}; font-family: "Segoe UI", Arial; font-size: 16px; }
        .relationship { fill: ${PNG_CONFIG.colors.card.border}; font-family: "Segoe UI", Arial; font-size: 14px; font-style: italic; }
        .decoration { stroke: ${PNG_CONFIG.colors.card.highlight}; stroke-width: 2; }
        .corner { stroke: ${PNG_CONFIG.colors.card.highlight}; stroke-width: 2; fill: none; }
      </style>
    </head>
    <body>
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${PNG_CONFIG.colors.background}"/>
        ${gridLines.join('\n        ')}
        ${cards}
      </svg>
    </body>
    </html>
  `;
}

// PNG 主函数
async function generateFriendsPng() {
  // 读取朋友数据
  const friendsPath = path.join(process.cwd(), 'assets', 'friends', 'friends.json');
  const friends = JSON.parse(fs.readFileSync(friendsPath, 'utf8'));
  // 下载所有头像
  await Promise.all(friends.map(friend => downloadPngAvatar(friend.username)));
  const { width, height } = calculatePngDimensions(friends.length);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    const html = generatePngHTML(friends);
    await page.setContent(html);
    await page.waitForSelector('svg');
    await page.screenshot({ path: path.join(pngOutputDir, 'friends-layout.png'), omitBackground: true });
    console.log('Friends layout PNG generated successfully!');
    console.log(`Generated image size: ${width}x${height} pixels`);
  } finally {
    await browser.close();
  }
}
// === PNG 生成逻辑集成结束 ===

// 只保留 PNG 生成主流程
if (require.main === module) {
  generateFriendsPng().catch(console.error);
}

// 主函数
async function main() {
  console.log('开始执行主函数...');
  console.log('当前工作目录:', process.cwd());

  try {
    // 确保目录存在
    ensureDirectories();

    // 读取好友列表
    const friends = JSON.parse(fs.readFileSync(CONFIG.paths.friendsJson, 'utf8'));

    // 下载头像，失败时仅警告不终止流程
    await Promise.all(
      friends.map(friend =>
        downloadAvatar(friend.username).catch(err => {
          console.warn(`Warning: Failed to download avatar for ${friend.username}: ${err.message}`);
        })
      )
    );

    // 生成SVG
    const svg = generateSVG(friends);
    
    // 保存SVG
    const svgPath = path.join(CONFIG.paths.output, 'friends.svg');
    fs.writeFileSync(svgPath, svg);
    console.log('Successfully generated SVG');

    // 计算宽高
    const { width: cardWidth, height: cardHeight, gap, margin, columns } = CONFIG.card;
    const totalWidth = margin * 2 + cardWidth * columns + gap * (columns - 1);
    const totalRows = Math.ceil(friends.length / columns);
    const totalHeight = margin * 2 + cardHeight * totalRows + gap * (totalRows - 1);

    // 用 puppeteer 生成 PNG
    const pngPath = path.join(CONFIG.paths.output, 'friends.png');
    await svgToPngWithPuppeteer(svgPath, pngPath, totalWidth, totalHeight);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// 检查GITHUB_TOKEN
if (!process.env.GITHUB_TOKEN) {
  console.warn('Warning: GITHUB_TOKEN not set, API rate limits may apply');
}

// 运行主程序
main(); 