import should from 'should';
import { TransferBuilder } from '../../../../src/coin/eth';
import * as testData from '../../../resources/eth/eth';

describe('Eth send multi sig builder', function() {
  describe('shuld build', () => {
    const toAddress = '0x7325A3F7d4f9E86AE62Cf742426078C3755730d5';
    const key = '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C';
    const amount = '0.01';
    it('should succeed', async () => {
      const builder = new TransferBuilder()
        .data('0x')
        .expirationTime(1590078260)
        .amount(amount)
        .to(toAddress)
        .contractSequenceId(2)
        .key(key);
      const result = builder.signAndBuild();
      should.equal(result, testData.SEND_FOUNDS_DATA);
    });
    it('should fail if a key param is missing', () => {
      const builder = new TransferBuilder()
        .amount(amount)
        .to(toAddress)
        .contractSequenceId(2);
      should.throws(() => builder.signAndBuild());
    });
    it('should fail if a sequenceId param is missing', () => {
      const builder = new TransferBuilder()
        .amount(amount)
        .to(toAddress)
        .key(key);
      should.throws(() => builder.signAndBuild());
    });
    it('should fail if a destination param is missing', () => {
      const builder = new TransferBuilder()
        .amount(amount)
        .contractSequenceId(2)
        .key(key);
      should.throws(() => builder.signAndBuild());
    });
    it('should fail if a amount param is missing', () => {
      const builder = new TransferBuilder()
        .to(toAddress)
        .contractSequenceId(2)
        .key(key);
      should.throws(() => builder.signAndBuild());
    });
  });
});
