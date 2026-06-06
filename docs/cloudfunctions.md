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

生成 AI 情书。当前使用 mock 逻辑生成文案，代码中已预留真实 AI API 调用位置。

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
- `reminders`
