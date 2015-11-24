# Run top-level tasks the old-fashioned way
# This is for easing development, and documentation,
# and not an official supported build step.

default: test

build:
	grunt build

test: build
	 karma start test/karma.conf.js
