import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import DocumentService from '../services/documentservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const documentService = new DocumentService()

export default class DocumentController {

}