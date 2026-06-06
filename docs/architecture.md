# Architecture

## Client Layer

WeChat Mini Program pages, components, and local state.

## Cloud Layer

WeChat Cloud Functions handle:

- Authentication
- Relationship binding
- Diary processing
- AI requests
- Data aggregation

## Database Layer

WeChat Cloud Database collections:

- users
- couples
- anniversaries
- diaries
- checkins
- wishlist

## AI Layer

Mini Program -> Cloud Function -> AI Provider -> Response

API keys should never be exposed in the client.
