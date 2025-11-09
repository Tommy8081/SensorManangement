import { addCollection } from "@iconify/vue";

// 导入需要的图标集 JSON 数据
import epIcons from "@iconify-json/ep/icons.json";
import riIcons from "@iconify-json/ri/icons.json";
// 如果使用了 Material Symbols，添加这个
// import materialSymbolsIcons from "@iconify-json/material-symbols/icons.json";
// 如果使用了 Carbon，添加这个
// import carbonIcons from "@iconify-json/carbon/icons.json";

/**
 * 设置 Iconify 离线图标
 * 将远程图标集注册到本地，实现离线使用
 */
export function setupIconify() {
  // 注册 Element Plus 图标集
  addCollection(epIcons as any);

  // 注册 Remix Icon 图标集
  addCollection(riIcons as any);

  // 注册 Material Symbols 图标集
  // addCollection(materialSymbolsIcons as any);

  // 注册 Carbon 图标集
  // addCollection(carbonIcons as any);

  // 生产环境友好的方式
  if (import.meta.env.DEV) {
    console.log("✅ Iconify 离线图标已加载");
    // 或使用纯文本
    console.log("[SUCCESS] Iconify offline icons loaded");
  }
}
