const express = require("express");

const UserController = require("../controllers/auth");
const UserActionController = require("../controllers/userActions");
const FirstStockController = require("../controllers/firstStockActions");
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
router.post("/getAccountBalance", IsAdmin, UserActionController.getBalances);
router.post("/getProfile", IsAdmin, UserActionController.getProfile);
router.post("/getOrders", IsAdmin, UserActionController.getOrders);
router.post("/getPositions", IsAdmin, UserActionController.getPositions);

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

module.exports = router;
