import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";
import DashboardController from "../controller/dashboardcontroller";
import ProviderController from "../controller/providercontroller";
import PayerController from "../controller/payercontroller"
import LocationController from "../controller/locationcontroller";

const usercontroller = new UserController();
const dashboardcontroller = new DashboardController();
const providercontroller = new ProviderController();
const payercontroller = new PayerController()
const locationcontroller = new LocationController();

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
router.post('/provider/spec', AuthGuard, providercontroller.providerSpec);
router.get('/provider/viewplans', AuthGuard, providercontroller.getViewPlans);

//Payer routes
router.get('/payer', AuthGuard, payercontroller.getPayer);
router.get('/payer/history', AuthGuard, payercontroller.getPayerHistory);

//Location routes
router.get('/location', AuthGuard, locationcontroller.getLocation);

module.exports.route = router;