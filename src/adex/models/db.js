import to from 'await-to-js'

export default class db{
        clientDB;
        constructor() {
                const pg=require('pg')
                        var conString = "postgres://postgres:postgres@127.0.0.1/postgres?sslmode=disable";
                let client = new pg.Client(conString);
                client.connect(function(err) {
                                if(err) {
                                return console.error('连接postgreSQL数据库失败', err);
                                }   
                                });
                this.clientDB  = client;
        }

        /**
         *orders
         *
         *
         *
         *
         *
		 */
		async insert_order(ordermessage) {

			let [err,result] = await to(this.clientDB.query('insert into mist_orders values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',ordermessage));
			if(err) {
				return console.error('insert_order_查询失败', err);
			}
			console.log('insert_order_成功',JSON.stringify(result.rows)); 
			return JSON.stringify(result.rows);
		}

		async list_orders() {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_orders order by create_at desc limit 30')); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 

		async my_orders(address) {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_orders where trader_address=$1 order by created_at desc limit 30',address)); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 



		async filter_orders(filter) {

			let err;
			let result;
			if(filter[1] == 'sell'){
				[err,result] = await to(this.clientDB.query('SELECT * FROM mist_orders where price<=$1 and side=$2 and available_amount>0 and market_id=$3 order by price asc',filter)); 
			}else{
				
				[err,result] = await to(this.clientDB.query('SELECT * FROM mist_orders where price>=$1 and side=$2 and available_amount>0 and market_id=$3 order by price desc',filter)); 
			}
			if(err) {
				return console.error('insert_order_查询失败11', err);
			}
			console.log('insert_order',JSON.stringify(result.rows)); 
			return result.rows;

		} 

		
        async update_orders(update_info) {
			let [err,result] = await to(this.clientDB
				.query('UPDATE mist_orders SET (available_amount,confirmed_amount,canceled_amount,\
				pending_amount,status,updated_at)=(available_amount+$1,confirmed_amount+$2,canceled_amount+$3,pending_amount+$4,$5,$6) WHERE id=$7',update_info)); 

			if(err) {
				return console.error('update_order_查询失败', err);
			}
			console.log('update_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        } 


        async order_book(filter_info) {
			let [err,result] = await to(this.clientDB.query('select s.* from  (SELECT price,sum(amount) as amount FROM mist_orders\
			where available_amount>0  and side=$1 and market_id=$2 group by price)s order by s.price desc limit 100',filter_info)); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;
        }

        /*
         *tokens
         *
         * */
        async list_tokens(tradeid) {
			let [err,result] = await to(this.clientDB.query('select * from mist_tokens')); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        }

	  async get_tokens(symbol) {
			let [err,result] = await to(this.clientDB.query('select * from mist_tokens where symbol=$1',symbol)); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        }




         /*
         *makkets
         *
         * */
        async list_markets() {
			let [err,result] = await to(this.clientDB.query('select * from mist_markets')); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        }

		async get_market(marketID) {
			let [err,result] = await to(this.clientDB.query('select * from mist_markets where id=$1',marketID)); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        }


		async get_market_quotations(marketID) {

            let [err,result] = await to(this.clientDB.query('select s.market_id,s.price as current_price,t.price as old_price,(s.price-t.price)/t.price as ratio from (select * from mist_trades where market_id=$1 order by created_at desc limit 1)s left join (select * from mist_trades where market_id=$1 and (current_timestamp - created_at) > \'24 hours\' order by created_at desc limit 1)t on s.market_id=t.market_id',marketID));
            if(err) {
                return console.error('get_market_quotations_查询失败', err);
            }

            console.log('get_market_quotations_成功',JSON.stringify(result.rows));
            return result.rows;

        }


        /*
         *
         *
         *trades
         */
        async insert_trades(trade_info) {
			let [err,result] = await to(this.clientDB.query('insert into mist_trades values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',trade_info));
			if(err) {
				return console.error('insert_traders_查询失败', err);
			}
			console.log('insert_order_成功',JSON.stringify(result.rows)); 
			return JSON.stringify(result.rows);


        } 

		async list_trades(marketID) {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_trades where market_id=$1 order by created_at desc limit 30',marketID)); 
			if(err) {
				return console.error('list_trades_查询失败', err);
			}
			console.log('list_trades_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 

		async my_trades(address) {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_trades where taker=$1 or maker=$1 order by created_at desc limit 30',address)); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 

		async sort_trades(message,sort_by) {
			let sql = 'SELECT * FROM mist_trades where market_id=$1  and created_at>=$2 and  created_at<=$3 order by ' + sort_by + ' desc limit 30';		
			let [err,result] = await to(this.clientDB.query(sql,message)); 
			if(err) {
				return console.error('list_order_查询失败', err);
			}
			console.log('list_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 


        async update_trades(update_info) {
			let [err,result] = await to(this.clientDB
				.query('UPDATE mist_trades SET (status,updated_at)=($1,$2) WHERE  transaction_id=$3',update_info)); 

			if(err) {
				return console.error('update_order_查询失败', err);
			}
			console.log('update_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        } 


         /**
         *lauchers
         *
         *
         * */
          async insert_trade(trademessage) {


        } 

         /**
         *transactions
         *
         *
         * */
        async insert_transactions(TXinfo) {
			let [err,result] = await to(this.clientDB.query('insert into mist_transactions values($1,$2,$3,$4,$5,$6)',TXinfo));
			if(err) {
				return console.error('insert_transactions_查询失败', err);
			}
			console.log('insert_transactions_成功',JSON.stringify(result.rows)); 
			return JSON.stringify(result.rows);
        } 

		async list_transactions() {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_transactions  order by id desc limit 30')); 
			if(err) {
				return console.error('list_transactions_查询失败', err);
			}
//			console.log('list_transactions_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 

		async list_successful_transactions() {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_transactions where status !=\'pending\' order by id desc limit 30')); 
			if(err) {
				return console.error('list_successful_transactions_查询失败', err);
			}
//			console.log('list_successful_transactions_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 

		async get_transaction(id) {
			let [err,result] = await to(this.clientDB.query('SELECT * FROM mist_transactions where id=$1',id)); 
			if(err) {
				return console.error('get_transaction_查询失败', err);
			}
			console.log('get_transaction_成功',JSON.stringify(result.rows)); 
			return result.rows;

		} 
	
        async update_transactions(update_info) {
			let [err,result] = await to(this.clientDB
				.query('UPDATE mist_transactions SET (status,updated_at)=($1,$2) WHERE  id=$3',update_info)); 

			if(err) {
				return console.error('update_order_查询失败', err);
			}
			console.log('update_order_成功',JSON.stringify(result.rows)); 
			return result.rows;

        } 
}
