
BIN = ./node_modules/.bin
TEST_OPTS = --reporter spec --globals __coverage__

default: test

clean:
	rm -Rf lib-cov
	rm -Rf coverage
	rm -Rf html-report

test:
	@$(BIN)/mocha $(TEST_OPTS) test.js
watch:
	@$(BIN)/mocha $(TEST_OPTS) --watch test.js

cover: instrument
	@echo open html-report/index.html to view coverage report.
	@COVER=1 $(BIN)/mocha $(TEST_OPTS) --reporter mocha-istanbul test.js

instrument:
	@mkdir -p lib-cov/
	@$(BIN)/istanbul instrument --variable global.__coverage__ --output lib-cov/xrequire.js --no-compact xrequire.js

.PHONY: instrument all default test watch cover clean

