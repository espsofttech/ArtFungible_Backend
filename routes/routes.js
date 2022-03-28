const jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var config = require('../config');
var db = require('../utils/connection');
var cors = require('cors');
var cron = require('node-cron');

router.use(bodyParser.json());
router.use(
    bodyParser.urlencoded({
        extended: true,
    })
);     

var whitelist = ['https://espsofttech.tech','http://localhost:3000','http://localhost:3001','https://espsofttech.org']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


var multer  = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req, file, cb) => {
      console.log(file.originalname);
      var filetype = '';
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      if(file.mimetype === 'image/jpg') {
        filetype = 'jpg';
      }
      if(file.mimetype === 'video/mp4') {
        filetype = 'mp4';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({storage: storage});
var pageUpload = upload.fields([{ name: 'avatar', maxCount: 1 }])
var profile_pic = upload.fields([{ name: 'profile_pic', maxCount: 1 }])




// -----------------CronJob Methods-------------
const cronFunction = require('../cron/cronFunction');
 cronFunction.checkTransactionHash();
cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
   
   cronFunction.checkTransactionHash();
   setTimeout(function(){
        cronFunction.checkTransactionHash();
   },15000)
   setTimeout(function(){
        cronFunction.checkTransactionHash();
   },40000)
});
// ++++++++++++++++++++++++++++++++++++++++++++++



// ---------------Controllers--------
const signup = require('../controllers/signup');
const login = require('../controllers/login');
const admin = require('../controllers/admin/admin');
const getFile = require('../controllers/getFile');
const marketplace = require('../controllers/marketplace');
const itemController = require('../controllers/itemController');
const userOrders  = require('../controllers/userOrders');
//==============Post Status API ===================================



router.post('/adminlogin', cors(corsOptions), admin.login.bind(this, db));
router.get('/getfooter', cors(corsOptions), admin.getFooter.bind(this, db));
router.get('/getwebcontent', cors(corsOptions), admin.getWebContent.bind(this, db));
router.get('/getmarketplace', cors(corsOptions), admin.getMarketPlace.bind(this, db));
router.post('/insertmarketplace', cors(corsOptions),admin.insertMarketPlace.bind(this,db));
router.post('/updatefooter', cors(corsOptions), admin.updateFooter.bind(this, db));
router.post('/updatewebcontent', cors(corsOptions), admin.updateWebContent.bind(this, db));
router.post('/insertcategory', cors(corsOptions), admin.insertCategory.bind(this, db));
router.get('/getcategory' ,admin.getCategory.bind(this, db));
router.get('/getrarity', cors(corsOptions), admin.getrarity.bind(this, db));
router.post('/singlecategory', cors(corsOptions), admin.singleCategory.bind(this, db));
router.post('/updatecategory', cors(corsOptions), admin.updateCategory.bind(this, db));
router.post('/deletecategory', cors(corsOptions), admin.deleteCategory.bind(this, db));
router.post('/insertitem', cors(corsOptions),pageUpload,admin.insertItem.bind(this, db));
router.post('/deleteitem', cors(corsOptions), admin.deleteItem.bind(this, db));
router.post('/updateitem', cors(corsOptions),pageUpload,admin.updateItem.bind(this, db));

router.post('/soldNft', cors(corsOptions),admin.soldNft.bind(this, db));
router.post('/getitem', cors(corsOptions),admin.getItem.bind(this, db));
router.get('/dashboarditem', cors(corsOptions),admin.dashboardItem.bind(this, db));
router.get('/getuser', cors(corsOptions),admin.getUsers.bind(this, db));
router.post('/listitem', cors(corsOptions),admin.listItem.bind(this, db));
router.get('/mintTrxConfirm/:hash', cors(corsOptions),admin.mintTrxConfirm.bind(this, db));
router.get('/approveTrxConfirm/:hash', cors(corsOptions),admin.approveTrxConfirm.bind(this, db));
router.post('/listSingleItem', cors(corsOptions),admin.listSingleItem.bind(this, db));
router.post('/deleteuser', cors(corsOptions),admin.deleteUser.bind(this, db));
router.post('/adminpassword', cors(corsOptions),admin.changePassword.bind(this, db));
router.get("/uploads/:image", getFile.getImage);
router.post('/updateprofilepic', cors(corsOptions), admin.insertProfilePic.bind(this, db));
router.post('/adminprofilepic', cors(corsOptions), admin.getProfilePic.bind(this, db));
router.get('/orderDetail', cors(corsOptions), admin.orderDetail.bind(this, db));
router.post('/getuserDetails', cors(corsOptions), admin.getuserDetails.bind(this, db));
router.post('/getRefundUserData', cors(corsOptions), admin.getRefundUserData.bind(this, db));
router.post('/refundUserPayment', cors(corsOptions), admin.refundUserPayment.bind(this, db));
router.post('/gerUserRefundManagement', cors(corsOptions), userOrders.gerUserRefundManagement.bind(this, db));

