var global = Function("return this;")();
/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var oldRequire = require
    , modules = {}
    ;

  function newRequire(modulename) {
    var err
      , mod
      , metamod
      ;

    try {
      mod = oldRequire(modulename);
    } catch(e) {
      err = e;
    }

    if (mod) {
      return mod;
    }

    metamod = modules[modulename];
    
    if (metamod) {
      mod = metamod();
      return mod;
    }

    // make it possible to require 'process', etc
    mod = global[modulename];

    if (mod) {
      return mod;
    }

    console.error(modulename);
    throw err;
  }

  function provide(modulename, factory) {
    var modReal
      ;

    function metamod() {
      if (modReal) {
        return modReal;
      }

      if (!factory.__pakmanager_factory__) {
        modReal = factory;
        return factory;
      }

      if (factory.__factoryIsResolving) {
        console.error('Your circular dependencies are too powerful!');
        return factory.__moduleExports;
      }

      factory.__factoryIsResolving = true;
      factory.__moduleExports = {};
      modReal = factory(factory.__moduleExports);
      factory.__factoryIsResolving = false;

      return modReal;
    }

    modules[modulename] = metamod;
    // somewhat of a dirty hack since I don't have a plug for loading the "main" module otherwise
    modules['pakmanager.main'] = metamod;
  }

  require = newRequire;
  global.require = newRequire;
  global.provide = provide;
}());

// pakmanager:wrappy
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Returns a wrapper function that returns a wrapped callback
    // The wrapper function should do some stuff, and return a
    // presumably different callback function.
    // This makes sure that own properties are retained, so that
    // decorations and such are not lost along the way.
    module.exports = wrappy
    function wrappy (fn, cb) {
      if (fn && cb) return wrappy(fn)(cb)
    
      if (typeof fn !== 'function')
        throw new TypeError('need wrapper function')
    
      Object.keys(fn).forEach(function (k) {
        wrapper[k] = fn[k]
      })
    
      return wrapper
    
      function wrapper() {
        var args = new Array(arguments.length)
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i]
        }
        var ret = fn.apply(this, args)
        var cb = args[args.length-1]
        if (typeof ret === 'function' && ret !== cb) {
          Object.keys(cb).forEach(function (k) {
            ret[k] = cb[k]
          })
        }
        return ret
      }
    }
    
  provide("wrappy", module.exports);
}(global));

// pakmanager:balanced-match
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = balanced;
    function balanced(a, b, str) {
      if (a instanceof RegExp) a = maybeMatch(a, str);
      if (b instanceof RegExp) b = maybeMatch(b, str);
    
      var r = range(a, b, str);
    
      return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + a.length, r[1]),
        post: str.slice(r[1] + b.length)
      };
    }
    
    function maybeMatch(reg, str) {
      var m = str.match(reg);
      return m ? m[0] : null;
    }
    
    balanced.range = range;
    function range(a, b, str) {
      var begs, beg, left, right, result;
      var ai = str.indexOf(a);
      var bi = str.indexOf(b, ai + 1);
      var i = ai;
    
      if (ai >= 0 && bi > 0) {
        begs = [];
        left = str.length;
    
        while (i >= 0 && !result) {
          if (i == ai) {
            begs.push(i);
            ai = str.indexOf(a, i + 1);
          } else if (begs.length == 1) {
            result = [ begs.pop(), bi ];
          } else {
            beg = begs.pop();
            if (beg < left) {
              left = beg;
              right = bi;
            }
    
            bi = str.indexOf(b, i + 1);
          }
    
          i = ai < bi && ai >= 0 ? ai : bi;
        }
    
        if (begs.length) {
          result = [ left, right ];
        }
      }
    
      return result;
    }
    
  provide("balanced-match", module.exports);
}(global));

// pakmanager:concat-map
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = function (xs, fn) {
        var res = [];
        for (var i = 0; i < xs.length; i++) {
            var x = fn(xs[i], i);
            if (isArray(x)) res.push.apply(res, x);
            else res.push(x);
        }
        return res;
    };
    
    var isArray = Array.isArray || function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
    };
    
  provide("concat-map", module.exports);
}(global));

// pakmanager:once
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var wrappy = require('wrappy')
    module.exports = wrappy(once)
    module.exports.strict = wrappy(onceStrict)
    
    once.proto = once(function () {
      Object.defineProperty(Function.prototype, 'once', {
        value: function () {
          return once(this)
        },
        configurable: true
      })
    
      Object.defineProperty(Function.prototype, 'onceStrict', {
        value: function () {
          return onceStrict(this)
        },
        configurable: true
      })
    })
    
    function once (fn) {
      var f = function () {
        if (f.called) return f.value
        f.called = true
        return f.value = fn.apply(this, arguments)
      }
      f.called = false
      return f
    }
    
    function onceStrict (fn) {
      var f = function () {
        if (f.called)
          throw new Error(f.onceError)
        f.called = true
        return f.value = fn.apply(this, arguments)
      }
      var name = fn.name || 'Function wrapped with `once`'
      f.onceError = name + " shouldn't be called more than once"
      f.called = false
      return f
    }
    
  provide("once", module.exports);
}(global));

// pakmanager:brace-expansion
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var concatMap = require('concat-map');
    var balanced = require('balanced-match');
    
    module.exports = expandTop;
    
    var escSlash = '\0SLASH'+Math.random()+'\0';
    var escOpen = '\0OPEN'+Math.random()+'\0';
    var escClose = '\0CLOSE'+Math.random()+'\0';
    var escComma = '\0COMMA'+Math.random()+'\0';
    var escPeriod = '\0PERIOD'+Math.random()+'\0';
    
    function numeric(str) {
      return parseInt(str, 10) == str
        ? parseInt(str, 10)
        : str.charCodeAt(0);
    }
    
    function escapeBraces(str) {
      return str.split('\\\\').join(escSlash)
                .split('\\{').join(escOpen)
                .split('\\}').join(escClose)
                .split('\\,').join(escComma)
                .split('\\.').join(escPeriod);
    }
    
    function unescapeBraces(str) {
      return str.split(escSlash).join('\\')
                .split(escOpen).join('{')
                .split(escClose).join('}')
                .split(escComma).join(',')
                .split(escPeriod).join('.');
    }
    
    
    // Basically just str.split(","), but handling cases
    // where we have nested braced sections, which should be
    // treated as individual members, like {a,{b,c},d}
    function parseCommaParts(str) {
      if (!str)
        return [''];
    
      var parts = [];
      var m = balanced('{', '}', str);
    
      if (!m)
        return str.split(',');
    
      var pre = m.pre;
      var body = m.body;
      var post = m.post;
      var p = pre.split(',');
    
      p[p.length-1] += '{' + body + '}';
      var postParts = parseCommaParts(post);
      if (post.length) {
        p[p.length-1] += postParts.shift();
        p.push.apply(p, postParts);
      }
    
      parts.push.apply(parts, p);
    
      return parts;
    }
    
    function expandTop(str) {
      if (!str)
        return [];
    
      // I don't know why Bash 4.3 does this, but it does.
      // Anything starting with {} will have the first two bytes preserved
      // but *only* at the top level, so {},a}b will not expand to anything,
      // but a{},b}c will be expanded to [a}c,abc].
      // One could argue that this is a bug in Bash, but since the goal of
      // this module is to match Bash's rules, we escape a leading {}
      if (str.substr(0, 2) === '{}') {
        str = '\\{\\}' + str.substr(2);
      }
    
      return expand(escapeBraces(str), true).map(unescapeBraces);
    }
    
    function identity(e) {
      return e;
    }
    
    function embrace(str) {
      return '{' + str + '}';
    }
    function isPadded(el) {
      return /^-?0\d/.test(el);
    }
    
    function lte(i, y) {
      return i <= y;
    }
    function gte(i, y) {
      return i >= y;
    }
    
    function expand(str, isTop) {
      var expansions = [];
    
      var m = balanced('{', '}', str);
      if (!m || /\$$/.test(m.pre)) return [str];
    
      var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
      var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
      var isSequence = isNumericSequence || isAlphaSequence;
      var isOptions = /^(.*,)+(.+)?$/.test(m.body);
      if (!isSequence && !isOptions) {
        // {a},b}
        if (m.post.match(/,.*\}/)) {
          str = m.pre + '{' + m.body + escClose + m.post;
          return expand(str);
        }
        return [str];
      }
    
      var n;
      if (isSequence) {
        n = m.body.split(/\.\./);
      } else {
        n = parseCommaParts(m.body);
        if (n.length === 1) {
          // x{{a,b}}y ==> x{a}y x{b}y
          n = expand(n[0], false).map(embrace);
          if (n.length === 1) {
            var post = m.post.length
              ? expand(m.post, false)
              : [''];
            return post.map(function(p) {
              return m.pre + n[0] + p;
            });
          }
        }
      }
    
      // at this point, n is the parts, and we know it's not a comma set
      // with a single entry.
    
      // no need to expand pre, since it is guaranteed to be free of brace-sets
      var pre = m.pre;
      var post = m.post.length
        ? expand(m.post, false)
        : [''];
    
      var N;
    
      if (isSequence) {
        var x = numeric(n[0]);
        var y = numeric(n[1]);
        var width = Math.max(n[0].length, n[1].length)
        var incr = n.length == 3
          ? Math.abs(numeric(n[2]))
          : 1;
        var test = lte;
        var reverse = y < x;
        if (reverse) {
          incr *= -1;
          test = gte;
        }
        var pad = n.some(isPadded);
    
        N = [];
    
        for (var i = x; test(i, y); i += incr) {
          var c;
          if (isAlphaSequence) {
            c = String.fromCharCode(i);
            if (c === '\\')
              c = '';
          } else {
            c = String(i);
            if (pad) {
              var need = width - c.length;
              if (need > 0) {
                var z = new Array(need + 1).join('0');
                if (i < 0)
                  c = '-' + z + c.slice(1);
                else
                  c = z + c;
              }
            }
          }
          N.push(c);
        }
      } else {
        N = concatMap(n, function(el) { return expand(el, false) });
      }
    
      for (var j = 0; j < N.length; j++) {
        for (var k = 0; k < post.length; k++) {
          var expansion = pre + N[j] + post[k];
          if (!isTop || isSequence || expansion)
            expansions.push(expansion);
        }
      }
    
      return expansions;
    }
    
    
  provide("brace-expansion", module.exports);
}(global));

// pakmanager:fs.realpath/old.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    
    var pathModule = require('path');
    var isWindows = process.platform === 'win32';
    var fs = require('fs');
    
    // JavaScript implementation of realpath, ported from node pre-v6
    
    var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
    
    function rethrow() {
      // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
      // is fairly slow to generate.
      var callback;
      if (DEBUG) {
        var backtrace = new Error;
        callback = debugCallback;
      } else
        callback = missingCallback;
    
      return callback;
    
      function debugCallback(err) {
        if (err) {
          backtrace.message = err.message;
          err = backtrace;
          missingCallback(err);
        }
      }
    
      function missingCallback(err) {
        if (err) {
          if (process.throwDeprecation)
            throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
          else if (!process.noDeprecation) {
            var msg = 'fs: missing callback ' + (err.stack || err.message);
            if (process.traceDeprecation)
              console.trace(msg);
            else
              console.error(msg);
          }
        }
      }
    }
    
    function maybeCallback(cb) {
      return typeof cb === 'function' ? cb : rethrow();
    }
    
    var normalize = pathModule.normalize;
    
    // Regexp that finds the next partion of a (partial) path
    // result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
    if (isWindows) {
      var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
    } else {
      var nextPartRe = /(.*?)(?:[\/]+|$)/g;
    }
    
    // Regex to find the device root, including trailing slash. E.g. 'c:\\'.
    if (isWindows) {
      var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
    } else {
      var splitRootRe = /^[\/]*/;
    }
    
    exports.realpathSync = function realpathSync(p, cache) {
      // make p is absolute
      p = pathModule.resolve(p);
    
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return cache[p];
      }
    
      var original = p,
          seenLinks = {},
          knownHard = {};
    
      // current character position in p
      var pos;
      // the partial path so far, including a trailing slash if any
      var current;
      // the partial path without a trailing slash (except when pointing at a root)
      var base;
      // the partial path scanned in the previous round, with slash
      var previous;
    
      start();
    
      function start() {
        // Skip over roots
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = '';
    
        // On windows, check that the root exists. On unix there is no need.
        if (isWindows && !knownHard[base]) {
          fs.lstatSync(base);
          knownHard[base] = true;
        }
      }
    
      // walk down the path, swapping out linked pathparts for their real
      // values
      // NB: p.length changes.
      while (pos < p.length) {
        // find the next part
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
    
        // continue if not a symlink
        if (knownHard[base] || (cache && cache[base] === base)) {
          continue;
        }
    
        var resolvedLink;
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          // some known symbolic link.  no need to stat again.
          resolvedLink = cache[base];
        } else {
          var stat = fs.lstatSync(base);
          if (!stat.isSymbolicLink()) {
            knownHard[base] = true;
            if (cache) cache[base] = base;
            continue;
          }
    
          // read the link if it wasn't read before
          // dev/ino always return 0 on windows, so skip the check.
          var linkTarget = null;
          if (!isWindows) {
            var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
            if (seenLinks.hasOwnProperty(id)) {
              linkTarget = seenLinks[id];
            }
          }
          if (linkTarget === null) {
            fs.statSync(base);
            linkTarget = fs.readlinkSync(base);
          }
          resolvedLink = pathModule.resolve(previous, linkTarget);
          // track this, if given a cache.
          if (cache) cache[base] = resolvedLink;
          if (!isWindows) seenLinks[id] = linkTarget;
        }
    
        // resolve the link, then start over
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
    
      if (cache) cache[original] = p;
    
      return p;
    };
    
    
    exports.realpath = function realpath(p, cache, cb) {
      if (typeof cb !== 'function') {
        cb = maybeCallback(cache);
        cache = null;
      }
    
      // make p is absolute
      p = pathModule.resolve(p);
    
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return process.nextTick(cb.bind(null, null, cache[p]));
      }
    
      var original = p,
          seenLinks = {},
          knownHard = {};
    
      // current character position in p
      var pos;
      // the partial path so far, including a trailing slash if any
      var current;
      // the partial path without a trailing slash (except when pointing at a root)
      var base;
      // the partial path scanned in the previous round, with slash
      var previous;
    
      start();
    
      function start() {
        // Skip over roots
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = '';
    
        // On windows, check that the root exists. On unix there is no need.
        if (isWindows && !knownHard[base]) {
          fs.lstat(base, function(err) {
            if (err) return cb(err);
            knownHard[base] = true;
            LOOP();
          });
        } else {
          process.nextTick(LOOP);
        }
      }
    
      // walk down the path, swapping out linked pathparts for their real
      // values
      function LOOP() {
        // stop if scanned past end of path
        if (pos >= p.length) {
          if (cache) cache[original] = p;
          return cb(null, p);
        }
    
        // find the next part
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
    
        // continue if not a symlink
        if (knownHard[base] || (cache && cache[base] === base)) {
          return process.nextTick(LOOP);
        }
    
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          // known symbolic link.  no need to stat again.
          return gotResolvedLink(cache[base]);
        }
    
        return fs.lstat(base, gotStat);
      }
    
      function gotStat(err, stat) {
        if (err) return cb(err);
    
        // if not a symlink, skip to the next path part
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache) cache[base] = base;
          return process.nextTick(LOOP);
        }
    
        // stat & read the link if not read before
        // call gotTarget as soon as the link target is known
        // dev/ino always return 0 on windows, so skip the check.
        if (!isWindows) {
          var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            return gotTarget(null, seenLinks[id], base);
          }
        }
        fs.stat(base, function(err) {
          if (err) return cb(err);
    
          fs.readlink(base, function(err, target) {
            if (!isWindows) seenLinks[id] = target;
            gotTarget(err, target);
          });
        });
      }
    
      function gotTarget(err, target, base) {
        if (err) return cb(err);
    
        var resolvedLink = pathModule.resolve(previous, target);
        if (cache) cache[base] = resolvedLink;
        gotResolvedLink(resolvedLink);
      }
    
      function gotResolvedLink(resolvedLink) {
        // resolve the link, then start over
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
    };
    
  provide("fs.realpath/old.js", module.exports);
}(global));

// pakmanager:fs.realpath
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = realpath
    realpath.realpath = realpath
    realpath.sync = realpathSync
    realpath.realpathSync = realpathSync
    realpath.monkeypatch = monkeypatch
    realpath.unmonkeypatch = unmonkeypatch
    
    var fs = require('fs')
    var origRealpath = fs.realpath
    var origRealpathSync = fs.realpathSync
    
    var version = process.version
    var ok = /^v[0-5]\./.test(version)
    var old =  require('fs.realpath/old.js')
    
    function newError (er) {
      return er && er.syscall === 'realpath' && (
        er.code === 'ELOOP' ||
        er.code === 'ENOMEM' ||
        er.code === 'ENAMETOOLONG'
      )
    }
    
    function realpath (p, cache, cb) {
      if (ok) {
        return origRealpath(p, cache, cb)
      }
    
      if (typeof cache === 'function') {
        cb = cache
        cache = null
      }
      origRealpath(p, cache, function (er, result) {
        if (newError(er)) {
          old.realpath(p, cache, cb)
        } else {
          cb(er, result)
        }
      })
    }
    
    function realpathSync (p, cache) {
      if (ok) {
        return origRealpathSync(p, cache)
      }
    
      try {
        return origRealpathSync(p, cache)
      } catch (er) {
        if (newError(er)) {
          return old.realpathSync(p, cache)
        } else {
          throw er
        }
      }
    }
    
    function monkeypatch () {
      fs.realpath = realpath
      fs.realpathSync = realpathSync
    }
    
    function unmonkeypatch () {
      fs.realpath = origRealpath
      fs.realpathSync = origRealpathSync
    }
    
  provide("fs.realpath", module.exports);
}(global));

