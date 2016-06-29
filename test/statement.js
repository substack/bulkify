var test = require('tape');
var path = require('path');
var bulk = require('../');
var bulkRequire = require('bulk-require');
var vm = require('vm');
var concat = require('concat-stream');

var dir = path.join(__dirname + '/statement');
var args = [ 'data/**/*.js', 'render/*.js' ];
var expected = bulkRequire(dir, args);

test('statement', function (t) {
    t.plan(1);

    var b = bulk('');
    b.pipe(concat(function (body) {
        vm.runInNewContext(body, { require: require, t: t });
    }));
    b.write("var bulk = require('bulk-require');\nbulk("
        + JSON.stringify(dir) + ', ' + JSON.stringify(args)
        + ');\nt.ok(true)'
    );
    b.end();

    function log (sections) {
        t.deepEqual(sections, expected);
    }
});
