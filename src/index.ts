import express from 'express';
import AppConstants from '../src/utils/constants';
import bodyParser from 'body-parser';
const logger = require('./helpers/logger');
const routes = require('./routes/route')
const appConstant = new AppConstants();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api',routes.route)

app.listen(port, () => {
    return logger.info(`App is listing in port:${port}`);
});
