import AppConstants from '../utils/constants';
import UserService from '../services/userservices';
import NotificationService from 'src/services/notificationservices';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();
const cron = require('node-cron');
const userService = new UserService();
const notificationservices = new NotificationService();

export default class Corn {

    async generatePassword() {
        const task = cron.schedule('0 0 */1 * * *', () => {
            userService.generatePasswordCron().then(() => {
                logger.info(__filename, appConstant.CRON_MESSAGE.GENERATE_PASSWORD_FUNCTION_COMPLETED);
            }).catch((error: any) => {
                logger.info(__filename, appConstant.CRON_MESSAGE.GENERATE_PASSWORD_FUNCTION_FAILED, error);
            });
        });
    }

    async pushDocumentNotification() {
        const task = cron.schedule('0 0 3 * * *', () => {
            notificationservices.pushDocumentNotification().then(() => {
                logger.info(__filename, appConstant.CRON_MESSAGE.PUSH_DOCUMENT_NOTIFICATION_FUNCTION_COMPLETED);
            }).catch((error: any) => {
                logger.info(__filename, appConstant.CRON_MESSAGE.PUSH_DOCUMENT_NOTIFICATION_FUNCTION_FAILED, error);
            });
        });
    }

    async pushDocumentAlert() {
        const task = cron.schedule('0 0 4 * * *', () => {
            notificationservices.pushDocumentAlert().then(() => {
                logger.info(__filename, appConstant.CRON_MESSAGE.PUSH_DOCUMENT_ALERT_FUNCTION_COMPLETED);
            }).catch((error: any) => {
                logger.info(__filename, appConstant.CRON_MESSAGE.PUSH_DOCUMENT_ALERT_FUNCTION_FAILED, error);
            });
        });
    }

    async pushPayerEnrollmentNotification() {
        const task = cron.schedule('0 0 5 * * *', () => {
            notificationservices.pushPayerEnrollmentNotification().then(() => {
                logger.info(__filename, appConstant.CRON_MESSAGE.PUSH_PAYER_ENROLL_FUNCTION_COMPLETED);
            }).catch((error: any) => {
                logger.info(__filename, appConstant.CRON_MESSAGE.PUSH_PAYER_ENROLL_FUNCTION_FAILED, error);
            });
        });
    }

}