import { Router } from 'express'
import { chain } from './api/chain'
import { walletRPC } from './api/wallet'
import walletHelper from './lib/walletHelper'
import to from 'await-to-js'
import StandardToken from './contract/Token'
import TokenTest from './contract/TokenTest'
import AssetTest from './asset/AssetTest'
import Asset from './asset/Asset'
import { CONSTANT } from "./constant";
import Token from '../wallet/contract/Token'

import Erc20 from './contract/ERC20'
import fake_token from './contract/AssetToken'
import Erc20Test from './contract/ERC20Test'
//import {mist_config} from '../adex/index';
import mist_config from '../cfg'

import mist10 from './contract/mist_ex10'
import cdp from './contract/cdp'
import adex_utils from '../adex/api/utils'
import psql from '../adex/models/db'
import mist_wallet1 from '../adex/api/mist_wallet'
import NP from 'number-precision'
import users from '../adex/cli/users'
//import { btc_start,eth_start,asim_asset_start} from "../deposit";

var spawn = require('child_process').spawn;

let taker = '0x6632bd37c1331b34359920f1eaa18a38ba9ff203e9';
let taker_word = 'enhance donor garment gospel loop purse pumpkin bag oven bone decide street';
let taker_wallet;
let cdp_address = '0x6367f3c53e65cce5769166619aa15e7da5acf9623d';

// 避免重复创建Taker Wallet Instance
async function getTakerWallet() {
	if( taker_wallet ) return taker_wallet;
	taker_wallet = await walletHelper.testWallet(taker_word,'111111')
	return taker_wallet
}

async function getTestInst2(word) {
    // 暂时每次都重新创建实例，效率低点但是应该更稳定。
    walletInst = await walletHelper.testWallet(word, '111111')
    return walletInst
}

let walletInst;
async function getTestInst(){
//chenfei
//	walletInst = await walletHelper.testWallet('wonder snap ripple scare salon luxury best narrow daring hen brief pet','111111')
//xuweiwei
//	walletInst = await walletHelper.testWallet('disagree topic plastic edit empty inside net mushroom aim video radar element','111111')
//test---mint给了10亿到账账户报废
//	walletInst = await walletHelper.testWallet('wing safe foster choose wisdom myth quality own gallery logic imitate pink','111111')
	walletInst = await walletHelper.testWallet(mist_config.fauct_word,'111111')
	return walletInst
}
//PI,ASIM,BTC.USDT,ETH,MT
let faucet_amount = [6000,100,0.1,1000,5,1000]

