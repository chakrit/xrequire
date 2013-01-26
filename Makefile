
BIN = ./node_modules/.bin
TEST_OPTS = --reporter spec --globals __coverage__ --timeout 100
COVER_OPTS = --embed-source --no-compact

default: test

clean:
	rm xrequire-cov.js
	rm -Rf html-report

test: node_modules
	@$(BIN)/mocha $(TEST_OPTS) test.js
watch: node_modules
	@$(BIN)/mocha $(TEST_OPTS) --watch test.js

cover: xrequire-cov.js
	@echo open html-report/index.html to view coverage report.
	@COVER=1 $(BIN)/mocha $(TEST_OPTS) --reporter mocha-istanbul test.js

xrequire-cov.js: xrequire.js
	@$(BIN)/istanbul instrument $(COVER_OPTS) --output xrequire-cov.js xrequire.js

node_modules:
	@npm install

.PHONY: instrument all default test watch cover clean

