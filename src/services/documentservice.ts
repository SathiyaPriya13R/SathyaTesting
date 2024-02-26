import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import _ from 'lodash';
import DateConvertor from '../helpers/date';
import { Sequelize } from 'sequelize';
const moment = require('moment-timezone');
const { Op } = require('sequelize');

const appConstant = new AppConstants();
const dateConvert = new DateConvertor();

export default class DocumentService {

}
