import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import * as db from '../adapters/db';
import AuthGuard from '../middleware/authguard';
import { encrypt, decrypt } from '../helpers/aes';
const logger = require('../helpers/logger');
const ejs = require('ejs');
require('dotenv').config();
import _ from 'lodash';

const appConstant = new AppConstants();

export default class ProviderService {
    
}
