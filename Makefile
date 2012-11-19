
BIN = ./node_modules/.bin

default: test

clean:
	rm -Rf cover
	rm -Rf coverage
	rm -Rf html-report

test:
	@$(BIN)/mocha --reporter spec test.js

cover: instrument
	@echo open html-report/index.html to view coverage report.
	@COVER=1 $(BIN)/mocha --reporter mocha-istanbul

instrument:
	@mkdir -p cover/
	@$(BIN)/istanbul instrument --output cover/xrequire.js --no-compact xrequire.js

.PHONY: instrument all default test watch cover clean

