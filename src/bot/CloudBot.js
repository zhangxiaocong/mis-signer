import axios from 'axios'
import to from 'await-to-js'
import cfg from '../cfg'
import consola from 'consola'
import botConfig from './config'

let localStorage = {}
axios.headers = 'Access-Control-Allow-Methods:POST, GET, OPTIONS'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.baseURL = 'http://119.23.181.166:' + cfg.mist_server_port

// JWT support
axios.interceptors.request.use(config => {
    // 在Login成功时候存储 token
    if (localStorage.token) {
        config.headers.Authorization = "Bearer " + localStorage.token
    }

    return config
}, error => {
    return Promise.reject(error)
})

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use(res => {
    // 可以对响应数据做些事
    // consola.info(res)
    // save jwt,虽然没必要每次数据都检查，但是统一在这里处理逻辑更简洁点
    if (res.data && res.data.token) {
        // 储存 token
        localStorage.token = res.data.token
        consola.info("Save JWT:", localStorage.token)
    }

    return res
}, error => {
    consola.info(error)
    if (error.response.status === 401) {
        // 401 说明 token 验证失败
        // 可以直接跳转到登录页面，重新登录获取 token
        // router
    } else if (error.response.status === 500) {
        // 服务器错误
        // do something
        return Promise.reject(error.response.data)
    }
    // 返回 response 里的错误信息
    return Promise.reject(error.response.data)
})

export default class CloudBot {
    constructor(market, priceOracle, amount) {
        this.market = market
        this.priceOracle = priceOracle
        this.timer = -1
        this.amount = amount

        this.maxOrderPrice = 5000

        this.$axios = axios

        this.accounts = botConfig.accounts
        this.password = botConfig.password
        this.addresses = botConfig.addresses
        this.sides = ["buy", "sell"]
    }

    price(){
        return this.priceOracle.getPrice(this.market)
    }

    static async login(){
        // 暂时不需要登陆
        let res = await this.$axios({
            method: "post",
            url: `/did/signin`,
            header: {
              "content-type": "application/x-www-form-urlencoded"
            },
            data: {
              username: 'this.email',
              password: 'this.password'
            }
          })
        consola.info(res)
    }

    start(delay) {
        setTimeout(() => {
            this.loop.call(this)
        }, delay);
    }

    stop() {
        if (this.timer > 0) {
            clearTimeout(this.timer)
            this.timer = -1
        }
    }

    async loop() {
        this.stop()
        await this.main()
        this.timer = setTimeout(() => {
            this.loop.call(this)
        }, 5*60*1000);
    }

    async main() {
        // if(!localStorage.token)return;
        await this.trade(true)
        await this.trade(false)
    }

    async trade(buy) {
        let addPrice = (this.price() / 1000) * Math.random() * 5
        addPrice = buy ? -addPrice : addPrice
        let price = this.price() + addPrice

        let amount = this.maxOrderPrice / this.price() * Math.random()
        if( this.amount > 0 ){
            amount = this.amount * Math.random()
            amount = Number(amount.toFixed(4))
        }
        let side = buy?'buy':'sell'

        let index = Math.random()>0.5?0:1
        let address = this.addresses[index]
        let account = this.accounts[index]

        let order_id = await this.buildOrder(side,price,amount,address)
        let signature = await this.signOrder(account,order_id)
        let res = await this.confirmOrder(side,price,amount,address,signature,order_id)

        consola.info(
            "BOT:", this.market, this.price(), 
            side, price.toFixed(2), amount.toFixed(4),
            res?"success":"failed")

    }

    async confirmOrder(side,price,amount,address,signature,order_id) {
        //发送订单
        let [err,res] = await to(this.$axios({
            method: "get",
            url: "/adex/build_order",
            params: {
                marketID: this.market,
                side,
                price:price.toFixed(2),
                amount:amount.toFixed(4),
                trader_address: address,
                signature,
                order_id
            }
        }))
        if( err ){
            consola.info("confirmOrder err")
            return
        }
        return res
    }

    async signOrder(username,order_id) {
        //签名
        let [err,res] = await to(this.$axios({
            method: "post",
            url: "/did/order_sign",
            data: {
                username,
                order_id
            }
        }))
        if( err ){
            consola.info("signOrder err")
            return
        }

        let signature = res.data.signature;
        return signature
    }

    async buildOrder(side,price,amount,address) {
        //第一步获取oeder_id
        let [err,res] = await to(this.$axios({
            method: "get",
            url: "/adex/get_order_id",
            params: {
                marketID: this.market,
                side,
                price:price.toFixed(2),
                amount:amount.toFixed(4),
                trader_address: address
            }
        }))
        if( err ){
            consola.info("buildOrder err")
            return
        }
        
        let order_id = res.data;
        return order_id
    }
}