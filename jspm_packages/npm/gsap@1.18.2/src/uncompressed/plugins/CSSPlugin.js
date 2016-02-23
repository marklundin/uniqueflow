/* */ 
"format cjs";
(function(process) {
  var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window;
  (_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function(TweenPlugin, TweenLite) {
      var CSSPlugin = function() {
        TweenPlugin.call(this, "css");
        this._overwriteProps.length = 0;
        this.setRatio = CSSPlugin.prototype.setRatio;
      },
          _globals = _gsScope._gsDefine.globals,
          _hasPriority,
          _suffixMap,
          _cs,
          _overwriteProps,
          _specialProps = {},
          p = CSSPlugin.prototype = new TweenPlugin("css");
      p.constructor = CSSPlugin;
      CSSPlugin.version = "1.18.2";
      CSSPlugin.API = 2;
      CSSPlugin.defaultTransformPerspective = 0;
      CSSPlugin.defaultSkewType = "compensated";
      CSSPlugin.defaultSmoothOrigin = true;
      p = "px";
      CSSPlugin.suffixMap = {
        top: p,
        right: p,
        bottom: p,
        left: p,
        width: p,
        height: p,
        fontSize: p,
        padding: p,
        margin: p,
        perspective: p,
        lineHeight: ""
      };
      var _numExp = /(?:\d|\-\d|\.\d|\-\.\d)+/g,
          _relNumExp = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
          _valuesExp = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
          _NaNExp = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
          _suffixExp = /(?:\d|\-|\+|=|#|\.)*/g,
          _opacityExp = /opacity *= *([^)]*)/i,
          _opacityValExp = /opacity:([^;]*)/i,
          _alphaFilterExp = /alpha\(opacity *=.+?\)/i,
          _rgbhslExp = /^(rgb|hsl)/,
          _capsExp = /([A-Z])/g,
          _camelExp = /-([a-z])/gi,
          _urlExp = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
          _camelFunc = function(s, g) {
            return g.toUpperCase();
          },
          _horizExp = /(?:Left|Right|Width)/i,
          _ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
          _ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
          _commasOutsideParenExp = /,(?=[^\)]*(?:\(|$))/gi,
          _DEG2RAD = Math.PI / 180,
          _RAD2DEG = 180 / Math.PI,
          _forcePT = {},
          _doc = document,
          _createElement = function(type) {
            return _doc.createElementNS ? _doc.createElementNS("http://www.w3.org/1999/xhtml", type) : _doc.createElement(type);
          },
          _tempDiv = _createElement("div"),
          _tempImg = _createElement("img"),
          _internals = CSSPlugin._internals = {_specialProps: _specialProps},
          _agent = navigator.userAgent,
          _autoRound,
          _reqSafariFix,
          _isSafari,
          _isFirefox,
          _isSafariLT6,
          _ieVers,
          _supportsOpacity = (function() {
            var i = _agent.indexOf("Android"),
                a = _createElement("a");
            _isSafari = (_agent.indexOf("Safari") !== -1 && _agent.indexOf("Chrome") === -1 && (i === -1 || Number(_agent.substr(i + 8, 1)) > 3));
            _isSafariLT6 = (_isSafari && (Number(_agent.substr(_agent.indexOf("Version/") + 8, 1)) < 6));
            _isFirefox = (_agent.indexOf("Firefox") !== -1);
            if ((/MSIE ([0-9]{1,}[\.0-9]{0,})/).exec(_agent) || (/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/).exec(_agent)) {
              _ieVers = parseFloat(RegExp.$1);
            }
            if (!a) {
              return false;
            }
            a.style.cssText = "top:1px;opacity:.55;";
            return /^0.55/.test(a.style.opacity);
          }()),
          _getIEOpacity = function(v) {
            return (_opacityExp.test(((typeof(v) === "string") ? v : (v.currentStyle ? v.currentStyle.filter : v.style.filter) || "")) ? (parseFloat(RegExp.$1) / 100) : 1);
          },
          _log = function(s) {
            if (window.console) {
              console.log(s);
            }
          },
          _prefixCSS = "",
          _prefix = "",
          _checkPropPrefix = function(p, e) {
            e = e || _tempDiv;
            var s = e.style,
                a,
                i;
            if (s[p] !== undefined) {
              return p;
            }
            p = p.charAt(0).toUpperCase() + p.substr(1);
            a = ["O", "Moz", "ms", "Ms", "Webkit"];
            i = 5;
            while (--i > -1 && s[a[i] + p] === undefined) {}
            if (i >= 0) {
              _prefix = (i === 3) ? "ms" : a[i];
              _prefixCSS = "-" + _prefix.toLowerCase() + "-";
              return _prefix + p;
            }
            return null;
          },
          _getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function() {},
          _getStyle = CSSPlugin.getStyle = function(t, p, cs, calc, dflt) {
            var rv;
            if (!_supportsOpacity)
              if (p === "opacity") {
                return _getIEOpacity(t);
              }
            if (!calc && t.style[p]) {
              rv = t.style[p];
            } else if ((cs = cs || _getComputedStyle(t))) {
              rv = cs[p] || cs.getPropertyValue(p) || cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase());
            } else if (t.currentStyle) {
              rv = t.currentStyle[p];
            }
            return (dflt != null && (!rv || rv === "none" || rv === "auto" || rv === "auto auto")) ? dflt : rv;
          },
          _convertToPixels = _internals.convertToPixels = function(t, p, v, sfx, recurse) {
            if (sfx === "px" || !sfx) {
              return v;
            }
            if (sfx === "auto" || !v) {
              return 0;
            }
            var horiz = _horizExp.test(p),
                node = t,
                style = _tempDiv.style,
                neg = (v < 0),
                pix,
                cache,
                time;
            if (neg) {
              v = -v;
            }
            if (sfx === "%" && p.indexOf("border") !== -1) {
              pix = (v / 100) * (horiz ? t.clientWidth : t.clientHeight);
            } else {
              style.cssText = "border:0 solid red;position:" + _getStyle(t, "position") + ";line-height:0;";
              if (sfx === "%" || !node.appendChild || sfx.charAt(0) === "v" || sfx === "rem") {
                node = t.parentNode || _doc.body;
                cache = node._gsCache;
                time = TweenLite.ticker.frame;
                if (cache && horiz && cache.time === time) {
                  return cache.width * v / 100;
                }
                style[(horiz ? "width" : "height")] = v + sfx;
              } else {
                style[(horiz ? "borderLeftWidth" : "borderTopWidth")] = v + sfx;
              }
              node.appendChild(_tempDiv);
              pix = parseFloat(_tempDiv[(horiz ? "offsetWidth" : "offsetHeight")]);
              node.removeChild(_tempDiv);
              if (horiz && sfx === "%" && CSSPlugin.cacheWidths !== false) {
                cache = node._gsCache = node._gsCache || {};
                cache.time = time;
                cache.width = pix / v * 100;
              }
              if (pix === 0 && !recurse) {
                pix = _convertToPixels(t, p, v, sfx, true);
              }
            }
            return neg ? -pix : pix;
          },
          _calculateOffset = _internals.calculateOffset = function(t, p, cs) {
            if (_getStyle(t, "position", cs) !== "absolute") {
              return 0;
            }
            var dim = ((p === "left") ? "Left" : "Top"),
                v = _getStyle(t, "margin" + dim, cs);
            return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), v.replace(_suffixExp, "")) || 0);
          },
          _getAllStyles = function(t, cs) {
            var s = {},
                i,
                tr,
                p;
            if ((cs = cs || _getComputedStyle(t, null))) {
              if ((i = cs.length)) {
                while (--i > -1) {
                  p = cs[i];
                  if (p.indexOf("-transform") === -1 || _transformPropCSS === p) {
                    s[p.replace(_camelExp, _camelFunc)] = cs.getPropertyValue(p);
                  }
                }
              } else {
                for (i in cs) {
                  if (i.indexOf("Transform") === -1 || _transformProp === i) {
                    s[i] = cs[i];
                  }
                }
              }
            } else if ((cs = t.currentStyle || t.style)) {
              for (i in cs) {
                if (typeof(i) === "string" && s[i] === undefined) {
                  s[i.replace(_camelExp, _camelFunc)] = cs[i];
                }
              }
            }
            if (!_supportsOpacity) {
              s.opacity = _getIEOpacity(t);
            }
            tr = _getTransform(t, cs, false);
            s.rotation = tr.rotation;
            s.skewX = tr.skewX;
            s.scaleX = tr.scaleX;
            s.scaleY = tr.scaleY;
            s.x = tr.x;
            s.y = tr.y;
            if (_supports3D) {
              s.z = tr.z;
              s.rotationX = tr.rotationX;
              s.rotationY = tr.rotationY;
              s.scaleZ = tr.scaleZ;
            }
            if (s.filters) {
              delete s.filters;
            }
            return s;
          },
          _cssDif = function(t, s1, s2, vars, forceLookup) {
            var difs = {},
                style = t.style,
                val,
                p,
                mpt;
            for (p in s2) {
              if (p !== "cssText")
                if (p !== "length")
                  if (isNaN(p))
                    if (s1[p] !== (val = s2[p]) || (forceLookup && forceLookup[p]))
                      if (p.indexOf("Origin") === -1)
                        if (typeof(val) === "number" || typeof(val) === "string") {
                          difs[p] = (val === "auto" && (p === "left" || p === "top")) ? _calculateOffset(t, p) : ((val === "" || val === "auto" || val === "none") && typeof(s1[p]) === "string" && s1[p].replace(_NaNExp, "") !== "") ? 0 : val;
                          if (style[p] !== undefined) {
                            mpt = new MiniPropTween(style, p, style[p], mpt);
                          }
                        }
            }
            if (vars) {
              for (p in vars) {
                if (p !== "className") {
                  difs[p] = vars[p];
                }
              }
            }
            return {
              difs: difs,
              firstMPT: mpt
            };
          },
          _dimensions = {
            width: ["Left", "Right"],
            height: ["Top", "Bottom"]
          },
          _margins = ["marginLeft", "marginRight", "marginTop", "marginBottom"],
          _getDimension = function(t, p, cs) {
            var v = parseFloat((p === "width") ? t.offsetWidth : t.offsetHeight),
                a = _dimensions[p],
                i = a.length;
            cs = cs || _getComputedStyle(t, null);
            while (--i > -1) {
              v -= parseFloat(_getStyle(t, "padding" + a[i], cs, true)) || 0;
              v -= parseFloat(_getStyle(t, "border" + a[i] + "Width", cs, true)) || 0;
            }
            return v;
          },
          _parsePosition = function(v, recObj) {
            if (v === "contain" || v === "auto" || v === "auto auto") {
              return v + " ";
            }
            if (v == null || v === "") {
              v = "0 0";
            }
            var a = v.split(" "),
                x = (v.indexOf("left") !== -1) ? "0%" : (v.indexOf("right") !== -1) ? "100%" : a[0],
                y = (v.indexOf("top") !== -1) ? "0%" : (v.indexOf("bottom") !== -1) ? "100%" : a[1];
            if (y == null) {
              y = (x === "center") ? "50%" : "0";
            } else if (y === "center") {
              y = "50%";
            }
            if (x === "center" || (isNaN(parseFloat(x)) && (x + "").indexOf("=") === -1)) {
              x = "50%";
            }
            v = x + " " + y + ((a.length > 2) ? " " + a[2] : "");
            if (recObj) {
              recObj.oxp = (x.indexOf("%") !== -1);
              recObj.oyp = (y.indexOf("%") !== -1);
              recObj.oxr = (x.charAt(1) === "=");
              recObj.oyr = (y.charAt(1) === "=");
              recObj.ox = parseFloat(x.replace(_NaNExp, ""));
              recObj.oy = parseFloat(y.replace(_NaNExp, ""));
              recObj.v = v;
            }
            return recObj || v;
          },
          _parseChange = function(e, b) {
            return (typeof(e) === "string" && e.charAt(1) === "=") ? parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2)) : parseFloat(e) - parseFloat(b);
          },
          _parseVal = function(v, d) {
            return (v == null) ? d : (typeof(v) === "string" && v.charAt(1) === "=") ? parseInt(v.charAt(0) + "1", 10) * parseFloat(v.substr(2)) + d : parseFloat(v);
          },
          _parseAngle = function(v, d, p, directionalEnd) {
            var min = 0.000001,
                cap,
                split,
                dif,
                result,
                isRelative;
            if (v == null) {
              result = d;
            } else if (typeof(v) === "number") {
              result = v;
            } else {
              cap = 360;
              split = v.split("_");
              isRelative = (v.charAt(1) === "=");
              dif = (isRelative ? parseInt(v.charAt(0) + "1", 10) * parseFloat(split[0].substr(2)) : parseFloat(split[0])) * ((v.indexOf("rad") === -1) ? 1 : _RAD2DEG) - (isRelative ? 0 : d);
              if (split.length) {
                if (directionalEnd) {
                  directionalEnd[p] = d + dif;
                }
                if (v.indexOf("short") !== -1) {
                  dif = dif % cap;
                  if (dif !== dif % (cap / 2)) {
                    dif = (dif < 0) ? dif + cap : dif - cap;
                  }
                }
                if (v.indexOf("_cw") !== -1 && dif < 0) {
                  dif = ((dif + cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
                } else if (v.indexOf("ccw") !== -1 && dif > 0) {
                  dif = ((dif - cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
                }
              }
              result = d + dif;
            }
            if (result < min && result > -min) {
              result = 0;
            }
            return result;
          },
          _colorLookup = {
            aqua: [0, 255, 255],
            lime: [0, 255, 0],
            silver: [192, 192, 192],
            black: [0, 0, 0],
            maroon: [128, 0, 0],
            teal: [0, 128, 128],
            blue: [0, 0, 255],
            navy: [0, 0, 128],
            white: [255, 255, 255],
            fuchsia: [255, 0, 255],
            olive: [128, 128, 0],
            yellow: [255, 255, 0],
            orange: [255, 165, 0],
            gray: [128, 128, 128],
            purple: [128, 0, 128],
            green: [0, 128, 0],
            red: [255, 0, 0],
            pink: [255, 192, 203],
            cyan: [0, 255, 255],
            transparent: [255, 255, 255, 0]
          },
          _hue = function(h, m1, m2) {
            h = (h < 0) ? h + 1 : (h > 1) ? h - 1 : h;
            return ((((h * 6 < 1) ? m1 + (m2 - m1) * h * 6 : (h < 0.5) ? m2 : (h * 3 < 2) ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * 255) + 0.5) | 0;
          },
          _parseColor = CSSPlugin.parseColor = function(v, toHSL) {
            var a,
                r,
                g,
                b,
                h,
                s,
                l,
                max,
                min,
                d,
                wasHSL;
            if (!v) {
              a = _colorLookup.black;
            } else if (typeof(v) === "number") {
              a = [v >> 16, (v >> 8) & 255, v & 255];
            } else {
              if (v.charAt(v.length - 1) === ",") {
                v = v.substr(0, v.length - 1);
              }
              if (_colorLookup[v]) {
                a = _colorLookup[v];
              } else if (v.charAt(0) === "#") {
                if (v.length === 4) {
                  r = v.charAt(1);
                  g = v.charAt(2);
                  b = v.charAt(3);
                  v = "#" + r + r + g + g + b + b;
                }
                v = parseInt(v.substr(1), 16);
                a = [v >> 16, (v >> 8) & 255, v & 255];
              } else if (v.substr(0, 3) === "hsl") {
                a = wasHSL = v.match(_numExp);
                if (!toHSL) {
                  h = (Number(a[0]) % 360) / 360;
                  s = Number(a[1]) / 100;
                  l = Number(a[2]) / 100;
                  g = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
                  r = l * 2 - g;
                  if (a.length > 3) {
                    a[3] = Number(v[3]);
                  }
                  a[0] = _hue(h + 1 / 3, r, g);
                  a[1] = _hue(h, r, g);
                  a[2] = _hue(h - 1 / 3, r, g);
                } else if (v.indexOf("=") !== -1) {
                  return v.match(_relNumExp);
                }
              } else {
                a = v.match(_numExp) || _colorLookup.transparent;
              }
              a[0] = Number(a[0]);
              a[1] = Number(a[1]);
              a[2] = Number(a[2]);
              if (a.length > 3) {
                a[3] = Number(a[3]);
              }
            }
            if (toHSL && !wasHSL) {
              r = a[0] / 255;
              g = a[1] / 255;
              b = a[2] / 255;
              max = Math.max(r, g, b);
              min = Math.min(r, g, b);
              l = (max + min) / 2;
              if (max === min) {
                h = s = 0;
              } else {
                d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                h = (max === r) ? (g - b) / d + (g < b ? 6 : 0) : (max === g) ? (b - r) / d + 2 : (r - g) / d + 4;
                h *= 60;
              }
              a[0] = (h + 0.5) | 0;
              a[1] = (s * 100 + 0.5) | 0;
              a[2] = (l * 100 + 0.5) | 0;
            }
            return a;
          },
          _formatColors = function(s, toHSL) {
            var colors = s.match(_colorExp) || [],
                charIndex = 0,
                parsed = colors.length ? "" : s,
                i,
                color,
                temp;
            for (i = 0; i < colors.length; i++) {
              color = colors[i];
              temp = s.substr(charIndex, s.indexOf(color, charIndex) - charIndex);
              charIndex += temp.length + color.length;
              color = _parseColor(color, toHSL);
              if (color.length === 3) {
                color.push(1);
              }
              parsed += temp + (toHSL ? "hsla(" + color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : "rgba(" + color.join(",")) + ")";
            }
            return parsed;
          },
          _colorExp = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";
      for (p in _colorLookup) {
        _colorExp += "|" + p + "\\b";
      }
      _colorExp = new RegExp(_colorExp + ")", "gi");
      CSSPlugin.colorStringFilter = function(a) {
        var combined = a[0] + a[1],
            toHSL;
        _colorExp.lastIndex = 0;
        if (_colorExp.test(combined)) {
          toHSL = (combined.indexOf("hsl(") !== -1 || combined.indexOf("hsla(") !== -1);
          a[0] = _formatColors(a[0], toHSL);
          a[1] = _formatColors(a[1], toHSL);
        }
      };
      if (!TweenLite.defaultStringFilter) {
        TweenLite.defaultStringFilter = CSSPlugin.colorStringFilter;
      }
      var _getFormatter = function(dflt, clr, collapsible, multi) {
        if (dflt == null) {
          return function(v) {
            return v;
          };
        }
        var dColor = clr ? (dflt.match(_colorExp) || [""])[0] : "",
            dVals = dflt.split(dColor).join("").match(_valuesExp) || [],
            pfx = dflt.substr(0, dflt.indexOf(dVals[0])),
            sfx = (dflt.charAt(dflt.length - 1) === ")") ? ")" : "",
            delim = (dflt.indexOf(" ") !== -1) ? " " : ",",
            numVals = dVals.length,
            dSfx = (numVals > 0) ? dVals[0].replace(_numExp, "") : "",
            formatter;
        if (!numVals) {
          return function(v) {
            return v;
          };
        }
        if (clr) {
          formatter = function(v) {
            var color,
                vals,
                i,
                a;
            if (typeof(v) === "number") {
              v += dSfx;
            } else if (multi && _commasOutsideParenExp.test(v)) {
              a = v.replace(_commasOutsideParenExp, "|").split("|");
              for (i = 0; i < a.length; i++) {
                a[i] = formatter(a[i]);
              }
              return a.join(",");
            }
            color = (v.match(_colorExp) || [dColor])[0];
            vals = v.split(color).join("").match(_valuesExp) || [];
            i = vals.length;
            if (numVals > i--) {
              while (++i < numVals) {
                vals[i] = collapsible ? vals[(((i - 1) / 2) | 0)] : dVals[i];
              }
            }
            return pfx + vals.join(delim) + delim + color + sfx + (v.indexOf("inset") !== -1 ? " inset" : "");
          };
          return formatter;
        }
        formatter = function(v) {
          var vals,
              a,
              i;
          if (typeof(v) === "number") {
            v += dSfx;
          } else if (multi && _commasOutsideParenExp.test(v)) {
            a = v.replace(_commasOutsideParenExp, "|").split("|");
            for (i = 0; i < a.length; i++) {
              a[i] = formatter(a[i]);
            }
            return a.join(",");
          }
          vals = v.match(_valuesExp) || [];
          i = vals.length;
          if (numVals > i--) {
            while (++i < numVals) {
              vals[i] = collapsible ? vals[(((i - 1) / 2) | 0)] : dVals[i];
            }
          }
          return pfx + vals.join(delim) + sfx;
        };
        return formatter;
      },
          _getEdgeParser = function(props) {
            props = props.split(",");
            return function(t, e, p, cssp, pt, plugin, vars) {
              var a = (e + "").split(" "),
                  i;
              vars = {};
              for (i = 0; i < 4; i++) {
                vars[props[i]] = a[i] = a[i] || a[(((i - 1) / 2) >> 0)];
              }
              return cssp.parse(t, vars, pt, plugin);
            };
          },
          _setPluginRatio = _internals._setPluginRatio = function(v) {
            this.plugin.setRatio(v);
            var d = this.data,
                proxy = d.proxy,
                mpt = d.firstMPT,
                min = 0.000001,
                val,
                pt,
                i,
                str,
                p;
            while (mpt) {
              val = proxy[mpt.v];
              if (mpt.r) {
                val = Math.round(val);
              } else if (val < min && val > -min) {
                val = 0;
              }
              mpt.t[mpt.p] = val;
              mpt = mpt._next;
            }
            if (d.autoRotate) {
              d.autoRotate.rotation = proxy.rotation;
            }
            if (v === 1 || v === 0) {
              mpt = d.firstMPT;
              p = (v === 1) ? "e" : "b";
              while (mpt) {
                pt = mpt.t;
                if (!pt.type) {
                  pt[p] = pt.s + pt.xs0;
                } else if (pt.type === 1) {
                  str = pt.xs0 + pt.s + pt.xs1;
                  for (i = 1; i < pt.l; i++) {
                    str += pt["xn" + i] + pt["xs" + (i + 1)];
                  }
                  pt[p] = str;
                }
                mpt = mpt._next;
              }
            }
          },
          MiniPropTween = function(t, p, v, next, r) {
            this.t = t;
            this.p = p;
            this.v = v;
            this.r = r;
            if (next) {
              next._prev = this;
              this._next = next;
            }
          },
          _parseToProxy = _internals._parseToProxy = function(t, vars, cssp, pt, plugin, shallow) {
            var bpt = pt,
                start = {},
                end = {},
                transform = cssp._transform,
                oldForce = _forcePT,
                i,
                p,
                xp,
                mpt,
                firstPT;
            cssp._transform = null;
            _forcePT = vars;
            pt = firstPT = cssp.parse(t, vars, pt, plugin);
            _forcePT = oldForce;
            if (shallow) {
              cssp._transform = transform;
              if (bpt) {
                bpt._prev = null;
                if (bpt._prev) {
                  bpt._prev._next = null;
                }
              }
            }
            while (pt && pt !== bpt) {
              if (pt.type <= 1) {
                p = pt.p;
                end[p] = pt.s + pt.c;
                start[p] = pt.s;
                if (!shallow) {
                  mpt = new MiniPropTween(pt, "s", p, mpt, pt.r);
                  pt.c = 0;
                }
                if (pt.type === 1) {
                  i = pt.l;
                  while (--i > 0) {
                    xp = "xn" + i;
                    p = pt.p + "_" + xp;
                    end[p] = pt.data[xp];
                    start[p] = pt[xp];
                    if (!shallow) {
                      mpt = new MiniPropTween(pt, xp, p, mpt, pt.rxp[xp]);
                    }
                  }
                }
              }
              pt = pt._next;
            }
            return {
              proxy: start,
              end: end,
              firstMPT: mpt,
              pt: firstPT
            };
          },
          CSSPropTween = _internals.CSSPropTween = function(t, p, s, c, next, type, n, r, pr, b, e) {
            this.t = t;
            this.p = p;
            this.s = s;
            this.c = c;
            this.n = n || p;
            if (!(t instanceof CSSPropTween)) {
              _overwriteProps.push(this.n);
            }
            this.r = r;
            this.type = type || 0;
            if (pr) {
              this.pr = pr;
              _hasPriority = true;
            }
            this.b = (b === undefined) ? s : b;
            this.e = (e === undefined) ? s + c : e;
            if (next) {
              this._next = next;
              next._prev = this;
            }
          },
          _addNonTweeningNumericPT = function(target, prop, start, end, next, overwriteProp) {
            var pt = new CSSPropTween(target, prop, start, end - start, next, -1, overwriteProp);
            pt.b = start;
            pt.e = pt.xs0 = end;
            return pt;
          },
          _parseComplex = CSSPlugin.parseComplex = function(t, p, b, e, clrs, dflt, pt, pr, plugin, setRatio) {
            b = b || dflt || "";
            pt = new CSSPropTween(t, p, 0, 0, pt, (setRatio ? 2 : 1), null, false, pr, b, e);
            e += "";
            var ba = b.split(", ").join(",").split(" "),
                ea = e.split(", ").join(",").split(" "),
                l = ba.length,
                autoRound = (_autoRound !== false),
                i,
                xi,
                ni,
                bv,
                ev,
                bnums,
                enums,
                bn,
                hasAlpha,
                temp,
                cv,
                str,
                useHSL;
            if (e.indexOf(",") !== -1 || b.indexOf(",") !== -1) {
              ba = ba.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
              ea = ea.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
              l = ba.length;
            }
            if (l !== ea.length) {
              ba = (dflt || "").split(" ");
              l = ba.length;
            }
            pt.plugin = plugin;
            pt.setRatio = setRatio;
            _colorExp.lastIndex = 0;
            for (i = 0; i < l; i++) {
              bv = ba[i];
              ev = ea[i];
              bn = parseFloat(bv);
              if (bn || bn === 0) {
                pt.appendXtra("", bn, _parseChange(ev, bn), ev.replace(_relNumExp, ""), (autoRound && ev.indexOf("px") !== -1), true);
              } else if (clrs && _colorExp.test(bv)) {
                str = ev.charAt(ev.length - 1) === "," ? ")," : ")";
                useHSL = (ev.indexOf("hsl") !== -1 && _supportsOpacity);
                bv = _parseColor(bv, useHSL);
                ev = _parseColor(ev, useHSL);
                hasAlpha = (bv.length + ev.length > 6);
                if (hasAlpha && !_supportsOpacity && ev[3] === 0) {
                  pt["xs" + pt.l] += pt.l ? " transparent" : "transparent";
                  pt.e = pt.e.split(ea[i]).join("transparent");
                } else {
                  if (!_supportsOpacity) {
                    hasAlpha = false;
                  }
                  if (useHSL) {
                    pt.appendXtra((hasAlpha ? "hsla(" : "hsl("), bv[0], _parseChange(ev[0], bv[0]), ",", false, true).appendXtra("", bv[1], _parseChange(ev[1], bv[1]), "%,", false).appendXtra("", bv[2], _parseChange(ev[2], bv[2]), (hasAlpha ? "%," : "%" + str), false);
                  } else {
                    pt.appendXtra((hasAlpha ? "rgba(" : "rgb("), bv[0], ev[0] - bv[0], ",", true, true).appendXtra("", bv[1], ev[1] - bv[1], ",", true).appendXtra("", bv[2], ev[2] - bv[2], (hasAlpha ? "," : str), true);
                  }
                  if (hasAlpha) {
                    bv = (bv.length < 4) ? 1 : bv[3];
                    pt.appendXtra("", bv, ((ev.length < 4) ? 1 : ev[3]) - bv, str, false);
                  }
                }
                _colorExp.lastIndex = 0;
              } else {
                bnums = bv.match(_numExp);
                if (!bnums) {
                  pt["xs" + pt.l] += pt.l ? " " + ev : ev;
                } else {
                  enums = ev.match(_relNumExp);
                  if (!enums || enums.length !== bnums.length) {
                    return pt;
                  }
                  ni = 0;
                  for (xi = 0; xi < bnums.length; xi++) {
                    cv = bnums[xi];
                    temp = bv.indexOf(cv, ni);
                    pt.appendXtra(bv.substr(ni, temp - ni), Number(cv), _parseChange(enums[xi], cv), "", (autoRound && bv.substr(temp + cv.length, 2) === "px"), (xi === 0));
                    ni = temp + cv.length;
                  }
                  pt["xs" + pt.l] += bv.substr(ni);
                }
              }
            }
            if (e.indexOf("=") !== -1)
              if (pt.data) {
                str = pt.xs0 + pt.data.s;
                for (i = 1; i < pt.l; i++) {
                  str += pt["xs" + i] + pt.data["xn" + i];
                }
                pt.e = str + pt["xs" + i];
              }
            if (!pt.l) {
              pt.type = -1;
              pt.xs0 = pt.e;
            }
            return pt.xfirst || pt;
          },
          i = 9;
      p = CSSPropTween.prototype;
      p.l = p.pr = 0;
      while (--i > 0) {
        p["xn" + i] = 0;
        p["xs" + i] = "";
      }
      p.xs0 = "";
      p._next = p._prev = p.xfirst = p.data = p.plugin = p.setRatio = p.rxp = null;
      p.appendXtra = function(pfx, s, c, sfx, r, pad) {
        var pt = this,
            l = pt.l;
        pt["xs" + l] += (pad && l) ? " " + pfx : pfx || "";
        if (!c)
          if (l !== 0 && !pt.plugin) {
            pt["xs" + l] += s + (sfx || "");
            return pt;
          }
        pt.l++;
        pt.type = pt.setRatio ? 2 : 1;
        pt["xs" + pt.l] = sfx || "";
        if (l > 0) {
          pt.data["xn" + l] = s + c;
          pt.rxp["xn" + l] = r;
          pt["xn" + l] = s;
          if (!pt.plugin) {
            pt.xfirst = new CSSPropTween(pt, "xn" + l, s, c, pt.xfirst || pt, 0, pt.n, r, pt.pr);
            pt.xfirst.xs0 = 0;
          }
          return pt;
        }
        pt.data = {s: s + c};
        pt.rxp = {};
        pt.s = s;
        pt.c = c;
        pt.r = r;
        return pt;
      };
      var SpecialProp = function(p, options) {
        options = options || {};
        this.p = options.prefix ? _checkPropPrefix(p) || p : p;
        _specialProps[p] = _specialProps[this.p] = this;
        this.format = options.formatter || _getFormatter(options.defaultValue, options.color, options.collapsible, options.multi);
        if (options.parser) {
          this.parse = options.parser;
        }
        this.clrs = options.color;
        this.multi = options.multi;
        this.keyword = options.keyword;
        this.dflt = options.defaultValue;
        this.pr = options.priority || 0;
      },
          _registerComplexSpecialProp = _internals._registerComplexSpecialProp = function(p, options, defaults) {
            if (typeof(options) !== "object") {
              options = {parser: defaults};
            }
            var a = p.split(","),
                d = options.defaultValue,
                i,
                temp;
            defaults = defaults || [d];
            for (i = 0; i < a.length; i++) {
              options.prefix = (i === 0 && options.prefix);
              options.defaultValue = defaults[i] || d;
              temp = new SpecialProp(a[i], options);
            }
          },
          _registerPluginProp = function(p) {
            if (!_specialProps[p]) {
              var pluginName = p.charAt(0).toUpperCase() + p.substr(1) + "Plugin";
              _registerComplexSpecialProp(p, {parser: function(t, e, p, cssp, pt, plugin, vars) {
                  var pluginClass = _globals.com.greensock.plugins[pluginName];
                  if (!pluginClass) {
                    _log("Error: " + pluginName + " js file not loaded.");
                    return pt;
                  }
                  pluginClass._cssRegister();
                  return _specialProps[p].parse(t, e, p, cssp, pt, plugin, vars);
                }});
            }
          };
      p = SpecialProp.prototype;
      p.parseComplex = function(t, b, e, pt, plugin, setRatio) {
        var kwd = this.keyword,
            i,
            ba,
            ea,
            l,
            bi,
            ei;
        if (this.multi)
          if (_commasOutsideParenExp.test(e) || _commasOutsideParenExp.test(b)) {
            ba = b.replace(_commasOutsideParenExp, "|").split("|");
            ea = e.replace(_commasOutsideParenExp, "|").split("|");
          } else if (kwd) {
            ba = [b];
            ea = [e];
          }
        if (ea) {
          l = (ea.length > ba.length) ? ea.length : ba.length;
          for (i = 0; i < l; i++) {
            b = ba[i] = ba[i] || this.dflt;
            e = ea[i] = ea[i] || this.dflt;
            if (kwd) {
              bi = b.indexOf(kwd);
              ei = e.indexOf(kwd);
              if (bi !== ei) {
                if (ei === -1) {
                  ba[i] = ba[i].split(kwd).join("");
                } else if (bi === -1) {
                  ba[i] += " " + kwd;
                }
              }
            }
          }
          b = ba.join(", ");
          e = ea.join(", ");
        }
        return _parseComplex(t, this.p, b, e, this.clrs, this.dflt, pt, this.pr, plugin, setRatio);
      };
      p.parse = function(t, e, p, cssp, pt, plugin, vars) {
        return this.parseComplex(t.style, this.format(_getStyle(t, this.p, _cs, false, this.dflt)), this.format(e), pt, plugin);
      };
      CSSPlugin.registerSpecialProp = function(name, onInitTween, priority) {
        _registerComplexSpecialProp(name, {
          parser: function(t, e, p, cssp, pt, plugin, vars) {
            var rv = new CSSPropTween(t, p, 0, 0, pt, 2, p, false, priority);
            rv.plugin = plugin;
            rv.setRatio = onInitTween(t, e, cssp._tween, p);
            return rv;
          },
          priority: priority
        });
      };
      CSSPlugin.useSVGTransformAttr = _isSafari || _isFirefox;
      var _transformProps = ("scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent").split(","),
          _transformProp = _checkPropPrefix("transform"),
          _transformPropCSS = _prefixCSS + "transform",
          _transformOriginProp = _checkPropPrefix("transformOrigin"),
          _supports3D = (_checkPropPrefix("perspective") !== null),
          Transform = _internals.Transform = function() {
            this.perspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0;
            this.force3D = (CSSPlugin.defaultForce3D === false || !_supports3D) ? false : CSSPlugin.defaultForce3D || "auto";
          },
          _SVGElement = window.SVGElement,
          _useSVGTransformAttr,
          _createSVG = function(type, container, attributes) {
            var element = _doc.createElementNS("http://www.w3.org/2000/svg", type),
                reg = /([a-z])([A-Z])/g,
                p;
            for (p in attributes) {
              element.setAttributeNS(null, p.replace(reg, "$1-$2").toLowerCase(), attributes[p]);
            }
            container.appendChild(element);
            return element;
          },
          _docElement = _doc.documentElement,
          _forceSVGTransformAttr = (function() {
            var force = _ieVers || (/Android/i.test(_agent) && !window.chrome),
                svg,
                rect,
                width;
            if (_doc.createElementNS && !force) {
              svg = _createSVG("svg", _docElement);
              rect = _createSVG("rect", svg, {
                width: 100,
                height: 50,
                x: 100
              });
              width = rect.getBoundingClientRect().width;
              rect.style[_transformOriginProp] = "50% 50%";
              rect.style[_transformProp] = "scaleX(0.5)";
              force = (width === rect.getBoundingClientRect().width && !(_isFirefox && _supports3D));
              _docElement.removeChild(svg);
            }
            return force;
          })(),
          _parseSVGOrigin = function(e, local, decoratee, absolute, smoothOrigin) {
            var tm = e._gsTransform,
                m = _getMatrix(e, true),
                v,
                x,
                y,
                xOrigin,
                yOrigin,
                a,
                b,
                c,
                d,
                tx,
                ty,
                determinant,
                xOriginOld,
                yOriginOld;
            if (tm) {
              xOriginOld = tm.xOrigin;
              yOriginOld = tm.yOrigin;
            }
            if (!absolute || (v = absolute.split(" ")).length < 2) {
              b = e.getBBox();
              local = _parsePosition(local).split(" ");
              v = [(local[0].indexOf("%") !== -1 ? parseFloat(local[0]) / 100 * b.width : parseFloat(local[0])) + b.x, (local[1].indexOf("%") !== -1 ? parseFloat(local[1]) / 100 * b.height : parseFloat(local[1])) + b.y];
            }
            decoratee.xOrigin = xOrigin = parseFloat(v[0]);
            decoratee.yOrigin = yOrigin = parseFloat(v[1]);
            if (absolute && m !== _identity2DMatrix) {
              a = m[0];
              b = m[1];
              c = m[2];
              d = m[3];
              tx = m[4];
              ty = m[5];
              determinant = (a * d - b * c);
              x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + ((c * ty - d * tx) / determinant);
              y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - ((a * ty - b * tx) / determinant);
              xOrigin = decoratee.xOrigin = v[0] = x;
              yOrigin = decoratee.yOrigin = v[1] = y;
            }
            if (tm) {
              if (smoothOrigin || (smoothOrigin !== false && CSSPlugin.defaultSmoothOrigin !== false)) {
                x = xOrigin - xOriginOld;
                y = yOrigin - yOriginOld;
                tm.xOffset += (x * m[0] + y * m[2]) - x;
                tm.yOffset += (x * m[1] + y * m[3]) - y;
              } else {
                tm.xOffset = tm.yOffset = 0;
              }
            }
            e.setAttribute("data-svg-origin", v.join(" "));
          },
          _isSVG = function(e) {
            return !!(_SVGElement && typeof(e.getBBox) === "function" && e.getCTM && (!e.parentNode || (e.parentNode.getBBox && e.parentNode.getCTM)));
          },
          _identity2DMatrix = [1, 0, 0, 1, 0, 0],
          _getMatrix = function(e, force2D) {
            var tm = e._gsTransform || new Transform(),
                rnd = 100000,
                isDefault,
                s,
                m,
                n,
                dec;
            if (_transformProp) {
              s = _getStyle(e, _transformPropCSS, null, true);
            } else if (e.currentStyle) {
              s = e.currentStyle.filter.match(_ieGetMatrixExp);
              s = (s && s.length === 4) ? [s[0].substr(4), Number(s[2].substr(4)), Number(s[1].substr(4)), s[3].substr(4), (tm.x || 0), (tm.y || 0)].join(",") : "";
            }
            isDefault = (!s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)");
            if (tm.svg || (e.getBBox && _isSVG(e))) {
              if (isDefault && (e.style[_transformProp] + "").indexOf("matrix") !== -1) {
                s = e.style[_transformProp];
                isDefault = 0;
              }
              m = e.getAttribute("transform");
              if (isDefault && m) {
                if (m.indexOf("matrix") !== -1) {
                  s = m;
                  isDefault = 0;
                } else if (m.indexOf("translate") !== -1) {
                  s = "matrix(1,0,0,1," + m.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",") + ")";
                  isDefault = 0;
                }
              }
            }
            if (isDefault) {
              return _identity2DMatrix;
            }
            m = (s || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [];
            i = m.length;
            while (--i > -1) {
              n = Number(m[i]);
              m[i] = (dec = n - (n |= 0)) ? ((dec * rnd + (dec < 0 ? -0.5 : 0.5)) | 0) / rnd + n : n;
            }
            return (force2D && m.length > 6) ? [m[0], m[1], m[4], m[5], m[12], m[13]] : m;
          },
          _getTransform = _internals.getTransform = function(t, cs, rec, parse) {
            if (t._gsTransform && rec && !parse) {
              return t._gsTransform;
            }
            var tm = rec ? t._gsTransform || new Transform() : new Transform(),
                invX = (tm.scaleX < 0),
                min = 0.00002,
                rnd = 100000,
                zOrigin = _supports3D ? parseFloat(_getStyle(t, _transformOriginProp, cs, false, "0 0 0").split(" ")[2]) || tm.zOrigin || 0 : 0,
                defaultTransformPerspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0,
                m,
                i,
                scaleX,
                scaleY,
                rotation,
                skewX;
            tm.svg = !!(t.getBBox && _isSVG(t));
            if (tm.svg) {
              _parseSVGOrigin(t, _getStyle(t, _transformOriginProp, _cs, false, "50% 50%") + "", tm, t.getAttribute("data-svg-origin"));
              _useSVGTransformAttr = CSSPlugin.useSVGTransformAttr || _forceSVGTransformAttr;
            }
            m = _getMatrix(t);
            if (m !== _identity2DMatrix) {
              if (m.length === 16) {
                var a11 = m[0],
                    a21 = m[1],
                    a31 = m[2],
                    a41 = m[3],
                    a12 = m[4],
                    a22 = m[5],
                    a32 = m[6],
                    a42 = m[7],
                    a13 = m[8],
                    a23 = m[9],
                    a33 = m[10],
                    a14 = m[12],
                    a24 = m[13],
                    a34 = m[14],
                    a43 = m[11],
                    angle = Math.atan2(a32, a33),
                    t1,
                    t2,
                    t3,
                    t4,
                    cos,
                    sin;
                if (tm.zOrigin) {
                  a34 = -tm.zOrigin;
                  a14 = a13 * a34 - m[12];
                  a24 = a23 * a34 - m[13];
                  a34 = a33 * a34 + tm.zOrigin - m[14];
                }
                tm.rotationX = angle * _RAD2DEG;
                if (angle) {
                  cos = Math.cos(-angle);
                  sin = Math.sin(-angle);
                  t1 = a12 * cos + a13 * sin;
                  t2 = a22 * cos + a23 * sin;
                  t3 = a32 * cos + a33 * sin;
                  a13 = a12 * -sin + a13 * cos;
                  a23 = a22 * -sin + a23 * cos;
                  a33 = a32 * -sin + a33 * cos;
                  a43 = a42 * -sin + a43 * cos;
                  a12 = t1;
                  a22 = t2;
                  a32 = t3;
                }
                angle = Math.atan2(-a31, a33);
                tm.rotationY = angle * _RAD2DEG;
                if (angle) {
                  cos = Math.cos(-angle);
                  sin = Math.sin(-angle);
                  t1 = a11 * cos - a13 * sin;
                  t2 = a21 * cos - a23 * sin;
                  t3 = a31 * cos - a33 * sin;
                  a23 = a21 * sin + a23 * cos;
                  a33 = a31 * sin + a33 * cos;
                  a43 = a41 * sin + a43 * cos;
                  a11 = t1;
                  a21 = t2;
                  a31 = t3;
                }
                angle = Math.atan2(a21, a11);
                tm.rotation = angle * _RAD2DEG;
                if (angle) {
                  cos = Math.cos(-angle);
                  sin = Math.sin(-angle);
                  a11 = a11 * cos + a12 * sin;
                  t2 = a21 * cos + a22 * sin;
                  a22 = a21 * -sin + a22 * cos;
                  a32 = a31 * -sin + a32 * cos;
                  a21 = t2;
                }
                if (tm.rotationX && Math.abs(tm.rotationX) + Math.abs(tm.rotation) > 359.9) {
                  tm.rotationX = tm.rotation = 0;
                  tm.rotationY = 180 - tm.rotationY;
                }
                tm.scaleX = ((Math.sqrt(a11 * a11 + a21 * a21) * rnd + 0.5) | 0) / rnd;
                tm.scaleY = ((Math.sqrt(a22 * a22 + a23 * a23) * rnd + 0.5) | 0) / rnd;
                tm.scaleZ = ((Math.sqrt(a32 * a32 + a33 * a33) * rnd + 0.5) | 0) / rnd;
                tm.skewX = 0;
                tm.perspective = a43 ? 1 / ((a43 < 0) ? -a43 : a43) : 0;
                tm.x = a14;
                tm.y = a24;
                tm.z = a34;
                if (tm.svg) {
                  tm.x -= tm.xOrigin - (tm.xOrigin * a11 - tm.yOrigin * a12);
                  tm.y -= tm.yOrigin - (tm.yOrigin * a21 - tm.xOrigin * a22);
                }
              } else if ((!_supports3D || parse || !m.length || tm.x !== m[4] || tm.y !== m[5] || (!tm.rotationX && !tm.rotationY)) && !(tm.x !== undefined && _getStyle(t, "display", cs) === "none")) {
                var k = (m.length >= 6),
                    a = k ? m[0] : 1,
                    b = m[1] || 0,
                    c = m[2] || 0,
                    d = k ? m[3] : 1;
                tm.x = m[4] || 0;
                tm.y = m[5] || 0;
                scaleX = Math.sqrt(a * a + b * b);
                scaleY = Math.sqrt(d * d + c * c);
                rotation = (a || b) ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0;
                skewX = (c || d) ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0;
                if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
                  if (invX) {
                    scaleX *= -1;
                    skewX += (rotation <= 0) ? 180 : -180;
                    rotation += (rotation <= 0) ? 180 : -180;
                  } else {
                    scaleY *= -1;
                    skewX += (skewX <= 0) ? 180 : -180;
                  }
                }
                tm.scaleX = scaleX;
                tm.scaleY = scaleY;
                tm.rotation = rotation;
                tm.skewX = skewX;
                if (_supports3D) {
                  tm.rotationX = tm.rotationY = tm.z = 0;
                  tm.perspective = defaultTransformPerspective;
                  tm.scaleZ = 1;
                }
                if (tm.svg) {
                  tm.x -= tm.xOrigin - (tm.xOrigin * a + tm.yOrigin * c);
                  tm.y -= tm.yOrigin - (tm.xOrigin * b + tm.yOrigin * d);
                }
              }
              tm.zOrigin = zOrigin;
              for (i in tm) {
                if (tm[i] < min)
                  if (tm[i] > -min) {
                    tm[i] = 0;
                  }
              }
            }
            if (rec) {
              t._gsTransform = tm;
              if (tm.svg) {
                if (_useSVGTransformAttr && t.style[_transformProp]) {
                  TweenLite.delayedCall(0.001, function() {
                    _removeProp(t.style, _transformProp);
                  });
                } else if (!_useSVGTransformAttr && t.getAttribute("transform")) {
                  TweenLite.delayedCall(0.001, function() {
                    t.removeAttribute("transform");
                  });
                }
              }
            }
            return tm;
          },
          _setIETransformRatio = function(v) {
            var t = this.data,
                ang = -t.rotation * _DEG2RAD,
                skew = ang + t.skewX * _DEG2RAD,
                rnd = 100000,
                a = ((Math.cos(ang) * t.scaleX * rnd) | 0) / rnd,
                b = ((Math.sin(ang) * t.scaleX * rnd) | 0) / rnd,
                c = ((Math.sin(skew) * -t.scaleY * rnd) | 0) / rnd,
                d = ((Math.cos(skew) * t.scaleY * rnd) | 0) / rnd,
                style = this.t.style,
                cs = this.t.currentStyle,
                filters,
                val;
            if (!cs) {
              return;
            }
            val = b;
            b = -c;
            c = -val;
            filters = cs.filter;
            style.filter = "";
            var w = this.t.offsetWidth,
                h = this.t.offsetHeight,
                clip = (cs.position !== "absolute"),
                m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d,
                ox = t.x + (w * t.xPercent / 100),
                oy = t.y + (h * t.yPercent / 100),
                dx,
                dy;
            if (t.ox != null) {
              dx = ((t.oxp) ? w * t.ox * 0.01 : t.ox) - w / 2;
              dy = ((t.oyp) ? h * t.oy * 0.01 : t.oy) - h / 2;
              ox += dx - (dx * a + dy * b);
              oy += dy - (dx * c + dy * d);
            }
            if (!clip) {
              m += ", sizingMethod='auto expand')";
            } else {
              dx = (w / 2);
              dy = (h / 2);
              m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")";
            }
            if (filters.indexOf("DXImageTransform.Microsoft.Matrix(") !== -1) {
              style.filter = filters.replace(_ieSetMatrixExp, m);
            } else {
              style.filter = m + " " + filters;
            }
            if (v === 0 || v === 1)
              if (a === 1)
                if (b === 0)
                  if (c === 0)
                    if (d === 1)
                      if (!clip || m.indexOf("Dx=0, Dy=0") !== -1)
                        if (!_opacityExp.test(filters) || parseFloat(RegExp.$1) === 100)
                          if (filters.indexOf("gradient(" && filters.indexOf("Alpha")) === -1) {
                            style.removeAttribute("filter");
                          }
            if (!clip) {
              var mult = (_ieVers < 8) ? 1 : -1,
                  marg,
                  prop,
                  dif;
              dx = t.ieOffsetX || 0;
              dy = t.ieOffsetY || 0;
              t.ieOffsetX = Math.round((w - ((a < 0 ? -a : a) * w + (b < 0 ? -b : b) * h)) / 2 + ox);
              t.ieOffsetY = Math.round((h - ((d < 0 ? -d : d) * h + (c < 0 ? -c : c) * w)) / 2 + oy);
              for (i = 0; i < 4; i++) {
                prop = _margins[i];
                marg = cs[prop];
                val = (marg.indexOf("px") !== -1) ? parseFloat(marg) : _convertToPixels(this.t, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0;
                if (val !== t[prop]) {
                  dif = (i < 2) ? -t.ieOffsetX : -t.ieOffsetY;
                } else {
                  dif = (i < 2) ? dx - t.ieOffsetX : dy - t.ieOffsetY;
                }
                style[prop] = (t[prop] = Math.round(val - dif * ((i === 0 || i === 2) ? 1 : mult))) + "px";
              }
            }
          },
          _setTransformRatio = _internals.set3DTransformRatio = _internals.setTransformRatio = function(v) {
            var t = this.data,
                style = this.t.style,
                angle = t.rotation,
                rotationX = t.rotationX,
                rotationY = t.rotationY,
                sx = t.scaleX,
                sy = t.scaleY,
                sz = t.scaleZ,
                x = t.x,
                y = t.y,
                z = t.z,
                isSVG = t.svg,
                perspective = t.perspective,
                force3D = t.force3D,
                a11,
                a12,
                a13,
                a21,
                a22,
                a23,
                a31,
                a32,
                a33,
                a41,
                a42,
                a43,
                zOrigin,
                min,
                cos,
                sin,
                t1,
                t2,
                transform,
                comma,
                zero,
                skew,
                rnd;
            if (((((v === 1 || v === 0) && force3D === "auto" && (this.tween._totalTime === this.tween._totalDuration || !this.tween._totalTime)) || !force3D) && !z && !perspective && !rotationY && !rotationX && sz === 1) || (_useSVGTransformAttr && isSVG) || !_supports3D) {
              if (angle || t.skewX || isSVG) {
                angle *= _DEG2RAD;
                skew = t.skewX * _DEG2RAD;
                rnd = 100000;
                a11 = Math.cos(angle) * sx;
                a21 = Math.sin(angle) * sx;
                a12 = Math.sin(angle - skew) * -sy;
                a22 = Math.cos(angle - skew) * sy;
                if (skew && t.skewType === "simple") {
                  t1 = Math.tan(skew);
                  t1 = Math.sqrt(1 + t1 * t1);
                  a12 *= t1;
                  a22 *= t1;
                  if (t.skewY) {
                    a11 *= t1;
                    a21 *= t1;
                  }
                }
                if (isSVG) {
                  x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset;
                  y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset;
                  if (_useSVGTransformAttr && (t.xPercent || t.yPercent)) {
                    min = this.t.getBBox();
                    x += t.xPercent * 0.01 * min.width;
                    y += t.yPercent * 0.01 * min.height;
                  }
                  min = 0.000001;
                  if (x < min)
                    if (x > -min) {
                      x = 0;
                    }
                  if (y < min)
                    if (y > -min) {
                      y = 0;
                    }
                }
                transform = (((a11 * rnd) | 0) / rnd) + "," + (((a21 * rnd) | 0) / rnd) + "," + (((a12 * rnd) | 0) / rnd) + "," + (((a22 * rnd) | 0) / rnd) + "," + x + "," + y + ")";
                if (isSVG && _useSVGTransformAttr) {
                  this.t.setAttribute("transform", "matrix(" + transform);
                } else {
                  style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + transform;
                }
              } else {
                style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + sx + ",0,0," + sy + "," + x + "," + y + ")";
              }
              return;
            }
            if (_isFirefox) {
              min = 0.0001;
              if (sx < min && sx > -min) {
                sx = sz = 0.00002;
              }
              if (sy < min && sy > -min) {
                sy = sz = 0.00002;
              }
              if (perspective && !t.z && !t.rotationX && !t.rotationY) {
                perspective = 0;
              }
            }
            if (angle || t.skewX) {
              angle *= _DEG2RAD;
              cos = a11 = Math.cos(angle);
              sin = a21 = Math.sin(angle);
              if (t.skewX) {
                angle -= t.skewX * _DEG2RAD;
                cos = Math.cos(angle);
                sin = Math.sin(angle);
                if (t.skewType === "simple") {
                  t1 = Math.tan(t.skewX * _DEG2RAD);
                  t1 = Math.sqrt(1 + t1 * t1);
                  cos *= t1;
                  sin *= t1;
                  if (t.skewY) {
                    a11 *= t1;
                    a21 *= t1;
                  }
                }
              }
              a12 = -sin;
              a22 = cos;
            } else if (!rotationY && !rotationX && sz === 1 && !perspective && !isSVG) {
              style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) translate3d(" : "translate3d(") + x + "px," + y + "px," + z + "px)" + ((sx !== 1 || sy !== 1) ? " scale(" + sx + "," + sy + ")" : "");
              return;
            } else {
              a11 = a22 = 1;
              a12 = a21 = 0;
            }
            a33 = 1;
            a13 = a23 = a31 = a32 = a41 = a42 = 0;
            a43 = (perspective) ? -1 / perspective : 0;
            zOrigin = t.zOrigin;
            min = 0.000001;
            comma = ",";
            zero = "0";
            angle = rotationY * _DEG2RAD;
            if (angle) {
              cos = Math.cos(angle);
              sin = Math.sin(angle);
              a31 = -sin;
              a41 = a43 * -sin;
              a13 = a11 * sin;
              a23 = a21 * sin;
              a33 = cos;
              a43 *= cos;
              a11 *= cos;
              a21 *= cos;
            }
            angle = rotationX * _DEG2RAD;
            if (angle) {
              cos = Math.cos(angle);
              sin = Math.sin(angle);
              t1 = a12 * cos + a13 * sin;
              t2 = a22 * cos + a23 * sin;
              a32 = a33 * sin;
              a42 = a43 * sin;
              a13 = a12 * -sin + a13 * cos;
              a23 = a22 * -sin + a23 * cos;
              a33 = a33 * cos;
              a43 = a43 * cos;
              a12 = t1;
              a22 = t2;
            }
            if (sz !== 1) {
              a13 *= sz;
              a23 *= sz;
              a33 *= sz;
              a43 *= sz;
            }
            if (sy !== 1) {
              a12 *= sy;
              a22 *= sy;
              a32 *= sy;
              a42 *= sy;
            }
            if (sx !== 1) {
              a11 *= sx;
              a21 *= sx;
              a31 *= sx;
              a41 *= sx;
            }
            if (zOrigin || isSVG) {
              if (zOrigin) {
                x += a13 * -zOrigin;
                y += a23 * -zOrigin;
                z += a33 * -zOrigin + zOrigin;
              }
              if (isSVG) {
                x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset;
                y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset;
              }
              if (x < min && x > -min) {
                x = zero;
              }
              if (y < min && y > -min) {
                y = zero;
              }
              if (z < min && z > -min) {
                z = 0;
              }
            }
            transform = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix3d(" : "matrix3d(");
            transform += ((a11 < min && a11 > -min) ? zero : a11) + comma + ((a21 < min && a21 > -min) ? zero : a21) + comma + ((a31 < min && a31 > -min) ? zero : a31);
            transform += comma + ((a41 < min && a41 > -min) ? zero : a41) + comma + ((a12 < min && a12 > -min) ? zero : a12) + comma + ((a22 < min && a22 > -min) ? zero : a22);
            if (rotationX || rotationY || sz !== 1) {
              transform += comma + ((a32 < min && a32 > -min) ? zero : a32) + comma + ((a42 < min && a42 > -min) ? zero : a42) + comma + ((a13 < min && a13 > -min) ? zero : a13);
              transform += comma + ((a23 < min && a23 > -min) ? zero : a23) + comma + ((a33 < min && a33 > -min) ? zero : a33) + comma + ((a43 < min && a43 > -min) ? zero : a43) + comma;
            } else {
              transform += ",0,0,0,0,1,0,";
            }
            transform += x + comma + y + comma + z + comma + (perspective ? (1 + (-z / perspective)) : 1) + ")";
            style[_transformProp] = transform;
          };
      p = Transform.prototype;
      p.x = p.y = p.z = p.skewX = p.skewY = p.rotation = p.rotationX = p.rotationY = p.zOrigin = p.xPercent = p.yPercent = p.xOffset = p.yOffset = 0;
      p.scaleX = p.scaleY = p.scaleZ = 1;
      _registerComplexSpecialProp("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {
        parser: function(t, e, p, cssp, pt, plugin, vars) {
          if (cssp._lastParsedTransform === vars) {
            return pt;
          }
          cssp._lastParsedTransform = vars;
          var originalGSTransform = t._gsTransform,
              style = t.style,
              min = 0.000001,
              i = _transformProps.length,
              v = vars,
              endRotations = {},
              transformOriginString = "transformOrigin",
              m1,
              m2,
              skewY,
              copy,
              orig,
              has3D,
              hasChange,
              dr,
              x,
              y;
          if (vars.display) {
            copy = _getStyle(t, "display");
            style.display = "block";
            m1 = _getTransform(t, _cs, true, vars.parseTransform);
            style.display = copy;
          } else {
            m1 = _getTransform(t, _cs, true, vars.parseTransform);
          }
          cssp._transform = m1;
          if (typeof(v.transform) === "string" && _transformProp) {
            copy = _tempDiv.style;
            copy[_transformProp] = v.transform;
            copy.display = "block";
            copy.position = "absolute";
            _doc.body.appendChild(_tempDiv);
            m2 = _getTransform(_tempDiv, null, false);
            _doc.body.removeChild(_tempDiv);
            if (!m2.perspective) {
              m2.perspective = m1.perspective;
            }
            if (v.xPercent != null) {
              m2.xPercent = _parseVal(v.xPercent, m1.xPercent);
            }
            if (v.yPercent != null) {
              m2.yPercent = _parseVal(v.yPercent, m1.yPercent);
            }
          } else if (typeof(v) === "object") {
            m2 = {
              scaleX: _parseVal((v.scaleX != null) ? v.scaleX : v.scale, m1.scaleX),
              scaleY: _parseVal((v.scaleY != null) ? v.scaleY : v.scale, m1.scaleY),
              scaleZ: _parseVal(v.scaleZ, m1.scaleZ),
              x: _parseVal(v.x, m1.x),
              y: _parseVal(v.y, m1.y),
              z: _parseVal(v.z, m1.z),
              xPercent: _parseVal(v.xPercent, m1.xPercent),
              yPercent: _parseVal(v.yPercent, m1.yPercent),
              perspective: _parseVal(v.transformPerspective, m1.perspective)
            };
            dr = v.directionalRotation;
            if (dr != null) {
              if (typeof(dr) === "object") {
                for (copy in dr) {
                  v[copy] = dr[copy];
                }
              } else {
                v.rotation = dr;
              }
            }
            if (typeof(v.x) === "string" && v.x.indexOf("%") !== -1) {
              m2.x = 0;
              m2.xPercent = _parseVal(v.x, m1.xPercent);
            }
            if (typeof(v.y) === "string" && v.y.indexOf("%") !== -1) {
              m2.y = 0;
              m2.yPercent = _parseVal(v.y, m1.yPercent);
            }
            m2.rotation = _parseAngle(("rotation" in v) ? v.rotation : ("shortRotation" in v) ? v.shortRotation + "_short" : ("rotationZ" in v) ? v.rotationZ : m1.rotation, m1.rotation, "rotation", endRotations);
            if (_supports3D) {
              m2.rotationX = _parseAngle(("rotationX" in v) ? v.rotationX : ("shortRotationX" in v) ? v.shortRotationX + "_short" : m1.rotationX || 0, m1.rotationX, "rotationX", endRotations);
              m2.rotationY = _parseAngle(("rotationY" in v) ? v.rotationY : ("shortRotationY" in v) ? v.shortRotationY + "_short" : m1.rotationY || 0, m1.rotationY, "rotationY", endRotations);
            }
            m2.skewX = (v.skewX == null) ? m1.skewX : _parseAngle(v.skewX, m1.skewX);
            m2.skewY = (v.skewY == null) ? m1.skewY : _parseAngle(v.skewY, m1.skewY);
            if ((skewY = m2.skewY - m1.skewY)) {
              m2.skewX += skewY;
              m2.rotation += skewY;
            }
          }
          if (_supports3D && v.force3D != null) {
            m1.force3D = v.force3D;
            hasChange = true;
          }
          m1.skewType = v.skewType || m1.skewType || CSSPlugin.defaultSkewType;
          has3D = (m1.force3D || m1.z || m1.rotationX || m1.rotationY || m2.z || m2.rotationX || m2.rotationY || m2.perspective);
          if (!has3D && v.scale != null) {
            m2.scaleZ = 1;
          }
          while (--i > -1) {
            p = _transformProps[i];
            orig = m2[p] - m1[p];
            if (orig > min || orig < -min || v[p] != null || _forcePT[p] != null) {
              hasChange = true;
              pt = new CSSPropTween(m1, p, m1[p], orig, pt);
              if (p in endRotations) {
                pt.e = endRotations[p];
              }
              pt.xs0 = 0;
              pt.plugin = plugin;
              cssp._overwriteProps.push(pt.n);
            }
          }
          orig = v.transformOrigin;
          if (m1.svg && (orig || v.svgOrigin)) {
            x = m1.xOffset;
            y = m1.yOffset;
            _parseSVGOrigin(t, _parsePosition(orig), m2, v.svgOrigin, v.smoothOrigin);
            pt = _addNonTweeningNumericPT(m1, "xOrigin", (originalGSTransform ? m1 : m2).xOrigin, m2.xOrigin, pt, transformOriginString);
            pt = _addNonTweeningNumericPT(m1, "yOrigin", (originalGSTransform ? m1 : m2).yOrigin, m2.yOrigin, pt, transformOriginString);
            if (x !== m1.xOffset || y !== m1.yOffset) {
              pt = _addNonTweeningNumericPT(m1, "xOffset", (originalGSTransform ? x : m1.xOffset), m1.xOffset, pt, transformOriginString);
              pt = _addNonTweeningNumericPT(m1, "yOffset", (originalGSTransform ? y : m1.yOffset), m1.yOffset, pt, transformOriginString);
            }
            orig = _useSVGTransformAttr ? null : "0px 0px";
          }
          if (orig || (_supports3D && has3D && m1.zOrigin)) {
            if (_transformProp) {
              hasChange = true;
              p = _transformOriginProp;
              orig = (orig || _getStyle(t, p, _cs, false, "50% 50%")) + "";
              pt = new CSSPropTween(style, p, 0, 0, pt, -1, transformOriginString);
              pt.b = style[p];
              pt.plugin = plugin;
              if (_supports3D) {
                copy = m1.zOrigin;
                orig = orig.split(" ");
                m1.zOrigin = ((orig.length > 2 && !(copy !== 0 && orig[2] === "0px")) ? parseFloat(orig[2]) : copy) || 0;
                pt.xs0 = pt.e = orig[0] + " " + (orig[1] || "50%") + " 0px";
                pt = new CSSPropTween(m1, "zOrigin", 0, 0, pt, -1, pt.n);
                pt.b = copy;
                pt.xs0 = pt.e = m1.zOrigin;
              } else {
                pt.xs0 = pt.e = orig;
              }
            } else {
              _parsePosition(orig + "", m1);
            }
          }
          if (hasChange) {
            cssp._transformType = (!(m1.svg && _useSVGTransformAttr) && (has3D || this._transformType === 3)) ? 3 : 2;
          }
          return pt;
        },
        prefix: true
      });
      _registerComplexSpecialProp("boxShadow", {
        defaultValue: "0px 0px 0px 0px #999",
        prefix: true,
        color: true,
        multi: true,
        keyword: "inset"
      });
      _registerComplexSpecialProp("borderRadius", {
        defaultValue: "0px",
        parser: function(t, e, p, cssp, pt, plugin) {
          e = this.format(e);
          var props = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
              style = t.style,
              ea1,
              i,
              es2,
              bs2,
              bs,
              es,
              bn,
              en,
              w,
              h,
              esfx,
              bsfx,
              rel,
              hn,
              vn,
              em;
          w = parseFloat(t.offsetWidth);
          h = parseFloat(t.offsetHeight);
          ea1 = e.split(" ");
          for (i = 0; i < props.length; i++) {
            if (this.p.indexOf("border")) {
              props[i] = _checkPropPrefix(props[i]);
            }
            bs = bs2 = _getStyle(t, props[i], _cs, false, "0px");
            if (bs.indexOf(" ") !== -1) {
              bs2 = bs.split(" ");
              bs = bs2[0];
              bs2 = bs2[1];
            }
            es = es2 = ea1[i];
            bn = parseFloat(bs);
            bsfx = bs.substr((bn + "").length);
            rel = (es.charAt(1) === "=");
            if (rel) {
              en = parseInt(es.charAt(0) + "1", 10);
              es = es.substr(2);
              en *= parseFloat(es);
              esfx = es.substr((en + "").length - (en < 0 ? 1 : 0)) || "";
            } else {
              en = parseFloat(es);
              esfx = es.substr((en + "").length);
            }
            if (esfx === "") {
              esfx = _suffixMap[p] || bsfx;
            }
            if (esfx !== bsfx) {
              hn = _convertToPixels(t, "borderLeft", bn, bsfx);
              vn = _convertToPixels(t, "borderTop", bn, bsfx);
              if (esfx === "%") {
                bs = (hn / w * 100) + "%";
                bs2 = (vn / h * 100) + "%";
              } else if (esfx === "em") {
                em = _convertToPixels(t, "borderLeft", 1, "em");
                bs = (hn / em) + "em";
                bs2 = (vn / em) + "em";
              } else {
                bs = hn + "px";
                bs2 = vn + "px";
              }
              if (rel) {
                es = (parseFloat(bs) + en) + esfx;
                es2 = (parseFloat(bs2) + en) + esfx;
              }
            }
            pt = _parseComplex(style, props[i], bs + " " + bs2, es + " " + es2, false, "0px", pt);
          }
          return pt;
        },
        prefix: true,
        formatter: _getFormatter("0px 0px 0px 0px", false, true)
      });
      _registerComplexSpecialProp("backgroundPosition", {
        defaultValue: "0 0",
        parser: function(t, e, p, cssp, pt, plugin) {
          var bp = "background-position",
              cs = (_cs || _getComputedStyle(t, null)),
              bs = this.format(((cs) ? _ieVers ? cs.getPropertyValue(bp + "-x") + " " + cs.getPropertyValue(bp + "-y") : cs.getPropertyValue(bp) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"),
              es = this.format(e),
              ba,
              ea,
              i,
              pct,
              overlap,
              src;
          if ((bs.indexOf("%") !== -1) !== (es.indexOf("%") !== -1)) {
            src = _getStyle(t, "backgroundImage").replace(_urlExp, "");
            if (src && src !== "none") {
              ba = bs.split(" ");
              ea = es.split(" ");
              _tempImg.setAttribute("src", src);
              i = 2;
              while (--i > -1) {
                bs = ba[i];
                pct = (bs.indexOf("%") !== -1);
                if (pct !== (ea[i].indexOf("%") !== -1)) {
                  overlap = (i === 0) ? t.offsetWidth - _tempImg.width : t.offsetHeight - _tempImg.height;
                  ba[i] = pct ? (parseFloat(bs) / 100 * overlap) + "px" : (parseFloat(bs) / overlap * 100) + "%";
                }
              }
              bs = ba.join(" ");
            }
          }
          return this.parseComplex(t.style, bs, es, pt, plugin);
        },
        formatter: _parsePosition
      });
      _registerComplexSpecialProp("backgroundSize", {
        defaultValue: "0 0",
        formatter: _parsePosition
      });
      _registerComplexSpecialProp("perspective", {
        defaultValue: "0px",
        prefix: true
      });
      _registerComplexSpecialProp("perspectiveOrigin", {
        defaultValue: "50% 50%",
        prefix: true
      });
      _registerComplexSpecialProp("transformStyle", {prefix: true});
      _registerComplexSpecialProp("backfaceVisibility", {prefix: true});
      _registerComplexSpecialProp("userSelect", {prefix: true});
      _registerComplexSpecialProp("margin", {parser: _getEdgeParser("marginTop,marginRight,marginBottom,marginLeft")});
      _registerComplexSpecialProp("padding", {parser: _getEdgeParser("paddingTop,paddingRight,paddingBottom,paddingLeft")});
      _registerComplexSpecialProp("clip", {
        defaultValue: "rect(0px,0px,0px,0px)",
        parser: function(t, e, p, cssp, pt, plugin) {
          var b,
              cs,
              delim;
          if (_ieVers < 9) {
            cs = t.currentStyle;
            delim = _ieVers < 8 ? " " : ",";
            b = "rect(" + cs.clipTop + delim + cs.clipRight + delim + cs.clipBottom + delim + cs.clipLeft + ")";
            e = this.format(e).split(",").join(delim);
          } else {
            b = this.format(_getStyle(t, this.p, _cs, false, this.dflt));
            e = this.format(e);
          }
          return this.parseComplex(t.style, b, e, pt, plugin);
        }
      });
      _registerComplexSpecialProp("textShadow", {
        defaultValue: "0px 0px 0px #999",
        color: true,
        multi: true
      });
      _registerComplexSpecialProp("autoRound,strictUnits", {parser: function(t, e, p, cssp, pt) {
          return pt;
        }});
      _registerComplexSpecialProp("border", {
        defaultValue: "0px solid #000",
        parser: function(t, e, p, cssp, pt, plugin) {
          return this.parseComplex(t.style, this.format(_getStyle(t, "borderTopWidth", _cs, false, "0px") + " " + _getStyle(t, "borderTopStyle", _cs, false, "solid") + " " + _getStyle(t, "borderTopColor", _cs, false, "#000")), this.format(e), pt, plugin);
        },
        color: true,
        formatter: function(v) {
          var a = v.split(" ");
          return a[0] + " " + (a[1] || "solid") + " " + (v.match(_colorExp) || ["#000"])[0];
        }
      });
      _registerComplexSpecialProp("borderWidth", {parser: _getEdgeParser("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")});
      _registerComplexSpecialProp("float,cssFloat,styleFloat", {parser: function(t, e, p, cssp, pt, plugin) {
          var s = t.style,
              prop = ("cssFloat" in s) ? "cssFloat" : "styleFloat";
          return new CSSPropTween(s, prop, 0, 0, pt, -1, p, false, 0, s[prop], e);
        }});
      var _setIEOpacityRatio = function(v) {
        var t = this.t,
            filters = t.filter || _getStyle(this.data, "filter") || "",
            val = (this.s + this.c * v) | 0,
            skip;
        if (val === 100) {
          if (filters.indexOf("atrix(") === -1 && filters.indexOf("radient(") === -1 && filters.indexOf("oader(") === -1) {
            t.removeAttribute("filter");
            skip = (!_getStyle(this.data, "filter"));
          } else {
            t.filter = filters.replace(_alphaFilterExp, "");
            skip = true;
          }
        }
        if (!skip) {
          if (this.xn1) {
            t.filter = filters = filters || ("alpha(opacity=" + val + ")");
          }
          if (filters.indexOf("pacity") === -1) {
            if (val !== 0 || !this.xn1) {
              t.filter = filters + " alpha(opacity=" + val + ")";
            }
          } else {
            t.filter = filters.replace(_opacityExp, "opacity=" + val);
          }
        }
      };
      _registerComplexSpecialProp("opacity,alpha,autoAlpha", {
        defaultValue: "1",
        parser: function(t, e, p, cssp, pt, plugin) {
          var b = parseFloat(_getStyle(t, "opacity", _cs, false, "1")),
              style = t.style,
              isAutoAlpha = (p === "autoAlpha");
          if (typeof(e) === "string" && e.charAt(1) === "=") {
            e = ((e.charAt(0) === "-") ? -1 : 1) * parseFloat(e.substr(2)) + b;
          }
          if (isAutoAlpha && b === 1 && _getStyle(t, "visibility", _cs) === "hidden" && e !== 0) {
            b = 0;
          }
          if (_supportsOpacity) {
            pt = new CSSPropTween(style, "opacity", b, e - b, pt);
          } else {
            pt = new CSSPropTween(style, "opacity", b * 100, (e - b) * 100, pt);
            pt.xn1 = isAutoAlpha ? 1 : 0;
            style.zoom = 1;
            pt.type = 2;
            pt.b = "alpha(opacity=" + pt.s + ")";
            pt.e = "alpha(opacity=" + (pt.s + pt.c) + ")";
            pt.data = t;
            pt.plugin = plugin;
            pt.setRatio = _setIEOpacityRatio;
          }
          if (isAutoAlpha) {
            pt = new CSSPropTween(style, "visibility", 0, 0, pt, -1, null, false, 0, ((b !== 0) ? "inherit" : "hidden"), ((e === 0) ? "hidden" : "inherit"));
            pt.xs0 = "inherit";
            cssp._overwriteProps.push(pt.n);
            cssp._overwriteProps.push(p);
          }
          return pt;
        }
      });
      var _removeProp = function(s, p) {
        if (p) {
          if (s.removeProperty) {
            if (p.substr(0, 2) === "ms" || p.substr(0, 6) === "webkit") {
              p = "-" + p;
            }
            s.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
          } else {
            s.removeAttribute(p);
          }
        }
      },
          _setClassNameRatio = function(v) {
            this.t._gsClassPT = this;
            if (v === 1 || v === 0) {
              this.t.setAttribute("class", (v === 0) ? this.b : this.e);
              var mpt = this.data,
                  s = this.t.style;
              while (mpt) {
                if (!mpt.v) {
                  _removeProp(s, mpt.p);
                } else {
                  s[mpt.p] = mpt.v;
                }
                mpt = mpt._next;
              }
              if (v === 1 && this.t._gsClassPT === this) {
                this.t._gsClassPT = null;
              }
            } else if (this.t.getAttribute("class") !== this.e) {
              this.t.setAttribute("class", this.e);
            }
          };
      _registerComplexSpecialProp("className", {parser: function(t, e, p, cssp, pt, plugin, vars) {
          var b = t.getAttribute("class") || "",
              cssText = t.style.cssText,
              difData,
              bs,
              cnpt,
              cnptLookup,
              mpt;
          pt = cssp._classNamePT = new CSSPropTween(t, p, 0, 0, pt, 2);
          pt.setRatio = _setClassNameRatio;
          pt.pr = -11;
          _hasPriority = true;
          pt.b = b;
          bs = _getAllStyles(t, _cs);
          cnpt = t._gsClassPT;
          if (cnpt) {
            cnptLookup = {};
            mpt = cnpt.data;
            while (mpt) {
              cnptLookup[mpt.p] = 1;
              mpt = mpt._next;
            }
            cnpt.setRatio(1);
          }
          t._gsClassPT = pt;
          pt.e = (e.charAt(1) !== "=") ? e : b.replace(new RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + ((e.charAt(0) === "+") ? " " + e.substr(2) : "");
          t.setAttribute("class", pt.e);
          difData = _cssDif(t, bs, _getAllStyles(t), vars, cnptLookup);
          t.setAttribute("class", b);
          pt.data = difData.firstMPT;
          t.style.cssText = cssText;
          pt = pt.xfirst = cssp.parse(t, difData.difs, pt, plugin);
          return pt;
        }});
      var _setClearPropsRatio = function(v) {
        if (v === 1 || v === 0)
          if (this.data._totalTime === this.data._totalDuration && this.data.data !== "isFromStart") {
            var s = this.t.style,
                transformParse = _specialProps.transform.parse,
                a,
                p,
                i,
                clearTransform,
                transform;
            if (this.e === "all") {
              s.cssText = "";
              clearTransform = true;
            } else {
              a = this.e.split(" ").join("").split(",");
              i = a.length;
              while (--i > -1) {
                p = a[i];
                if (_specialProps[p]) {
                  if (_specialProps[p].parse === transformParse) {
                    clearTransform = true;
                  } else {
                    p = (p === "transformOrigin") ? _transformOriginProp : _specialProps[p].p;
                  }
                }
                _removeProp(s, p);
              }
            }
            if (clearTransform) {
              _removeProp(s, _transformProp);
              transform = this.t._gsTransform;
              if (transform) {
                if (transform.svg) {
                  this.t.removeAttribute("data-svg-origin");
                  this.t.removeAttribute("transform");
                }
                delete this.t._gsTransform;
              }
            }
          }
      };
      _registerComplexSpecialProp("clearProps", {parser: function(t, e, p, cssp, pt) {
          pt = new CSSPropTween(t, p, 0, 0, pt, 2);
          pt.setRatio = _setClearPropsRatio;
          pt.e = e;
          pt.pr = -10;
          pt.data = cssp._tween;
          _hasPriority = true;
          return pt;
        }});
      p = "bezier,throwProps,physicsProps,physics2D".split(",");
      i = p.length;
      while (i--) {
        _registerPluginProp(p[i]);
      }
      p = CSSPlugin.prototype;
      p._firstPT = p._lastParsedTransform = p._transform = null;
      p._onInitTween = function(target, vars, tween) {
        if (!target.nodeType) {
          return false;
        }
        this._target = target;
        this._tween = tween;
        this._vars = vars;
        _autoRound = vars.autoRound;
        _hasPriority = false;
        _suffixMap = vars.suffixMap || CSSPlugin.suffixMap;
        _cs = _getComputedStyle(target, "");
        _overwriteProps = this._overwriteProps;
        var style = target.style,
            v,
            pt,
            pt2,
            first,
            last,
            next,
            zIndex,
            tpt,
            threeD;
        if (_reqSafariFix)
          if (style.zIndex === "") {
            v = _getStyle(target, "zIndex", _cs);
            if (v === "auto" || v === "") {
              this._addLazySet(style, "zIndex", 0);
            }
          }
        if (typeof(vars) === "string") {
          first = style.cssText;
          v = _getAllStyles(target, _cs);
          style.cssText = first + ";" + vars;
          v = _cssDif(target, v, _getAllStyles(target)).difs;
          if (!_supportsOpacity && _opacityValExp.test(vars)) {
            v.opacity = parseFloat(RegExp.$1);
          }
          vars = v;
          style.cssText = first;
        }
        if (vars.className) {
          this._firstPT = pt = _specialProps.className.parse(target, vars.className, "className", this, null, null, vars);
        } else {
          this._firstPT = pt = this.parse(target, vars, null);
        }
        if (this._transformType) {
          threeD = (this._transformType === 3);
          if (!_transformProp) {
            style.zoom = 1;
          } else if (_isSafari) {
            _reqSafariFix = true;
            if (style.zIndex === "") {
              zIndex = _getStyle(target, "zIndex", _cs);
              if (zIndex === "auto" || zIndex === "") {
                this._addLazySet(style, "zIndex", 0);
              }
            }
            if (_isSafariLT6) {
              this._addLazySet(style, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (threeD ? "visible" : "hidden"));
            }
          }
          pt2 = pt;
          while (pt2 && pt2._next) {
            pt2 = pt2._next;
          }
          tpt = new CSSPropTween(target, "transform", 0, 0, null, 2);
          this._linkCSSP(tpt, null, pt2);
          tpt.setRatio = _transformProp ? _setTransformRatio : _setIETransformRatio;
          tpt.data = this._transform || _getTransform(target, _cs, true);
          tpt.tween = tween;
          tpt.pr = -1;
          _overwriteProps.pop();
        }
        if (_hasPriority) {
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
          this._firstPT = first;
        }
        return true;
      };
      p.parse = function(target, vars, pt, plugin) {
        var style = target.style,
            p,
            sp,
            bn,
            en,
            bs,
            es,
            bsfx,
            esfx,
            isStr,
            rel;
        for (p in vars) {
          es = vars[p];
          sp = _specialProps[p];
          if (sp) {
            pt = sp.parse(target, es, p, this, pt, plugin, vars);
          } else {
            bs = _getStyle(target, p, _cs) + "";
            isStr = (typeof(es) === "string");
            if (p === "color" || p === "fill" || p === "stroke" || p.indexOf("Color") !== -1 || (isStr && _rgbhslExp.test(es))) {
              if (!isStr) {
                es = _parseColor(es);
                es = ((es.length > 3) ? "rgba(" : "rgb(") + es.join(",") + ")";
              }
              pt = _parseComplex(style, p, bs, es, true, "transparent", pt, 0, plugin);
            } else if (isStr && (es.indexOf(" ") !== -1 || es.indexOf(",") !== -1)) {
              pt = _parseComplex(style, p, bs, es, true, null, pt, 0, plugin);
            } else {
              bn = parseFloat(bs);
              bsfx = (bn || bn === 0) ? bs.substr((bn + "").length) : "";
              if (bs === "" || bs === "auto") {
                if (p === "width" || p === "height") {
                  bn = _getDimension(target, p, _cs);
                  bsfx = "px";
                } else if (p === "left" || p === "top") {
                  bn = _calculateOffset(target, p, _cs);
                  bsfx = "px";
                } else {
                  bn = (p !== "opacity") ? 0 : 1;
                  bsfx = "";
                }
              }
              rel = (isStr && es.charAt(1) === "=");
              if (rel) {
                en = parseInt(es.charAt(0) + "1", 10);
                es = es.substr(2);
                en *= parseFloat(es);
                esfx = es.replace(_suffixExp, "");
              } else {
                en = parseFloat(es);
                esfx = isStr ? es.replace(_suffixExp, "") : "";
              }
              if (esfx === "") {
                esfx = (p in _suffixMap) ? _suffixMap[p] : bsfx;
              }
              es = (en || en === 0) ? (rel ? en + bn : en) + esfx : vars[p];
              if (bsfx !== esfx)
                if (esfx !== "")
                  if (en || en === 0)
                    if (bn) {
                      bn = _convertToPixels(target, p, bn, bsfx);
                      if (esfx === "%") {
                        bn /= _convertToPixels(target, p, 100, "%") / 100;
                        if (vars.strictUnits !== true) {
                          bs = bn + "%";
                        }
                      } else if (esfx === "em" || esfx === "rem" || esfx === "vw" || esfx === "vh") {
                        bn /= _convertToPixels(target, p, 1, esfx);
                      } else if (esfx !== "px") {
                        en = _convertToPixels(target, p, en, esfx);
                        esfx = "px";
                      }
                      if (rel)
                        if (en || en === 0) {
                          es = (en + bn) + esfx;
                        }
                    }
              if (rel) {
                en += bn;
              }
              if ((bn || bn === 0) && (en || en === 0)) {
                pt = new CSSPropTween(style, p, bn, en - bn, pt, 0, p, (_autoRound !== false && (esfx === "px" || p === "zIndex")), 0, bs, es);
                pt.xs0 = esfx;
              } else if (style[p] === undefined || !es && (es + "" === "NaN" || es == null)) {
                _log("invalid " + p + " tween value: " + vars[p]);
              } else {
                pt = new CSSPropTween(style, p, en || bn || 0, 0, pt, -1, p, false, 0, bs, es);
                pt.xs0 = (es === "none" && (p === "display" || p.indexOf("Style") !== -1)) ? bs : es;
              }
            }
          }
          if (plugin)
            if (pt && !pt.plugin) {
              pt.plugin = plugin;
            }
        }
        return pt;
      };
      p.setRatio = function(v) {
        var pt = this._firstPT,
            min = 0.000001,
            val,
            str,
            i;
        if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
          while (pt) {
            if (pt.type !== 2) {
              if (pt.r && pt.type !== -1) {
                val = Math.round(pt.s + pt.c);
                if (!pt.type) {
                  pt.t[pt.p] = val + pt.xs0;
                } else if (pt.type === 1) {
                  i = pt.l;
                  str = pt.xs0 + val + pt.xs1;
                  for (i = 1; i < pt.l; i++) {
                    str += pt["xn" + i] + pt["xs" + (i + 1)];
                  }
                  pt.t[pt.p] = str;
                }
              } else {
                pt.t[pt.p] = pt.e;
              }
            } else {
              pt.setRatio(v);
            }
            pt = pt._next;
          }
        } else if (v || !(this._tween._time === this._tween._duration || this._tween._time === 0) || this._tween._rawPrevTime === -0.000001) {
          while (pt) {
            val = pt.c * v + pt.s;
            if (pt.r) {
              val = Math.round(val);
            } else if (val < min)
              if (val > -min) {
                val = 0;
              }
            if (!pt.type) {
              pt.t[pt.p] = val + pt.xs0;
            } else if (pt.type === 1) {
              i = pt.l;
              if (i === 2) {
                pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2;
              } else if (i === 3) {
                pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3;
              } else if (i === 4) {
                pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4;
              } else if (i === 5) {
                pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4 + pt.xn4 + pt.xs5;
              } else {
                str = pt.xs0 + val + pt.xs1;
                for (i = 1; i < pt.l; i++) {
                  str += pt["xn" + i] + pt["xs" + (i + 1)];
                }
                pt.t[pt.p] = str;
              }
            } else if (pt.type === -1) {
              pt.t[pt.p] = pt.xs0;
            } else if (pt.setRatio) {
              pt.setRatio(v);
            }
            pt = pt._next;
          }
        } else {
          while (pt) {
            if (pt.type !== 2) {
              pt.t[pt.p] = pt.b;
            } else {
              pt.setRatio(v);
            }
            pt = pt._next;
          }
        }
      };
      p._enableTransforms = function(threeD) {
        this._transform = this._transform || _getTransform(this._target, _cs, true);
        this._transformType = (!(this._transform.svg && _useSVGTransformAttr) && (threeD || this._transformType === 3)) ? 3 : 2;
      };
      var lazySet = function(v) {
        this.t[this.p] = this.e;
        this.data._linkCSSP(this, this._next, null, true);
      };
      p._addLazySet = function(t, p, v) {
        var pt = this._firstPT = new CSSPropTween(t, p, 0, 0, this._firstPT, 2);
        pt.e = v;
        pt.setRatio = lazySet;
        pt.data = this;
      };
      p._linkCSSP = function(pt, next, prev, remove) {
        if (pt) {
          if (next) {
            next._prev = pt;
          }
          if (pt._next) {
            pt._next._prev = pt._prev;
          }
          if (pt._prev) {
            pt._prev._next = pt._next;
          } else if (this._firstPT === pt) {
            this._firstPT = pt._next;
            remove = true;
          }
          if (prev) {
            prev._next = pt;
          } else if (!remove && this._firstPT === null) {
            this._firstPT = pt;
          }
          pt._next = next;
          pt._prev = prev;
        }
        return pt;
      };
      p._kill = function(lookup) {
        var copy = lookup,
            pt,
            p,
            xfirst;
        if (lookup.autoAlpha || lookup.alpha) {
          copy = {};
          for (p in lookup) {
            copy[p] = lookup[p];
          }
          copy.opacity = 1;
          if (copy.autoAlpha) {
            copy.visibility = 1;
          }
        }
        if (lookup.className && (pt = this._classNamePT)) {
          xfirst = pt.xfirst;
          if (xfirst && xfirst._prev) {
            this._linkCSSP(xfirst._prev, pt._next, xfirst._prev._prev);
          } else if (xfirst === this._firstPT) {
            this._firstPT = pt._next;
          }
          if (pt._next) {
            this._linkCSSP(pt._next, pt._next._next, xfirst._prev);
          }
          this._classNamePT = null;
        }
        return TweenPlugin.prototype._kill.call(this, copy);
      };
      var _getChildStyles = function(e, props, targets) {
        var children,
            i,
            child,
            type;
        if (e.slice) {
          i = e.length;
          while (--i > -1) {
            _getChildStyles(e[i], props, targets);
          }
          return;
        }
        children = e.childNodes;
        i = children.length;
        while (--i > -1) {
          child = children[i];
          type = child.type;
          if (child.style) {
            props.push(_getAllStyles(child));
            if (targets) {
              targets.push(child);
            }
          }
          if ((type === 1 || type === 9 || type === 11) && child.childNodes.length) {
            _getChildStyles(child, props, targets);
          }
        }
      };
      CSSPlugin.cascadeTo = function(target, duration, vars) {
        var tween = TweenLite.to(target, duration, vars),
            results = [tween],
            b = [],
            e = [],
            targets = [],
            _reservedProps = TweenLite._internals.reservedProps,
            i,
            difs,
            p,
            from;
        target = tween._targets || tween.target;
        _getChildStyles(target, b, targets);
        tween.render(duration, true, true);
        _getChildStyles(target, e);
        tween.render(0, true, true);
        tween._enabled(true);
        i = targets.length;
        while (--i > -1) {
          difs = _cssDif(targets[i], b[i], e[i]);
          if (difs.firstMPT) {
            difs = difs.difs;
            for (p in vars) {
              if (_reservedProps[p]) {
                difs[p] = vars[p];
              }
            }
            from = {};
            for (p in difs) {
              from[p] = b[i][p];
            }
            results.push(TweenLite.fromTo(targets[i], duration, from, difs));
          }
        }
        return results;
      };
      TweenPlugin.activate([CSSPlugin]);
      return CSSPlugin;
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
      require('../TweenLite');
      module.exports = getGlobal();
    }
  }("CSSPlugin"));
})(require('process'));
