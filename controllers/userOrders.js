const CryptoJS = require("crypto-js");
var fetch = require('node-fetch');
const config = require('../config');
var validator = require("email-validator");
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const axios = require('axios');
const OrdersQueries = require("../services/OrdersQueries");
const authQueries = require("../services/authQueries");


exports.getUserOrder = async (db, req, res) => {
    
    var filter_type = req.body.filter_type;//filter_type (0=all,1= 30days,2=latestToday)
    var user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }


    if(parseInt(filter_type) == 1){
        var sql = OrdersQueries.get30DaysOldOrder;
    }else if(parseInt(filter_type) == 2){
        var sql = OrdersQueries.getTodaysOrder;
    }else{
        var sql = OrdersQueries.getAllOrder;
    }
    await db.query(sql, [user_id,user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                data:data,

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.getMybidsAPI = async (db, req, res) => {
    var user_id = req.body.user_id;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(OrdersQueries.getMyBids , [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                data:data,

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.getProductsbidsAPI = async (db, req, res) => {
    var item_id = req.body.item_id;
    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(OrdersQueries.getItemBids , [item_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                data:data,

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}


exports.getOrderDetails = async (db, req, res) => {
    
    var id = req.body.id;

    if (!id) {
        return res.status(400).send({
            success: false,
            msg: "transaction ID required"
        });
    }

    await db.query(OrdersQueries.getOrderDetails, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                data:data[0],

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.getUserBidDetails = async (db, req, res) => {
    
    var id = req.body.id;

    if (!id) {
        return res.status(400).send({
            success: false,
            msg: "transaction ID required"
        });
    }

    await db.query(OrdersQueries.getUserBidDetails, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                data:data[0],

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.getUserActivity = async (db, req, res) => {
    
    var user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }


    await db.query(OrdersQueries.getUserActivity, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                response:data,

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}


exports.saveContactForm = async (db, req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var comment = req.body.comment;
    var captcha_code = req.body.captcha_code;
    
    if (!name) {
        return res.status(200).send({
            success: false,
            msg: "Name required"
        });
    }

    if (!email) {
        return res.status(200).send({
            success: false,
            msg: "Email required"
        });
    }

    if (!subject) {
        return res.status(200).send({
            success: false,
            msg: "Subject required"
        });
    }

    if (!comment) {
        return res.status(200).send({
            success: false,
            msg: "Comment required"
        });
    }  

    if (!captcha_code) {
        return res.status(200).send({
            success: false,
            msg: "Captcha required"
        });
    }      

    var arr = {
        'name' : name,
        'email' : email,
        'subject' : subject,
        'comment' : comment
    }

    await db.query(authQueries.saveContactRequest, arr ,function (error, data) {
        if (error) {
            return res.status(200).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Contact form submitted successfully."

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}


exports.saveHelpCenterForm = async (db, req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var comment = req.body.comment;
    var captcha_code = req.body.captcha_code;
    
    if (!name) {
        return res.status(200).send({
            success: false,
            msg: "Name required"
        });
    }

    if (!email) {
        return res.status(200).send({
            success: false,
            msg: "Email required"
        });
    }

    if (!subject) {
        return res.status(200).send({
            success: false,
            msg: "Subject required"
        });
    }

    if (!comment) {
        return res.status(200).send({
            success: false,
            msg: "Comment required"
        });
    }  

    if (!captcha_code) {
        return res.status(200).send({
            success: false,
            msg: "Captcha required"
        });
    }      

    var arr = {
        'name' : name,
        'email' : email,
        'subject' : subject,
        'comment' : comment
    }

    await db.query(authQueries.saveHelpCenterRequest, arr ,function (error, data) {
        if (error) {
            return res.status(200).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Your Query has been submitted."

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.getCategoryName = async (db, req, res) => {
    var category_id = req.body.category_id;
    await db.query(authQueries.getCategoryName, category_id ,function (error, data) {
        if (error) {
            return res.status(200).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                response : data[0],
                msg: "Category Get Successfully"

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.getMultipleImages = async (db, req, res) => {
    var id = req.body.product_id;
    await db.query(authQueries.getProductImages, id ,function (error, data) {
        if (error) {
            return res.status(200).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                response : data[0],
                msg: "Images get Successfully"

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}

exports.gerUserRefundManagement = async (db, req, res) => {
    var user_id = req.body.user_id;
    await db.query(authQueries.gerUserRefundManagementQry, user_id ,function (error, data) {
        if (error) {
            return res.status(200).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                response : data,
                msg: "Data Get Successfully"

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No records found!"
            });
        }
    });
}