export default ({ config, db }) => {
	let wallet = Router();
	let tokenTest = new TokenTest()
	let assetTest = new AssetTest()
	let psql_db = new psql();
	let utils = new adex_utils();
	let mist_wallet = new mist_wallet1();

	wallet.get('/', async (req, res) => {
		walletInst = await getTestInst();
		let address = await walletInst.getAddress()
		res.json({ wallet:address })
	});

	wallet.get('/dex_test', async (req, res) => {
		//BTC-PI

   let trades = [ 
    { id:
     '610a38f9ec6c569813a48a0edeef9999e351db4d152389fd6a60f58a5b8112ac',
    trade_hash: null,
    maker: '0x66bb0fb407455e22ad2ea7d90db2b0fc41c4540675',
    taker: '0x6634d87c23decda47cbc3114863f01925dfef160a4',
    price: 1.0000,
    amount: 0.0001,
    taker_side: 'sell'},
    { id:
     '610a38f9ec6c569813a48a0edeef9999e351db4d152389fd6a60f58a5b8112ac',
    trade_hash: null,
    maker: '0x66bb0fb407455e22ad2ea7d90db2b0fc41c4540675',
    taker: '0x6634d87c23decda47cbc3114863f01925dfef160a4',
    price: 1.0000,
    amount: 0.0001,
    taker_side: 'sell'},
	 { id:
     '610a38f9ec6c569813a48a0edeef9999e351db4d152389fd6a60f58a5b8112ac',
    trade_hash: null,
    //maker: '0x66bb0fb407455e22ad2ea7d90db2b0fc41c4540675',
//    taker: '0x6634d87c23decda47cbc3114863f01925dfef160a4',
	taker: '0x66bb0fb407455e22ad2ea7d90db2b0fc41c4540675',
    //maker: '0x6634d87c23decda47cbc3114863f01925dfef160a4',
	//taker: '0x66202fab701a58b4b622ee07ac8ac11b872d727ced',
    maker: '0x66fb54e73b1ea0a40ca95c5a514500902dc19f2d61',
    price: 1.0000,
    amount: 0.0001,
    taker_side: 'buy'}

	];


		 let order_address_set = ['0x632ebbb99f2b55523573a1cef46c7cac4301b3a9bd','0x6355e8fb64be8c63ba9a6ffec37563d5c1ec570056','0x66edd03c06441f8c2da19b90fcc42506dfa83226d3'];


        for (var i in trades) {

            let trade_info ={
            taker: trades[i].taker,
            maker: trades[i].maker,
            baseToken: order_address_set[0],
            quoteToken: order_address_set[1],
            relayer: order_address_set[2],
            baseTokenAmount: NP.times(trades[i].amount, trades[i].price, 100000000), //    uint256 baseTokenAmount;
            quoteTokenAmount: NP.times(trades[i].amount, 100000000), // quoteTokenAmount;
            takerSide:  trades[i].taker_side
            };

            trades[i].trade_hash = await utils.orderhashbytes(trade_info);

            console.log("dex_test",trades[i]);
        }



		 let trades_hash = [];
		for (var i in trades) {
			let trade_info = [
				trades[i].trade_hash,
				trades[i].taker,
				trades[i].maker,
				NP.times(trades[i].amount, trades[i].price, 100000000), //    uint256 baseTokenAmount;
				NP.times(trades[i].amount, 100000000), // quoteTokenAmount;
				trades[i].taker_side
			];
			   //后边改合约传结构体数据
			trades_hash.push(trade_info);
		}

		 let mist = new mist10(mist_config.ex_address);
		 walletInst = await getTestInst2(mist_config.relayers[0].word);
		mist.unlock(walletInst, "111111");
		let [err2, result] = await to(walletInst.queryAllBalance());

		//let [err, txid] = await to(mist.matchorder(trades_hash, order_address_set));
		console.log("dex_test222",trades_hash, order_address_set,mist_config.relayers[0].prikey)
		let [err, txid] = await to(mist.matchorder(trades_hash, order_address_set,mist_config.relayers[0].prikey));

		console.log("dex_tes333t",err,txid)
		res.json({ result:txid,err:err });

	});



	wallet.get('/get_user_info/:address',async (req, res) => {
		 let token_arr = await mist_wallet.list_tokens();
		 let mist_user = await psql_db.find_user([req.params.address]);
		 let users_obj = new users();
        console.log("1111988888888b",mist_user);
		if(!mist_user[0]){
		    let balances = [];
            let valuations  = [];
			let infos = [];
            for(let i in token_arr){
                console.log("aabobj1234=",token_arr[i]);
				let total_balance = await users_obj.get_total_balance(token_arr[i],req.params.address);

				console.log("aabobj123---",req.params.address,total_balance);


				let price = await mist_wallet.get_token_price2pi(token_arr[i].symbol);
				console.log("aabobj123456=",token_arr[i]);
				let valuation = NP.times(price,total_balance);
				mist_user = {
					address:req.params.address,
					token_symbol:token_arr[i].symbol,
					balance:total_balance,
					valuation:valuation
				}
				infos.push(mist_user);
            }
			mist_user={
			address:infos[0].address,
			pi:infos[0].balance,
			asim:infos[1].balance,
			usdt:infos[3].balance,
			eth:infos[4].balance,
			mt:infos[5].balance,
			btc:infos[2].balance,
			pi_valuation:infos[0].valuation,
			asim_valuation:infos[1].valuation,
			usdt_valuation:infos[3].valuation,
			eth_valuation:infos[4].valuation,
			mt_valuation:infos[5].valuation,
			btc_valuation:infos[2].valuation
			};
		}

		//PI,ASIM,BTC.USDT,ETH,MT
		
		console.log("aabobj1234588888=",mist_user);
		res.json({
            success: mist_user == undefined ? false:true,
            result: mist_user,
        });
	});




	wallet.get('/list_assets_info',async (req, res) => {
		let [err,info] = await to(psql_db.list_assets_info());
		console.log("list_assets_info-2222",err,info);
		res.json({
            success: info == undefined ? false:true,
            result: info,
			err: err
        });
	});



	wallet.get('/get_asset_info/:token_name',async (req, res) => {
		let tokens = await psql_db.get_tokens([req.params.token_name])
		let assetToken = new fake_token(tokens[0].asim_address);
		walletInst = await getTestInst();
		assetToken.unlock(walletInst,'111111')
		let [err,result] = await to(assetToken.getAssetInfo())
		console.log(result,err);
		 res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
	});

	wallet.get('/faucet2/:token/:address',async (req, res) => {
		console.log(req.params)
		let token = new StandardToken(req.params.token)
		let takerWallet = await getTakerWallet();
		await takerWallet.queryAllBalance()
		token.unlock(takerWallet,'111111')
		let [err,result] = await to(token.transfer(req.params.address,10000))
		console.log(result,err);
		 res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
	});

	wallet.get('/faucet/:address',async (req, res) => {
		console.log(req.params)
	
		let token_arr = await mist_wallet.list_tokens();
		let results = [];	
		 for(let i in  token_arr){
		let address = req.params.address; 
			 setTimeout(async ()=>{
			let asset = new Asset(token_arr[i].asim_assetid)	

			let wallet = await getTestInst();
			asset.unlock(wallet,"111111")
			await wallet.queryAllBalance()
			let [err,result] = await to(asset.transfer(address,faucet_amount[i]));
			if(err){
			 	return res.json({
						success: false,
						err: err
     	  			});
			}
			 results.push[result];
			console.log("---------erc20_token_arr--i=",i,asset,"err-result",err,result,"\n\n\n\n")
			 },i*10000);
		}

		 res.json({
            success: true,
            result: results,
        });
		
	});

	wallet.get('/faucet3/:address',async (req, res) => {
		console.log(req.params)
	
		let token_arr = await mist_wallet.list_tokens();
		let results = [];	
		 for(let i in  token_arr){
		let address = req.params.address; 
			 setTimeout(async ()=>{
			let asset = new Asset(token_arr[i].asim_assetid)	

			let wallet = await getTestInst();
			asset.unlock(wallet,"111111")
			await wallet.queryAllBalance()
			let [err,result] = await to(asset.transfer(address,100000));
			if(err){
                return res.json({
                        success: false,
                        err: err
                    });
            }

			 results.push[result];
			console.log("---------erc20_token_arr--i=",i,asset,"err-result",err,result,"\n\n\n\n")
			 },i*10000);
		}
		  res.json({
            success: true,
            result: results,
        });
	});




	wallet.get('/balanceOf/:token/:address',async (req, res) => {
		console.log(req.params)
		let token = new StandardToken(req.params.token)
		let [err,result] = await to(token.balanceOf(req.params.address))
		console.log(result,err);

		res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
	});

	wallet.get('/get_token_balance/:token_name/:address', async (req, res) => {

		   let token_info = await psql_db.get_tokens([req.params.token_name])

           let token = new Token(token_info[0].address);
           let [err,balance] = await to(token.balanceOf(req.params.address));
           let [err2,allowance] = await to(token.allowance(req.params.address,mist_config.ex_address));

		   let asset = new Asset(token_info[0].asim_assetid)
		   let [err4,assets_balance] = await to(asset.balanceOf(req.params.address))

		   let asset_balance=0;
			for(let j in assets_balance){
				if( token_info[0].asim_assetid == assets_balance[j].asset){
					asset_balance = assets_balance[j].value;
				}
			}
			console.log("3333333",err,err2,err4,balance,allowance,asset_balance);

           let result = {erc20_balance:balance / 100000000,allowance:allowance / 100000000,asset_balance:asset_balance};
		   res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
       	    });
    });


	wallet.get('/balance',async (req, res) => {

		let [err,result] = await to(tokenTest.testBalanceOf())
		console.log(result,err);
	  	res.json({
			success: result == undefined ? false:true,
			result: result,
			err: err
		});
	});

	wallet.get('/transfer',async (req, res) => {

		walletInst = await getTestInst();
		let [err,result] = await to(tokenTest.testTransfer(walletInst))
		console.log(result,err);

		if( !err ){
			// 先简单处理，Execute 前更新UTXO
			await walletInst.queryAllBalance()
		}

		res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
	});

	wallet.get('/approve',async (req, res) => {

		walletInst = await getTestInst();
		let [err,result] = await to(tokenTest.testApprove(walletInst))
		console.log(result,err);
		 res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
		  
	});

	/**
	 * Assets Test
	 */

	wallet.get('/assetBalanceOf/:address',async (req,res)=>{
		let asset = new Asset(CONSTANT.DEFAULT_ASSET)
		let [err,result] = await to(asset.balanceOf(req.params.address))
		res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
		  
	});

	//这里后期是要传输入信息和加密的密闻
	wallet.get('/assetTransfer/:address/:symbol/:amount',async (req, res) => {
		let tokens = await psql_db.get_tokens([req.params.symbol])
		let asset = new Asset(tokens[0].asim_assetid)
		walletInst = await getTestInst();
		asset.unlock(walletInst,"")
     	let [err,result] = await to(asset.transfer(req.params.address,req.params.amount));
		console.log(result,err);
		res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
        });
	});
	/**
	 * curl -X POST --data '{"id":1, "jsonrpc":"2.0","method":"asimov_searchRawTransactions",
	 * "params":["0x666e55294d0ee2b7306b9a765b576df9c8ed73a877",true,0,1,false,false,[]]}' 
	 * -H "Content-type: application/json" http://localhost:8545/
	 * 
	 * Parameters
	 * -transaction associated address
	 * -get detail or not
	 * -transaction offset
	 * -number of transactions
	 * -get last output or not
	 * -reverse or not
	 * -addresses not included
	 * 
	 * Returns
	 * -information of raw transaction
	 */
	wallet.get('/tx',async (req, res) => {
		let address
		if( req.query.address ){
			address = req.query.address
		} else {
			walletInst = await getTestInst();
			address = await walletInst.getAddress()
		}
		let num = 3
		let reverse = true

		let [err,result] = await to(chain.searchrawtransactions([address,true,0,num,false,reverse,[]]))

		res.json({result,err });
	});

	wallet.get('/rawtx',async (req, res) => {
		let txid = req.query.txid

		let [err,result] = await to(chain.getrawtransaction([txid,true,true]))

		res.json({result,err });
	});

	/**
	 * asimov_getUtxoByAddress
	 * Returns UTXO of given address.
	 * 
	 * Parameters
	 * address
	 * asset (optional, "")
	 * Returns
	 * UTXO information
	 */
	wallet.get('/utxo',async (req, res) => {
		let address
		if( req.query.address ){
			address = req.query.address
		} else {
			walletInst = await getTestInst();
			address = await walletInst.getAddress()
		}

		let [err,result] = await to(walletRPC.getutxobyaddress([[address],""]))

		res.json({result,err });
	});