// pakmanager:inflight
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var wrappy = require('wrappy')
    var reqs = Object.create(null)
    var once = require('once')
    
    module.exports = wrappy(inflight)
    
    function inflight (key, cb) {
      if (reqs[key]) {
        reqs[key].push(cb)
        return null
      } else {
        reqs[key] = [cb]
        return makeres(key)
      }
    }
    
    function makeres (key) {
      return once(function RES () {
        var cbs = reqs[key]
        var len = cbs.length
        var args = slice(arguments)
        for (var i = 0; i < len; i++) {
          cbs[i].apply(null, args)
        }
        if (cbs.length > len) {
          // added more in the interim.
          // de-zalgo, just in case, but don't call again.
          cbs.splice(0, len)
          process.nextTick(function () {
            RES.apply(null, args)
          })
        } else {
          delete reqs[key]
        }
      })
    }
    
    function slice (args) {
      var length = args.length
      var array = []
    
      for (var i = 0; i < length; i++) array[i] = args[i]
      return array
    }
    
  provide("inflight", module.exports);
}(global));

// pakmanager:inherits/inherits_browser.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  if (typeof Object.create === 'function') {
      // implementation from standard node.js 'util' module
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      };
    } else {
      // old school shim for old browsers
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function () {}
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
    }
    
  provide("inherits/inherits_browser.js", module.exports);
}(global));

// pakmanager:inherits
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  try {
      var util = require('util');
      if (typeof util.inherits !== 'function') throw '';
      module.exports = util.inherits;
    } catch (e) {
      module.exports =  require('inherits/inherits_browser.js');
    }
    
  provide("inherits", module.exports);
}(global));

// pakmanager:minimatch
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = minimatch
    minimatch.Minimatch = Minimatch
    
    var path = { sep: '/' }
    try {
      path = require('path')
    } catch (er) {}
    
    var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
    var expand = require('brace-expansion')
    
    var plTypes = {
      '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
      '?': { open: '(?:', close: ')?' },
      '+': { open: '(?:', close: ')+' },
      '*': { open: '(?:', close: ')*' },
      '@': { open: '(?:', close: ')' }
    }
    
    // any single thing other than /
    // don't need to escape / when using new RegExp()
    var qmark = '[^/]'
    
    // * => any number of characters
    var star = qmark + '*?'
    
    // ** when dots are allowed.  Anything goes, except .. and .
    // not (^ or / followed by one or two dots followed by $ or /),
    // followed by anything, any number of times.
    var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'
    
    // not a ^ or / followed by a dot,
    // followed by anything, any number of times.
    var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'
    
    // characters that need to be escaped in RegExp.
    var reSpecials = charSet('().*{}+?[]^$\\!')
    
    // "abc" -> { a:true, b:true, c:true }
    function charSet (s) {
      return s.split('').reduce(function (set, c) {
        set[c] = true
        return set
      }, {})
    }
    
    // normalizes slashes.
    var slashSplit = /\/+/
    
    minimatch.filter = filter
    function filter (pattern, options) {
      options = options || {}
      return function (p, i, list) {
        return minimatch(p, pattern, options)
      }
    }
    
    function ext (a, b) {
      a = a || {}
      b = b || {}
      var t = {}
      Object.keys(b).forEach(function (k) {
        t[k] = b[k]
      })
      Object.keys(a).forEach(function (k) {
        t[k] = a[k]
      })
      return t
    }
    
    minimatch.defaults = function (def) {
      if (!def || !Object.keys(def).length) return minimatch
    
      var orig = minimatch
    
      var m = function minimatch (p, pattern, options) {
        return orig.minimatch(p, pattern, ext(def, options))
      }
    
      m.Minimatch = function Minimatch (pattern, options) {
        return new orig.Minimatch(pattern, ext(def, options))
      }
    
      return m
    }
    
    Minimatch.defaults = function (def) {
      if (!def || !Object.keys(def).length) return Minimatch
      return minimatch.defaults(def).Minimatch
    }
    
    function minimatch (p, pattern, options) {
      if (typeof pattern !== 'string') {
        throw new TypeError('glob pattern string required')
      }
    
      if (!options) options = {}
    
      // shortcut: comments match nothing.
      if (!options.nocomment && pattern.charAt(0) === '#') {
        return false
      }
    
      // "" only matches ""
      if (pattern.trim() === '') return p === ''
    
      return new Minimatch(pattern, options).match(p)
    }
    
    function Minimatch (pattern, options) {
      if (!(this instanceof Minimatch)) {
        return new Minimatch(pattern, options)
      }
    
      if (typeof pattern !== 'string') {
        throw new TypeError('glob pattern string required')
      }
    
      if (!options) options = {}
      pattern = pattern.trim()
    
      // windows support: need to use /, not \
      if (path.sep !== '/') {
        pattern = pattern.split(path.sep).join('/')
      }
    
      this.options = options
      this.set = []
      this.pattern = pattern
      this.regexp = null
      this.negate = false
      this.comment = false
      this.empty = false
    
      // make the set of regexps etc.
      this.make()
    }
    
    Minimatch.prototype.debug = function () {}
    
    Minimatch.prototype.make = make
    function make () {
      // don't do it more than once.
      if (this._made) return
    
      var pattern = this.pattern
      var options = this.options
    
      // empty patterns and comments match nothing.
      if (!options.nocomment && pattern.charAt(0) === '#') {
        this.comment = true
        return
      }
      if (!pattern) {
        this.empty = true
        return
      }
    
      // step 1: figure out negation, etc.
      this.parseNegate()
    
      // step 2: expand braces
      var set = this.globSet = this.braceExpand()
    
      if (options.debug) this.debug = console.error
    
      this.debug(this.pattern, set)
    
      // step 3: now we have a set, so turn each one into a series of path-portion
      // matching patterns.
      // These will be regexps, except in the case of "**", which is
      // set to the GLOBSTAR object for globstar behavior,
      // and will not contain any / characters
      set = this.globParts = set.map(function (s) {
        return s.split(slashSplit)
      })
    
      this.debug(this.pattern, set)
    
      // glob --> regexps
      set = set.map(function (s, si, set) {
        return s.map(this.parse, this)
      }, this)
    
      this.debug(this.pattern, set)
    
      // filter out everything that didn't compile properly.
      set = set.filter(function (s) {
        return s.indexOf(false) === -1
      })
    
      this.debug(this.pattern, set)
    
      this.set = set
    }
    
    Minimatch.prototype.parseNegate = parseNegate
    function parseNegate () {
      var pattern = this.pattern
      var negate = false
      var options = this.options
      var negateOffset = 0
    
      if (options.nonegate) return
    
      for (var i = 0, l = pattern.length
        ; i < l && pattern.charAt(i) === '!'
        ; i++) {
        negate = !negate
        negateOffset++
      }
    
      if (negateOffset) this.pattern = pattern.substr(negateOffset)
      this.negate = negate
    }
    
    // Brace expansion:
    // a{b,c}d -> abd acd
    // a{b,}c -> abc ac
    // a{0..3}d -> a0d a1d a2d a3d
    // a{b,c{d,e}f}g -> abg acdfg acefg
    // a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
    //
    // Invalid sets are not expanded.
    // a{2..}b -> a{2..}b
    // a{b}c -> a{b}c
    minimatch.braceExpand = function (pattern, options) {
      return braceExpand(pattern, options)
    }
    
    Minimatch.prototype.braceExpand = braceExpand
    
    function braceExpand (pattern, options) {
      if (!options) {
        if (this instanceof Minimatch) {
          options = this.options
        } else {
          options = {}
        }
      }
    
      pattern = typeof pattern === 'undefined'
        ? this.pattern : pattern
    
      if (typeof pattern === 'undefined') {
        throw new TypeError('undefined pattern')
      }
    
      if (options.nobrace ||
        !pattern.match(/\{.*\}/)) {
        // shortcut. no need to expand.
        return [pattern]
      }
    
      return expand(pattern)
    }
    
    // parse a component of the expanded set.
    // At this point, no pattern may contain "/" in it
    // so we're going to return a 2d array, where each entry is the full
    // pattern, split on '/', and then turned into a regular expression.
    // A regexp is made at the end which joins each array with an
    // escaped /, and another full one which joins each regexp with |.
    //
    // Following the lead of Bash 4.1, note that "**" only has special meaning
    // when it is the *only* thing in a path portion.  Otherwise, any series
    // of * is equivalent to a single *.  Globstar behavior is enabled by
    // default, and can be disabled by setting options.noglobstar.
    Minimatch.prototype.parse = parse
    var SUBPARSE = {}
    function parse (pattern, isSub) {
      if (pattern.length > 1024 * 64) {
        throw new TypeError('pattern is too long')
      }
    
      var options = this.options
    
      // shortcuts
      if (!options.noglobstar && pattern === '**') return GLOBSTAR
      if (pattern === '') return ''
    
      var re = ''
      var hasMagic = !!options.nocase
      var escaping = false
      // ? => one single character
      var patternListStack = []
      var negativeLists = []
      var stateChar
      var inClass = false
      var reClassStart = -1
      var classStart = -1
      // . and .. never match anything that doesn't start with .,
      // even when options.dot is set.
      var patternStart = pattern.charAt(0) === '.' ? '' // anything
      // not (start or / followed by . or .. followed by / or end)
      : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
      : '(?!\\.)'
      var self = this
    
      function clearStateChar () {
        if (stateChar) {
          // we had some state-tracking character
          // that wasn't consumed by this pass.
          switch (stateChar) {
            case '*':
              re += star
              hasMagic = true
            break
            case '?':
              re += qmark
              hasMagic = true
            break
            default:
              re += '\\' + stateChar
            break
          }
          self.debug('clearStateChar %j %j', stateChar, re)
          stateChar = false
        }
      }
    
      for (var i = 0, len = pattern.length, c
        ; (i < len) && (c = pattern.charAt(i))
        ; i++) {
        this.debug('%s\t%s %s %j', pattern, i, re, c)
    
        // skip over any that are escaped.
        if (escaping && reSpecials[c]) {
          re += '\\' + c
          escaping = false
          continue
        }
    
        switch (c) {
          case '/':
            // completely not allowed, even escaped.
            // Should already be path-split by now.
            return false
    
          case '\\':
            clearStateChar()
            escaping = true
          continue
    
          // the various stateChar values
          // for the "extglob" stuff.
          case '?':
          case '*':
          case '+':
          case '@':
          case '!':
            this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)
    
            // all of those are literals inside a class, except that
            // the glob [!a] means [^a] in regexp
            if (inClass) {
              this.debug('  in class')
              if (c === '!' && i === classStart + 1) c = '^'
              re += c
              continue
            }
    
            // if we already have a stateChar, then it means
            // that there was something like ** or +? in there.
            // Handle the stateChar, then proceed with this one.
            self.debug('call clearStateChar %j', stateChar)
            clearStateChar()
            stateChar = c
            // if extglob is disabled, then +(asdf|foo) isn't a thing.
            // just clear the statechar *now*, rather than even diving into
            // the patternList stuff.
            if (options.noext) clearStateChar()
          continue
    
          case '(':
            if (inClass) {
              re += '('
              continue
            }
    
            if (!stateChar) {
              re += '\\('
              continue
            }
    
            patternListStack.push({
              type: stateChar,
              start: i - 1,
              reStart: re.length,
              open: plTypes[stateChar].open,
              close: plTypes[stateChar].close
            })
            // negation is (?:(?!js)[^/]*)
            re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
            this.debug('plType %j %j', stateChar, re)
            stateChar = false
          continue
    
          case ')':
            if (inClass || !patternListStack.length) {
              re += '\\)'
              continue
            }
    
            clearStateChar()
            hasMagic = true
            var pl = patternListStack.pop()
            // negation is (?:(?!js)[^/]*)
            // The others are (?:<pattern>)<type>
            re += pl.close
            if (pl.type === '!') {
              negativeLists.push(pl)
            }
            pl.reEnd = re.length
          continue
    
          case '|':
            if (inClass || !patternListStack.length || escaping) {
              re += '\\|'
              escaping = false
              continue
            }
    
            clearStateChar()
            re += '|'
          continue
    
          // these are mostly the same in regexp and glob
          case '[':
            // swallow any state-tracking char before the [
            clearStateChar()
    
            if (inClass) {
              re += '\\' + c
              continue
            }
    
            inClass = true
            classStart = i
            reClassStart = re.length
            re += c
          continue
    
          case ']':
            //  a right bracket shall lose its special
            //  meaning and represent itself in
            //  a bracket expression if it occurs
            //  first in the list.  -- POSIX.2 2.8.3.2
            if (i === classStart + 1 || !inClass) {
              re += '\\' + c
              escaping = false
              continue
            }
    
            // handle the case where we left a class open.
            // "[z-a]" is valid, equivalent to "\[z-a\]"
            if (inClass) {
              // split where the last [ was, make sure we don't have
              // an invalid re. if so, re-walk the contents of the
              // would-be class to re-translate any characters that
              // were passed through as-is
              // TODO: It would probably be faster to determine this
              // without a try/catch and a new RegExp, but it's tricky
              // to do safely.  For now, this is safe and works.
              var cs = pattern.substring(classStart + 1, i)
              try {
                RegExp('[' + cs + ']')
              } catch (er) {
                // not a valid class!
                var sp = this.parse(cs, SUBPARSE)
                re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
                hasMagic = hasMagic || sp[1]
                inClass = false
                continue
              }
            }
    
            // finish up the class.
            hasMagic = true
            inClass = false
            re += c
          continue
    
          default:
            // swallow any state char that wasn't consumed
            clearStateChar()
    
            if (escaping) {
              // no need
              escaping = false
            } else if (reSpecials[c]
              && !(c === '^' && inClass)) {
              re += '\\'
            }
    
            re += c
    
        } // switch
      } // for
    
      // handle the case where we left a class open.
      // "[abc" is valid, equivalent to "\[abc"
      if (inClass) {
        // split where the last [ was, and escape it
        // this is a huge pita.  We now have to re-walk
        // the contents of the would-be class to re-translate
        // any characters that were passed through as-is
        cs = pattern.substr(classStart + 1)
        sp = this.parse(cs, SUBPARSE)
        re = re.substr(0, reClassStart) + '\\[' + sp[0]
        hasMagic = hasMagic || sp[1]
      }
    
      // handle the case where we had a +( thing at the *end*
      // of the pattern.
      // each pattern list stack adds 3 chars, and we need to go through
      // and escape any | chars that were passed through as-is for the regexp.
      // Go through and escape them, taking care not to double-escape any
      // | chars that were already escaped.
      for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
        var tail = re.slice(pl.reStart + pl.open.length)
        this.debug('setting tail', re, pl)
        // maybe some even number of \, then maybe 1 \, followed by a |
        tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
          if (!$2) {
            // the | isn't already escaped, so escape it.
            $2 = '\\'
          }
    
          // need to escape all those slashes *again*, without escaping the
          // one that we need for escaping the | character.  As it works out,
          // escaping an even number of slashes can be done by simply repeating
          // it exactly after itself.  That's why this trick works.
          //
          // I am sorry that you have to see this.
          return $1 + $1 + $2 + '|'
        })
    
        this.debug('tail=%j\n   %s', tail, tail, pl, re)
        var t = pl.type === '*' ? star
          : pl.type === '?' ? qmark
          : '\\' + pl.type
    
        hasMagic = true
        re = re.slice(0, pl.reStart) + t + '\\(' + tail
      }
    
      // handle trailing things that only matter at the very end.
      clearStateChar()
      if (escaping) {
        // trailing \\
        re += '\\\\'
      }
    
      // only need to apply the nodot start if the re starts with
      // something that could conceivably capture a dot
      var addPatternStart = false
      switch (re.charAt(0)) {
        case '.':
        case '[':
        case '(': addPatternStart = true
      }
    
      // Hack to work around lack of negative lookbehind in JS
      // A pattern like: *.!(x).!(y|z) needs to ensure that a name
      // like 'a.xyz.yz' doesn't match.  So, the first negative
      // lookahead, has to look ALL the way ahead, to the end of
      // the pattern.
      for (var n = negativeLists.length - 1; n > -1; n--) {
        var nl = negativeLists[n]
    
        var nlBefore = re.slice(0, nl.reStart)
        var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
        var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
        var nlAfter = re.slice(nl.reEnd)
    
        nlLast += nlAfter
    
        // Handle nested stuff like *(*.js|!(*.json)), where open parens
        // mean that we should *not* include the ) in the bit that is considered
        // "after" the negated section.
        var openParensBefore = nlBefore.split('(').length - 1
        var cleanAfter = nlAfter
        for (i = 0; i < openParensBefore; i++) {
          cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
        }
        nlAfter = cleanAfter
    
        var dollar = ''
        if (nlAfter === '' && isSub !== SUBPARSE) {
          dollar = '$'
        }
        var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
        re = newRe
      }
    
      // if the re is not "" at this point, then we need to make sure
      // it doesn't match against an empty path part.
      // Otherwise a/* will match a/, which it should not.
      if (re !== '' && hasMagic) {
        re = '(?=.)' + re
      }
    
      if (addPatternStart) {
        re = patternStart + re
      }
    
      // parsing just a piece of a larger pattern.
      if (isSub === SUBPARSE) {
        return [re, hasMagic]
      }
    
      // skip the regexp for non-magical patterns
      // unescape anything in it, though, so that it'll be
      // an exact match against a file etc.
      if (!hasMagic) {
        return globUnescape(pattern)
      }
    
      var flags = options.nocase ? 'i' : ''
      try {
        var regExp = new RegExp('^' + re + '$', flags)
      } catch (er) {
        // If it was an invalid regular expression, then it can't match
        // anything.  This trick looks for a character after the end of
        // the string, which is of course impossible, except in multi-line
        // mode, but it's not a /m regex.
        return new RegExp('$.')
      }
    
      regExp._glob = pattern
      regExp._src = re
    
      return regExp
    }
    
    minimatch.makeRe = function (pattern, options) {
      return new Minimatch(pattern, options || {}).makeRe()
    }
    
    Minimatch.prototype.makeRe = makeRe
    function makeRe () {
      if (this.regexp || this.regexp === false) return this.regexp
    
      // at this point, this.set is a 2d array of partial
      // pattern strings, or "**".
      //
      // It's better to use .match().  This function shouldn't
      // be used, really, but it's pretty convenient sometimes,
      // when you just want to work with a regex.
      var set = this.set
    
      if (!set.length) {
        this.regexp = false
        return this.regexp
      }
      var options = this.options
    
      var twoStar = options.noglobstar ? star
        : options.dot ? twoStarDot
        : twoStarNoDot
      var flags = options.nocase ? 'i' : ''
    
      var re = set.map(function (pattern) {
        return pattern.map(function (p) {
          return (p === GLOBSTAR) ? twoStar
          : (typeof p === 'string') ? regExpEscape(p)
          : p._src
        }).join('\\\/')
      }).join('|')
    
      // must match entire pattern
      // ending in a * or ** will make it less strict.
      re = '^(?:' + re + ')$'
    
      // can match anything, as long as it's not this.
      if (this.negate) re = '^(?!' + re + ').*$'
    
      try {
        this.regexp = new RegExp(re, flags)
      } catch (ex) {
        this.regexp = false
      }
      return this.regexp
    }
    
    minimatch.match = function (list, pattern, options) {
      options = options || {}
      var mm = new Minimatch(pattern, options)
      list = list.filter(function (f) {
        return mm.match(f)
      })
      if (mm.options.nonull && !list.length) {
        list.push(pattern)
      }
      return list
    }
    
    Minimatch.prototype.match = match
    function match (f, partial) {
      this.debug('match', f, this.pattern)
      // short-circuit in the case of busted things.
      // comments, etc.
      if (this.comment) return false
      if (this.empty) return f === ''
    
      if (f === '/' && partial) return true
    
      var options = this.options
    
      // windows: need to use /, not \
      if (path.sep !== '/') {
        f = f.split(path.sep).join('/')
      }
    
      // treat the test path as a set of pathparts.
      f = f.split(slashSplit)
      this.debug(this.pattern, 'split', f)
    
      // just ONE of the pattern sets in this.set needs to match
      // in order for it to be valid.  If negating, then just one
      // match means that we have failed.
      // Either way, return on the first hit.
    
      var set = this.set
      this.debug(this.pattern, 'set', set)
    
      // Find the basename of the path by looking for the last non-empty segment
      var filename
      var i
      for (i = f.length - 1; i >= 0; i--) {
        filename = f[i]
        if (filename) break
      }
    
      for (i = 0; i < set.length; i++) {
        var pattern = set[i]
        var file = f
        if (options.matchBase && pattern.length === 1) {
          file = [filename]
        }
        var hit = this.matchOne(file, pattern, partial)
        if (hit) {
          if (options.flipNegate) return true
          return !this.negate
        }
      }
    
      // didn't get any hits.  this is success if it's a negative
      // pattern, failure otherwise.
      if (options.flipNegate) return false
      return this.negate
    }
    
    // set partial to true to test if, for example,
    // "/a/b" matches the start of "/*/b/*/d"
    // Partial means, if you run out of file before you run
    // out of pattern, then that's fine, as long as all
    // the parts match.
    Minimatch.prototype.matchOne = function (file, pattern, partial) {
      var options = this.options
    
      this.debug('matchOne',
        { 'this': this, file: file, pattern: pattern })
    
      this.debug('matchOne', file.length, pattern.length)
    
      for (var fi = 0,
          pi = 0,
          fl = file.length,
          pl = pattern.length
          ; (fi < fl) && (pi < pl)
          ; fi++, pi++) {
        this.debug('matchOne loop')
        var p = pattern[pi]
        var f = file[fi]
    
        this.debug(pattern, p, f)
    
        // should be impossible.
        // some invalid regexp stuff in the set.
        if (p === false) return false
    
        if (p === GLOBSTAR) {
          this.debug('GLOBSTAR', [pattern, p, f])
    
          // "**"
          // a/**/b/**/c would match the following:
          // a/b/x/y/z/c
          // a/x/y/z/b/c
          // a/b/x/b/x/c
          // a/b/c
          // To do this, take the rest of the pattern after
          // the **, and see if it would match the file remainder.
          // If so, return success.
          // If not, the ** "swallows" a segment, and try again.
          // This is recursively awful.
          //
          // a/**/b/**/c matching a/b/x/y/z/c
          // - a matches a
          // - doublestar
          //   - matchOne(b/x/y/z/c, b/**/c)
          //     - b matches b
          //     - doublestar
          //       - matchOne(x/y/z/c, c) -> no
          //       - matchOne(y/z/c, c) -> no
          //       - matchOne(z/c, c) -> no
          //       - matchOne(c, c) yes, hit
          var fr = fi
          var pr = pi + 1
          if (pr === pl) {
            this.debug('** at the end')
            // a ** at the end will just swallow the rest.
            // We have found a match.
            // however, it will not swallow /.x, unless
            // options.dot is set.
            // . and .. are *never* matched by **, for explosively
            // exponential reasons.
            for (; fi < fl; fi++) {
              if (file[fi] === '.' || file[fi] === '..' ||
                (!options.dot && file[fi].charAt(0) === '.')) return false
            }
            return true
          }
    
          // ok, let's see if we can swallow whatever we can.
          while (fr < fl) {
            var swallowee = file[fr]
    
            this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)
    
            // XXX remove this slice.  Just pass the start index.
            if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
              this.debug('globstar found match!', fr, fl, swallowee)
              // found a match.
              return true
            } else {
              // can't swallow "." or ".." ever.
              // can only swallow ".foo" when explicitly asked.
              if (swallowee === '.' || swallowee === '..' ||
                (!options.dot && swallowee.charAt(0) === '.')) {
                this.debug('dot detected!', file, fr, pattern, pr)
                break
              }
    
              // ** swallows a segment, and continue.
              this.debug('globstar swallow a segment, and continue')
              fr++
            }
          }
    
          // no match was found.
          // However, in partial mode, we can't say this is necessarily over.
          // If there's more *pattern* left, then
          if (partial) {
            // ran out of file
            this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
            if (fr === fl) return true
          }
          return false
        }
    
        // something other than **
        // non-magic patterns just have to match exactly
        // patterns with magic have been turned into regexps.
        var hit
        if (typeof p === 'string') {
          if (options.nocase) {
            hit = f.toLowerCase() === p.toLowerCase()
          } else {
            hit = f === p
          }
          this.debug('string match', p, f, hit)
        } else {
          hit = f.match(p)
          this.debug('pattern match', p, f, hit)
        }
    
        if (!hit) return false
      }
    
      // Note: ending in / means that we'll get a final ""
      // at the end of the pattern.  This can only match a
      // corresponding "" at the end of the file.
      // If the file ends in /, then it can only match a
      // a pattern that ends in /, unless the pattern just
      // doesn't have any more for it. But, a/b/ should *not*
      // match "a/b/*", even though "" matches against the
      // [^/]*? pattern, except in partial mode, where it might
      // simply not be reached yet.
      // However, a/b/ should still satisfy a/*
    
      // now either we fell off the end of the pattern, or we're done.
      if (fi === fl && pi === pl) {
        // ran out of pattern and filename at the same time.
        // an exact hit!
        return true
      } else if (fi === fl) {
        // ran out of file, but still had pattern left.
        // this is ok if we're doing the match as part of
        // a glob fs traversal.
        return partial
      } else if (pi === pl) {
        // ran out of pattern, still have file left.
        // this is only acceptable if we're on the very last
        // empty segment of a file with a trailing slash.
        // a/* should match a/b/
        var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
        return emptyFileEnd
      }
    
      // should be unreachable.
      throw new Error('wtf?')
    }
    
    // replace stuff like \* with *
    function globUnescape (s) {
      return s.replace(/\\(.)/g, '$1')
    }
    
    function regExpEscape (s) {
      return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    }
    
  provide("minimatch", module.exports);
}(global));

