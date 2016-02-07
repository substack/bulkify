var staticModule = require('static-module');
var path = require('path');
var through = require('through2');
var bulk = require('bulk-require');

module.exports = function (file, opts) {
    if (/\.json$/.test(file)) return through();
    if (!opts) opts = {};
    var filedir = path.dirname(file);
    var vars = opts.vars || {
        __filename: file,
        __dirname: filedir
    };
    
    var sm = staticModule(
        { 'bulk-require': bulkRequire },
        { vars: vars, varModules: { path: path } }
    );
    return sm;
    
    function bulkRequire (dir, globs) {
        var stream = through();
        var res = bulk(dir, globs, {
            require: function (x) {
                if (!file) return path.resolve(x);
                var r = path.relative(filedir, x);
                return /^\./.test(r) ? r : './' + r;
            }
        });
        stream.push(walk(res));
        stream.push(null);
        return stream;
    }
};

function walk (obj) {
    if (typeof obj === 'string') {
        return 'require(' + JSON.stringify(obj) + ')';
    }
    else if (obj && typeof obj === 'object' && obj.index) {
        return '(function () {'
            + 'var f = ' + walk(obj.index) + ';'
            + Object.keys(obj).map(function (key) {
                return 'f[' + JSON.stringify(key) + ']=' + walk(obj[key]) + ';';
            }).join('')
            + 'return f;'
            + '})()'
        ;
    }
    else if (obj && typeof obj === 'object') {
        return '({' + Object.keys(obj).map(function (key) {
            return JSON.stringify(key) + ':' + walk(obj[key]);
        }).join(',') + '})';
    }
    else throw new Error('unexpected object in bulk-require result: ' + obj);
}
