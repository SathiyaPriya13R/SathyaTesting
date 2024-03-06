import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import NotificationService from '../services/notificationservices'
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const notificationService = new NotificationService();

export default class NotificationController {


}