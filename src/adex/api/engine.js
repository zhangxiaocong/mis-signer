import to from 'await-to-js'
import TokenTest from '../../wallet/contract/TokenTest'
import walletHelper from '../../wallet/lib/walletHelper'
import mist_ex from '../../wallet/contract/mist_ex'
import mist_ex10 from '../../wallet/contract/mist_ex10'
import utils2 from './utils'
import NP from 'number-precision'

var date = require("silly-datetime");
import {mist_config} from '../index';


let walletInst;
async function getTestInst() {
	// 暂时每次都重新创建实例，效率低点但是应该更稳定。
	// if (walletInst) return walletInst;
	//relayer words
//	walletInst = await walletHelper.testWallet('ivory local this tooth occur glide wild wild few popular science horror', '111111')
//order hash有专门另外个账户打包
	walletInst = await walletHelper.testWallet(mist_config.order_hash_word, '111111')
	return walletInst
}


export default class engine {
	db;
	datas;
	constructor(client) {
		this.db = client;
		this.utils = new utils2;
	}


	async match(message) {
		let side = "buy";
		if (message.side == "buy") {
			side = "sell"
		}

		let filter = [message.price, side, message.market_id];

		let result = await this.db.filter_orders(filter);

		let match_orders = [];
		let amount = 0;
		//find and retunr。all orders。which's price below this order
		//下单量大于匹配的总额或者或者下单量小于匹配的总额，全部成交 
		console.log("gxy44444555----length", result.length);
		for (var i = 0; i < result.length; i++) {

			//返回的字面量用+处理成数值
			result[i].amount = +result[i].amount;
			result[i].available_amount = +result[i].available_amount;
			match_orders.push(result[i]);
			amount += result[i].available_amount;
			if (amount >= message.amount) {

				break;
			}

		}

		return match_orders;
	}

	async make_trades(find_orders, my_order) {
		//       var create_time = date.format(new Date(),'YYYY-MM-DD HH:mm:ss'); 
		let create_time = this.utils.get_current_time();
		let trade_arr = [];
		let amount = 0;
		for (var item = 0; item < find_orders.length; item++) {

			//partial_filled,pending,full_filled,默认吃单有剩余，挂单吃完
			let maker_status = 'full_filled';

			//最低价格的一单最后成交，成交数量按照吃单剩下的额度成交,并且更新最后一个order的可用余额fixme__gxy
			amount += find_orders[item].available_amount;


			//吃单全部成交,挂单有剩余的场景,
			if (item == find_orders.length - 1 && amount > my_order.amount) {


				console.log("gxyyy--available_amount-2222888889999-", find_orders[item].available_amount, my_order.amount,"amount=",amount);
				//find_orders[item].available_amount -= (amount - my_order.amount);
				let overflow_amount = NP.minus(amount, my_order.amount)
				find_orders[item].available_amount = NP.minus(find_orders[item].available_amount,overflow_amount)
				maker_status = 'partial_filled';
				console.log("gxyyy--available_amount-222288888-", find_orders[item].available_amount, my_order.amount,"amount=",amount);
			}

			console.log("gxyyy--available_amount-333-", find_orders[item].available_amount, my_order.amount);
			let trade = {
				id: null,
				transaction_id: null,
				transaction_hash: null,
				status: "matched", //匹配完成事matched，打包带确认pending，确认ok为successful，失败为failed
				market_id: my_order.market_id,
				maker: find_orders[item].trader_address,
				taker: my_order.trader_address,
				price: find_orders[item].price,
				amount: find_orders[item].available_amount,
				taker_side: find_orders[item].side,
				maker_order_id: find_orders[item].id,
				taker_order_id: my_order.id,
				created_at: create_time,
				updated_at: create_time
			};

			let trade_id = this.utils.get_hash(trade);
			trade.id = trade_id;
			//插入trades表_  fixme__gxy        
			trade_arr.push(trade);
			//匹配订单后，同时更新taker和maker的order信息,先不做错误处理,买单和卖单的计算逻辑是相同的,只需要更新available和pending
			//此更新逻辑适用于全部成交和部分成交的两种情况
			//available_amount,confirmed_amount,canceled_amount,pending_amount


			let update_maker_orders_info = [-find_orders[item].available_amount, 0, 0, find_orders[item].available_amount, maker_status, create_time, find_orders[item].id];
			//	  let update_taker_orders_info = [-find_orders[item].available_amount,0,0,find_orders[item].available_amount,taker_status,create_time,my_order.id];

			await this.db.update_orders(update_maker_orders_info);
			//	  await this.db.update_orders(update_taker_orders_info);
			//  await this.db.insert_trades(this.utils.arr_values(trade));

		}

		return trade_arr;

	}

