
var db = require('../utils/connection');

module.exports = {
    insertActivity: "INSERT INTO nft_activity set ?",
    getUsersEmail: "SELECT * FROM admin WHERE email = ?",
    getFooter: "SELECT * FROM web_footer",
    getWebContent: "SELECT * FROM web_content",
    updateFooter: "update web_footer SET description=?,email=?,contact=?",
    updateWebContent: "update web_content SET ?",
    getUsers: "SELECT us.id,us.profile_pic,us.first_name,us.last_name,us.email,us.phone,us.is_email_verify,us.country_id,us.user_name,us.deactivate_account, ct.name as country_name from users as us  LEFT JOIN country as ct ON ct.id = us.country_id WHERE us.is_delete = 0 ORDER BY us.id DESC",

    getSingleUser: "Select * from users where id =?",
    // getOrderDetail : "SELECT u.*,o.* FROM users as u LEFT JOIN  orders as o ON u.id=o.user_id  where ? ",
    insertMarketPlace: "insert into marketplace SET ?",
    getMarketPlace: "Select id,title,author,price,item_image,price from marketplace",
    insertCategory: "insert into item_category SET ?",
    deleteCategory: "DELETE FROM item_category WHERE id =?",
    updateCategory: "update item_category SET ? where id =?",
    Category: "Select id,name, description from item_category",
    Rarity: "Select id,name,icon from rarity",
    singleCategory: "Select id,name from item_category where id =?",
    insertItem: "insert into item SET ?",
    deleteItem: "DELETE FROM item WHERE id =?",
    updateItem: "update item SET ? where id =?",
    getItem: "SELECT it.*, it.id as item_id ,ct.id,ct.name as category_name FROM item as it LEFT JOIN item_category as ct ON ct.id=it.item_category_id",
    editItem: "update item SET ? where id =?",
    listSingleItem: "SELECT getImageArray(i.id) as multiimage, rarity.name as rarityname, i.increasing_amount,date_format(i.start_date,'%d %M %Y %H:%i:%s') as start_date,date_format(i.expiry_date,'%d %M %Y %H:%i:%s') as expiry_date, i.sell_type,i.file_type, i.token_hash, i.datetime as create_date,i.is_sold,i.id,i.name,i.metadata,i.owner_id,i.description,i.image,i.owner,i.item_category_id,ic.name as category_name,i.token_id,i.price,case when uw.id is null then 0 else 1 end as is_wishlist, case when uc.id is null then 0 else 1 end as is_cart, coalesce(getMaxBid(i.id, i.owner_id),i.price) + i.increasing_amount as maxbid from item as i left join item_category as ic on ic.id=i.item_category_id left join user_wishlist as uw on uw.item_id=i.id and uw.user_id= ? LEFT JOIN user_cart as uc on uc.item_id=i.id and uc.user_id= ? LEFT JOIN rarity ON i.rarity = rarity.id where i.id = ? ",
    dashItem: "select sum(category_count) as category_count,sum(user_count) as user_count,sum(item_count) as item_count,sum(sold_item) as sold_item,sum(trending_item) as trending_item from (  select count(id) as category_count,0 as user_count,0 as item_count, 0 as sold_item, 0 as trending_item from item_category    UNION ALL   select 0 as category_count,count(id) as user_count,0 as item_count, 0 as sold_item, 0 as trending_item from users   UNION ALL select 0 as category_count,0 as user_count,count(id) as item_count, sum(is_sold) as sold_item, sum(is_trending) as trending_item from item ) as dashboard_data",
    deleteUser: "DELETE FROM users WHERE id =?",
    deleteUserFromAdmin: "UPDATE users SET ? WHERE id = ? ",
    updatepassword: "update admin SET password=? where email=?",
    getPassword: "Select password from admin where email =?",
    updateProfile: "update users SET profile_pic=? where email=?",
    getProfile: "Select profile_pic from users where email=?",
    getOrderDetail: "Select u.id,u.profile_pic,u.user_name, u.email ,o.user_id,o.item_id,o.price,o.datetime,o.transfer_hash,o.currency,o.trx_amount,o.status,it.token_id,it.image,it.file_type from orders as o LEFT JOIN users as u ON o.user_id=u.id LEFT JOIN item as it ON o.item_id=it.id ORDER BY o.id DESC",

    updatemeta: "update item SET metadata =? where id=?",
    adminwallet: "select * from admin_wallet",
    updateadminwallet: "update admin_wallet SET admin_address=?,admin_private_key=? where id =?",
    soldNft: "update item SET ? where id =?",
    getUserDetails: "SELECT users.*, country.name as countryname FROM users LEFT JOIN country ON users.country_id = country.id WHERE users.id = ?",

    getWalletDetailsQry: "select * from admin_wallet",
    updateadminwalletDetails: "update admin_wallet SET admin_address = ?,admin_private_key = ? where id =?",

    getSettingData: "SELECT * FROM settings WHERE id = 1",
    updateAdminSetting: "update settings SET live_auction = ?, admin_commission = ? ,royalty_commission = ? where id = 1",
    getRefundUserData: "SELECT item.name, item.file_type, item.image, item_bid.id ,item.token_id, item_bid.bid_price, item_bid.crypto_amount, item_bid.amounTrxHash, item_bid.status, item_bid.user_id, item_bid.refund_hash, users.user_name, users.email FROM item_bid LEFT JOIN item ON item_bid.item_id = item.id LEFT JOIN users ON item_bid.user_id = users.id WHERE status = 2 ORDER BY item_bid.id DESC",

    getRefundWalletAdresses: "SELECT * FROM item_bid WHERE status = 2 AND (refund_hash is null OR refund_hash = '' )",

    getRefundSellerAdresses: "SELECT orders.id, orders.seller_trx_hash, orders.item_id, item.seller_wallet, item_bid.crypto_amount FROM orders INNER JOIN item ON orders.item_id = item.id LEFT JOIN item_bid ON item.id = item_bid.item_id WHERE (item.seller_wallet != '' AND item.seller_wallet != 'undefined' ) AND item.is_sold = 1 AND (orders.seller_trx_hash = '' OR orders.seller_trx_hash is null) AND item_bid.status = 1",

    updateAllUserRefundHash: "UPDATE item_bid SET ? WHERE item_id IN (?) ",

    additemimages: "insert into item_images SET ?",

    getWhyArtFungible: "SELECT why_art_fungible from web_content",

    updateWhyArtFungible: "update web_content SET why_art_fungible = ? where id =?",

    getPrivacypolicy: "SELECT privacy_policy from web_content",

    updatePrivacyPolicy: "UPDATE web_content SET privacy_policy = ? where id = ?",

    getTermsAndCondition: "SELECT terms_and_conditions from web_content",

    updateTermsAndCondition: "UPDATE web_content SET terms_and_conditions = ? where id = ?",

    getAbout: "SELECT about from web_content",
    getContact: "SELECT * FROM contact_us",

    updateAbout: "UPDATE web_content SET about = ? WHERE id = ?",

    getDrop: "SELECT drop_about from web_content",

    updateDrop: "UPDATE web_content SET drop_about = ?  WHERE id = ?",

    getfaqlist: "SELECT * from faq_list order by id desc ",
    faqadd: "insert into faq_list SET ?",
    faqdelete: "DELETE from faq_list where id =?",
    insertTransaction: "INSERT INTO transaction set ? ",
    getTransaction: "SELECT t.id as transaction_id,t.item_id,t.commision,t.address,t.user_id,t.royalty,t.itemamount,t.Totalamount,t.status,t.datetime,t.hash,i.name  FROM `transaction` as t left join item as i on i.id=t.item_id ORDER BY t.id DESC",
    updateBidStatus:"update item_bid SET item_id=?,status=? where id =?",
    updateItemData:"update item SET is_sold=?,is_resale=? where id =?"
}