// pakmanager:path-is-absolute
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  'use strict';
    
    function posix(path) {
    	return path.charAt(0) === '/';
    }
    
    function win32(path) {
    	// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
    	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    	var result = splitDeviceRe.exec(path);
    	var device = result[1] || '';
    	var isUnc = Boolean(device && device.charAt(1) !== ':');
    
    	// UNC paths are always absolute
    	return Boolean(result[2] || isUnc);
    }
    
    module.exports = process.platform === 'win32' ? win32 : posix;
    module.exports.posix = posix;
    module.exports.win32 = win32;
    
  provide("path-is-absolute", module.exports);
}(global));

// pakmanager:any-promise/loader
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  "use strict"
        // global key for user preferred registration
    var REGISTRATION_KEY = '@@any-promise/REGISTRATION',
        // Prior registration (preferred or detected)
        registered = null
    
    /**
     * Registers the given implementation.  An implementation must
     * be registered prior to any call to ` require('any-promise')`,
     * typically on application load.
     *
     * If called with no arguments, will return registration in
     * following priority:
     *
     * For Node.js:
     *
     * 1. Previous registration
     * 2. global.Promise if node.js version >= 0.12
     * 3. Auto detected promise based on first sucessful require of
     *    known promise libraries. Note this is a last resort, as the
     *    loaded library is non-deterministic. node.js >= 0.12 will
     *    always use global.Promise over this priority list.
     * 4. Throws error.
     *
     * For Browser:
     *
     * 1. Previous registration
     * 2. window.Promise
     * 3. Throws error.
     *
     * Options:
     *
     * Promise: Desired Promise constructor
     * global: Boolean - Should the registration be cached in a global variable to
     * allow cross dependency/bundle registration?  (default true)
     */
    module.exports = function(root, loadImplementation){
      return function register(implementation, opts){
        implementation = implementation || null
        opts = opts || {}
        // global registration unless explicitly  {global: false} in options (default true)
        var registerGlobal = opts.global !== false;
    
        // load any previous global registration
        if(registered === null && registerGlobal){
          registered = root[REGISTRATION_KEY] || null
        }
    
        if(registered !== null
            && implementation !== null
            && registered.implementation !== implementation){
          // Throw error if attempting to redefine implementation
          throw new Error('any-promise already defined as "'+registered.implementation+
            '".  You can only register an implementation before the first '+
            ' call to  require('any-promise') and an implementation cannot be changed')
        }
    
        if(registered === null){
          // use provided implementation
          if(implementation !== null && typeof opts.Promise !== 'undefined'){
            registered = {
              Promise: opts.Promise,
              implementation: implementation
            }
          } else {
            // require implementation if implementation is specified but not provided
            registered = loadImplementation(implementation)
          }
    
          if(registerGlobal){
            // register preference globally in case multiple installations
            root[REGISTRATION_KEY] = registered
          }
        }
    
        return registered
      }
    }
    
  provide("any-promise/loader", module.exports);
}(global));

// pakmanager:any-promise/register
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  "use strict"
    module.exports =  require('any-promise/loader')(global, loadImplementation);
    
    /**
     * Node.js version of loadImplementation.
     *
     * Requires the given implementation and returns the registration
     * containing {Promise, implementation}
     *
     * If implementation is undefined or global.Promise, loads it
     * Otherwise uses require
     */
    function loadImplementation(implementation){
      var impl = null
    
      if(shouldPreferGlobalPromise(implementation)){
        // if no implementation or env specified use global.Promise
        impl = {
          Promise: global.Promise,
          implementation: 'global.Promise'
        }
      } else if(implementation){
        // if implementation specified, require it
        var lib = require(implementation)
        impl = {
          Promise: lib.Promise || lib,
          implementation: implementation
        }
      } else {
        // try to auto detect implementation. This is non-deterministic
        // and should prefer other branches, but this is our last chance
        // to load something without throwing error
        impl = tryAutoDetect()
      }
    
      if(impl === null){
        throw new Error('Cannot find any-promise implementation nor'+
          ' global.Promise. You must install polyfill or call'+
          ' require("any-promise/register") with your preferred'+
          ' implementation, e.g. require("any-promise/register/bluebird")'+
          ' on application load prior to any  require('any-promise').')
      }
    
      return impl
    }
    
    /**
     * Determines if the global.Promise should be preferred if an implementation
     * has not been registered.
     */
    function shouldPreferGlobalPromise(implementation){
      if(implementation){
        return implementation === 'global.Promise'
      } else if(typeof global.Promise !== 'undefined'){
        // Load global promise if implementation not specified
        // Versions < 0.11 did not have global Promise
        // Do not use for version < 0.12 as version 0.11 contained buggy versions
        var version = (/v(\d+)\.(\d+)\.(\d+)/).exec(process.version)
        return !(version && +version[1] == 0 && +version[2] < 12)
      }
    
      // do not have global.Promise or another implementation was specified
      return false
    }
    
    /**
     * Look for common libs as last resort there is no guarantee that
     * this will return a desired implementation or even be deterministic.
     * The priority is also nearly arbitrary. We are only doing this
     * for older versions of Node.js <0.12 that do not have a reasonable
     * global.Promise implementation and we the user has not registered
     * the preference. This preserves the behavior of any-promise <= 0.1
     * and may be deprecated or removed in the future
     */
    function tryAutoDetect(){
      var libs = [
          "es6-promise",
          "promise",
          "native-promise-only",
          "bluebird",
          "rsvp",
          "when",
          "q",
          "pinkie",
          "lie",
          "vow"]
      var i = 0, len = libs.length
      for(; i < len; i++){
        try {
          return loadImplementation(libs[i])
        } catch(e){}
      }
      return null
    }
    
  provide("any-promise/register", module.exports);
}(global));

// pakmanager:any-promise
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports =  require('any-promise/register')().Promise
    
  provide("any-promise", module.exports);
}(global));

// pakmanager:graceful-fs/fs.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  'use strict'
    
    var fs = require('fs')
    
    module.exports = clone(fs)
    
    function clone (obj) {
      if (obj === null || typeof obj !== 'object')
        return obj
    
      if (obj instanceof Object)
        var copy = { __proto__: obj.__proto__ }
      else
        var copy = Object.create(null)
    
      Object.getOwnPropertyNames(obj).forEach(function (key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
      })
    
      return copy
    }
    
  provide("graceful-fs/fs.js", module.exports);
}(global));

// pakmanager:graceful-fs/polyfills.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var fs =  require('graceful-fs/fs.js')
    var constants = require('constants')
    
    var origCwd = process.cwd
    var cwd = null
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process)
      return cwd
    }
    try {
      process.cwd()
    } catch (er) {}
    
    var chdir = process.chdir
    process.chdir = function(d) {
      cwd = null
      chdir.call(process, d)
    }
    
    module.exports = patch
    
    function patch (fs) {
      // (re-)implement some things that are known busted or missing.
    
      // lchmod, broken prior to 0.6.2
      // back-port the fix here.
      if (constants.hasOwnProperty('O_SYMLINK') &&
          process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs)
      }
    
      // lutimes implementation, or no-op
      if (!fs.lutimes) {
        patchLutimes(fs)
      }
    
      // https://github.com/isaacs/node-graceful-fs/issues/4
      // Chown should not fail on einval or eperm if non-root.
      // It should not fail on enosys ever, as this just indicates
      // that a fs doesn't support the intended operation.
    
      fs.chown = chownFix(fs.chown)
      fs.fchown = chownFix(fs.fchown)
      fs.lchown = chownFix(fs.lchown)
    
      fs.chmod = chmodFix(fs.chmod)
      fs.fchmod = chmodFix(fs.fchmod)
      fs.lchmod = chmodFix(fs.lchmod)
    
      fs.chownSync = chownFixSync(fs.chownSync)
      fs.fchownSync = chownFixSync(fs.fchownSync)
      fs.lchownSync = chownFixSync(fs.lchownSync)
    
      fs.chmodSync = chmodFixSync(fs.chmodSync)
      fs.fchmodSync = chmodFixSync(fs.fchmodSync)
      fs.lchmodSync = chmodFixSync(fs.lchmodSync)
    
      fs.stat = statFix(fs.stat)
      fs.fstat = statFix(fs.fstat)
      fs.lstat = statFix(fs.lstat)
    
      fs.statSync = statFixSync(fs.statSync)
      fs.fstatSync = statFixSync(fs.fstatSync)
      fs.lstatSync = statFixSync(fs.lstatSync)
    
      // if lchmod/lchown do not exist, then make them no-ops
      if (!fs.lchmod) {
        fs.lchmod = function (path, mode, cb) {
          if (cb) process.nextTick(cb)
        }
        fs.lchmodSync = function () {}
      }
      if (!fs.lchown) {
        fs.lchown = function (path, uid, gid, cb) {
          if (cb) process.nextTick(cb)
        }
        fs.lchownSync = function () {}
      }
    
      // on Windows, A/V software can lock the directory, causing this
      // to fail with an EACCES or EPERM if the directory contains newly
      // created files.  Try again on failure, for up to 1 second.
      if (process.platform === "win32") {
        fs.rename = (function (fs$rename) { return function (from, to, cb) {
          var start = Date.now()
          fs$rename(from, to, function CB (er) {
            if (er
                && (er.code === "EACCES" || er.code === "EPERM")
                && Date.now() - start < 1000) {
              return fs$rename(from, to, CB)
            }
            if (cb) cb(er)
          })
        }})(fs.rename)
      }
    
      // if read() returns EAGAIN, then just try it again.
      fs.read = (function (fs$read) { return function (fd, buffer, offset, length, position, callback_) {
        var callback
        if (callback_ && typeof callback_ === 'function') {
          var eagCounter = 0
          callback = function (er, _, __) {
            if (er && er.code === 'EAGAIN' && eagCounter < 10) {
              eagCounter ++
              return fs$read.call(fs, fd, buffer, offset, length, position, callback)
            }
            callback_.apply(this, arguments)
          }
        }
        return fs$read.call(fs, fd, buffer, offset, length, position, callback)
      }})(fs.read)
    
      fs.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
        var eagCounter = 0
        while (true) {
          try {
            return fs$readSync.call(fs, fd, buffer, offset, length, position)
          } catch (er) {
            if (er.code === 'EAGAIN' && eagCounter < 10) {
              eagCounter ++
              continue
            }
            throw er
          }
        }
      }})(fs.readSync)
    }
    
    function patchLchmod (fs) {
      fs.lchmod = function (path, mode, callback) {
        fs.open( path
               , constants.O_WRONLY | constants.O_SYMLINK
               , mode
               , function (err, fd) {
          if (err) {
            if (callback) callback(err)
            return
          }
          // prefer to return the chmod error, if one occurs,
          // but still try to close, and report closing errors if they occur.
          fs.fchmod(fd, mode, function (err) {
            fs.close(fd, function(err2) {
              if (callback) callback(err || err2)
            })
          })
        })
      }
    
      fs.lchmodSync = function (path, mode) {
        var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode)
    
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        var threw = true
        var ret
        try {
          ret = fs.fchmodSync(fd, mode)
          threw = false
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd)
            } catch (er) {}
          } else {
            fs.closeSync(fd)
          }
        }
        return ret
      }
    }
    
    function patchLutimes (fs) {
      if (constants.hasOwnProperty("O_SYMLINK")) {
        fs.lutimes = function (path, at, mt, cb) {
          fs.open(path, constants.O_SYMLINK, function (er, fd) {
            if (er) {
              if (cb) cb(er)
              return
            }
            fs.futimes(fd, at, mt, function (er) {
              fs.close(fd, function (er2) {
                if (cb) cb(er || er2)
              })
            })
          })
        }
    
        fs.lutimesSync = function (path, at, mt) {
          var fd = fs.openSync(path, constants.O_SYMLINK)
          var ret
          var threw = true
          try {
            ret = fs.futimesSync(fd, at, mt)
            threw = false
          } finally {
            if (threw) {
              try {
                fs.closeSync(fd)
              } catch (er) {}
            } else {
              fs.closeSync(fd)
            }
          }
          return ret
        }
    
      } else {
        fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb) }
        fs.lutimesSync = function () {}
      }
    }
    
    function chmodFix (orig) {
      if (!orig) return orig
      return function (target, mode, cb) {
        return orig.call(fs, target, mode, function (er) {
          if (chownErOk(er)) er = null
          if (cb) cb.apply(this, arguments)
        })
      }
    }
    
    function chmodFixSync (orig) {
      if (!orig) return orig
      return function (target, mode) {
        try {
          return orig.call(fs, target, mode)
        } catch (er) {
          if (!chownErOk(er)) throw er
        }
      }
    }
    
    
    function chownFix (orig) {
      if (!orig) return orig
      return function (target, uid, gid, cb) {
        return orig.call(fs, target, uid, gid, function (er) {
          if (chownErOk(er)) er = null
          if (cb) cb.apply(this, arguments)
        })
      }
    }
    
    function chownFixSync (orig) {
      if (!orig) return orig
      return function (target, uid, gid) {
        try {
          return orig.call(fs, target, uid, gid)
        } catch (er) {
          if (!chownErOk(er)) throw er
        }
      }
    }
    
    
    function statFix (orig) {
      if (!orig) return orig
      // Older versions of Node erroneously returned signed integers for
      // uid + gid.
      return function (target, cb) {
        return orig.call(fs, target, function (er, stats) {
          if (!stats) return cb.apply(this, arguments)
          if (stats.uid < 0) stats.uid += 0x100000000
          if (stats.gid < 0) stats.gid += 0x100000000
          if (cb) cb.apply(this, arguments)
        })
      }
    }
    
    function statFixSync (orig) {
      if (!orig) return orig
      // Older versions of Node erroneously returned signed integers for
      // uid + gid.
      return function (target) {
        var stats = orig.call(fs, target)
        if (stats.uid < 0) stats.uid += 0x100000000
        if (stats.gid < 0) stats.gid += 0x100000000
        return stats;
      }
    }
    
    // ENOSYS means that the fs doesn't support the op. Just ignore
    // that, because it doesn't matter.
    //
    // if there's no getuid, or if getuid() is something other
    // than 0, and the error is EINVAL or EPERM, then just ignore
    // it.
    //
    // This specific case is a silent failure in cp, install, tar,
    // and most other unix tools that manage permissions.
    //
    // When running as root, or if other types of errors are
    // encountered, then it's strict.
    function chownErOk (er) {
      if (!er)
        return true
    
      if (er.code === "ENOSYS")
        return true
    
      var nonroot = !process.getuid || process.getuid() !== 0
      if (nonroot) {
        if (er.code === "EINVAL" || er.code === "EPERM")
          return true
      }
    
      return false
    }
    
  provide("graceful-fs/polyfills.js", module.exports);
}(global));

