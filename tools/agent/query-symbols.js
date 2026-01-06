"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(args) {
  var options = { format: "json" };
  var i;
  for (i = 0; i < args.length; i += 1) {
    var arg = args[i];
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--format") {
      i += 1;
      options.format = args[i] || "json";
      continue;
    }
    if (arg === "--name") {
      i += 1;
      options.name = args[i];
      continue;
    }
    if (arg === "--method") {
      i += 1;
      options.method = args[i];
      continue;
    }
    if (arg === "--file") {
      i += 1;
      options.file = args[i];
      continue;
    }
    if (arg === "--source") {
      i += 1;
      options.source = args[i];
      continue;
    }
    if (arg === "--kind") {
      i += 1;
      options.kind = args[i];
      continue;
    }
    if (arg === "--decorator") {
      i += 1;
      options.decorator = args[i];
      continue;
    }
    if (arg === "--contains") {
      i += 1;
      options.contains = args[i];
      continue;
    }
    console.error("Unknown argument: " + arg);
    process.exit(1);
  }
  options.format =
    options.format && typeof options.format === "string"
      ? options.format.toLowerCase()
      : "json";
  if (options.format !== "json" && options.format !== "text") {
    console.error('Unsupported format: "' + options.format + '". Use json|text.');
    process.exit(1);
  }
  return options;
}

function printHelp() {
  console.log("Usage: node tools/agent/query-symbols.js [--flag value...]");
  console.log("");
  console.log("--name <ExportName>");
  console.log("--method <MemberName>");
  console.log("--file <file path>");
  console.log("--source <sourceId>");
  console.log("--kind <export kind>");
  console.log("--decorator <decorator name>");
  console.log("--contains <substring>");
  console.log("--format json|text  (default json)");
}

function matchesContains(substring, file, exp) {
  if (!substring) {
    return true;
  }
  if (file && file.indexOf(substring) >= 0) {
    return true;
  }
  if (exp && exp.name && exp.name.indexOf(substring) >= 0) {
    return true;
  }
  if (exp && exp.kind && exp.kind.indexOf(substring) >= 0) {
    return true;
  }
  if (exp && exp.decorators) {
    for (var d = 0; d < exp.decorators.length; d += 1) {
      if (exp.decorators[d] && exp.decorators[d].indexOf(substring) >= 0) {
        return true;
      }
    }
  }
  if (exp && exp.members) {
    for (var m = 0; m < exp.members.length; m += 1) {
      var member = exp.members[m];
      if (member.name && member.name.indexOf(substring) >= 0) {
        return true;
      }
      if (member.kind && member.kind.indexOf(substring) >= 0) {
        return true;
      }
      if (member.params) {
        for (var p = 0; p < member.params.length; p += 1) {
          var param = member.params[p];
          if (param.name && param.name.indexOf(substring) >= 0) {
            return true;
          }
          if (param.type && param.type.indexOf(substring) >= 0) {
            return true;
          }
        }
      }
      if (member.type && member.type.indexOf(substring) >= 0) {
        return true;
      }
    }
  }
  return false;
}

function copyExport(exp, members) {
  var copy = {};
  var key;
  for (key in exp) {
    if (exp.hasOwnProperty(key)) {
      if (key === "members") {
        copy.members = members;
      } else {
        copy[key] = exp[key];
      }
    }
  }
  if (!copy.hasOwnProperty("members")) {
    copy.members = members;
  }
  return copy;
}

function toTextOutput(files) {
  var buffer = [];
  for (var i = 0; i < files.length; i += 1) {
    var file = files[i];
    buffer.push(
      "- file: " +
        file.file +
        (file.sourceId ? " (sourceId=" + file.sourceId + ")" : "")
    );
    for (var j = 0; j < file.exports.length; j += 1) {
      var exp = file.exports[j];
      var memberNames = [];
      for (var k = 0; k < exp.members.length; k += 1) {
        memberNames.push(exp.members[k].name);
      }
      buffer.push(
        "  - " +
          exp.kind +
          " " +
          exp.name +
          (memberNames.length
            ? " → methods: " + memberNames.join(", ")
            : "")
      );
    }
  }
  buffer.push("matches: " + files.reduce(function(sum, f) { return sum + f.exports.length; }, 0));
  return buffer.join("\n");
}

