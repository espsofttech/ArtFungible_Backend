
var db = require('../utils/connection');

module.exports = {
    getUserActivity: "SELECT *,get_duration(datetime) as duration FROM activity WHERE user_id =? order by id desc",
    get30DaysOldOrder: "SELECT i.image,i.file_type,i.price,i.name,i.token_id,o.*,i.owner_id FROM `orders` as o LEFT JOIN item as i ON i.id=o.item_id WHERE CURRENT_DATE() >= DATE(NOW()) - INTERVAL 30 DAY AND o.user_id= ? ORDER BY o.id DESC",
    getTodaysOrder: "SELECT i.sell_type, i.image,i.file_type,i.price,i.name,i.token_id,o.*,i.owner_id FROM `orders` as o LEFT JOIN item as i ON i.id=o.item_id WHERE date(o.datetime) = CURDATE() AND  o.user_id=? ORDER BY o.id DESC",
    getAllOrder: "SELECT i.id as item_id, i.sell_type, i.is_sold,i.image,i.price,i.file_type,i.name,i.token_id,o.*,i.owner_id,i.is_resale FROM `orders` as o LEFT JOIN item as i ON i.id=o.item_id WHERE o.user_id= ? and o.id in (select max(id) from orders where user_id=? group by item_id ) ORDER BY o.id DESC",

    // "SELECT i.id as item_id, i.sell_type, i.is_sold,i.is_resale,i.image,i.price,i.file_type,i.name,i.token_id,o.*,i.owner_id FROM `orders` as o LEFT JOIN item as i ON i.id=o.item_id WHERE o.user_id= ? AND (i.sell_type = 2 AND i.is_sold = 1) OR i.sell_type = 1 ORDER BY o.id DESC",

    getMyBids: "SELECT i.sell_type ,i.image,o.bid_price as price, o.amounTrxHash as transfer_hash ,i.file_type,i.name,i.token_id,o.*,i.owner_id FROM `item_bid` as o LEFT JOIN item as i ON i.id=o.item_id WHERE o.user_id= ? AND i.is_sold = 0 ORDER BY o.id DESC",

    // getItemBids: "select id,getUsername(user_id) as fullname,'' as name,'Sale' as type,price, date_format(datetime,'%d-%M-%Y') as datetime,datetime as date2 from orders where item_id= ? union all select id,getUsername(user_id)as fullname,'' as name,'Bid' as type,bid_price, date_format(datetime,'%d-%M-%Y') as datetime,datetime as date2 from item_bid where item_id= ? union all select id,'Admin' as creator,name,'Mint' as type,price,date_format(datetime,'%d-%M-%Y') as datetime,datetime as date2 from item where id = ? order by 7 desc",

    getItemBids: "select nft.*,nt.name as nft_activity_type, u1.first_name as from_name,u2.first_name as to_name From nft_activity as nft LEFT JOIN users as u1 on u1.id=nft.from_user LEFT JOIN users as u2 on u2.id=nft.to_user LEFT JOIN nft_activity_type as nt on nt.id=nft.nft_activity_type_id WHERE item_id=? order by id desc",


    getOrderDetails: "SELECT i.image,i.description,i.owner, i.price,i.name,i.token_id,i.owner_id,i.sell_type,i.file_type, DATE_FORMAT(o.datetime, '%Y-%m-%d') as created_date , o.* FROM `orders` as o LEFT JOIN item as i ON i.id=o.item_id WHERE o.id= ?",

    // getOrderDetails: "SELECT * from item WHERE id= ?",
    
    getUserBidDetails: "SELECT i.image,i.description,i.owner,i.name,i.token_id,i.owner_id,i.sell_type, i.file_type ,o.bid_price as price, DATE_FORMAT(o.datetime, '%Y-%m-%d') as created_date ,o.* FROM `item_bid` as o LEFT JOIN item as i ON i.id=o.item_id WHERE o.id= ?",

}