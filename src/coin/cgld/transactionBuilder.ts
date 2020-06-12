import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../index';
import { TransactionType, StakingOperationTypes } from '../baseCoin';
import { BuildTransactionError } from '../baseCoin/errors';
import { TxData } from '../eth/iface';
import { Transaction } from './transaction';
import { StakingBuilder } from './stakingBuilder';
import { StakingCall } from './stakingCall';

export class TransactionBuilder extends Eth.TransactionBuilder {
  // Staking specific parameters
  private _stakingBuilder?: StakingBuilder;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.transaction = new Transaction(this._coinConfig);
  }

  /** @inheritdoc */
  type(type: TransactionType): void {
    super.type(type);
    this._stakingBuilder = undefined;
  }

  protected getTransactionData(): TxData {
    switch (this._type) {
      case TransactionType.StakingLock:
        return this.buildLockStakeTransaction();
      case TransactionType.StakingUnlock:
      case TransactionType.StakingVote:
      case TransactionType.StakingUnvote:
      case TransactionType.StakingActivate:
      case TransactionType.StakingWithdraw:
        return this.buildStakingTransaction();
    }
    return super.getTransactionData();
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    let tx: Transaction;
    if (/^0x?[0-9a-f]{1,}$/.test(rawTransaction.toLowerCase())) {
      tx = Transaction.fromSerialized(this._coinConfig, rawTransaction);
      super.loadBuilderInput(tx.toJson());
    } else {
      const txData = JSON.parse(rawTransaction);
      tx = new Transaction(this._coinConfig);
      tx.setTransactionData(txData); //TODO: maybe create a constructor that takes 2 arguments
    }
    return tx;
  }

  protected setTransactionTypeFields(decodedType: TransactionType, transactionJson: TxData): void {
    switch (decodedType) {
      case TransactionType.StakingLock:
        this._stakingBuilder = new StakingBuilder(this._coinConfig)
          .type(StakingOperationTypes.LOCK)
          .amount(transactionJson.value);
        break;
      case TransactionType.StakingUnlock:
      case TransactionType.StakingVote:
      case TransactionType.StakingUnvote:
      case TransactionType.StakingActivate:
      case TransactionType.StakingWithdraw:
        this._stakingBuilder = new StakingBuilder(this._coinConfig, transactionJson.data);
        break;
      default:
        super.setTransactionTypeFields(decodedType, transactionJson);
        break;
    }
  }

  //region Stake methods
  lock(): StakingBuilder {
    if (this._type !== TransactionType.StakingLock) {
      throw new BuildTransactionError('Lock can only be set for Staking Lock transactions type');
    }
    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.LOCK);
    }
    return this._stakingBuilder;
  }

  unlock(): StakingBuilder {
    if (this._type !== TransactionType.StakingUnlock) {
      throw new BuildTransactionError('Unlock can only be set for Staking Unlock transactions type');
    }
    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.UNLOCK);
    }
    return this._stakingBuilder;
  }

  private getStaking(): StakingCall {
    if (!this._stakingBuilder) {
      throw new BuildTransactionError('No staking information set');
    }
    return this._stakingBuilder.build();
  }

  private buildLockStakeTransaction(): TxData {
    const stake = this.getStaking();
    const data = this.buildBase(stake.serialize());
    data.to = stake.address;
    data.value = stake.amount;
    return data;
  }

  /**
   * Gets the staking vote builder if exist, or creates a new one for this transaction and returns it
   *
   * @returns {StakingBuilder} the staking builder
   */
  vote(): StakingBuilder {
    if (this._type !== TransactionType.StakingVote) {
      throw new BuildTransactionError('Votes can only be set for a staking transaction');
    }

    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.VOTE);
    }

    return this._stakingBuilder;
  }

  unvote(): StakingBuilder {
    if (this._type !== TransactionType.StakingUnvote) {
      throw new BuildTransactionError('Unvote can only be set for a staking transaction');
    }

    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.UNVOTE);
    }

    return this._stakingBuilder;
  }

  private buildStakingTransaction(): TxData {
    const stake = this.getStaking();
    const data = this.buildBase(stake.serialize());
    data.to = stake.address;

    return data;
  }

  /**
   * Gets the staking activate builder if exist, or creates a new one for this transaction and returns it
   *
   * @returns {StakingBuilder} the staking builder
   */
  activate(): StakingBuilder {
    if (this._type !== TransactionType.StakingActivate) {
      throw new BuildTransactionError('Activation can only be set for a staking transaction');
    }

    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.ACTIVATE);
    }

    return this._stakingBuilder;
  }

  /**
   * Gets the staking withdraw builder if exist, or creates a new one for this transaction and returns it
   *
   * @returns {StakingBuilder} the staking builder
   */
  withdraw(): StakingBuilder {
    if (this._type !== TransactionType.StakingWithdraw) {
      throw new BuildTransactionError('Withdraw can only be set for a staking transaction');
    }

    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.WITHDRAW);
    }

    return this._stakingBuilder;
  }
  // endregion
}
