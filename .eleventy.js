const {DateTime} = require("luxon");
const ics = require("ics");
const fs = require("fs");

const DEFAULT_START_TIME = {
    hours: 18,
    minutes: 15
}

const EVENT_COMMON = {
    url: 'https://kncyber.pl',
    description: `Bieżące informacje i szczegóły na serwerze Discord koła lub stronie na Facebooku
            https://www.facebook.com/KoloCyber
            https://discord.com/invite/DjVypPcV8c`,
    location: 'Wydział Elektroniki i Technik Informacyjnych Politechniki Warszawskiej',
    duration: {hours: 3},
    startInputType: 'utc',
    startOutputType: 'utc'
}

let headers = [];
let calendarEvents = [];

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({"static": "/"});
    eleventyConfig.setTemplateFormats("html,njk,md");

    eleventyConfig.on('eleventy.beforeWatch', async () => {
        headers = [];
    });

    eleventyConfig.addShortcode("event", function (date, description, extra = null) {
        const currentDate = DateTime.local().setZone("Europe/Warsaw");
        let parsedDate = DateTime.fromFormat(date, "yyyy-MM-dd", {
            zone: 'Europe/Warsaw'
        }).set(DEFAULT_START_TIME);

        const isWinter = parsedDate.month >= 10 || parsedDate.month < 2;
        const isFuture = currentDate < parsedDate;

        const suffix = isWinter ? "Z" : "L";
        const year = parsedDate.month < 2 ? parsedDate.year - 1 : parsedDate.year;
        const yearShort = year.toString().substring(2);
        const header = isFuture ? 'Upcoming' : `${yearShort}${suffix}`;

        let result = "";
        if (!headers.includes(header)) {
            result += (isFuture ? '###' : '####') + ` ${header}\n`;
            headers.push(header);
        }

        // Create ICS calendar event
        const utcDate = parsedDate.toUTC();
        calendarEvents.push({
            title: description,
            start: [
                utcDate.year,
                utcDate.month,
                utcDate.day,
                utcDate.hour,
                utcDate.minute
            ],
            ...EVENT_COMMON
        });

        const dateString = parsedDate.toFormat("dd/MM/yyyy");
        return result + `- ${dateString} - ${description}` + (extra != null ? ` - ${extra}` : '')
    });

    eleventyConfig.on('eleventy.after', async ({dir}) => {
        const {error, value} = ics.createEvents(calendarEvents);
        if (error) {
            throw error;
        }

        const writeStream = fs.createWriteStream(`./${dir.output}/calendar.ics`);
        writeStream.write(value);
        writeStream.end();
    });
};
