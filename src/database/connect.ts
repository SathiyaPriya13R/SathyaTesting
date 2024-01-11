import { Sequelize } from "sequelize";
const logger = require('../helpers/logger');
import AppConstants from "../utls/constants";
import {Op} from "sequelize";
const dotenv = require('dotenv');
dotenv.config()

const appConstant = new AppConstants;
export interface configInterface {
    logging: boolean | ((sql: string, timing?: number) => void);
    dbname: string;
    username: string;
    password: string;
    hostName: string;
}
export default class AppDatabase {
    config: configInterface;
    constructor(dbConfig: configInterface) {
        this.config = dbConfig;
    }
    base = null as unknown as Sequelize;

    configureModel() {
        this.base
    }
    init(): Sequelize {
        this.base = new Sequelize(this.config.dbname, this.config.username, this.config.password, {
            host: this.config.hostName,
            dialect: 'mssql',
            operatorsAliases: {
                $eq: Op.eq,
                $ne: Op.ne,
                $gte: Op.gte,
                $gt: Op.gt,
                $lte: Op.lte,
                $lt: Op.lt,
                $not: Op.not,
                $in: Op.in,
                $notIn: Op.notIn,
                $is: Op.is,
                $like: Op.like,
                $notLike: Op.notLike,
                $iLike: Op.iLike,
                $notILike: Op.notILike,
                $regexp: Op.regexp,
                $notRegexp: Op.notRegexp,
                $iRegexp: Op.iRegexp,
                $notIRegexp: Op.notIRegexp,
                $between: Op.between,
                $notBetween: Op.notBetween,
                $overlap: Op.overlap,
                $contains: Op.contains,
                $contained: Op.contained,
                $adjacent: Op.adjacent,
                $strictLeft: Op.strictLeft,
                $strictRight: Op.strictRight,
                $noExtendRight: Op.noExtendRight,
                $noExtendLeft: Op.noExtendLeft,
                $and: Op.and,
                $or: Op.or,
                $any: Op.any,
                $all: Op.all,
                $values: Op.values,
                $col: Op.col
            },
            pool: {
                min: 10,
                max: 300,
                idle: 30000,
                acquire: 30000,
            }
        }
        );
        return this.base;
    }


}

