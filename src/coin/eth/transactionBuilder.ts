import { BaseTransaction, BaseTransactionBuilder, TransactionType } from '../baseCoin';
import { BaseAddress, BaseKey } from '../baseCoin/iface';
import { Transaction } from '../eth';
import BigNumber from 'bignumber.js';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';

/**
 * Ethereum transaction builder.
 */
export class TransactionBuilder extends BaseTransactionBuilder {
  private _serializedTransaction: string;
  private _transaction: Transaction;
  private _type: TransactionType;
  private _counter: BigNumber;

  // Wallet initialization transaction parameters
  private _initialBalance: string;
  private _walletOwnerPublicKeys: string[];

  /**
   * Public constructor.
   *
   * @param _coinConfig
   */
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this._type = TransactionType.Send;
    this._counter = new BigNumber(0);
    this._walletOwnerPublicKeys = [];
    this.transaction = new Transaction(_coinConfig);
  }

  protected async buildImplementation(): Promise<BaseTransaction> {
    return Promise.resolve(this.transaction);
  }

  // region Base Builder
  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    // Decoding the transaction is an async operation, so save it and leave the decoding for the
    // build step
    this._serializedTransaction = rawTransaction;
    return new Transaction(this._coinConfig);
  }

  protected signImplementation(key: BaseKey): BaseTransaction {
    return this.transaction;
  }

  validateAddress(address: BaseAddress, addressFormat?: string): void {
    console.log('Not implemented validateAddress');
  }

  validateKey(key: BaseKey): void {
    console.log('Not implemented validateKey');
  }

  validateRawTransaction(rawTransaction: any): void {
    console.log('Not implemented validateRawTransaction');
  }

  validateTransaction(transaction: BaseTransaction): void {
    console.log('Not implemented validateTransaction');
  }

  validateValue(value: BigNumber): void {
    console.log('Not implemented validateValue');
  }

  /** @inheritdoc */
  protected get transaction(): Transaction {
    return this._transaction;
  }

  /** @inheritdoc */
  protected set transaction(transaction: Transaction) {
    this._transaction = transaction;
  }
}
