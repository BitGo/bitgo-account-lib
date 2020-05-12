/**
 * Ethereum transaction model
 */
import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { RLP } from 'ethers/utils';
import { bigNumberify } from 'ethers/utils/bignumber';
import { BaseTransaction, TransactionType } from '../baseCoin';
import { BaseKey } from '../baseCoin/iface';
import { InvalidTransactionError } from '../baseCoin/errors';
import { KeyPair } from './keyPair';
import { TxData } from './iface';
import { Utils } from './';

export class Transaction extends BaseTransaction {
  protected _parsedTransaction?: TxData; // transaction in JSON format
  protected _encodedTransaction?: string; // transaction in hex format

  /**
   * Public constructor.
   *
   * @param {Readonly<CoinConfig>} coinConfig
   * @param {TxData | string} txData The object transaction data or encoded transaction data
   */
  constructor(coinConfig: Readonly<CoinConfig>, txData?: TxData | string) {
    super(coinConfig);
    if (typeof txData === 'string') {
      this._encodedTransaction = txData;
    } else {
      this._parsedTransaction = txData;
    }
  }

  /**
   * Set the transaction data
   *
   * @param {TxData} transactionData The transaction data to set
   */
  setTransactionData(transactionData: TxData): void {
    this._parsedTransaction = transactionData;
  }

  /**
   * Set the transaction type
   *
   * @param {TransactionType} transactionType The transaction type to be set
   */
  setTransactionType(transactionType: TransactionType): void {
    this._type = transactionType;
  }

  /** @inheritdoc */
  canSign(key: BaseKey): boolean {
    //TODO: implement this validation for the ethereum network
    return true;
  }

  /**
   * Sign the transaction with the provided key. It does not check if the signer is allowed to sign
   * it or not.
   *
   * @param {KeyPair} keyPair The key to sign the transaction with
   */
  async sign(keyPair: KeyPair): Promise<void> {
    // Check if there is a transaction to sign
    if (!this._parsedTransaction) {
      throw new InvalidTransactionError('Empty transaction');
    }
    this._encodedTransaction = await Utils.sign(this._parsedTransaction, keyPair);
  }

  /** @inheritdoc */
  toBroadcastFormat(): any {
    if (!this._encodedTransaction) {
      throw new InvalidTransactionError('Missing encoded transaction');
    }
    return this._encodedTransaction;
  }

  /** @inheritdoc */
  toJson(): any {
    if (!this._parsedTransaction) {
      throw new InvalidTransactionError('Empty transaction');
    }
    return this._parsedTransaction;
  }

  /**
   * Initialize the transaction fields based on another serialized transaction.
   *
   * @param {string} serializedTransaction Transaction in broadcast format.
   */
  initFromSerializedTransaction(serializedTransaction: string): void {
    this._encodedTransaction = serializedTransaction;
    const decodedTx = RLP.decode(serializedTransaction);
    const [rawNonce, rawGasPrice, rawGasLimit, rawTo, rawValue, rawData, rawV, rawR, rawS] = decodedTx;
    const parsedTransaction: TxData = {
      nonce: bigNumberify(rawNonce).toNumber(),
      gasPrice: bigNumberify(rawGasPrice).toNumber(),
      gasLimit: bigNumberify(rawGasLimit).toNumber(),
      to: rawTo,
      value: bigNumberify(rawValue).toNumber(),
      data: rawData,
      v: bigNumberify(rawV).toNumber(),
      r: rawR,
      s: rawS,
    };
    this._parsedTransaction = parsedTransaction;
  }
}
