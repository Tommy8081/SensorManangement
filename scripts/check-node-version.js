#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0]);
  
  log(colors.blue, '\n=== Node.js 版本检查 ===\n');
  
  log(colors.yellow, `当前 Node.js 版本: ${currentVersion}`);
  
  if (majorVersion < 18) {
    log(colors.red, '\n❌ 错误: Node.js 版本过低！');
    log(colors.yellow, '本项目要求 Node.js >= 18.0.0');
    log(colors.yellow, '\n请升级 Node.js:');
    log(colors.yellow, '  - 访问: https://nodejs.org/');
    log(colors.yellow, '  - 或使用 nvm: nvm install 18 && nvm use 18\n');
    process.exit(1);
  }
  
  log(colors.green, '✓ Node.js 版本符合要求\n');
  
  // 检查 pnpm
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    log(colors.yellow, `当前 pnpm 版本: ${pnpmVersion}`);
    
    const pnpmMajor = parseInt(pnpmVersion.split('.')[0]);
    if (pnpmMajor < 8) {
      log(colors.yellow, '\n⚠️  警告: pnpm 版本较低，建议升级到 8.x');
      log(colors.yellow, '  运行: npm install -g pnpm@latest\n');
    } else {
      log(colors.green, '✓ pnpm 版本符合要求\n');
    }
  } catch (error) {
    log(colors.red, '\n❌ 未检测到 pnpm');
    log(colors.yellow, '请安装 pnpm:');
    log(colors.yellow, '  运行: npm install -g pnpm\n');
    process.exit(1);
  }
  
  // 检查项目依赖
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (packageJson.engines) {
      log(colors.blue, '项目引擎要求:');
      if (packageJson.engines.node) {
        log(colors.yellow, `  Node.js: ${packageJson.engines.node}`);
      }
      if (packageJson.engines.pnpm) {
        log(colors.yellow, `  pnpm: ${packageJson.engines.pnpm}`);
      }
      console.log('');
    }
  }
  
  log(colors.green, '✅ 所有版本检查通过！\n');
  log(colors.blue, '您可以安全地运行项目:\n');
  log(colors.yellow, '  pnpm install');
  log(colors.yellow, '  pnpm run dev\n');
}

checkNodeVersion();
