import client from '../models/db'
import engine from './engine'
const crypto = require('crypto');
//require('babel-polyfill');
//require('babel-register');

export default class order{
    db;
    exchange;
    constructor() {
         this.db =  new client();
         this.exchange = new engine(this.db);
    }




//   var sha256 =   function (str){
//            let hash = crypto.createHmac('sha256', '123456')
//                    .update(str, 'utf8')
//                    .digest('hex'); // a65014c0dfa57751a749866e844b6c42266b9b7d54d5c59f7f7067d973f77817
//            return hash;
//    }
//

    async build(message) {
            let str= message.join("");
            let hash = crypto.createHmac('sha256', '223454')
                    .update(str, 'utf8')
                    .digest('hex'); // a65014c0dfa57751a749866e844b6c42266b9b7d54d5c59f7f7067d973f77817
                console.log("id=",hash);
                console.log("string=",message.join(""));
                message.push(hash);
                let result = this.db.insert_order(message);
                this.exchange.match(message);
                return result;
    }

    async cancle(walletInst) {
        return this.contract.callContract(abiInfo)
    }
 
}
