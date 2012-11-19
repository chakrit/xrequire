
// xrequire.js - Main xrequire loader.
module.exports = (function() {

  var _ = require('underscore')
    , i = require('i')()
    , path = require('path')
    , fs = require('fs');

  var defaults =
    { filter: null
    , reject: null
    , map: null

    , prepend: ''
    , append: ''
    , inflect: ''
    }


  // TODO: Allow options to be passed as a function (=== options.map)
  function xrequire(mod, options) {
    if (!mod ||
      (typeof mod !== 'string' && 
      typeof mod.path !== 'string')) {
      throw new Error('module argument must be the module object or __dirname');
    }

    options = _.extend({ }, xrequire.defaults, options);

    var dirname = (typeof mod === 'string' ? mod : path.dirname(mod.path))
      , files = fs.readdirSync(dirname)
      , result = { };

    _(files).forEach(function(file) {
      var filePath = path.join(dirname, file)
        , extension = path.extname(file)
        , name = path.basename(file, extension);

      // filters
      if (name === 'index') return;
      if (options.filter && !options.filter(name)) return;
      if (options.reject && options.reject(name)) return;

      // naming rules
      if (options.inflect) name = i[options.inflect](name)
      if (options.prepend) name = options.prepend + name;
      if (options.append) name = name + options.append;

      // maps
      var mod = require('./' + filePath);
      if (options.map)
        mod = options.map(mod, name, path.basename(file, extension));

      result[name] = mod;
    });

    // TODO: Assign module.exports if module passed
    return result;
  }


  xrequire.defaults = defaults;
  return xrequire;

})();
