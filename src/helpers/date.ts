const moment = require('moment-timezone');

export default class DateConvertor {
    async dateFormat(date: any) {
        const utcDate = moment.utc(date);
        const ourDate = utcDate.tz('America/Los_Angeles');
        const formatDate = new Date(ourDate);
        const day = formatDate.getDate();
        const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(formatDate);
        const year = formatDate.getFullYear();

        const formattedDate = `${day} ${month} ${year}`;
        return formattedDate
    }
}