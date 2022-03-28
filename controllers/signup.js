
const config = require('../config');
const authQueries = require('../services/authQueries');
const CryptoJS = require("crypto-js");
var validator = require("email-validator");
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer')
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

// Register new user
exports.register = async (
    db, req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
  

    try {

        if (!email) {
            return res.status(400).send({
                success: false,
                msg: "Email required "
            });
        }
        if (!validator.validate(email)) {
         return res.status(400).send({
             success: false,
             msg: "Email is not validate"
         });
     }
        if (!password) {
            return res.status(400).send({
                success: false,
                msg: "password required"
            });
        }

        if (!password2) {
            return res.status(400).send({
                success: false,
                msg: "Confirm password required"
            });
        }


        if (password !== password2) {
            return res.status(400).send({
                success: false,
                msg: "password not match"
            });
        }

        if (password.length < 8) {
            return res.status(400).send({
                success: false,
                msg: "password length should be 8 characters or more"
            });
        }

        
        await db.query(authQueries.getUsersEmail, [email], async function (error, results) {
         
            
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            } else if (results.length > 0) {
                    if(email === results[0].email) {
                        return res.status(400).send({
                            success: false,
                            msg: "Email Already Registered! Try New Email."
                    
                        });
                    }
                  
            } 
              const Token = jwt.sign({
                email: req.body.email
           
            }, config.JWT_SECRET_KEY, {
                expiresIn: config.SESSION_EXPIRES_IN
            })

            // var transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     auth: {
            //       user: `bilal.espsofttech@gmail.com`,
            //       pass: `Bilal123#`
            //     }
            //   });
                    
            var transporter = nodemailer.createTransport({
               host: 'smtp.gmail.com',
               port:465,
               secure: true,
               auth: {
                 user: 'developer1.esp@gmail.com',
                 pass:  'Espsoft123#'
               },
               tls: {
                   rejectUnauthorized: false
               }
             });
           

      var mailOptions = {
         from: 'developer1.esp@gmail.com',
     //   from : 'bilal.espsofttech@gmail.com', 
        to: `${email}`,
        subject: 'Account Activation Link',
        html : `<div style="background-color:#f4f4f4">
        <div>
           <div style="margin:0px auto;max-width:800px">
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
                 <tbody>
                    <tr>
                       <td style="direction:ltr;font-size:0px;padding:10px 0px;text-align:center">
                       </td>
                    </tr>
                 </tbody>
              </table>
           
           </div>
       <div style="background:black;background-color:#816e4e;margin:0px auto;border-radius:5px;max-width:800px">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
             <tbody>
                <tr>
                   <td style="direction:ltr;font-size:0px;padding:8px 0;text-align:center">
                      <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                         <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                            <tbody>
                               <tr>
                                  <td align="center" style="font-size:0px;padding:0px 25px 0px 25px;word-break:break-word">
                                     <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px">
                                        <tbody>
                                           <tr>
                                              <td style="width:126px">
                                                 <img height="auto" src="https://espsofttech.org/art_fungible/backend/af-logo.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150"  class="CToWUd">
                                              </td>
                                              <td style="width:126px">
                                              <img height="auto" src="                                        https://espsofttech.org/art_fungible/img/art_fungible2.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150"  class="CToWUd">
         

                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </td>
                               </tr>
                            </tbody>
                         </table>
                      </div>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
           <div style="height:20px">
              &nbsp;
           </div>
           <div style="background:#fff;margin:0px auto;border-radius:5px;max-width:800px">
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
                 <tbody>
                    <tr>
                       <td style="direction:ltr;font-size:0px;padding:0px;text-align:center">
                          <div style="margin:0px auto;max-width:800px">
                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                <tbody>
                                   <tr>
                                      <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                                         <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                                            <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                 <tbody>
                    <tr>
                       <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                          <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1;text-align:left;color:#000"><b>Dear ${email}</b></div>
                       </td>
                    </tr>
                    <tr>
                       <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                          <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                          <h2>Please Click on given link to activate your account</h2>
                          <a href='https://espsofttech.org/art_fungible/verifyAccount/${Token}'>Click HERE </a> 
                            </div>
                       </td>
                    </tr>
                    <tr>
                       <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                          <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                            Thanks <br>
                            Artfungible Team
                          </div>
                       </td>
                    </tr>
                    
                 </tbody>
                </table>
                                         </div>
                                      </td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
           <div style="height:20px">
              &nbsp;
           </div>
           <div style="background:#000;background-color:#000;margin:0px auto;border-radius:5px;max-width:800px">
              <font color="#888888">
                    </font><font color="#888888">
                 </font><font color="#888888">
              </font><table align="center" border="0" cellpadding="0" cellspacing="0" style="background:#b09af7;background-color:#000;width:100%;border-radius:5px">
                 <tbody>
                    <tr>
                       <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                             <font color="#888888">
                                   </font><font color="#888888">
                                </font><font color="#888888">
                             </font><table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                                <tbody>
                                   <tr>
                                      <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
                                         <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:left;color:#fff"><b>Artfungible Team

                                         </b></div>
                                      </td>
                                      <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
                                         <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:right;color:#fff"><b style="color:white"><a href="mailto:support@cilantro.com" target="_blank">support@artfungible.com</a></b></div><font color="#888888">
                                      </font></td></tr></tbody></table><font color="#888888">
                          </font></div><font color="#888888">
                       </font></td></tr></tbody></table><font color="#888888">
           </font></div><font color="#888888">
        </font></div><font color="#888888">
     </font></div>`
      };
        
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
       //   console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

           
                   // const hash = bcrypt.hashSync(password, 8);
               const hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
        //     console.log('hash',hash);
                var users = {
                    "email": email,
                    "user_name": email,
                    "first_name": email,
                    "last_name": '',
                    "password": hash,
                    "is_email_verify" : 0,
                    "deactivate_account" : 0
                }
                 db.query(authQueries.insertUserData, users,async function(error,result){
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }       
                    
                  return res.status(200).send({
                    success: true,
                    msg: "Email has been sent, kindly activate your account"
                });
            });  
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "user not registered due to internal error"
        });
    }
}

