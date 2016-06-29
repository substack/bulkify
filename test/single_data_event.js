var test = require('tape');
var fs = require('fs');
var path = require('path');
var bulk = require('../');
var bulkRequire = require('bulk-require');
var vm = require('vm');
var concat = require('concat-stream');

var dir = path.join(__dirname + '/glob');
var args = [ 'data/**/*.js', 'render/*.js' ];
var expected = bulkRequire(dir, args);

test('single data event', function (t) {
    t.plan(2);
    var count = 0
    var body = ''

    var b = bulk('');
    b.on('data', function (b) {
        count++
        body = body + b.toString()
    })
    b.write("console.log(require('bulk-require')("
        + JSON.stringify(dir) + ', ' + JSON.stringify(args)
        + '))'
        )
    b.end()
    b.on('end', function () {
        vm.runInNewContext(body, {
            console: { log: log },
            require: require
        });
        t.equal(count, 1, 'Should only emit data event once with entire file')
    })
    function log (sections) {
        t.deepEqual(sections, expected);
    }
});
