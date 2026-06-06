# Love Record Mini Program

A WeChat Mini Program for couples to record relationship milestones, daily memories, date check-ins, wish lists, and partner binding.

Tech stack: native WeChat Mini Program + WeChat Cloud Development.

## Project Structure

```text
miniprogram/       Mini Program client code
cloudfunctions/    Cloud functions
docs/              Database, routing, and MVP planning documents
```

## Getting Started

1. Open WeChat DevTools and import this project directory.
2. Confirm the real `appid` in `project.config.json`.
3. Enable WeChat Cloud Development for the Mini Program.
4. Confirm the cloud environment ID in `miniprogram/app.js`.
5. Upload and deploy every function under `cloudfunctions`.
6. Create the required cloud database collections according to `docs/database.md`.

## MVP Features

- Record the relationship start date and show love days.
- Add anniversaries and reminder metadata.
- Write relationship diaries with image uploads.
- Create date check-ins with location, notes, images, and date selection.
- Manage a couple wish list.
- Bind two users into a relationship.
- Show a home calendar with colored dots: blue for male-created records and pink for female-created records.

## Notes

- `project.private.config.json` is a local WeChat DevTools file and should not be committed.
- Existing records created before profile gender support may not include `creatorGender`; they will fall back to the default calendar dot color.

## 中文说明

这是一个面向情侣的微信小程序，用于记录恋爱天数、纪念日、恋爱日记、约会打卡、心愿清单和双人绑定关系。

技术栈：微信小程序原生 + 云开发。

### 项目目录

```text
miniprogram/       小程序端代码
cloudfunctions/    云函数
docs/              数据库、路由与 MVP 计划文档
```

### 启动方式

1. 使用微信开发者工具导入当前目录。
2. 确认 `project.config.json` 中的 `appid`。
3. 开通云开发环境。
4. 确认 `miniprogram/app.js` 中的云环境 ID。
5. 上传并部署 `cloudfunctions` 下的所有云函数。
6. 按照 `docs/database.md` 创建云数据库集合。
