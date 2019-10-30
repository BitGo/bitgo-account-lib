import { BaseAddress, BaseKey } from "./iface";
import { BaseTransaction } from "./baseTransaction";
import { SigningError } from "./errors";
import BigNumber from "bignumber.js";
import { BaseCoin as CoinConfig } from "@bitgo/statics";

/**
 * Generic transaction builder. It contains the set of default steps (i.e. from, sign, build) and
 * mandatory validations.
 */
export abstract class BaseTransactionBuilder {

  /**
   *
   * @param _coinConfig
   */
  protected constructor(protected _coinConfig: Readonly<CoinConfig>) { }

  /**
   * Build a transaction based on existing data. The input format will depend on the coin, and it
   * could be hex, base64, JSON, etc.
   * @param rawTransaction
   */
  from(rawTransaction: any): void {
    this.validateRawTransaction(rawTransaction);
    this.transaction = this.fromImplementation(rawTransaction);
  }

  protected abstract fromImplementation(rawTransaction: any): BaseTransaction;

  /**
   * Signs the transaction in our builder.
   * @param key one of the keys associated with this transaction
   */
  sign(key: BaseKey): void {
    // Make sure the key is valid
    this.validateKey(key);
    if (!this.transaction.canSign(key)) {
      throw new SigningError('Private key cannot sign the transaction');
    }

    this.transaction = this.signImplementation(key);
  }

  /**
   * Coin specific transaction signing logic.
   * @param {BaseKey} key
   * @return {BaseTransaction}
   */
  protected abstract signImplementation(key: BaseKey): BaseTransaction;

  /**
   * Finalize the transaction by performing any extra step like calculating hashes, verifying
   * integrity, or adding default values.
   * @return transaction object
   */
  build(): BaseTransaction {
    this.validateTransaction(this.transaction);
    return this.buildImplementation();
  }

  /**
   *
   * @return {BaseTransaction}
   */
  protected abstract buildImplementation(): BaseTransaction;

  /**
   * The statics fullName of this coin
   */
  abstract displayName(): string;

  /**
   * Validates a private key.
   */
  abstract validateKey(key: BaseKey);

  /**
   * Validate an address. Throws an exception if invalid.
   * @param address the address
   * @param addressFormat the address format - this will be handled by the implementing coin as an
   *     enum
   */
  abstract validateAddress(address: BaseAddress, addressFormat?: string);

  /***
   * Validates the value corresponding to an amount can be used for this transaction. Throws an
   * exception if invalid.
   */
  abstract validateValue(value: BigNumber);

  abstract validateRawTransaction(rawTransaction: any);

  abstract validateTransaction(transaction: BaseTransaction);

  protected abstract get transaction(): BaseTransaction;

  protected abstract set transaction(transaction: BaseTransaction);
}
