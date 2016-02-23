/* */ 
"format cjs";
var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
  "use strict";
  _gsScope._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function(Animation, SimpleTimeline, TweenLite) {
    var TimelineLite = function(vars) {
      SimpleTimeline.call(this, vars);
      this._labels = {};
      this.autoRemoveChildren = (this.vars.autoRemoveChildren === true);
      this.smoothChildTiming = (this.vars.smoothChildTiming === true);
      this._sortChildren = true;
      this._onUpdate = this.vars.onUpdate;
      var v = this.vars,
          val,
          p;
      for (p in v) {
        val = v[p];
        if (_isArray(val))
          if (val.join("").indexOf("{self}") !== -1) {
            v[p] = this._swapSelfInParams(val);
          }
      }
      if (_isArray(v.tweens)) {
        this.add(v.tweens, 0, v.align, v.stagger);
      }
    },
        _tinyNum = 0.0000000001,
        TweenLiteInternals = TweenLite._internals,
        _internals = TimelineLite._internals = {},
        _isSelector = TweenLiteInternals.isSelector,
        _isArray = TweenLiteInternals.isArray,
        _lazyTweens = TweenLiteInternals.lazyTweens,
        _lazyRender = TweenLiteInternals.lazyRender,
        _globals = _gsScope._gsDefine.globals,
        _copy = function(vars) {
          var copy = {},
              p;
          for (p in vars) {
            copy[p] = vars[p];
          }
          return copy;
        },
        _applyCycle = function(vars, targets, i) {
          var alt = vars.cycle,
              p,
              val;
          for (p in alt) {
            val = alt[p];
            vars[p] = (typeof(val) === "function") ? val.call(targets[i], i) : val[i % val.length];
          }
          delete vars.cycle;
        },
        _pauseCallback = _internals.pauseCallback = function() {},
        _slice = function(a) {
          var b = [],
              l = a.length,
              i;
          for (i = 0; i !== l; b.push(a[i++]))
            ;
          return b;
        },
        p = TimelineLite.prototype = new SimpleTimeline();
    TimelineLite.version = "1.18.2";
    p.constructor = TimelineLite;
    p.kill()._gc = p._forcingPlayhead = p._hasPause = false;
    p.to = function(target, duration, vars, position) {
      var Engine = (vars.repeat && _globals.TweenMax) || TweenLite;
      return duration ? this.add(new Engine(target, duration, vars), position) : this.set(target, vars, position);
    };
    p.from = function(target, duration, vars, position) {
      return this.add(((vars.repeat && _globals.TweenMax) || TweenLite).from(target, duration, vars), position);
    };
    p.fromTo = function(target, duration, fromVars, toVars, position) {
      var Engine = (toVars.repeat && _globals.TweenMax) || TweenLite;
      return duration ? this.add(Engine.fromTo(target, duration, fromVars, toVars), position) : this.set(target, toVars, position);
    };
    p.staggerTo = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
      var tl = new TimelineLite({
        onComplete: onCompleteAll,
        onCompleteParams: onCompleteAllParams,
        callbackScope: onCompleteAllScope,
        smoothChildTiming: this.smoothChildTiming
      }),
          cycle = vars.cycle,
          copy,
          i;
      if (typeof(targets) === "string") {
        targets = TweenLite.selector(targets) || targets;
      }
      targets = targets || [];
      if (_isSelector(targets)) {
        targets = _slice(targets);
      }
      stagger = stagger || 0;
      if (stagger < 0) {
        targets = _slice(targets);
        targets.reverse();
        stagger *= -1;
      }
      for (i = 0; i < targets.length; i++) {
        copy = _copy(vars);
        if (copy.startAt) {
          copy.startAt = _copy(copy.startAt);
          if (copy.startAt.cycle) {
            _applyCycle(copy.startAt, targets, i);
          }
        }
        if (cycle) {
          _applyCycle(copy, targets, i);
        }
        tl.to(targets[i], duration, copy, i * stagger);
      }
      return this.add(tl, position);
    };
    p.staggerFrom = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
      vars.immediateRender = (vars.immediateRender != false);
      vars.runBackwards = true;
      return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
    };
    p.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
      toVars.startAt = fromVars;
      toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
      return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
    };
    p.call = function(callback, params, scope, position) {
      return this.add(TweenLite.delayedCall(0, callback, params, scope), position);
    };
    p.set = function(target, vars, position) {
      position = this._parseTimeOrLabel(position, 0, true);
      if (vars.immediateRender == null) {
        vars.immediateRender = (position === this._time && !this._paused);
      }
      return this.add(new TweenLite(target, 0, vars), position);
    };
    TimelineLite.exportRoot = function(vars, ignoreDelayedCalls) {
      vars = vars || {};
      if (vars.smoothChildTiming == null) {
        vars.smoothChildTiming = true;
      }
      var tl = new TimelineLite(vars),
          root = tl._timeline,
          tween,
          next;
      if (ignoreDelayedCalls == null) {
        ignoreDelayedCalls = true;
      }
      root._remove(tl, true);
      tl._startTime = 0;
      tl._rawPrevTime = tl._time = tl._totalTime = root._time;
      tween = root._first;
      while (tween) {
        next = tween._next;
        if (!ignoreDelayedCalls || !(tween instanceof TweenLite && tween.target === tween.vars.onComplete)) {
          tl.add(tween, tween._startTime - tween._delay);
        }
        tween = next;
      }
      root.add(tl, 0);
      return tl;
    };
    p.add = function(value, position, align, stagger) {
      var curTime,
          l,
          i,
          child,
          tl,
          beforeRawTime;
      if (typeof(position) !== "number") {
        position = this._parseTimeOrLabel(position, 0, true, value);
      }
      if (!(value instanceof Animation)) {
        if ((value instanceof Array) || (value && value.push && _isArray(value))) {
          align = align || "normal";
          stagger = stagger || 0;
          curTime = position;
          l = value.length;
          for (i = 0; i < l; i++) {
            if (_isArray(child = value[i])) {
              child = new TimelineLite({tweens: child});
            }
            this.add(child, curTime);
            if (typeof(child) !== "string" && typeof(child) !== "function") {
              if (align === "sequence") {
                curTime = child._startTime + (child.totalDuration() / child._timeScale);
              } else if (align === "start") {
                child._startTime -= child.delay();
              }
            }
            curTime += stagger;
          }
          return this._uncache(true);
        } else if (typeof(value) === "string") {
          return this.addLabel(value, position);
        } else if (typeof(value) === "function") {
          value = TweenLite.delayedCall(0, value);
        } else {
          throw ("Cannot add " + value + " into the timeline; it is not a tween, timeline, function, or string.");
        }
      }
      SimpleTimeline.prototype.add.call(this, value, position);
      if (this._gc || this._time === this._duration)
        if (!this._paused)
          if (this._duration < this.duration()) {
            tl = this;
            beforeRawTime = (tl.rawTime() > value._startTime);
            while (tl._timeline) {
              if (beforeRawTime && tl._timeline.smoothChildTiming) {
                tl.totalTime(tl._totalTime, true);
              } else if (tl._gc) {
                tl._enabled(true, false);
              }
              tl = tl._timeline;
            }
          }
      return this;
    };
    p.remove = function(value) {
      if (value instanceof Animation) {
        this._remove(value, false);
        var tl = value._timeline = value.vars.useFrames ? Animation._rootFramesTimeline : Animation._rootTimeline;
        value._startTime = (value._paused ? value._pauseTime : tl._time) - ((!value._reversed ? value._totalTime : value.totalDuration() - value._totalTime) / value._timeScale);
        return this;
      } else if (value instanceof Array || (value && value.push && _isArray(value))) {
        var i = value.length;
        while (--i > -1) {
          this.remove(value[i]);
        }
        return this;
      } else if (typeof(value) === "string") {
        return this.removeLabel(value);
      }
      return this.kill(null, value);
    };
    p._remove = function(tween, skipDisable) {
      SimpleTimeline.prototype._remove.call(this, tween, skipDisable);
      var last = this._last;
      if (!last) {
        this._time = this._totalTime = this._duration = this._totalDuration = 0;
      } else if (this._time > last._startTime + last._totalDuration / last._timeScale) {
        this._time = this.duration();
        this._totalTime = this._totalDuration;
      }
      return this;
    };
    p.append = function(value, offsetOrLabel) {
      return this.add(value, this._parseTimeOrLabel(null, offsetOrLabel, true, value));
    };
    p.insert = p.insertMultiple = function(value, position, align, stagger) {
      return this.add(value, position || 0, align, stagger);
    };
    p.appendMultiple = function(tweens, offsetOrLabel, align, stagger) {
      return this.add(tweens, this._parseTimeOrLabel(null, offsetOrLabel, true, tweens), align, stagger);
    };
    p.addLabel = function(label, position) {
      this._labels[label] = this._parseTimeOrLabel(position);
      return this;
    };
    p.addPause = function(position, callback, params, scope) {
      var t = TweenLite.delayedCall(0, _pauseCallback, params, scope || this);
      t.vars.onComplete = t.vars.onReverseComplete = callback;
      t.data = "isPause";
      this._hasPause = true;
      return this.add(t, position);
    };
    p.removeLabel = function(label) {
      delete this._labels[label];
      return this;
    };
    p.getLabelTime = function(label) {
      return (this._labels[label] != null) ? this._labels[label] : -1;
    };
    p._parseTimeOrLabel = function(timeOrLabel, offsetOrLabel, appendIfAbsent, ignore) {
      var i;
      if (ignore instanceof Animation && ignore.timeline === this) {
        this.remove(ignore);
      } else if (ignore && ((ignore instanceof Array) || (ignore.push && _isArray(ignore)))) {
        i = ignore.length;
        while (--i > -1) {
          if (ignore[i] instanceof Animation && ignore[i].timeline === this) {
            this.remove(ignore[i]);
          }
        }
      }
      if (typeof(offsetOrLabel) === "string") {
        return this._parseTimeOrLabel(offsetOrLabel, (appendIfAbsent && typeof(timeOrLabel) === "number" && this._labels[offsetOrLabel] == null) ? timeOrLabel - this.duration() : 0, appendIfAbsent);
      }
      offsetOrLabel = offsetOrLabel || 0;
      if (typeof(timeOrLabel) === "string" && (isNaN(timeOrLabel) || this._labels[timeOrLabel] != null)) {
        i = timeOrLabel.indexOf("=");
        if (i === -1) {
          if (this._labels[timeOrLabel] == null) {
            return appendIfAbsent ? (this._labels[timeOrLabel] = this.duration() + offsetOrLabel) : offsetOrLabel;
          }
          return this._labels[timeOrLabel] + offsetOrLabel;
        }
        offsetOrLabel = parseInt(timeOrLabel.charAt(i - 1) + "1", 10) * Number(timeOrLabel.substr(i + 1));
        timeOrLabel = (i > 1) ? this._parseTimeOrLabel(timeOrLabel.substr(0, i - 1), 0, appendIfAbsent) : this.duration();
      } else if (timeOrLabel == null) {
        timeOrLabel = this.duration();
      }
      return Number(timeOrLabel) + offsetOrLabel;
    };
    p.seek = function(position, suppressEvents) {
      return this.totalTime((typeof(position) === "number") ? position : this._parseTimeOrLabel(position), (suppressEvents !== false));
    };
    p.stop = function() {
      return this.paused(true);
    };
    p.gotoAndPlay = function(position, suppressEvents) {
      return this.play(position, suppressEvents);
    };
    p.gotoAndStop = function(position, suppressEvents) {
      return this.pause(position, suppressEvents);
    };
    p.render = function(time, suppressEvents, force) {
      if (this._gc) {
        this._enabled(true, false);
      }
      var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
          prevTime = this._time,
          prevStart = this._startTime,
          prevTimeScale = this._timeScale,
          prevPaused = this._paused,
          tween,
          isComplete,
          next,
          callback,
          internalForce,
          pauseTween,
          curTime;
      if (time >= totalDur - 0.0000001) {
        this._totalTime = this._time = totalDur;
        if (!this._reversed)
          if (!this._hasPausedChild()) {
            isComplete = true;
            callback = "onComplete";
            internalForce = !!this._timeline.autoRemoveChildren;
            if (this._duration === 0)
              if ((time <= 0 && time >= -0.0000001) || this._rawPrevTime < 0 || this._rawPrevTime === _tinyNum)
                if (this._rawPrevTime !== time && this._first) {
                  internalForce = true;
                  if (this._rawPrevTime > _tinyNum) {
                    callback = "onReverseComplete";
                  }
                }
          }
        this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum;
        time = totalDur + 0.0001;
      } else if (time < 0.0000001) {
        this._totalTime = this._time = 0;
        if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime !== _tinyNum && (this._rawPrevTime > 0 || (time < 0 && this._rawPrevTime >= 0)))) {
          callback = "onReverseComplete";
          isComplete = this._reversed;
        }
        if (time < 0) {
          this._active = false;
          if (this._timeline.autoRemoveChildren && this._reversed) {
            internalForce = isComplete = true;
            callback = "onReverseComplete";
          } else if (this._rawPrevTime >= 0 && this._first) {
            internalForce = true;
          }
          this._rawPrevTime = time;
        } else {
          this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum;
          if (time === 0 && isComplete) {
            tween = this._first;
            while (tween && tween._startTime === 0) {
              if (!tween._duration) {
                isComplete = false;
              }
              tween = tween._next;
            }
          }
          time = 0;
          if (!this._initted) {
            internalForce = true;
          }
        }
      } else {
        if (this._hasPause && !this._forcingPlayhead && !suppressEvents) {
          if (time >= prevTime) {
            tween = this._first;
            while (tween && tween._startTime <= time && !pauseTween) {
              if (!tween._duration)
                if (tween.data === "isPause" && !tween.ratio && !(tween._startTime === 0 && this._rawPrevTime === 0)) {
                  pauseTween = tween;
                }
              tween = tween._next;
            }
          } else {
            tween = this._last;
            while (tween && tween._startTime >= time && !pauseTween) {
              if (!tween._duration)
                if (tween.data === "isPause" && tween._rawPrevTime > 0) {
                  pauseTween = tween;
                }
              tween = tween._prev;
            }
          }
          if (pauseTween) {
            this._time = time = pauseTween._startTime;
            this._totalTime = time + (this._cycle * (this._totalDuration + this._repeatDelay));
          }
        }
        this._totalTime = this._time = this._rawPrevTime = time;
      }
      if ((this._time === prevTime || !this._first) && !force && !internalForce && !pauseTween) {
        return;
      } else if (!this._initted) {
        this._initted = true;
      }
      if (!this._active)
        if (!this._paused && this._time !== prevTime && time > 0) {
          this._active = true;
        }
      if (prevTime === 0)
        if (this.vars.onStart)
          if (this._time !== 0)
            if (!suppressEvents) {
              this._callback("onStart");
            }
      curTime = this._time;
      if (curTime >= prevTime) {
        tween = this._first;
        while (tween) {
          next = tween._next;
          if (curTime !== this._time || (this._paused && !prevPaused)) {
            break;
          } else if (tween._active || (tween._startTime <= curTime && !tween._paused && !tween._gc)) {
            if (pauseTween === tween) {
              this.pause();
            }
            if (!tween._reversed) {
              tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
            } else {
              tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
            }
          }
          tween = next;
        }
      } else {
        tween = this._last;
        while (tween) {
          next = tween._prev;
          if (curTime !== this._time || (this._paused && !prevPaused)) {
            break;
          } else if (tween._active || (tween._startTime <= prevTime && !tween._paused && !tween._gc)) {
            if (pauseTween === tween) {
              pauseTween = tween._prev;
              while (pauseTween && pauseTween.endTime() > this._time) {
                pauseTween.render((pauseTween._reversed ? pauseTween.totalDuration() - ((time - pauseTween._startTime) * pauseTween._timeScale) : (time - pauseTween._startTime) * pauseTween._timeScale), suppressEvents, force);
                pauseTween = pauseTween._prev;
              }
              pauseTween = null;
              this.pause();
            }
            if (!tween._reversed) {
              tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
            } else {
              tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
            }
          }
          tween = next;
        }
      }
      if (this._onUpdate)
        if (!suppressEvents) {
          if (_lazyTweens.length) {
            _lazyRender();
          }
          this._callback("onUpdate");
        }
      if (callback)
        if (!this._gc)
          if (prevStart === this._startTime || prevTimeScale !== this._timeScale)
            if (this._time === 0 || totalDur >= this.totalDuration()) {
              if (isComplete) {
                if (_lazyTweens.length) {
                  _lazyRender();
                }
                if (this._timeline.autoRemoveChildren) {
                  this._enabled(false, false);
                }
                this._active = false;
              }
              if (!suppressEvents && this.vars[callback]) {
                this._callback(callback);
              }
            }
    };
    p._hasPausedChild = function() {
      var tween = this._first;
      while (tween) {
        if (tween._paused || ((tween instanceof TimelineLite) && tween._hasPausedChild())) {
          return true;
        }
        tween = tween._next;
      }
      return false;
    };
    p.getChildren = function(nested, tweens, timelines, ignoreBeforeTime) {
      ignoreBeforeTime = ignoreBeforeTime || -9999999999;
      var a = [],
          tween = this._first,
          cnt = 0;
      while (tween) {
        if (tween._startTime < ignoreBeforeTime) {} else if (tween instanceof TweenLite) {
          if (tweens !== false) {
            a[cnt++] = tween;
          }
        } else {
          if (timelines !== false) {
            a[cnt++] = tween;
          }
          if (nested !== false) {
            a = a.concat(tween.getChildren(true, tweens, timelines));
            cnt = a.length;
          }
        }
        tween = tween._next;
      }
      return a;
    };
    p.getTweensOf = function(target, nested) {
      var disabled = this._gc,
          a = [],
          cnt = 0,
          tweens,
          i;
      if (disabled) {
        this._enabled(true, true);
      }
      tweens = TweenLite.getTweensOf(target);
      i = tweens.length;
      while (--i > -1) {
        if (tweens[i].timeline === this || (nested && this._contains(tweens[i]))) {
          a[cnt++] = tweens[i];
        }
      }
      if (disabled) {
        this._enabled(false, true);
      }
      return a;
    };
    p.recent = function() {
      return this._recent;
    };
    p._contains = function(tween) {
      var tl = tween.timeline;
      while (tl) {
        if (tl === this) {
          return true;
        }
        tl = tl.timeline;
      }
      return false;
    };
    p.shiftChildren = function(amount, adjustLabels, ignoreBeforeTime) {
      ignoreBeforeTime = ignoreBeforeTime || 0;
      var tween = this._first,
          labels = this._labels,
          p;
      while (tween) {
        if (tween._startTime >= ignoreBeforeTime) {
          tween._startTime += amount;
        }
        tween = tween._next;
      }
      if (adjustLabels) {
        for (p in labels) {
          if (labels[p] >= ignoreBeforeTime) {
            labels[p] += amount;
          }
        }
      }
      return this._uncache(true);
    };
    p._kill = function(vars, target) {
      if (!vars && !target) {
        return this._enabled(false, false);
      }
      var tweens = (!target) ? this.getChildren(true, true, false) : this.getTweensOf(target),
          i = tweens.length,
          changed = false;
      while (--i > -1) {
        if (tweens[i]._kill(vars, target)) {
          changed = true;
        }
      }
      return changed;
    };
    p.clear = function(labels) {
      var tweens = this.getChildren(false, true, true),
          i = tweens.length;
      this._time = this._totalTime = 0;
      while (--i > -1) {
        tweens[i]._enabled(false, false);
      }
      if (labels !== false) {
        this._labels = {};
      }
      return this._uncache(true);
    };
    p.invalidate = function() {
      var tween = this._first;
      while (tween) {
        tween.invalidate();
        tween = tween._next;
      }
      return Animation.prototype.invalidate.call(this);
      ;
    };
    p._enabled = function(enabled, ignoreTimeline) {
      if (enabled === this._gc) {
        var tween = this._first;
        while (tween) {
          tween._enabled(enabled, true);
          tween = tween._next;
        }
      }
      return SimpleTimeline.prototype._enabled.call(this, enabled, ignoreTimeline);
    };
    p.totalTime = function(time, suppressEvents, uncapped) {
      this._forcingPlayhead = true;
      var val = Animation.prototype.totalTime.apply(this, arguments);
      this._forcingPlayhead = false;
      return val;
    };
    p.duration = function(value) {
      if (!arguments.length) {
        if (this._dirty) {
          this.totalDuration();
        }
        return this._duration;
      }
      if (this.duration() !== 0 && value !== 0) {
        this.timeScale(this._duration / value);
      }
      return this;
    };
    p.totalDuration = function(value) {
      if (!arguments.length) {
        if (this._dirty) {
          var max = 0,
              tween = this._last,
              prevStart = 999999999999,
              prev,
              end;
          while (tween) {
            prev = tween._prev;
            if (tween._dirty) {
              tween.totalDuration();
            }
            if (tween._startTime > prevStart && this._sortChildren && !tween._paused) {
              this.add(tween, tween._startTime - tween._delay);
            } else {
              prevStart = tween._startTime;
            }
            if (tween._startTime < 0 && !tween._paused) {
              max -= tween._startTime;
              if (this._timeline.smoothChildTiming) {
                this._startTime += tween._startTime / this._timeScale;
              }
              this.shiftChildren(-tween._startTime, false, -9999999999);
              prevStart = 0;
            }
            end = tween._startTime + (tween._totalDuration / tween._timeScale);
            if (end > max) {
              max = end;
            }
            tween = prev;
          }
          this._duration = this._totalDuration = max;
          this._dirty = false;
        }
        return this._totalDuration;
      }
      return (value && this.totalDuration()) ? this.timeScale(this._totalDuration / value) : this;
    };
    p.paused = function(value) {
      if (!value) {
        var tween = this._first,
            time = this._time;
        while (tween) {
          if (tween._startTime === time && tween.data === "isPause") {
            tween._rawPrevTime = 0;
          }
          tween = tween._next;
        }
      }
      return Animation.prototype.paused.apply(this, arguments);
    };
    p.usesFrames = function() {
      var tl = this._timeline;
      while (tl._timeline) {
        tl = tl._timeline;
      }
      return (tl === Animation._rootFramesTimeline);
    };
    p.rawTime = function() {
      return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale;
    };
    return TimelineLite;
  }, true);
});
if (_gsScope._gsDefine) {
  _gsScope._gsQueue.pop()();
}
(function(name) {
  "use strict";
  var getGlobal = function() {
    return (_gsScope.GreenSockGlobals || _gsScope)[name];
  };
  if (typeof(define) === "function" && define.amd) {
    define(["TweenLite"], getGlobal);
  } else if (typeof(module) !== "undefined" && module.exports) {
    require('./TweenLite');
    module.exports = getGlobal();
  }
}("TimelineLite"));
