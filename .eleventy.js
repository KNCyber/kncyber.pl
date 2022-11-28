module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({"static": "/"});
    eleventyConfig.setTemplateFormats("html,njk,md");
};
