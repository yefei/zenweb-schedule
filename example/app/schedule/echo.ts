import { Context } from "@zenweb/core";
import { schedule } from "../../../src";

export class EchoController {
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
