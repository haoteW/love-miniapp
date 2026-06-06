# 云函数说明

## login

返回当前用户 `openid`。

## initUser

初始化用户。如果用户不存在，则创建 `users` 记录。

## createBindCode

生成 30 分钟有效的 6 位绑定码。

## bindPartner

使用绑定码建立情侣关系。

当前逻辑：

- 校验绑定码存在、未使用、未过期
- 禁止绑定自己
- 创建 `couples`
- 更新双方 `users.coupleId`
- 标记绑定码为已使用

## unbindPartner

解除当前用户所在的绑定关系。

## addReminder

创建提醒记录。

## scheduledReminder

扫描到期提醒。当前只更新状态，订阅消息发送逻辑后续接入。

## generateLoveLetter

生成 AI 情书。云函数会从环境变量读取 `AI_API_KEY`，不会把密钥暴露给小程序前端。

可选环境变量：

- `AI_API_KEY`：必填，AI 服务 API Key。
- `AI_API_URL`：可选，默认 `https://api.deepseek.com/chat/completions`。
- `AI_MODEL`：可选，默认 `deepseek-v4-flash`。

如果缺少 `AI_API_KEY`，云函数会返回明确错误提示。

真实 AI 接口通常会超过云函数默认 3 秒超时，`generateLoveLetter/config.json` 已将云函数超时时间配置为 30 秒。修改后需要在微信开发者工具中重新上传并部署 `generateLoveLetter` 云函数，云端配置才会生效。

## generateYearReport

生成年度恋爱报告。云函数会读取当前用户和绑定关系，统计指定年份的日记、照片、心愿、纪念日和打卡记录，然后保存到 `year_reports` 集合。

环境变量：

- `DEEPSEEK_API_KEY`：可选，DeepSeek API Key。缺少时会返回 mock 年度报告，保证功能可用。
- `DEEPSEEK_API_URL`：可选，默认 `https://api.deepseek.com/chat/completions`。
- `DEEPSEEK_MODEL`：可选，默认 `deepseek-v4-flash`。

`generateYearReport/config.json` 已将云函数超时时间配置为 30 秒。修改后需要在微信开发者工具中重新上传并部署 `generateYearReport` 云函数。

## setupDatabase

一次性初始化数据库集合：

- `users`
- `couples`
- `bind_codes`
- `anniversaries`
- `diaries`
- `checkins`
- `wishes`
- `love_letters`
- `year_reports`
- `reminders`
