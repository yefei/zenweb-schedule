# ZenWeb Schedule module

[ZenWeb](https://www.npmjs.com/package/zenweb)

基于请求的定时任务，如同定时请求固定接口，可以使用中间件和请求上下文。

## 依赖模块

- @zenweb/inject
- @zenweb/router

## 快速使用

```bash npm2yarn
npm install @zenweb/schedule
```

```ts title="src/index.ts"
import modSchedule from '@zenweb/schedule';
// ...
app.setup(modSchedule());
// ...
```

```ts title="src/schedule/echo.ts"
import { schedule } from '@zenweb/schedule';

export class EchoScheduler {
  @schedule({ rule: '*/1 * * * * *' })
  echo() {
    console.log('task echo');
    return 'ok';
  }
}
```

## 配置项

| 配置项 | 类型 | 默认值 | 功能 |
| ----- | --- | ----- | ---- |
| paths | `string[]` | `['./app/schedule']` | 定时任务控制器加载目录
| patterns | `string` | **/*.{ts,js} | 定时任务控制器文件匹配规则
| disabled | `boolean` | `false` | 是否禁用定时器，可以通过环境变量 ZENWEB_SCHEDULE_DISABLED=1 控制

## Core 挂载项

| 挂载项 | 类型 | 功能 |
| ----- | --- | ---- |
| scheduleRegister | ScheduleRegister | ScheduleRegister 实例
