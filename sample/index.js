
// NOTE: This file should not be included in tests,
//   it is only added here to allow testing global module object
//   from inside a real index.js module
require(process.env.COVER ? '../xrequire-cov' : '../xrequire')(module);