//弃用，采用本地hash计算	
	 wallet.get('/orderhash',async (req, res) => {

		console.log("33333");
		let mist = new mist10(mist_config.ex_address);
        walletInst = await getTestInst();
		 mist.unlock(walletInst,mist_config.wallet_default_passwd)
		await walletInst.queryAllBalance()

        let [err,result] = await to(mist.orderhash(walletInst))
		let kkk =`curl -X POST --data '{"id":1, "jsonrpc":"2.0","method":"asimov_getTransactionReceipt","params":["${result}"]}}' -H "Content-type: application/json" https://test-rpc.asimov.network`;

		console.log("8888",kkk);
        console.log(result,err);

        res.json({ result:result,err:err });
    });

	//清仓
	wallet.get('/cdp_liquidate/:borrow_id/:asset_id/:address',async (req, res) => {

		console.log("33333");
		let cdp_obj = new cdp(cdp_address);
        walletInst = await getTestInst();
		 cdp_obj.unlock(walletInst,"111111")
		await walletInst.queryAllBalance()
	
        let [err,result] = await to(cdp_obj.liquidate(req.params.borrow_id,req.params.asset_id));
        console.log(result,err);


			let current_time = utils.get_current_time();
			//加仓量为输入值，还钱量为0
			let update_info = ["liquidated",0,0,current_time,req.params.address,req.params.borrow_id];
			let [err2,result2] = await to(psql_db.update_borrows(update_info));

        res.json({ result:result,err:err });
    });




	  wallet.get('/list_borrows/:address',async (req, res) => {
			let address = [req.params.address];
			let [err,result] = await to(psql_db.list_borrows(address));
			res.json({
				success: result == undefined ? false:true,
				result: result,
				err: err
       		 });
	  });


	 wallet.get('/my_borrows2/:address/:page/:perpage',async (req, res) => {
		 	let {address,page,perpage} = req.params;
			let offset = (+page - 1) * +perpage;
			let [err,result] = await to(psql_db.my_borrows2([address,offset,+perpage]));
			 res.json({
                success: result == undefined ? false:true,
                result: result,
                err: err
             });
		
	  });

