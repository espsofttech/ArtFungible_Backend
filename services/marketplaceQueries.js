
var db = require('../utils/connection');

module.exports = {
    addWishlist : "insert into user_wishlist SET ?",
    listWishlist : "select uw.id as wishlist_id,u.id as user_id,u.email,i.file_type,i.name,i.description,i.image,ic.name as item_category,i.token_id,i.price,i.is_sold,i.is_trending from user_wishlist as uw left join users as u on u.id=uw.user_id left join item as i on i.id=uw.item_id left join item_category as ic on ic.id=i.item_category_id where uw.user_id = ? ORDER BY wishlist_id DESC",
    removeWishlist: "DELETE FROM user_wishlist where id= ?",
    addCart : "insert into user_cart SET ?",
    listCart : "select uc.id as cart_id,u.id as user_id,u.email,i.name,i.owner,i.description,i.image,ic.name as item_category,i.token_id,i.price,i.is_sold,i.is_trending,cart_total(?) as cart_total from user_cart as uc left join users as u on u.id=uc.user_id left join item as i on i.id=uc.item_id left join item_category as ic on ic.id=i.item_category_id where uc.user_id = ?",
    removeCart: "DELETE FROM user_cart where id= ?",
    getBidDetail : "SELECT bd.id as bid_id,u.id as user_id,u.user_name,status,u.email,u.profile_pic,it.id as item_id,it.name as item_name,it.token_id,bd.bid_price,DATE_FORMAT(bd.datetime,'%d-%M-%Y %H:%i:%s') AS datetime from item_bid as bd LEFT JOIN item as it ON it.id = bd.item_id LEFT JOIN users as u ON bd.user_id=u.id where bd.id in (select max(id) from item_bid where item_id = ? and owner_id=? and (status=0 OR status = 3) group by user_id) order by bd.id desc, bd.user_id Desc",
    buyItem:"UPDATE item SET ? WHERE id = ?",
    getBidRecord : "SELECT item_bid.*, item.seller_wallet, item.name,item.image as mainimage, item.token_id, item.owner_id FROM item_bid LEFT JOIN item ON item.id = item_bid.item_id WHERE item_bid.id = ?",
    myBidItem : "SELECT * FROM item WHERE owner_id = ? AND sell_type = 2 AND is_sold = 0 ORDER BY id DESC",
    BidData:"select item_id,i.name as item_name,i.start_date,DATE_FORMAT(i.expiry_date, '%d-%m-%Y %T') as expiry_date,ib.id as bid_id,ib.bid_price,i.price,ib.address,i.token_id, i.owner_id,COALESCE(uo.user_name,'Admin') as owner,u.id as bidder_id,u.user_name as bidder,ib.datetime from item_bid AS ib left join item as i on i.id=ib.item_id left join users as u on u.id=ib.user_id left join users as uo on uo.id=i.owner_id where ib.id in (select max(ib.id) from item_bid as ib inner join item as i on i.id=ib.item_id where i.sell_type=2 and i.expiry_date<CURRENT_DATE AND ib.status=0 group by item_id) order by ib.datetime desc"
    }

    // SELECT * FROM item_bid WHERE owner_id = 96 AND item_id = 1280