const { DateTime } = require("luxon");

let headers = [];

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({"static": "/"});
    eleventyConfig.setTemplateFormats("html,njk,md");

    eleventyConfig.on('eleventy.beforeWatch', async () => {
        headers = [];
    });

    eleventyConfig.addShortcode("event", function (date, description) {
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

        const dateString = parsedDate.toFormat("dd/MM/yyyy");
        return result + `- ${dateString} - ${description}`
    })
};
