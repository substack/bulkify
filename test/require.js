var path = require("path");

module.exports = function (dir) {
    return function (request) {
        var start = request.substring(0, 2);

        if (start === './' || start === '..') {
            request = path.join(dir, request);
        }

        return require(request);
    };
};
