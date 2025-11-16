#!/bin/bash

# 快速启动脚本

set -e

ENV=${1:-prod}

if [ "$ENV" = "dev" ]; then
    echo "启动开发环境..."
    docker compose --profile dev up -d frontend-dev
    echo "开发服务器已启动: http://localhost:5173"
else
    echo "启动生产环境..."
    docker compose up -d frontend
    echo "生产服务器已启动: http://localhost:3000"
fi

# 显示日志
docker compose logs -f
