### 1. 构建失败

**问题**: `pnpm install` 超时

**解决**:
```bash
# 方式1: 使用国内镜像构建
docker build --build-arg PNPM_REGISTRY=https://registry.npmmirror.com -t pure-admin .

# 方式2: 修改 Dockerfile 中的 pnpm config
RUN pnpm config set registry https://registry.npmmirror.com
```

### 本地开发使用 Docker

```bash
# 使用 pnpm 的开发环境 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5173

# 启动开发服务器
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
```

保存为 `Dockerfile.dev`，然后运行：

```bash
# 构建开发镜像
docker build -f Dockerfile.dev -t pure-admin-dev .

# 运行开发容器
docker run -d \
  --name pure-admin-dev \
  -p 5173:5173 \
  -v $(pwd):/app \
  -v /app/node_modules \
  pure-admin-dev

# 访问: http://localhost:5173
```
