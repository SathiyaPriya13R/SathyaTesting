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
    async DateFormatWithTime(dateString: any) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
        return formattedDate;
    }
}