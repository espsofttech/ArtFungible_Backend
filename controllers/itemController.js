const CryptoJS = require("crypto-js");
var fetch = require('node-fetch');
const config = require('../config');
const itemQueries = require("../services/itemQueries");
const adminQueries = require("../services/adminQueries");
var validator = require("email-validator");
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const axios = require('axios');
const emailActivity = require("./emailActivity");
const { blockchainApiUrl } = require("../config");

exports.itemBuy = async (db, req, res) => {

    var user_id = req.body.user_id;
    var buyerAddress = req.body.buyerAddress;
    var trx_amount = req.body.trx_amount;
    var item_id = req.body.item_id;
    var trx_currency = req.body.trx_currency;
    var owner = (!req.body.user_name) ? 'User' : req.body.user_name;
    var amounTrxHash = req.body.trx_hash;
    var token_id = req.body.tokenId;
    var price = req.body.price;
    var trx_type = req.body.trx_type;
    var sell_type = req.body.sell_type;
    var cryptoPrice = req.body.cryptoPrice;
    var itemName = req.body.itemName;
    var itemimage = req.body.itemimage;
    var owner_id = req.body.owner_id;
    let transfer_hash = req.body.trx_hash

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required "
        });
    }
    if (!buyerAddress) {
        return res.status(400).send({
            success: false,
            msg: "buyerAddress required "
        });
    }
    if (!owner) {
        return res.status(400).send({
            success: false,
            msg: "owner required "
        });
    }
    if (!token_id) {
        return res.status(400).send({
            success: false,
            msg: "token_id required "
        });
    }
    if (!price) {
        return res.status(400).send({
            success: false,
            msg: "Price required "
        });
    }


    if (sell_type == 1) {
        await db.query("SELECT * FROM admin_wallet limit 1", async function (adminError, adminWallet) {
            if (adminError) {
                return res.status(400).send({
                    success: false,
                    msg: adminError
                });
            }
            try {
               
                var to_address = buyerAddress;
                await db.query(`SELECT * FROM settings `, async function (err, itemDetails) {
                    var commission = itemDetails[0].admin_commission;
                    var royalty = itemDetails[0].royalty_commission;



                    var dataUpdate = {
                        "is_sold": 1,
                        "is_resale": 0,
                        "owner": owner,
                        "owner_id": user_id
                    }

                    await db.query(itemQueries.buyItem, [dataUpdate, item_id], async function (error, dataResult) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured",
                                error
                            });
                        }

                        var orderData = {
                            "user_id": user_id,
                            "owner_id": owner_id,
                            "item_id": item_id,
                            "price": price,
                            "status": 1,
                            "buyerAddress": to_address,
                            "amounTrxHash": amounTrxHash,
                            "transfer_hash": transfer_hash,
                            "currency": trx_currency,
                            "trx_amount": trx_amount,
                            "trx_type": trx_type,
                            "is_resale": 0
                        }
                        // console.log(orderData);
                        await db.query(itemQueries.orderForBuyItem, [orderData], async function (error1, orderResult) {
                            if (error1) {
                                return res.status(400).send({
                                    success: false,
                                    msg: "error occured",
                                    error1
                                });
                            }
                            //// insert into activity

                            var activity = {
                                "nft_activity_type_id": 3,
                                "item_id": item_id,
                                "hash": transfer_hash,
                                "address": to_address,
                                "from_user": user_id,
                                "to_user": owner_id,
                                "amount": price
                            }
                            // console.log(users);
                            await db.query(adminQueries.insertActivity, [activity], async function (error, accData) {
                                if (error) {
                                    return res.status(400).send({
                                        success: false,
                                        msg: "error occured",
                                        error
                                    });
                                }

                                var commisionData = (parseFloat(price) * parseFloat(commission)) / 100
                                var royaltyData = (parseFloat(price) * parseFloat(royalty)) / 100
                                var txData = {
                                    "item_id": item_id,
                                    "hash": amounTrxHash,
                                    "address": to_address,
                                    "user_id": user_id,
                                    "Totalamount": price,
                                    "commision": commisionData,
                                    "royalty": royaltyData,
                                    "itemamount": (parseFloat(price)) - (parseFloat(commisionData) + parseFloat(royaltyData)),
                                    "status": 1,
                                }
                                await db.query(adminQueries.insertTransaction, [txData], async function (error, trxData) {
                                    if (error) {
                                        return res.status(400).send({
                                            success: false,
                                            msg: "error occured",
                                            error
                                        });
                                    }
                                    ///////////////////////////////
                                    if (orderResult) {
                                        var activityData = { "user_id": user_id, "description": `Item purchesed! ItemID : ${token_id}` }
                                        await db.query("INSERT INTO activity SET ?", activityData);

                                        db.query(itemQueries.getUserEmail, [user_id], async function (error2, userData) {
                                            var subject = "NFT Purchased";
                                            var toMail = userData[0].email
                                            var msg = "You have successfully purchased " + itemName;
                                            var image = config.imageUrl + itemimage
                                            var redirectLink = config.baseUrl + "marketplaceDetail/" + item_id
                                            emailActivity.Activity(toMail, subject, msg, image, redirectLink);
                                        })

                                        res.status(200).send({
                                            success: true,
                                            orderId: orderResult.insertId,
                                            msg: "NFT purchased Successfully "
                                        });

                                    } else {
                                        res.status(200).send({
                                            success: false,
                                            msg: "Something went wrong! Please try again."
                                        });
                                    }
                                });
                            });

                        });
                    });
                });
            } catch (ee) {
                console.log("ee", eeee)
            }
        });
    }

    else {
        var bidorderData = {
            "user_id": user_id,
            "item_id": item_id,
            "owner_id": owner_id,
            "bid_price": price,
            "crypto_amount": cryptoPrice,
            "address": buyerAddress,
            "amounTrxHash": amounTrxHash,
        }
        await db.query(itemQueries.userBidPlace, [bidorderData], async function (error1, orderResult) {
            if (error1) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error1
                });
            }
            //CHECK DIFFERENCE FROM EXPIRY_DATE IN MINUTES
            await db.query(itemQueries.getMinuteDiff, [item_id], async function (error1, minuteDiff) {
                if (error1) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured",
                        error1
                    });
                }
                if (minuteDiff[0].difference <= 315) {

                    await db.query(itemQueries.extendExpiry, [item_id], async function (error1, updateExp) {
                        if (error1) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured",
                                error1
                            });
                        }
                    });
                }


                //// insert into activity

                var activity = {
                    "nft_activity_type_id": 2,
                    "item_id": item_id,
                    "hash": amounTrxHash,
                    "address": buyerAddress,
                    "from_user": user_id,
                    "to_user": owner_id,
                    "amount": price
                }
                // console.log(users);
                await db.query(adminQueries.insertActivity, [activity], async function (error, accData) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }
                    ///////////////////////////////
                });
                if (orderResult) {

                    db.query(itemQueries.getOverbidUser, [item_id], async function (errorOverbid, overBidData) {
                        if (overBidData.length > 0) {
                            if (overBidData[0].id) {
                                var bidid = overBidData[0].id
                                db.query(itemQueries.updateOverbisStatus, [amounTrxHash, bidid]);
                                var subject = "Overbid";
                                var toMail = overBidData[0].email
                                var msg = "Your bid for " + overBidData[0].name + " has been overbid. <br>";
                                msg = msg + "<h3> Your bid has been refunded : " + overBidData[0].crypto_amount + " ETH has been overbid. </h3>";
                                var image = config.imageUrl + itemimage
                                var redirectLink = config.baseUrl + "marketplaceDetail/" + item_id
                                emailActivity.Activity(toMail, subject, msg, image, redirectLink);
                            }
                        }
                    })

                    db.query(itemQueries.getUserEmail, [user_id], async function (error2, userData) {
                        var subject = "Bid Placed";
                        var toMail = userData[0].email
                        var msg = "You have successfully placed bid on " + itemName;
                        var image = config.imageUrl + itemimage
                        var redirectLink = config.baseUrl + "marketplaceDetail/" + item_id
                        emailActivity.Activity(toMail, subject, msg, image, redirectLink);
                    })

                    var activityData = { "user_id": user_id, "description": `Bid Placecd for ItemID : ${item_id}` }
                    await db.query("INSERT INTO activity SET ?", activityData);
                    res.status(200).send({
                        success: true,
                        orderId: orderResult.insertId,
                        msg: "Your Bid Placed Successfully"
                    });
                } else {
                    res.status(200).send({
                        success: false,
                        msg: "Something went wrong! Please try again."
                    });
                }
            });
        });
    }

}

exports.allSearch = async (
    db, req, res) => {

    var search = (!req.body.search) ? '' : req.body.search;
    if (!search) {
        return res.status(400).send({
            success: false,
            msg: "Search parameter required"
        });
    }

    try {
        await db.query(itemQueries.allSearch, [search + '%'], async function (err, result) {
            if (err) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured ",
                    error
                });
            }
            else if (result.length > 0) {
                return res.status(200).send({
                    success: true,
                    msg: 'data  found',
                    response: result

                });
            }
            else {
                return res.status(400).send({
                    success: false,
                    msg: "No data found ",
                    data: []
                });
            }
        })



    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: `unable to add customer address due to internal error :${err}`
        });
    }
}

exports.getStatsData = async (db, req, res) => {
    await db.query(itemQueries.getStatsData, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Data get successfully",
                data: data

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

/* ----------------------------------------------------------------------------------*/
