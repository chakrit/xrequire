
// test.js - Tests xrequire functionality
module.exports = (function() {

  // testing tools
  var _ = require('underscore')
    , chai = require('chai')
    , sinon = require('sinon')
    , expect = chai.expect;

  chai.use(require('sinon-chai'));

  // related files
  // use files in cover/ folder in coverage mode
  var XREQ_PATH = './xrequire'
  if (process.env.COVER) {
    XREQ_PATH = './cover/xrequire';
  }

  // the tests
  describe('xrequire module', function() {
    before(function() { this.xrequire = require(XREQ_PATH); });
    after(function() { delete this.xrequire; });

    it('should exports a function', function() {
      expect(this.xrequire).to.be.a('function');
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
        expect(this.defs).to.have.property('append').that.is.a('string')
      });

      it('should have an inflect property which defaults to `identity`', function() {
        expect(this.defs).to.have.property('inflect').that.is.a('string')
      });

      it('should have a filter property which defaults to null', function() {
        expect(this.defs).to.have.property('filter').that.is.null
      });

      it('should have a reject property which defaults to null', function() {
        expect(this.defs).to.have.property('reject').that.is.null
      });

      it('should have a map property which defaults to null', function() {
        expect(this.defs).to.have.property('map').that.is.null
      });

      it('should have a magic property which defaults to true', function() {
        expect(this.defs).to.have.property('magic').that.is.true
      });
    });

    describe('exported function', function() {
      it('should throws if module argument is missing', function() {
        expect(function() { this.xrequire(false); }.bind(this)).to.throw(/argument/)
      });

      it('should throws if module argument is not a string and does not looks like a module', function() {
        expect(function() { this.xrequire({ }); }.bind(this)).to.throw(/argument/)
      });
    });

  });

  describe('xrequire', function() {
    before(function() {
      this.xrequire = require('./xrequire')
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


    // test template
    var itShouldExportTree = function(tree, badTree) {
      for (var key in tree) (function(content, key) {
        it('should include `' + key + '` module.', function() {
          var result = this.run();
          expect(result).to.have.property(key).that.is.eq(content);
        });
      })(require(tree[key]), key);
    };

    var itShouldNotExportKeys = function(keys) {
      for (var i = 0; i < keys.length;i ++) (function(key) {
        it('should not include `' + key + '` module.', function() {
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

    // special cased options
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
