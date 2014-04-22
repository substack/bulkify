# bulkify

transform inline [bulk-require](https://npmjs.org/package/bulk-require)
calls into statically resolvable require maps

[![build status](https://secure.travis-ci.org/substack/bulkify.png)](http://travis-ci.org/substack/bulkify)

The bulkify function signature is compatible with
[browserify](http://browserify.org)'s transform API.

# example

``` js
var bulk = require('bulk-require');
var sections = bulk(__dirname, [ 'data/**/*.js', 'render/*.js' ]);
console.log(sections);
```

You can run this program in node directly:

```
$ node glob.js
{ data: 
   { cats: { [Function] index: [Circular], meow: [Object] },
     dogs: { [Function] index: [Circular], small: [Object], wolf: [Object] },
     owners: { data: [Object] } },
  render: { x: { oneoneone: 111, twotwotwo: 222 } } }
```

and use bulkify as a transform, yielding the same output:

```
$ browserify -t bulkify glob.js | node
{ data: 
   { cats: { [Function] index: [Function], meow: [Object] },
     dogs: { [Function] index: [Function], small: [Object], wolf: [Object] },
     owners: { data: [Object] } },
  render: { x: { oneoneone: 111, twotwotwo: 222 } } }
```

# methods

``` js
var bulkify = require('bulkify')
```

## var b = bulkify(file, opts)

Return a transform stream `b` for `file`, rewriting `require('bulk-require')`
calls with inline require calls.

You can optionally set extra variables for the
[static evaluation](https://npmjs.org/package/static-eval) with opts.vars.

# install

With [npm](https://npmjs.org), do:

```
npm install bulkify
```

# license

MIT
