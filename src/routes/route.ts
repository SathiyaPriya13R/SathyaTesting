import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";
import DashboardController from "../controller/dashboardcontroller";
import ProviderController from "../controller/providercontroller";
import PayerController from "../controller/payercontroller"

const usercontroller = new UserController();
const dashboardcontroller = new DashboardController();
const providercontroller = new ProviderController();
const payercontroller = new PayerController()

// login routes
router.post('/signin', usercontroller.signinUser);
router.post('/forgotpassword', usercontroller.forgetPassword);
router.post('/resetpassword', usercontroller.changePassword);
router.get('/logincms', usercontroller.TermsofservicePrivacyPolicy);
router.get('/logout', AuthGuard, usercontroller.logOut);
router.get('/pwdexpirationtime', usercontroller.passwordExpirationCheck);

// dashboard routes
router.post('/dashboard/summarycount', AuthGuard, dashboardcontroller.dashboardsummary);
router.post('/dashboard/statisticscount', AuthGuard, dashboardcontroller.getStatistic);
router.get('/app/filter', AuthGuard, dashboardcontroller.appFilter);

// Profile routes
router.get('/profileget', AuthGuard, usercontroller.profileGet);
router.post('/profile/update', AuthGuard, usercontroller.profileUpdate);

//Provider routes
router.get('/provider', AuthGuard, providercontroller.getProvider);
router.post('/provider/spec/:id', AuthGuard, providercontroller.providerSpec);

//Payer routes
router.get('/payer', AuthGuard, payercontroller.getPayer);

module.exports.route = router;