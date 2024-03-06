import _ from 'lodash';
import { AppNotificationRecipientsModel } from '../model/appnotificationrecipients'
import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import DateConvertor from '../helpers/date';
import { Sequelize } from 'sequelize';
import { encrypt, decrypt } from '../helpers/aes';
const { Op } = require('sequelize');
import moment from 'moment';


const appConstant = new AppConstants();
const dateConvert = new DateConvertor();


export default class NotificationService {


}