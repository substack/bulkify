var bulk = require('bulk-require');
var staticModule = require('static-module');
var path = require('path');
var glob = require('glob');
var through = require('through2');

module.exports = function (file, opts) {
    if (/\.json$/.test(file)) return through();
    if (!opts) opts = {};
    var vars = opts.vars || {
        __filename: file,
        __dirname: path.dirname(file)
    };
    
    var sm = staticModule(
        { 'bulk-require': bulkRequire },
        { vars: vars }
    );
    return sm;
    
    function bulkRequire (dir, globs) {
        var gs = globs.slice();
        var stream = through();
        
        (function next () {
            if (gs.length === 0) {
                return stream.push(null);
            }
            var g = path.join(dir, gs.shift());
            glob(g, function (err, files) {
                console.log('files=', files);
            });
        })();
        
        return stream;
    }
};
