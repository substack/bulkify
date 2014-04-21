var test = require('tape');
var path = require('path');
var bulk = require('../');
var vm = require('vm');
var concat = require('concat-stream');

test('glob', function (t) {
    t.plan(8);
    
    var dir = path.join(__dirname + '/glob');
    var b = bulk();
    b.pipe(concat(function (body) {
        vm.runInNewContext(body, { console: { log: log } });
    }));
    b.write("console.log(require('bulk-require')("
        + JSON.stringify(dir)
        + ", [ 'data/**/*.js', 'render/*.js' ]))"
    );
    b.end();
    
    function log (sections) {
        t.deepEqual(Object.keys(sections), [ 'data', 'render' ]);
        t.deepEqual(Object.keys(sections.data), [ 'cats', 'dogs', 'owners' ]);
        t.deepEqual(Object.keys(sections.render), [ 'x' ]);
        t.deepEqual(Object.keys(sections.render.x), [ 'oneoneone', 'twotwotwo' ]);
        t.equal(sections.data.cats, sections.data.cats.index);
        t.equal(sections.data.dogs, sections.data.dogs.index);
        t.equal(typeof sections.data.cats, 'function');
        t.equal(typeof sections.data.dogs, 'function');
    }
});
