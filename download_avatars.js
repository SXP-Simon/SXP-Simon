const fs = require('fs');
const path = require('path');
const https = require('https');

const friends = require('./friends.json');

// 确保 Friend_avatar 目录存在
const avatarDir = path.join(__dirname, 'Friend_avatar');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir);
}

// 下载头像
async function downloadAvatar(username, retries = 3) {
  const url = `https://api.github.com/users/${username}`;
  const filePath = path.join(avatarDir, `${username}.png`);
  const githubToken = process.env.GH_TOKEN;

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
            retries--;
            setTimeout(download, 1000);
            return;
          }
          reject(new Error(`Failed to download avatar for ${username}, status: ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const userInfo = JSON.parse(data);
            const avatarUrl = userInfo.avatar_url;
            
            // 下载头像
            https.get(avatarUrl, {
              timeout: 10000,
              headers: {
                'User-Agent': 'Node.js'
              }
            }, (avatarResponse) => {
              if (avatarResponse.statusCode !== 200) {
                reject(new Error(`Failed to download avatar image for ${username}, status: ${avatarResponse.statusCode}`));
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
            }).on('error', (err) => {
              console.error(`Error downloading avatar image for ${username}:`, err.message);
              reject(err);
            });
          } catch (err) {
            reject(new Error(`Failed to parse GitHub API response for ${username}: ${err.message}`));
          }
        });
      });

      request.on('error', (err) => {
        if (retries > 0) {
          console.log(`Retrying download for ${username}, ${retries} attempts left...`);
          retries--;
          setTimeout(download, 1000);
        } else {
          reject(err);
        }
      });

      request.on('timeout', () => {
        request.destroy();
        if (retries > 0) {
          console.log(`Request timed out for ${username}, retrying...`);
          retries--;
          setTimeout(download, 1000);
        } else {
          reject(new Error(`Timeout downloading avatar for ${username}`));
        }
      });
    };

    download();
  });
}

// 下载所有头像
async function downloadAllAvatars() {
  const uniqueUsers = [...new Set(friends.map(friend => friend.username))];
  
  for (const username of uniqueUsers) {
    try {
      await downloadAvatar(username);
    } catch (error) {
      console.error(`Error downloading avatar for ${username}:`, error.message);
    }
  }
}

// 检查 GITHUB_TOKEN 环境变量
if (!process.env.GITHUB_TOKEN) {
  console.warn('Warning: GITHUB_TOKEN not set, API rate limits may apply');
}

downloadAllAvatars().then(() => {
  console.log('All avatars downloaded successfully!');
}).catch(console.error); 