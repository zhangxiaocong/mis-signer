export default class db {
    private clientDB;
    private utils;
    constructor();
    insert_order(ordermessage: any): Promise<string | void>;
    list_orders(): Promise<any>;
    my_orders(address: any): Promise<any>;
    my_orders_length(info: any): Promise<any>;
    my_trades_length(address: any): Promise<any>;
    my_bridge_length(address: any): Promise<any>;
    my_orders2(filter_info: any): Promise<any>;
    find_order(order_id: any): Promise<any>;
    filter_orders(filter: any): Promise<any>;
    update_orders(update_info: any): Promise<any>;
    update_order_confirm(updatesInfo: any): Promise<any>;
    order_book(filter: any): Promise<any>;
    list_tokens(tradeid: any): Promise<any>;
    get_tokens(filter: any): Promise<any>;
    list_markets(): Promise<any>;
    get_market(marketID: any): Promise<any>;
    get_market_current_price(marketID: any): Promise<any>;
    get_market_quotations(marketID: any): Promise<any>;
    insert_trades(tradesInfo: any): Promise<string | void>;
    list_trades(marketID: any): Promise<any>;
    my_trades(address: any): Promise<any>;
    order_trades(order_id: any): Promise<any>;
    my_trades2(filter_info: any): Promise<any>;
    transactions_trades(id: any): Promise<any>;
    list_all_trades(): Promise<any>;
    list_matched_trades(): Promise<any>;
    sort_trades(message: any, sort_by: any): Promise<any>;
    update_trades(update_info: any): Promise<any>;
    launch_update_trades(update_info: any): Promise<any>;
    get_laucher_trades(): Promise<any>;
    get_matched_trades(): Promise<any>;
    delete_matched_trades(): Promise<any>;
    insert_transactions(TXinfo: any): Promise<string | void>;
    list_transactions(): Promise<any>;
    get_pending_transactions(): Promise<any>;
    get_transaction(id: any): Promise<any>;
    update_transactions(update_info: any): Promise<any>;
    list_borrows(address: any): Promise<any>;
    my_borrows2(filter_info: any): Promise<any>;
    find_borrow(info: any): Promise<any>;
    update_borrows(update_info: any): Promise<any>;
    insert_borrows(borrow_info: any): Promise<string | void>;
    update_user_token(update_info: any): Promise<any>;
    update_user_total(update_info: any): Promise<any>;
    insert_users(address_info: any): Promise<string | void>;
    find_user(address: any): Promise<any>;
    list_users(): Promise<any>;
    find_cdp_token(token_name: any): Promise<any>;
    list_cdp(): Promise<any>;
    my_converts(address: any): Promise<any>;
    my_converts2(filter_info: any): Promise<any>;
    find_bridge(filter_info: any): Promise<any>;
    my_bridge(filter_info: any): Promise<any>;
    filter_bridge(filter_info: any): Promise<any>;
    update_asset2coin_bridge(info: any): Promise<any>;
    update_asset2coin_decode(info: any): Promise<any>;
    update_coin2asset_bridge(info: any): Promise<any>;
    update_coin2asset_failed(info: any): Promise<any>;
    my_bridge_v3(filter_info: any): Promise<any>;
    insert_converts(info: any): Promise<string | void>;
    insert_bridge(info: any): Promise<string | void>;
    get_engine_info(): Promise<string | void>;
    get_freeze_amount(filter_info: any): Promise<any>;
    list_assets_info(): Promise<string | void>;
    insert_assets_info(info: any): Promise<string | void>;
    update_assets_total(info: any): Promise<any>;
    update_assets_yesterday_total(info: any): Promise<any>;
}