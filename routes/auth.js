const express = require("express");

const UserController = require("../controllers/auth");
const UserActionController = require("../controllers/userActions");
const UserSchema = require("../validations/validations");
const IsAuth = require("../middlewares/isAuth");
const IsAdmin = require("../middlewares/isAdmin");
const router = express.Router();

router.post("/signup",UserSchema.userSignupSchema,UserController.createSignup);
router.post("/login", UserSchema.userLoginSchema, UserController.showLogin);
router.get("/dashboard", IsAuth, UserActionController.getDashboard);
router.post("/getAccessToken", IsAuth, UserActionController.getAccessToken);


router.get("/getUserAccountBalance", IsAuth, UserActionController.getUserBalances);
router.get("/getUserProfile", IsAuth, UserActionController.getUserProfile);
router.get("/getUserOrders", IsAuth, UserActionController.getUserOrders);
router.get("/getUserPositions", IsAuth, UserActionController.getUserPositions);

router.get('/getInstruments',IsAuth,UserActionController.getInstruments)
router.post('/setBasicTrade',IsAuth,UserActionController.setBasicTrade)

router.get("/getAllUsers",IsAdmin,UserActionController.getAllUsers)
router.post("/getAccountBalance", IsAdmin, UserActionController.getBalances);
router.post("/getProfile", IsAdmin, UserActionController.getProfile);
router.post("/getOrders", IsAdmin, UserActionController.getOrders);
router.post("/getPositions", IsAdmin, UserActionController.getPositions);



module.exports = router;
