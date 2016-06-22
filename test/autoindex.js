var test = require('tape');
var path = require('path');
var bulk = require('../');
var bulkRequire = require('bulk-require');
var vm = require('vm');
var concat = require('concat-stream');

var dir = path.join(__dirname + '/glob');
var args = [ 'data/**/*.js', 'render/*.js' ];
var opts = {index: false};
var expected = bulkRequire(dir, args, opts);

var expectedRequire = [
    './test/glob/data/cats/index.js',
    './test/glob/data/cats/meow/x.js',
    './test/glob/data/dogs/index.js',
    './test/glob/data/dogs/small/yip.js',
    './test/glob/data/dogs/wolf/doge.js',
    './test/glob/data/owners/data.js',
    './test/glob/render/x.js'
];

test('no auto-index', function (t) {
    t.plan(1 + expectedRequire.length);

    var fdir = path.join(__dirname, '..');
    var b = bulk(path.join(fdir, 'fake.js'));
    b.pipe(concat(function (body) {
        vm.runInNewContext(body, {
            console: { log: log },
            require: function (x) {
                t.equal(expectedRequire.shift(), x);
                return require(path.resolve(fdir, x));
            }
        });
    }));
    b.write("console.log(require('bulk-require')("
        + JSON.stringify(dir) + ', ' + JSON.stringify(args) + ', ' + JSON.stringify(opts)
        + '))'
    );
    b.end();

    function log (sections) {
        t.deepEqual(sections, expected, 'output as expected');
    }
});
