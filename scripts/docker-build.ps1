# Docker 构建脚本 (PowerShell)

param(
  [string]$Version = "latest"
)

$ImageName = "pure-admin-frontend"

Write-Host "=== Pure Admin Docker 构建脚本 ===" -ForegroundColor Green
Write-Host ""
Write-Host "构建版本: $Version" -ForegroundColor Yellow
Write-Host "镜像名称: ${ImageName}:$Version" -ForegroundColor Yellow
Write-Host ""

# 1. 清理旧构建
Write-Host "步骤 1: 清理旧构建..." -ForegroundColor Green
docker builder prune -f

# 2. 构建镜像
Write-Host ""
Write-Host "步骤 2: 构建生产镜像..." -ForegroundColor Green
docker build `
  --build-arg BUILD_DATE=$(Get-Date -UFormat "%Y-%m-%dT%H:%M:%SZ") `
  --build-arg VERSION=$Version `
  -t ${ImageName}:$Version `
  -t ${ImageName}:latest `
  .

# 3. 查看镜像
Write-Host ""
Write-Host "步骤 3: 镜像构建完成" -ForegroundColor Green
docker images | Select-String $ImageName

# 4. 测试运行
Write-Host ""
Write-Host "步骤 4: 启动测试容器..." -ForegroundColor Green
docker run -d `
  --name "${ImageName}-test" `
  -p 8080:80 `
  ${ImageName}:$Version

Start-Sleep -Seconds 3

# 检查容器状态
$container = docker ps | Select-String "${ImageName}-test"
if ($container) {
  Write-Host "✓ 容器启动成功" -ForegroundColor Green
  Write-Host "访问地址: http://localhost:8080" -ForegroundColor Yellow
    
  $reply = Read-Host "是否保留测试容器? (y/n)"
  if ($reply -ne "y") {
    docker stop "${ImageName}-test"
    docker rm "${ImageName}-test"
    Write-Host "测试容器已删除" -ForegroundColor Green
  }
}
else {
  Write-Host "✗ 容器启动失败" -ForegroundColor Red
  docker logs "${ImageName}-test"
  docker rm -f "${ImageName}-test"
  exit 1
}

Write-Host ""
Write-Host "=== 构建完成 ===" -ForegroundColor Green
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 推送镜像: docker push ${ImageName}:$Version"
Write-Host "  2. 运行容器: docker run -d -p 3000:80 ${ImageName}:$Version"
Write-Host "  3. 使用 compose: docker compose up -d"
