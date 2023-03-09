# ZenWeb Schedule module

[ZenWeb](https://www.npmjs.com/package/zenweb)

定时任务

```ts
import { Context } from 'zenweb';
import { schedule } from '@zenweb/schedule';

export class EchoScheduler {
  @schedule({ rule: '*/1 * * * * *' })
  echo() {
    console.log('task echo');
    return 'ok';
  }

  @schedule({ rule: '*/4 * * * * *' })
  err(ctx: Context) {
    ctx.errrrr();
  }
}
```