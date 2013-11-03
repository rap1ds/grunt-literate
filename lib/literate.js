"use strict";

var lex = require("./lex.js");

var whitespaceEndRe = /^\s*$/;
var whitespaceRe = /^(\s*)/;

function isWhitespace(str) {
  return whitespaceEndRe.test(str);
}

function find(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
}

function not(predicate) {
  return function() {
    return !predicate.apply(null, arguments);
  }
}

function dropWhile(array, predicate) {
  var drop = true;
  return array.reduce(function(a, b) {
    if(drop && !predicate(b)) {
      drop = false;
    }

    return drop ? a : a.concat([b]);
  }, []);
}

function dropWhileRight(array, predicate) {
  var reversed = array.slice(); // local copy
  reversed.reverse();

  var dropped = dropWhile(reversed, predicate).reverse();

  return dropped;
}

function takeUntil(array, predicate) {
  var take = true;
  return array.reduce(function(a, b) {
    if(take && predicate(b)) {
      take = false;
    }

    return take ? a.concat([b]) : take;
  }, []);
}

function literate(contents, opts) {
  opts = opts || {};

  var tokens = lex(contents);
  var state = "code";
  var content = "";
  var captureCode = false;

  var tmp = ""; // buffer for code output

  function unindent(indent) {
    return function(line) {
      if (line.indexOf(indent) === 0) {
        return line.replace(indent, "");
      } else if (isWhitespace(line)) {
        return "";
      } else {
        return line;
      }
    }
  }

  function appendCode() {
     if (state === "code") {
      state = "text";
      if (!isWhitespace(tmp)) {
        // content += tmp.replace(/^[\s\n]*/, "").replace(/[\s\n]*$/, "") + "\n";
        var lines = tmp.split(/\n/);
        lines = dropWhile(lines, isWhitespace);
        lines = dropWhileRight(lines, isWhitespace);
        var first = lines[0];
        var indent = first ? whitespaceRe.exec(first)[1] : "";

        // unindent lines
        lines = lines.map(unindent(indent));

        content += lines.join("\n") + "\n";
      }
      tmp = "";
    }
  }

  tokens.forEach(function (token) {
    if (token.type === "Comment" && token.value.type === "Block" && token.value.value[0] === "*") {
      appendCode();

      // literate comment
      var comment = token.value;

      // block comment starting with /**
      var value = comment.value.slice(1);

      var lines = value.split(/\n/);
      lines = dropWhile(lines, isWhitespace);
      // lines = dropWhileRight(lines, isWhitespace);
      var first = lines[0];
      var indent = first ? whitespaceRe.exec(first)[1] : "";

      // unindent lines
      lines = lines.map(unindent(indent));

      content += lines.join("\n");

      var oddNumOfCodeBlocks = lines.filter(function(line) {
        return line.indexOf("```") === 0;
      }).length % 2 !== 0;

      if(oddNumOfCodeBlocks) {
        captureCode = !captureCode;
      }

      if(!captureCode) {
        content += "\n";
      }

      // console.log(lines.join("\n"));
      // console.log("CAPTURE: ", captureCode);

    } else {
      // Code
      if (state !== "code") {
        state = "code";
        tmp = "";
      }

      if(captureCode) {
        tmp += contents.substr(token.range[0], token.range[1] - token.range[0]);
      }
    }
  });

  // Append code at end of the file
  appendCode();

  return content;
}

module.exports = literate;
