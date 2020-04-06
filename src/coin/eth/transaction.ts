/**
 * Ethereum transaction model
 */
import { BaseTransaction } from '../baseCoin';
import { BaseKey } from '../baseCoin/iface';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';

export class Transaction extends BaseTransaction {
  /**
   * Public constructor.
   *
   * @param {Readonly<CoinConfig>} coinConfig
   */
  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);
  }

  canSign(key: BaseKey): boolean {
    return false;
  }

  toBroadcastFormat(): any {
    return ''; //TODO: Implement toBroadCastFormat for Ethereum
  }

  toJson(): any {
    return ''; //TODO: Implement toJson for Ethereum
  }
}