// pakmanager:graceful-fs/legacy-streams.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var Stream = require('stream').Stream
    
    module.exports = legacy
    
    function legacy (fs) {
      return {
        ReadStream: ReadStream,
        WriteStream: WriteStream
      }
    
      function ReadStream (path, options) {
        if (!(this instanceof ReadStream)) return new ReadStream(path, options);
    
        Stream.call(this);
    
        var self = this;
    
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
    
        this.flags = 'r';
        this.mode = 438; /*=0666*/
        this.bufferSize = 64 * 1024;
    
        options = options || {};
    
        // Mixin options into this
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
    
        if (this.encoding) this.setEncoding(this.encoding);
    
        if (this.start !== undefined) {
          if ('number' !== typeof this.start) {
            throw TypeError('start must be a Number');
          }
          if (this.end === undefined) {
            this.end = Infinity;
          } else if ('number' !== typeof this.end) {
            throw TypeError('end must be a Number');
          }
    
          if (this.start > this.end) {
            throw new Error('start must be <= end');
          }
    
          this.pos = this.start;
        }
    
        if (this.fd !== null) {
          process.nextTick(function() {
            self._read();
          });
          return;
        }
    
        fs.open(this.path, this.flags, this.mode, function (err, fd) {
          if (err) {
            self.emit('error', err);
            self.readable = false;
            return;
          }
    
          self.fd = fd;
          self.emit('open', fd);
          self._read();
        })
      }
    
      function WriteStream (path, options) {
        if (!(this instanceof WriteStream)) return new WriteStream(path, options);
    
        Stream.call(this);
    
        this.path = path;
        this.fd = null;
        this.writable = true;
    
        this.flags = 'w';
        this.encoding = 'binary';
        this.mode = 438; /*=0666*/
        this.bytesWritten = 0;
    
        options = options || {};
    
        // Mixin options into this
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
    
        if (this.start !== undefined) {
          if ('number' !== typeof this.start) {
            throw TypeError('start must be a Number');
          }
          if (this.start < 0) {
            throw new Error('start must be >= zero');
          }
    
          this.pos = this.start;
        }
    
        this.busy = false;
        this._queue = [];
    
        if (this.fd === null) {
          this._open = fs.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
          this.flush();
        }
      }
    }
    
  provide("graceful-fs/legacy-streams.js", module.exports);
}(global));

// pakmanager:graceful-fs
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var fs = require('fs')
    var polyfills =  require('graceful-fs/polyfills.js')
    var legacy =  require('graceful-fs/legacy-streams.js')
    var queue = []
    
    var util = require('util')
    
    function noop () {}
    
    var debug = noop
    if (util.debuglog)
      debug = util.debuglog('gfs4')
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
      debug = function() {
        var m = util.format.apply(util, arguments)
        m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ')
        console.error(m)
      }
    
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
      process.on('exit', function() {
        debug(queue)
        require('assert').equal(queue.length, 0)
      })
    }
    
    module.exports = patch( require('graceful-fs/fs.js'))
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH) {
      module.exports = patch(fs)
    }
    
    // Always patch fs.close/closeSync, because we want to
    // retry() whenever a close happens *anywhere* in the program.
    // This is essential when multiple graceful-fs instances are
    // in play at the same time.
    module.exports.close =
    fs.close = (function (fs$close) { return function (fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        if (!err)
          retry()
    
        if (typeof cb === 'function')
          cb.apply(this, arguments)
      })
    }})(fs.close)
    
    module.exports.closeSync =
    fs.closeSync = (function (fs$closeSync) { return function (fd) {
      // Note that graceful-fs also retries when fs.closeSync() fails.
      // Looks like a bug to me, although it's probably a harmless one.
      var rval = fs$closeSync.apply(fs, arguments)
      retry()
      return rval
    }})(fs.closeSync)
    
    function patch (fs) {
      // Everything that references the open() function needs to be in here
      polyfills(fs)
      fs.gracefulify = patch
      fs.FileReadStream = ReadStream;  // Legacy name.
      fs.FileWriteStream = WriteStream;  // Legacy name.
      fs.createReadStream = createReadStream
      fs.createWriteStream = createWriteStream
      var fs$readFile = fs.readFile
      fs.readFile = readFile
      function readFile (path, options, cb) {
        if (typeof options === 'function')
          cb = options, options = null
    
        return go$readFile(path, options, cb)
    
        function go$readFile (path, options, cb) {
          return fs$readFile(path, options, function (err) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
              enqueue([go$readFile, [path, options, cb]])
            else {
              if (typeof cb === 'function')
                cb.apply(this, arguments)
              retry()
            }
          })
        }
      }
    
      var fs$writeFile = fs.writeFile
      fs.writeFile = writeFile
      function writeFile (path, data, options, cb) {
        if (typeof options === 'function')
          cb = options, options = null
    
        return go$writeFile(path, data, options, cb)
    
        function go$writeFile (path, data, options, cb) {
          return fs$writeFile(path, data, options, function (err) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
              enqueue([go$writeFile, [path, data, options, cb]])
            else {
              if (typeof cb === 'function')
                cb.apply(this, arguments)
              retry()
            }
          })
        }
      }
    
      var fs$appendFile = fs.appendFile
      if (fs$appendFile)
        fs.appendFile = appendFile
      function appendFile (path, data, options, cb) {
        if (typeof options === 'function')
          cb = options, options = null
    
        return go$appendFile(path, data, options, cb)
    
        function go$appendFile (path, data, options, cb) {
          return fs$appendFile(path, data, options, function (err) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
              enqueue([go$appendFile, [path, data, options, cb]])
            else {
              if (typeof cb === 'function')
                cb.apply(this, arguments)
              retry()
            }
          })
        }
      }
    
      var fs$readdir = fs.readdir
      fs.readdir = readdir
      function readdir (path, options, cb) {
        var args = [path]
        if (typeof options !== 'function') {
          args.push(options)
        } else {
          cb = options
        }
        args.push(go$readdir$cb)
    
        return go$readdir(args)
    
        function go$readdir$cb (err, files) {
          if (files && files.sort)
            files.sort()
    
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$readdir, [args]])
          else {
            if (typeof cb === 'function')
              cb.apply(this, arguments)
            retry()
          }
        }
      }
    
      function go$readdir (args) {
        return fs$readdir.apply(fs, args)
      }
    
      if (process.version.substr(0, 4) === 'v0.8') {
        var legStreams = legacy(fs)
        ReadStream = legStreams.ReadStream
        WriteStream = legStreams.WriteStream
      }
    
      var fs$ReadStream = fs.ReadStream
      ReadStream.prototype = Object.create(fs$ReadStream.prototype)
      ReadStream.prototype.open = ReadStream$open
    
      var fs$WriteStream = fs.WriteStream
      WriteStream.prototype = Object.create(fs$WriteStream.prototype)
      WriteStream.prototype.open = WriteStream$open
    
      fs.ReadStream = ReadStream
      fs.WriteStream = WriteStream
    
      function ReadStream (path, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
      }
    
      function ReadStream$open () {
        var that = this
        open(that.path, that.flags, that.mode, function (err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy()
    
            that.emit('error', err)
          } else {
            that.fd = fd
            that.emit('open', fd)
            that.read()
          }
        })
      }
    
      function WriteStream (path, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
      }
    
      function WriteStream$open () {
        var that = this
        open(that.path, that.flags, that.mode, function (err, fd) {
          if (err) {
            that.destroy()
            that.emit('error', err)
          } else {
            that.fd = fd
            that.emit('open', fd)
          }
        })
      }
    
      function createReadStream (path, options) {
        return new ReadStream(path, options)
      }
    
      function createWriteStream (path, options) {
        return new WriteStream(path, options)
      }
    
      var fs$open = fs.open
      fs.open = open
      function open (path, flags, mode, cb) {
        if (typeof mode === 'function')
          cb = mode, mode = null
    
        return go$open(path, flags, mode, cb)
    
        function go$open (path, flags, mode, cb) {
          return fs$open(path, flags, mode, function (err, fd) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
              enqueue([go$open, [path, flags, mode, cb]])
            else {
              if (typeof cb === 'function')
                cb.apply(this, arguments)
              retry()
            }
          })
        }
      }
    
      return fs
    }
    
    function enqueue (elem) {
      debug('ENQUEUE', elem[0].name, elem[1])
      queue.push(elem)
    }
    
    function retry () {
      var elem = queue.shift()
      if (elem) {
        debug('RETRY', elem[0].name, elem[1])
        elem[0].apply(null, elem[1])
      }
    }
    
  provide("graceful-fs", module.exports);
}(global));

// pakmanager:glob/common.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  exports.alphasort = alphasort
    exports.alphasorti = alphasorti
    exports.setopts = setopts
    exports.ownProp = ownProp
    exports.makeAbs = makeAbs
    exports.finish = finish
    exports.mark = mark
    exports.isIgnored = isIgnored
    exports.childrenIgnored = childrenIgnored
    
    function ownProp (obj, field) {
      return Object.prototype.hasOwnProperty.call(obj, field)
    }
    
    var path = require("path")
    var minimatch = require("minimatch")
    var isAbsolute = require("path-is-absolute")
    var Minimatch = minimatch.Minimatch
    
    function alphasorti (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase())
    }
    
    function alphasort (a, b) {
      return a.localeCompare(b)
    }
    
    function setupIgnores (self, options) {
      self.ignore = options.ignore || []
    
      if (!Array.isArray(self.ignore))
        self.ignore = [self.ignore]
    
      if (self.ignore.length) {
        self.ignore = self.ignore.map(ignoreMap)
      }
    }
    
    // ignore patterns are always in dot:true mode.
    function ignoreMap (pattern) {
      var gmatcher = null
      if (pattern.slice(-3) === '/**') {
        var gpattern = pattern.replace(/(\/\*\*)+$/, '')
        gmatcher = new Minimatch(gpattern, { dot: true })
      }
    
      return {
        matcher: new Minimatch(pattern, { dot: true }),
        gmatcher: gmatcher
      }
    }
    
    function setopts (self, pattern, options) {
      if (!options)
        options = {}
    
      // base-matching: just use globstar for that.
      if (options.matchBase && -1 === pattern.indexOf("/")) {
        if (options.noglobstar) {
          throw new Error("base matching requires globstar")
        }
        pattern = "**/" + pattern
      }
    
      self.silent = !!options.silent
      self.pattern = pattern
      self.strict = options.strict !== false
      self.realpath = !!options.realpath
      self.realpathCache = options.realpathCache || Object.create(null)
      self.follow = !!options.follow
      self.dot = !!options.dot
      self.mark = !!options.mark
      self.nodir = !!options.nodir
      if (self.nodir)
        self.mark = true
      self.sync = !!options.sync
      self.nounique = !!options.nounique
      self.nonull = !!options.nonull
      self.nosort = !!options.nosort
      self.nocase = !!options.nocase
      self.stat = !!options.stat
      self.noprocess = !!options.noprocess
      self.absolute = !!options.absolute
    
      self.maxLength = options.maxLength || Infinity
      self.cache = options.cache || Object.create(null)
      self.statCache = options.statCache || Object.create(null)
      self.symlinks = options.symlinks || Object.create(null)
    
      setupIgnores(self, options)
    
      self.changedCwd = false
      var cwd = process.cwd()
      if (!ownProp(options, "cwd"))
        self.cwd = cwd
      else {
        self.cwd = path.resolve(options.cwd)
        self.changedCwd = self.cwd !== cwd
      }
    
      self.root = options.root || path.resolve(self.cwd, "/")
      self.root = path.resolve(self.root)
      if (process.platform === "win32")
        self.root = self.root.replace(/\\/g, "/")
    
      self.cwdAbs = makeAbs(self, self.cwd)
      self.nomount = !!options.nomount
    
      // disable comments and negation in Minimatch.
      // Note that they are not supported in Glob itself anyway.
      options.nonegate = true
      options.nocomment = true
    
      self.minimatch = new Minimatch(pattern, options)
      self.options = self.minimatch.options
    }
    
    function finish (self) {
      var nou = self.nounique
      var all = nou ? [] : Object.create(null)
    
      for (var i = 0, l = self.matches.length; i < l; i ++) {
        var matches = self.matches[i]
        if (!matches || Object.keys(matches).length === 0) {
          if (self.nonull) {
            // do like the shell, and spit out the literal glob
            var literal = self.minimatch.globSet[i]
            if (nou)
              all.push(literal)
            else
              all[literal] = true
          }
        } else {
          // had matches
          var m = Object.keys(matches)
          if (nou)
            all.push.apply(all, m)
          else
            m.forEach(function (m) {
              all[m] = true
            })
        }
      }
    
      if (!nou)
        all = Object.keys(all)
    
      if (!self.nosort)
        all = all.sort(self.nocase ? alphasorti : alphasort)
    
      // at *some* point we statted all of these
      if (self.mark) {
        for (var i = 0; i < all.length; i++) {
          all[i] = self._mark(all[i])
        }
        if (self.nodir) {
          all = all.filter(function (e) {
            var notDir = !(/\/$/.test(e))
            var c = self.cache[e] || self.cache[makeAbs(self, e)]
            if (notDir && c)
              notDir = c !== 'DIR' && !Array.isArray(c)
            return notDir
          })
        }
      }
    
      if (self.ignore.length)
        all = all.filter(function(m) {
          return !isIgnored(self, m)
        })
    
      self.found = all
    }
    
    function mark (self, p) {
      var abs = makeAbs(self, p)
      var c = self.cache[abs]
      var m = p
      if (c) {
        var isDir = c === 'DIR' || Array.isArray(c)
        var slash = p.slice(-1) === '/'
    
        if (isDir && !slash)
          m += '/'
        else if (!isDir && slash)
          m = m.slice(0, -1)
    
        if (m !== p) {
          var mabs = makeAbs(self, m)
          self.statCache[mabs] = self.statCache[abs]
          self.cache[mabs] = self.cache[abs]
        }
      }
    
      return m
    }
    
    // lotta situps...
    function makeAbs (self, f) {
      var abs = f
      if (f.charAt(0) === '/') {
        abs = path.join(self.root, f)
      } else if (isAbsolute(f) || f === '') {
        abs = f
      } else if (self.changedCwd) {
        abs = path.resolve(self.cwd, f)
      } else {
        abs = path.resolve(f)
      }
    
      if (process.platform === 'win32')
        abs = abs.replace(/\\/g, '/')
    
      return abs
    }
    
    
    // Return true, if pattern ends with globstar '**', for the accompanying parent directory.
    // Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
    function isIgnored (self, path) {
      if (!self.ignore.length)
        return false
    
      return self.ignore.some(function(item) {
        return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
      })
    }
    
    function childrenIgnored (self, path) {
      if (!self.ignore.length)
        return false
    
      return self.ignore.some(function(item) {
        return !!(item.gmatcher && item.gmatcher.match(path))
      })
    }
    
  provide("glob/common.js", module.exports);
}(global));

