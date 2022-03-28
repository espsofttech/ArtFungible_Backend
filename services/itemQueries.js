var db = require('../utils/connection');
module.exports = {
    buyItem:"UPDATE item SET ? WHERE id = ?",
    orderForBuyItem:"Insert INTO orders SET ?",
    allSearch : "SELECT * FROM item where name like ? ",
    userBidPlace:"Insert INTO item_bid SET ?",
    acceptBid:"UPDATE item_bid SET ? WHERE id = ? ",
    rejectBid:"UPDATE item_bid SET ? WHERE id != ? AND item_id = ? ",
    updateOrder:"UPDATE orders SET ? WHERE item_id = ? ",
    getRefundWallet : "SELECT crypto_amount, address FROM item_bid WHERE item_id = ? AND status = 2",
    updateRefundHash : "UPDATE item_bid SET ? WHERE item_id = ? AND status = 2 ",
    updateSellerHash : "UPDATE orders SET ? WHERE item_id = ? ",
    getUserEmail : "SELECT * FROM users WHERE id = ? ",
    getOverbidUser : "SELECT item_bid.*, item.name, users.email FROM item_bid LEFT JOIN item ON item.id = item_bid.item_id LEFT JOIN users ON users.id = item_bid.user_id WHERE item_bid.status=0 AND item_bid.item_id = ? ORDER BY id DESC LIMIT 1,1",
    updateOverbisStatus : "UPDATE item_bid SET status = 3,refund_hash = ? WHERE id = ? ",
    getStatsData : "SELECT *, cast(coalesce(getMaxBid(id, owner_id), price) as decimal) as maxbid FROM item WHERE is_sold = 1 ORDER by  cast(coalesce(getMaxBid(id, owner_id), price) as decimal), id DESC",
    getMinuteDiff : "SELECT TIMESTAMPDIFF(minute, date_add(now(), INTERVAL 15 MINUTE),expiry_date) AS difference from item where id=?",
    extendExpiry :"update item set expiry_date=date_add(expiry_date, INTERVAL 15 MINUTE) where id =?"
}