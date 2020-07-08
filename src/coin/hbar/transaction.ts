import { Transaction as hTransaction } from '@hashgraph/sdk';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { BaseTransaction } from '../baseCoin';
import { BaseKey } from '../baseCoin/iface';

export class Transaction extends BaseTransaction {
  private _body: hTransaction;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  body(txBody: hTransaction) {
    this._body = txBody;
  }

  canSign(key: BaseKey): boolean {
    return true;
  }

  toBroadcastFormat(): any {
    return this._body.toBytes();
  }

  toJson(): any {
    return {};
  }
}
