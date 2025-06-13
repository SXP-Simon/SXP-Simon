# 个人主页资源生成器

这个项目用于自动生成和更新个人主页所需的各种资源，包括好友头像、统计信息等。

## 项目结构

项目使用双分支结构进行管理：

- `main` 分支：存储最终生成的资源文件和展示内容
- `workflows` 分支：包含资源生成脚本和GitHub Actions工作流配置

### 主要文件说明

#### Main 分支
- `github-metrics.svg`: GitHub统计信息图表
- `friends_layout.svg`: 好友布局展示图
- `README.md`: 项目说明文档

#### Workflows 分支
- `.github/workflows/`: GitHub Actions工作流配置
- `download_avatars.js`: 头像下载脚本
- `friends.js`: 好友数据处理脚本
- `friends.json`: 好友配置文件

## 自动化流程

1. 工作流触发条件：
   - 推送到 `workflows` 分支时
   - 每天定时执行（UTC 00:00）

2. 工作流程：
   - 检出代码
   - 安装依赖
   - 运行资源生成脚本
   - 将生成的资源提交到 `main` 分支

## 开发指南

### 本地开发

1. 克隆仓库：
```bash
git clone <repository-url>
cd <repository-name>
```

2. 安装依赖：
```bash
npm install
```

3. 切换到workflows分支进行开发：
```bash
git checkout workflows
```

### 修改配置

1. 在 `workflows` 分支上修改 `friends.json` 配置文件
2. 提交并推送更改
3. GitHub Actions将自动运行并更新main分支的资源

## 注意事项

- 所有的资源生成脚本都应该放在 `workflows` 分支
- 生成的资源文件会自动更新到 `main` 分支
- 请不要直接在 `main` 分支上修改生成的资源文件

## License

MIT License - 详见 [LICENSE](LICENSE) 文件
