const {DateTime} = require("luxon");
const ics = require("ics");
const fs = require("fs");

const DEFAULT_START_HOUR = 18;
const DEFAULT_START_MINUTE = 15;

const EVENT_COMMON = {
    url: 'https://kncyber.pl',
    description: `Bieżące informacje i szczegóły na serwerze Discord koła lub stronie na Facebooku
            https://www.facebook.com/KoloCyber
            https://discord.com/invite/DjVypPcV8c`,
    location: 'Wydział Elektroniki i Technik Informacyjnych Politechniki Warszawskiej',
    duration: {hours: 3},
    startInputType: 'local',
    startOutputType: 'local'
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
        const parsedDate = DateTime.fromFormat(date, "yyyy-MM-dd", {
            zone: 'Europe/Warsaw'
        });

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
        calendarEvents.push({
            title: description,
            start: [
                parsedDate.year,
                parsedDate.month,
                parsedDate.day,
                parsedDate.hour !== 0 ? parsedDate.hour : DEFAULT_START_HOUR,
                parsedDate.hour !== 0 ? parsedDate.minute : DEFAULT_START_MINUTE
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
