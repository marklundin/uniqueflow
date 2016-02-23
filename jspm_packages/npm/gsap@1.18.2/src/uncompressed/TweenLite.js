/* */ 
(function(process) {
  (function(window, moduleName) {
    "use strict";
    var _globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
    if (_globals.TweenLite) {
      return;
    }
    var _namespace = function(ns) {
      var a = ns.split("."),
          p = _globals,
          i;
      for (i = 0; i < a.length; i++) {
        p[a[i]] = p = p[a[i]] || {};
      }
      return p;
    },
        gs = _namespace("com.greensock"),
        _tinyNum = 0.0000000001,
        _slice = function(a) {
          var b = [],
              l = a.length,
              i;
          for (i = 0; i !== l; b.push(a[i++])) {}
          return b;
        },
        _emptyFunc = function() {},
        _isArray = (function() {
          var toString = Object.prototype.toString,
              array = toString.call([]);
          return function(obj) {
            return obj != null && (obj instanceof Array || (typeof(obj) === "object" && !!obj.push && toString.call(obj) === array));
          };
        }()),
        a,
        i,
        p,
        _ticker,
        _tickerActive,
        _defLookup = {},
        Definition = function(ns, dependencies, func, global) {
          this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : [];
          _defLookup[ns] = this;
          this.gsClass = null;
          this.func = func;
          var _classes = [];
          this.check = function(init) {
            var i = dependencies.length,
                missing = i,
                cur,
                a,
                n,
                cl,
                hasModule;
            while (--i > -1) {
              if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
                _classes[i] = cur.gsClass;
                missing--;
              } else if (init) {
                cur.sc.push(this);
              }
            }
            if (missing === 0 && func) {
              a = ("com.greensock." + ns).split(".");
              n = a.pop();
              cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);
              if (global) {
                _globals[n] = cl;
                hasModule = (typeof(module) !== "undefined" && module.exports);
                if (!hasModule && typeof(define) === "function" && define.amd) {
                  define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").pop(), [], function() {
                    return cl;
                  });
                } else if (ns === moduleName && hasModule) {
                  module.exports = cl;
                }
              }
              for (i = 0; i < this.sc.length; i++) {
                this.sc[i].check();
              }
            }
          };
          this.check(true);
        },
        _gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
          return new Definition(ns, dependencies, func, global);
        },
        _class = gs._class = function(ns, func, global) {
          func = func || function() {};
          _gsDefine(ns, [], function() {
            return func;
          }, global);
          return func;
        };
    _gsDefine.globals = _globals;
    var _baseParams = [0, 0, 1, 1],
        _blankArray = [],
        Ease = _class("easing.Ease", function(func, extraParams, type, power) {
          this._func = func;
          this._type = type || 0;
          this._power = power || 0;
          this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
        }, true),
        _easeMap = Ease.map = {},
        _easeReg = Ease.register = function(ease, names, types, create) {
          var na = names.split(","),
              i = na.length,
              ta = (types || "easeIn,easeOut,easeInOut").split(","),
              e,
              name,
              j,
              type;
          while (--i > -1) {
            name = na[i];
            e = create ? _class("easing." + name, null, true) : gs.easing[name] || {};
            j = ta.length;
            while (--j > -1) {
              type = ta[j];
              _easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
            }
          }
        };
    p = Ease.prototype;
    p._calcEnd = false;
    p.getRatio = function(p) {
      if (this._func) {
        this._params[0] = p;
        return this._func.apply(null, this._params);
      }
      var t = this._type,
          pw = this._power,
          r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
      if (pw === 1) {
        r *= r;
      } else if (pw === 2) {
        r *= r * r;
      } else if (pw === 3) {
        r *= r * r * r;
      } else if (pw === 4) {
        r *= r * r * r * r;
      }
      return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
    };
    a = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"];
    i = a.length;
    while (--i > -1) {
      p = a[i] + ",Power" + i;
      _easeReg(new Ease(null, null, 1, i), p, "easeOut", true);
      _easeReg(new Ease(null, null, 2, i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
      _easeReg(new Ease(null, null, 3, i), p, "easeInOut");
    }
    _easeMap.linear = gs.easing.Linear.easeIn;
    _easeMap.swing = gs.easing.Quad.easeInOut;
    var EventDispatcher = _class("events.EventDispatcher", function(target) {
      this._listeners = {};
      this._eventTarget = target || this;
    });
    p = EventDispatcher.prototype;
    p.addEventListener = function(type, callback, scope, useParam, priority) {
      priority = priority || 0;
      var list = this._listeners[type],
          index = 0,
          listener,
          i;
      if (list == null) {
        this._listeners[type] = list = [];
      }
      i = list.length;
      while (--i > -1) {
        listener = list[i];
        if (listener.c === callback && listener.s === scope) {
          list.splice(i, 1);
        } else if (index === 0 && listener.pr < priority) {
          index = i + 1;
        }
      }
      list.splice(index, 0, {
        c: callback,
        s: scope,
        up: useParam,
        pr: priority
      });
      if (this === _ticker && !_tickerActive) {
        _ticker.wake();
      }
    };
    p.removeEventListener = function(type, callback) {
      var list = this._listeners[type],
          i;
      if (list) {
        i = list.length;
        while (--i > -1) {
          if (list[i].c === callback) {
            list.splice(i, 1);
            return;
          }
        }
      }
    };
    p.dispatchEvent = function(type) {
      var list = this._listeners[type],
          i,
          t,
          listener;
      if (list) {
        i = list.length;
        t = this._eventTarget;
        while (--i > -1) {
          listener = list[i];
          if (listener) {
            if (listener.up) {
              listener.c.call(listener.s || t, {
                type: type,
                target: t
              });
            } else {
              listener.c.call(listener.s || t);
            }
          }
        }
      }
    };
    var _reqAnimFrame = window.requestAnimationFrame,
        _cancelAnimFrame = window.cancelAnimationFrame,
        _getTime = Date.now || function() {
          return new Date().getTime();
        },
        _lastUpdate = _getTime();
    a = ["ms", "moz", "webkit", "o"];
    i = a.length;
    while (--i > -1 && !_reqAnimFrame) {
      _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
      _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
    }
    _class("Ticker", function(fps, useRAF) {
      var _self = this,
          _startTime = _getTime(),
          _useRAF = (useRAF !== false && _reqAnimFrame) ? "auto" : false,
          _lagThreshold = 500,
          _adjustedLag = 33,
          _tickWord = "tick",
          _fps,
          _req,
          _id,
          _gap,
          _nextTime,
          _tick = function(manual) {
            var elapsed = _getTime() - _lastUpdate,
                overlap,
                dispatch;
            if (elapsed > _lagThreshold) {
              _startTime += elapsed - _adjustedLag;
            }
            _lastUpdate += elapsed;
            _self.time = (_lastUpdate - _startTime) / 1000;
            overlap = _self.time - _nextTime;
            if (!_fps || overlap > 0 || manual === true) {
              _self.frame++;
              _nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
              dispatch = true;
            }
            if (manual !== true) {
              _id = _req(_tick);
            }
            if (dispatch) {
              _self.dispatchEvent(_tickWord);
            }
          };
      EventDispatcher.call(_self);
      _self.time = _self.frame = 0;
      _self.tick = function() {
        _tick(true);
      };
      _self.lagSmoothing = function(threshold, adjustedLag) {
        _lagThreshold = threshold || (1 / _tinyNum);
        _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
      };
      _self.sleep = function() {
        if (_id == null) {
          return;
        }
        if (!_useRAF || !_cancelAnimFrame) {
          clearTimeout(_id);
        } else {
          _cancelAnimFrame(_id);
        }
        _req = _emptyFunc;
        _id = null;
        if (_self === _ticker) {
          _tickerActive = false;
        }
      };
      _self.wake = function(seamless) {
        if (_id !== null) {
          _self.sleep();
        } else if (seamless) {
          _startTime += -_lastUpdate + (_lastUpdate = _getTime());
        } else if (_self.frame > 10) {
          _lastUpdate = _getTime() - _lagThreshold + 5;
        }
        _req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) {
          return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0);
        } : _reqAnimFrame;
        if (_self === _ticker) {
          _tickerActive = true;
        }
        _tick(2);
      };
      _self.fps = function(value) {
        if (!arguments.length) {
          return _fps;
        }
        _fps = value;
        _gap = 1 / (_fps || 60);
        _nextTime = this.time + _gap;
        _self.wake();
      };
      _self.useRAF = function(value) {
        if (!arguments.length) {
          return _useRAF;
        }
        _self.sleep();
        _useRAF = value;
        _self.fps(_fps);
      };
      _self.fps(fps);
      setTimeout(function() {
        if (_useRAF === "auto" && _self.frame < 5 && document.visibilityState !== "hidden") {
          _self.useRAF(false);
        }
      }, 1500);
    });
    p = gs.Ticker.prototype = new gs.events.EventDispatcher();
    p.constructor = gs.Ticker;
    var Animation = _class("core.Animation", function(duration, vars) {
      this.vars = vars = vars || {};
      this._duration = this._totalDuration = duration || 0;
      this._delay = Number(vars.delay) || 0;
      this._timeScale = 1;
      this._active = (vars.immediateRender === true);
      this.data = vars.data;
      this._reversed = (vars.reversed === true);
      if (!_rootTimeline) {
        return;
      }
      if (!_tickerActive) {
        _ticker.wake();
      }
      var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
      tl.add(this, tl._time);
      if (this.vars.paused) {
        this.paused(true);
      }
    });
    _ticker = Animation.ticker = new gs.Ticker();
    p = Animation.prototype;
    p._dirty = p._gc = p._initted = p._paused = false;
    p._totalTime = p._time = 0;
    p._rawPrevTime = -1;
    p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
    p._paused = false;
    var _checkTimeout = function() {
      if (_tickerActive && _getTime() - _lastUpdate > 2000) {
        _ticker.wake();
      }
      setTimeout(_checkTimeout, 2000);
    };
    _checkTimeout();
    p.play = function(from, suppressEvents) {
      if (from != null) {
        this.seek(from, suppressEvents);
      }
      return this.reversed(false).paused(false);
    };
    p.pause = function(atTime, suppressEvents) {
      if (atTime != null) {
        this.seek(atTime, suppressEvents);
      }
      return this.paused(true);
    };
    p.resume = function(from, suppressEvents) {
      if (from != null) {
        this.seek(from, suppressEvents);
      }
      return this.paused(false);
    };
    p.seek = function(time, suppressEvents) {
      return this.totalTime(Number(time), suppressEvents !== false);
    };
    p.restart = function(includeDelay, suppressEvents) {
      return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
    };
    p.reverse = function(from, suppressEvents) {
      if (from != null) {
        this.seek((from || this.totalDuration()), suppressEvents);
      }
      return this.reversed(true).paused(false);
    };
    p.render = function(time, suppressEvents, force) {};
    p.invalidate = function() {
      this._time = this._totalTime = 0;
      this._initted = this._gc = false;
      this._rawPrevTime = -1;
      if (this._gc || !this.timeline) {
        this._enabled(true);
      }
      return this;
    };
    p.isActive = function() {
      var tl = this._timeline,
          startTime = this._startTime,
          rawTime;
      return (!tl || (!this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale));
    };
    p._enabled = function(enabled, ignoreTimeline) {
      if (!_tickerActive) {
        _ticker.wake();
      }
      this._gc = !enabled;
      this._active = this.isActive();
      if (ignoreTimeline !== true) {
        if (enabled && !this.timeline) {
          this._timeline.add(this, this._startTime - this._delay);
        } else if (!enabled && this.timeline) {
          this._timeline._remove(this, true);
        }
      }
      return false;
    };
    p._kill = function(vars, target) {
      return this._enabled(false, false);
    };
    p.kill = function(vars, target) {
      this._kill(vars, target);
      return this;
    };
    p._uncache = function(includeSelf) {
      var tween = includeSelf ? this : this.timeline;
      while (tween) {
        tween._dirty = true;
        tween = tween.timeline;
      }
      return this;
    };
    p._swapSelfInParams = function(params) {
      var i = params.length,
          copy = params.concat();
      while (--i > -1) {
        if (params[i] === "{self}") {
          copy[i] = this;
        }
      }
      return copy;
    };
    p._callback = function(type) {
      var v = this.vars;
      v[type].apply(v[type + "Scope"] || v.callbackScope || this, v[type + "Params"] || _blankArray);
    };
    p.eventCallback = function(type, callback, params, scope) {
      if ((type || "").substr(0, 2) === "on") {
        var v = this.vars;
        if (arguments.length === 1) {
          return v[type];
        }
        if (callback == null) {
          delete v[type];
        } else {
          v[type] = callback;
          v[type + "Params"] = (_isArray(params) && params.join("").indexOf("{self}") !== -1) ? this._swapSelfInParams(params) : params;
          v[type + "Scope"] = scope;
        }
        if (type === "onUpdate") {
          this._onUpdate = callback;
        }
      }
      return this;
    };
    p.delay = function(value) {
      if (!arguments.length) {
        return this._delay;
      }
      if (this._timeline.smoothChildTiming) {
        this.startTime(this._startTime + value - this._delay);
      }
      this._delay = value;
      return this;
    };
    p.duration = function(value) {
      if (!arguments.length) {
        this._dirty = false;
        return this._duration;
      }
      this._duration = this._totalDuration = value;
      this._uncache(true);
      if (this._timeline.smoothChildTiming)
        if (this._time > 0)
          if (this._time < this._duration)
            if (value !== 0) {
              this.totalTime(this._totalTime * (value / this._duration), true);
            }
      return this;
    };
    p.totalDuration = function(value) {
      this._dirty = false;
      return (!arguments.length) ? this._totalDuration : this.duration(value);
    };
    p.time = function(value, suppressEvents) {
      if (!arguments.length) {
        return this._time;
      }
      if (this._dirty) {
        this.totalDuration();
      }
      return this.totalTime((value > this._duration) ? this._duration : value, suppressEvents);
    };
    p.totalTime = function(time, suppressEvents, uncapped) {
      if (!_tickerActive) {
        _ticker.wake();
      }
      if (!arguments.length) {
        return this._totalTime;
      }
      if (this._timeline) {
        if (time < 0 && !uncapped) {
          time += this.totalDuration();
        }
        if (this._timeline.smoothChildTiming) {
          if (this._dirty) {
            this.totalDuration();
          }
          var totalDuration = this._totalDuration,
              tl = this._timeline;
          if (time > totalDuration && !uncapped) {
            time = totalDuration;
          }
          this._startTime = (this._paused ? this._pauseTime : tl._time) - ((!this._reversed ? time : totalDuration - time) / this._timeScale);
          if (!tl._dirty) {
            this._uncache(false);
          }
          if (tl._timeline) {
            while (tl._timeline) {
              if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
                tl.totalTime(tl._totalTime, true);
              }
              tl = tl._timeline;
            }
          }
        }
        if (this._gc) {
          this._enabled(true, false);
        }
        if (this._totalTime !== time || this._duration === 0) {
          if (_lazyTweens.length) {
            _lazyRender();
          }
          this.render(time, suppressEvents, false);
          if (_lazyTweens.length) {
            _lazyRender();
          }
        }
      }
      return this;
    };
    p.progress = p.totalProgress = function(value, suppressEvents) {
      var duration = this.duration();
      return (!arguments.length) ? (duration ? this._time / duration : this.ratio) : this.totalTime(duration * value, suppressEvents);
    };
    p.startTime = function(value) {
      if (!arguments.length) {
        return this._startTime;
      }
      if (value !== this._startTime) {
        this._startTime = value;
        if (this.timeline)
          if (this.timeline._sortChildren) {
            this.timeline.add(this, value - this._delay);
          }
      }
      return this;
    };
    p.endTime = function(includeRepeats) {
      return this._startTime + ((includeRepeats != false) ? this.totalDuration() : this.duration()) / this._timeScale;
    };
    p.timeScale = function(value) {
      if (!arguments.length) {
        return this._timeScale;
      }
      value = value || _tinyNum;
      if (this._timeline && this._timeline.smoothChildTiming) {
        var pauseTime = this._pauseTime,
            t = (pauseTime || pauseTime === 0) ? pauseTime : this._timeline.totalTime();
        this._startTime = t - ((t - this._startTime) * this._timeScale / value);
      }
      this._timeScale = value;
      return this._uncache(false);
    };
    p.reversed = function(value) {
      if (!arguments.length) {
        return this._reversed;
      }
      if (value != this._reversed) {
        this._reversed = value;
        this.totalTime(((this._timeline && !this._timeline.smoothChildTiming) ? this.totalDuration() - this._totalTime : this._totalTime), true);
      }
      return this;
    };
    p.paused = function(value) {
      if (!arguments.length) {
        return this._paused;
      }
      var tl = this._timeline,
          raw,
          elapsed;
      if (value != this._paused)
        if (tl) {
          if (!_tickerActive && !value) {
            _ticker.wake();
          }
          raw = tl.rawTime();
          elapsed = raw - this._pauseTime;
          if (!value && tl.smoothChildTiming) {
            this._startTime += elapsed;
            this._uncache(false);
          }
          this._pauseTime = value ? raw : null;
          this._paused = value;
          this._active = this.isActive();
          if (!value && elapsed !== 0 && this._initted && this.duration()) {
            raw = tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale;
            this.render(raw, (raw === this._totalTime), true);
          }
        }
      if (this._gc && !value) {
        this._enabled(true, false);
      }
      return this;
    };
    var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
      Animation.call(this, 0, vars);
      this.autoRemoveChildren = this.smoothChildTiming = true;
    });
    p = SimpleTimeline.prototype = new Animation();
    p.constructor = SimpleTimeline;
    p.kill()._gc = false;
    p._first = p._last = p._recent = null;
    p._sortChildren = false;
    p.add = p.insert = function(child, position, align, stagger) {
      var prevTween,
          st;
      child._startTime = Number(position || 0) + child._delay;
      if (child._paused)
        if (this !== child._timeline) {
          child._pauseTime = child._startTime + ((this.rawTime() - child._startTime) / child._timeScale);
        }
      if (child.timeline) {
        child.timeline._remove(child, true);
      }
      child.timeline = child._timeline = this;
      if (child._gc) {
        child._enabled(true, true);
      }
      prevTween = this._last;
      if (this._sortChildren) {
        st = child._startTime;
        while (prevTween && prevTween._startTime > st) {
          prevTween = prevTween._prev;
        }
      }
      if (prevTween) {
        child._next = prevTween._next;
        prevTween._next = child;
      } else {
        child._next = this._first;
        this._first = child;
      }
      if (child._next) {
        child._next._prev = child;
      } else {
        this._last = child;
      }
      child._prev = prevTween;
      this._recent = child;
      if (this._timeline) {
        this._uncache(true);
      }
      return this;
    };
    p._remove = function(tween, skipDisable) {
      if (tween.timeline === this) {
        if (!skipDisable) {
          tween._enabled(false, true);
        }
        if (tween._prev) {
          tween._prev._next = tween._next;
        } else if (this._first === tween) {
          this._first = tween._next;
        }
        if (tween._next) {
          tween._next._prev = tween._prev;
        } else if (this._last === tween) {
          this._last = tween._prev;
        }
        tween._next = tween._prev = tween.timeline = null;
        if (tween === this._recent) {
          this._recent = this._last;
        }
        if (this._timeline) {
          this._uncache(true);
        }
      }
      return this;
    };
    p.render = function(time, suppressEvents, force) {
      var tween = this._first,
          next;
      this._totalTime = this._time = this._rawPrevTime = time;
      while (tween) {
        next = tween._next;
        if (tween._active || (time >= tween._startTime && !tween._paused)) {
          if (!tween._reversed) {
            tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
          } else {
            tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
          }
        }
        tween = next;
      }
    };
    p.rawTime = function() {
      if (!_tickerActive) {
        _ticker.wake();
      }
      return this._totalTime;
    };
    var TweenLite = _class("TweenLite", function(target, duration, vars) {
      Animation.call(this, duration, vars);
      this.render = TweenLite.prototype.render;
      if (target == null) {
        throw "Cannot tween a null target.";
      }
      this.target = target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
      var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
          overwrite = this.vars.overwrite,
          i,
          targ,
          targets;
      this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];
      if ((isSelector || target instanceof Array || (target.push && _isArray(target))) && typeof(target[0]) !== "number") {
        this._targets = targets = _slice(target);
        this._propLookup = [];
        this._siblings = [];
        for (i = 0; i < targets.length; i++) {
          targ = targets[i];
          if (!targ) {
            targets.splice(i--, 1);
            continue;
          } else if (typeof(targ) === "string") {
            targ = targets[i--] = TweenLite.selector(targ);
            if (typeof(targ) === "string") {
              targets.splice(i + 1, 1);
            }
            continue;
          } else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) {
            targets.splice(i--, 1);
            this._targets = targets = targets.concat(_slice(targ));
            continue;
          }
          this._siblings[i] = _register(targ, this, false);
          if (overwrite === 1)
            if (this._siblings[i].length > 1) {
              _applyOverwrite(targ, this, null, 1, this._siblings[i]);
            }
        }
      } else {
        this._propLookup = {};
        this._siblings = _register(target, this, false);
        if (overwrite === 1)
          if (this._siblings.length > 1) {
            _applyOverwrite(target, this, null, 1, this._siblings);
          }
      }
      if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
        this._time = -_tinyNum;
        this.render(-this._delay);
      }
    }, true),
        _isSelector = function(v) {
          return (v && v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType)));
        },
        _autoCSS = function(vars, target) {
          var css = {},
              p;
          for (p in vars) {
            if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) {
              css[p] = vars[p];
              delete vars[p];
            }
          }
          vars.css = css;
        };
    p = TweenLite.prototype = new Animation();
    p.constructor = TweenLite;
    p.kill()._gc = false;
    p.ratio = 0;
    p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
    p._notifyPluginsOfEnabled = p._lazy = false;
    TweenLite.version = "1.18.2";
    TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
    TweenLite.defaultOverwrite = "auto";
    TweenLite.ticker = _ticker;
    TweenLite.autoSleep = 120;
    TweenLite.lagSmoothing = function(threshold, adjustedLag) {
      _ticker.lagSmoothing(threshold, adjustedLag);
    };
    TweenLite.selector = window.$ || window.jQuery || function(e) {
      var selector = window.$ || window.jQuery;
      if (selector) {
        TweenLite.selector = selector;
        return selector(e);
      }
      return (typeof(document) === "undefined") ? e : (document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e));
    };
    var _lazyTweens = [],
        _lazyLookup = {},
        _numbersExp = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
        _setRatio = function(v) {
          var pt = this._firstPT,
              min = 0.000001,
              val;
          while (pt) {
            val = !pt.blob ? pt.c * v + pt.s : v ? this.join("") : this.start;
            if (pt.r) {
              val = Math.round(val);
            } else if (val < min)
              if (val > -min) {
                val = 0;
              }
            if (!pt.f) {
              pt.t[pt.p] = val;
            } else if (pt.fp) {
              pt.t[pt.p](pt.fp, val);
            } else {
              pt.t[pt.p](val);
            }
            pt = pt._next;
          }
        },
        _blobDif = function(start, end, filter, pt) {
          var a = [start, end],
              charIndex = 0,
              s = "",
              color = 0,
              startNums,
              endNums,
              num,
              i,
              l,
              nonNumbers,
              currentNum;
          a.start = start;
          if (filter) {
            filter(a);
            start = a[0];
            end = a[1];
          }
          a.length = 0;
          startNums = start.match(_numbersExp) || [];
          endNums = end.match(_numbersExp) || [];
          if (pt) {
            pt._next = null;
            pt.blob = 1;
            a._firstPT = pt;
          }
          l = endNums.length;
          for (i = 0; i < l; i++) {
            currentNum = endNums[i];
            nonNumbers = end.substr(charIndex, end.indexOf(currentNum, charIndex) - charIndex);
            s += (nonNumbers || !i) ? nonNumbers : ",";
            charIndex += nonNumbers.length;
            if (color) {
              color = (color + 1) % 5;
            } else if (nonNumbers.substr(-5) === "rgba(") {
              color = 1;
            }
            if (currentNum === startNums[i] || startNums.length <= i) {
              s += currentNum;
            } else {
              if (s) {
                a.push(s);
                s = "";
              }
              num = parseFloat(startNums[i]);
              a.push(num);
              a._firstPT = {
                _next: a._firstPT,
                t: a,
                p: a.length - 1,
                s: num,
                c: ((currentNum.charAt(1) === "=") ? parseInt(currentNum.charAt(0) + "1", 10) * parseFloat(currentNum.substr(2)) : (parseFloat(currentNum) - num)) || 0,
                f: 0,
                r: (color && color < 4)
              };
            }
            charIndex += currentNum.length;
          }
          s += end.substr(charIndex);
          if (s) {
            a.push(s);
          }
          a.setRatio = _setRatio;
          return a;
        },
        _addPropTween = function(target, prop, start, end, overwriteProp, round, funcParam, stringFilter) {
          var s = (start === "get") ? target[prop] : start,
              type = typeof(target[prop]),
              isRelative = (typeof(end) === "string" && end.charAt(1) === "="),
              pt = {
                t: target,
                p: prop,
                s: s,
                f: (type === "function"),
                pg: 0,
                n: overwriteProp || prop,
                r: round,
                pr: 0,
                c: isRelative ? parseInt(end.charAt(0) + "1", 10) * parseFloat(end.substr(2)) : (parseFloat(end) - s) || 0
              },
              blob,
              getterName;
          if (type !== "number") {
            if (type === "function" && start === "get") {
              getterName = ((prop.indexOf("set") || typeof(target["get" + prop.substr(3)]) !== "function") ? prop : "get" + prop.substr(3));
              pt.s = s = funcParam ? target[getterName](funcParam) : target[getterName]();
            }
            if (typeof(s) === "string" && (funcParam || isNaN(s))) {
              pt.fp = funcParam;
              blob = _blobDif(s, end, stringFilter || TweenLite.defaultStringFilter, pt);
              pt = {
                t: blob,
                p: "setRatio",
                s: 0,
                c: 1,
                f: 2,
                pg: 0,
                n: overwriteProp || prop,
                pr: 0
              };
            } else if (!isRelative) {
              pt.s = parseFloat(s);
              pt.c = (parseFloat(end) - pt.s) || 0;
            }
          }
          if (pt.c) {
            if ((pt._next = this._firstPT)) {
              pt._next._prev = pt;
            }
            this._firstPT = pt;
            return pt;
          }
        },
        _internals = TweenLite._internals = {
          isArray: _isArray,
          isSelector: _isSelector,
          lazyTweens: _lazyTweens,
          blobDif: _blobDif
        },
        _plugins = TweenLite._plugins = {},
        _tweenLookup = _internals.tweenLookup = {},
        _tweenLookupNum = 0,
        _reservedProps = _internals.reservedProps = {
          ease: 1,
          delay: 1,
          overwrite: 1,
          onComplete: 1,
          onCompleteParams: 1,
          onCompleteScope: 1,
          useFrames: 1,
          runBackwards: 1,
          startAt: 1,
          onUpdate: 1,
          onUpdateParams: 1,
          onUpdateScope: 1,
          onStart: 1,
          onStartParams: 1,
          onStartScope: 1,
          onReverseComplete: 1,
          onReverseCompleteParams: 1,
          onReverseCompleteScope: 1,
          onRepeat: 1,
          onRepeatParams: 1,
          onRepeatScope: 1,
          easeParams: 1,
          yoyo: 1,
          immediateRender: 1,
          repeat: 1,
          repeatDelay: 1,
          data: 1,
          paused: 1,
          reversed: 1,
          autoCSS: 1,
          lazy: 1,
          onOverwrite: 1,
          callbackScope: 1,
          stringFilter: 1
        },
        _overwriteLookup = {
          none: 0,
          all: 1,
          auto: 2,
          concurrent: 3,
          allOnStart: 4,
          preexisting: 5,
          "true": 1,
          "false": 0
        },
        _rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(),
        _rootTimeline = Animation._rootTimeline = new SimpleTimeline(),
        _nextGCFrame = 30,
        _lazyRender = _internals.lazyRender = function() {
          var i = _lazyTweens.length,
              tween;
          _lazyLookup = {};
          while (--i > -1) {
            tween = _lazyTweens[i];
            if (tween && tween._lazy !== false) {
              tween.render(tween._lazy[0], tween._lazy[1], true);
              tween._lazy = false;
            }
          }
          _lazyTweens.length = 0;
        };
    _rootTimeline._startTime = _ticker.time;
    _rootFramesTimeline._startTime = _ticker.frame;
    _rootTimeline._active = _rootFramesTimeline._active = true;
    setTimeout(_lazyRender, 1);
    Animation._updateRoot = TweenLite.render = function() {
      var i,
          a,
          p;
      if (_lazyTweens.length) {
        _lazyRender();
      }
      _rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
      _rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
      if (_lazyTweens.length) {
        _lazyRender();
      }
      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame = _ticker.frame + (parseInt(TweenLite.autoSleep, 10) || 120);
        for (p in _tweenLookup) {
          a = _tweenLookup[p].tweens;
          i = a.length;
          while (--i > -1) {
            if (a[i]._gc) {
              a.splice(i, 1);
            }
          }
          if (a.length === 0) {
            delete _tweenLookup[p];
          }
        }
        p = _rootTimeline._first;
        if (!p || p._paused)
          if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
            while (p && p._paused) {
              p = p._next;
            }
            if (!p) {
              _ticker.sleep();
            }
          }
      }
    };
    _ticker.addEventListener("tick", Animation._updateRoot);
    var _register = function(target, tween, scrub) {
      var id = target._gsTweenID,
          a,
          i;
      if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
        _tweenLookup[id] = {
          target: target,
          tweens: []
        };
      }
      if (tween) {
        a = _tweenLookup[id].tweens;
        a[(i = a.length)] = tween;
        if (scrub) {
          while (--i > -1) {
            if (a[i] === tween) {
              a.splice(i, 1);
            }
          }
        }
      }
      return _tweenLookup[id].tweens;
    },
        _onOverwrite = function(overwrittenTween, overwritingTween, target, killedProps) {
          var func = overwrittenTween.vars.onOverwrite,
              r1,
              r2;
          if (func) {
            r1 = func(overwrittenTween, overwritingTween, target, killedProps);
          }
          func = TweenLite.onOverwrite;
          if (func) {
            r2 = func(overwrittenTween, overwritingTween, target, killedProps);
          }
          return (r1 !== false && r2 !== false);
        },
        _applyOverwrite = function(target, tween, props, mode, siblings) {
          var i,
              changed,
              curTween,
              l;
          if (mode === 1 || mode >= 4) {
            l = siblings.length;
            for (i = 0; i < l; i++) {
              if ((curTween = siblings[i]) !== tween) {
                if (!curTween._gc) {
                  if (curTween._kill(null, target, tween)) {
                    changed = true;
                  }
                }
              } else if (mode === 5) {
                break;
              }
            }
            return changed;
          }
          var startTime = tween._startTime + _tinyNum,
              overlaps = [],
              oCount = 0,
              zeroDur = (tween._duration === 0),
              globalStart;
          i = siblings.length;
          while (--i > -1) {
            if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {} else if (curTween._timeline !== tween._timeline) {
              globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
              if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
                overlaps[oCount++] = curTween;
              }
            } else if (curTween._startTime <= startTime)
              if (curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime)
                if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
                  overlaps[oCount++] = curTween;
                }
          }
          i = oCount;
          while (--i > -1) {
            curTween = overlaps[i];
            if (mode === 2)
              if (curTween._kill(props, target, tween)) {
                changed = true;
              }
            if (mode !== 2 || (!curTween._firstPT && curTween._initted)) {
              if (mode !== 2 && !_onOverwrite(curTween, tween)) {
                continue;
              }
              if (curTween._enabled(false, false)) {
                changed = true;
              }
            }
          }
          return changed;
        },
        _checkOverlap = function(tween, reference, zeroDur) {
          var tl = tween._timeline,
              ts = tl._timeScale,
              t = tween._startTime;
          while (tl._timeline) {
            t += tl._startTime;
            ts *= tl._timeScale;
            if (tl._paused) {
              return -100;
            }
            tl = tl._timeline;
          }
          t /= ts;
          return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!tween._initted && t - reference < 2 * _tinyNum)) ? _tinyNum : ((t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum) ? 0 : t - reference - _tinyNum;
        };
    p._init = function() {
      var v = this.vars,
          op = this._overwrittenProps,
          dur = this._duration,
          immediate = !!v.immediateRender,
          ease = v.ease,
          i,
          initPlugins,
          pt,
          p,
          startVars;
      if (v.startAt) {
        if (this._startAt) {
          this._startAt.render(-1, true);
          this._startAt.kill();
        }
        startVars = {};
        for (p in v.startAt) {
          startVars[p] = v.startAt[p];
        }
        startVars.overwrite = false;
        startVars.immediateRender = true;
        startVars.lazy = (immediate && v.lazy !== false);
        startVars.startAt = startVars.delay = null;
        this._startAt = TweenLite.to(this.target, 0, startVars);
        if (immediate) {
          if (this._time > 0) {
            this._startAt = null;
          } else if (dur !== 0) {
            return;
          }
        }
      } else if (v.runBackwards && dur !== 0) {
        if (this._startAt) {
          this._startAt.render(-1, true);
          this._startAt.kill();
          this._startAt = null;
        } else {
          if (this._time !== 0) {
            immediate = false;
          }
          pt = {};
          for (p in v) {
            if (!_reservedProps[p] || p === "autoCSS") {
              pt[p] = v[p];
            }
          }
          pt.overwrite = 0;
          pt.data = "isFromStart";
          pt.lazy = (immediate && v.lazy !== false);
          pt.immediateRender = immediate;
          this._startAt = TweenLite.to(this.target, 0, pt);
          if (!immediate) {
            this._startAt._init();
            this._startAt._enabled(false);
            if (this.vars.immediateRender) {
              this._startAt = null;
            }
          } else if (this._time === 0) {
            return;
          }
        }
      }
      this._ease = ease = (!ease) ? TweenLite.defaultEase : (ease instanceof Ease) ? ease : (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
      if (v.easeParams instanceof Array && ease.config) {
        this._ease = ease.config.apply(ease, v.easeParams);
      }
      this._easeType = this._ease._type;
      this._easePower = this._ease._power;
      this._firstPT = null;
      if (this._targets) {
        i = this._targets.length;
        while (--i > -1) {
          if (this._initProps(this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null))) {
            initPlugins = true;
          }
        }
      } else {
        initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
      }
      if (initPlugins) {
        TweenLite._onPluginEvent("_onInitAllProps", this);
      }
      if (op)
        if (!this._firstPT)
          if (typeof(this.target) !== "function") {
            this._enabled(false, false);
          }
      if (v.runBackwards) {
        pt = this._firstPT;
        while (pt) {
          pt.s += pt.c;
          pt.c = -pt.c;
          pt = pt._next;
        }
      }
      this._onUpdate = v.onUpdate;
      this._initted = true;
    };
    p._initProps = function(target, propLookup, siblings, overwrittenProps) {
      var p,
          i,
          initPlugins,
          plugin,
          pt,
          v;
      if (target == null) {
        return false;
      }
      if (_lazyLookup[target._gsTweenID]) {
        _lazyRender();
      }
      if (!this.vars.css)
        if (target.style)
          if (target !== window && target.nodeType)
            if (_plugins.css)
              if (this.vars.autoCSS !== false) {
                _autoCSS(this.vars, target);
              }
      for (p in this.vars) {
        v = this.vars[p];
        if (_reservedProps[p]) {
          if (v)
            if ((v instanceof Array) || (v.push && _isArray(v)))
              if (v.join("").indexOf("{self}") !== -1) {
                this.vars[p] = v = this._swapSelfInParams(v, this);
              }
        } else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
          this._firstPT = pt = {
            _next: this._firstPT,
            t: plugin,
            p: "setRatio",
            s: 0,
            c: 1,
            f: 1,
            n: p,
            pg: 1,
            pr: plugin._priority
          };
          i = plugin._overwriteProps.length;
          while (--i > -1) {
            propLookup[plugin._overwriteProps[i]] = this._firstPT;
          }
          if (plugin._priority || plugin._onInitAllProps) {
            initPlugins = true;
          }
          if (plugin._onDisable || plugin._onEnable) {
            this._notifyPluginsOfEnabled = true;
          }
          if (pt._next) {
            pt._next._prev = pt;
          }
        } else {
          propLookup[p] = _addPropTween.call(this, target, p, "get", v, p, 0, null, this.vars.stringFilter);
        }
      }
      if (overwrittenProps)
        if (this._kill(overwrittenProps, target)) {
          return this._initProps(target, propLookup, siblings, overwrittenProps);
        }
      if (this._overwrite > 1)
        if (this._firstPT)
          if (siblings.length > 1)
            if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
              this._kill(propLookup, target);
              return this._initProps(target, propLookup, siblings, overwrittenProps);
            }
      if (this._firstPT)
        if ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration)) {
          _lazyLookup[target._gsTweenID] = true;
        }
      return initPlugins;
    };
    p.render = function(time, suppressEvents, force) {
      var prevTime = this._time,
          duration = this._duration,
          prevRawPrevTime = this._rawPrevTime,
          isComplete,
          callback,
          pt,
          rawPrevTime;
      if (time >= duration - 0.0000001) {
        this._totalTime = this._time = duration;
        this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
        if (!this._reversed) {
          isComplete = true;
          callback = "onComplete";
          force = (force || this._timeline.autoRemoveChildren);
        }
        if (duration === 0)
          if (this._initted || !this.vars.lazy || force) {
            if (this._startTime === this._timeline._duration) {
              time = 0;
            }
            if (prevRawPrevTime < 0 || (time <= 0 && time >= -0.0000001) || (prevRawPrevTime === _tinyNum && this.data !== "isPause"))
              if (prevRawPrevTime !== time) {
                force = true;
                if (prevRawPrevTime > _tinyNum) {
                  callback = "onReverseComplete";
                }
              }
            this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum;
          }
      } else if (time < 0.0000001) {
        this._totalTime = this._time = 0;
        this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
        if (prevTime !== 0 || (duration === 0 && prevRawPrevTime > 0)) {
          callback = "onReverseComplete";
          isComplete = this._reversed;
        }
        if (time < 0) {
          this._active = false;
          if (duration === 0)
            if (this._initted || !this.vars.lazy || force) {
              if (prevRawPrevTime >= 0 && !(prevRawPrevTime === _tinyNum && this.data === "isPause")) {
                force = true;
              }
              this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum;
            }
        }
        if (!this._initted) {
          force = true;
        }
      } else {
        this._totalTime = this._time = time;
        if (this._easeType) {
          var r = time / duration,
              type = this._easeType,
              pow = this._easePower;
          if (type === 1 || (type === 3 && r >= 0.5)) {
            r = 1 - r;
          }
          if (type === 3) {
            r *= 2;
          }
          if (pow === 1) {
            r *= r;
          } else if (pow === 2) {
            r *= r * r;
          } else if (pow === 3) {
            r *= r * r * r;
          } else if (pow === 4) {
            r *= r * r * r * r;
          }
          if (type === 1) {
            this.ratio = 1 - r;
          } else if (type === 2) {
            this.ratio = r;
          } else if (time / duration < 0.5) {
            this.ratio = r / 2;
          } else {
            this.ratio = 1 - (r / 2);
          }
        } else {
          this.ratio = this._ease.getRatio(time / duration);
        }
      }
      if (this._time === prevTime && !force) {
        return;
      } else if (!this._initted) {
        this._init();
        if (!this._initted || this._gc) {
          return;
        } else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) {
          this._time = this._totalTime = prevTime;
          this._rawPrevTime = prevRawPrevTime;
          _lazyTweens.push(this);
          this._lazy = [time, suppressEvents];
          return;
        }
        if (this._time && !isComplete) {
          this.ratio = this._ease.getRatio(this._time / duration);
        } else if (isComplete && this._ease._calcEnd) {
          this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
        }
      }
      if (this._lazy !== false) {
        this._lazy = false;
      }
      if (!this._active)
        if (!this._paused && this._time !== prevTime && time >= 0) {
          this._active = true;
        }
      if (prevTime === 0) {
        if (this._startAt) {
          if (time >= 0) {
            this._startAt.render(time, suppressEvents, force);
          } else if (!callback) {
            callback = "_dummyGS";
          }
        }
        if (this.vars.onStart)
          if (this._time !== 0 || duration === 0)
            if (!suppressEvents) {
              this._callback("onStart");
            }
      }
      pt = this._firstPT;
      while (pt) {
        if (pt.f) {
          pt.t[pt.p](pt.c * this.ratio + pt.s);
        } else {
          pt.t[pt.p] = pt.c * this.ratio + pt.s;
        }
        pt = pt._next;
      }
      if (this._onUpdate) {
        if (time < 0)
          if (this._startAt && time !== -0.0001) {
            this._startAt.render(time, suppressEvents, force);
          }
        if (!suppressEvents)
          if (this._time !== prevTime || isComplete) {
            this._callback("onUpdate");
          }
      }
      if (callback)
        if (!this._gc || force) {
          if (time < 0 && this._startAt && !this._onUpdate && time !== -0.0001) {
            this._startAt.render(time, suppressEvents, force);
          }
          if (isComplete) {
            if (this._timeline.autoRemoveChildren) {
              this._enabled(false, false);
            }
            this._active = false;
          }
          if (!suppressEvents && this.vars[callback]) {
            this._callback(callback);
          }
          if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) {
            this._rawPrevTime = 0;
          }
        }
    };
    p._kill = function(vars, target, overwritingTween) {
      if (vars === "all") {
        vars = null;
      }
      if (vars == null)
        if (target == null || target === this.target) {
          this._lazy = false;
          return this._enabled(false, false);
        }
      target = (typeof(target) !== "string") ? (target || this._targets || this.target) : TweenLite.selector(target) || target;
      var simultaneousOverwrite = (overwritingTween && this._time && overwritingTween._startTime === this._startTime && this._timeline === overwritingTween._timeline),
          i,
          overwrittenProps,
          p,
          pt,
          propLookup,
          changed,
          killProps,
          record,
          killed;
      if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
        i = target.length;
        while (--i > -1) {
          if (this._kill(vars, target[i], overwritingTween)) {
            changed = true;
          }
        }
      } else {
        if (this._targets) {
          i = this._targets.length;
          while (--i > -1) {
            if (target === this._targets[i]) {
              propLookup = this._propLookup[i] || {};
              this._overwrittenProps = this._overwrittenProps || [];
              overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
              break;
            }
          }
        } else if (target !== this.target) {
          return false;
        } else {
          propLookup = this._propLookup;
          overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
        }
        if (propLookup) {
          killProps = vars || propLookup;
          record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof(vars) !== "object" || !vars._tempKill));
          if (overwritingTween && (TweenLite.onOverwrite || this.vars.onOverwrite)) {
            for (p in killProps) {
              if (propLookup[p]) {
                if (!killed) {
                  killed = [];
                }
                killed.push(p);
              }
            }
            if ((killed || !vars) && !_onOverwrite(this, overwritingTween, target, killed)) {
              return false;
            }
          }
          for (p in killProps) {
            if ((pt = propLookup[p])) {
              if (simultaneousOverwrite) {
                if (pt.f) {
                  pt.t[pt.p](pt.s);
                } else {
                  pt.t[pt.p] = pt.s;
                }
                changed = true;
              }
              if (pt.pg && pt.t._kill(killProps)) {
                changed = true;
              }
              if (!pt.pg || pt.t._overwriteProps.length === 0) {
                if (pt._prev) {
                  pt._prev._next = pt._next;
                } else if (pt === this._firstPT) {
                  this._firstPT = pt._next;
                }
                if (pt._next) {
                  pt._next._prev = pt._prev;
                }
                pt._next = pt._prev = null;
              }
              delete propLookup[p];
            }
            if (record) {
              overwrittenProps[p] = 1;
            }
          }
          if (!this._firstPT && this._initted) {
            this._enabled(false, false);
          }
        }
      }
      return changed;
    };
    p.invalidate = function() {
      if (this._notifyPluginsOfEnabled) {
        TweenLite._onPluginEvent("_onDisable", this);
      }
      this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null;
      this._notifyPluginsOfEnabled = this._active = this._lazy = false;
      this._propLookup = (this._targets) ? {} : [];
      Animation.prototype.invalidate.call(this);
      if (this.vars.immediateRender) {
        this._time = -_tinyNum;
        this.render(-this._delay);
      }
      return this;
    };
    p._enabled = function(enabled, ignoreTimeline) {
      if (!_tickerActive) {
        _ticker.wake();
      }
      if (enabled && this._gc) {
        var targets = this._targets,
            i;
        if (targets) {
          i = targets.length;
          while (--i > -1) {
            this._siblings[i] = _register(targets[i], this, true);
          }
        } else {
          this._siblings = _register(this.target, this, true);
        }
      }
      Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
      if (this._notifyPluginsOfEnabled)
        if (this._firstPT) {
          return TweenLite._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
        }
      return false;
    };
    TweenLite.to = function(target, duration, vars) {
      return new TweenLite(target, duration, vars);
    };
    TweenLite.from = function(target, duration, vars) {
      vars.runBackwards = true;
      vars.immediateRender = (vars.immediateRender != false);
      return new TweenLite(target, duration, vars);
    };
    TweenLite.fromTo = function(target, duration, fromVars, toVars) {
      toVars.startAt = fromVars;
      toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
      return new TweenLite(target, duration, toVars);
    };
    TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
      return new TweenLite(callback, 0, {
        delay: delay,
        onComplete: callback,
        onCompleteParams: params,
        callbackScope: scope,
        onReverseComplete: callback,
        onReverseCompleteParams: params,
        immediateRender: false,
        lazy: false,
        useFrames: useFrames,
        overwrite: 0
      });
    };
    TweenLite.set = function(target, vars) {
      return new TweenLite(target, 0, vars);
    };
    TweenLite.getTweensOf = function(target, onlyActive) {
      if (target == null) {
        return [];
      }
      target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
      var i,
          a,
          j,
          t;
      if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
        i = target.length;
        a = [];
        while (--i > -1) {
          a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
        }
        i = a.length;
        while (--i > -1) {
          t = a[i];
          j = i;
          while (--j > -1) {
            if (t === a[j]) {
              a.splice(i, 1);
            }
          }
        }
      } else {
        a = _register(target).concat();
        i = a.length;
        while (--i > -1) {
          if (a[i]._gc || (onlyActive && !a[i].isActive())) {
            a.splice(i, 1);
          }
        }
      }
      return a;
    };
    TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, onlyActive, vars) {
      if (typeof(onlyActive) === "object") {
        vars = onlyActive;
        onlyActive = false;
      }
      var a = TweenLite.getTweensOf(target, onlyActive),
          i = a.length;
      while (--i > -1) {
        a[i]._kill(vars, target);
      }
    };
    var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
      this._overwriteProps = (props || "").split(",");
      this._propName = this._overwriteProps[0];
      this._priority = priority || 0;
      this._super = TweenPlugin.prototype;
    }, true);
    p = TweenPlugin.prototype;
    TweenPlugin.version = "1.18.0";
    TweenPlugin.API = 2;
    p._firstPT = null;
    p._addTween = _addPropTween;
    p.setRatio = _setRatio;
    p._kill = function(lookup) {
      var a = this._overwriteProps,
          pt = this._firstPT,
          i;
      if (lookup[this._propName] != null) {
        this._overwriteProps = [];
      } else {
        i = a.length;
        while (--i > -1) {
          if (lookup[a[i]] != null) {
            a.splice(i, 1);
          }
        }
      }
      while (pt) {
        if (lookup[pt.n] != null) {
          if (pt._next) {
            pt._next._prev = pt._prev;
          }
          if (pt._prev) {
            pt._prev._next = pt._next;
            pt._prev = null;
          } else if (this._firstPT === pt) {
            this._firstPT = pt._next;
          }
        }
        pt = pt._next;
      }
      return false;
    };
    p._roundProps = function(lookup, value) {
      var pt = this._firstPT;
      while (pt) {
        if (lookup[this._propName] || (pt.n != null && lookup[pt.n.split(this._propName + "_").join("")])) {
          pt.r = value;
        }
        pt = pt._next;
      }
    };
    TweenLite._onPluginEvent = function(type, tween) {
      var pt = tween._firstPT,
          changed,
          pt2,
          first,
          last,
          next;
      if (type === "_onInitAllProps") {
        while (pt) {
          next = pt._next;
          pt2 = first;
          while (pt2 && pt2.pr > pt.pr) {
            pt2 = pt2._next;
          }
          if ((pt._prev = pt2 ? pt2._prev : last)) {
            pt._prev._next = pt;
          } else {
            first = pt;
          }
          if ((pt._next = pt2)) {
            pt2._prev = pt;
          } else {
            last = pt;
          }
          pt = next;
        }
        pt = tween._firstPT = first;
      }
      while (pt) {
        if (pt.pg)
          if (typeof(pt.t[type]) === "function")
            if (pt.t[type]()) {
              changed = true;
            }
        pt = pt._next;
      }
      return changed;
    };
    TweenPlugin.activate = function(plugins) {
      var i = plugins.length;
      while (--i > -1) {
        if (plugins[i].API === TweenPlugin.API) {
          _plugins[(new plugins[i]())._propName] = plugins[i];
        }
      }
      return true;
    };
    _gsDefine.plugin = function(config) {
      if (!config || !config.propName || !config.init || !config.API) {
        throw "illegal plugin definition.";
      }
      var propName = config.propName,
          priority = config.priority || 0,
          overwriteProps = config.overwriteProps,
          map = {
            init: "_onInitTween",
            set: "setRatio",
            kill: "_kill",
            round: "_roundProps",
            initAll: "_onInitAllProps"
          },
          Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin", function() {
            TweenPlugin.call(this, propName, priority);
            this._overwriteProps = overwriteProps || [];
          }, (config.global === true)),
          p = Plugin.prototype = new TweenPlugin(propName),
          prop;
      p.constructor = Plugin;
      Plugin.API = config.API;
      for (prop in map) {
        if (typeof(config[prop]) === "function") {
          p[map[prop]] = config[prop];
        }
      }
      Plugin.version = config.version;
      TweenPlugin.activate([Plugin]);
      return Plugin;
    };
    a = window._gsQueue;
    if (a) {
      for (i = 0; i < a.length; i++) {
        a[i]();
      }
      for (p in _defLookup) {
        if (!_defLookup[p].func) {
          window.console.log("GSAP encountered missing dependency: com.greensock." + p);
        }
      }
    }
    _tickerActive = false;
  })((typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window, "TweenLite");
})(require('process'));
