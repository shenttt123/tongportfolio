# AWS Linux 部署命令清单

面向：**单台 EC2（Amazon Linux 2023 / Ubuntu）+ Nginx 反代 + Node 跑本仓库**。

---

## 〇、你遇到的三个问题（对照排查）

| 现象 | 原因 | 处理 |
|------|------|------|
| `EBADENGINE` / 要求 Node ≥20 | 系统还是 Node 18 | 下面 **「安装 Node 20」** |
| `EACCES ... mkdir node_modules` | `/var/www/html` 属主是 root（nginx） | **不要用 `sudo npm install`**，把目录属主改成 `ec2-user`（见下） |
| `Could not find Prisma Schema` | 旧版 `.gitignore` 误写了整目录 `prisma/`，clone 下来没有 `schema.prisma` | 在**开发电脑**上修正 `.gitignore`、把 `prisma/` 提交进 git、`git push`，服务器再 `git pull` |

**不要用 `sudo npm install`**：会产生 root 拥有的 `node_modules`，以后改代码会反复权限错误。

```bash
# 若已经 sudo 装过，先清掉再改属主（在服务器执行）
sudo rm -rf /var/www/html/node_modules
sudo chown -R ec2-user:ec2-user /var/www/html
```

---

## 一、服务器一次性准备

```bash
# Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y git nginx

# Node 20 LTS（若尚未安装，可用 nvm 或 NodeSource，按官方文档二选一）
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node -v
npm -v
```

```bash
# 应用目录（按习惯改路径）
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone <你的仓库 HTTPS 或 SSH URL> portfolio
cd portfolio
```

---

## 二、环境与密钥（不要提交 git）

```bash
cp .env.example .env
nano .env
```

至少配置：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 例：`file:./prisma/prod.db`（服务器上单独路径，勿用开发机里的 dev.db） |
| `PORT` | 例：`3000`（仅本机监听，由 Nginx 反代） |
| `ADMIN_AUTH_PASSWORD` | 后台 `/admin` 与 `/api/admin` 的 Basic Auth 密码 |
| `ADMIN_AUTH_USER` | 可选，默认 `admin` |
| **不要写 `NODE_ENV` 到 `.env`** | Vite 在 `npm run build` 时会拒绝 `NODE_ENV=production`；生产环境用 **PM2**（`ecosystem.config.cjs` 已写）或 **systemd** 的 `Environment=NODE_ENV=production` |

```bash
chmod 600 .env
sudo chown ec2-user:ec2-user .env
```

若 PM2 用 **ec2-user** 启动却仍报 `EACCES` 读 `.env`：多半是 `.env` 属主是 **root**（曾用 `sudo` 创建）。执行上面的 **`chown`**，并避免 **`sudo pm2 start`**。

---

## 三、首次构建与数据库

```bash
cd /var/www/portfolio
npm ci
npm run build:prod
npx prisma db push
# 可选：首次灌数据
# npx prisma db seed
```

说明：`build:prod` 会生成前端 `dist/` 和 **`server-run.mjs`**（该文件在 `.gitignore` 中，每次部署都要重新构建）。

---

## 四、systemd 常驻进程

```bash
sudo nano /etc/systemd/system/portfolio.service
```

示例（路径、用户按你机器修改）：

```ini
[Unit]
Description=Portfolio Node (Express + Vite dist)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/portfolio
Environment=NODE_ENV=production
EnvironmentFile=/var/www/portfolio/.env
ExecStart=/usr/bin/node /var/www/portfolio/server-run.mjs
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable portfolio
sudo systemctl start portfolio
sudo systemctl status portfolio
journalctl -u portfolio -f
```

---

## 四-B、用 PM2 常驻（与 systemd 二选一）

**是的：只需要这一个 Node 进程**（`server-run.mjs`）。它同时负责：

- 静态前端 `dist/`
- 所有 `/api/*`
- SPA 路由回退到 `index.html`

安装 PM2（全局）：

```bash
sudo npm install -g pm2
```

在项目根目录（已有 `server-run.mjs`、`.env`）：

```bash
cd /var/www/html
npm run build:prod
pm2 start ecosystem.config.cjs
pm2 logs portfolio
pm2 status
```

开机自启：

```bash
pm2 save
pm2 startup
# 按屏幕提示执行它打印的一条 sudo 命令
```

常用：

```bash
pm2 restart portfolio
pm2 stop portfolio
```

`.env` 里的 `PORT`（默认 3000）要与下面 Nginx `proxy_pass` 端口一致。

---

## 五、Nginx（HTTPS + 反代 API 与 SPA）

1. 安全组：放行 **80、443**；**不要**对公网放行 Node 的 `PORT`（如 3000）、**不要**放行 Prisma Studio **5555**。

2. 证书（Let’s Encrypt 示例）：

```bash
sudo dnf install -y certbot python3-certbot-nginx
# 先有一个最小 server_name 的 server 块，再执行：
sudo certbot --nginx -d your.domain.com
```

3. 站点配置示例 `/etc/nginx/conf.d/portfolio.conf`：

```nginx
server {
    listen 443 ssl http2;
    server_name your.domain.com;

    # ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your.domain.com;
    return 301 https://$host$request_uri;
}
```

本项目的生产模式由 **Node 提供 `dist` 静态资源 + `index.html`**，因此 **`location /` 也反代到 Node** 即可（与 `/api/` 一致）。

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 六、以后每次更新（git pull 流程）

```bash
cd /var/www/portfolio
git pull
npm ci
npm run build:prod
npx prisma db push
sudo systemctl restart portfolio
# 若用 PM2：pm2 restart portfolio
```

若使用正式迁移而非 `db push`：

```bash
npx prisma migrate deploy
```

---

## 七、Prisma Studio（仅维护时用）

```bash
cd /var/www/portfolio
npm run studio
# 仅监听 127.0.0.1:5555，本机 SSH 隧道：
# ssh -L 5555:127.0.0.1:5555 ec2-user@服务器公网IP
# 浏览器打开 http://localhost:5555
```

对外要带密码时，见 `deploy/nginx-prisma-studio-basic-auth.example.conf`。

---

## 八、快速自检

```bash
curl -sS http://127.0.0.1:3000/api/health
curl -sSI https://your.domain.com/api/health
```

设置 `ADMIN_AUTH_PASSWORD` 后，访问 `/admin` 应出现浏览器 Basic 认证弹窗。

---

## 九、可选改进

- 用 **GitHub Actions** 在 push 后 SSH 到 EC2 执行第六节脚本，减少手工。
- 数据库从 SQLite 换 **RDS PostgreSQL** 时，改 `DATABASE_URL` 与 Prisma provider 即可逐步迁移。
- **备份**：定期拷贝 `prisma/*.db`（若仍用 SQLite）到 S3。
