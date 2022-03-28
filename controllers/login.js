const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const config = require('../config');
const authQueries = require("../services/authQueries");
var validator = require("email-validator");
// Login User
exports.login = async (db, req, res) => {
    
    var email = req.body.email;
    var password = req.body.password;
      

    try {
        if (email=='') {
            return res.status(400).send({
                success: false,
                msg: "Email required "
            });
        }
        if (password=='') {
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

     
    db.query(authQueries.getUsersEmail,email, async function (error, user) {
            
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
              else if(user[0].is_email_verify===0){
                return res.status(400).send({
                    success: false,
                    msg: "Please verify your Account"
                });
              }   
              else if(user[0].deactivate_account==1){
                return res.status(400).send({
                    success: false,
                    msg: "You are Account is Deactivated,Please contact to Admin"
                });
              }
             else {
                
                var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
                if (user[0].password === hash){
                

                    const jwtToken = jwt.sign({
                        email: req.body.email,
                        id: user[0].id,
                    }, config.JWT_SECRET_KEY, {
                        expiresIn: config.SESSION_EXPIRES_IN
                    })

                    
         var activityData = {"user_id":user[0].id,"description":"Account logged in!!"}
         await db.query("INSERT INTO activity SET ?",activityData);

                    await db.query("UPDATE users set last_login =? WHERE id=?",[new Date(),user[0].id]);
                    return res.status(200).send({
                        success: true,
                         msg: "Login Successfully",
                        Token : jwtToken,
                        data : {
                            id : user[0].id,
                            phone : user[0].phone,
                            last_login : user[0].last_login,
                            user_email : user[0].email,
                            first_name : user[0].first_name,
                            last_name : user[0].last_name    
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

