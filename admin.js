const CryptoJS = require("crypto-js");
var fetch = require('node-fetch');
const config = require('../../config');
const adminQueries = require("../../services/adminQueries");
var validator = require("email-validator");
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const axios = require('axios');
var FormData = require('form-data');
const { filter } = require("bluebird");
const itemQueries = require("../../services/itemQueries");

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
                            user_email: user[0].email

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
        // console.log(err)
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
    var rarity = req.body.rarity;
    var nftType = req.body.nftType;

    //    var orderby = req.body.orderby;
    var qry = " Select i.id, i.increasing_amount , cast(coalesce(getMaxBid(i.id),i.price) as decimal) as price1 , i.file_type ,i.name, i.description, i.image, i.owner, i.item_category_id, i.token_id, coalesce(getMaxBid(i.id),i.price) + i.increasing_amount as price , i.is_sold, rarity.icon from item as i LEFT JOIN rarity ON i.rarity = rarity.id where 1 ";
    if (trending === '0' && topselling === '0' && sold === '0') {
        var qry = " Select i.id, i.increasing_amount, cast(coalesce(getMaxBid(i.id),i.price) as decimal) as price1 , i.file_type, i.name, i.description, i.image, i.owner, i.item_category_id, i.token_id, coalesce(getMaxBid(i.id),i.price) + i.increasing_amount as price , i.is_sold, rarity.icon from item as i LEFT JOIN rarity ON i.rarity = rarity.id where 1 ";
    } else {

        if (trending === '1') {
            qry = qry + ' and i.is_trending = 1';
        }

        if (sold === '1') {
            qry = qry + ' and i.is_sold = 1'
        }

        if (topselling === '1') {
            qry = qry + ' and i.is_trending = 1'
        }

    }

    if (nftType) {
        qry = qry + ' and i.sell_type = ' + nftType
    }

    if (category_id != '0') {
        qry = qry + ' and i.item_category_id =' + category_id
    }
    if (parseFloat(rarity) > 0) {
        qry = qry + ' and rarity.id =' + rarity
    }

    if (order_by === '1') {
        qry = qry + ' order by i.id'
    }

    if (order_by === '2') {
        qry = qry + ' order by i.id desc'
    }

    if (order_by === '3') {
        qry = qry + ' order by price1 ASC'
    }
    if (order_by === '4') {
        qry = qry + ' order by price1 desc'
    }
    if (order_by === '5') {
        qry = qry + ' order by i.datetime DESC'
    }
    if (order_by === '6') {
        qry = qry + ' order by i.datetime ASC'
    }

    if (order_by === '7') {
        qry = qry + ' AND i.is_sold = 1 order BY i.id desc'
    }
    if (order_by === '8') {
        qry = qry + ' AND i.is_sold = 0 order BY i.id desc'
    }

    if (order_by == "0") {
        qry = qry + ' order by i.id desc'
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
                msg: "Item not found"
            });
        }
    });
}

