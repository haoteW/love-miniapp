# Report Poster

The annual relationship report poster is generated with WeChat Mini Program Canvas.

## Current Approach

- The AI summary text comes from the existing annual report feature.
- Real report data, including days, diary count, check-in count, anniversary count, wish count, and photo count, is drawn by Canvas in the mini program.
- This avoids AI image generation mistakes such as incorrect numbers, malformed Chinese text, or missing report details.
- The poster page exports the Canvas as a temporary image, then supports preview and saving to the photo album.

## Future AI Backgrounds

AI image generation can be added later only as a decorative background enhancement.

Rules for future AI backgrounds:

- The AI-generated background must not contain text.
- The AI-generated background must not contain numbers.
- All user-specific data and readable copy must continue to be drawn by Canvas.
- API keys must stay in cloud functions or secure server-side environments, never in mini program frontend code.