	async call_asimov(trades) {
		let mist = new mist_ex10(mist_config.ex_address);
		walletInst = await getTestInst();

		console.log("dex_match_order----gxy---22", trades);
		let token_address = await this.db.get_market([trades[0].market_id]);
		console.log("dex_match_order----gxy---333333", token_address[0].base_token_address, token_address[0].quote_token_address);

		//这里合约逻辑写反了。参数顺序也故意写反，使整体没问题，等下次合约更新调整过来，fixme
		//let order_address_set = [token_address[0].base_token_address,token_address[0].quote_token_address,index.relayer];
		let order_address_set = [token_address[0].quote_token_address, token_address[0].base_token_address, mist_config.relayer];

		mist.unlock(walletInst, "111111");

		//结构体数组转换成二维数组,代币精度目前写死为7,18的会报错和合约类型u256不匹配
		let trades_hash = [];
		for (var i in trades) {
			let trade_info = [
				trades[i].taker,
				trades[i].maker,
				order_address_set[0],
				order_address_set[1],
				order_address_set[2],
				NP.times(trades[i].amount, trades[i].price, 100000000), //    uint256 baseTokenAmount;
				NP.times(trades[i].amount, 100000000), // quoteTokenAmount;
				//   10,  //    uint256 baseTokenAmount;
				//   5,  // quoteTokenAmount;
				trades[i].taker_side
			];


			//后边改合约传结构体数据
			trades_hash.push(trade_info);
		}

		let [err4, result4] = await to(walletInst.queryAllBalance());
		let [err33, trade_hash] = await to(mist.orderhash(trades_hash));
		console.log("gxy---engine-call_asimov_resul4444444 = -", trade_hash, err33);
		//刚打包的交易，要等一段时间才能拿到后期设置个合理时间暂时设置10s,
		setTimeout(async () => {

			let datas = this.utils.get_receipt(trade_hash);
			console.log("datas_resul5555 = -", datas);

/**			//目前仍有打包失败，双花的情况，在这里也用新的实例，再有失败的就使用队列去打包
			walletInst = await getTestInst();
		    mist.unlock(walletInst, "111111");
			let [err2, result] = await to(walletInst.queryAllBalance());
			let [err, txid] = await to(mist.matchorder(trades_hash, order_address_set, datas));
			console.log("gxy---engine-call_asimov_result33333 = -", txid, err);
**/
			//一次撮合的结果共享transaction_id，以mist_trades里的为准,每次id在最新生成的trades的transaction基础上+1
			let transactions = await this.db.list_all_trades();
			console.log("transactions=", transactions);
			let transaction_id = 0;

			if (transactions.length != 0) {
				transaction_id  = transactions[0].transaction_id;
			}

			for (var i in trades) {
				trades[i].transaction_id = transaction_id + 1;
				//用以太的hash去替代本地hash,这里下标的顺序和获得的合hash后的数据的顺序假设一致？
				trades[i].id = datas[i];
				await this.db.insert_trades(this.utils.arr_values(trades[i]));
			}
/**
			console.log("trades[i]=22222222222222", trades);
			let TXinfo = [id + 1, txid, trades[0].market_id, "pending", trades[0].created_at, trades[0].created_at];
			this.db.insert_transactions(TXinfo);
**/

		}, 10000);
		//	return txid;;
	}


}
