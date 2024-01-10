import express from 'express';
import connectToDB from '../src/database/db';
import AppConstants from '../src/utls/constants';
import bodyParser from 'body-parser';
const logger = require('./helpers/logger');
const routes = require('./routes/route')
const appConstant = new AppConstants();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectToDB()
  .then((db:any) => {
    console.log('success')
    logger.info(appConstant.DBCONNECTION.SUCCESSFUL);
  })
  .catch((error:any) => {
    console.log('error')
    logger.error(appConstant.DBCONNECTION.UNSUCCESSFUL, error);
  });

app.use('/api',routes.route)

app.listen(port, () => {
    return console.log(`App is listing in port:${port}`);
});
