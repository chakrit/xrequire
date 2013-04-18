
// test.js - Tests xrequire functionality
module.exports = (function() {

  // testing tools
  var _ = require('underscore')
    , chai = require('chai')
    , sinon = require('sinon')
    , EventEmitter = require('events').EventEmitter
    , expect = chai.expect;

  chai.use(require('sinon-chai'));

  // related files
  // use files in cover/ folder in coverage mode
  var XREQ_PATH = './xrequire'
  if (process.env.COVER) {
    XREQ_PATH = './xrequire-cov';
  }

  // general interface tests
  describe('xrequire module', function() {
    before(function() { this.xrequire = require(XREQ_PATH); });
    after(function() { delete this.xrequire; });

    it('should exports a function', function() {
      expect(this.xrequire).to.be.a('function');
    });

    describe('events support', function() {
      it('should exports an `_emitter` EventEmitter property', function() {
        expect(this.xrequire).to.have.property('_emitter')
          .that.is.instanceOf(EventEmitter);
      });

      it('should exports an `on` function', function() {
        expect(this.xrequire.on).to.be.a('function');
      });

      it('should exports an `emit` function', function() {
        expect(this.xrequire.emit).to.be.a('function');
      });

      it('should exports a `removeListener` function', function() {
        expect(this.xrequire.removeListener).to.be.a('function');
      });
    });

    describe('defaults hash', function() {
      before(function() { this.defs = this.xrequire.defaults });
      after(function() { delete this.defs });

      it('should be exported', function() {
        expect(this.defs).to.be.an('object');
      });

      it('should have a prepend property which defaults to empty string', function() {
        expect(this.defs).to.have.property('prepend').that.is.a('string');
      });

      it('should have an append property which defaults to empty string', function() {
        expect(this.defs).to.have.property('append').that.is.a('string');
      });

      it('should have an inflect property which defaults to `identity`', function() {
        expect(this.defs).to.have.property('inflect').that.is.a('string');
      });

      it('should have a filter property which defaults to null', function() {
        expect(this.defs).to.have.property('filter').that.is.null;
      });

      it('should have a reject property which defaults to null', function() {
        expect(this.defs).to.have.property('reject').that.is.null;
      });

      it('should have a map property which defaults to null', function() {
        expect(this.defs).to.have.property('map').that.is.null;
      });

      it('should have a tap property which defaults to null', function() {
        expect(this.defs).to.have.property('tap').that.is.null;
      });

      it('should have an extensions property with sane defaults', function() {
        expect(this.defs).to.have.property('extensions')
          .that.include('js')
          .and.include('coffee')
          .and.include('litcoffee')
          .and.include('node');
      });

      it('should have a magic property which defaults to true', function() {
        expect(this.defs).to.have.property('magic').that.is.true;
      });
    });

    describe('exported function', function() {
      it('should throws if module argument is missing', function() {
        expect(function() { this.xrequire(false); }.bind(this)).to.throw(/argument/);
      });

      it('should throws if module argument is not a string and does not looks like a module', function() {
        expect(function() { this.xrequire({ }); }.bind(this)).to.throw(/argument/);
      });
    });

  });


  describe('xrequire', function() {
    before(function() {
      this.xrequire = require(XREQ_PATH)
      this.run = function() {
        return this.xrequire('./sample', this.options);
      }.bind(this);
    });
    after(function() { delete this.run });

    // save and restore require cache state
    beforeEach(function() {
      this.required = []
      for (var key in require.cache)
        this.required.push(key);
    });

    afterEach(function() {
      for (var key in require.cache)
        if (_(this.required).indexOf(key) === -1)
          delete require.cache[key]
    });

    describe('events emitter', function() {
      it('should emits a `require` event for each required module', function(done) {
        var me = this
          , count = 3; // a, b and long_name

        function onRequire(path, name) {
          expect(path).to.match(/(a|b|long_name)\.js/i);
          expect(name).to.match(/(a|b|long_name)/i);

          if (!--count) {
            me.xrequire.removeListener('require', onRequire);
            done()
          }
        }

        this.xrequire.on('require', onRequire);
        this.run()
      });
    });

    // templated tests
    var itShouldExportTree = function(tree, badTree) {
      for (var key in tree) (function(content, key) {
        it('should include `' + key + '` module exports.', function() {
          var result = this.run();
          expect(result).to.have.property(key).that.is.eq(content);
        });
      })(require(tree[key]), key);
    };

    var itShouldNotExportKeys = function(keys) {
      for (var i = 0; i < keys.length;i ++) (function(key) {
        it('should not include `' + key + '` key.', function() {
          var result = this.run();
          expect(result).to.not.have.property(key);
        });
      })(keys[i]);
    };

    var describeConfiguration = function(desc, opts, expectedTree, unexpectedKeys) {
      describe('result with ' + desc + ' options passed', function() {
        before(function() { this.options = opts; });
        after(function() { delete this.options; });

        itShouldExportTree(expectedTree);
        if (unexpectedKeys)
          itShouldNotExportKeys(unexpectedKeys);
      });

      describe('result with ' + desc + ' defaults set', function() {
        before(function() {
          this._defaults = this.xrequire.defaults;
          this.xrequire.defaults = opts;
        });
        after(function() {
          this.xrequire.defaults = this._defaults;
          delete this._defaults;
        });

        itShouldExportTree(expectedTree);
        if (unexpectedKeys)
          itShouldNotExportKeys(unexpectedKeys);
      });
    };

    // test various configurations
    describeConfiguration('no', undefined,
      { a: './sample/a'
      , b: './sample/b'
      , long_name: './sample/long_name'
      },
      ['index']);

    describeConfiguration('prepend', { prepend: 'PREFIX' },
      { PREFIXa: './sample/a'
      , PREFIXb: './sample/b'
      , PREFIXlong_name: './sample/long_name'
      });

    describeConfiguration('append', { append: 'SUFFIX' },
      { aSUFFIX: './sample/a'
      , bSUFFIX: './sample/b'
      , long_nameSUFFIX: './sample/long_name'
      });

    describeConfiguration('`titleize` inflect', { inflect: 'titleize' },
      { A: './sample/a'
      , B: './sample/b'
      , "Long Name": './sample/long_name'
      });

    describeConfiguration('`dasherize` inflect', { inflect: 'dasherize' },
      { a: './sample/a'
      , b: './sample/b'
      , "long-name": './sample/long_name'
      });

    describeConfiguration('full naming', { prepend: 'P', append: 'S', inflect: 'classify' },
      { PAS: './sample/a'
      , PBS: './sample/b'
      , PLongNameS: './sample/long_name'
      });

    describeConfiguration('filter', { filter: function(name) { return name === 'a'; } },
      { a: './sample/a' },
      ['b', 'long_name']);

    describeConfiguration('reject', { reject: function(name) { return name === 'b'; } },
      { a: './sample/a'
      , long_name: './sample/long_name'
      },
      ['b']);

    describeConfiguration('map', { map: function(map) { return require('./dud'); } },
      { a: './dud'
      , b: './dud'
      , long_name: './dud'
      });

    describeConfiguration('empty extensions', { extensions: '' }, null, ['a', 'b', 'long_name']);

    // special cased options
    describe('tap function', function() {
      before(function() {
        var me = this;
        this.tappedItems = [];
        this.tap = function(obj) { me.tappedItems.push(obj); };

        this.runAndCheck = function() {
          var result = this.run();
          for (var key in result) {
            if (!result.hasOwnProperty(key)) continue;
            expect(this.tappedItems).to.include(result[key]);
          }
        };
      });
      after(function() {
        delete this.runAndCheck;
        delete this.tap;
        delete this.count;
        delete this.items;
      });

      it('should be invoked for each required module when set as options', function() {
        this.options = { tap: this.tap };
        this.runAndCheck();
        delete this.options;
      });

      it('should be invoked for each required module when set as defaults', function() {
        this._defaults = this.xrequire.defaults;
        this.xrequire.defaults = { tap: this.tap };
        this.runAndCheck();
        this.xrequire.defaults = this._defaults;
      });
    });

    describe('result with function passed as option', function() {
      before(function() { this.options = function(map) { return require('./dud'); }; });
      after(function() { delete this.options; });

      itShouldExportTree(
        { a: './dud'
        , b: './dud'
        , long_name: './dud'
        });
    });

    describe('result when a module object is given', function() {
      before(function() {
        this._run = this.run;
        this.run = function() { return require('./sample'); };
      });
      after(function() {
        this.run = this._run;
        delete this._run;
      });

      itShouldExportTree(
        { a: './sample/a'
        , b: './sample/b'
        , long_name: './sample/long_name'
        });

      describe('but magic option is set to false', function() {
        before(function() {
          this._magic = this.xrequire.defaults.magic;
          this.xrequire.defaults.magic = false;
        });
        after(function() {
          this.xrequire.defaults.magic = this._magic;
          delete this._magic;
        });

        itShouldNotExportKeys(['a', 'b', 'long_name']);
      });
    });

  });

})();
