/**
 * PM2 配置：在项目根目录执行
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 *
 * 请先：npm run build:prod，并配置好 .env（含 PORT、DATABASE_URL 等）
 */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "portfolio",
      cwd: path.join(__dirname),
      script: "server-run.mjs",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