// pakmanager:glob/glob.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Approach:
    //
    // 1. Get the minimatch set
    // 2. For each pattern in the set, PROCESS(pattern, false)
    // 3. Store matches per-set, then uniq them
    //
    // PROCESS(pattern, inGlobStar)
    // Get the first [n] items from pattern that are all strings
    // Join these together.  This is PREFIX.
    //   If there is no more remaining, then stat(PREFIX) and
    //   add to matches if it succeeds.  END.
    //
    // If inGlobStar and PREFIX is symlink and points to dir
    //   set ENTRIES = []
    // else readdir(PREFIX) as ENTRIES
    //   If fail, END
    //
    // with ENTRIES
    //   If pattern[n] is GLOBSTAR
    //     // handle the case where the globstar match is empty
    //     // by pruning it out, and testing the resulting pattern
    //     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
    //     // handle other cases.
    //     for ENTRY in ENTRIES (not dotfiles)
    //       // attach globstar + tail onto the entry
    //       // Mark that this entry is a globstar match
    //       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
    //
    //   else // not globstar
    //     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
    //       Test ENTRY against pattern[n]
    //       If fails, continue
    //       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
    //
    // Caveat:
    //   Cache all stats and readdirs results to minimize syscall.  Since all
    //   we ever care about is existence and directory-ness, we can just keep
    //   `true` for files, and [children,...] for directories, or `false` for
    //   things that don't exist.
    
    module.exports = glob
    
    var fs = require('fs')
    var rp = require('fs.realpath')
    var minimatch = require('minimatch')
    var Minimatch = minimatch.Minimatch
    var inherits = require('inherits')
    var EE = require('events').EventEmitter
    var path = require('path')
    var assert = require('assert')
    var isAbsolute = require('path-is-absolute')
    var globSync =  require('glob/sync.js')
    var common =  require('glob/common.js')
    var alphasort = common.alphasort
    var alphasorti = common.alphasorti
    var setopts = common.setopts
    var ownProp = common.ownProp
    var inflight = require('inflight')
    var util = require('util')
    var childrenIgnored = common.childrenIgnored
    var isIgnored = common.isIgnored
    
    var once = require('once')
    
    function glob (pattern, options, cb) {
      if (typeof options === 'function') cb = options, options = {}
      if (!options) options = {}
    
      if (options.sync) {
        if (cb)
          throw new TypeError('callback provided to sync glob')
        return globSync(pattern, options)
      }
    
      return new Glob(pattern, options, cb)
    }
    
    glob.sync = globSync
    var GlobSync = glob.GlobSync = globSync.GlobSync
    
    // old api surface
    glob.glob = glob
    
    function extend (origin, add) {
      if (add === null || typeof add !== 'object') {
        return origin
      }
    
      var keys = Object.keys(add)
      var i = keys.length
      while (i--) {
        origin[keys[i]] = add[keys[i]]
      }
      return origin
    }
    
    glob.hasMagic = function (pattern, options_) {
      var options = extend({}, options_)
      options.noprocess = true
    
      var g = new Glob(pattern, options)
      var set = g.minimatch.set
    
      if (!pattern)
        return false
    
      if (set.length > 1)
        return true
    
      for (var j = 0; j < set[0].length; j++) {
        if (typeof set[0][j] !== 'string')
          return true
      }
    
      return false
    }
    
    glob.Glob = Glob
    inherits(Glob, EE)
    function Glob (pattern, options, cb) {
      if (typeof options === 'function') {
        cb = options
        options = null
      }
    
      if (options && options.sync) {
        if (cb)
          throw new TypeError('callback provided to sync glob')
        return new GlobSync(pattern, options)
      }
    
      if (!(this instanceof Glob))
        return new Glob(pattern, options, cb)
    
      setopts(this, pattern, options)
      this._didRealPath = false
    
      // process each pattern in the minimatch set
      var n = this.minimatch.set.length
    
      // The matches are stored as {<filename>: true,...} so that
      // duplicates are automagically pruned.
      // Later, we do an Object.keys() on these.
      // Keep them as a list so we can fill in when nonull is set.
      this.matches = new Array(n)
    
      if (typeof cb === 'function') {
        cb = once(cb)
        this.on('error', cb)
        this.on('end', function (matches) {
          cb(null, matches)
        })
      }
    
      var self = this
      var n = this.minimatch.set.length
      this._processing = 0
      this.matches = new Array(n)
    
      this._emitQueue = []
      this._processQueue = []
      this.paused = false
    
      if (this.noprocess)
        return this
    
      if (n === 0)
        return done()
    
      var sync = true
      for (var i = 0; i < n; i ++) {
        this._process(this.minimatch.set[i], i, false, done)
      }
      sync = false
    
      function done () {
        --self._processing
        if (self._processing <= 0) {
          if (sync) {
            process.nextTick(function () {
              self._finish()
            })
          } else {
            self._finish()
          }
        }
      }
    }
    
    Glob.prototype._finish = function () {
      assert(this instanceof Glob)
      if (this.aborted)
        return
    
      if (this.realpath && !this._didRealpath)
        return this._realpath()
    
      common.finish(this)
      this.emit('end', this.found)
    }
    
    Glob.prototype._realpath = function () {
      if (this._didRealpath)
        return
    
      this._didRealpath = true
    
      var n = this.matches.length
      if (n === 0)
        return this._finish()
    
      var self = this
      for (var i = 0; i < this.matches.length; i++)
        this._realpathSet(i, next)
    
      function next () {
        if (--n === 0)
          self._finish()
      }
    }
    
    Glob.prototype._realpathSet = function (index, cb) {
      var matchset = this.matches[index]
      if (!matchset)
        return cb()
    
      var found = Object.keys(matchset)
      var self = this
      var n = found.length
    
      if (n === 0)
        return cb()
    
      var set = this.matches[index] = Object.create(null)
      found.forEach(function (p, i) {
        // If there's a problem with the stat, then it means that
        // one or more of the links in the realpath couldn't be
        // resolved.  just return the abs value in that case.
        p = self._makeAbs(p)
        rp.realpath(p, self.realpathCache, function (er, real) {
          if (!er)
            set[real] = true
          else if (er.syscall === 'stat')
            set[p] = true
          else
            self.emit('error', er) // srsly wtf right here
    
          if (--n === 0) {
            self.matches[index] = set
            cb()
          }
        })
      })
    }
    
    Glob.prototype._mark = function (p) {
      return common.mark(this, p)
    }
    
    Glob.prototype._makeAbs = function (f) {
      return common.makeAbs(this, f)
    }
    
    Glob.prototype.abort = function () {
      this.aborted = true
      this.emit('abort')
    }
    
    Glob.prototype.pause = function () {
      if (!this.paused) {
        this.paused = true
        this.emit('pause')
      }
    }
    
    Glob.prototype.resume = function () {
      if (this.paused) {
        this.emit('resume')
        this.paused = false
        if (this._emitQueue.length) {
          var eq = this._emitQueue.slice(0)
          this._emitQueue.length = 0
          for (var i = 0; i < eq.length; i ++) {
            var e = eq[i]
            this._emitMatch(e[0], e[1])
          }
        }
        if (this._processQueue.length) {
          var pq = this._processQueue.slice(0)
          this._processQueue.length = 0
          for (var i = 0; i < pq.length; i ++) {
            var p = pq[i]
            this._processing--
            this._process(p[0], p[1], p[2], p[3])
          }
        }
      }
    }
    
    Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
      assert(this instanceof Glob)
      assert(typeof cb === 'function')
    
      if (this.aborted)
        return
    
      this._processing++
      if (this.paused) {
        this._processQueue.push([pattern, index, inGlobStar, cb])
        return
      }
    
      //console.error('PROCESS %d', this._processing, pattern)
    
      // Get the first [n] parts of pattern that are all strings.
      var n = 0
      while (typeof pattern[n] === 'string') {
        n ++
      }
      // now n is the index of the first one that is *not* a string.
    
      // see if there's anything else
      var prefix
      switch (n) {
        // if not, then this is rather simple
        case pattern.length:
          this._processSimple(pattern.join('/'), index, cb)
          return
    
        case 0:
          // pattern *starts* with some non-trivial item.
          // going to readdir(cwd), but not include the prefix in matches.
          prefix = null
          break
    
        default:
          // pattern has some string bits in the front.
          // whatever it starts with, whether that's 'absolute' like /foo/bar,
          // or 'relative' like '../baz'
          prefix = pattern.slice(0, n).join('/')
          break
      }
    
      var remain = pattern.slice(n)
    
      // get the list of entries.
      var read
      if (prefix === null)
        read = '.'
      else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = '/' + prefix
        read = prefix
      } else
        read = prefix
    
      var abs = this._makeAbs(read)
    
      //if ignored, skip _processing
      if (childrenIgnored(this, read))
        return cb()
    
      var isGlobStar = remain[0] === minimatch.GLOBSTAR
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
    }
    
    Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this
      this._readdir(abs, inGlobStar, function (er, entries) {
        return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
      })
    }
    
    Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    
      // if the abs isn't a dir, then nothing can match!
      if (!entries)
        return cb()
    
      // It will only match dot entries if it starts with a dot, or if
      // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
      var pn = remain[0]
      var negate = !!this.minimatch.negate
      var rawGlob = pn._glob
      var dotOk = this.dot || rawGlob.charAt(0) === '.'
    
      var matchedEntries = []
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i]
        if (e.charAt(0) !== '.' || dotOk) {
          var m
          if (negate && !prefix) {
            m = !e.match(pn)
          } else {
            m = e.match(pn)
          }
          if (m)
            matchedEntries.push(e)
        }
      }
    
      //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)
    
      var len = matchedEntries.length
      // If there are no matched entries, then nothing matches.
      if (len === 0)
        return cb()
    
      // if this is the last remaining pattern bit, then no need for
      // an additional stat *unless* the user has specified mark or
      // stat explicitly.  We know they exist, since readdir returned
      // them.
    
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = Object.create(null)
    
        for (var i = 0; i < len; i ++) {
          var e = matchedEntries[i]
          if (prefix) {
            if (prefix !== '/')
              e = prefix + '/' + e
            else
              e = prefix + e
          }
    
          if (e.charAt(0) === '/' && !this.nomount) {
            e = path.join(this.root, e)
          }
          this._emitMatch(index, e)
        }
        // This was the last one, and no stats were needed
        return cb()
      }
    
      // now test all matched entries as stand-ins for that part
      // of the pattern.
      remain.shift()
      for (var i = 0; i < len; i ++) {
        var e = matchedEntries[i]
        var newPattern
        if (prefix) {
          if (prefix !== '/')
            e = prefix + '/' + e
          else
            e = prefix + e
        }
        this._process([e].concat(remain), index, inGlobStar, cb)
      }
      cb()
    }
    
    Glob.prototype._emitMatch = function (index, e) {
      if (this.aborted)
        return
    
      if (isIgnored(this, e))
        return
    
      if (this.paused) {
        this._emitQueue.push([index, e])
        return
      }
    
      var abs = this._makeAbs(e)
    
      if (this.mark)
        e = this._mark(e)
    
      if (this.absolute)
        e = abs
    
      if (this.matches[index][e])
        return
    
      if (this.nodir) {
        var c = this.cache[abs]
        if (c === 'DIR' || Array.isArray(c))
          return
      }
    
      this.matches[index][e] = true
    
      var st = this.statCache[abs]
      if (st)
        this.emit('stat', e, st)
    
      this.emit('match', e)
    }
    
    Glob.prototype._readdirInGlobStar = function (abs, cb) {
      if (this.aborted)
        return
    
      // follow all symlinked directories forever
      // just proceed as if this is a non-globstar situation
      if (this.follow)
        return this._readdir(abs, false, cb)
    
      var lstatkey = 'lstat\0' + abs
      var self = this
      var lstatcb = inflight(lstatkey, lstatcb_)
    
      if (lstatcb)
        fs.lstat(abs, lstatcb)
    
      function lstatcb_ (er, lstat) {
        if (er)
          return cb()
    
        var isSym = lstat.isSymbolicLink()
        self.symlinks[abs] = isSym
    
        // If it's not a symlink or a dir, then it's definitely a regular file.
        // don't bother doing a readdir in that case.
        if (!isSym && !lstat.isDirectory()) {
          self.cache[abs] = 'FILE'
          cb()
        } else
          self._readdir(abs, false, cb)
      }
    }
    
    Glob.prototype._readdir = function (abs, inGlobStar, cb) {
      if (this.aborted)
        return
    
      cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
      if (!cb)
        return
    
      //console.error('RD %j %j', +inGlobStar, abs)
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs, cb)
    
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs]
        if (!c || c === 'FILE')
          return cb()
    
        if (Array.isArray(c))
          return cb(null, c)
      }
    
      var self = this
      fs.readdir(abs, readdirCb(this, abs, cb))
    }
    
    function readdirCb (self, abs, cb) {
      return function (er, entries) {
        if (er)
          self._readdirError(abs, er, cb)
        else
          self._readdirEntries(abs, entries, cb)
      }
    }
    
    Glob.prototype._readdirEntries = function (abs, entries, cb) {
      if (this.aborted)
        return
    
      // if we haven't asked to stat everything, then just
      // assume that everything in there exists, so we can avoid
      // having to stat it a second time.
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i ++) {
          var e = entries[i]
          if (abs === '/')
            e = abs + e
          else
            e = abs + '/' + e
          this.cache[e] = true
        }
      }
    
      this.cache[abs] = entries
      return cb(null, entries)
    }
    
    Glob.prototype._readdirError = function (f, er, cb) {
      if (this.aborted)
        return
    
      // handle errors, and cache the information
      switch (er.code) {
        case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
        case 'ENOTDIR': // totally normal. means it *does* exist.
          var abs = this._makeAbs(f)
          this.cache[abs] = 'FILE'
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + ' invalid cwd ' + this.cwd)
            error.path = this.cwd
            error.code = er.code
            this.emit('error', error)
            this.abort()
          }
          break
    
        case 'ENOENT': // not terribly unusual
        case 'ELOOP':
        case 'ENAMETOOLONG':
        case 'UNKNOWN':
          this.cache[this._makeAbs(f)] = false
          break
    
        default: // some unusual error.  Treat as failure.
          this.cache[this._makeAbs(f)] = false
          if (this.strict) {
            this.emit('error', er)
            // If the error is handled, then we abort
            // if not, we threw out of here
            this.abort()
          }
          if (!this.silent)
            console.error('glob error', er)
          break
      }
    
      return cb()
    }
    
    Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this
      this._readdir(abs, inGlobStar, function (er, entries) {
        self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
      })
    }
    
    
    Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      //console.error('pgs2', prefix, remain[0], entries)
    
      // no entries means not a dir, so it can never have matches
      // foo.txt/** doesn't match foo.txt
      if (!entries)
        return cb()
    
      // test without the globstar, and with every child both below
      // and replacing the globstar.
      var remainWithoutGlobStar = remain.slice(1)
      var gspref = prefix ? [ prefix ] : []
      var noGlobStar = gspref.concat(remainWithoutGlobStar)
    
      // the noGlobStar pattern exits the inGlobStar state
      this._process(noGlobStar, index, false, cb)
    
      var isSym = this.symlinks[abs]
      var len = entries.length
    
      // If it's a symlink, and we're in a globstar, then stop
      if (isSym && inGlobStar)
        return cb()
    
      for (var i = 0; i < len; i++) {
        var e = entries[i]
        if (e.charAt(0) === '.' && !this.dot)
          continue
    
        // these two cases enter the inGlobStar state
        var instead = gspref.concat(entries[i], remainWithoutGlobStar)
        this._process(instead, index, true, cb)
    
        var below = gspref.concat(entries[i], remain)
        this._process(below, index, true, cb)
      }
    
      cb()
    }
    
    Glob.prototype._processSimple = function (prefix, index, cb) {
      // XXX review this.  Shouldn't it be doing the mounting etc
      // before doing stat?  kinda weird?
      var self = this
      this._stat(prefix, function (er, exists) {
        self._processSimple2(prefix, index, er, exists, cb)
      })
    }
    Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {
    
      //console.error('ps2', prefix, exists)
    
      if (!this.matches[index])
        this.matches[index] = Object.create(null)
    
      // If it doesn't exist, then just mark the lack of results
      if (!exists)
        return cb()
    
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix)
        if (prefix.charAt(0) === '/') {
          prefix = path.join(this.root, prefix)
        } else {
          prefix = path.resolve(this.root, prefix)
          if (trail)
            prefix += '/'
        }
      }
    
      if (process.platform === 'win32')
        prefix = prefix.replace(/\\/g, '/')
    
      // Mark this as a match
      this._emitMatch(index, prefix)
      cb()
    }
    
    // Returns either 'DIR', 'FILE', or false
    Glob.prototype._stat = function (f, cb) {
      var abs = this._makeAbs(f)
      var needDir = f.slice(-1) === '/'
    
      if (f.length > this.maxLength)
        return cb()
    
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs]
    
        if (Array.isArray(c))
          c = 'DIR'
    
        // It exists, but maybe not how we need it
        if (!needDir || c === 'DIR')
          return cb(null, c)
    
        if (needDir && c === 'FILE')
          return cb()
    
        // otherwise we have to stat, because maybe c=true
        // if we know it exists, but not what it is.
      }
    
      var exists
      var stat = this.statCache[abs]
      if (stat !== undefined) {
        if (stat === false)
          return cb(null, stat)
        else {
          var type = stat.isDirectory() ? 'DIR' : 'FILE'
          if (needDir && type === 'FILE')
            return cb()
          else
            return cb(null, type, stat)
        }
      }
    
      var self = this
      var statcb = inflight('stat\0' + abs, lstatcb_)
      if (statcb)
        fs.lstat(abs, statcb)
    
      function lstatcb_ (er, lstat) {
        if (lstat && lstat.isSymbolicLink()) {
          // If it's a symlink, then treat it as the target, unless
          // the target does not exist, then treat it as a file.
          return fs.stat(abs, function (er, stat) {
            if (er)
              self._stat2(f, abs, null, lstat, cb)
            else
              self._stat2(f, abs, er, stat, cb)
          })
        } else {
          self._stat2(f, abs, er, lstat, cb)
        }
      }
    }
    
    Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
      if (er) {
        this.statCache[abs] = false
        return cb()
      }
    
      var needDir = f.slice(-1) === '/'
      this.statCache[abs] = stat
    
      if (abs.slice(-1) === '/' && !stat.isDirectory())
        return cb(null, false, stat)
    
      var c = stat.isDirectory() ? 'DIR' : 'FILE'
      this.cache[abs] = this.cache[abs] || c
    
      if (needDir && c !== 'DIR')
        return cb()
    
      return cb(null, c, stat)
    }
    
  provide("glob/glob.js", module.exports);
}(global));

