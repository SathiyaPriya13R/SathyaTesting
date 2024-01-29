import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";
import DashboardController from "../controller/dashboardcontroller";

const authGuard = new AuthGuard();
const users = new UserController();
const dashboardcontroller = new DashboardController();

router.post('/signin', users.signinUser);
router.post('/forgotpassword', users.forgetPassword);
router.post('/resetpassword', users.changePassword);

router.get('/logincms', users.TermsofservicePrivacyPolicy);

router.post('/dashboard/statisticscount', dashboardcontroller.getStatistic);

module.exports.route = router;