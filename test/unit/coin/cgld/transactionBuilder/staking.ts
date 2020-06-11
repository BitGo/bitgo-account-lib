import should from 'should';
import { coins } from '@bitgo/statics';
import { Cgld, getBuilder } from '../../../../../src';
import { StakingOperationTypes, TransactionType } from '../../../../../src/coin/baseCoin';
import * as testData from '../../../../resources/cgld/cgld';
import { getOperationConfig } from '../../../../../src/coin/cgld/stakingUtils';

describe('Celo staking transaction builder', () => {
  let txBuilder;
  beforeEach(() => {
    txBuilder = getBuilder('tcgld') as Cgld.TransactionBuilder;
    txBuilder.type(TransactionType.StakingLock);
    txBuilder.fee({
      fee: '1000000000',
      gasLimit: '12100000',
    });
    txBuilder.chainId(44786);
    txBuilder.source(testData.KEYPAIR_PRV.getAddress());
    txBuilder.counter(1);
  });

  const coin = coins.get('tcgld');
  const LockOperation = getOperationConfig(StakingOperationTypes.LOCK, coin.network.type);
  const UnlockOperation = getOperationConfig(StakingOperationTypes.UNLOCK, coin.network.type);
  const WithdrawOperation = getOperationConfig(StakingOperationTypes.WITHDRAW, coin.network.type);
  const VoteOperation = getOperationConfig(StakingOperationTypes.VOTE, coin.network.type);
  const ActivateOperation = getOperationConfig(StakingOperationTypes.ACTIVATE, coin.network.type);
  describe('lock', () => {
    it('should build a lock transaction', async function() {
      txBuilder
        .lock()
        .type(StakingOperationTypes.LOCK)
        .amount('100');
      const txJson = (await txBuilder.build()).toJson();
      should.equal(txJson.to, LockOperation.contractAddress);
      txJson.data.should.startWith(LockOperation.methodId);
      should.equal(txJson.data, LockOperation.methodId);
    });

    it('should sign and build a lock transaction from serialized', async function() {
      const builder = getBuilder('tcgld') as Cgld.TransactionBuilder;
      builder.from('0xed01843b9aca0083b8a1a08080809494c3e6675015d8479b648657e7ddfcd938489d0d6484f83d08ba82aef28080');
      builder.source(testData.KEYPAIR_PRV.getAddress());
      builder.sign({ key: testData.PRIVATE_KEY });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, LockOperation.contractAddress);
      txJson.data.should.startWith(LockOperation.methodId);
      should.equal(txJson.data, LockOperation.methodId);
      should.equal(txJson.from, testData.ACCOUNT1);
      should.equal(tx.toBroadcastFormat(), testData.LOCK_BROADCAST_TX);
    });
  });

  describe('vote', () => {
    it('should build a vote transaction', async function() {
      txBuilder.type(TransactionType.StakingVote);
      txBuilder
        .vote()
        .for('0x34084d6a4df32d9ad7395f4baad0db55c9c38145')
        .lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852')
        .greater('0xa34da18dccd65a80b428815f57dc2075466e270e')
        .amount('100');
      txBuilder.sign({ key: testData.PRIVATE_KEY });
      const txJson = (await txBuilder.build()).toJson();
      should.equal(txJson.to, VoteOperation.contractAddress);
      txJson.data.should.startWith(testData.VOTE_DATA);
      should.equal(txJson.data, testData.VOTE_DATA);
    });

    it('should sign and build a vote transaction from serialized', async function() {
      const builder = getBuilder('tcgld') as Cgld.TransactionBuilder;
      builder.from(testData.VOTE_BROADCAST_TX);
      builder.source(testData.KEYPAIR_PRV.getAddress());
      builder.sign({ key: testData.PRIVATE_KEY });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, VoteOperation.contractAddress);
      should.equal(txJson.data, testData.VOTE_DATA);
      should.equal(txJson.from, testData.ACCOUNT1);
      should.equal(tx.toBroadcastFormat(), testData.VOTE_BROADCAST_TX);
    });
  });

  describe('activate', () => {
    it('should build an activate transaction', async function() {
      txBuilder.type(TransactionType.StakingActivate);
      txBuilder.activate().for('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
      txBuilder.sign({ key: testData.PRIVATE_KEY });
      const tx = await txBuilder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, ActivateOperation.contractAddress);
      txJson.data.should.startWith(testData.ACTIVATE_DATA);
      should.equal(txJson.data, testData.ACTIVATE_DATA);
      should.equal(tx.toBroadcastFormat(), testData.ACTIVATE_BROADCAST_TX);
    });

    it('should sign and build an activate transaction from serialized', async function() {
      const builder = getBuilder('tcgld') as Cgld.TransactionBuilder;
      builder.from(testData.ACTIVATE_BROADCAST_TX);
      builder.source(testData.KEYPAIR_PRV.getAddress());
      builder.sign({ key: testData.PRIVATE_KEY });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, ActivateOperation.contractAddress);
      should.equal(txJson.data, testData.ACTIVATE_DATA);
      should.equal(txJson.from, testData.ACCOUNT1);
      should.equal(tx.toBroadcastFormat(), testData.ACTIVATE_BROADCAST_TX);
    });
  });

  describe('unvote', () => {
    //TODO: Add tests
  });

  describe('unlock', () => {
    it('should build an unlock transaction', async function() {
      txBuilder.type(TransactionType.StakingUnlock);
      txBuilder
        .unlock()
        .amount('100')
        .type(StakingOperationTypes.UNLOCK);
      const txJson = (await txBuilder.build()).toJson();
      should.equal(txJson.to, UnlockOperation.contractAddress);
      txJson.data.should.startWith(UnlockOperation.methodId);
      should.equal(txJson.data, testData.UNLOCK_DATA);
    });

    it('should sign and build an unlock transaction from serialized', async function() {
      const builder = getBuilder('tcgld') as Cgld.TransactionBuilder;
      builder.type(TransactionType.StakingLock);
      builder.from(testData.UNLOCK_BROADCAST_TX);
      builder.source(testData.KEYPAIR_PRV.getAddress());
      builder.sign({ key: testData.PRIVATE_KEY });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, UnlockOperation.contractAddress);
      txJson.data.should.startWith(UnlockOperation.methodId); // TODO : should.equal(txJson.data, UnlockOperation.methodId)
      should.equal(txJson.data, testData.UNLOCK_DATA);
      should.equal(txJson.from, testData.ACCOUNT1);
      should.equal(tx.toBroadcastFormat(), testData.UNLOCK_BROADCAST_TX);
    });
  });

  describe('withdraw', () => {
    it('should build a withdraw transaction', async function() {
      txBuilder.type(TransactionType.StakingWithdraw);
      txBuilder
        .withdraw()
        .index(0)
        .type(StakingOperationTypes.WITHDRAW);
      txBuilder.sign({ key: testData.PRIVATE_KEY });
      const tx = await txBuilder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, WithdrawOperation.contractAddress);
      txJson.data.should.startWith(WithdrawOperation.methodId);
      should.equal(txJson.data, testData.WITHDRAW_DATA);
      should.equal(tx.toBroadcastFormat(), testData.WITHDRAW_BROADCAST_TX);
    });

    it('should sign and build a withdraw transaction from serialized', async function() {
      const builder = getBuilder('tcgld') as Cgld.TransactionBuilder;
      builder.type(TransactionType.StakingWithdraw);
      builder.from(testData.WITHDRAW_BROADCAST_TX);
      builder.source(testData.KEYPAIR_PRV.getAddress());
      builder.sign({ key: testData.PRIVATE_KEY });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.equal(txJson.to, WithdrawOperation.contractAddress);
      txJson.data.should.startWith(WithdrawOperation.methodId);
      should.equal(txJson.from, testData.ACCOUNT1);
      should.equal(tx.toBroadcastFormat(), testData.WITHDRAW_BROADCAST_TX);
    });
  });

  describe('type validation', () => {
    it('should fail to call lock if it is not an staking lock type transaction', () => {
      txBuilder.type(TransactionType.AddressInitialization);
      should.throws(
        () => {
          txBuilder.lock();
        },
        e => {
          return e.message === 'Lock can only be set for Staking Lock transactions type';
        },
      );
    });

    it('should fail to call vote if it is not an staking vote type transaction', () => {
      txBuilder.type(TransactionType.AddressInitialization);
      should.throws(
        () => {
          txBuilder.vote();
        },
        e => {
          return e.message === 'Votes can only be set for a staking transaction';
        },
      );
    });

    it('should fail to call activate if it is not an staking activate type transaction', () => {
      txBuilder.type(TransactionType.AddressInitialization);
      should.throws(
        () => {
          txBuilder.activate();
        },
        e => {
          return e.message === 'Activation can only be set for a staking transaction';
        },
      );
    });

    it('should fail to call unlock if it is not an staking unlock type transaction', () => {
      txBuilder.type(TransactionType.AddressInitialization);
      should.throws(
        () => {
          txBuilder.unlock();
        },
        e => {
          return e.message === 'Unlock can only be set for Staking Unlock transactions type';
        },
      );
    });

    it('should fail to call withdraw if it is not an staking withdraw type transaction', () => {
      txBuilder.type(TransactionType.AddressInitialization);
      should.throws(
        () => {
          txBuilder.withdraw();
        },
        e => {
          return e.message === 'Withdraw can only be set for a staking transaction';
        },
      );
    });

    it('should fail to build and staking lock operation if operationBuilder is not set', async () => {
      await txBuilder.build().should.be.rejectedWith('No staking information set');
    });
  });
});
