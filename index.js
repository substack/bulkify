var staticModule = require('static-module');
var path = require('path');
var through = require('through2');
var bulk = require('bulk-require');
var concat = require('concat-stream')

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
    return through(function (buf, enc, next) {
        sm.write(buf)
        sm.end()
        sm.pipe(concat(function (output) {
            next(null, output)
        }))
    })

    function bulkRequire (dir, globs, opts) {
        var stream = through();
        var res = bulk(dir, globs, {
            index: opts && opts.index,
            require: function (x) {
                if (!file) return path.resolve(x);
                var r = path.relative(filedir, x);
                return /^\./.test(r) ? r : './' + r;
            }
        });
        stream.push(walk(res, opts));
        stream.push(null);
        return stream;
    }
};

function walk (obj, opts) {
    if (!opts) opts = {};
    opts.index = opts.index === false ? false : true
    if (typeof obj === 'string') {
        return 'require(' + JSON.stringify(obj) + ')';
    }
    else if (obj && typeof obj === 'object' && obj.index && opts.index) {
        return '(function () {'
            + 'var f = ' + walk(obj.index) + ';'
            + Object.keys(obj).map(function (key) {
                return 'f[' + JSON.stringify(key) + ']=' + walk(obj[key], opts) + ';';
            }).join('')
            + 'return f;'
            + '})()'
        ;
    }
    else if (obj && typeof obj === 'object') {
        return '({' + Object.keys(obj).map(function (key) {
            return JSON.stringify(key) + ':' + walk(obj[key], opts);
        }).join(',') + '})';
    }
    else throw new Error('unexpected object in bulk-require result: ' + obj);
}
