const { Sequelize } = require("sequelize");
const logger = require('../helpers/logger');
import AppConstants from "../utls/constants";
const dotenv = require('dotenv');
dotenv.config()

const appConstant = new AppConstants;

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT,
  }
);

// Test the connection
async function connectToDB(attempts = 0) {
  try {
    await sequelize.authenticate();
    logger.info(appConstant.DBCONNECTION.CONNECTED_SUCCESSFUL);
    return sequelize;
  } catch (error) {
    const maxAttempts = 3;
    const retryInterval = 5000; // milliseconds
    if (attempts < maxAttempts - 1) {
      logger.info(`Retrying in ${retryInterval / 1000} seconds...`);
      // Wait for a specified interval before retrying
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      return connectToDB(attempts + 1);
    } else {
      logger.error(`Failed to connect after ${maxAttempts} attempts.`);
      throw error;
    }
  } finally {
    // Close the connection after testing
    await sequelize.close();
  }
}

// Call the function to test the connection
export default connectToDB;
