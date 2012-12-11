
// xrequire.js - Main xrequire loader.
module.exports = (function() {

  var _ = require('underscore')
    , i = require('i')()
    , path = require('path')
    , fs = require('fs')
    , EventEmitter = require('events').EventEmitter;

  var defaults =
    { filter: null  // function : return true to include only wanted modules
    , reject: null  // function : return true to reject only select modules
    , map: null     // function : transform module exports before re-exporting it

    , prepend: ''   // string   : prepend to module names before exported
    , append: ''    // string   : append to module names before exported
    , inflect: ''   // string   : name of inflection method to use
    , magic: true   // boolean  : set to false to prevent module.exports magic
    }


  function xrequire(mod, options) {
    if (typeof mod !== 'string' && (!mod || typeof mod.filename !== 'string')) {
      throw new Error('module argument must be the module object or __dirname');
    }

    // assume map function if a function is given
    if (options && typeof options === 'function') {
      options = { map: options };
    }

    options = _.extend({ }, xrequire.defaults, options);

    var dirname = (typeof mod === 'string' ? mod : path.dirname(mod.filename))
      , files = fs.readdirSync(dirname)
      , result = { };

    _(files).forEach(function(file) {
      var filePath = path.resolve(path.join(dirname, file))
        , stats = fs.statSync(filePath)
        , extension = path.extname(file)
        , name = path.basename(file, extension);

      // built-in defaults
      if (stats.isDirectory()) return;
      if (name === 'index') return;
      if (name[0] === '.') return;

      // user filters
      if (options.filter && !options.filter(name)) return;
      if (options.reject && options.reject(name)) return;

      // naming rules
      if (options.inflect) name = i[options.inflect](name)
      if (options.prepend) name = options.prepend + name;
      if (options.append) name = name + options.append;

      xrequire.emit('require', filePath, name);

      // maps
      var fileExports = require(filePath);
      if (options.map)
        fileExports = options.map(fileExports, name, path.basename(file, extension));

      result[name] = fileExports;
    });

    // auto-assign exports object if module passed
    if (options.magic && typeof mod !== 'string' && typeof mod.filename === 'string')
      mod.exports = result;

    return result;
  }

  // proxied EventEmitter support
  var emitter = new EventEmitter();
  for (var key in EventEmitter.prototype) {
    if (typeof emitter[key] !== 'function') continue;

    xrequire[key] = _.bind(emitter[key], emitter);
  }

  xrequire._emitter = emitter;
  xrequire.defaults = defaults;
  return xrequire;

})();
