import express from "express";
const router = express.Router();
import AuthGuard from "../middleware/authguard";
const logger = require('../helpers/logger');
import UserController from "../controller/usercontroller";
import DashboardController from "../controller/dashboardcontroller";
import ProviderController from "../controller/providercontroller";
import PayerController from "../controller/payercontroller"
import LocationController from "../controller/locationcontroller";
import esigncontroller from "../controller/esigncontroller";
import DocumentController from "../controller/documentcontroller";

const usercontroller = new UserController();
const dashboardcontroller = new DashboardController();
const providercontroller = new ProviderController();
const payercontroller = new PayerController()
const locationcontroller = new LocationController();
const documentcontroller = new DocumentController();

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
router.post('/app/applied/filter', AuthGuard, dashboardcontroller.appliedFilter);

// Profile routes
router.get('/profileget', AuthGuard, usercontroller.profileGet);
router.post('/profile/update', AuthGuard, usercontroller.profileUpdate);

//Provider routes
router.post('/provider', AuthGuard, providercontroller.getProvider);
router.post('/provider/spec', AuthGuard, providercontroller.providerSpec);
router.post('/provider/viewplans', AuthGuard, providercontroller.getViewPlans);

//Payer routes
router.post('/payer', AuthGuard, payercontroller.getPayer);
router.post('/payer/history', AuthGuard, payercontroller.getPayerHistory);

//Location routes
router.post('/location', AuthGuard, locationcontroller.getLocation);
router.post('/location/status/update', AuthGuard, locationcontroller.updateLocationStatus)

//esign
// router.get('/esign', esigncontroller.esign_client)
router.post('/getesignurl', esigncontroller.get_esign_url)
router.get('/esign/success', esigncontroller.esign_success)
router.post('/esign/list', AuthGuard, esigncontroller.getEsignList);
router.post('/esign/signeddoc', esigncontroller.getSignedDocument)

//Document routes
router.post('/document/upload', AuthGuard, documentcontroller.uploadDocument)
router.get('/document/download/:id', AuthGuard, documentcontroller.downloadDocument)
router.post('/document/all', AuthGuard, documentcontroller.getProviderDocument)

// document routes
router.get('/document/details/:id', AuthGuard, documentcontroller.getDocumentDetails)

// document detele
router.post('/document/delete/:id',AuthGuard,documentcontroller.documentDelete)

module.exports.route = router;