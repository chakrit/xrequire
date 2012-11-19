
// test.js - Tests xrequire functionality
module.exports = (function() {

  // related files
  var FILES =
    { XREQUIRE: './xrequire'
    };

  // use files in cover/ folder in coverage mode
  if (process.env.COVER)
    for (key in FILES)
      FILES[key] = './cover/' + FILES[key];

  // testing tools
  var _ = require('underscore')
    , chai = require('chai')
    , sinon = require('sinon')
    , expect = chai.expect;

  chai.use(require('sinon-chai'));

  // the tests
  describe('xrequire module', function() {
    before(function() {
      this.xrequire = require(FILES.XREQUIRE);
    });

    it('should be exported', function() { });
  });

})();
