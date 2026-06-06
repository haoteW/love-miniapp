# Love MiniApp

An open-source WeChat Mini Program for couples to record relationship milestones, daily memories, anniversaries, date check-ins, wish lists, and AI-generated relationship content.

Love MiniApp is designed as both a usable relationship record app and a practical starter template for Chinese developers who want to build AI-powered WeChat Mini Programs with WeChat Cloud Development.

## Why this project exists

Building AI features inside a WeChat Mini Program requires more than calling a model API. Developers need secure cloud functions, API key isolation, prompt workflows, privacy-aware data handling, and a deployment structure that works with WeChat DevTools.

This repository aims to provide a complete, readable example for:

- Native WeChat Mini Program development
- WeChat Cloud Development backend functions
- Couple-oriented data models and user binding
- AI content generation through secure backend APIs
- Privacy-first handling of personal relationship records

## Features

### Current MVP

- Relationship start date and love-day counter
- Anniversary management
- Relationship diary with image support
- Date check-ins with location, notes, images, and date selection
- Couple wish list
- Partner binding
- Home calendar with colored event markers

### AI roadmap

- AI love letter generator
- Annual relationship report
- AI anniversary copywriting
- Shareable relationship poster
- Multi-model provider support, such as OpenAI and DeepSeek
- Prompt template examples for WeChat Mini Program scenarios

## Tech stack

- Native WeChat Mini Program
- WeChat Cloud Development
- Cloud Functions
- Cloud Database
- JavaScript

## Project structure

```text
miniprogram/       Mini Program client code
cloudfunctions/    WeChat Cloud Functions
docs/              Architecture, deployment, database, AI, and privacy docs
```

## Getting started

1. Open WeChat DevTools and import this project directory.
2. Confirm the real `appid` in `project.config.json`.
3. Enable WeChat Cloud Development for the Mini Program.
4. Confirm the cloud environment ID in `miniprogram/app.js`.
5. Upload and deploy every function under `cloudfunctions`.
6. Create the required cloud database collections according to `docs/database.md`.
7. Read `docs/deployment.md` before using this project in production.

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [AI Integration](docs/ai-integration.md)
- [Privacy](docs/privacy.md)
- [Database](docs/database.md)

## Security notes

- Never expose model provider API keys in Mini Program client code.
- Put AI calls behind cloud functions or a trusted backend proxy.
- Keep environment IDs, secrets, and local WeChat DevTools files out of source control.
- Review privacy implications before sending diary, check-in, or relationship records to AI providers.

## Roadmap

The public roadmap is tracked in GitHub Issues. The first planned AI milestones are:

- AI Love Letter Generator
- Annual Relationship Report
- Multi-provider model support
- Export and shareable poster generation
- Cost tracking for AI usage

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for development and pull request guidelines.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).

---

# 中文说明

Love MiniApp 是一个开源微信小程序项目，用于记录恋爱天数、纪念日、恋爱日记、约会打卡、心愿清单和双人绑定关系，并计划加入 AI 情书、年度恋爱报告、纪念日文案等 AI 功能。

它不仅是一个情侣记录小程序，也可以作为中文开发者学习「微信小程序 + 云开发 + AI API」的开源模板。

## 项目目标

微信小程序接入 AI 不只是调用模型接口，还需要处理：

- 云函数代理
- API Key 安全
- Prompt 模板
- 成本控制
- 用户隐私
- 小程序端和云开发的部署结构

本项目希望提供一套真实、可读、可复用的实现示例。

## 当前功能

- 恋爱开始日与恋爱天数
- 纪念日管理
- 恋爱日记与图片上传
- 约会打卡
- 心愿清单
- 情侣绑定
- 首页日历彩色标记

## AI 功能规划

- AI 情书生成
- 年度恋爱报告
- AI 纪念日文案
- 可分享恋爱海报
- OpenAI / DeepSeek 等多模型支持
- 面向微信小程序场景的 Prompt 模板

## 启动方式

1. 使用微信开发者工具导入当前目录。
2. 确认 `project.config.json` 中的 `appid`。
3. 开通云开发环境。
4. 确认 `miniprogram/app.js` 中的云环境 ID。
5. 上传并部署 `cloudfunctions` 下的所有云函数。
6. 按照 `docs/database.md` 创建云数据库集合。
7. 上线前阅读 `docs/deployment.md` 和 `docs/privacy.md`。
