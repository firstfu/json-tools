/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://jsontool.ailoop.uk",
  generateRobotsTxt: true, // 自動生成 robots.txt
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
  exclude: ["/admin/*", "/private/*"], // 排除不想被索引的頁面
  generateIndexSitemap: true, // 生成索引 sitemap
  outDir: "public", // 輸出目錄
  changefreq: "daily", // 頁面更新頻率
  priority: 0.7, // 頁面優先級
  transform: async (config, path) => {
    // 自定義 URL 轉換邏輯
    return {
      loc: path, // 頁面 URL
      changefreq: config.changefreq, // 使用預設更新頻率
      priority: config.priority, // 使用預設優先級
      lastmod: new Date().toISOString(), // 最後修改日期
    };
  },
};