function sortMembers(members) {
  return members.slice().sort(function(a, b) {
    var left = a.name || "";
    var right = b.name || "";
    return left.localeCompare(right);
  });
}

function sortExports(exportsArray) {
  return exportsArray.slice().sort(function(a, b) {
    var left = a.name || "";
    var right = b.name || "";
    return left.localeCompare(right);
  });
}

function sortFiles(files) {
  return files.slice().sort(function(a, b) {
    var left = a.file || "";
    var right = b.file || "";
    return left.localeCompare(right);
  });
}

function run() {
  var options = parseArgs(process.argv.slice(2));
  var symbolsPath = path.resolve(__dirname, "../../docs/knowledge/symbols.json");
  if (!fs.existsSync(symbolsPath)) {
    console.error("Missing docs/knowledge/symbols.json. Run `npm run index`.");
    process.exit(1);
  }
  var raw;
  try {
    raw = fs.readFileSync(symbolsPath, "utf8");
  } catch (err) {
    console.error("Failed to read symbols index:", err.message || err);
    process.exit(1);
  }
  var data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse symbols index:", err.message || err);
    process.exit(1);
  }
  var files = Array.isArray(data.files) ? data.files : [];
  var resultFiles = [];
  for (var f = 0; f < files.length; f += 1) {
    var fileEntry = files[f];
    if (options.file && fileEntry.file !== options.file) {
      continue;
    }
    if (options.source && fileEntry.sourceId !== options.source) {
      continue;
    }
    var matchedExports = [];
    for (var e = 0; e < (fileEntry.exports || []).length; e += 1) {
      var exp = fileEntry.exports[e];
      var exportMatches = true;
      if (options.name && exp.name !== options.name) {
        exportMatches = false;
      }
      if (options.kind && exp.kind !== options.kind) {
        exportMatches = false;
      }
      if (
        options.decorator &&
        (!Array.isArray(exp.decorators) ||
          exp.decorators.indexOf(options.decorator) === -1)
      ) {
        exportMatches = false;
      }
      if (
        options.contains &&
        !matchesContains(options.contains, fileEntry.file, exp)
      ) {
        exportMatches = false;
      }
      var members = Array.isArray(exp.members) ? exp.members : [];
      var filteredMembers = members;
      if (options.method) {
        filteredMembers = [];
        for (var m = 0; m < members.length; m += 1) {
          if (members[m].name === options.method) {
            filteredMembers.push(members[m]);
          }
        }
        if (!filteredMembers.length) {
          exportMatches = false;
        }
      }
      if (!exportMatches) {
        continue;
      }
      matchedExports.push(
        copyExport(exp, sortMembers(filteredMembers))
      );
    }
    if (matchedExports.length) {
      resultFiles.push({
        file: fileEntry.file,
        sourceId: fileEntry.sourceId,
        exports: sortExports(matchedExports)
      });
    }
  }
  var sortedFiles = sortFiles(resultFiles);
  var totalMatches = 0;
  for (var i = 0; i < sortedFiles.length; i += 1) {
    totalMatches += sortedFiles[i].exports.length;
  }
  if (!totalMatches) {
    var empty = { matches: 0 };
    if (options.format === "json") {
      console.log(JSON.stringify(empty, null, 2));
    } else {
      console.log("matches: 0");
    }
    process.exit(2);
  }
  if (options.format === "text") {
    console.log(toTextOutput(sortedFiles));
    return;
  }
  var output = {
    matches: totalMatches,
    files: sortedFiles
  };
  console.log(JSON.stringify(output, null, 2));
}

run();
