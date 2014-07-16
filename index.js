var staticModule = require('static-module');
var path = require('path');
var through = require('through2');
var bulk = require('bulk-require');

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
        var stream = through();
        var res = bulk(dir, globs, {
            require: function (x) { return path.resolve(x); }
        });
        stream.push(walk(res, dir));
        stream.push(null);
        return stream;
    }
};

function walk (obj, dir) {
    if (typeof obj === 'string') {
        var filePath = path.relative(dir, obj);
        if (filePath[0] !== '.') {
          filePath = './' + filePath;
        }
        return 'require(' + JSON.stringify(filePath) + ')';
    }
    else if (obj && typeof obj === 'object' && obj.index) {
        return '(function () {'
            + 'var f = ' + walk(obj.index, dir) + ';'
            + Object.keys(obj).map(function (key) {
                return 'f[' + JSON.stringify(key) + ']=' + walk(obj[key], dir) + ';';
            }).join('')
            + 'return f;'
            + '})()'
        ;
    }
    else if (obj && typeof obj === 'object') {
        return '({' + Object.keys(obj).map(function (key) {
            return JSON.stringify(key) + ':' + walk(obj[key], dir);
        }).join(',') + '})';
    }
    else throw new Error('unexpected object in bulk-require result: ' + obj);
}
