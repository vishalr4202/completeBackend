const express = require("express");

const UserController = require("../controllers/auth");
const UserActionController = require("../controllers/userActions");
const FirstStockController = require("../controllers/firstStockActions");
const FirstockSet = require('../controllers/firstockSet');
const UserSchema = require("../validations/validations");
const IsAuth = require("../middlewares/isAuth");
const IsAdmin = require("../middlewares/isAdmin");
const router = express.Router();

router.post("/signup",UserSchema.userSignupSchema,UserController.createSignup);
router.post("/login", UserSchema.userLoginSchema, UserController.showLogin);
router.get("/dashboard", IsAuth, UserActionController.getDashboard);

// User Zerodha
router.post("/getAccessToken", IsAuth, UserActionController.getAccessToken);
router.get("/getUserAccountBalance", IsAuth, UserActionController.getUserBalances);
router.get("/getUserProfile", IsAuth, UserActionController.getUserProfile);
router.get("/getUserOrders", IsAuth, UserActionController.getUserOrders);
router.get("/getUserPositions", IsAuth, UserActionController.getUserPositions);
router.get('/getInstruments',IsAuth,UserActionController.getInstruments)
router.post('/setBasicTrade',IsAuth,UserActionController.setBasicTrade)

// Admin Zerodha
router.get("/getAllUsers",IsAdmin,UserActionController.getAllUsers)
router.get("/getAllZerodhaUsers",IsAdmin,UserActionController.getAllZerodhaUsers)
router.post("/getAccountBalance", IsAdmin, UserActionController.getBalances);
router.post("/getProfile", IsAdmin, UserActionController.getProfile);
router.post("/getOrders", IsAdmin, UserActionController.getOrders);
router.post("/getPositions", IsAdmin, UserActionController.getPositions);



//Admin Firstock sets
// UserSchema.setSignupSchema
router.post('/createSet',IsAdmin, UserSchema.setSignupSchema,FirstockSet.createSet)
router.post('/deleteSet',IsAdmin,FirstockSet.deleteSet)
router.post('/placeSetOrders',IsAdmin,FirstockSet.placeSetOrders)
router.post('/exitSetOrders',IsAdmin,FirstockSet.exitSetOrders)
router.get('/getFSUsers',IsAdmin,FirstockSet.getFSUsers)
router.get('/getAllSets',IsAdmin,FirstockSet.getAllSets)
router.post('/primaryUserDetail',IsAdmin,FirstockSet.getPrimaryUserDetails)
router.post("/primarySetPositions",IsAdmin,FirstockSet.getPrimarySetPositions)
router.post('/setplacemultipleorders',IsAdmin,FirstockSet.fs_Set_place_multiple_order)
router.post('/setshortStraddle',IsAdmin,FirstockSet.set_fs_shortStraddle)
router.post('/setshortStrangle',IsAdmin,FirstockSet.set_fs_shortStrangle)
router.post('/setlongStraddle',IsAdmin,FirstockSet.set_fs_longStraddle)
router.post('/setlongStrangle',IsAdmin,FirstockSet.set_fs_longStrangle)
router.post('/setbullCallSpread',IsAdmin,FirstockSet.set_fs_bullCallSpread)
router.post('/setbearPutSpread',IsAdmin,FirstockSet.set_fs_bearPutSpread)
router.post('/setloginAll',IsAdmin,FirstockSet.set_loginAll)

router.post('/placeTrailingSetOrders',IsAdmin,FirstockSet.placeTrailingSetOrders)

// userFirstock
router.post("/firstStockLogin",IsAuth,FirstStockController.firstLogin)
router.get('/fsuserDetails',IsAuth,FirstStockController.fs_user_details)
router.post("/fsplacesingleorder",IsAuth,FirstStockController.fs_place_single_order)
router.post("/fsplacemultiorders",IsAuth,FirstStockController.fs_place_multiple_order)
router.get("/fsorders",IsAuth,FirstStockController.fs_getOrders)
router.get("/fspositions",IsAuth,FirstStockController.fs_getPositions)
router.post("/fsbasketmargins",IsAuth,FirstStockController.fs_getBasketMargins)
router.post("/fsshortstraddle",IsAuth,FirstStockController.fs_shortStraddle)
router.post("/fsshortstrangle",IsAuth,FirstStockController.fs_shortStrangle)
router.post("/fslongstraddle",IsAuth,FirstStockController.fs_longStraddle)
router.post("/fslongstrangle",IsAuth,FirstStockController.fs_longStrangle)
router.post('/fsBullCallSpread',IsAuth,FirstStockController.fs_bullCallSpread)
router.post('/fsBearPutSpread',IsAuth,FirstStockController.fs_bearPutSpread)
router.post("/fsgetInstruments",IsAuth,FirstStockController.fs_getInstruments)
router.get("/fsGetLTP",IsAuth,FirstStockController.FS_getLTP)
router.get("/fsGetUserKeys",IsAuth,FirstStockController.FS_getUserTokenData)
router.get("/getOrderUpdate",IsAuth,FirstStockController.OrderUpdate)

module.exports = router;
