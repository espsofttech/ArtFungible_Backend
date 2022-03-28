const CryptoJS = require("crypto-js");
var fetch = require('node-fetch');
const config = require('../config');
var validator = require("email-validator");
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const axios = require('axios');
const marketplaceQueries = require("../services/marketplaceQueries");
const adminQueries = require("../services/adminQueries");
const itemQueries = require("../services/itemQueries");
const authQueries = require("../services/authQueries");
const emailActivity = require("./emailActivity")
var FormData = require('form-data');

exports.addWishlist = async (db, req, res) => {

    var item_id = req.body.item_id;
    var user_id = req.body.user_id;

    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "Item ID required"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    var insertData = {
        "user_id": user_id,
        "item_id": item_id
    }

    await db.query(marketplaceQueries.addWishlist, [insertData], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {

            var activityData = { "user_id": user_id, "description": "Item added in wishlist" }
            await db.query("INSERT INTO activity SET ?", activityData);

            res.status(200).send({
                success: true,
                msg: "Item added to your wishlist ",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.listWishlist = async (db, req, res) => {

    var user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(marketplaceQueries.listWishlist, [user_id], function (error, data) {
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
                msg: "Your Wishlist ",
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

exports.removeWishlist = async (db, req, res) => {

    var wishlist_id = req.body.wishlist_id;
    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.removeWishlist, [wishlist_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {

            var activityData = { "user_id": user_id, "description": "Item removed in wishlist" }
            await db.query("INSERT INTO activity SET ?", activityData);

            res.status(200).send({
                success: true,
                msg: "Item Removed from your wishlist "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}


exports.addCart = async (db, req, res) => {

    var item_id = req.body.item_id;
    var user_id = req.body.user_id;

    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "Item ID required"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    var insertData = {
        "user_id": user_id,
        "item_id": item_id,
        "quantity": 1
    }
    console.log(insertData);
    await db.query(marketplaceQueries.addCart, [insertData], function (error, data) {
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
                msg: "Item added to your cart ",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.listCart = async (db, req, res) => {

    var user_id = req.body.user_id;
    var cart_id = 0;


    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(marketplaceQueries.listCart, [user_id, user_id], function (error, data) {
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
                msg: "Your Wishlist ",
                cart_total: data[0].cart_total,
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

exports.removeCart = async (db, req, res) => {

    var cart_id = req.body.cart_id;

    await db.query(marketplaceQueries.removeCart, [cart_id], function (error, data) {
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
                msg: "Item Removed from your wishlist "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}





















// Login User
exports.login = async (db, req, res) => {

    var email = req.body.email;
    var password = req.body.password;


    try {
        if (email == '') {
            return res.status(400).send({
                success: false,
                msg: "Email required "
            });
        }
        if (password == '') {
            return res.status(400).send({
                success: false,
                msg: "password required"
            });
        }
        if (!validator.validate(email)) {
            return res.status(400).send({
                success: false,
                msg: "Email is not validate"
            });
        }


        db.query(adminQueries.getUsersEmail, email, async function (error, user) {

            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "unexpected error occured",
                    error
                });
            } else if (user.length == 0) {
                return res.status(400).send({
                    success: false,
                    msg: "No User found"
                });
            }

            else {
                var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
                if (user[0].password === hash) {



                    return res.status(200).send({
                        success: true,
                        msg: "Login Successfully",
                        data: {
                            id: user[0].id,
                            user_email: user[0].email,
                            username: user[0].username,
                        }
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        msg: "Password does not match"
                    });
                }

            }



        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}

exports.getFooter = async (db, req, res) => {

    await db.query(adminQueries.getFooter, function (error, data) {
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
                msg: "Footer Details",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.updateFooter = async (db, req, res) => {

    var description = req.body.description;
    var email = req.body.email;
    var contact = req.body.contact;

    if (description == '') {
        return res.status(400).send({
            success: false,
            msg: "description required"
        });
    }

    if (email == '') {
        return res.status(400).send({
            success: false,
            msg: "email required"
        });
    }
    if (!validator.validate(email)) {
        return res.status(400).send({
            success: false,
            msg: "Email is not validate"
        });
    }
    if (contact == '') {
        return res.status(400).send({
            success: false,
            msg: "contact required"
        });
    }
    if (contact.length == '') {
        return res.status(400).send({
            success: false,
            msg: "Contact Number Length Must be 10 digit"
        });
    }


    await db.query(adminQueries.updateFooter, [description, email, contact], function (error, data) {
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
                msg: "Footer Updated",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.getWebContent = async (db, req, res) => {

    await db.query(adminQueries.getWebContent, function (error, data) {
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
                msg: "Web Content Details",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.updateWebContent = async (db, req, res) => {


    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        if (logo == '') {
            return res.status(400).send({
                success: false,
                msg: "logo required"
            });
        }
        var favicon_upload = (!files.favicon) ? null : (!files.favicon.name) ? null : files.favicon;
        var logo_upload = (!files.logo) ? null : (!files.logo.name) ? null : files.logo;
        if (title == '') {
            return res.status(400).send({
                success: false,
                msg: "title required"
            });
        }
        if (description == '') {
            return res.status(400).send({
                success: false,
                msg: "description required"
            });
        }

        if (!favicon_upload) {
            var favicon = '';

        } else {
            var oldpath = files.favicon.path;

            var filePath = "./uploads/"
            let newfilename = filePath + files.favicon.name

            // Read the file
            await fs.readFile(oldpath, async function (err, data) {
                if (err) throw err;
                // Write the file
                await fs.writeFile(newfilename, data, function (err) {
                    if (err) throw err;

                });
            });
            var favicon = files.favicon.name;

        }
        if (!logo_upload) {
            var logo = '';
        } else {
            var oldpath = files.logo.path;
            var filePath = "./uploads/"
            let newfilename = filePath + files.logo.name

            // Read the file
            await fs.readFile(oldpath, async function (err, data) {
                if (err) throw err;
                // Write the file
                await fs.writeFile(newfilename, data, function (err) {
                    if (err) throw err;

                })
            });
            var logo = files.logo.name;
        }


        var title = fields.title;
        var description = fields.description;

        db.query(adminQueries.getWebContent, function (error, result) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            var webContent = {
                "favicon": favicon,
                "logo": logo,
                "title": title,
                "description": description
            }
            if (!favicon) {
                webContent.favicon = result[0].favicon;
            }
            if (!logo) {
                webContent.logo = result[0].logo;
            }

            db.query(adminQueries.updateWebContent, webContent, function (error, data) {
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
                        msg: "Web Content Updated",

                    });
                } else {
                    res.status(400).send({
                        success: false,
                        msg: "No Data"
                    });
                }
            });
        });
    });

}

exports.insertMarketPlace = async (db, req, res) => {

    try {

        var form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {

            if (item_image == '') {
                return res.status(400).send({
                    success: false,
                    msg: "Item Image required"
                });
            }
            var item_image_upload = (!files.item_image) ? null : (!files.item_image.name) ? null : files.item_image;
            if (fields.title == '') {
                return res.status(400).send({
                    success: false,
                    msg: "title required"
                });
            }
            if (fields.price == '') {
                return res.status(400).send({
                    success: false,
                    msg: "Price required"
                });
            }
            if (!item_image_upload) {
                var item_image = '';

            } else {
                var oldpath = files.item_image.path;

                var filePath = "./uploads/"
                let newfilename = filePath + files.item_image.name

                // Read the file
                await fs.readFile(oldpath, async function (err, data) {
                    if (err) throw err;
                    // Write the file
                    await fs.writeFile(newfilename, data, function (err) {
                        if (err) throw err;

                    });
                });
                var item_image = files.item_image.name;

            }
            var title = fields.title;
            var description = fields.description;
            var author = fields.author;
            var web_link = fields.web_link;
            var price = fields.price;
            var datetime = new Date();

            var users = {
                "title": title,
                "author": author,
                "description": description,
                "item_image": item_image,
                "web_link": web_link,
                "price": price,
                "datetime": datetime
            }
            db.query(adminQueries.insertMarketPlace, [users], function (error, result) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured",
                        error
                    });
                }
                if (result) {
                    res.status(200).send({
                        success: true,
                        msg: "Inserted Successfully",
                    });
                } else {
                    res.status(200).send({
                        success: true,
                        msg: "Insertion Failed",
                    });
                }
            })
        });

    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}

exports.getMarketPlace = async (db, req, res) => {


    await db.query(adminQueries.getMarketPlace, function (error, data) {
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
                msg: "Market Places",
                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.listItem = async (db, req, res) => {

    var trending = req.body.trending;
    var topselling = req.body.topselling;
    var sold = req.body.sold;
    var order_by = req.body.order_by;
    var category_id = req.body.category_id;
    //    var orderby = req.body.orderby;

    var qry = " Select id, name,description,image,owner,item_category_id,token_id,price from item where 1 ";
    if (trending === '0' && topselling === '0' && sold === '0') {
        var qry = " Select id,name,description,image,owner,item_category_id,token_id,price from item where 1 ";
    } else {

        if (trending === '1') {
            qry = qry + ' and is_trending = 1';
        }

        if (sold === '1') {
            qry = qry + ' and is_sold = 1'
        }

        if (topselling === '1') {
            qry = qry + ' and is_trending = 1'
        }

    }

    if (category_id != '0') {
        qry = qry + ' and item_category_id =' + category_id
    }

    if (order_by === '1') {
        qry = qry + ' order by id'
    }

    if (order_by === '2') {
        qry = qry + ' order by id desc'
    }

    if (order_by === '3') {
        qry = qry + ' order by price'
    }
    if (order_by === '4') {
        qry = qry + ' order by price desc'
    }
    if (order_by === '5') {
        qry = qry + ' order by datetime'
    }
    if (order_by === '6') {
        qry = qry + ' order by datetime desc'
    }

    await db.query(qry, function (error, data) {
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

                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.listSingleItem = async (db, req, res) => {

    var item_id = req.body.item_id;
    await db.query(adminQueries.listSingleItem, item_id, function (error, data) {
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

                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.insertCategory = async (db, req, res) => {

    var name = req.body.name;
    var ip = null;
    var datetime = new Date();

    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }
    var users = {
        "name": name,
        "ip": ip,
        "datetime": datetime
    }

    await db.query(adminQueries.insertCategory, [users], function (error, data) {
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
                msg: "Insert  Category Successfully "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Insertion Failed"
            });
        }
    });
}

exports.getCategory = async (db, req, res) => {

    await db.query(adminQueries.Category, function (error, data) {
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
                msg: "Category Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.singleCategory = async (db, req, res) => {

    var id = req.body.id;

    await db.query(adminQueries.singleCategory, [id], function (error, data) {
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
                msg: "Category Single Item Details",
                response: data[0]
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.updateCategory = async (db, req, res) => {

    var id = req.body.id;
    var name = req.body.name;
    var ip = null;
    var datetime = new Date();

    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }
    var users = {
        "name": name,
        "ip": ip,
        "datetime": datetime
    }

    await db.query(adminQueries.updateCategory, [users, id], function (error, data) {
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
                msg: "Category Item Updated Successfully "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Updation Failed"
            });
        }
    });
}


exports.deleteCategory = async (db, req, res) => {

    var id = req.body.id;

    await db.query(adminQueries.deleteCategory, [id], function (error, data) {
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
                msg: "Category Item Deleted Successfully "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}

/* -------------------Insert Item -------------------------*/
exports.insertItem = async (db, req, res) => {


    var name = req.body.name;
    var description = req.body.description;
    var image = req.body.image;
    var image = req.body.image;
    var owner = req.body.owner;
    var item_category_id = req.body.item_category_id;
    // var token_id = req.body.token_id;
    var price = req.body.price;

    var ip = null;
    var datetime = new Date();


    if (name = '') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }
    if (!image) {
        return res.status(400).send({
            success: false,
            msg: "image required "
        });
    }
    if (!owner) {
        return res.status(400).send({
            success: false,
            msg: "owner required "
        });
    }
    // if (!token_id) {
    //     return res.status(400).send({
    //         success: false,
    //         msg: "token_id required "
    //     });
    // }
    if (!price) {
        return res.status(400).send({
            success: false,
            msg: "Price required "
        });
    }

    var users = {
        "name": name,
        "description": description,
        "image": image,
        "owner": owner,
        "item_category_id": item_category_id,
        //    "token_id" : token_id,
        "price": price,
        "ip": ip,
        "datetime": datetime
    }

    await db.query(adminQueries.insertItem, [users], function (error, data) {
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
                msg: "Insert Item  Successfully "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Insertion Failed"
            });
        }
    });
}

exports.getItem = async (db, req, res) => {

    await db.query(adminQueries.getItem, function (error, data) {
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
                msg: "Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.updateItem = async (db, req, res) => {

    var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var image = req.body.image;
    var owner = req.body.owner;
    var item_category_id = req.body.item_category_id;
    // var token_id = req.body.token_id;
    var price = req.body.price;
    var ip = null;
    var datetime = new Date();

    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }
    if (image == '') {
        return res.status(400).send({
            success: false,
            msg: "image required "
        });
    }
    if (owner == '') {
        return res.status(400).send({
            success: false,
            msg: "owner required "
        });
    }
    // if (token_id=='') {
    //     return res.status(400).send({
    //         success: false,
    //         msg: "token_id required "
    //     });
    // }
    if (price == '') {
        return res.status(400).send({
            success: false,
            msg: "Price required "
        });
    }
    await db.query(adminQueries.getItem, async function (error, result) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        var users = {
            "name": name,
            "description": description,
            "image": image,
            "owner": owner,
            "item_category_id": item_category_id,
            // "token_id" : token_id,
            "price": price,
            "ip": ip,
            "datetime": datetime
        }
        if (!image) {
            users.image = result[0].image;
        }

        await db.query(adminQueries.updateItem, [users, id], function (error, data) {
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
                    msg: "Item Updated Successfully "
                });
            } else {
                res.status(200).send({
                    success: false,
                    msg: "Updation Failed"
                });
            }
        });
    });
}

exports.deleteItem = async (db, req, res) => {

    var id = req.body.id;
    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "ID required "
        });
    }

    await db.query(adminQueries.deleteItem, [id], function (error, data) {
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
                msg: "Item Delete Successfully"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}


exports.getNftList = async (db, req, res) => {
    var sell_type = req.body.sell_type
    var file_type = JSON.stringify(req.body.file_type)
    var locationtype = req.body.locationtype

    var qry = "SELECT item.*, coalesce(getMaxBid(id,owner_id),price) as maxbid FROM item WHERE 1 "
    if (file_type) {
        qry = qry + ` AND file_type = ${file_type}`
    }
    if (sell_type) {
        qry = qry + ` AND sell_type = ${sell_type}`
    }

    if (locationtype == 'slider') {
        qry = qry + ` AND slider_status = 1`
    }

    if (locationtype == 'auction') {
        qry = qry + ` AND live_auction_status = 1`
    }

    if (locationtype == 'recent') {
        qry = qry + ` AND recent_highlight_status = 1`
    }

    qry = qry + " ORDER BY id DESC limit 9"

    await db.query(qry, function (error, data) {
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
                msg: "Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.getBidDetail = async (db, req, res) => {
    var item_id = req.body.item_id
    var owner_id = req.body.owner_id

    await db.query(marketplaceQueries.getBidDetail, [item_id, owner_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Item Bid Details",
                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.bidAccept = async (db, req, res) => {
    var user_id = req.body.user_id;
    var owner_name = req.body.user_name;
    var bid_id = req.body.bid_id;
    var transfer_hash = req.body.hash
    await db.query(marketplaceQueries.getBidRecord, [bid_id], async function (error, biddata) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Bid data not found!",
                error
            });
        }
        var item_id = biddata[0].item_id
        var owner_id = biddata[0].owner_id
        await db.query(`SELECT i.*,s.admin_commission,s.royalty_commission FROM item as i cross join settings as s where i.id=${item_id}`, async function (itemError, itemDetail) {
            if (itemError) {
                return res.status(400).send({
                    success: false,
                    msg: adminError
                });
            }
            var commission = itemDetail[0].admin_commission;
            var royalty = itemDetail[0].royalty_commission;
            var old_owner = itemDetail[0].owner_id;
            await db.query("SELECT * FROM admin_wallet limit 1", async function (adminError, adminWallet) {
                if (adminError) {
                    return res.status(400).send({
                        success: false,
                        msg: adminError
                    });
                }
                var from_address = adminWallet[0].admin_address;
                var to_address = biddata[0].address;

                await db.query(`SELECT * FROM orders WHERE item_id =  ${item_id} AND user_id = ${owner_id} ORDER BY id DESC `, async function (err, itemDetails) {
                    var itemOwner = from_address
                    if (itemDetails[0]?.buyerAddress) {
                        var itemOwner = itemDetails[0].buyerAddress
                    }






                    var dataUpdate = {
                        "is_sold": 1,
                        "owner": owner_name,
                        "owner_id": user_id,
                        "is_resale": 0,
                        "price": biddata[0].bid_price,
                    }

                    await db.query(itemQueries.buyItem, [dataUpdate, item_id], async function (error, dataResult) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured",
                                error
                            });
                        }

                        var acceptBidArr = {
                            status: 1
                        }

                        var rejectBidArr = {
                            status: 2
                        }

                        db.query(itemQueries.acceptBid, [acceptBidArr, bid_id]); // Update Status for accept bid
                        db.query(itemQueries.rejectBid, [rejectBidArr, bid_id, item_id]); // Update Status for reject bid

                        var orderData = {
                            "user_id": user_id,
                            "owner_id": old_owner,
                            "item_id": item_id,
                            "price": biddata[0].bid_price,
                            "status": 1,
                            "buyerAddress": to_address,
                            "amounTrxHash": biddata[0].amounTrxHash,
                            "transfer_hash": transfer_hash,
                            "seller_trx_hash": transfer_hash,
                            "currency": "ETH",
                            "trx_amount": biddata[0].crypto_amount,
                            "trx_type": "Crypto",
                            "is_resale": 0
                        }
                        // console.log(orderData);
                        await db.query(itemQueries.orderForBuyItem, [orderData], async function (error1, orderResult) {
                            if (orderResult) {

                                //// insert into activity

                                var activity = {
                                    "nft_activity_type_id": 4,
                                    "item_id": item_id,
                                    "hash": biddata[0].amounTrxHash,
                                    "address": to_address,
                                    "from_user": old_owner,
                                    "to_user": user_id,
                                    "amount": biddata[0].bid_price
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
                                var commisionData = (parseFloat(biddata[0].bid_price) * parseFloat(commission)) / 100
                                var royaltyData = (parseFloat(biddata[0].bid_price) * parseFloat(royalty)) / 100
                                var txData = {
                                    "item_id": item_id,
                                    "hash": biddata[0].amounTrxHash,
                                    "address": to_address,
                                    "user_id": user_id,
                                    "Totalamount": biddata[0].bid_price,
                                    "commision": commisionData,
                                    "royalty": royaltyData,
                                    "itemamount": (parseFloat(biddata[0].bid_price)) - (parseFloat(commisionData) + parseFloat(royaltyData)),
                                    "status": 2,
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


                                    db.query(itemQueries.getUserEmail, [user_id], async function (error2, userData) {
                                        var subject = "Bid Accepted";
                                        var toMail = userData[0].email
                                        var image = config.imageUrl + biddata[0].mainimage
                                        var msg = "Your bid for " + biddata[0].name + " has been accepted successfully.";
                                        var redirectLink = config.baseUrl + "marketplaceDetail/" + item_id
                                        emailActivity.Activity(toMail, subject, msg, image, redirectLink);
                                    })

                                    // await db.query(itemQueries.getRefundWallet, [item_id], async function (error2, refundUserWallets) {
                                    //     var addressArr = []; var amountArr = []
                                    //     for(var i=0; i < refundUserWallets.length; i++){
                                    //         addressArr[i] = refundUserWallets[i].address;
                                    //         amountArr[i] = refundUserWallets[i].crypto_amount;
                                    //     }

                                    //     var refundAmountArr = JSON.stringify({
                                    //         "from_address": from_address,
                                    //         "from_private_key": from_private_key,
                                    //         "contract_address": `${config.contract}`,
                                    //         "to_address": addressArr,
                                    //         "amount": amountArr
                                    //     })

                                    //     const refundResponse1 = await fetch(config.blockchainApiUrl+'refund', {
                                    //         method: 'POST', headers: {
                                    //             'Accept': 'application/json',
                                    //             'Content-Type': 'application/json'
                                    //         },
                                    //         body: refundAmountArr
                                    //     });

                                    //     const refundRes = await refundResponse1.json();
                                    //     if(refundRes.hash){
                                    //         var refHash = {
                                    //             'refund_hash' : refundRes.hash
                                    //         };
                                    //         db.query(itemQueries.updateRefundHash, [refHash ,item_id]);
                                    //     }
                                    // })

                                    var activityData = { "user_id": user_id, "description": `Item purchesed! ItemID : ${biddata[0].token_id}` }
                                    await db.query("INSERT INTO activity SET ?", activityData);
                                    res.status(200).send({
                                        success: true,
                                        orderId: orderResult.insertId,
                                        msg: "Bid has been accepted successfully"
                                    });
                                });
                            } else {
                                res.status(200).send({
                                    success: false,
                                    msg: "Something went wrong! Please try again."
                                });
                            }
                        });

                    });

                })


            });
        });

    });
}


exports.bidReject = async (db, req, res) => {
    // var user_id = req.body.user_id
    var bid_id = req.body.bid_id;
    var item_id = req.body.item_id;
    var transfer_hash = req.body.hash
    await db.query(marketplaceQueries.getBidRecord, [bid_id], async function (error, biddata) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Bid data not found!",
                error
            });
        }

        if (biddata.length == 0) {
            return res.status(400).send({
                success: false,
                msg: "Invailid Bid ID!",
                error
            });
        }
        console.log(biddata[0]);
        var user_id = biddata[0].user_id


        var dataUpdate = {
            "is_sold": 0,
            "is_resale": 0,
        }

        await db.query(itemQueries.buyItem, [dataUpdate, item_id], async function (error, dataResult) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }


            var rejectBidArr = {
                status: 2
            }

            db.query(itemQueries.acceptBid, [rejectBidArr, bid_id]); // Update Status for accept bid


            //// insert into activity

            var activity = {
                "nft_activity_type_id": 6,
                "item_id": item_id,
                "hash": transfer_hash,
                "address": biddata[0].to_address,
                "to_user": biddata[0].owner_id,
                "amount": biddata[0].bid_price
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


            db.query(itemQueries.getUserEmail, [user_id], async function (error2, userData) {
                var subject = "Bid Rejected";
                var toMail = userData[0].email
                var image = config.imageUrl + biddata[0].mainimage
                var msg = "Your bid for " + biddata[0].name + " has been Rejected successfully.";
                var redirectLink = config.baseUrl + "marketplaceDetail/" + item_id
                emailActivity.Activity(toMail, subject, msg, image, redirectLink);
            })


            var activityData = { "user_id": user_id, "description": `Item Rejected! ItemID : ${biddata[0].token_id}` }
            await db.query("INSERT INTO activity SET ?", activityData);
            res.status(200).send({
                success: true,
                msg: "Bid has been Rejected successfully"
            });



        })

    })

}

// exports.bidReject = async (db, req, res) => {

//     var id = req.body.bid_id;
//     var item_id = req.body.item_id;
//     var status = 2;

//     await db.query(adminQueries.updateBidStatus, [item_id, status, id], async function (error, data) {
//         var id = req.body.item_id;
//         var is_sold = 0;
//         var is_resale = 0;


//         await db.query(adminQueries.updateItemData, [is_sold, is_resale, id], function (error, data) {
//         if (error) {
//             return res.status(400).send({
//                 success: false,
//                 msg: "error occured",
//                 error
//             });
//         }
//         if (data) {
//             res.status(200).send({
//                 success: true,
//                 msg: "Bid Amount Refund Successfully!!",

//             });
//         } else {
//             res.status(200).send({
//                 success: false,
//                 msg: "Updation Error "
//             });
//         }
//     })
//     });
// }




/* -------------------End Item -------------------------*/

exports.resaleItem = async (db, req, res) => {

    var id = req.body.id;
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var expiry_date = req.body.expiry_date;
    var start_date = req.body.start_date;
    var sell_type = req.body.sell_type;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "id required "
        });
    }

    if (!amount) {
        return res.status(400).send({
            success: false,
            msg: "Amount required "
        });
    }

    var dataUpdate = {
        "is_sold": 0,
        "is_resale": 1,
        "price": amount,
        "expiry_date": expiry_date,
        "start_date": start_date,
        "sell_type": sell_type
    }

    await db.query(marketplaceQueries.buyItem, [dataUpdate, id], async function (error, dataResult) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        //// insert into activity

        var activity = {
            "nft_activity_type_id": 5,
            "item_id": id,
            "from_user": user_id,
            "amount": amount
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
        if (dataResult) {
            var activityData = { "user_id": user_id, "description": `Item added for resale! ItemID : 1` }
            var orderResult = await db.query("INSERT INTO activity SET ?", activityData);
            if (orderResult)
                res.status(200).send({
                    success: true,
                    orderId: orderResult.insertId,
                    msg: "Item Resale Successfully "
                });
        } else {
            res.status(200).send({
                success: false,
                msg: "Something went wrong! Please try again."
            });
        }
    });
}


exports.myBidItem = async (db, req, res) => {
    console.log("in myBidItem");
    var user_id = req.body.user_id
    await db.query(marketplaceQueries.myBidItem, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Item bid detail!!",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.createMetadata = async (db, req, res) => {
    console.log(" in createMetadata");
    var additem = req.body;
    var userfile = 'item_'.concat('metadata.json');
    fs.writeFile(`./metadata/${userfile}`, JSON.stringify(additem), async (err, fd) => {
        // Checking for errors
        if (err) throw err;
        console.log("Done writing"); // Success
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        let formdata = new FormData();
        formdata.append('file', fs.createReadStream('./metadata/' + userfile));
        const response2 = await fetch(url, {
            method: 'POST', headers: {
                // 'Content-Type' : `application/json;boundary=${formdata._boundary}`,
                'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
                'pinata_api_key': '856f580ed9c0f2715b45',
                'pinata_secret_api_key': '2dd1305d32198f643db71dd781fa8c1269f5afede54cfcccf9e8647a71114b40'
            },
            body: formdata
        });
        const filedata = await response2.json();
        if (filedata) {
            return res.status(200).send({
                success: true,
                msg: "Metadata uploaded !!",
                hash: filedata
            });
        }
        else {
            return res.status(400).send({
                success: false,
                msg: "Unexpected internal error!!",
                err
            });
        }
    });
}

//============================================  get Transaction list  =======================================

exports.BidData = async (db, req, res) => {
    try {
        db.query(marketplaceQueries.BidData, function (error, result) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            if (result.length > 0) {
                return res.status(200).send({
                    success: true,
                    msg: "Bid Data",
                    response: result
                })
            } else {
                return res.status(400).send({
                    success: false,
                    msg: "No Data"
                })
            }
        })

    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}