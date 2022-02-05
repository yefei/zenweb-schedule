# ZenWeb Schedule module

[ZenWeb](https://www.npmjs.com/package/zenweb)

## Quick start
```
$ npm i @zenweb/schedule
```

app/index.js
```js
app.setup('@zenweb/schedule');
```

app/schedule/echo.js
```js
app.schedule.job('*/1 * * * * *', ctx => {
  console.log('task echo');
});
```

## Develop
```
$ yarn global add rimraf typescript
```