//弃用，前期调试接口
	  wallet.get('/matchorder',async (req, res) => {
		
		console.log("2222222222");
		let mist = new mist10(mist_config.ex_address);
        walletInst = await getTestInst();
		 mist.unlock(walletInst,"111111")
		await walletInst.queryAllBalance()
        let [err,result] = await to(mist.matchorder(walletInst))

        res.json({ result:result,err:err });
    });

	  wallet.get('/sendrawtransaction/createDepositBorrow/:borrow_amount/:borrow_time/:token_name/:deposit_amount/:address/:row',async (req, res) => {
            let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));
			console.log("555444444444",req.params,result);

			if(!err){	
					setTimeout(async ()=>{
						let datas = utils.get_receipt(result);	
					
						if(datas){
							console.log("444444444",datas[3].slice(194,258));
							let borrow_id  = parseInt(datas[3].slice(194,258),16);
							console.log("444444444",borrow_id);
							let cdp_tokens = await psql_db.find_cdp_token([req.params.token_name])
							let cdp_address =  cdp_tokens[0].cdp_address;
							console.log("-----uuuu--",cdp_address,req.params);
							//暂定初始价格位当前价格
							let current_price =  cdp_tokens[0].init_price
							let assetID = cdp_tokens[0].token_asset_id;
							//根据借贷时间去表中查对于的利率，临时先这么处理，4为字段的排序
							//这里数据库加字段的话index偏移量3也要对应修改
							let index = (req.params.borrow_time/30) + 4;
							let token_info_arr = utils.arr_values(cdp_tokens[0]);
							let interest_rate = token_info_arr[index];
							console.log("---44444-interest_rate--",interest_rate);	

							//return res.json(datas);
								let current_time = utils.get_current_time();
								let mortgage_rate = req.params.borrow_amount / (req.params.deposit_amount * current_price);
								let should_repaid_amount = req.params.borrow_amount * (1 + (+interest_rate));
								let borrow_info = {
									 id:null,
									 //addrss:req.params.address,          
									 address:req.params.address,
									 deposit_assetid:assetID,   
									 deposit_amount:req.params.deposit_amount,
									 deposit_token_name:req.params.token_name,
									 deposit_price:current_price,
									 interest_rate: interest_rate,
									 cdp_id:borrow_id,            
									 status:"borrowing",            
									 mortgage_rate:mortgage_rate,              
									 usage:"炒币",             
									 borrow_amount: req.params.borrow_amount,     
									 borrow_time: req.params.borrow_time,       
									 repaid_amount:0,       
									 should_repaid_amount:should_repaid_amount,       
									 cdp_address: cdp_address,
									 updated_at: current_time,
									 created_at: current_time
								};
								borrow_info.id = utils.get_hash(borrow_info);
								console.log("--555555-interest_rate--",borrow_info);	
								let [err2,result2] = await to(psql_db.insert_borrows(utils.arr_values(borrow_info)));
								if(err2){
									res.json({  success:false,err:err2})		
								}
								let result3 = {txid:txid,borrow_id:borrow_id}

								return res.json({ success:true,result:result3});
						}else{return res.json({  success:false,err:"failed,cann't find borrow_id "})}
					}, 10000);
			}
		   res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
     	   });
      });