// pakmanager:glob/sync.js
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = globSync
    globSync.GlobSync = GlobSync
    
    var fs = require('fs')
    var rp = require('fs.realpath')
    var minimatch = require('minimatch')
    var Minimatch = minimatch.Minimatch
    var Glob =  require('glob/glob.js').Glob
    var util = require('util')
    var path = require('path')
    var assert = require('assert')
    var isAbsolute = require('path-is-absolute')
    var common =  require('glob/common.js')
    var alphasort = common.alphasort
    var alphasorti = common.alphasorti
    var setopts = common.setopts
    var ownProp = common.ownProp
    var childrenIgnored = common.childrenIgnored
    var isIgnored = common.isIgnored
    
    function globSync (pattern, options) {
      if (typeof options === 'function' || arguments.length === 3)
        throw new TypeError('callback provided to sync glob\n'+
                            'See: https://github.com/isaacs/node-glob/issues/167')
    
      return new GlobSync(pattern, options).found
    }
    
    function GlobSync (pattern, options) {
      if (!pattern)
        throw new Error('must provide pattern')
    
      if (typeof options === 'function' || arguments.length === 3)
        throw new TypeError('callback provided to sync glob\n'+
                            'See: https://github.com/isaacs/node-glob/issues/167')
    
      if (!(this instanceof GlobSync))
        return new GlobSync(pattern, options)
    
      setopts(this, pattern, options)
    
      if (this.noprocess)
        return this
    
      var n = this.minimatch.set.length
      this.matches = new Array(n)
      for (var i = 0; i < n; i ++) {
        this._process(this.minimatch.set[i], i, false)
      }
      this._finish()
    }
    
    GlobSync.prototype._finish = function () {
      assert(this instanceof GlobSync)
      if (this.realpath) {
        var self = this
        this.matches.forEach(function (matchset, index) {
          var set = self.matches[index] = Object.create(null)
          for (var p in matchset) {
            try {
              p = self._makeAbs(p)
              var real = rp.realpathSync(p, self.realpathCache)
              set[real] = true
            } catch (er) {
              if (er.syscall === 'stat')
                set[self._makeAbs(p)] = true
              else
                throw er
            }
          }
        })
      }
      common.finish(this)
    }
    
    
    GlobSync.prototype._process = function (pattern, index, inGlobStar) {
      assert(this instanceof GlobSync)
    
      // Get the first [n] parts of pattern that are all strings.
      var n = 0
      while (typeof pattern[n] === 'string') {
        n ++
      }
      // now n is the index of the first one that is *not* a string.
    
      // See if there's anything else
      var prefix
      switch (n) {
        // if not, then this is rather simple
        case pattern.length:
          this._processSimple(pattern.join('/'), index)
          return
    
        case 0:
          // pattern *starts* with some non-trivial item.
          // going to readdir(cwd), but not include the prefix in matches.
          prefix = null
          break
    
        default:
          // pattern has some string bits in the front.
          // whatever it starts with, whether that's 'absolute' like /foo/bar,
          // or 'relative' like '../baz'
          prefix = pattern.slice(0, n).join('/')
          break
      }
    
      var remain = pattern.slice(n)
    
      // get the list of entries.
      var read
      if (prefix === null)
        read = '.'
      else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = '/' + prefix
        read = prefix
      } else
        read = prefix
    
      var abs = this._makeAbs(read)
    
      //if ignored, skip processing
      if (childrenIgnored(this, read))
        return
    
      var isGlobStar = remain[0] === minimatch.GLOBSTAR
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar)
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar)
    }
    
    
    GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar)
    
      // if the abs isn't a dir, then nothing can match!
      if (!entries)
        return
    
      // It will only match dot entries if it starts with a dot, or if
      // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
      var pn = remain[0]
      var negate = !!this.minimatch.negate
      var rawGlob = pn._glob
      var dotOk = this.dot || rawGlob.charAt(0) === '.'
    
      var matchedEntries = []
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i]
        if (e.charAt(0) !== '.' || dotOk) {
          var m
          if (negate && !prefix) {
            m = !e.match(pn)
          } else {
            m = e.match(pn)
          }
          if (m)
            matchedEntries.push(e)
        }
      }
    
      var len = matchedEntries.length
      // If there are no matched entries, then nothing matches.
      if (len === 0)
        return
    
      // if this is the last remaining pattern bit, then no need for
      // an additional stat *unless* the user has specified mark or
      // stat explicitly.  We know they exist, since readdir returned
      // them.
    
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = Object.create(null)
    
        for (var i = 0; i < len; i ++) {
          var e = matchedEntries[i]
          if (prefix) {
            if (prefix.slice(-1) !== '/')
              e = prefix + '/' + e
            else
              e = prefix + e
          }
    
          if (e.charAt(0) === '/' && !this.nomount) {
            e = path.join(this.root, e)
          }
          this._emitMatch(index, e)
        }
        // This was the last one, and no stats were needed
        return
      }
    
      // now test all matched entries as stand-ins for that part
      // of the pattern.
      remain.shift()
      for (var i = 0; i < len; i ++) {
        var e = matchedEntries[i]
        var newPattern
        if (prefix)
          newPattern = [prefix, e]
        else
          newPattern = [e]
        this._process(newPattern.concat(remain), index, inGlobStar)
      }
    }
    
    
    GlobSync.prototype._emitMatch = function (index, e) {
      if (isIgnored(this, e))
        return
    
      var abs = this._makeAbs(e)
    
      if (this.mark)
        e = this._mark(e)
    
      if (this.absolute) {
        e = abs
      }
    
      if (this.matches[index][e])
        return
    
      if (this.nodir) {
        var c = this.cache[abs]
        if (c === 'DIR' || Array.isArray(c))
          return
      }
    
      this.matches[index][e] = true
    
      if (this.stat)
        this._stat(e)
    }
    
    
    GlobSync.prototype._readdirInGlobStar = function (abs) {
      // follow all symlinked directories forever
      // just proceed as if this is a non-globstar situation
      if (this.follow)
        return this._readdir(abs, false)
    
      var entries
      var lstat
      var stat
      try {
        lstat = fs.lstatSync(abs)
      } catch (er) {
        // lstat failed, doesn't exist
        return null
      }
    
      var isSym = lstat.isSymbolicLink()
      this.symlinks[abs] = isSym
    
      // If it's not a symlink or a dir, then it's definitely a regular file.
      // don't bother doing a readdir in that case.
      if (!isSym && !lstat.isDirectory())
        this.cache[abs] = 'FILE'
      else
        entries = this._readdir(abs, false)
    
      return entries
    }
    
    GlobSync.prototype._readdir = function (abs, inGlobStar) {
      var entries
    
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs)
    
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs]
        if (!c || c === 'FILE')
          return null
    
        if (Array.isArray(c))
          return c
      }
    
      try {
        return this._readdirEntries(abs, fs.readdirSync(abs))
      } catch (er) {
        this._readdirError(abs, er)
        return null
      }
    }
    
    GlobSync.prototype._readdirEntries = function (abs, entries) {
      // if we haven't asked to stat everything, then just
      // assume that everything in there exists, so we can avoid
      // having to stat it a second time.
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i ++) {
          var e = entries[i]
          if (abs === '/')
            e = abs + e
          else
            e = abs + '/' + e
          this.cache[e] = true
        }
      }
    
      this.cache[abs] = entries
    
      // mark and cache dir-ness
      return entries
    }
    
    GlobSync.prototype._readdirError = function (f, er) {
      // handle errors, and cache the information
      switch (er.code) {
        case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
        case 'ENOTDIR': // totally normal. means it *does* exist.
          var abs = this._makeAbs(f)
          this.cache[abs] = 'FILE'
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + ' invalid cwd ' + this.cwd)
            error.path = this.cwd
            error.code = er.code
            throw error
          }
          break
    
        case 'ENOENT': // not terribly unusual
        case 'ELOOP':
        case 'ENAMETOOLONG':
        case 'UNKNOWN':
          this.cache[this._makeAbs(f)] = false
          break
    
        default: // some unusual error.  Treat as failure.
          this.cache[this._makeAbs(f)] = false
          if (this.strict)
            throw er
          if (!this.silent)
            console.error('glob error', er)
          break
      }
    }
    
    GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {
    
      var entries = this._readdir(abs, inGlobStar)
    
      // no entries means not a dir, so it can never have matches
      // foo.txt/** doesn't match foo.txt
      if (!entries)
        return
    
      // test without the globstar, and with every child both below
      // and replacing the globstar.
      var remainWithoutGlobStar = remain.slice(1)
      var gspref = prefix ? [ prefix ] : []
      var noGlobStar = gspref.concat(remainWithoutGlobStar)
    
      // the noGlobStar pattern exits the inGlobStar state
      this._process(noGlobStar, index, false)
    
      var len = entries.length
      var isSym = this.symlinks[abs]
    
      // If it's a symlink, and we're in a globstar, then stop
      if (isSym && inGlobStar)
        return
    
      for (var i = 0; i < len; i++) {
        var e = entries[i]
        if (e.charAt(0) === '.' && !this.dot)
          continue
    
        // these two cases enter the inGlobStar state
        var instead = gspref.concat(entries[i], remainWithoutGlobStar)
        this._process(instead, index, true)
    
        var below = gspref.concat(entries[i], remain)
        this._process(below, index, true)
      }
    }
    
    GlobSync.prototype._processSimple = function (prefix, index) {
      // XXX review this.  Shouldn't it be doing the mounting etc
      // before doing stat?  kinda weird?
      var exists = this._stat(prefix)
    
      if (!this.matches[index])
        this.matches[index] = Object.create(null)
    
      // If it doesn't exist, then just mark the lack of results
      if (!exists)
        return
    
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix)
        if (prefix.charAt(0) === '/') {
          prefix = path.join(this.root, prefix)
        } else {
          prefix = path.resolve(this.root, prefix)
          if (trail)
            prefix += '/'
        }
      }
    
      if (process.platform === 'win32')
        prefix = prefix.replace(/\\/g, '/')
    
      // Mark this as a match
      this._emitMatch(index, prefix)
    }
    
    // Returns either 'DIR', 'FILE', or false
    GlobSync.prototype._stat = function (f) {
      var abs = this._makeAbs(f)
      var needDir = f.slice(-1) === '/'
    
      if (f.length > this.maxLength)
        return false
    
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs]
    
        if (Array.isArray(c))
          c = 'DIR'
    
        // It exists, but maybe not how we need it
        if (!needDir || c === 'DIR')
          return c
    
        if (needDir && c === 'FILE')
          return false
    
        // otherwise we have to stat, because maybe c=true
        // if we know it exists, but not what it is.
      }
    
      var exists
      var stat = this.statCache[abs]
      if (!stat) {
        var lstat
        try {
          lstat = fs.lstatSync(abs)
        } catch (er) {
          return false
        }
    
        if (lstat.isSymbolicLink()) {
          try {
            stat = fs.statSync(abs)
          } catch (er) {
            stat = lstat
          }
        } else {
          stat = lstat
        }
      }
    
      this.statCache[abs] = stat
    
      var c = stat.isDirectory() ? 'DIR' : 'FILE'
      this.cache[abs] = this.cache[abs] || c
    
      if (needDir && c !== 'DIR')
        return false
    
      return c
    }
    
    GlobSync.prototype._mark = function (p) {
      return common.mark(this, p)
    }
    
    GlobSync.prototype._makeAbs = function (f) {
      return common.makeAbs(this, f)
    }
    
  provide("glob/sync.js", module.exports);
}(global));

