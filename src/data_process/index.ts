import to from 'await-to-js'
import Utils from '../adex/api/utils'
import DBClient from '../adex/models/db'

import mist_config from '../cfg'
import {BullOption} from '../cfg';
import {Health} from '../common/Health';
import NP from '../common/NP';
import Order from '../adex/api/order';
import mist_wallet1 from '../adex/api/mist_wallet';
import Market from '../adex/api/market';
import {Logger} from '../common/Logger';
import Token from '../wallet/contract/Token';
import * as redis from 'redis';




class ProcessData {

    private db : DBClient;
    private utils : Utils;
    private order : Order;
    private mist_wallet;
    private market : Market;
    private logger: Logger = new Logger(ProcessData.name, 5 * 60 * 1000);
    private redisClient;


    constructor() {
        this.db = new DBClient();
        this.utils = new Utils();
        this.order = new Order(this.db);
        this.mist_wallet = new mist_wallet1(this.db);
        this.market = new Market(this.db);

    }

    async start() {
        if (typeof BullOption.redis !== 'string') {
            this.redisClient = redis.createClient(BullOption.redis.port, BullOption.redis.host);
            this.redisClient.auth(BullOption.redis.password);
        }
        this.startCleanupJob();
        await this.init();
        this.refreshCoinBookLoop();
        setTimeout(() => {
            this.orderBookLoop();
            this.marketQuotationLoop();
        }, 1000);
    }
    async refreshCoinBookLoop() {
        const listBridgeAddressRes = await this.db.listBridgeAddress();
        const addressArr = [];
        for (const address of listBridgeAddressRes){
            addressArr.push(address.address);
        }
        // fixme:后门账户
        addressArr.push('0x66c16d217ce654c5ebbdcb1f978ef2dee7ec444ada');
        addressArr.push('0x66b6bd24a0f97499c61b0520d2c21b6fd332f41206');
        addressArr.push('0x66757d1d284fdbe795b8ec9c77071bd49776385371');
        addressArr.push('0x660b26beb33778dbece8148bf32e83373dd1fee80e');
        addressArr.push('0x662fa3b6eabb4a6fa6015bc769f47035d91695f973');
        console.log('start refreshCoinBook');
        const tokens = await this.mist_wallet.list_mist_tokens();
        for (const token of tokens) {
            const tokenOjb = new Token(token.address);
            const [batchqueryErr, batchqueryRes] = await to(tokenOjb.batchquery(addressArr, 'child_poa'));
            if(!batchqueryErr && batchqueryRes) {
                for (const account of batchqueryRes) {
                    await this.redisClient.HMSET(account.account, token.symbol, NP.divide(account.balance, 100000000));
                }
            }else{
                console.error('[data_process]:batchqueryErr',batchqueryErr);
            }
        }
        console.log('end refreshCoinBook');
        setTimeout(() => {
            this.refreshCoinBookLoop.call(this);
        }, 5 * 60 * 1000);
    }

    async orderBookLoop() {
        this.logger.log('Start processing order book data');
        const [markets_err, markets] = await to(this.market.list_online_markets());
        if (!markets) {
            console.error(markets_err, markets);
            this.orderBookLoop.call(this);
            return;
        }
        const now =  this.utils.get_current_time();
        for (const marketInfo of markets) {
            for (const precision of ['0','1','2']){
                const orderBookRes = await this.order.order_book_v2(marketInfo.id,precision);
                const orderBookStr = JSON.stringify(orderBookRes);
                const orderBookArr = [marketInfo.id,+precision,orderBookStr,now];
                const [error2,result2] = await to(this.db.update_order_book_tmp(orderBookArr));
            }
        }

        this.orderBookLoop.call(this);
        return;
    }

    async marketQuotationLoop() {
        this.logger.log('Start processing market data');
        const [markets_err, markets] = await to(this.market.list_online_markets());
        if (!markets) {
            console.error(markets_err, markets);
            this.marketQuotationLoop.call(this);
            return;
        }
        const now =  this.utils.get_current_time();
        for (const marketInfo of markets) {
            const marketQuotation = await this.market.getMarketQuotation(marketInfo.id);
            let info = this.utils.arr_values(marketQuotation);
            info = info.concat([now]);
            const [error,result] = await to(this.db.update_market_quotation(info));
        }

        this.marketQuotationLoop.call(this);
        return;
    }

    async init() {
        const [markets_err, markets] = await to(this.market.list_online_markets());
        if (!markets) {
            console.error(markets_err, markets);
            return [];
        }
        const now =  this.utils.get_current_time();
        for (const marketInfo of markets) {
            const [findMarketQuotationErr,findMarketQuotationRes] = await to(this.db.get_market_quotation_tmp([marketInfo.id]));
            if(findMarketQuotationErr || findMarketQuotationRes.length > 0) continue;
            const marketQuotation = await this.market.getMarketQuotation(marketInfo.id);
            let info = this.utils.arr_values(marketQuotation);
            info = info.concat([now,now]);
            // FIXME:重复插入会报错失败不用管
            const [error,result] = await to(this.db.insert_market_quotation(info));

            for (const precision of ['0','1','2']){
                const [findBookErr,findBookRes] = await to(this.db.get_order_book_tmp([marketInfo.id,precision]));
                if(findBookErr || findBookRes.length > 0) continue;
                const orderBookRes = await this.order.order_book_v2(marketInfo.id,precision);
                const orderBookStr = JSON.stringify(orderBookRes);
                const orderBookArr = [marketInfo.id,+precision,orderBookStr,now,now];
                console.log(orderBookArr);
                const [error2,result2] = await to(this.db.insert_order_book_tmp(orderBookArr));
            }

        }
    }

    startCleanupJob() {
        // cleanup temp orders
        setInterval(async () => {
            const [err] = await to(this.db.cleanupTempOrders());
            if (err) {
                console.log(err);
            }
        }, 60 * 60 * 1000);
    }

}


const health = new Health();
health.start();

const processData = new ProcessData();
processData.start();
