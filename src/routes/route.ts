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
router.get('/logout',AuthGuard, users.logOut);
router.get('/pwdexpirationtime', users.passwordExpirationCheck);

// dashboard routes
router.get('/dashboard/summarycount', AuthGuard, dashboardcontroller.dashboardsummary);
router.post('/dashboard/statisticscount', AuthGuard, dashboardcontroller.getStatistic);
router.get('/app/filter', AuthGuard, dashboardcontroller.appFilter);

// Profile routes
router.get('/profileget', AuthGuard, users.profileGet);
router.post('/profile/update', AuthGuard, users.profileUpdate);

module.exports.route = router;