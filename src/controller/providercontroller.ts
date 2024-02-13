import { Request, Response } from 'express';
import Validation from "../validations/validators"
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import ProviderService from '../services/providerservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const userService = new ProviderService();

export default class ProviderController {

}