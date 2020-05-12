import should from 'should';
import { TransactionType } from '../../../../src/coin/baseCoin/';
import { getBuilder, Eth } from '../../../../src';
import * as testData from '../../../resources/eth/eth';
import { Transaction } from '../../../../src/coin/eth';
import { Fee } from '../../../../src/coin/eth/iface';

describe('Eth Transaction builder', function() {
  const sourcePrv =
    'xprv9s21ZrQH143K3D8TXfvAJgHVfTEeQNW5Ys9wZtnUZkqPzFzSjbEJrWC1vZ4GnXCvR7rQL2UFX3RSuYeU9MrERm1XBvACow7c36vnz5iYyj2';
  const pub1 =
    'xpub661MyMwAqRbcGpyL5QvWah4XZYHuTK21mSQ4NVwYaX67A35Kzb42nmTdf2WArW4tettXrWpfpwFbEFdEVqcSvnHLB8F6p1D41ssmbnRMXpc';
  const pub2 =
    'xpub661MyMwAqRbcFWzoz8qnYRDYEFQpPLYwxVFoG6WLy3ck5ZupRGJTG4ju6yGb7Dj3ey6GsC4kstLRER2nKzgjLtmxyPgC4zHy7kVhUt6yfGn';
  const defaultKeyPair = new Eth.KeyPair({
    prv: 'FAC4D04AA0025ECF200D74BC9B5E4616E4B8338B69B61362AAAD49F76E68EF28',
  });

  interface WalletCreationDetails {
    fee?: Fee;
    chainId?: number;
    counter?: number;
    source?: string;
    owners?: string[];
  }

  const buildWalletInitialization = async function(details: WalletCreationDetails): Promise<Transaction> {
    const txBuilder: any = getBuilder('eth');
    txBuilder.type(TransactionType.WalletInitialization);
    if (details.fee !== undefined) {
      txBuilder.fee(details.fee);
    }

    if (details.chainId !== undefined) {
      txBuilder.chainId(details.chainId);
    }

    if (details.source !== undefined) {
      txBuilder.source(details.source);
    }

    if (details.counter !== undefined) {
      txBuilder.counter(details.counter);
    }

    if (details.owners !== undefined) {
      for (const owner of details.owners) {
        txBuilder.owner(owner);
      }
    }

    return await txBuilder.build();
  };

  describe('should build', () => {
    it('a wallet initialization transaction', async () => {
      const tx = await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '1000',
        },
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
        counter: 1,
      });

      tx.type.should.equal(TransactionType.WalletInitialization);
      const txJson = tx.toJson();
      txJson.gasLimit.should.equal('0x3e8');
      txJson.gasPrice.should.equal('0xa');
      should.equal(txJson.nonce, 1);
      should.equal(txJson.chainId, 42);
    });

    it('a wallet initialization transaction with nonce 0', async () => {
      const tx = await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '1000',
        },
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
        counter: 0,
      });

      tx.type.should.equal(TransactionType.WalletInitialization);
      const txJson = tx.toJson();
      txJson.gasLimit.should.equal('0x3e8');
      txJson.gasPrice.should.equal('0xa');
      should.equal(txJson.nonce, 0);
      should.equal(txJson.chainId, 42);
    });
  });

  describe('should fail to build', () => {
    it('an unsupported type of transaction', async () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.AddressInitialization);
      await txBuilder.build().should.be.rejectedWith('Unsupported transaction type');
    });

    it('a wallet initialization without fee', async () => {
      await buildWalletInitialization({
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
        counter: 0,
      }).should.be.rejectedWith('Invalid transaction: missing fee');
    });

    it('a wallet initialization without chain id', async () => {
      await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '10',
        },
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
        counter: 0,
      }).should.be.rejectedWith('Invalid transaction: missing chain id');
    });

    it('a wallet initialization without source', async () => {
      await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '10',
        },
        chainId: 42,
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
        counter: 0,
      }).should.be.rejectedWith('Invalid transaction: missing source');
    });

    it('a wallet initialization the wrong number of owners', async () => {
      await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '10',
        },
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [new Eth.KeyPair({ pub: pub1 }).getAddress(), new Eth.KeyPair({ pub: pub2 }).getAddress()],
        counter: 0,
      }).should.be.rejectedWith('Invalid transaction: wrong number of owners -- required: 3, found: 2');

      await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '10',
        },
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
        counter: 0,
      }).should.be.rejectedWith('Repeated owner address: ' + new Eth.KeyPair({ pub: pub1 }).getAddress());

      await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '10',
        },
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        owners: [],
        counter: 0,
      }).should.be.rejectedWith('Invalid transaction: wrong number of owners -- required: 3, found: 0');
    });

    it('a wallet initialization with invalid counter', async () => {
      await buildWalletInitialization({
        fee: {
          fee: '10',
          gasLimit: '10',
        },
        chainId: 42,
        source: new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
        counter: -1,
        owners: [
          new Eth.KeyPair({ prv: sourcePrv }).getAddress(),
          new Eth.KeyPair({ pub: pub1 }).getAddress(),
          new Eth.KeyPair({ pub: pub2 }).getAddress(),
        ],
      }).should.be.rejectedWith('Invalid counter: -1');
    });
  });

  describe('should sign', () => {
    it('an init transaction', async () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      txBuilder.chainId(42);
      const source = {
        prv: 'FAC4D04AA0025ECF200D74BC9B5E4616E4B8338B69B61362AAAD49F76E68EF28',
      };
      const sourceKeyPair = new Eth.KeyPair(source);
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(1);
      txBuilder.owner('0x6461EC4E9dB87CFE2aeEc7d9b02Aa264edFbf41f');
      txBuilder.owner('0xf10C8f42BD63D0AeD3338A6B2b661BC6D9fa7C44');
      txBuilder.owner('0xa4b5666FB4fFEA84Dd848845E1114b84146de4b3');
      txBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const tx = await txBuilder.build(); //shoud build and sign

      tx.type.should.equal(TransactionType.WalletInitialization);
      const txJson = tx.toJson();
      txJson.gasLimit.should.equal('0x3e8');
      txJson.gasPrice.should.equal('0xa');
      should.equal(txJson.nonce, 1);
      should.equal(txJson.chainId, 42);
      should.equal(tx.toBroadcastFormat(), testData.TX_BROADCAST);
    });
  });

  describe('should fail to sign', () => {
    it('a transaction without owners', () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      txBuilder.chainId(31);
      const source = {
        prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
      };
      const sourceKeyPair = new Eth.KeyPair(source);
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(1);
      should.throws(() => txBuilder.sign({ key: defaultKeyPair.getKeys().prv }));
    });

    it('a signed transaction', () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      txBuilder.chainId(31);
      const source = {
        prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
      };
      const sourceKeyPair = new Eth.KeyPair(source);
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(1);
      txBuilder.owner(new Eth.KeyPair({ pub: pub1 }).getAddress());
      txBuilder.owner(new Eth.KeyPair({ pub: pub2 }).getAddress());
      txBuilder.owner(new Eth.KeyPair({ prv: sourcePrv }).getAddress());
      txBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      should.throws(
        () => txBuilder.sign({ key: defaultKeyPair.getKeys().prv }),
        'Cannot sign multiple times a non send-type transaction',
      );
    });
  });

  describe('should validate', () => {
    it('an address', async () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.validateAddress(testData.VALID_ADDRESS);
      should.throws(() => txBuilder.validateAddress(testData.INVALID_ADDRESS));
    });

    it('value should be greater than zero', () => {
      const txBuilder: any = getBuilder('eth');
      should.throws(() => txBuilder.fee({ fee: '-10' }));
      should.doesNotThrow(() => txBuilder.fee({ fee: '10' }));
    });

    it('a private key', () => {
      const txBuilder: any = getBuilder('eth');
      should.throws(() => txBuilder.validateKey({ key: 'abc' }), 'Invalid key');
      should.throws(() => txBuilder.validateKey({ key: testData.PUBLIC_KEY }), 'Invalid key');
      should.doesNotThrow(() => txBuilder.validateKey({ key: testData.PRIVATE_KEY }));
    });

    it('a raw transaction', async () => {
      const builder: any = getBuilder('eth');
      should.doesNotThrow(() => builder.from(testData.TX_BROADCAST));
      should.doesNotThrow(() => builder.from(testData.TX_JSON));
      should.throws(() => builder.from('0x00001000'), 'There was error in decoding the hex string');
      should.throws(() => builder.from(''), 'There was error in decoding the hex string');
      should.throws(() => builder.from('pqrs'), 'There was error in parsing the JSON string');
      should.throws(() => builder.from(1234), 'Transaction is not a hex string or stringified json');
    });

    it('a transaction to build', async () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      txBuilder.chainId(31);
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      const source = {
        prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
      };
      const sourceKeyPair = new Eth.KeyPair(source);
      txBuilder.source(sourceKeyPair.getAddress());
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      txBuilder.counter(1);
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      txBuilder.owner(sourceKeyPair.getAddress());
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      txBuilder.owner(new Eth.KeyPair({ pub: pub1 }).getAddress());
      should.throws(() => txBuilder.validateTransaction(), 'Invalid transaction');
      txBuilder.owner(new Eth.KeyPair({ pub: pub2 }).getAddress());
      should.doesNotThrow(() => txBuilder.validateTransaction());
    });
  });

  describe('set owner', () => {
    it('should be wallet initializaion', () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.Send);
      const sourceKeyPair = new Eth.KeyPair({ prv: sourcePrv });
      should.throws(
        () => txBuilder.owner(sourceKeyPair.getAddress()),
        'Multisig wallet owner can only be set for initialization transactions',
      );
    });

    it('should be only 3 owners', () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      txBuilder.chainId(31);
      const sourceKeyPair = new Eth.KeyPair({ prv: sourcePrv });
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(1);
      txBuilder.owner(sourceKeyPair.getAddress());
      txBuilder.owner('0x7325A3F7d4f9E86AE62Cf742426078C3755730d5');
      txBuilder.owner('0x603e077acd3F01e81b95fB92ce42FF60dFf3D4C7');
      should.throws(
        () => txBuilder.owner('0x1A88Ee4Bc80BE080fC91AC472Af2F59260695060'),
        'A maximum of 3 owners can be set for a multisig wallet',
      );
    });

    it('should be a valid address', () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      txBuilder.chainId(31);
      const sourceKeyPair = new Eth.KeyPair({ prv: sourcePrv });
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(1);
      should.throws(() => txBuilder.owner('0x7325A3F7d4f9E86AE62C'), 'Invalid address');
    });

    it('should be different 3 owners', () => {
      const txBuilder: any = getBuilder('eth');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '10',
        gasLimit: '1000',
      });
      txBuilder.chainId(31);
      const sourceKeyPair = new Eth.KeyPair({ prv: sourcePrv });
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(1);
      txBuilder.owner(sourceKeyPair.getAddress());
      txBuilder.owner('0x603e077acd3F01e81b95fB92ce42FF60dFf3D4C7');
      should.throws(
        () => txBuilder.owner('0x603e077acd3F01e81b95fB92ce42FF60dFf3D4C7'),
        'Repeated owner address: 0x603e077acd3F01e81b95fB92ce42FF60dFf3D4C7',
      );
    });
  });
});
