<h1>vue-pure-admin精简版（国际化版本）</h1>

[![license](https://img.shields.io/github/license/pure-admin/vue-pure-admin.svg)](LICENSE)

**中文** | [English](./README.en-US.md)

## 介绍

精简版是基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 提炼出的架子，包含主体功能，更适合实际项目开发，打包后的大小在全局引入 [element-plus](https://element-plus.org) 的情况下仍然低于 `2.3MB`，并且会永久同步完整版的代码。开启 `brotli` 压缩和 `cdn` 替换本地库模式后，打包大小低于 `350kb`

## 版本选择

当前是国际化版本，如果您需要非国际化版本 [请点击](https://github.com/pure-admin/pure-admin-thin)

## 配套视频

[点我查看 UI 设计](https://www.bilibili.com/video/BV17g411T7rq)  
[点我查看快速开发教程](https://www.bilibili.com/video/BV1kg411v7QT)

## 配套保姆级文档

[点我查看 vue-pure-admin 文档](https://pure-admin.cn/)  
[点我查看 @pureadmin/utils 文档](https://pure-admin-utils.netlify.app)

## 高级服务

[点我查看详情](https://pure-admin.cn/pages/service/)

## 预览

[查看预览](https://pure-admin-thin.netlify.app/#/login)

## 维护者

[xiaoxian521](https://github.com/xiaoxian521)

## ⚠️ 注意

精简版不接受任何 `issues` 和 `pr`，如果有问题请到完整版 [issues](https://github.com/pure-admin/vue-pure-admin/issues/new/choose) 去提，谢谢！

## 📋 版本要求

| 工具 | 版本要求 | 推荐版本 |
|------|---------|---------|
| **Node.js** | >= 18.0.0 | 18.x LTS ✅ |
| **pnpm** | >= 8.0.0 | 8.15.x |
| **npm** | >= 9.0.0 | (仅用于安装 pnpm) |

> ⚠️ **重要**: 本项目使用 **pnpm** 作为包管理器，请不要使用 npm 或 yarn

## 🚀 快速开始

### 1. 检查版本

```bash
# 检查 Node.js 版本
node --version
# 应该显示: v18.x.x 或更高

# 检查 pnpm 版本
pnpm --version
# 应该显示: 8.x.x 或更高
```

### 2. 安装 Node.js 18（如果需要）

**Windows:**
```powershell
# 下载安装包
# https://nodejs.org/en/download/

# 或使用 nvm-windows
nvm install 18
nvm use 18
```

**macOS:**
```bash
# 使用 Homebrew
brew install node@18

# 或使用 nvm
nvm install 18
nvm use 18
```

**Linux:**
```bash
# 使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 或使用包管理器
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. 安装 pnpm

```bash
# 全局安装 pnpm
npm install -g pnpm

# 或使用 corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

### 4. 版本验证脚本

```bash
# 运行版本检查脚本
node scripts/check-node-version.js
```

### 5. 安装依赖

```bash
pnpm install
```

### 6. 启动开发服务器

```bash
pnpm run dev
```

访问: http://localhost:5173

## 📦 可用命令

```bash
# 开发
pnpm run dev

# 构建
pnpm run build

# 预览构建产物
pnpm run preview

# 类型检查
pnpm run type-check

# 代码格式化
pnpm run format

# 代码检查
pnpm run lint
```

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t pure-admin-frontend .

# 运行容器
docker run -d -p 3000:80 pure-admin-frontend

# 使用 docker-compose
docker compose up -d
```

详见: [Docker 部署文档](./docs/DOCKER_DEPLOYMENT.md)

## ⚙️ 技术栈

- **框架**: Vue 3.3+
- **构建工具**: Vite 5.x
- **语言**: TypeScript 5.x
- **UI**: Element Plus 2.x
- **状态管理**: Pinia 2.x
- **路由**: Vue Router 4.x
- **国际化**: Vue I18n 9.x

## 🔍 兼容性说明

### ✅ 完全支持
- Node.js 18.x (推荐) ⭐
- Node.js 20.x

### ⚠️ 部分支持
- Node.js 16.x (不推荐，可能有警告)

### ❌ 不支持
- Node.js 14.x 及以下

### 为什么选择 Node.js 18?

1. **Vite 5.x 推荐版本**: 最佳性能和兼容性
2. **LTS 长期支持**: 稳定可靠，支持到 2025 年 4 月
3. **性能提升**: 相比 Node 16 提升 10-15%
4. **新特性支持**: 
   - 实验性 Fetch API
   - 改进的 ES Modules 支持
   - 更好的 TypeScript 兼容性

## 📚 文档

- [功能说明文档](./docs/SENSOR_MANAGE_README.md)
- [Docker 部署指南](./docs/DOCKER_DEPLOYMENT.md)
- [Node.js 版本指南](./docs/NODE_VERSION_GUIDE.md)

## 🐛 故障排除

### 问题: Node.js 版本过低

```bash
# 升级到 Node.js 18
nvm install 18
nvm use 18

# 或下载安装包
https://nodejs.org/
```

### 问题: pnpm 命令不存在

```bash
# 安装 pnpm
npm install -g pnpm@latest

# 验证安装
pnpm --version
```

### 问题: 依赖安装失败

```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 问题: 端口被占用

```bash
# 修改端口 (vite.config.ts)
server: {
  port: 5174  // 改为其他端口
}
```