// pakmanager:glob
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Approach:
    //
    // 1. Get the minimatch set
    // 2. For each pattern in the set, PROCESS(pattern, false)
    // 3. Store matches per-set, then uniq them
    //
    // PROCESS(pattern, inGlobStar)
    // Get the first [n] items from pattern that are all strings
    // Join these together.  This is PREFIX.
    //   If there is no more remaining, then stat(PREFIX) and
    //   add to matches if it succeeds.  END.
    //
    // If inGlobStar and PREFIX is symlink and points to dir
    //   set ENTRIES = []
    // else readdir(PREFIX) as ENTRIES
    //   If fail, END
    //
    // with ENTRIES
    //   If pattern[n] is GLOBSTAR
    //     // handle the case where the globstar match is empty
    //     // by pruning it out, and testing the resulting pattern
    //     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
    //     // handle other cases.
    //     for ENTRY in ENTRIES (not dotfiles)
    //       // attach globstar + tail onto the entry
    //       // Mark that this entry is a globstar match
    //       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
    //
    //   else // not globstar
    //     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
    //       Test ENTRY against pattern[n]
    //       If fails, continue
    //       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
    //
    // Caveat:
    //   Cache all stats and readdirs results to minimize syscall.  Since all
    //   we ever care about is existence and directory-ness, we can just keep
    //   `true` for files, and [children,...] for directories, or `false` for
    //   things that don't exist.
    
    module.exports = glob
    
    var fs = require('fs')
    var rp = require('fs.realpath')
    var minimatch = require('minimatch')
    var Minimatch = minimatch.Minimatch
    var inherits = require('inherits')
    var EE = require('events').EventEmitter
    var path = require('path')
    var assert = require('assert')
    var isAbsolute = require('path-is-absolute')
    var globSync =  require('glob/sync.js')
    var common =  require('glob/common.js')
    var alphasort = common.alphasort
    var alphasorti = common.alphasorti
    var setopts = common.setopts
    var ownProp = common.ownProp
    var inflight = require('inflight')
    var util = require('util')
    var childrenIgnored = common.childrenIgnored
    var isIgnored = common.isIgnored
    
    var once = require('once')
    
    function glob (pattern, options, cb) {
      if (typeof options === 'function') cb = options, options = {}
      if (!options) options = {}
    
      if (options.sync) {
        if (cb)
          throw new TypeError('callback provided to sync glob')
        return globSync(pattern, options)
      }
    
      return new Glob(pattern, options, cb)
    }
    
    glob.sync = globSync
    var GlobSync = glob.GlobSync = globSync.GlobSync
    
    // old api surface
    glob.glob = glob
    
    function extend (origin, add) {
      if (add === null || typeof add !== 'object') {
        return origin
      }
    
      var keys = Object.keys(add)
      var i = keys.length
      while (i--) {
        origin[keys[i]] = add[keys[i]]
      }
      return origin
    }
    
    glob.hasMagic = function (pattern, options_) {
      var options = extend({}, options_)
      options.noprocess = true
    
      var g = new Glob(pattern, options)
      var set = g.minimatch.set
    
      if (!pattern)
        return false
    
      if (set.length > 1)
        return true
    
      for (var j = 0; j < set[0].length; j++) {
        if (typeof set[0][j] !== 'string')
          return true
      }
    
      return false
    }
    
    glob.Glob = Glob
    inherits(Glob, EE)
    function Glob (pattern, options, cb) {
      if (typeof options === 'function') {
        cb = options
        options = null
      }
    
      if (options && options.sync) {
        if (cb)
          throw new TypeError('callback provided to sync glob')
        return new GlobSync(pattern, options)
      }
    
      if (!(this instanceof Glob))
        return new Glob(pattern, options, cb)
    
      setopts(this, pattern, options)
      this._didRealPath = false
    
      // process each pattern in the minimatch set
      var n = this.minimatch.set.length
    
      // The matches are stored as {<filename>: true,...} so that
      // duplicates are automagically pruned.
      // Later, we do an Object.keys() on these.
      // Keep them as a list so we can fill in when nonull is set.
      this.matches = new Array(n)
    
      if (typeof cb === 'function') {
        cb = once(cb)
        this.on('error', cb)
        this.on('end', function (matches) {
          cb(null, matches)
        })
      }
    
      var self = this
      var n = this.minimatch.set.length
      this._processing = 0
      this.matches = new Array(n)
    
      this._emitQueue = []
      this._processQueue = []
      this.paused = false
    
      if (this.noprocess)
        return this
    
      if (n === 0)
        return done()
    
      var sync = true
      for (var i = 0; i < n; i ++) {
        this._process(this.minimatch.set[i], i, false, done)
      }
      sync = false
    
      function done () {
        --self._processing
        if (self._processing <= 0) {
          if (sync) {
            process.nextTick(function () {
              self._finish()
            })
          } else {
            self._finish()
          }
        }
      }
    }
    
    Glob.prototype._finish = function () {
      assert(this instanceof Glob)
      if (this.aborted)
        return
    
      if (this.realpath && !this._didRealpath)
        return this._realpath()
    
      common.finish(this)
      this.emit('end', this.found)
    }
    
    Glob.prototype._realpath = function () {
      if (this._didRealpath)
        return
    
      this._didRealpath = true
    
      var n = this.matches.length
      if (n === 0)
        return this._finish()
    
      var self = this
      for (var i = 0; i < this.matches.length; i++)
        this._realpathSet(i, next)
    
      function next () {
        if (--n === 0)
          self._finish()
      }
    }
    
    Glob.prototype._realpathSet = function (index, cb) {
      var matchset = this.matches[index]
      if (!matchset)
        return cb()
    
      var found = Object.keys(matchset)
      var self = this
      var n = found.length
    
      if (n === 0)
        return cb()
    
      var set = this.matches[index] = Object.create(null)
      found.forEach(function (p, i) {
        // If there's a problem with the stat, then it means that
        // one or more of the links in the realpath couldn't be
        // resolved.  just return the abs value in that case.
        p = self._makeAbs(p)
        rp.realpath(p, self.realpathCache, function (er, real) {
          if (!er)
            set[real] = true
          else if (er.syscall === 'stat')
            set[p] = true
          else
            self.emit('error', er) // srsly wtf right here
    
          if (--n === 0) {
            self.matches[index] = set
            cb()
          }
        })
      })
    }
    
    Glob.prototype._mark = function (p) {
      return common.mark(this, p)
    }
    
    Glob.prototype._makeAbs = function (f) {
      return common.makeAbs(this, f)
    }
    
    Glob.prototype.abort = function () {
      this.aborted = true
      this.emit('abort')
    }
    
    Glob.prototype.pause = function () {
      if (!this.paused) {
        this.paused = true
        this.emit('pause')
      }
    }
    
    Glob.prototype.resume = function () {
      if (this.paused) {
        this.emit('resume')
        this.paused = false
        if (this._emitQueue.length) {
          var eq = this._emitQueue.slice(0)
          this._emitQueue.length = 0
          for (var i = 0; i < eq.length; i ++) {
            var e = eq[i]
            this._emitMatch(e[0], e[1])
          }
        }
        if (this._processQueue.length) {
          var pq = this._processQueue.slice(0)
          this._processQueue.length = 0
          for (var i = 0; i < pq.length; i ++) {
            var p = pq[i]
            this._processing--
            this._process(p[0], p[1], p[2], p[3])
          }
        }
      }
    }
    
    Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
      assert(this instanceof Glob)
      assert(typeof cb === 'function')
    
      if (this.aborted)
        return
    
      this._processing++
      if (this.paused) {
        this._processQueue.push([pattern, index, inGlobStar, cb])
        return
      }
    
      //console.error('PROCESS %d', this._processing, pattern)
    
      // Get the first [n] parts of pattern that are all strings.
      var n = 0
      while (typeof pattern[n] === 'string') {
        n ++
      }
      // now n is the index of the first one that is *not* a string.
    
      // see if there's anything else
      var prefix
      switch (n) {
        // if not, then this is rather simple
        case pattern.length:
          this._processSimple(pattern.join('/'), index, cb)
          return
    
        case 0:
          // pattern *starts* with some non-trivial item.
          // going to readdir(cwd), but not include the prefix in matches.
          prefix = null
          break
    
        default:
          // pattern has some string bits in the front.
          // whatever it starts with, whether that's 'absolute' like /foo/bar,
          // or 'relative' like '../baz'
          prefix = pattern.slice(0, n).join('/')
          break
      }
    
      var remain = pattern.slice(n)
    
      // get the list of entries.
      var read
      if (prefix === null)
        read = '.'
      else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = '/' + prefix
        read = prefix
      } else
        read = prefix
    
      var abs = this._makeAbs(read)
    
      //if ignored, skip _processing
      if (childrenIgnored(this, read))
        return cb()
    
      var isGlobStar = remain[0] === minimatch.GLOBSTAR
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
    }
    
    Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this
      this._readdir(abs, inGlobStar, function (er, entries) {
        return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
      })
    }
    
    Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    
      // if the abs isn't a dir, then nothing can match!
      if (!entries)
        return cb()
    
      // It will only match dot entries if it starts with a dot, or if
      // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
      var pn = remain[0]
      var negate = !!this.minimatch.negate
      var rawGlob = pn._glob
      var dotOk = this.dot || rawGlob.charAt(0) === '.'
    
      var matchedEntries = []
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i]
        if (e.charAt(0) !== '.' || dotOk) {
          var m
          if (negate && !prefix) {
            m = !e.match(pn)
          } else {
            m = e.match(pn)
          }
          if (m)
            matchedEntries.push(e)
        }
      }
    
      //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)
    
      var len = matchedEntries.length
      // If there are no matched entries, then nothing matches.
      if (len === 0)
        return cb()
    
      // if this is the last remaining pattern bit, then no need for
      // an additional stat *unless* the user has specified mark or
      // stat explicitly.  We know they exist, since readdir returned
      // them.
    
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = Object.create(null)
    
        for (var i = 0; i < len; i ++) {
          var e = matchedEntries[i]
          if (prefix) {
            if (prefix !== '/')
              e = prefix + '/' + e
            else
              e = prefix + e
          }
    
          if (e.charAt(0) === '/' && !this.nomount) {
            e = path.join(this.root, e)
          }
          this._emitMatch(index, e)
        }
        // This was the last one, and no stats were needed
        return cb()
      }
    
      // now test all matched entries as stand-ins for that part
      // of the pattern.
      remain.shift()
      for (var i = 0; i < len; i ++) {
        var e = matchedEntries[i]
        var newPattern
        if (prefix) {
          if (prefix !== '/')
            e = prefix + '/' + e
          else
            e = prefix + e
        }
        this._process([e].concat(remain), index, inGlobStar, cb)
      }
      cb()
    }
    
    Glob.prototype._emitMatch = function (index, e) {
      if (this.aborted)
        return
    
      if (isIgnored(this, e))
        return
    
      if (this.paused) {
        this._emitQueue.push([index, e])
        return
      }
    
      var abs = this._makeAbs(e)
    
      if (this.mark)
        e = this._mark(e)
    
      if (this.absolute)
        e = abs
    
      if (this.matches[index][e])
        return
    
      if (this.nodir) {
        var c = this.cache[abs]
        if (c === 'DIR' || Array.isArray(c))
          return
      }
    
      this.matches[index][e] = true
    
      var st = this.statCache[abs]
      if (st)
        this.emit('stat', e, st)
    
      this.emit('match', e)
    }
    
    Glob.prototype._readdirInGlobStar = function (abs, cb) {
      if (this.aborted)
        return
    
      // follow all symlinked directories forever
      // just proceed as if this is a non-globstar situation
      if (this.follow)
        return this._readdir(abs, false, cb)
    
      var lstatkey = 'lstat\0' + abs
      var self = this
      var lstatcb = inflight(lstatkey, lstatcb_)
    
      if (lstatcb)
        fs.lstat(abs, lstatcb)
    
      function lstatcb_ (er, lstat) {
        if (er)
          return cb()
    
        var isSym = lstat.isSymbolicLink()
        self.symlinks[abs] = isSym
    
        // If it's not a symlink or a dir, then it's definitely a regular file.
        // don't bother doing a readdir in that case.
        if (!isSym && !lstat.isDirectory()) {
          self.cache[abs] = 'FILE'
          cb()
        } else
          self._readdir(abs, false, cb)
      }
    }
    
    Glob.prototype._readdir = function (abs, inGlobStar, cb) {
      if (this.aborted)
        return
    
      cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
      if (!cb)
        return
    
      //console.error('RD %j %j', +inGlobStar, abs)
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs, cb)
    
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs]
        if (!c || c === 'FILE')
          return cb()
    
        if (Array.isArray(c))
          return cb(null, c)
      }
    
      var self = this
      fs.readdir(abs, readdirCb(this, abs, cb))
    }
    
    function readdirCb (self, abs, cb) {
      return function (er, entries) {
        if (er)
          self._readdirError(abs, er, cb)
        else
          self._readdirEntries(abs, entries, cb)
      }
    }
    
    Glob.prototype._readdirEntries = function (abs, entries, cb) {
      if (this.aborted)
        return
    
      // if we haven't asked to stat everything, then just
      // assume that everything in there exists, so we can avoid
      // having to stat it a second time.
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i ++) {
          var e = entries[i]
          if (abs === '/')
            e = abs + e
          else
            e = abs + '/' + e
          this.cache[e] = true
        }
      }
    
      this.cache[abs] = entries
      return cb(null, entries)
    }
    
    Glob.prototype._readdirError = function (f, er, cb) {
      if (this.aborted)
        return
    
      // handle errors, and cache the information
      switch (er.code) {
        case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
        case 'ENOTDIR': // totally normal. means it *does* exist.
          var abs = this._makeAbs(f)
          this.cache[abs] = 'FILE'
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + ' invalid cwd ' + this.cwd)
            error.path = this.cwd
            error.code = er.code
            this.emit('error', error)
            this.abort()
          }
          break
    
        case 'ENOENT': // not terribly unusual
        case 'ELOOP':
        case 'ENAMETOOLONG':
        case 'UNKNOWN':
          this.cache[this._makeAbs(f)] = false
          break
    
        default: // some unusual error.  Treat as failure.
          this.cache[this._makeAbs(f)] = false
          if (this.strict) {
            this.emit('error', er)
            // If the error is handled, then we abort
            // if not, we threw out of here
            this.abort()
          }
          if (!this.silent)
            console.error('glob error', er)
          break
      }
    
      return cb()
    }
    
    Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this
      this._readdir(abs, inGlobStar, function (er, entries) {
        self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
      })
    }
    
    
    Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      //console.error('pgs2', prefix, remain[0], entries)
    
      // no entries means not a dir, so it can never have matches
      // foo.txt/** doesn't match foo.txt
      if (!entries)
        return cb()
    
      // test without the globstar, and with every child both below
      // and replacing the globstar.
      var remainWithoutGlobStar = remain.slice(1)
      var gspref = prefix ? [ prefix ] : []
      var noGlobStar = gspref.concat(remainWithoutGlobStar)
    
      // the noGlobStar pattern exits the inGlobStar state
      this._process(noGlobStar, index, false, cb)
    
      var isSym = this.symlinks[abs]
      var len = entries.length
    
      // If it's a symlink, and we're in a globstar, then stop
      if (isSym && inGlobStar)
        return cb()
    
      for (var i = 0; i < len; i++) {
        var e = entries[i]
        if (e.charAt(0) === '.' && !this.dot)
          continue
    
        // these two cases enter the inGlobStar state
        var instead = gspref.concat(entries[i], remainWithoutGlobStar)
        this._process(instead, index, true, cb)
    
        var below = gspref.concat(entries[i], remain)
        this._process(below, index, true, cb)
      }
    
      cb()
    }
    
    Glob.prototype._processSimple = function (prefix, index, cb) {
      // XXX review this.  Shouldn't it be doing the mounting etc
      // before doing stat?  kinda weird?
      var self = this
      this._stat(prefix, function (er, exists) {
        self._processSimple2(prefix, index, er, exists, cb)
      })
    }
    Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {
    
      //console.error('ps2', prefix, exists)
    
      if (!this.matches[index])
        this.matches[index] = Object.create(null)
    
      // If it doesn't exist, then just mark the lack of results
      if (!exists)
        return cb()
    
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix)
        if (prefix.charAt(0) === '/') {
          prefix = path.join(this.root, prefix)
        } else {
          prefix = path.resolve(this.root, prefix)
          if (trail)
            prefix += '/'
        }
      }
    
      if (process.platform === 'win32')
        prefix = prefix.replace(/\\/g, '/')
    
      // Mark this as a match
      this._emitMatch(index, prefix)
      cb()
    }
    
    // Returns either 'DIR', 'FILE', or false
    Glob.prototype._stat = function (f, cb) {
      var abs = this._makeAbs(f)
      var needDir = f.slice(-1) === '/'
    
      if (f.length > this.maxLength)
        return cb()
    
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs]
    
        if (Array.isArray(c))
          c = 'DIR'
    
        // It exists, but maybe not how we need it
        if (!needDir || c === 'DIR')
          return cb(null, c)
    
        if (needDir && c === 'FILE')
          return cb()
    
        // otherwise we have to stat, because maybe c=true
        // if we know it exists, but not what it is.
      }
    
      var exists
      var stat = this.statCache[abs]
      if (stat !== undefined) {
        if (stat === false)
          return cb(null, stat)
        else {
          var type = stat.isDirectory() ? 'DIR' : 'FILE'
          if (needDir && type === 'FILE')
            return cb()
          else
            return cb(null, type, stat)
        }
      }
    
      var self = this
      var statcb = inflight('stat\0' + abs, lstatcb_)
      if (statcb)
        fs.lstat(abs, statcb)
    
      function lstatcb_ (er, lstat) {
        if (lstat && lstat.isSymbolicLink()) {
          // If it's a symlink, then treat it as the target, unless
          // the target does not exist, then treat it as a file.
          return fs.stat(abs, function (er, stat) {
            if (er)
              self._stat2(f, abs, null, lstat, cb)
            else
              self._stat2(f, abs, er, stat, cb)
          })
        } else {
          self._stat2(f, abs, er, lstat, cb)
        }
      }
    }
    
    Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
      if (er) {
        this.statCache[abs] = false
        return cb()
      }
    
      var needDir = f.slice(-1) === '/'
      this.statCache[abs] = stat
    
      if (abs.slice(-1) === '/' && !stat.isDirectory())
        return cb(null, false, stat)
    
      var c = stat.isDirectory() ? 'DIR' : 'FILE'
      this.cache[abs] = this.cache[abs] || c
    
      if (needDir && c !== 'DIR')
        return cb()
    
      return cb(null, c, stat)
    }
    
  provide("glob", module.exports);
}(global));

// pakmanager:thenify
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    var Promise = require('any-promise')
    var assert = require('assert')
    
    module.exports = thenify
    
    /**
     * Turn async functions into promises
     *
     * @param {Function} $$__fn__$$
     * @return {Function}
     * @api public
     */
    
    function thenify($$__fn__$$) {
      assert(typeof $$__fn__$$ === 'function')
      return eval(createWrapper($$__fn__$$.name))
    }
    
    /**
     * Turn async functions into promises and backward compatible with callback
     *
     * @param {Function} $$__fn__$$
     * @return {Function}
     * @api public
     */
    
    thenify.withCallback = function ($$__fn__$$) {
      assert(typeof $$__fn__$$ === 'function')
      return eval(createWrapper($$__fn__$$.name, true))
    }
    
    function createCallback(resolve, reject) {
      return function(err, value) {
        if (err) return reject(err)
        var length = arguments.length
        if (length <= 2) return resolve(value)
        var values = new Array(length - 1)
        for (var i = 1; i < length; ++i) values[i - 1] = arguments[i]
        resolve(values)
      }
    }
    
    function createWrapper(name, withCallback) {
      name = (name || '').replace(/\s|bound(?!$)/g, '')
      withCallback = withCallback ?
        'var lastType = typeof arguments[len - 1]\n'
        + 'if (lastType === "function") return $$__fn__$$.apply(self, arguments)\n'
       : ''
    
      return '(function ' + name + '() {\n'
        + 'var self = this\n'
        + 'var len = arguments.length\n'
        + withCallback
        + 'var args = new Array(len + 1)\n'
        + 'for (var i = 0; i < len; ++i) args[i] = arguments[i]\n'
        + 'var lastIndex = i\n'
        + 'return new Promise(function (resolve, reject) {\n'
          + 'args[lastIndex] = createCallback(resolve, reject)\n'
          + '$$__fn__$$.apply(self, args)\n'
        + '})\n'
      + '})'
    }
    
  provide("thenify", module.exports);
}(global));

// pakmanager:jsonfile
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var _fs
    try {
      _fs = require('graceful-fs')
    } catch (_) {
      _fs = require('fs')
    }
    
    function readFile (file, options, callback) {
      if (callback == null) {
        callback = options
        options = {}
      }
    
      if (typeof options === 'string') {
        options = {encoding: options}
      }
    
      options = options || {}
      var fs = options.fs || _fs
    
      var shouldThrow = true
      // DO NOT USE 'passParsingErrors' THE NAME WILL CHANGE!!!, use 'throws' instead
      if ('passParsingErrors' in options) {
        shouldThrow = options.passParsingErrors
      } else if ('throws' in options) {
        shouldThrow = options.throws
      }
    
      fs.readFile(file, options, function (err, data) {
        if (err) return callback(err)
    
        data = stripBom(data)
    
        var obj
        try {
          obj = JSON.parse(data, options ? options.reviver : null)
        } catch (err2) {
          if (shouldThrow) {
            err2.message = file + ': ' + err2.message
            return callback(err2)
          } else {
            return callback(null, null)
          }
        }
    
        callback(null, obj)
      })
    }
    
    function readFileSync (file, options) {
      options = options || {}
      if (typeof options === 'string') {
        options = {encoding: options}
      }
    
      var fs = options.fs || _fs
    
      var shouldThrow = true
      // DO NOT USE 'passParsingErrors' THE NAME WILL CHANGE!!!, use 'throws' instead
      if ('passParsingErrors' in options) {
        shouldThrow = options.passParsingErrors
      } else if ('throws' in options) {
        shouldThrow = options.throws
      }
    
      var content = fs.readFileSync(file, options)
      content = stripBom(content)
    
      try {
        return JSON.parse(content, options.reviver)
      } catch (err) {
        if (shouldThrow) {
          err.message = file + ': ' + err.message
          throw err
        } else {
          return null
        }
      }
    }
    
    function writeFile (file, obj, options, callback) {
      if (callback == null) {
        callback = options
        options = {}
      }
      options = options || {}
      var fs = options.fs || _fs
    
      var spaces = typeof options === 'object' && options !== null
        ? 'spaces' in options
        ? options.spaces : this.spaces
        : this.spaces
    
      var str = ''
      try {
        str = JSON.stringify(obj, options ? options.replacer : null, spaces) + '\n'
      } catch (err) {
        if (callback) return callback(err, null)
      }
    
      fs.writeFile(file, str, options, callback)
    }
    
    function writeFileSync (file, obj, options) {
      options = options || {}
      var fs = options.fs || _fs
    
      var spaces = typeof options === 'object' && options !== null
        ? 'spaces' in options
        ? options.spaces : this.spaces
        : this.spaces
    
      var str = JSON.stringify(obj, options.replacer, spaces) + '\n'
      // not sure if fs.writeFileSync returns anything, but just in case
      return fs.writeFileSync(file, str, options)
    }
    
    function stripBom (content) {
      // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
      if (Buffer.isBuffer(content)) content = content.toString('utf8')
      content = content.replace(/^\uFEFF/, '')
      return content
    }
    
    var jsonfile = {
      spaces: null,
      readFile: readFile,
      readFileSync: readFileSync,
      writeFile: writeFile,
      writeFileSync: writeFileSync
    }
    
    module.exports = jsonfile
    
  provide("jsonfile", module.exports);
}(global));

