import { AsimovWallet, AsimovConst } from '@fingo/asimov-wallet';
import * as util from 'ethereumjs-util';
import AdexUtils from '../adex/api/utils';

export default class Exchange {
  constructor(
    private address:string,
    private wallet:AsimovWallet,
    ){
  }

  async matchorder(trades_info) {
    const utils = new AdexUtils();
    const trades_arr = [];

    // TODO: remove relayer sign next version
    for (const index in trades_info) {
      if (!trades_info[index]) {
        continue;
      }
      const hashbuf = Buffer.alloc(
        32,
        trades_info[index].trade_hash.slice(2, 66),
        'hex'
      );
      const sign = util.ecsign(hashbuf, util.toBuffer(this.wallet.pk));
      trades_info[index].v = sign.v.toString();
      trades_info[index].r = '0x' + sign.r.toString('hex');
      trades_info[index].s = '0x' + sign.s.toString('hex');
      delete trades_info[index].trade_hash;

      const trade_arr = utils.arr_values(trades_info[index]);
      trades_arr.push(trade_arr);
    }

    /**
     const abiInfo = {
      constant: false,
      inputs: [
        {
          components: [
            { name: 'taker', type: 'address' },
            { name: 'maker', type: 'address' },
            { name: 'baseToken', type: 'address' },
            { name: 'quoteToken', type: 'address' },
            { name: 'relayer', type: 'address' },
            { name: 'baseTokenAmount', type: 'uint256' },
            { name: 'quoteTokenAmount', type: 'uint256' },
            { name: 'r', type: 'bytes32' },
            { name: 's', type: 'bytes32' },
            { name: 'takerSide', type: 'string' },
            { name: 'v', type: 'uint8' },
          ],
          name: '_trader',
          type: 'tuple[]',
          value: trades_arr,
        },
      ],
      name: 'matchorder',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    };
     */

    return await this.wallet.contractCall.call(
      this.address,
      'matchorder(tuple[])',
      [trades_arr],
      1000000 * 40,
      0,
      AsimovConst.DEFAULT_ASSET_ID,
      AsimovConst.DEFAULT_FEE_AMOUNT * 100,
      AsimovConst.DEFAULT_ASSET_ID,
      AsimovConst.CONTRACT_TYPE.CALL
    );
  }
}
