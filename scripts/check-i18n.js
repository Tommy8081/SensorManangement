const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const localesDir = path.join(__dirname, '..', 'locales');
const languages = ['zh-CN', 'en', 'zh-TW', 'ja', 'de'];

console.log('🔍 检查国际化文件...\n');

const locales = {};
languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.yaml`);
  try {
    locales[lang] = yaml.load(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ ${lang}.yaml 加载成功`);
  } catch (error) {
    console.log(`❌ ${lang}.yaml 加载失败:`, error.message);
  }
});

console.log('\n📊 检查 key 完整性...\n');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const allKeys = {};
languages.forEach(lang => {
  allKeys[lang] = new Set(getAllKeys(locales[lang]));
});

const baseKeys = allKeys['zh-CN'];
let hasIssues = false;

languages.forEach(lang => {
  if (lang === 'zh-CN') return;
  
  const missingKeys = [...baseKeys].filter(key => !allKeys[lang].has(key));
  const extraKeys = [...allKeys[lang]].filter(key => !baseKeys.has(key));
  
  if (missingKeys.length > 0) {
    hasIssues = true;
    console.log(`⚠️  ${lang} 缺少 ${missingKeys.length} 个 key:`);
    missingKeys.slice(0, 5).forEach(key => console.log(`   - ${key}`));
    if (missingKeys.length > 5) {
      console.log(`   ... 还有 ${missingKeys.length - 5} 个`);
    }
    console.log('');
  }
  
  if (extraKeys.length > 0) {
    console.log(`ℹ️  ${lang} 多出 ${extraKeys.length} 个 key:`);
    extraKeys.slice(0, 3).forEach(key => console.log(`   - ${key}`));
    if (extraKeys.length > 3) {
      console.log(`   ... 还有 ${extraKeys.length - 3} 个`);
    }
    console.log('');
  }
  
  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log(`✅ ${lang} 与基准语言一致\n`);
  }
});

if (!hasIssues) {
  console.log('🎉 所有语言文件检查通过！');
} else {
  console.log('⚠️  发现问题，请修复后重试');
  process.exit(1);
}