//	还钱
	  wallet.get('/sendrawtransaction/repay/:borrow_id/:deposit_token_name/:amount/:address/:row',async (req, res) => {
            let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));
			if(!err){
					let current_time = utils.get_current_time();

					let [err2,borrow_info] = await to(psql_db.find_borrow([req.params.borrow_id,req.params.deposit_token_name]));
					let status = "borrowing";
					let repay_amount = +req.params.amount;
					//这里会有点小bug-因为利率的数值最后一个是进一的,如果还钱金额正好是介于psql数据库里应还和kv数据库里之间
					//则实际已经还款完成，psql显示还差零点几个带还款
					
					if(repay_amount  >= borrow_info[0].should_repaid_amount){
						status = "finished";
						repay_amount = borrow_info[0].should_repaid_amount;
					}

					//为了复用接口,加仓量为0，还钱量为输入值,token_name+id是唯一的
					let update_info = [status,0,repay_amount,current_time,req.params.deposit_token_name,req.params.borrow_id];
					console.log("333333333",update_info)
					let [err3,result2] = await to(psql_db.update_borrows(update_info));
			}
		   res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
           });
      });
//加仓

	  wallet.get('/sendrawtransaction/cdp_deposit/:borrow_id/:token_name/:amount/:address/:row',async (req, res) => {
            let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));
			if(!err){
					let current_time = utils.get_current_time();
					//加仓量为输入值，还钱量为0
					let update_info = ["borrowing",req.params.amount,0,current_time,req.params.token_name,req.params.borrow_id];
					let [err2,result2] = await to(psql_db.update_borrows(update_info));
			}

		   res.json({
            success: result == undefined ? false:true,
            result: result,
            err: err
           });
      });


