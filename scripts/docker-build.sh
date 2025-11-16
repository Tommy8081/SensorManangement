#!/bin/bash

# Docker 构建脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Pure Admin Docker 构建脚本 ===${NC}\n"

# 读取版本号
VERSION=${1:-latest}
IMAGE_NAME="pure-admin-frontend"

echo -e "${YELLOW}构建版本:${NC} $VERSION"
echo -e "${YELLOW}镜像名称:${NC} $IMAGE_NAME:$VERSION\n"

# 1. 清理旧镜像（可选）
echo -e "${GREEN}步骤 1: 清理旧构建...${NC}"
docker builder prune -f

# 2. 构建生产镜像
echo -e "\n${GREEN}步骤 2: 构建生产镜像...${NC}"
docker build \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VERSION=$VERSION \
  -t $IMAGE_NAME:$VERSION \
  -t $IMAGE_NAME:latest \
  .

# 3. 查看镜像信息
echo -e "\n${GREEN}步骤 3: 镜像构建完成${NC}"
docker images | grep $IMAGE_NAME

# 4. 运行测试（可选）
echo -e "\n${GREEN}步骤 4: 启动测试容器...${NC}"
docker run -d \
  --name ${IMAGE_NAME}-test \
  -p 8080:80 \
  $IMAGE_NAME:$VERSION

echo -e "\n${GREEN}等待容器启动...${NC}"
sleep 3

# 检查容器健康状态
if docker ps | grep ${IMAGE_NAME}-test > /dev/null; then
  echo -e "${GREEN}✓ 容器启动成功${NC}"
  echo -e "${YELLOW}访问地址: http://localhost:8080${NC}"
  
  # 询问是否保留测试容器
  read -p "是否保留测试容器? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    docker stop ${IMAGE_NAME}-test
    docker rm ${IMAGE_NAME}-test
    echo -e "${GREEN}测试容器已删除${NC}"
  fi
else
  echo -e "${RED}✗ 容器启动失败${NC}"
  docker logs ${IMAGE_NAME}-test
  docker rm -f ${IMAGE_NAME}-test
  exit 1
fi

echo -e "\n${GREEN}=== 构建完成 ===${NC}"
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 推送镜像: docker push $IMAGE_NAME:$VERSION"
echo -e "  2. 运行容器: docker run -d -p 3000:80 $IMAGE_NAME:$VERSION"
echo -e "  3. 使用 compose: docker compose up -d"
