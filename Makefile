
BIN = ./node_modules/.bin

default: test

clean:
	@git clean -xdf

test:
	@$(BIN)/mocha --reporter spec test.js

cover: instrument
	@COVER=1 $(BIN)/mocha --reporter mocha-istanbul

instrument:
	@mkdir -p cover/
	@$(BIN)/istanbul instrument --output cover/xrequire.js --no-compact xrequire.js

.PHONY: instrument all default test watch cover clean