//清仓
	  wallet.get('/sendrawtransaction/cdp_liquidate/:borrow_id/:asset_id/:address/:row',async (req, res) => {
            let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));

			let current_time = utils.get_current_time();
            //加仓量为输入值，还钱量为0
            let update_info = ["liquidated",0,0,current_time,req.params.address,req.params.borrow_id];
            let [err2,result2] = await to(psql_db.update_borrows(update_info));

			res.json({
				success: result == undefined ? false:true,
				result: result,
				err: err
            });
      });
// id text primary key,
/**
 address text,
 asim_token_name text,
 erc20_totken_name text,

 side text,--coin2asset,asset2coin

 asim_token_contract text,
 asim_token_id text,
 erc20_token_contract text,

 status text,--failed,success
 txid text,
 amount numeric(32,8),
 created_at timestamp
 *///
//资产转币币
wallet.get('/sendrawtransaction/asset2coin/:amount/:address/:token_name/:row',async (req, res) => {
            let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));
			if(!err){
				let token_info = await psql_db.get_tokens([req.params.token_name]);
				console.log("sss--",token_info);
				let current_time = utils.get_current_time();
				let info = {
					 id:null,
					 address:req.params.address,
					 asim_token_name:req.params.token_name,
					 erc20_totken_name:req.params.token_name,
					 //side: coin2asset,asset2coin
					 side:"asset2coin",
					 asim_token_contract:token_info[0].asim_address,
					 asim_token_id:token_info[0].asim_assetid,
					 erc20_token_contract:token_info[0].address,
					 status:"successful",
					 txid:result,
					 amount:req.params.amount,
					 fee_token:"ASIM",
					 fee_token_amount:0.2,
					 created_at:current_time	
					
				}
				if(err){info.status = "failed"}
				info.id = utils.get_hash(info);
				let arr_info = utils.arr_values(info);
				let [err2,result2] = await to(psql_db.insert_converts(arr_info));
			}
			res.json({
            	success: result == undefined ? false:true,
            	result: result,
           		err: err
          	});
      });
//币币转资产
wallet.get('/sendrawtransaction/coin2asset/:amount/:address/:token_name/:row',async (req, res) => {
            let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));
			if(!err){
				let token_info = await psql_db.get_tokens([req.params.token_name]);
				let current_time = utils.get_current_time();
				let info = {
					 id:null,
					 address:req.params.address,
					 asim_token_name:req.params.token_name,
					 erc20_totken_name:req.params.token_name,
					 //side: coin2asset,asset2coin
					 side:"coin2asset",
					 asim_token_contract:token_info[0].asim_address,
					 asim_token_id:token_info[0].asim_assetid,
					 erc20_token_contract:token_info[0].address,
					 status:"successful",
					 txid:result,
					 amount:req.params.amount,
					 fee_token:"ASIM",
					 fee_token_amount:0.2,
					 created_at:current_time	
					
				}
				if(err){info.status = "failed"}
				info.id = utils.get_hash(info);
				let arr_info = utils.arr_values(info);
				let [err2,result2] = await to(psql_db.insert_converts(arr_info));
			}
			res.json({
                success: result == undefined ? false:true,
                result: result,
                err: err
            });
      });
//划转记录
		wallet.get('/my_converts/:address',async (req, res) => {

            let [err,result] = await to(psql_db.my_converts([req.params.address]));
			 res.json({
                success: result == undefined ? false:true,
                result: result,
                err: err
            });
		});

		wallet.get('/my_converts2/:address/:page/:perpage',async (req, res) => {
			let {address,page,perpage} = req.params;
			let offset = (+page - 1) * +perpage;
            let [err,result] = await to(psql_db.my_converts2([address,offset,perpage]));
			res.json({
                success: result == undefined ? false:true,
                result: result,
                err: err
            });
		});







	  wallet.get('/sendrawtransaction/:row',async (req, res) => {
	   let rowtx = [req.params.row];
            let [err,result] = await to(chain.sendrawtransaction(rowtx));
			res.json({
                success: result == undefined ? false:true,
                result: result,
                err: err
            });
		});

	wallet.get('/list_cdp_info',async (req, res) => {

            let [err,result] = await to(psql_db.list_cdp());
			 res.json({
                success: result == undefined ? false:true,
                result: result,
                err: err
            });
		});



	return wallet;
}