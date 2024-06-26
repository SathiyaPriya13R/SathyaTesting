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
import NotificationController from "../controller/notifictioncontroller"

const usercontroller = new UserController();
const dashboardcontroller = new DashboardController();
const providercontroller = new ProviderController();
const payercontroller = new PayerController()
const locationcontroller = new LocationController();
const documentcontroller = new DocumentController();
const notificationcontroller = new NotificationController();

// login routes
router.post('/signin', usercontroller.signinUser);
router.post('/forgotpassword', usercontroller.forgetPassword);
router.post('/resetpassword', usercontroller.changePassword);
router.get('/logincms', usercontroller.TermsofservicePrivacyPolicy);
router.get('/logout', AuthGuard, usercontroller.logOut);
router.get('/pwdexpirationtime', usercontroller.passwordExpirationCheck);
router.post('/themeupdate', AuthGuard, usercontroller.updateTheme);
router.get('/getversioninfo', usercontroller.getVersionInfo);

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
router.post('/esign/consoleview', esigncontroller.consoleView)
router.post('/esign/complete', esigncontroller.docusignComplete);

//Document routes
router.post('/document/upload', AuthGuard, documentcontroller.uploadDocument)
router.get('/document/download/:id', AuthGuard, documentcontroller.downloadDocument)
router.post('/document/all', AuthGuard, documentcontroller.getProviderDocument)
router.get('/document/details/:id', AuthGuard, documentcontroller.getDocumentDetails)
router.post('/document/delete/:id', AuthGuard, documentcontroller.documentDelete)

//Notification routes
router.post('/notification/count', AuthGuard, notificationcontroller.getCountData)
router.post('/notification/list', AuthGuard, notificationcontroller.getNotificationList);
router.get('/notification/:id', AuthGuard, notificationcontroller.getNotificationByid);
router.post('/notification/status/update', AuthGuard, notificationcontroller.updateNotificationStatus)
module.exports.route = router;