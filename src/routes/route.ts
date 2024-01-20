import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";

const authGuard = new AuthGuard();
const users = new UserController();

router.post('/signin' ,users.loginUser)
router.post('/forgetPassword',users.forgetPassword)

module.exports.route = router;