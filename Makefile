
BIN = ./node_modules/.bin
TEST_OPTS = --reporter spec --globals __coverage__ --timeout 100

default: test

clean:
	rm -Rf lib-cov
	rm -Rf html-report

test: node_modules
	@$(BIN)/mocha $(TEST_OPTS) test.js
watch: node_modules
	@$(BIN)/mocha $(TEST_OPTS) --watch test.js

cover: instrument
	@echo open html-report/index.html to view coverage report.
	@COVER=1 $(BIN)/mocha $(TEST_OPTS) --reporter mocha-istanbul test.js

node_modules:
	@npm install

.PHONY: instrument all default test watch cover clean