exports.listSingleItem = async (db, req, res) => {

    var item_id = req.body.item_id;
    var user_id = req.body.user_id;
    await db.query(adminQueries.listSingleItem, [user_id, user_id, item_id], function (error, data) {
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
    var description = req.body.description;
    var ip = null;
    var datetime = new Date();

    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }

    if (description == '') {
        return res.status(400).send({
            success: false,
            msg: "description required "
        });
    }

    var users = {
        "name": name,
        "description": description,
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

exports.getrarity = async (db, req, res) => {

    await db.query(adminQueries.Rarity, function (error, data) {
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
                msg: "Rarity get successfully",
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
    var description = req.body.description;
    var ip = null;
    var datetime = new Date();

    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }

    if (description == '') {
        return res.status(400).send({
            success: false,
            msg: "description required "
        });
    }

    var users = {
        "name": name,
        "description": description,
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
                msg: "Category  Updated Successfully "
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
                msg: "First You Delete All Item in this Category",
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
    var itemname = req.body.itemname;
    var description = req.body.description;
    var image = req.body.image;
    var owner = req.body.owner;
    var seller_wallet = req.body.seller_wallet;
    var item_category_id = req.body.item_category_id;
    var price = req.body.price;
    var rarity = req.body.rarity;
    var file_type = req.body.file_type;
    var sell_type = req.body.sell_type;
    var increasing_amount = req.body.increasing_amount;
    var multiple_image = req.body.multiple_image;
    var multiple_image_type = req.body.multiple_image_type;

    multiple_image = JSON.parse(multiple_image);
    multiple_image_type = JSON.parse(multiple_image_type);

    var ip = null;
    var datetime = new Date();

    if (!seller_wallet) {
        seller_wallet = ""
    }

    if (!itemname) {
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

    if (!price) {
        return res.status(400).send({
            success: false,
            msg: "Price required "
        });
    }

    if (!sell_type) {
        return res.status(400).send({
            success: false,
            msg: "Sell type required "
        });
    }
    await db.query("SELECT * FROM admin_wallet limit 1", async function (adminError, adminWallet) {
        if (adminError) {
            return res.status(400).send({
                success: false,
                msg: adminError
            });
        }

        var from_address = adminWallet[0].admin_address;
        var from_private_key = adminWallet[0].admin_private_key;
        var to_address = adminWallet[0].admin_address;

        var mintPostArr = JSON.stringify({
            "from_address": from_address,
            "from_private_key": from_private_key,
            "contract_address": `${config.contract}`,
            "to_address": to_address,
            "hash": `${image}`,
            "tokenMetaData": `https://ipfs.io/ipfs/${image}`,
            "creatore_address": (seller_wallet) ? seller_wallet : from_address
        })
        console.log(mintPostArr);
        const response1 = await fetch(config.blockchainApiUrl + 'mint', {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: mintPostArr
        });

        const data1 = await response1.json();
        console.log(data1);
        if (data1.newTokenID == 0) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        // console.log(data1);
        var users = {
            "name": itemname,
            "description": description,
            "image": image,
            "file_type": file_type,
            "owner": owner,
            "item_category_id": item_category_id,
            "rarity": rarity,
            "increasing_amount": increasing_amount,
            "token_id": data1.newTokenID,
            "token_hash": data1.hash,
            "price": price,
            "seller_wallet": seller_wallet,
            "sell_type": sell_type,
            "ip": ip,
            "datetime": datetime
        }
        // console.log(users);
        await db.query(adminQueries.insertItem, [users], function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            if (data) {

                for (let i = 0; i < multiple_image.length; i++) {
                    if (i >= 0) {
                        var insertData = {
                            "item_id": data.insertId,
                            "name": multiple_image[i],
                            "type": multiple_image_type[i],
                            "ip": null,
                            "datetime": new Date()
                        }
                        db.query(adminQueries.additemimages, [insertData])
                    };

                }

                /**---------------------------IPFS Json ---------------------------------- */
                var additem = {
                    "name": itemname,
                    "description": description,
                    "image": 'https://ipfs.io/ipfs/' + image
                }
                var userfile = 'item_'.concat(data.insertId, '.json');
                // console.log(additem);
                // console.log(userfile);

                fs.writeFile(`./metadata/${userfile}`, JSON.stringify(additem), async (err, fd) => {
                    // Checking for errors
                    if (err) throw err;
                    // console.log("Done writing"); // Success

                    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

                    let formdata = new FormData();

                    formdata.append('file', fs.createReadStream('./metadata/' + userfile));

                    //   console.log(fs.createReadStream('./metadata/'+userfile)); // Success
                    var filedata = await axios.post(url,
                        formdata,
                        {
                            maxContentLength: 'ArtFungible', //this is needed to prevent axios from erroring out with large files
                            headers: {
                                // 'Content-Type' : `application/json;boundary=${formdata._boundary}`,
                                'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
                                'pinata_api_key': '942cdb6c2004196f97b2',
                                'pinata_secret_api_key': 'efd2df5fe946f5749cdc0249a7b1ef55a46e5c55fb50d683e40b6fe3944d801e'
                            }
                        }
                    )
                    // console.log(filedata.data.IpfsHash);

                    db.query(adminQueries.updatemeta, [filedata.data.IpfsHash, data.insertId], (error, data235) => {
                        console.log(data235);
                    })

                });

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
    });
}

exports.getItem = async (db, req, res) => {
    var filterType = req.body.filterType;
    var category = req.body.category;

    var qry = "SELECT it.*, it.id as item_id ,ct.id,ct.name as category_name FROM item as it LEFT JOIN item_category as ct ON ct.id=it.item_category_id WHERE 1 "

    if (filterType == 1) {
        qry = qry + `AND it.is_sold = 1`
    } else if (filterType == 2) {
        qry = qry + `AND it.is_sold = 0`
    } else if (filterType == 3) {
        qry = qry + `AND it.sell_type = 1`
    } else if (filterType == 4) {
        qry = qry + `AND it.sell_type = 2`
    }

    if (category) {
        qry = qry + ` AND it.item_category_id = ${category}`
    }

    qry = qry + ` order by it.id desc`

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
                success: true,
                msg: "No Data"
            });
        }
    });
}

exports.updateItem = async (db, req, res) => {

    var id = req.body.id;
    var itemname = req.body.itemname;
    var description = req.body.description;
    var item_category_id = req.body.item_category_id;
    var price = req.body.price;
    var seller_wallet = req.body.seller_wallet;
    var sell_type = req.body.sell_type;
    var rarity = req.body.rarity;
    var slider_status = req.body.slider_status;
    var live_auction_status = req.body.live_auction_status;
    var recent_highlight_status = req.body.recent_highlight_status;
    var increasing_amount = req.body.increasing_amount;

    if (sell_type == 1) {
        increasing_amount = 0
    }

    var ip = null;
    var datetime = new Date();

    if (!itemname) {
        return res.status(400).send({
            success: false,
            msg: "name required "
        });
    }
    if (!price) {
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
            "name": itemname,
            "description": description,
            "item_category_id": item_category_id,
            "price": price,
            "seller_wallet": seller_wallet,
            "sell_type": sell_type,
            "rarity": rarity,
            "slider_status": slider_status,
            "live_auction_status": live_auction_status,
            "recent_highlight_status": recent_highlight_status,
            "increasing_amount": increasing_amount
        }
        // console.log(users);
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


exports.dashboardItem = async (db, req, res) => {

    await db.query(adminQueries.dashItem, function (error, data) {
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

exports.getUsers = async (db, req, res) => {

    await db.query(adminQueries.getUsers, function (error, data) {
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
                msg: "Users Details",
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

exports.deleteUser = async (db, req, res) => {

    var id = req.body.id;
    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "ID required "
        });
    }

    await db.query(adminQueries.getSingleUser, [id], function (error, userData) {

        var email = userData[0].email
        var arr = {
            'is_delete': 1,
            'email': email + '_' + id + '_DELETED'
        }

        db.query(adminQueries.deleteUserFromAdmin, [arr, id], function (error, data) {
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
                    msg: "User Delete Successfully"
                });
            } else {
                res.status(200).send({
                    success: false,
                    msg: "Deletion Failed"
                });
            }
        });
    })

}



exports.changePassword = async (db, req, res) => {

    var email = req.body.email;
    var currentPassword = req.body.currentPassword;
    var password = req.body.password;
    var password2 = req.body.password2;

    try {
        if (currentPassword == '') {
            return res.status(200).send({
                success: false,
                msg: "Current Password required "
            });
        }

        if (password == '') {
            return res.status(200).send({
                success: false,
                msg: "New Password required "
            });
        }
        if (password2 == '') {
            return res.status(200).send({
                success: false,
                msg: "Re-Type Password required "
            });
        }
        if (password != password2) {
            return res.status(200).send({
                success: false,
                msg: "New Password and Re-type Password not Match"
            });
        }

        db.query(adminQueries.getPassword, [email], function (error, result) {

            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            // console.log('result',result);
            const hashpassword = CryptoJS.SHA256(currentPassword).toString(CryptoJS.enc.Hex);
            if (result[0].password == hashpassword) {

                const newpassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

                db.query(adminQueries.updatepassword, [newpassword, email], function (error, result) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }
                    if (result) {
                        return res.status(200).send({
                            success: true,
                            msg: "Password Changed Successfully"
                        })
                    } else {
                        return res.status(400).send({
                            success: false,
                            msg: "Password Changed Failed due to Error"
                        })
                    }
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Current Password Wrong"
                })

            }
        });
    }
    catch (err) {
        //  console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}

exports.getProfilePic = async (db, req, res) => {
    var email = req.body.email;

    await db.query(adminQueries.getProfile, [email], function (error, data) {
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
                msg: "Profile Pic",
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


exports.insertProfilePic = async (db, req, res) => {

    try {
        var form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {

            if (profile_pic == '') {
                return res.status(400).send({
                    success: false,
                    msg: "Profile Pic required"
                });
            }
            var profile_pic_upload = (!files.profile_pic) ? null : (!files.profile_pic.name) ? null : files.profile_pic;

            if (!profile_pic_upload) {
                var profile_pic = '';

            } else {
                var oldpath = files.profile_pic.path;

                var filePath = "./uploads/"
                let newfilename = filePath + files.profile_pic.name

                // Read the file
                await fs.readFile(oldpath, async function (err, data) {
                    if (err) throw err;
                    // Write the file
                    await fs.writeFile(newfilename, data, function (err) {
                        if (err) throw err;

                    });
                });
                var profile_pic = files.profile_pic.name;

            }
            var email = fields.email;

            db.query(adminQueries.updateProfile, [profile_pic, email], function (error, result) {
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
                        msg: "Update Profile Successfully",
                    });
                } else {
                    res.status(200).send({
                        success: true,
                        msg: "update Profile Failed",
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



exports.orderDetail = async (db, req, res) => {

    await db.query(adminQueries.getOrderDetail, function (error, data) {
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
                msg: "Orders Details",
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


exports.adminWalletDetail = async (db, req, res) => {

    await db.query(adminQueries.adminwallet, async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }

        if (data.length > 0) {
            const response1 = await fetch('http://52.66.202.69:8080/api/nft/getBalance', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "address": data[0].admin_address })
            });
            const data1 = await response1.json();

            const response2 = await fetch('http://52.66.202.69:8080/api/nft/getBalance', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "address": data[0].contract_owner_address })
            });
            const data2 = await response2.json();

            res.status(200).send({
                success: true,
                msg: "Admin Details",
                //all Data
                data: data[0],
                //Admin
                response: data1,
                //contract admin
                response1: data2
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.updateAdminWallet = async (db, req, res) => {

    var id = 1;
    var admin_address = req.body.admin_address;
    var admin_private_key = req.body.admin_private_key;

    await db.query(adminQueries.updateadminwallet, [admin_address, admin_private_key, id], function (error, data) {
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
                msg: "Admin Wallet Updated",

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Updation Error "
            });
        }
    });
}

exports.soldNft = async (db, req, res) => {
    var id = req.body.id;
    var status = req.body.status;
    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "ID required "
        });
    }

    if (status == 0) {
        status = 1
        var msg = "NFT sold out successfully"
    } else {
        status = 0
        var msg = "NFT unsold successfully"
    }

    arr = {
        'is_sold': status
    }
    // console.log(arr, id);
    await db.query(adminQueries.soldNft, [arr, id], function (error, data) {
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
                msg: msg
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Failed"
            });
        }
    });
}


// >>>>>>>>>>>>>>>>>>>> Pawan Code Start   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

exports.getuserDetails = async (db, req, res) => {
    var id = req.body.id;

    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "some technical error occurred"
        });
    }

    await db.query(adminQueries.getUserDetails, id, function (error, data) {
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
                msg: "User Details",
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

exports.getWalletDetails = async (db, req, res) => {

    await db.query(adminQueries.getWalletDetailsQry, function (error, data) {
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

exports.getSetting = async (db, req, res) => {

    await db.query(adminQueries.getSettingData, function (error, data) {
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

exports.updateAdminWalletDetails = async (db, req, res) => {
    var admin_address = req.body.admin_address;
    var admin_private_key = req.body.admin_private_key;
    // var admin_address = req.body.admin_address;
    // var owner_private_key = req.body.owner_private_key;        
    var id = req.body.id;

    await db.query(adminQueries.updateadminwalletDetails, [admin_address, admin_private_key, id], function (error, data) {
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
                msg: "Admin Wallet Details Updated successfully",

            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Updation Error "
            });
        }
    });
}

exports.updateAdminSetting = async (db, req, res) => {
    var live_auction = req.body.live_auction;
    var admin_commission = req.body.admin_commission;
    var royalty_commission = req.body.royalty_commission;

    await db.query("SELECT * FROM admin_wallet limit 1", async function (adminError, adminWallet) {
        if (adminError) {
            return res.status(400).send({
                success: false,
                msg: adminError
            });
        }
        var from_address = adminWallet[0].admin_address;
        var from_private_key = adminWallet[0].admin_private_key;
        const response1 = await fetch(config.blockchainApiUrl + 'updateCommissionPercentage', {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "from_address": from_address,
                "from_private_key": from_private_key,
                "contract_address": config.contract,
                "royaltyCommission": royalty_commission,
                "adminCommission": admin_commission
            })
        });
        const data1 = await response1.json();
        console.log(data1);
        if (data1.hash) {
            await db.query(adminQueries.updateAdminSetting, [live_auction, admin_commission, royalty_commission], function (error, data) {
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
                        msg: "Updated successfully",

                    });
                } else {
                    res.status(200).send({
                        success: false,
                        msg: "Updation Error "
                    });
                }
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Some technical error! please try again"
            });
        }
    })
}

exports.getRefundUserData = async (db, req, res) => {

    await db.query(adminQueries.getRefundUserData, function (error, data) {
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

exports.refundUserPayment = async (db, req, res) => {

    await db.query("SELECT * FROM admin_wallet limit 1", async function (adminError, adminWallet) {
        if (adminError) {
            return res.status(400).send({
                success: false,
                msg: adminError
            });
        }
        var from_address = adminWallet[0].admin_address;
        var from_private_key = adminWallet[0].admin_private_key;

        await db.query(adminQueries.getRefundWalletAdresses, async function (error, refundUserWallets) {
            if (refundUserWallets.length > 0) {
                var addressArr = []; var amountArr = []; var itemBidids = []
                for (var i = 0; i < refundUserWallets.length; i++) {
                    addressArr[i] = refundUserWallets[i].address;
                    amountArr[i] = refundUserWallets[i].crypto_amount;
                    itemBidids[i] = refundUserWallets[i].id;
                }

                var refundAmountArr = JSON.stringify({
                    "from_address": from_address,
                    "from_private_key": from_private_key,
                    "contract_address": `${config.contract}`,
                    "to_address": addressArr,
                    "amount": amountArr
                })
                console.log(">>>>>>>>>>>>.", refundAmountArr);
                var itemBidsIds = itemBidids.join(",");

                const refundResponse1 = await fetch(config.blockchainApiUrl + 'refund', {
                    method: 'POST', headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: refundAmountArr
                });

                const refundRes = await refundResponse1.json();
                console.log(refundRes);
                if (refundRes.hash) {
                    var refHash = refundRes.hash
                    if (itemBidsIds) {
                        db.query(`UPDATE item_bid SET refund_hash = "${refHash}" WHERE id IN ( ${itemBidsIds} )`);
                    }

                    res.status(200).send({
                        success: true,
                        msg: "Payment refunded successfully",
                    });
                } else {
                    res.status(200).send({
                        success: false,
                        msg: "Oops! Some technical error pelase try again",
                    });
                }

            } else {
                res.status(200).send({
                    success: false,
                    msg: "No refund payment data yet",
                });
            }
        })

    })
}
exports.getWhyArtFungible = async (db, req, res) => {
    db.query(adminQueries.getWhyArtFungible, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Why Art Fungible",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}
exports.updateWhyArtFungible = async (db, req, res) => {
    var id = 1;
    var why_art_fungible = req.body.why_art_fungible;

    try {
        // var arr = {
        //     'why_art_fungible': why_art_fungible
        // }
        let updated = await db.query(adminQueries.updateWhyArtFungible, [why_art_fungible, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated successfully."
                });

            } catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}


exports.getPrivacypolicy = async (db, req, res) => {
    db.query(adminQueries.getPrivacypolicy, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Why Art Fungible",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.updatePrivacyPolicy = async (db, req, res) => {
    var id = 1;
    var privacy_policy = req.body.privacy_policy;

    try {
        // var arr = {
        //     'why_art_fungible': why_art_fungible
        // }
        let updated = await db.query(adminQueries.updatePrivacyPolicy, [privacy_policy, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated successfully."
                });

            } catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}


exports.getTermsAndCondition = async (db, req, res) => {
    db.query(adminQueries.getTermsAndCondition, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Why Art Fungible",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.updateTermsAndCondition = async (db, req, res) => {
    var id = 1;
    var terms_and_conditions = req.body.terms_and_conditions;

    try {
        // var arr = {
        //     'why_art_fungible': why_art_fungible
        // }
        let updated = await db.query(adminQueries.updateTermsAndCondition, [terms_and_conditions, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated successfully."
                });

            } catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}

exports.getAbout = async (db, req, res) => {
    db.query(adminQueries.getAbout, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Why Art Fungible",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.getDrop = async (db, req, res) => {
    db.query(adminQueries.getDrop, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "It's all about Drop",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.updateAbout = async (db, req, res) => {
    var id = 1;
    var about = req.body.about;
    try {
        let updated = await db.query(adminQueries.updateAbout, [about, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated successfully."
                });
            }
            catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }
    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}

exports.updateDrop = async (db, req, res) => {
    var id = 1;
    var drop_about = req.body.drop_about;
    try {
        let updated = await db.query(adminQueries.updateDrop, [drop_about, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated successfully."
                });
            }
            catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }
    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}