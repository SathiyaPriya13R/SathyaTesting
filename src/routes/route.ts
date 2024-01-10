import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";

const authGuard = new AuthGuard();
const users = new UserController();

router.get('/signin', users.loginUser)

module.exports.route = router;