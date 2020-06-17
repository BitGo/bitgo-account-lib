import should from 'should';
import { coins } from '@bitgo/statics';
import { StakingBuilder } from '../../../../src/coin/cgld/stakingBuilder';
import { getOperationConfig } from '../../../../src/coin/cgld/stakingUtils';
import { StakingOperationTypes } from '../../../../src/coin/baseCoin';
import * as testData from '../../../resources/cgld/cgld';

describe('Celo staking operations builder', function() {
  const coin = coins.get('tcgld');
  let builder: StakingBuilder;
  beforeEach(() => {
    builder = new StakingBuilder(coin);
    builder.type(StakingOperationTypes.LOCK);
    builder.amount('1000');
  });

  const lockOperation = getOperationConfig(StakingOperationTypes.LOCK, coin.network.type);
  const unlockOperation = getOperationConfig(StakingOperationTypes.UNLOCK, coin.network.type);
  const withdrawOperation = getOperationConfig(StakingOperationTypes.WITHDRAW, coin.network.type);
  const voteOperation = getOperationConfig(StakingOperationTypes.VOTE, coin.network.type);
  const unvoteOperation = getOperationConfig(StakingOperationTypes.UNVOTE, coin.network.type);
  const activateOperation = getOperationConfig(StakingOperationTypes.ACTIVATE, coin.network.type);

  it('should build a staking lock operation', () => {
    const staking = builder.build();
    should.equal(staking.address, lockOperation.contractAddress);
    should.equal(staking.serialize(), lockOperation.methodId);
  });

  it('should build a staking unlock operation', () => {
    builder.type(StakingOperationTypes.UNLOCK);
    builder.amount('100');
    const staking = builder.build();
    should.equal(staking.address, unlockOperation.contractAddress);
    staking.serialize().should.startWith(unlockOperation.methodId);
    should.equal(staking.serialize(), testData.UNLOCK_DATA);
  });

  it('should build a staking withdraw operation', () => {
    builder.type(StakingOperationTypes.WITHDRAW);
    builder.index(0);
    const staking = builder.build();
    should.equal(staking.address, withdrawOperation.contractAddress);
    staking.serialize().should.startWith(withdrawOperation.methodId);
    should.equal(staking.serialize(), testData.WITHDRAW_DATA);
  });

  it('should fail if the index is invalid', () => {
    builder.type(StakingOperationTypes.WITHDRAW);
    should.throws(
      () => {
        builder.index(-1);
      },
      e => {
        return e.message === testData.INVALID_INDEX_ERROR;
      },
    );
  });

  it('should build a staking vote operation', () => {
    builder.type(StakingOperationTypes.VOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    const staking = builder.build();
    should.equal(staking.address, voteOperation.contractAddress);
    should.equal(
      staking.serialize(),
      '0x580d747a00000000000000000000000034084d6a4df32d9ad7395f4baad0db55c9c3814500000000000000000000000000000000000000000000000000000000000003e80000000000000000000000001e5f2141701f2698b910d442ec7adee2af96f852000000000000000000000000a34da18dccd65a80b428815f57dc2075466e270e',
    );
  });

  it('should build only setting the lesser', () => {
    builder.type(StakingOperationTypes.VOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    const staking = builder.build();
    should.equal(staking.address, voteOperation.contractAddress);
    should.equal(
      staking.serialize(),
      '0x580d747a00000000000000000000000034084d6a4df32d9ad7395f4baad0db55c9c3814500000000000000000000000000000000000000000000000000000000000003e80000000000000000000000001e5f2141701f2698b910d442ec7adee2af96f8520000000000000000000000000000000000000000000000000000000000000000',
    );
  });

  it('should build only setting the greater', () => {
    builder.type(StakingOperationTypes.VOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    const staking = builder.build();
    should.equal(staking.address, voteOperation.contractAddress);
    should.equal(
      staking.serialize(),
      '0x580d747a00000000000000000000000034084d6a4df32d9ad7395f4baad0db55c9c3814500000000000000000000000000000000000000000000000000000000000003e80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a34da18dccd65a80b428815f57dc2075466e270e',
    );
  });

  it('should build a staking unvote operation', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    builder.amount('1');
    builder.index(0);
    const staking = builder.build();
    should.equal(staking.address, unvoteOperation.contractAddress);
    should.equal(
      staking.serialize(),
      '0x6e19847500000000000000000000000034084d6a4df32d9ad7395f4baad0db55c9c3814500000000000000000000000000000000000000000000000000000000000000010000000000000000000000001e5f2141701f2698b910d442ec7adee2af96f852000000000000000000000000a34da18dccd65a80b428815f57dc2075466e270e0000000000000000000000000000000000000000000000000000000000000000',
    );
  });

  it('should fail if the unvote index is invalid', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    should.throws(
      () => {
        builder.index(-1);
      },
      e => {
        return e.message === testData.INVALID_INDEX_ERROR;
      },
    );
  });

  it(`should throw error when trying to build unvote operation with missing 'index' `, () => {
    builder.type(StakingOperationTypes.UNVOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    builder.amount('1');
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.MISSING_INDEX_ERROR;
      },
    );
  });

  it(`should throw error when trying to build unvote operation with missing 'group' `, () => {
    builder.type(StakingOperationTypes.UNVOTE);
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    builder.amount('1');
    builder.index(1);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.MISSING_GROUP_ERROR;
      },
    );
  });

  it(`should throw error when trying to build unvote operation with missing 'amount' `, () => {
    builder = new StakingBuilder(coin);
    builder.type(StakingOperationTypes.UNVOTE);
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    builder.index(1);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.MISSING_AMOUNT_ERROR;
      },
    );
  });

  it('should fail if the address to unvote for is not set', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.MISSING_GROUP_ERROR;
      },
    );
  });

  it('should fail if the lesser or greater unvote are not set', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.GREATER_LESSER_ERROR;
      },
    );
  });

  it('should fail if the group to unvote address is invalid', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    should.throws(
      () => {
        builder.group('invalidaddress');
      },
      e => {
        return e.message === testData.INVALID_GROUP_ERROR;
      },
    );
  });

  it('should fail if the lesser unvote address is invalid', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    should.throws(
      () => {
        builder.lesser('invalidaddress');
      },
      e => {
        return e.message === testData.INVALID_LESSER_ERROR;
      },
    );
  });

  it('should fail if the greater unvote address is invalid', () => {
    builder.type(StakingOperationTypes.UNVOTE);
    should.throws(
      () => {
        builder.greater('invalidaddress');
      },
      e => {
        return e.message === testData.INVALID_GREATER_ERROR;
      },
    );
  });

  it('should build a staking activate operation', () => {
    builder.type(StakingOperationTypes.ACTIVATE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    const staking = builder.build();
    should.equal(staking.address, activateOperation.contractAddress);
    should.equal(staking.serialize(), '0x1c5a9d9c00000000000000000000000034084d6a4df32d9ad7395f4baad0db55c9c38145');
  });

  it('should fail if the activate address is not set', () => {
    builder.type(StakingOperationTypes.ACTIVATE);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.MISSING_GROUP_ERROR;
      },
    );
  });

  it('should fail if the address to vote for is not set', () => {
    builder.type(StakingOperationTypes.VOTE);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.MISSING_GROUP_ERROR;
      },
    );
  });

  it('should fail if the lesser or greater are not set', () => {
    builder.type(StakingOperationTypes.VOTE);
    builder.group('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.GREATER_LESSER_ERROR;
      },
    );
  });

  it('should fail if the group to vote address is invalid', () => {
    builder.type(StakingOperationTypes.VOTE);
    should.throws(
      () => {
        builder.group('invalidaddress');
      },
      e => {
        return e.message === testData.INVALID_GROUP_ERROR;
      },
    );
  });

  it('should fail if the lesser address is invalid', () => {
    builder.type(StakingOperationTypes.VOTE);
    should.throws(
      () => {
        builder.lesser('invalidaddress');
      },
      e => {
        return e.message === testData.INVALID_LESSER_ERROR;
      },
    );
  });

  it('should fail if the greater address is invalid', () => {
    builder.type(StakingOperationTypes.VOTE);
    should.throws(
      () => {
        builder.greater('invalidaddress');
      },
      e => {
        return e.message === testData.INVALID_GREATER_ERROR;
      },
    );
  });

  it('should fail if amount is invalid number', () => {
    should.throws(
      () => {
        builder.amount('asd');
      },
      e => {
        return e.message === testData.INVALID_VALUE_ERROR;
      },
    );
  });

  it('should fail to build if type is not supported', function() {
    const NOT_SUPPORTED = 100;
    builder.type(NOT_SUPPORTED);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === testData.INVALID_OPERATION_100;
      },
    );
  });
});
