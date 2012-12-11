
[![Travis CI badge](https://secure.travis-ci.org/chakrit/xrequire.png)](http://traivs-ci.org/chakrit/xrequire)

# XREQUIRE

XREQUIRE is your `index.js` folder loader swiss army knife.

```sh
$ npm install xrequire --save
```

#### Obligatory feature checklist (and API documentation all in one):

* Implement your `index.js` in a single line:

```js
require('xrequire')(module)
```

* Or the more common style found with other libs:

```js
module.exports = require('xrequire')(__dirname)
```

* Post-process modules on the fly by passing a `map` function:

```js
require('xrequire')(module, function(exports, name, basename) {

  // hidden base class
  function Base() { }
  Base.prototype = new Object();

  // inject base class and other shared dependencies
  return exports(Base, require('underscore'), require('async'));

});
```

* Filters module by passing a `filter` function:

```js
require('xrequire')(module,
  { filter:
    function(name) {
      return name[0] !== '_'; // modules with _ prefix should be hidden
    }
  }
);
```

* Or `reject` works too:

```js
require('xrequire')(module,
  { reject:
    function(name) {
      return name[0] === '_'; // modules with _ prefix should be hidden
    }
  }
);
```

* Append (or prepend) a namespace-specific name to your classes without having long filenames:

```js
// assume we have roles/admin.js roles/staff.js and roles/guest.js
// we'll get adminRole, staffRole and guestRole exports

require('xrequire')(module, { append: 'Role' });
```

* Transform your file names into ClassNames dasherized-name or even "Titleized Long Strings Keys" via
  an integrated [pksunkara/inflect](https://github.com/pksunkara/inflect) hook:

```js
require('xrequire')(module, { inflect: 'classify' }); // or ...
require('xrequire')(module, { inflect: 'dasherize' }); // or ...
require('xrequire')(module, { inflect: 'titleize' }); // or ...
// other i.hooks works too.
```

* The last two options together provide some nice naming capability out of the box:

```js
require('xrequire')(module, { inflect: 'classify', append: 'Role' })

// assume we have roles/admin.js roles/staff.js and roles/guest.js
// we'll get AdminRole, StaffRole and GuestRole all neat and clean :)
```

* Implemented in pure JS with 100% test coverage (yeah, there wasn't much to be tested anyway.)

```sh
$ make cover
```

# OPTIONS

Default values are as follows:

```js
{ filter: function(name) { return true; }     // function : return true to include only wanted modules
, reject: function(name) { return false; }    // function : return true to reject select modules
, map: function(exports) { return exports; }  // function : transform module exports (useful w/ function() exports)

, prepend: ''   // string   : prepend to module names before exported
, append: ''    // string   : append to module names before exported
, inflect: ''   // string   : name of inflection method to use
, magic: true   // boolean  : set to false to prevent module.exports magic
}
```

# DEVELOPMENT

Test `xrequire` by running

```sh
$ make test
```

and generate coverage reports by running

```sh
$ make cover
```

#### Things to do:

* Subfolder requires.
* Support for folder requires without needing to implement `index.js`.
* More inflection tests and validation.
* Direct name transform function.

# LICENSE

BSD

# SUPPORT

Just open a [GitHub issue](https://github.com/chakrit/xrequire/issues) or ping
me on twitter [@chakrit](http://twitter.com/chakrit)