router.post('/getStatsData', cors(corsOptions), itemController.getStatsData.bind(this, db));
router.get('/getWalletDetails', cors(corsOptions), admin.getWalletDetails.bind(this, db));
router.post('/updateAdminWalletDetails', cors(corsOptions), admin.updateAdminWalletDetails.bind(this, db));
router.get('/getSetting', cors(corsOptions), admin.getSetting.bind(this, db));
router.get('/getWhyArtFungible', cors(corsOptions), admin.getWhyArtFungible.bind(this, db));
router.post('/updateWhyArtFungible', cors(corsOptions), admin.updateWhyArtFungible.bind(this, db));
router.get('/getPrivacypolicy', cors(corsOptions), admin.getPrivacypolicy.bind(this, db));
router.post('/updatePrivacyPolicy', cors(corsOptions), admin.updatePrivacyPolicy.bind(this, db));
router.get('/getTermsAndCondition', cors(corsOptions), admin.getTermsAndCondition.bind(this, db));
router.post('/updateTermsAndCondition', cors(corsOptions), admin.updateTermsAndCondition.bind(this, db));
router.get('/getAbout', cors(corsOptions), admin.getAbout.bind(this, db));
router.post('/updateAbout', cors(corsOptions), admin.updateAbout.bind(this, db));
router.get('/getDrop', cors(corsOptions), admin.getDrop.bind(this, db));
router.post('/updateDrop', cors(corsOptions), admin.updateDrop.bind(this, db));








router.post('/updateAdminSetting', cors(corsOptions), admin.updateAdminSetting.bind(this, db));
router.post('/addSubscriber', cors(corsOptions),signup.addSubscriber.bind(this, db));
router.get('/subscriberList', cors(corsOptions),signup.subscriberList.bind(this, db));
router.post('/getNftList', cors(corsOptions), marketplace.getNftList.bind(this, db));
router.post('/itemBuy', cors(corsOptions), itemController.itemBuy.bind(this, db));
router.post('/allSearch', cors(corsOptions),itemController.allSearch.bind(this,db));
router.post('/addWishlist', cors(corsOptions),marketplace.addWishlist.bind(this, db));
router.post('/listWishlist', cors(corsOptions),marketplace.listWishlist.bind(this,db));
router.post('/removeWishlist', cors(corsOptions),marketplace.removeWishlist.bind(this,db));
router.post('/addCart', cors(corsOptions),marketplace.addCart.bind(this, db));
router.post('/listCart', cors(corsOptions),marketplace.listCart.bind(this,db));
router.post('/removeCart', cors(corsOptions),marketplace.removeCart.bind(this,db));
router.post('/getBidDetail', cors(corsOptions),marketplace.getBidDetail.bind(this,db));
router.post('/bidAccept', cors(corsOptions),marketplace.bidAccept.bind(this,db));
router.post('/bidReject',marketplace.bidReject.bind(this,db));

router.get('/adminWalletDetail', cors(corsOptions), admin.adminWalletDetail.bind(this, db));
router.post('/updateAdminWallet', cors(corsOptions), admin.updateAdminWallet.bind(this, db));
router.post('/saveHelpCenterForm', cors(corsOptions),userOrders.saveHelpCenterForm.bind(this, db));
router.post('/saveContactForm', cors(corsOptions),userOrders.saveContactForm.bind(this, db));
router.get('/getContact', admin.getContact.bind(this, db));

