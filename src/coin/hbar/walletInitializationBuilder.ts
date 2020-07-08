import { AccountCreateTransaction, Client, Ed25519PublicKey, ThresholdKey, TransactionId } from '@hashgraph/sdk';
import { _fromProtoKey } from '@hashgraph/sdk/lib/crypto/PublicKey';
import { TransactionBuilder } from './transactionBuilder';
import { Transaction } from './transaction';

export class WalletInitializationBuilder extends TransactionBuilder {
  private _owners: string[] = [];

  owner(address: string): this {
    this._owners.push(address);
    return this;
  }

  protected async buildImplementation(): Promise<Transaction> {
    const createTransaction = new AccountCreateTransaction()
      .setKey(this.buildOwnersKeys())
      .setInitialBalance(0)
      .setMaxTransactionFee(this._fee.fee)
      .setTransactionId(this.buildTxId())
      .build(Client.forTestnet()); //TODO: take client from coin config
    const transaction = new Transaction(this._coinConfig);
    transaction.body(createTransaction);
    return transaction;
  }

  private buildTxId(): TransactionId {
    return new TransactionId(this._source.address);
  }

  private buildOwnersKeys(): ThresholdKey {
    return this._owners.reduce((list, key) => {
      return list.add(_fromProtoKey(Ed25519PublicKey.fromString(key)._toProtoKey()));
    }, new ThresholdKey(2));
  }
}
