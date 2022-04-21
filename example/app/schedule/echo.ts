import { Context } from "@zenweb/inject";
import { schedule } from "../../../src";

export class EchoController {
  @schedule({ rule: '*/1 * * * * *' })
  echo(ctx: Context) {
    console.log('task echo');
    ctx.body = 'ok';
  }
}
