var bulk = require('bulk-require');
var path = require('path');

var through = require('through');
var falafel = require('falafel');

module.exports = function (file) {
    if (/\.json$/.test(file)) return through();
    var buffers = [];
    var fsNames = {};
    var vars = [ '__filename', '__dirname' ];
    var dirname = path.dirname(file);
    
    var tr = through(write, end);
    return tr;
    
    function write (buf) { buffers.push(buf) }
    function end () {
        var data = Buffer.concat(buffers).toString('utf8');
        try { var output = falafel(data, parse) }
        catch (err) {
            this.emit('error', new Error(
                err.toString().replace('Error: ', '') + ' (' + file + ')')
            );
        }
        finish(output);
    }
    
    function finish (output) {
        tr.queue(String(output));
        tr.queue(null);
    }
    
    function parse (node) {
        
    }
};
