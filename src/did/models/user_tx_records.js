const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import db from './db'

//交易所地址的用户地址永远是to，提币有另外的账户负责
let UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    tx_type: {
        type: String,
        required: true
    },
	token_name: {
        type: String,
        required: true
    },
	amount: {
        type: Number,
        required: true
    },
//转账后的余额
    balance: {
        type: Number,
        required: true
    },
    from_address: {
        type: String,
        required: true
    },
    to_address: {
        type: String,
        required: true
    },
	created_time: {
        type: String,
        required: true
    },
    txid: String,
});

module.exports = mongoose.model('user_tx_records', UserSchema);
