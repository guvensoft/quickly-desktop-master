/* eslint-disable no-console */
'use strict';

const fs = require('fs');

function stringifyPath(p) {
  try {
    if (Buffer.isBuffer(p)) return p.toString('utf8');
    return String(p);
  } catch (_error) {
    return '<unprintable>';
  }
}

function logEisdir(op, p, err, stack) {
  const pathStr = stringifyPath(p);
  const stackStr = stack || new Error().stack;
  const shortStack = String(stackStr)
    .split('\n')
    .slice(0, 14)
    .join('\n');
  const msg = err && err.message ? String(err.message) : '';
  console.error(
    `FS_EISDIR op=${op} path=${JSON.stringify(pathStr)} message=${JSON.stringify(msg)}\n${shortStack}`,
  );
}

function wrapReadFile() {
  const original = fs.readFile;
  fs.readFile = function readFileWrapped(p, options, callback) {
    const callsiteStack = new Error().stack;
    let cb = callback;
    let opts = options;

    if (typeof opts === 'function') {
      cb = opts;
      opts = undefined;
    }

    if (typeof cb !== 'function') {
      return original.call(fs, p, opts, cb);
    }

    return original.call(fs, p, opts, function wrappedCallback(err, data) {
      if (err && err.code === 'EISDIR') logEisdir('readFile', p, err, callsiteStack);
      return cb(err, data);
    });
  };
}

function wrapReadFileSync() {
  const original = fs.readFileSync;
  fs.readFileSync = function readFileSyncWrapped(p, options) {
    const callsiteStack = new Error().stack;
    try {
      return original.call(fs, p, options);
    } catch (err) {
      if (err && err.code === 'EISDIR') logEisdir('readFileSync', p, err, callsiteStack);
      throw err;
    }
  };
}

function wrapCreateReadStream() {
  const original = fs.createReadStream;
  fs.createReadStream = function createReadStreamWrapped(p, options) {
    const callsiteStack = new Error().stack;
    const stream = original.call(fs, p, options);
    if (stream && typeof stream.once === 'function') {
      stream.once('error', (err) => {
        if (err && err.code === 'EISDIR') logEisdir('createReadStream', p, err, callsiteStack);
      });
    }
    return stream;
  };
}

wrapReadFile();
wrapReadFileSync();
wrapCreateReadStream();
