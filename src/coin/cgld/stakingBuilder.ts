import ethUtil from 'ethereumjs-util';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { isValidAmount, isValidEthAddress, getRawDecoded, getBufferedByteCode, hexStringToNumber } from '../eth/utils';
import { BuildTransactionError, InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { StakingOperationTypes } from '../baseCoin';
import { StakingCall } from './stakingCall';
import {
  getOperationConfig,
  VoteMethodId,
  UnvoteMethodId,
  ActivateMethodId,
  UnlockMethodId,
  WithdrawMethodId,
} from './stakingUtils';

export class StakingBuilder {
  private readonly DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';
  private _amount: string;
  private _validatorGroup: string;
  private _lesser = this.DEFAULT_ADDRESS;
  private _greater = this.DEFAULT_ADDRESS;
  private _index: number;
  private _type: StakingOperationTypes;
  private _coinConfig: Readonly<CoinConfig>;

  constructor(coinConfig: Readonly<CoinConfig>, serializedData?: string) {
    this._coinConfig = coinConfig;
    if (serializedData) {
      this.decodeStakingData(serializedData);
    }
  }

  // region Staking properties

  type(type: StakingOperationTypes): this {
    this._type = type;
    return this;
  }

  amount(value: string): this {
    if (!isValidAmount(value)) {
      throw new InvalidParameterValueError('Invalid value for stake transaction');
    }
    this._amount = value;
    return this;
  }

  for(validatorGroup: string): this {
    if (!isValidEthAddress(validatorGroup)) {
      throw new InvalidParameterValueError('Invalid address to activate/vote for');
    }
    this._validatorGroup = validatorGroup;
    return this;
  }

  lesser(lesser: string): this {
    if (!isValidEthAddress(lesser)) {
      throw new InvalidParameterValueError('Invalid address for lesser');
    }
    this._lesser = lesser;
    return this;
  }

  greater(greater: string): this {
    if (!isValidEthAddress(greater)) {
      throw new InvalidParameterValueError('Invalid address for greater');
    }
    this._greater = greater;
    return this;
  }

  index(index: number): this {
    if (index < 0) {
      throw new InvalidParameterValueError('Invalid index for withdrawal');
    }
    this._index = index;
    return this;
  }

  // endregion

  // region Staking building

  build(): StakingCall {
    this.validateMandatoryFields();
    switch (this._type) {
      case StakingOperationTypes.LOCK:
        this.validateAmount();
        return this.buildLockStaking();
      case StakingOperationTypes.VOTE:
        this.validateElectionFields();
        return this.buildVoteStaking();
      case StakingOperationTypes.ACTIVATE:
        this.validateGroup();
        return this.buildActivateStaking();
      case StakingOperationTypes.UNVOTE:
        this.validateUnvoteFields();
        return this.buildUnvoteStaking();
      case StakingOperationTypes.UNLOCK:
        this.validateAmount();
        return this.buildUnlockStaking();
      case StakingOperationTypes.WITHDRAW:
        this.validateIndex();
        return this.buildWithdrawStaking();
      default:
        throw new InvalidTransactionError('Invalid staking operation: ' + this._type);
    }
  }

  // Locks gold to be used for voting /
  // Fails if `group` is empty or not a validator group.
  private buildLockStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    return new StakingCall(this._amount, operation.contractAddress, operation.methodId, operation.types, []);
  }

  // Unlocks gold that becomes withdrawable after the unlocking period.
  private buildUnlockStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    const params = [this._amount];
    return new StakingCall('0', operation.contractAddress, operation.methodId, operation.types, params);
  }

  // Increments the number of total and pending votes for `group`.
  private buildVoteStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    const params = [this._validatorGroup, this._amount, this._lesser, this._greater];
    return new StakingCall('0', operation.contractAddress, operation.methodId, operation.types, params);
  }

  // Revokes active votes for a  group `validator`
  // Fails if the account has not voted on a validator group.
  private buildUnvoteStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    const params = [this._validatorGroup, this._amount, this._lesser, this._greater, this._index.toString()];
    return new StakingCall('0', operation.contractAddress, operation.methodId, operation.types, params);
  }

  // Converts `account`'s pending votes for `group` to active votes.
  // Pending votes cannot be activated until an election has been held.
  private buildActivateStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    const params = [this._validatorGroup];
    return new StakingCall('0', operation.contractAddress, operation.methodId, operation.types, params);
  }

  // Withdraws gold that has been unlocked after the unlocking period has passed.
  private buildWithdrawStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    const params = [this._index.toString()];
    return new StakingCall('0', operation.contractAddress, operation.methodId, operation.types, params);
  }

  // endregion

  // region Validation methods

  private validateMandatoryFields(): void {
    if (!(this._type !== undefined && this._coinConfig)) {
      throw new BuildTransactionError('Missing staking mandatory fields. Type and coin are required');
    }
  }

  private validateElectionFields(): void {
    this.validateGroup();
    this.validateAmount();
    if (this._lesser === this._greater) {
      throw new BuildTransactionError('Greater and lesser values should not the same');
    }
  }

  private validateIndex(): void {
    if (this._index === undefined) {
      throw new BuildTransactionError('Missing index for staking transaction');
    }
  }

  private validateAmount(): void {
    if (this._amount === undefined) {
      throw new BuildTransactionError('Missing amount for staking transaction');
    }
  }

  private validateUnvoteFields(): void {
    this.validateElectionFields();
    this.validateIndex();
  }

  private validateGroup(): void {
    if (!this._validatorGroup) {
      throw new BuildTransactionError('Missing validator group for staking transaction');
    }
  }

  // endregion

  // region Deserialization methods
  private decodeStakingData(data: string): void {
    this.classifyStakingType(data);

    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    const decoded = getRawDecoded(operation.types, getBufferedByteCode(operation.methodId, data));
    switch (this._type) {
      case StakingOperationTypes.VOTE:
        if (decoded.length != 4) {
          throw new BuildTransactionError(`Invalid vote decoded data: ${data}`);
        }
        const [groupToVote, amount, lesser, greater] = decoded;
        this._amount = ethUtil.bufferToHex(amount);
        this._validatorGroup = ethUtil.bufferToHex(groupToVote);
        this._lesser = ethUtil.bufferToHex(lesser);
        this._greater = ethUtil.bufferToHex(greater);
        break;
      case StakingOperationTypes.UNVOTE:
        if (decoded.length != 5) {
          throw new BuildTransactionError(`Invalid unvote decoded data: ${data}`);
        }
        const [groupToUnvote, amountUnvote, lesserUnvote, greaterUnvote, indexUnvote] = decoded;
        this._validatorGroup = ethUtil.bufferToHex(groupToUnvote);
        this._amount = ethUtil.bufferToHex(amountUnvote);
        this._lesser = ethUtil.bufferToHex(lesserUnvote);
        this._greater = ethUtil.bufferToHex(greaterUnvote);
        this._index = hexStringToNumber(ethUtil.bufferToHex(indexUnvote));
        break;
      case StakingOperationTypes.ACTIVATE:
        if (decoded.length != 1) {
          throw new BuildTransactionError(`Invalid activate decoded data: ${data}`);
        }
        const [groupToActivate] = decoded;
        this._validatorGroup = ethUtil.bufferToHex(groupToActivate);
        break;
      case StakingOperationTypes.UNLOCK:
        if (decoded.length != 1) {
          throw new BuildTransactionError(`Invalid unlock decoded data: ${data}`);
        }
        const [decodedAmount] = decoded;
        this._amount = ethUtil.bufferToHex(decodedAmount);
        break;
      case StakingOperationTypes.WITHDRAW:
        if (decoded.length != 1) {
          throw new BuildTransactionError(`Invalid withdraw decoded data: ${data}`);
        }
        const [index] = decoded;
        this._index = hexStringToNumber(ethUtil.bufferToHex(index));
        break;
      default:
        throw new BuildTransactionError(`Not valid stacking operation : ${this._type}`);
    }
  }

  private classifyStakingType(data: string): void {
    if (data.startsWith(VoteMethodId)) {
      this._type = StakingOperationTypes.VOTE;
    } else if (data.startsWith(UnvoteMethodId)) {
      this._type = StakingOperationTypes.UNVOTE;
    } else if (data.startsWith(ActivateMethodId)) {
      this._type = StakingOperationTypes.ACTIVATE;
    } else if (data.startsWith(UnlockMethodId)) {
      this._type = StakingOperationTypes.UNLOCK;
    } else if (data.startsWith(WithdrawMethodId)) {
      this._type = StakingOperationTypes.WITHDRAW;
    } else {
      throw new BuildTransactionError(`Invalid staking bytecode: ${data}`);
    }
  }

  // endregion
}
