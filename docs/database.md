# 数据库集合设计

## users

```js
{
  _id,
  openid,
  nickName,
  avatarUrl,
  coupleId,
  loveStartDate,
  createdAt,
  updatedAt
}
```

## couples

```js
{
  _id,
  userAOpenid,
  userBOpenid,
  loveStartDate,
  bindStatus,
  createdAt,
  updatedAt
}
```

## bind_codes

```js
{
  _id,
  code,
  creatorOpenid,
  status,
  expiredAt,
  createdAt,
  usedAt
}
```

## anniversaries

```js
{
  _id,
  coupleId,
  title,
  date,
  type,
  repeatType,
  reminderEnabled,
  reminderDaysBefore,
  note,
  createdBy,
  createdAt,
  updatedAt
}
```

## diaries

```js
{
  _id,
  coupleId,
  title,
  content,
  images,
  mood,
  date,
  visibility,
  createdBy,
  createdAt,
  updatedAt
}
```

## checkins

```js
{
  _id,
  coupleId,
  title,
  date,
  locationName,
  latitude,
  longitude,
  images,
  note,
  tags,
  createdBy,
  createdAt,
  updatedAt
}
```

## wishes

```js
{
  _id,
  coupleId,
  title,
  description,
  category,
  status,
  priority,
  images,
  completedAt,
  createdBy,
  completedBy,
  createdAt,
  updatedAt
}
```

## reminders

```js
{
  _id,
  coupleId,
  targetType,
  targetId,
  title,
  remindAt,
  receiverOpenids,
  status,
  createdAt,
  sentAt
}
```

## love_letters

```js
{
  _id,
  coupleId,
  userId,
  style,
  inputText,
  content,
  createdAt
}
```

## 建议索引

- `users.openid`
- `users.coupleId`
- `couples.userAOpenid`
- `couples.userBOpenid`
- `bind_codes.code`
- `anniversaries.coupleId`
- `diaries.coupleId + date`
- `checkins.coupleId + date`
- `wishes.coupleId + status`
- `love_letters.coupleId + createdAt`
- `reminders.status + remindAt`

## 权限建议

MVP 阶段建议业务写操作主要走云函数，客户端只做查询或也统一走云函数。这样可以避免用户伪造 `coupleId` 修改别人的数据。
