import client from '../models/db'
import utils2 from '../api/utils'
import order2 from '../api/order'
import { chain } from '../../wallet/api/chain'
import to from 'await-to-js'
const crypto = require('crypto');
var date = require("silly-datetime");

export default class watcher {
	db;
	exchange;
	root_hash;
	order;
	constructor() {
		this.db = new client();
		this.utils = new utils2;
		this.order = new order2;
	}

	async start() {
		this.loop()
	}


	async loop() {
	
		let transactions = await this.db.list_successful_transactions()
		
		let id = 0;
		if (transactions.length != 0) {
			id = transactions[0].id;
		}

		let id_arr = [id + 1];
		let transaction = await this.db.get_transaction(id_arr);

		//全部都是成功的,就睡眠1s
		if (transaction.length == 0) {
			console.log("have not pending transaction");
			setTimeout(()=>{
            this.loop.call(this)
        	}, 1000);

			return;
		}

			console.log("have n555555555555555555",id_arr);
		let [err, result] = await to(chain.getrawtransaction([transaction[0].transaction_hash, true, true]))

		//          console.log("chain.getrawtransaction",result,err);
		//检测txid失败之后，更新为failed就不再管了,暂定为8个区块确认
		//无论是失败还是成功，都会更新orders的confirm_amount,一个transaction确认成功，去更新一个taker和多个maker的order
		//多个进程同时走的话可能多次更新表信息，对于做了加减运算的地方，可能会导致出现负值
		let update_time = this.utils.get_current_time();
		if (!err && result.confirmations >= 8) {
			let status = 'successful';
			let info = [status, update_time, id + 1]
			await this.db.update_transactions(info);
			await this.db.update_trades(info);

			let trades = await this.db.transactions_trades([id+1]);
				console.log("have n666666666666666666",trades);			
			for(var index in trades){
				let update_maker_orders_info = [0,+trades[index].amount,0,-+trades[index].amount,update_time,trades[index].maker_order_id];
            	let update_taker_orders_info = [0,+trades[index].amount,0,-+trades[index].amount,update_time,trades[index].taker_order_id];
				await this.db.update_order_confirm(update_maker_orders_info);
                await this.db.update_order_confirm(update_taker_orders_info);
			}

		} else if (err) {
			let status = 'failed';
			let info = [status, update_time, id + 1]
			await this.db.update_transactions(info);
			await this.db.update_trades(info);

			let trades = await this.db.transactions_trades([id+1]);
				console.log("have n666666666666666666",trades);			
			//失败的交易更改可用数量和状态后重新放入交易池中
			for(var index in trades){
				this.order.restore_order(trades[index].taker_order_id,trades[index].amount,update_time);
				this.order.restore_order(trades[index].maker_order_id,trades[index].amount,update_time);
			}

			console.log("chain.getrawtransaction--err", err);
		} else {
			console.log("have n66666",id_arr);
			console.log("pending transaction", transaction[0].transaction_hash);
		}



		setTimeout(()=>{
			this.loop.call(this)
		}, 1000);

	}


}
