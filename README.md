
# XREQUIRE

xrequire is your `index.js` folder loader swiss army knife. Obligatory feature checklist (and API documentation all in one):

* Implement your `index.js` in a single line:

```js
require('xrequire')(module)
```

* Or the more common style found with other libs:

```js
module.exports = require('xrequire')(__dirname)
```

* Post-prodcess modules on the fly by passing a `map` function:

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
* Or `reject` works too:

```js
require('xrequire')(module,
  { filter:
    function(name) {
      return name[0] !== '_'; // modules with _ prefix should be hidden
    }
  }
);

/* ----- OR ----- */

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
// we'll get adminUser, staffUser and guestUser exports

require('xrequire')(module, { append: 'User' });
```

* Transform your file names into ClassNames dasherized-name or even "Titleized Long Strings Keys" via
  an integrated [pksunkara/inflect] hook:

```js
require('xrequire')(module, { inflect: 'classify' }); // or ...
require('xrequire')(module, { inflect: 'dasherize' }); // or ...
require('xrequire')(module, { inflect: 'titleize' }); // or ...
// other i.hooks works too.
```

* Implemented in pure JS with 100% test coverage (yeah, there wasn't much to be tested anyway.)

```sh
$ make cover
```