// pakmanager:rimraf
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = rimraf
    rimraf.sync = rimrafSync
    
    var assert = require("assert")
    var path = require("path")
    var fs = require("fs")
    var glob = require("glob")
    
    var defaultGlobOpts = {
      nosort: true,
      silent: true
    }
    
    // for EMFILE handling
    var timeout = 0
    
    var isWindows = (process.platform === "win32")
    
    function defaults (options) {
      var methods = [
        'unlink',
        'chmod',
        'stat',
        'lstat',
        'rmdir',
        'readdir'
      ]
      methods.forEach(function(m) {
        options[m] = options[m] || fs[m]
        m = m + 'Sync'
        options[m] = options[m] || fs[m]
      })
    
      options.maxBusyTries = options.maxBusyTries || 3
      options.emfileWait = options.emfileWait || 1000
      if (options.glob === false) {
        options.disableGlob = true
      }
      options.disableGlob = options.disableGlob || false
      options.glob = options.glob || defaultGlobOpts
    }
    
    function rimraf (p, options, cb) {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }
    
      assert(p, 'rimraf: missing path')
      assert.equal(typeof p, 'string', 'rimraf: path should be a string')
      assert.equal(typeof cb, 'function', 'rimraf: callback function required')
      assert(options, 'rimraf: invalid options argument provided')
      assert.equal(typeof options, 'object', 'rimraf: options should be object')
    
      defaults(options)
    
      var busyTries = 0
      var errState = null
      var n = 0
    
      if (options.disableGlob || !glob.hasMagic(p))
        return afterGlob(null, [p])
    
      options.lstat(p, function (er, stat) {
        if (!er)
          return afterGlob(null, [p])
    
        glob(p, options.glob, afterGlob)
      })
    
      function next (er) {
        errState = errState || er
        if (--n === 0)
          cb(errState)
      }
    
      function afterGlob (er, results) {
        if (er)
          return cb(er)
    
        n = results.length
        if (n === 0)
          return cb()
    
        results.forEach(function (p) {
          rimraf_(p, options, function CB (er) {
            if (er) {
              if (isWindows && (er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") &&
                  busyTries < options.maxBusyTries) {
                busyTries ++
                var time = busyTries * 100
                // try again, with the same exact callback as this one.
                return setTimeout(function () {
                  rimraf_(p, options, CB)
                }, time)
              }
    
              // this one won't happen if graceful-fs is used.
              if (er.code === "EMFILE" && timeout < options.emfileWait) {
                return setTimeout(function () {
                  rimraf_(p, options, CB)
                }, timeout ++)
              }
    
              // already gone
              if (er.code === "ENOENT") er = null
            }
    
            timeout = 0
            next(er)
          })
        })
      }
    }
    
    // Two possible strategies.
    // 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
    // 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
    //
    // Both result in an extra syscall when you guess wrong.  However, there
    // are likely far more normal files in the world than directories.  This
    // is based on the assumption that a the average number of files per
    // directory is >= 1.
    //
    // If anyone ever complains about this, then I guess the strategy could
    // be made configurable somehow.  But until then, YAGNI.
    function rimraf_ (p, options, cb) {
      assert(p)
      assert(options)
      assert(typeof cb === 'function')
    
      // sunos lets the root user unlink directories, which is... weird.
      // so we have to lstat here and make sure it's not a dir.
      options.lstat(p, function (er, st) {
        if (er && er.code === "ENOENT")
          return cb(null)
    
        // Windows can EPERM on stat.  Life is suffering.
        if (er && er.code === "EPERM" && isWindows)
          fixWinEPERM(p, options, er, cb)
    
        if (st && st.isDirectory())
          return rmdir(p, options, er, cb)
    
        options.unlink(p, function (er) {
          if (er) {
            if (er.code === "ENOENT")
              return cb(null)
            if (er.code === "EPERM")
              return (isWindows)
                ? fixWinEPERM(p, options, er, cb)
                : rmdir(p, options, er, cb)
            if (er.code === "EISDIR")
              return rmdir(p, options, er, cb)
          }
          return cb(er)
        })
      })
    }
    
    function fixWinEPERM (p, options, er, cb) {
      assert(p)
      assert(options)
      assert(typeof cb === 'function')
      if (er)
        assert(er instanceof Error)
    
      options.chmod(p, 666, function (er2) {
        if (er2)
          cb(er2.code === "ENOENT" ? null : er)
        else
          options.stat(p, function(er3, stats) {
            if (er3)
              cb(er3.code === "ENOENT" ? null : er)
            else if (stats.isDirectory())
              rmdir(p, options, er, cb)
            else
              options.unlink(p, cb)
          })
      })
    }
    
    function fixWinEPERMSync (p, options, er) {
      assert(p)
      assert(options)
      if (er)
        assert(er instanceof Error)
    
      try {
        options.chmodSync(p, 666)
      } catch (er2) {
        if (er2.code === "ENOENT")
          return
        else
          throw er
      }
    
      try {
        var stats = options.statSync(p)
      } catch (er3) {
        if (er3.code === "ENOENT")
          return
        else
          throw er
      }
    
      if (stats.isDirectory())
        rmdirSync(p, options, er)
      else
        options.unlinkSync(p)
    }
    
    function rmdir (p, options, originalEr, cb) {
      assert(p)
      assert(options)
      if (originalEr)
        assert(originalEr instanceof Error)
      assert(typeof cb === 'function')
    
      // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
      // if we guessed wrong, and it's not a directory, then
      // raise the original error.
      options.rmdir(p, function (er) {
        if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
          rmkids(p, options, cb)
        else if (er && er.code === "ENOTDIR")
          cb(originalEr)
        else
          cb(er)
      })
    }
    
    function rmkids(p, options, cb) {
      assert(p)
      assert(options)
      assert(typeof cb === 'function')
    
      options.readdir(p, function (er, files) {
        if (er)
          return cb(er)
        var n = files.length
        if (n === 0)
          return options.rmdir(p, cb)
        var errState
        files.forEach(function (f) {
          rimraf(path.join(p, f), options, function (er) {
            if (errState)
              return
            if (er)
              return cb(errState = er)
            if (--n === 0)
              options.rmdir(p, cb)
          })
        })
      })
    }
    
    // this looks simpler, and is strictly *faster*, but will
    // tie up the JavaScript thread and fail on excessively
    // deep directory trees.
    function rimrafSync (p, options) {
      options = options || {}
      defaults(options)
    
      assert(p, 'rimraf: missing path')
      assert.equal(typeof p, 'string', 'rimraf: path should be a string')
      assert(options, 'rimraf: missing options')
      assert.equal(typeof options, 'object', 'rimraf: options should be object')
    
      var results
    
      if (options.disableGlob || !glob.hasMagic(p)) {
        results = [p]
      } else {
        try {
          options.lstatSync(p)
          results = [p]
        } catch (er) {
          results = glob.sync(p, options.glob)
        }
      }
    
      if (!results.length)
        return
    
      for (var i = 0; i < results.length; i++) {
        var p = results[i]
    
        try {
          var st = options.lstatSync(p)
        } catch (er) {
          if (er.code === "ENOENT")
            return
    
          // Windows can EPERM on stat.  Life is suffering.
          if (er.code === "EPERM" && isWindows)
            fixWinEPERMSync(p, options, er)
        }
    
        try {
          // sunos lets the root user unlink directories, which is... weird.
          if (st && st.isDirectory())
            rmdirSync(p, options, null)
          else
            options.unlinkSync(p)
        } catch (er) {
          if (er.code === "ENOENT")
            return
          if (er.code === "EPERM")
            return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
          if (er.code !== "EISDIR")
            throw er
          rmdirSync(p, options, er)
        }
      }
    }
    
    function rmdirSync (p, options, originalEr) {
      assert(p)
      assert(options)
      if (originalEr)
        assert(originalEr instanceof Error)
    
      try {
        options.rmdirSync(p)
      } catch (er) {
        if (er.code === "ENOENT")
          return
        if (er.code === "ENOTDIR")
          throw originalEr
        if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
          rmkidsSync(p, options)
      }
    }
    
    function rmkidsSync (p, options) {
      assert(p)
      assert(options)
      options.readdirSync(p).forEach(function (f) {
        rimrafSync(path.join(p, f), options)
      })
      options.rmdirSync(p, options)
    }
    
  provide("rimraf", module.exports);
}(global));

// pakmanager:object-assign
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  'use strict';
    /* eslint-disable no-unused-vars */
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    
    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}
    
    	return Object(val);
    }
    
    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}
    
    		// Detect buggy property enumeration order in older V8 versions.
    
    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}
    
    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}
    
    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}
    
    		return true;
    	} catch (e) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }
    
    module.exports = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;
    
    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);
    
    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}
    
    		if (Object.getOwnPropertySymbols) {
    			symbols = Object.getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}
    
    	return to;
    };
    
  provide("object-assign", module.exports);
}(global));

// pakmanager:thenify-all
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    var thenify = require('thenify')
    
    module.exports = thenifyAll
    thenifyAll.withCallback = withCallback
    thenifyAll.thenify = thenify
    
    /**
     * Promisifies all the selected functions in an object.
     *
     * @param {Object} source the source object for the async functions
     * @param {Object} [destination] the destination to set all the promisified methods
     * @param {Array} [methods] an array of method names of `source`
     * @return {Object}
     * @api public
     */
    
    function thenifyAll(source, destination, methods) {
      return promisifyAll(source, destination, methods, thenify)
    }
    
    /**
     * Promisifies all the selected functions in an object and backward compatible with callback.
     *
     * @param {Object} source the source object for the async functions
     * @param {Object} [destination] the destination to set all the promisified methods
     * @param {Array} [methods] an array of method names of `source`
     * @return {Object}
     * @api public
     */
    
    function withCallback(source, destination, methods) {
      return promisifyAll(source, destination, methods, thenify.withCallback)
    }
    
    function promisifyAll(source, destination, methods, promisify) {
      if (!destination) {
        destination = {};
        methods = Object.keys(source)
      }
    
      if (Array.isArray(destination)) {
        methods = destination
        destination = {}
      }
    
      if (!methods) {
        methods = Object.keys(source)
      }
    
      if (typeof source === 'function') destination = promisify(source)
    
      methods.forEach(function (name) {
        // promisify only if it's a function
        if (typeof source[name] === 'function') destination[name] = promisify(source[name])
      })
    
      // proxy the rest
      Object.keys(source).forEach(function (name) {
        if (deprecated(source, name)) return
        if (destination[name]) return
        destination[name] = source[name]
      })
    
      return destination
    }
    
    function deprecated(source, name) {
      var desc = Object.getOwnPropertyDescriptor(source, name)
      if (!desc || !desc.get) return false
      if (desc.get.name === 'deprecated') return true
      return false
    }
    
  provide("thenify-all", module.exports);
}(global));

// pakmanager:mz/fs
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    var Promise = require('any-promise')
    var fs
    try {
      fs = require('graceful-fs')
    } catch(err) {
      fs = require('fs')
    }
    
    var api = [
      'rename',
      'ftruncate',
      'chown',
      'fchown',
      'lchown',
      'chmod',
      'fchmod',
      'stat',
      'lstat',
      'fstat',
      'link',
      'symlink',
      'readlink',
      'realpath',
      'unlink',
      'rmdir',
      'mkdir',
      'readdir',
      'close',
      'open',
      'utimes',
      'futimes',
      'fsync',
      'write',
      'read',
      'readFile',
      'writeFile',
      'appendFile',
      'truncate',
    ]
    
    typeof fs.access === 'function' && api.push('access')
    
    require('thenify-all').withCallback(fs, exports, api)
    
    exports.exists = function (filename, callback) {
      // callback
      if (typeof callback === 'function') {
        return fs.stat(filename, function (err) {
          callback(null, !err);
        })
      }
      // or promise
      return new Promise(function (resolve) {
        fs.stat(filename, function (err) {
          resolve(!err)
        })
      })
    }
    
  provide("mz/fs", module.exports);
}(global));

// pakmanager:mz/dns
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    require('thenify-all').withCallback(
      require('dns'),
      exports, [
        'lookup',
        'resolve',
        'resolve4',
        'resolve6',
        'resolveMx',
        'resolveTxt',
        'resolveSrv',
        'resolveNs',
        'resolveCname',
        'reverse',
      ]
    )
    
  provide("mz/dns", module.exports);
}(global));

// pakmanager:mz/zlib
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    require('thenify-all').withCallback(
      require('zlib'),
      exports, [
        'deflate',
        'deflateRaw',
        'gzip',
        'gunzip',
        'inflate',
        'inflateRaw',
        'unzip',
      ]
    )
    
  provide("mz/zlib", module.exports);
}(global));

// pakmanager:mz/crypto
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    require('thenify-all').withCallback(
      require('crypto'),
      exports, [
        'pbkdf2',
        'randomBytes',
        'pseudoRandomBytes',
      ]
    )
    
  provide("mz/crypto", module.exports);
}(global));

// pakmanager:mz/readline
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var readline = require('readline')
    var Promise = require('any-promise')
    var objectAssign = require('object-assign')
    var Interface = readline.Interface
    
    function wrapCompleter (completer) {
      if (completer.length === 2) return completer
    
      return function (line, cb) {
        var result = completer(line)
    
        if (typeof result.then !== 'function') {
          return cb(null, result)
        }
    
        result.catch(cb).then(function (result) {
          process.nextTick(function () { cb(null, result) })
        })
      }
    }
    
    function InterfaceAsPromised (input, output, completer, terminal) {
      if (arguments.length === 1) {
        var options = input
    
        if (typeof options.completer === 'function') {
          options = objectAssign({}, options, {
            completer: wrapCompleter(options.completer)
          })
        }
    
        Interface.call(this, options)
      } else {
        if (typeof completer === 'function') {
          completer = wrapCompleter(completer)
        }
    
        Interface.call(this, input, output, completer, terminal)
      }
    }
    
    InterfaceAsPromised.prototype = Object.create(Interface.prototype)
    
    InterfaceAsPromised.prototype.question = function (question, callback) {
      if (typeof callback === 'function') {
        return Interface.prototype.question.call(this, question, callback)
      }
    
      var self = this
      return new Promise(function (resolve) {
        Interface.prototype.question.call(self, question, resolve)
      })
    }
    
    objectAssign(exports, readline, {
      Interface: InterfaceAsPromised,
      createInterface: function (input, output, completer, terminal) {
        if (arguments.length === 1) {
          return new InterfaceAsPromised(input)
        }
    
        return new InterfaceAsPromised(input, output, completer, terminal)
      }
    })
    
  provide("mz/readline", module.exports);
}(global));

// pakmanager:mz/child_process
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
    require('thenify-all').withCallback(
      require('child_process'),
      exports, [
        'exec',
        'execFile',
      ]
    )
    
  provide("mz/child_process", module.exports);
}(global));

// pakmanager:mz
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports = {
      fs:  require('mz/fs'),
      dns:  require('mz/dns'),
      zlib:  require('mz/zlib'),
      crypto:  require('mz/crypto'),
      readline:  require('mz/readline'),
      child_process:  require('mz/child_process')
    }
    
  provide("mz", module.exports);
}(global));

// pakmanager:fs-promise
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  'use strict'
    
    var mzfs = require('mz/fs')
    var fsExtra = require('fs-extra')
    var Promise = require('any-promise')
    var thenifyAll = require('thenify-all')
    var slice = Array.prototype.slice
    
    // thenify-all for all fs-extra that make sense to be promises
    var fsExtraKeys = [
      'copy',
      'emptyDir',
      'ensureFile',
      'ensureDir',
      'ensureLink',
      'ensureSymlink',
      'mkdirs',
      'move',
      'outputFile',
      'outputJson',
      'readJson',
      'remove',
      'writeJson',
      // aliases
      'createFile',
      'createLink',
      'createSymlink',
      'emptydir',
      'mkdirp',
      'readJSON',
      'outputJSON',
      'writeJSON'
    ]
    thenifyAll.withCallback(fsExtra, exports, fsExtraKeys)
    
    // Delegate all normal fs to mz/fs
    // (this overwrites anything proxies directly above)
    var mzKeys = [
      'rename',
      'ftruncate',
      'chown',
      'fchown',
      'lchown',
      'chmod',
      'fchmod',
      'stat',
      'lstat',
      'fstat',
      'link',
      'symlink',
      'readlink',
      'realpath',
      'unlink',
      'rmdir',
      'mkdir',
      'readdir',
      'close',
      'open',
      'utimes',
      'futimes',
      'fsync',
      'write',
      'read',
      'readFile',
      'writeFile',
      'appendFile',
      'access',
      'exists'
    ]
    mzKeys.forEach(function(key){
      exports[key] = mzfs[key]
    })
    
    
    // Resolve fs-extra streams as Promise for array
    var streamKeys = [
      'walk'
    ]
    
    streamKeys.forEach(function(key){
      exports[key] = function(){
        var func = fsExtra[key]
        var args = slice.call(arguments)
    
        return new Promise(function(resolve, reject){
          var stream = func.apply(fsExtra, args)
          var items = []
    
          stream
            .on('data', function(item){
              items.push(item)
            })
            .on('end', function(){
              resolve(items)
            })
            .on('error', function(error){
              reject(error)
            })
        })
      }
    })
    
  provide("fs-promise", module.exports);
}(global));

// pakmanager:io-extra/io
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  const file = require('./file');
    const directory = require('./directory');
    
    module.exports = {
        file,
        directory,
    };
    
  provide("io-extra/io", module.exports);
}(global));

// pakmanager:io-extra
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  const io =  require('io-extra/io');
    
    module.exports = io;
    
  provide("io-extra", module.exports);
}(global));