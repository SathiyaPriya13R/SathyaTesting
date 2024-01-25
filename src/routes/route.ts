import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";

const authGuard = new AuthGuard();
const users = new UserController();

router.post('/signin' ,users.signinUser);
router.post('/forgotpassword',users.forgetPassword);
router.post('/resetpassword', users.changePassword);

module.exports.route = router;