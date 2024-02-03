import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";
import DashboardController from "../controller/dashboardcontroller";

const users = new UserController();
const dashboardcontroller = new DashboardController();

// login routes
router.post('/signin', users.signinUser);
router.post('/forgotpassword', users.forgetPassword);
router.post('/resetpassword', users.changePassword);
router.get('/logincms', users.TermsofservicePrivacyPolicy);

// dashboard routes
router.get('/dashboard/summarycount', AuthGuard, dashboardcontroller.dashboardsummary);
router.post('/dashboard/statisticscount', AuthGuard, dashboardcontroller.getStatistic);
router.get('/app/filter', AuthGuard, dashboardcontroller.appFilter);

module.exports.route = router;