import client from '../adex/models/db'
import utils2 from '../adex/api/utils'

import { chain } from '../wallet/api/chain'
import to from 'await-to-js'

import NP from 'number-precision'

class watcher {

	constructor() {

		this.db = new client;
		this.utils = new utils2;
		this.block_height = 0;
		this.start();
	}

	async start() {
		this.loop()
	}


	async loop() {

		let [bestblock_err, bestblock_result] = await to(chain.getbestblock());
		if (bestblock_err || bestblock_result.height == this.block_height) {
			console.log(`--------current height is ${bestblock_result.height} and last is ${this.block_height}-----err=%o-----`,bestblock_err);
			setTimeout(() => {
				this.loop.call(this)
			}, 500);
			return
		}

		this.block_height = bestblock_result.height;

		let transaction = await this.db.get_pending_transactions()
		//全部都是成功的,就睡眠1s
		if (!transaction || transaction.length == 0) {
			console.log("[ADEX WATCHER]:no pending transaction");
			setTimeout(() => {
				this.loop.call(this)
			}, 1000);
			return;
		}
		let id = transaction[0].id;

		let [err, result] = await to(chain.getrawtransaction([transaction[0].transaction_hash, true, true], 'child_poa'))

		let update_time = this.utils.get_current_time();
		if (!err && result.confirmations >= 1) {
			let status = 'successful';
			let [get_receipt_err, contract_status] = await to(this.utils.get_receipt_log(transaction[0].transaction_hash));
			if (get_receipt_err) {
				console.error(`get_receipt_err--${get_receipt_err}`);
				this.loop.call(this)
				return;
			}
			let info = [status, update_time, id]
			let transaction_info = [status, contract_status, update_time, id]
			await this.db.update_transactions(transaction_info);
			await this.db.update_trades(info);

			let trades = await this.db.transactions_trades([id]);
			let updates = [];
			for (var index in trades) {

				let trade_amount = +trades[index].amount;

				let index_taker;
				var taker_ar = updates.find(function (elem, index_tmp) {
					index_taker = index_tmp;

					return elem.info[3] == trades[index].taker_order_id;
				});

				let index_maker;
				var maker_ar = updates.find(function (elem, index_tmp) {
					index_maker = index_tmp;
					return elem.info[3] == trades[index].maker_order_id;
				});

				if (!taker_ar) {

					let update_taker = {
						info: [+trade_amount, -trade_amount, update_time, trades[index].taker_order_id]
					}
					updates.push(update_taker);
				} else {

					updates[index_taker].info[0] = NP.plus(updates[index_taker].info[0], trade_amount);
					updates[index_taker].info[1] = NP.minus(updates[index_taker].info[1], trade_amount);
				}


				if (!maker_ar) {
					let update_maker = {
						info: [+trade_amount, -trade_amount, update_time, trades[index].maker_order_id]
					}
					updates.push(update_maker);
				} else {
					updates[index_maker].info[0] = NP.plus(updates[index_maker].info[0], trade_amount);
					updates[index_maker].info[1] = NP.minus(updates[index_maker].info[1], trade_amount);
				}
			}

			await this.db.update_order_confirm(updates);

		} else if (err) {
			/**
			let status = 'failed';
			let info = [status, update_time, id]
			await this.db.update_transactions(info);
			await this.db.update_trades(info);

			let trades = await this.db.transactions_trades([id]);
			//失败的交易更改可用数量和状态后重新放入交易池中
			for(var index in trades){
				restore_order(trades[index].taker_order_id,trades[index].amount);
				restore_order(trades[index].maker_order_id,trades[index].amount);
			console.log("chain.getrawtransaction-------restore_order--err",trades[index]);
			}**/
			//失败了订单状态重新改为matched，等待下次打包,此failed为中间状态
			await this.db.update_transactions(["failed", undefined, update_time, id]);
			//			await this.db.update_trades(["matched", update_time, id]);

			console.error("Err", err);
		} else {
			console.log("[Watcher Pending]", transaction[0].transaction_hash);
		}

		this.loop.call(this)
	}
}
export default new watcher();
