const fs = require('fs');
const path = require('path');

console.log('🔍 系统诊断开始...\n');

const checks = [
  {
    name: '路由文件',
    path: 'src/router/modules/sensorManage.ts',
    required: true
  },
  {
    name: '传感器列表页面',
    path: 'src/views/SensorManage/SensorListPage/index.vue',
    required: true
  },
  {
    name: '传感器类型页面',
    path: 'src/views/SensorManage/SensorTypePage/index.vue',
    required: true
  },
  {
    name: 'SVID数据查看器',
    path: 'src/views/SensorManage/SensorListPage/components/SvidDataViewer.vue',
    required: true
  },
  {
    name: 'SVID配置组件',
    path: 'src/views/SensorManage/SensorListPage/components/SvidConfig.vue',
    required: true
  },
  {
    name: 'Hook文件',
    path: 'src/views/SensorManage/SensorListPage/utils/hook.tsx',
    required: true
  },
  {
    name: '国际化-中文',
    path: 'locales/zh-CN.yaml',
    required: true
  },
  {
    name: '国际化-英文',
    path: 'locales/en.yaml',
    required: true
  }
];

let hasError = false;

checks.forEach(check => {
  const filePath = path.join(__dirname, '..', check.path);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${check.name}: 存在`);
    
    // 检查文件大小
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.log(`   ⚠️  警告: 文件为空`);
      hasError = true;
    }
  } else {
    if (check.required) {
      console.log(`❌ ${check.name}: 不存在 (${check.path})`);
      hasError = true;
    } else {
      console.log(`⚠️  ${check.name}: 不存在 (可选)`);
    }
  }
});

console.log('\n📊 检查完成\n');

if (hasError) {
  console.log('❌ 发现问题，请修复后重试');
  process.exit(1);
} else {
  console.log('✅ 所有文件检查通过');
}
