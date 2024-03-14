import AppConstants from '../utils/constants';
import UserService from '../services/userservices';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();
const cron = require('node-cron');
const userService = new UserService();

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

    // async pushNotification() {
    //     const task = cron.schedule('0 0 */1 * * *', () => {
    //         userService.generatePasswordCron().then(() => {
    //             logger.info(__filename, appConstant.CRON_MESSAGE.GENERATE_PASSWORD_FUNCTION_COMPLETED);
    //         }).catch((error: any) => {
    //             logger.info(__filename, appConstant.CRON_MESSAGE.GENERATE_PASSWORD_FUNCTION_FAILED, error);
    //         });
    //     });
    // }

    // async pushAlert() {
    //     const task = cron.schedule('0 0 */1 * * *', () => {
    //         userService.generatePasswordCron().then(() => {
    //             logger.info(__filename, appConstant.CRON_MESSAGE.GENERATE_PASSWORD_FUNCTION_COMPLETED);
    //         }).catch((error: any) => {
    //             logger.info(__filename, appConstant.CRON_MESSAGE.GENERATE_PASSWORD_FUNCTION_FAILED, error);
    //         });
    //     });
    // }

}