# Opsflare

非官方 Cloudflare 多账号移动客户端，支持 iOS 和 Android，基于 Expo 与
React Native。源码：
[github.com/bearBoy80/opsflare](https://github.com/bearBoy80/opsflare)。

Opsflare 是独立项目，与 Cloudflare, Inc. 无隶属、代言或赞助关系。请勿使用
Cloudflare 的名称、logo 或字标，使人误以为这是官方产品。

当前状态：可用于日常账号管理。克隆后即可用 API 令牌登录。「使用 Cloudflare
登录」是可选项：先部署 `oauth-relay/`，复制其公开 URL，再注册一个指向该
URL 的 Cloudflare OAuth 客户端。

[English](README.md)

## 功能

- 本地应用账号，支持密码或生物识别解锁
- 用受限 API 令牌登录；配置完成后也可用 Cloudflare OAuth
- 多账号 Home、Zones、Storage、Compute 五个 Tab
- DNS、缓存、SSL、防火墙、R2、KV、D1、Workers、Pages 等页面
- 界面提供英文和简体中文

## 截图

| 总览 | 快捷入口 | 设置 |
| --- | --- | --- |
| ![总览（简体中文）](docs/screenshots/home-overview-zh.png) | ![快捷入口（简体中文）](docs/screenshots/home-shortcuts-zh.png) | ![设置（简体中文）](docs/screenshots/settings-zh.png) |
| ![Overview in English](docs/screenshots/home-overview-en.png) | ![Quick access in English](docs/screenshots/home-shortcuts-en.png) | ![Settings in English](docs/screenshots/settings-en.png) |

## 开发

```sh
cp .env.example .env
npm install
npm start
```

`.env` 留空则隐藏「使用 Cloudflare 登录」。API 令牌登录和测试不需要
OAuth。若要启用 OAuth，请在 `npm start` 之前完成
[OAuth 配置](#oauth-配置)。在 Expo 提示里按 `i` 打开 iOS 模拟器，按
`a` 打开 Android 模拟器（也可 `npm run ios` / `npm run android`）。

```sh
npm test -- --runInBand
npx tsc --noEmit
```

测试使用 Jest、`jest-expo` 和 React Native Testing Library。测试文件放在
邻近的 `__tests__/` 目录，命名为 `*.test.ts` 或 `*.test.tsx`。

## OAuth 配置

Cloudflare 拒绝私有回调地址，因此 OAuth 不能直接打到 `opsflare://`。每个人
（或每个正式构建）需要部署本仓库里的 `oauth-relay/` Worker，再把
Cloudflare OAuth 客户端指到这个 Worker。Worker 会把授权响应 302 到
`opsflare://oauth/callback`。

请按下面顺序操作。没有 Worker URL 之前，不要创建 OAuth 客户端。

1. **部署 `oauth-relay/`**，复制打印出的源站地址。完整命令和客户端参数见
   [`oauth-relay/README.md`](oauth-relay/README.md)。

   ```sh
   cd oauth-relay
   npm install
   npx wrangler login
   npm run deploy
   ```

   回调地址是源站加上 `/callback`，例如
   `https://opsflare-oauth-relay.<subdomain>.workers.dev/callback`。

2. **创建 Cloudflare OAuth 客户端**：打开仪表盘 → **管理账户** →
   **OAuth 客户端**。把 Redirect URL 设成第 1 步的 `/callback` 地址。
   Response type 用 `code`，Grant types 用 `authorization_code` 和
   `refresh_token`，Token authentication method 用 `none`（公开 PKCE
   客户端）。复制 **Client ID**。

3. **在应用的 `.env` 里填写**：

   ```
   EXPO_PUBLIC_CF_OAUTH_CLIENT_ID=<client id>
   EXPO_PUBLIC_CF_OAUTH_REDIRECT_URI=https://<your-worker>/callback
   ```

   Redirect URI 必须和仪表盘里的值逐字节一致。保存后重启 Metro。

Worker 是无状态的，不保存任何密钥。PKCE verifier 留在设备上；换 token
发生在应用和 `https://dash.cloudflare.com/oauth2/token` 之间。

不要提交 `.env`，也不要提交共用的生产 Client ID。Fork 和贡献者应各自部署
中继，并各自注册 OAuth 客户端。

## 架构

- `app/`：Expo Router 页面。
- `src/auth/`：本地账号和认证状态机。
- `src/cloudflare/`：Cloudflare REST / GraphQL API。
- `src/components/`：共享 UI。
- `src/theme/`：应用颜色 token 的唯一来源。
- `oauth-relay/`：启用 OAuth 前要先部署的 Worker，把 Cloudflare 回调跳到
  `opsflare://oauth/callback`。

首次启动是四步引导。设置完成后，每次冷启动和回到前台都要先密码或生物识别
解锁，才会进入五个 Tab。

本地密码是加盐 SHA-256，只存进 `expo-secure-store`。不要把密码、Cloudflare
凭据或 API 令牌写进源码、AsyncStorage、SQLite、测试夹具或日志。

## 许可证

MIT。见 `LICENSE`。