exports.activateAccount = async (db,req,res)=>{
    var token = req.params;
  //console.log(token)
    if(token){
        jwt.verify(token.token,config.JWT_SECRET_KEY, async function(err,decodedToken){
         if(err){
            return res.status(400).send({
                success: false,
                msg: "Incorrect or Expired Link"
            });
         }   
       //  console.log('decode',decodedToken.email); 
      
         
            await db.query(authQueries.updateStatus,[decodedToken.email],function(err,data){
                if(err) throw err;
                
             
            });
            return res.status(200).send({
                success: true,
                msg: "Account Successfully Verified"
            });    
        })
    }else{ 
         return res.status(400).send({
        success: false,
        msg: "something went wrong"
    });
    }
}

exports.forgot = async (
   db, req, res) => {
   
   var email = req.body.email;
   try {
       
       if (email=='') {
           return res.status(400).send({
               success: false,
               msg: "Email required "
           });
       }
       if (!validator.validate(email)) {
         return res.status(400).send({
             success: false,
             msg: "Email is not validate"
         });
     }
   
  
       await db.query(authQueries.getUsersEmail, [email], async function (error, results) {
        
           
           if (error) {
               return res.status(400).send({
                   success: false,
                   msg: "error occured",
                   error
               });
               
           }   
           else if (results.length > 0) {
                
         
             
                    
             const Token = jwt.sign({
               email: req.body.email
          
           }, config.JWT_SECRET_KEY, {
               expiresIn: config.SESSION_EXPIRES_IN
           })

           var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:465,
            secure: true,
            auth: {
              user: 'developer1.esp@gmail.com',
              pass:  'Espsoft123#'
            },
            tls: {
                rejectUnauthorized: false
            }
          });

         //   var transporter = nodemailer.createTransport({
         //       service: 'gmail',
         //       auth: {
         //          user: `pawan.espsofttech@gmail.com`,
         //          pass: `Pawan123#`
         //       }
         //     });
                              
     var mailOptions = {
        from: 'developer1.esp@gmail.com',
      // from : "pawan.espsofttech@gmail.com",
       to: `${email}`,
       subject: 'Reset Password Link',
       html : `<div style="background-color:#f4f4f4">
       <div>
          <div style="margin:0px auto;max-width:800px">
             <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
                <tbody>
                   <tr>
                      <td style="direction:ltr;font-size:0px;padding:10px 0px;text-align:center">
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
      <div style="background:#816e4e;background-color:#816e4e;margin:0px auto;border-radius:5px;max-width:800px">
         <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
            <tbody>
               <tr>
                  <td style="direction:ltr;font-size:0px;padding:8px 0;text-align:center">
                     <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                        <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                           <tbody>
                              <tr>
                                 <td align="center" style="font-size:0px;padding:0px 25px 0px 25px;word-break:break-word">
                                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px">
                                       <tbody>
                                          <tr>
                                          <td style="width:126px">
                                          <img height="auto" src="https://espsofttech.org/art_fungible/backend/af-logo.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150"  class="CToWUd">
                                         
  
                                                                              </td>

                                                                              <td style="width:126px">
                                                                              <img height="auto" src="                                        https://espsofttech.org/art_fungible/img/art_fungible2.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150"  class="CToWUd">
                                         
  
                                                                              </td>

                                                                             
                                          </tr>
                                       </tbody>
                                    </table>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
          <div style="height:20px">
             &nbsp;
          </div>
          <div style="background:#fff;margin:0px auto;border-radius:5px;max-width:800px">
             <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
                <tbody>
                   <tr>
                      <td style="direction:ltr;font-size:0px;padding:0px;text-align:center">
                         <div style="margin:0px auto;max-width:800px">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
                               <tbody>
                                  <tr>
                                     <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                                        <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                                           <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                <tbody>
                   <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                         <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1;text-align:left;color:#000"><b>Dear ${email}</b></div>
                      </td>
                   </tr>
                   <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                         <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                         <h4>Please Click on given link to Reset  your Password</h4>
                         <a href='https://espsofttech.org/art_fungible/resetpassword/${Token}'>Click HERE </a> 
           
                         </div>
                      </td>
                   </tr>
                   <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                         <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                           Thanks <br>
                           Artfungible Team
                         </div>
                      </td>
                   </tr>
                   
                </tbody>
               </table>
                                        </div>
                                     </td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
          <div style="height:20px">
             &nbsp;
          </div>
          <div style="background:#000;background-color:#000;margin:0px auto;border-radius:5px;max-width:800px">
             <font color="#888888">
                   </font><font color="#888888">
                </font><font color="#888888">
             </font><table align="center" border="0" cellpadding="0" cellspacing="0" style="background:#000;background-color:#000;width:100%;border-radius:5px">
                <tbody>
                   <tr>
                      <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                         <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                            <font color="#888888">
                                  </font><font color="#888888">
                               </font><font color="#888888">
                            </font><table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                               <tbody>
                                  <tr>
                                     <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
                                        <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:left;color:#fff"><b>Artfungible Team

                                        </b></div>
                                     </td>
                                     <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
                                        <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:right;color:#fff"><b style="color:white"><a href="mailto:support@cilantro.com" target="_blank">support@artfungible.com</a></b></div><font color="#888888">
                                     </font></td></tr></tbody></table><font color="#888888">
                         </font></div><font color="#888888">
                      </font></td></tr></tbody></table><font color="#888888">
          </font></div><font color="#888888">
       </font></div><font color="#888888">
    </font></div>`
     };
       
     transporter.sendMail(mailOptions, function(error, info){
       if (error) {
        console.log(error);
       } else {
         console.log('Email sent: ' + info.response);
       }
     });

          
                 return res.status(200).send({
                   success: true,
                   msg: "Check your email for a link to reset your password"
           });  
      
         }
                     else{
                     return res.status(400).send({
                           success: false,
                           msg: "Email Not in Database."
                   
                       });
                   }
             
                  
               });
   } catch (err) {
       return res.status(500).send({
           success: false,
           msg: "user not registered due to internal error"
       });
   }
}



