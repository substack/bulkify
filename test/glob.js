var test = require('tape');
var path = require('path');
var bulk = require('../');
var bulkRequire = require('bulk-require');
var vm = require('vm');
var concat = require('concat-stream');

var dir = path.join(__dirname + '/glob');
var args = [ 'data/**/*.js', 'render/*.js' ];
var expected = bulkRequire(dir, args);

test('glob', function (t) {
    t.plan(1);

    var b = bulk('');
    b.pipe(concat(function (body) {
        vm.runInNewContext(body, {
            console: { log: log },
            require: require
        });
    }));
    b.write("console.log(require('bulk-require')("
        + JSON.stringify(dir) + ', ' + JSON.stringify(args)
        + '))'
    );
    b.end();

    function log (sections) {
        t.deepEqual(sections, expected);
    }
});
