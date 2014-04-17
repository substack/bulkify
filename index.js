var bulk = require('bulk-require');
var path = require('path');

var through = require('through2');
var falafel = require('falafel');
var interceptPath = require.resolve('./lib/_intercept.js');

module.exports = function (file, opts) {
    if (/\.json$/.test(file)) return through();
    if (!opts) opts = {};
    var moduleName = opts.moduleName || 'bulk-require';
    if (file === interceptPath) {
        var output = through();
        return output;
    }
    
    var buffers = [];
    var fsNames = {};
    var vars = [ '__filename', '__dirname' ];
    var dirname = path.dirname(file);
    
    var tr = through(write, end);
    return tr;
    
    function write (buf, enc, next) {
        buffers.push(buf);
        next();
    }
    function end () {
        var data = Buffer.concat(buffers).toString('utf8');
        try { var output = falafel(data, parse) }
        catch (err) {
            this.emit('error', new Error(err.message + ' in file ' + file));
        }
        finish(output);
    }
    
    function finish (output) {
        tr.push(String(output));
        tr.push(null);
    }
    
    function parse (node) {
        if (isRequire(node) && node.arguments[0].value === moduleName) {
            node.update('require(' + JSON.stringify(interceptPath) + ')');
        }
    }
    
    function isRequire (node) {
        var c = node.callee;
        return c
            && node.type === 'CallExpression'
            && c.type === 'Identifier'
            && c.name === 'require'
        ;
    }
};
