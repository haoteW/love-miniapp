# AI Integration

Love MiniApp uses AI for relationship-oriented text generation and annual report summaries. The recommended architecture keeps all AI provider access behind WeChat Cloud Functions or another trusted backend layer.

## Supported Providers

- OpenAI
- DeepSeek
- Compatible OpenAI-style APIs

## Recommended Flow

```text
User -> Mini Program -> Cloud Function -> AI Provider -> Cloud Function -> Mini Program
```

The Mini Program client should never call model providers directly.

## Current AI and Report Features

- AI love letter generation
- Annual relationship report
- AI-generated annual summary copy
- Canvas-based annual report poster generation
- Poster preview and save-to-album workflow

## Security

- Never place API keys in Mini Program source code.
- Store provider credentials in backend or cloud function environment variables.
- Validate user identity and couple binding before generating private relationship content.
- Avoid logging raw private diary or relationship content unless necessary for debugging.
- Remove personal identifiers from prompts when possible.

## Canvas Poster Strategy

Annual report posters should be rendered with Canvas instead of asking an image generation model to draw the full report.

This avoids common image-generation problems such as incorrect Chinese text, wrong dates, and wrong statistics. AI may generate summary copy, but factual numbers and report text should be drawn by Canvas.

Future AI-generated backgrounds should avoid words, dates, and numbers. Canvas should remain responsible for all factual report content.

## Planned Features

- AI anniversary messages
- Prompt template library
- Multiple annual report poster templates
- Optional AI-generated background images without text or numbers
- Multi-provider model configuration

## Cost Control

- Rate limits
- Usage tracking
- Monthly quotas
- Per-user generation limits
- Provider-level fallback strategy
