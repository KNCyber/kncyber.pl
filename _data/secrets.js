module.exports = function() {
    return {
        flag: process.env.FLAG ? btoa(process.env.FLAG) : 'not set'
    };
};