const fs = require('fs');
const path = require('path');

// 更新README.md中的动态内容
async function updateReadme() {
  const readmePath = path.join(__dirname, '../../README.md');
  let content = fs.readFileSync(readmePath, 'utf8');

  // 更新统计信息
  content = content.replace(
    /(<!-- GitHub Stats -->[\s\S]*?<!-- End GitHub Stats -->)/,
    `<!-- GitHub Stats -->
<p align="center">
<img align="center" width="400" src="https://github-readme-stats.vercel.app/api?username=SXP-Simon&theme=transparent&show_icons=true&hide_border=true&show=reviews&hide_title=true&hide=contribs" />
<img align="center" width="400" src="https://streak-stats.demolab.com?user=SXP-Simon&theme=transparent&hide_border=true" />
</p>
<!-- End GitHub Stats -->`
  );

  // 更新3D贡献图
  content = content.replace(
    /(<!-- 3D Contribution Graph -->[\s\S]*?<!-- End 3D Contribution Graph -->)/,
    `<!-- 3D Contribution Graph -->
<img src="./profile-3d-contrib/profile-night-rainbow.svg" alt="3D GitHub Stats" width="100%"/>
<!-- End 3D Contribution Graph -->`
  );

  // 更新朋友网络
  content = content.replace(
    /(<p align="center">\s*<!-- Card Style PNG Version -->[\s\S]*?<\/p>)/,
    `<p align="center">\n  <!-- Card Style PNG Version -->\n  <img src="./assets/friends/generated/friends-layout.png" alt="My Friends (Card Style)" width="100%" />\n  <br/>\n  <sub><em>Card-style visualization of my GitHub friends~</em></sub>\n</p>`
  );

  fs.writeFileSync(readmePath, content);
}

updateReadme().catch(console.error); 