router.post('/getCategoryName', cors(corsOptions),userOrders.getCategoryName.bind(this, db));
router.post('/getMultipleImages', cors(corsOptions),userOrders.getMultipleImages.bind(this, db));
router.post('/getUserActivity', cors(corsOptions), userOrders.getUserActivity.bind(this, db));
router.get("/uploads/:image", getFile.getImage);
router.post('/updateUserprofilepic', cors(corsOptions),profile_pic, signup.insertProfilePic.bind(this, db));
router.post('/getprofilepic', cors(corsOptions), signup.getProfilePic.bind(this, db));
router.post('/getUserOrder', cors(corsOptions), userOrders.getUserOrder.bind(this, db));
router.post('/getMybidsAPI', cors(corsOptions), userOrders.getMybidsAPI.bind(this, db));
router.post('/getProductsbidsAPI', cors(corsOptions), userOrders.getProductsbidsAPI.bind(this, db));
router.post('/resaleItem', cors(corsOptions),marketplace.resaleItem.bind(this, db));

router.post('/getOrderDetails', cors(corsOptions), userOrders.getOrderDetails.bind(this, db));
router.post('/getUserBidDetails', cors(corsOptions), userOrders.getUserBidDetails.bind(this, db));
router.post('/register', cors(corsOptions), signup.register.bind(this, db));
router.post('/verifyAccount/:token', cors(corsOptions), signup.activateAccount.bind(this, db));
router.post('/login', cors(corsOptions), login.login.bind(this, db));
router.post('/forgot', cors(corsOptions), signup.forgot.bind(this, db));
router.post('/resetpassword', cors(corsOptions), signup.Resetpassword.bind(this, db));
router.post('/getuserprofile', cors(corsOptions), signup.getUserProfile.bind(this, db));
router.post('/updateuserprofile', cors(corsOptions), signup.userProfile.bind(this, db));
router.post('/deactivate', cors(corsOptions), signup.deActivateAccount.bind(this, db));
router.post('/changepassword', cors(corsOptions), signup.changePassword.bind(this, db));
router.get('/getcountries', cors(corsOptions), signup.getCountry.bind(this, db));
router.post('/myBidItem', cors(corsOptions),marketplace.myBidItem.bind(this,db));
router.post('/dropsItem', cors(corsOptions),admin.dropsItem.bind(this,db));

/*add blog */

router.post('/createBlog', upload.fields([{ name: 'image', maxCount: 1 }]), admin.createBlog.bind(this, db));
router.get('/getBlogList', admin.getBlogList.bind(this, db))
router.post('/getBlogDetail', admin.getBlogDetail.bind(this, db))

router.post('/deleteBlog', admin.deleteBlog.bind(this, db));
router.post('/changeBlogStatus', admin.changeBlogStatus.bind(this, db));

router.get('/faqlist',admin.getfaqlist.bind(this,db))
router.post('/faqadd',admin.faqadd.bind(this,db))
router.post('/faqdelete',admin.faqdelete.bind(this,db))
router.get('/getTransaction',admin.getTransaction.bind(this,db))
router.post('/createMetadata', marketplace.createMetadata.bind(this, db));
router.get('/BidData', marketplace.BidData.bind(this, db));


router.get("/", function (request, response) {
    response.contentType("routerlication/json");
    response.end(JSON.stringify("Node is running"));    
});

router.get("*", function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: "Invalid Request {URL Not Found}", 
    });
});

router.post("*", function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: "Invalid Request {URL Not Found}",
    });
});

function ensureWebToken(req, res, next) {

    const x_access_token = req.headers['authorization'];
    if (typeof x_access_token !== undefined) {
        req.token = x_access_token;
        verifyJWT(req, res, next);
    } else {
        res.sendStatus(403);
    }
}

async function verifyJWT(req, res, next) {

    jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            const _data = await jwt.decode(req.token, {
                complete: true,
                json: true
            });
            req.user = _data['payload'];
            next();
        }
    })
}

module.exports.routes = router;