exports.Resetpassword = async (db,req,res)=>{
   var token = req.body;
   var password = req.body.password;
   var password2 = req.body.password2;

   if(password=='') {
      return res.status(200).send({
          success: false,
          msg: "password required"
      });
  } 
  if(password2=='') {
   return res.status(200).send({
       success: false,
       msg: "Confirm  password required"
   });
}  

if (password.length < 6) {
   return res.status(200).send({
       success: false,
       msg: "password length should be 6 characters or more"
   });
}

if (password !== password2) {
   return res.status(200).send({
       success: false,
       msg: "password not match"
   });
}
   if(token){
       jwt.verify(token.token,config.JWT_SECRET_KEY, async function(err,decodedToken){
        if(err){
           return res.status(400).send({
               success: false,
               msg: "Incorrect or Expired Link"
           });
        }   
     //  console.log('decode',decodedToken.email); 
        const hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
        
           await db.query(authQueries.updatepassword,[hash,decodedToken.email],function(err,data){
               if(err) throw err;
               
            
           });
           return res.status(200).send({
               success: true,
               msg: "Password changed successfully!"
           });    
       })
   }else{ 
        return res.status(400).send({
       success: false,
       msg: "something went wrong"
   });
   }
}



exports.getCountry = async (db, req, res) => {

   try {
       db.query(authQueries.getCountry,function(error,result){
         if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if(result.length>0){
           return res.status(200).send({
              success: true,
              msg : "Country Details",
             response : result
           })
        }else{
         return res.status(400).send({
            success: false,
            msg : "No Data"
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

exports.getUserProfile = async (db, req, res) => {

   var email = req.body.email;
   try {
       db.query(authQueries.getUserProfile,[email],function(error,result){
         if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if(result.length>0){
           return res.status(200).send({
              success: true,
              msg : "UserProfile Details",
             response : result[0]
           })
        }else{
         return res.status(400).send({
            success: false,
            msg : "No Data"
         })
        }
       })
    
   } catch (err) {
    //   console.log(err)
       return res.status(400).send({
           success: false,
           msg: "unexpected internal error",
           err
       });
   }

}

exports.userProfile = async (db, req, res) => {

   var email = req.body.email;
   var user_name = req.body.user_name;
   var first_name = req.body.first_name;
   var last_name = req.body.last_name;
   var dob = req.body.dob;
   var phone = req.body.phone;
   var country_id = req.body.country_id;   

   try {
       if (user_name=='') {
           return res.status(200).send({
               success: false,
               msg: "User Name required "
           });
       }
       if (first_name=='') {
         return res.status(200).send({
             success: false,
             msg: "First Name required "
         });
     }
     if (last_name=='') {
      return res.status(200).send({
          success: false,
          msg: "Last Name required "
      });
  }

   //     if (contact.length !=10) {
   //       return res.status(400).send({
   //           success: false,
   //           msg: "Contact number must be 10 Digit number"
   //       });
   //   }
     
       var users = {
          "user_name" : user_name,
         "first_name" : first_name,
         "last_name" : last_name,
        "dob" : dob,
        "phone": phone,
         "country_id" : country_id
       }

       db.query(authQueries.updateUser,[users,email],function(error,result){
         if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if(result){
           return res.status(200).send({
              success: true,
              msg : "User Profile Updated"
           })
        }else{
         return res.status(400).send({
            success: false,
            msg : "User Profile Updation Failed due to Error"
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


exports.changePassword = async (db, req, res) => {

   var email = req.body.email;
   var currentPassword = req.body.currentPassword;
   var password = req.body.password;
   var password2 = req.body.password2;   

   try {
       if (currentPassword=='') {
           return res.status(200).send({
               success: false,
               msg: "Current Password required "
           });
       }

       if (password=='') {
         return res.status(200).send({
             success: false,
             msg: "New Password required "
         });
     }
     if (password2=='') {
      return res.status(200).send({
          success: false,
          msg: "Re-Type Password required "
      });
  }
  if (password!=password2) {
   return res.status(200).send({
       success: false,
       msg: "New Password and Re-type Password not Match"
   });
}

db.query(authQueries.getPassword,[email],async function(error,result){
 
   if (error) {
      return res.status(400).send({
          success: false,
          msg: "error occured",
          error
      });
  }
 // console.log('result',result);
 var user_id = result[0].id;
  const hashpassword = CryptoJS.SHA256(currentPassword).toString(CryptoJS.enc.Hex);
   if(result[0].password==hashpassword){
 
      const newpassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
 
      db.query(authQueries.updatepassword,[newpassword,email],async function(error,result){
         if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if(result){

         var activityData = {"user_id":user_id,"description":"Password updated!!"}
         await db.query("INSERT INTO activity SET ?",activityData);

           return res.status(200).send({
              success: true,
              msg : "Password Changed Successfully"
           })
        }else{
         return res.status(400).send({
            success: false,
            msg : "Password Changed Failed due to Error"
         })
        }
       });
   }else{
      return res.status(200).send({
         success: false,
         msg : "Current Password Wrong"
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


exports.deActivateAccount = async (db, req, res) => {

   var email = req.body.email;
   try {
       db.query(authQueries.updateAccount,[email],function(error,result){
         if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if(result){
           return res.status(200).send({
              success: true,
              msg : "You are Account Now Deactivated",
            })
        }else{
         return res.status(400).send({
            success: false,
            msg : "No Data"
         })
        }
       })
    
   } catch (err) {
    //   console.log(err)
       return res.status(400).send({
           success: false,
           msg: "unexpected internal error",
           err
       });
   }

}

exports.insertProfilePic = async (db, req, res) => {
   var email = req.body.email;
   var first_name = req.body.first_name;
   var last_name = req.body.last_name;
   var user_name = req.body.user_name;
   var country_id = req.body.country_id;
   var address = req.body.address;
   var house_number = req.body.house_number;
   var city = req.body.city;
   var phone = req.body.phone;
   var profile_pic =  (!req.files['profile_pic'])?null:req.files['profile_pic'][0].filename;  
   var old_profile_pic = req.body.old_profile_pic

   if (!user_name) {
       return res.status(200).send({
           success: false,
           msg: "Username required"
       });
   }

   try {

      if(!profile_pic){
         profile_pic = old_profile_pic
      }

       var usersArr = {
           "first_name" : first_name,
           "user_name" : user_name,
           "last_name":last_name,
           "country_id" : country_id,
           "address"   : address,
           "house_number" : house_number,
           "city"      : city,
           "phone"     : phone,
           "profile_pic" : profile_pic
       }
       console.log(usersArr);
       let updated = await db.query(authQueries.updateUser,[usersArr, email]);
       if (updated) {
           try {
               return res.status(200).send({
                   success: true,
                   msg: "Profile details updated successfully."
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
               msg: "Data not update due to internal error"
           });
       }

   } catch (err) {
       return res.status(500).send({
           success: false,
           msg: "Data not update due to internal error"
       });
   }
} 

exports.getProfilePic = async (db,req,res)=>{
   var email = req.body.email;
   
   await db.query(authQueries.getProfile,[email],function(error,data){
       if(error){
       return res.status(400).send({
           success: false,
           msg: "error occured",
           error
       });
   }
       if(data.length > 0){
   res.status(200).send({
       success:true,
       msg : "Profile Pic",
       response : data[0]
   });
       }else{
           res.status(400).send({
               success:false,
               msg:"No Data"
           });            
       }
   });
}


exports.addSubscriber = async (db,req,res)=>{
   var email = req.body.email;
   await db.query(authQueries.getSubscriber,email, async function(error,data){
       if(error){
       return res.status(400).send({
           success: false,
           msg: "error occured",
           error
       });
   }
 
       if(data.length > 0){
       res.status(400).send({
       success:false,
       msg : "This email is already Subscribed!!",
   });
       }else{
           var sub = {
               "email" : email,
               "ip" : null,
               "datetime" : new Date()
           }

           await db.query(authQueries.addSubscriber,[sub],function(error,result){
               if(error){
               return res.status(400).send({
                   success: false,
                   msg: "Error occured!!",
                   error
               });
           }
           if(result){
               res.status(200).send({
                   success:true,
                   msg : "You have subscribed successfully!!",
               });
           }else{
               res.status(400).send({
                   success:false,
                   msg:"Insertion Error!! "
               });  
           }
   });
       }
});
}

exports.subscriberList = async (db, req, res) => {
   db.query(authQueries.subscriberList, function (error, data) {
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
               msg: "Subscriber List",
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