const fs = require('fs');
const path = require('path');
const https = require('https');

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
    const download = () => {
      const request = https.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Node.js',
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`
        }
      }, (response) => {
        if (response.statusCode === 404) {
          console.log(`User ${username} not found, using default avatar`);
          resolve();
          return;
        }
        
        if (response.statusCode !== 200) {
          if (retries > 0) {
            console.log(`Retrying download for ${username}, ${retries} attempts left...`);
            setTimeout(() => download(), 1000);
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
        if (retries > 0) {
          console.log(`Retrying download for ${username}, ${retries} attempts left...`);
          setTimeout(() => download(), 1000);
        } else {
          reject(err);
        }
      });

      request.on('timeout', () => {
        request.destroy();
        if (retries > 0) {
          console.log(`Request timed out for ${username}, retrying...`);
          setTimeout(() => download(), 1000);
        } else {
          reject(new Error(`Timeout downloading avatar for ${username}`));
        }
      });
    };

    download();
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

// 主函数
async function main() {
  console.log('开始执行主函数...');
  console.log('当前工作目录:', process.cwd());

  try {
    // 确保目录存在
    ensureDirectories();

    // 读取好友数据
    console.log('读取好友数据...');
    const friends = require(CONFIG.paths.friendsJson);

    // 下载头像
    console.log('开始下载头像...');
    const uniqueUsers = [...new Set(friends.map(friend => friend.username))];
    for (const username of uniqueUsers) {
      try {
        await downloadAvatar(username);
      } catch (error) {
        console.error(`Error downloading avatar for ${username}:`, error.message);
      }
    }

    // 生成SVG
    console.log('开始生成SVG...');
    const svgContent = generateSVG(friends);
    
    // 写入SVG文件
    const svgPath = path.join(CONFIG.paths.output, 'friends_layout.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log('SVG文件生成成功！');
    console.log('文件路径:', svgPath);

  } catch (error) {
    console.error('执行过程中发生错误:', error);
    process.exit(1);
  }
}

// 检查GITHUB_TOKEN
if (!process.env.GITHUB_TOKEN) {
  console.warn('Warning: GITHUB_TOKEN not set, API rate limits may apply');
}

// 运行主程序
main(); 