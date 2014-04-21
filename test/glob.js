var test = require('tape');
var bulk = require('bulk-require');
var path = require('path');

test(function (t) {
    t.plan(8);
    var dir = path.join(__dirname + '/glob');
    var sections = bulk(dir, [ 'data/**/*.js', 'render/*.js' ]);
    t.deepEqual(Object.keys(sections), [ 'data', 'render' ]);
    t.deepEqual(Object.keys(sections.data), [ 'cats', 'dogs', 'owners' ]);
    t.deepEqual(Object.keys(sections.render), [ 'x' ]);
    t.deepEqual(Object.keys(sections.render.x), [ 'oneoneone', 'twotwotwo' ]);
    t.equal(sections.data.cats, sections.data.cats.index);
    t.equal(sections.data.dogs, sections.data.dogs.index);
    t.equal(typeof sections.data.cats, 'function');
    t.equal(typeof sections.data.dogs, 'function');
});
