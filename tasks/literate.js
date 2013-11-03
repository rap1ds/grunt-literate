//foobar
/*
 * grunt-literate
 * https://github.com/phadej/grunt-quotmark
 *
 * Copyright (c) 2013 Oleg Grenrus
 * Licensed under the BSD3 license.
 */

/**

# grunt-literate

> Generate docs from your source

## Getting Started

This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before,
be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide,
as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

Once you're familiar with that process, you may install this plugin with this command:

```sh
npm install grunt-literate --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-literate');
```

## The "literate" task

In your project's Gruntfile, add a section named `literate` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  literate: {
     "README.md": "lib/foobar.js"
  }
});
```

The source will be parsed as JavaScript, and `/** ... ` comments extracted to the destionation file.
This example uses markdown, but you are free to use any format, or even just plain text.

### Options

There are no options yet.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).
Make a pull request, but don't commit `README.md`!

## Release History

- 0.1.1 Fix issue with unindenting
- 0.1.0 Initial release

## Related work

This task could be abused to do literate programming.

```js
*/

"use strict";

var literate = require("../lib/literate.js");
var assert = require("assert");

module.exports = function(grunt) {
  grunt.registerMultiTask("literate", "Generate docs from your source", function() {
    var options = this.options({
      code: false,
    });

    this.files.forEach(function (f) {
      assert(f.dest, "dest argument is required");
      var content = "";

      f.src.forEach(function (filename) {
        content += literate(grunt.file.read(filename), options);
      });

      // Write file
      grunt.file.write(f.dest, content);
    });
  });
};

/**
  ```
*/