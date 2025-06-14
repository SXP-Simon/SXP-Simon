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
    /(<!-- Friends Network -->[\s\S]*?<!-- End Friends Network -->)/,
    `<!-- Friends Network -->
<p align="center">
  <img src="./assets/generated/friends-network.svg" alt="Friends Network" width="100%" />
  <br/>
  <sub><em>These wonderful people make my journey more colorful~</em></sub>
</p>
<!-- End Friends Network -->`
  );

  fs.writeFileSync(readmePath, content);
}

updateReadme().catch(console.error); 