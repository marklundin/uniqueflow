/* */ 
"format cjs";
(function(process) {
  var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window;
  (_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("utils.Draggable", ["events.EventDispatcher", "TweenLite", "plugins.CSSPlugin"], function(EventDispatcher, TweenLite, CSSPlugin) {
      var _tempVarsXY = {css: {}},
          _tempVarsX = {css: {}},
          _tempVarsY = {css: {}},
          _tempVarsRotation = {css: {}},
          _globals = _gsScope._gsDefine.globals,
          _tempEvent = {},
          _doc = document,
          _docElement = _doc.documentElement || {},
          _createElement = function(type) {
            return _doc.createElementNS ? _doc.createElementNS("http://www.w3.org/1999/xhtml", type) : _doc.createElement(type);
          },
          _tempDiv = _createElement("div"),
          _emptyArray = [],
          _emptyFunc = function() {
            return false;
          },
          _RAD2DEG = 180 / Math.PI,
          _max = 999999999999999,
          _getTime = Date.now || function() {
            return new Date().getTime();
          },
          _isOldIE = !!(!_doc.addEventListener && _doc.all),
          _placeholderDiv = _doc.createElement("div"),
          _renderQueue = [],
          _lookup = {},
          _lookupCount = 0,
          _clickableTagExp = /^(?:a|input|textarea|button|select)$/i,
          _dragCount = 0,
          _prefix,
          _isMultiTouching,
          _isAndroid = (navigator.userAgent.toLowerCase().indexOf("android") !== -1),
          _lastDragTime = 0,
          _temp1 = {},
          _temp2 = {},
          _windowProxy = {},
          _slice = function(a) {
            if (typeof(a) === "string") {
              a = TweenLite.selector(a);
            }
            if (!a || a.nodeType) {
              return [a];
            }
            var b = [],
                l = a.length,
                i;
            for (i = 0; i !== l; b.push(a[i++]))
              ;
            return b;
          },
          _copy = function(obj) {
            var copy = {},
                p;
            for (p in obj) {
              copy[p] = obj[p];
            }
            return copy;
          },
          ThrowPropsPlugin,
          _renderQueueTick = function() {
            var i = _renderQueue.length;
            while (--i > -1) {
              _renderQueue[i]();
            }
          },
          _addToRenderQueue = function(func) {
            _renderQueue.push(func);
            if (_renderQueue.length === 1) {
              TweenLite.ticker.addEventListener("tick", _renderQueueTick, this, false, 1);
            }
          },
          _removeFromRenderQueue = function(func) {
            var i = _renderQueue.length;
            while (--i > -1) {
              if (_renderQueue[i] === func) {
                _renderQueue.splice(i, 1);
              }
            }
            TweenLite.to(_renderQueueTimeout, 0, {
              overwrite: "all",
              delay: 15,
              onComplete: _renderQueueTimeout
            });
          },
          _renderQueueTimeout = function() {
            if (!_renderQueue.length) {
              TweenLite.ticker.removeEventListener("tick", _renderQueueTick);
            }
          },
          _extend = function(obj, defaults) {
            var p;
            for (p in defaults) {
              if (obj[p] === undefined) {
                obj[p] = defaults[p];
              }
            }
            return obj;
          },
          _getDocScrollTop = function() {
            return (window.pageYOffset != null) ? window.pageYOffset : (_doc.scrollTop != null) ? _doc.scrollTop : _docElement.scrollTop || _doc.body.scrollTop || 0;
          },
          _getDocScrollLeft = function() {
            return (window.pageXOffset != null) ? window.pageXOffset : (_doc.scrollLeft != null) ? _doc.scrollLeft : _docElement.scrollLeft || _doc.body.scrollLeft || 0;
          },
          _addScrollListener = function(e, callback) {
            _addListener(e, "scroll", callback);
            if (!_isRoot(e.parentNode)) {
              _addScrollListener(e.parentNode, callback);
            }
          },
          _removeScrollListener = function(e, callback) {
            _removeListener(e, "scroll", callback);
            if (!_isRoot(e.parentNode)) {
              _removeScrollListener(e.parentNode, callback);
            }
          },
          _isRoot = function(e) {
            return !!(!e || e === _docElement || e === _doc || e === _doc.body || e === window || !e.nodeType || !e.parentNode);
          },
          _getMaxScroll = function(element, axis) {
            var dim = (axis === "x") ? "Width" : "Height",
                scroll = "scroll" + dim,
                client = "client" + dim,
                body = _doc.body;
            return Math.max(0, _isRoot(element) ? Math.max(_docElement[scroll], body[scroll]) - (window["inner" + dim] || _docElement[client] || body[client]) : element[scroll] - element[client]);
          },
          _recordMaxScrolls = function(e) {
            var isRoot = _isRoot(e),
                x = _getMaxScroll(e, "x"),
                y = _getMaxScroll(e, "y");
            if (isRoot) {
              e = _windowProxy;
            } else {
              _recordMaxScrolls(e.parentNode);
            }
            e._gsMaxScrollX = x;
            e._gsMaxScrollY = y;
            e._gsScrollX = e.scrollLeft || 0;
            e._gsScrollY = e.scrollTop || 0;
          },
          _populateIEEvent = function(e, preventDefault) {
            e = e || window.event;
            _tempEvent.pageX = e.clientX + _doc.body.scrollLeft + _docElement.scrollLeft;
            _tempEvent.pageY = e.clientY + _doc.body.scrollTop + _docElement.scrollTop;
            if (preventDefault) {
              e.returnValue = false;
            }
            return _tempEvent;
          },
          _unwrapElement = function(value) {
            if (!value) {
              return value;
            }
            if (typeof(value) === "string") {
              value = TweenLite.selector(value);
            }
            if (value.length && value !== window && value[0] && value[0].style && !value.nodeType) {
              value = value[0];
            }
            return (value === window || (value.nodeType && value.style)) ? value : null;
          },
          _checkPrefix = function(e, p) {
            var s = e.style,
                capped,
                i,
                a;
            if (s[p] === undefined) {
              a = ["O", "Moz", "ms", "Ms", "Webkit"];
              i = 5;
              capped = p.charAt(0).toUpperCase() + p.substr(1);
              while (--i > -1 && s[a[i] + capped] === undefined) {}
              if (i < 0) {
                return "";
              }
              _prefix = (i === 3) ? "ms" : a[i];
              p = _prefix + capped;
            }
            return p;
          },
          _setStyle = function(e, p, value) {
            var s = e.style;
            if (!s) {
              return;
            }
            if (s[p] === undefined) {
              p = _checkPrefix(e, p);
            }
            if (value == null) {
              if (s.removeProperty) {
                s.removeProperty(p.replace(/([A-Z])/g, "-$1").toLowerCase());
              } else {
                s.removeAttribute(p);
              }
            } else if (s[p] !== undefined) {
              s[p] = value;
            }
          },
          _getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : _emptyFunc,
          _horizExp = /(?:Left|Right|Width)/i,
          _suffixExp = /(?:\d|\-|\+|=|#|\.)*/g,
          _convertToPixels = function(t, p, v, sfx, recurse) {
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
                pix;
            if (neg) {
              v = -v;
            }
            if (sfx === "%" && p.indexOf("border") !== -1) {
              pix = (v / 100) * (horiz ? t.clientWidth : t.clientHeight);
            } else {
              style.cssText = "border:0 solid red;position:" + _getStyle(t, "position", true) + ";line-height:0;";
              if (sfx === "%" || !node.appendChild) {
                node = t.parentNode || _doc.body;
                style[(horiz ? "width" : "height")] = v + sfx;
              } else {
                style[(horiz ? "borderLeftWidth" : "borderTopWidth")] = v + sfx;
              }
              node.appendChild(_tempDiv);
              pix = parseFloat(_tempDiv[(horiz ? "offsetWidth" : "offsetHeight")]);
              node.removeChild(_tempDiv);
              if (pix === 0 && !recurse) {
                pix = _convertToPixels(t, p, v, sfx, true);
              }
            }
            return neg ? -pix : pix;
          },
          _calculateOffset = function(t, p) {
            if (_getStyle(t, "position", true) !== "absolute") {
              return 0;
            }
            var dim = ((p === "left") ? "Left" : "Top"),
                v = _getStyle(t, "margin" + dim, true);
            return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), (v + "").replace(_suffixExp, "")) || 0);
          },
          _getStyle = function(element, prop, keepUnits) {
            var rv = (element._gsTransform || {})[prop],
                cs;
            if (rv || rv === 0) {
              return rv;
            } else if (element.style[prop]) {
              rv = element.style[prop];
            } else if ((cs = _getComputedStyle(element))) {
              rv = cs.getPropertyValue(prop.replace(/([A-Z])/g, "-$1").toLowerCase());
              rv = (rv || cs.length) ? rv : cs[prop];
            } else if (element.currentStyle) {
              rv = element.currentStyle[prop];
            }
            if (rv === "auto" && (prop === "top" || prop === "left")) {
              rv = _calculateOffset(element, prop);
            }
            return keepUnits ? rv : parseFloat(rv) || 0;
          },
          _dispatchEvent = function(instance, type, callbackName) {
            var vars = instance.vars,
                callback = vars[callbackName],
                listeners = instance._listeners[type];
            if (typeof(callback) === "function") {
              callback.apply(vars[callbackName + "Scope"] || vars.callbackScope || instance, vars[callbackName + "Params"] || [instance.pointerEvent]);
            }
            if (listeners) {
              instance.dispatchEvent(type);
            }
          },
          _getBounds = function(obj, context) {
            var e = _unwrapElement(obj),
                top,
                left,
                offset;
            if (!e) {
              if (obj.left !== undefined) {
                offset = _getOffsetTransformOrigin(context);
                return {
                  left: obj.left - offset.x,
                  top: obj.top - offset.y,
                  width: obj.width,
                  height: obj.height
                };
              }
              left = obj.min || obj.minX || obj.minRotation || 0;
              top = obj.min || obj.minY || 0;
              return {
                left: left,
                top: top,
                width: (obj.max || obj.maxX || obj.maxRotation || 0) - left,
                height: (obj.max || obj.maxY || 0) - top
              };
            }
            return _getElementBounds(e, context);
          },
          _svgBorderFactor,
          _svgBorderScales,
          _svgScrollOffset,
          _hasBorderBug,
          _setEnvironmentVariables = function() {
            if (!_doc.createElementNS) {
              _svgBorderFactor = 0;
              _svgBorderScales = false;
              return;
            }
            var div = _createElement("div"),
                svg = _doc.createElementNS("http://www.w3.org/2000/svg", "svg"),
                wrapper = _createElement("div"),
                style = div.style,
                parent = _doc.body || _docElement,
                matrix,
                e1,
                point,
                oldValue;
            if (_doc.body && _transformProp) {
              style.position = wrapper.style.position = "absolute";
              parent.appendChild(wrapper);
              wrapper.appendChild(div);
              style.height = "10px";
              oldValue = div.offsetTop;
              wrapper.style.border = "5px solid red";
              _hasBorderBug = (oldValue !== div.offsetTop);
              parent.removeChild(wrapper);
            }
            style = svg.style;
            svg.setAttributeNS(null, "width", "400px");
            svg.setAttributeNS(null, "height", "400px");
            svg.setAttributeNS(null, "viewBox", "0 0 400 400");
            style.display = "block";
            style.boxSizing = "border-box";
            style.border = "0px solid red";
            style.transform = "none";
            div.style.cssText = "width:100px;height:100px;overflow:scroll;-ms-overflow-style:none;";
            parent.appendChild(div);
            div.appendChild(svg);
            point = svg.createSVGPoint().matrixTransform(svg.getScreenCTM());
            e1 = point.y;
            div.scrollTop = 100;
            point.x = point.y = 0;
            point = point.matrixTransform(svg.getScreenCTM());
            _svgScrollOffset = (e1 - point.y < 100.1) ? 0 : e1 - point.y - 150;
            div.removeChild(svg);
            parent.removeChild(div);
            parent.appendChild(svg);
            matrix = svg.getScreenCTM();
            e1 = matrix.e;
            style.border = "50px solid red";
            matrix = svg.getScreenCTM();
            if (e1 === 0 && matrix.e === 0 && matrix.f === 0 && matrix.a === 1) {
              _svgBorderFactor = 1;
              _svgBorderScales = true;
            } else {
              _svgBorderFactor = (e1 !== matrix.e) ? 1 : 0;
              _svgBorderScales = (matrix.a !== 1);
            }
            parent.removeChild(svg);
          },
          _supports3D = (_checkPrefix(_tempDiv, "perspective") !== ""),
          _transformOriginProp = _checkPrefix(_tempDiv, "transformOrigin").replace(/^ms/g, "Ms").replace(/([A-Z])/g, "-$1").toLowerCase(),
          _transformProp = _checkPrefix(_tempDiv, "transform"),
          _transformPropCSS = _transformProp.replace(/^ms/g, "Ms").replace(/([A-Z])/g, "-$1").toLowerCase(),
          _point1 = {},
          _point2 = {},
          _SVGElement = window.SVGElement,
          _isSVG = function(e) {
            return !!(_SVGElement && typeof(e.getBBox) === "function" && e.getCTM && (!e.parentNode || (e.parentNode.getBBox && e.parentNode.getCTM)));
          },
          _isIE10orBelow = (((/MSIE ([0-9]{1,}[\.0-9]{0,})/).exec(navigator.userAgent) || (/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/).exec(navigator.userAgent)) && parseFloat(RegExp.$1) < 11),
          _tempTransforms = [],
          _tempElements = [],
          _getSVGOffsets = function(e) {
            if (!e.getBoundingClientRect || !e.parentNode || !_transformProp) {
              return {
                offsetTop: 0,
                offsetLeft: 0,
                scaleX: 1,
                scaleY: 1,
                offsetParent: _docElement
              };
            }
            if (Draggable.cacheSVGData !== false && e._gsCache && e._gsCache.lastUpdate === TweenLite.ticker.frame) {
              return e._gsCache;
            }
            var curElement = e,
                cache = _cache(e),
                eRect,
                parentRect,
                offsetParent,
                cs,
                m,
                i,
                point1,
                point2,
                borderWidth,
                borderHeight,
                width,
                height;
            cache.lastUpdate = TweenLite.ticker.frame;
            if (e.getBBox && !cache.isSVGRoot) {
              curElement = e.parentNode;
              eRect = e.getBBox();
              while (curElement && (curElement.nodeName + "").toLowerCase() !== "svg") {
                curElement = curElement.parentNode;
              }
              cs = _getSVGOffsets(curElement);
              cache.offsetTop = eRect.y * cs.scaleY;
              cache.offsetLeft = eRect.x * cs.scaleX;
              cache.scaleX = cs.scaleX;
              cache.scaleY = cs.scaleY;
              cache.offsetParent = curElement || _docElement;
              return cache;
            }
            offsetParent = cache.offsetParent;
            if (offsetParent === _doc.body) {
              offsetParent = _docElement;
            }
            _tempElements.length = _tempTransforms.length = 0;
            while (curElement) {
              m = _getStyle(curElement, _transformProp, true);
              if (m !== "matrix(1, 0, 0, 1, 0, 0)" && m !== "none" && m !== "translate3d(0px, 0px, 0px)") {
                _tempElements.push(curElement);
                _tempTransforms.push(curElement.style[_transformProp]);
                curElement.style[_transformProp] = "none";
              }
              if (curElement === offsetParent) {
                break;
              }
              curElement = curElement.parentNode;
            }
            parentRect = offsetParent.getBoundingClientRect();
            m = e.getScreenCTM();
            point2 = e.createSVGPoint();
            point1 = point2.matrixTransform(m);
            point2.x = point2.y = 10;
            point2 = point2.matrixTransform(m);
            cache.scaleX = (point2.x - point1.x) / 10;
            cache.scaleY = (point2.y - point1.y) / 10;
            if (_svgBorderFactor === undefined) {
              _setEnvironmentVariables();
            }
            if (cache.borderBox && !_svgBorderScales && e.getAttribute("width")) {
              cs = _getComputedStyle(e) || {};
              borderWidth = (parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)) || 0;
              borderHeight = (parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)) || 0;
              width = parseFloat(cs.width) || 0;
              height = parseFloat(cs.height) || 0;
              cache.scaleX *= (width - borderWidth) / width;
              cache.scaleY *= (height - borderHeight) / height;
            }
            if (_svgScrollOffset) {
              eRect = e.getBoundingClientRect();
              cache.offsetLeft = eRect.left - parentRect.left;
              cache.offsetTop = eRect.top - parentRect.top;
            } else {
              cache.offsetLeft = point1.x - parentRect.left;
              cache.offsetTop = point1.y - parentRect.top;
            }
            cache.offsetParent = offsetParent;
            i = _tempElements.length;
            while (--i > -1) {
              _tempElements[i].style[_transformProp] = _tempTransforms[i];
            }
            return cache;
          },
          _getOffsetTransformOrigin = function(e, decoratee) {
            decoratee = decoratee || {};
            if (!e || e === _docElement || !e.parentNode || e === window) {
              return {
                x: 0,
                y: 0
              };
            }
            var cs = _getComputedStyle(e),
                v = (_transformOriginProp && cs) ? cs.getPropertyValue(_transformOriginProp) : "50% 50%",
                a = v.split(" "),
                x = (v.indexOf("left") !== -1) ? "0%" : (v.indexOf("right") !== -1) ? "100%" : a[0],
                y = (v.indexOf("top") !== -1) ? "0%" : (v.indexOf("bottom") !== -1) ? "100%" : a[1];
            if (y === "center" || y == null) {
              y = "50%";
            }
            if (x === "center" || isNaN(parseFloat(x))) {
              x = "50%";
            }
            if (e.getBBox && _isSVG(e)) {
              if (!e._gsTransform) {
                TweenLite.set(e, {
                  x: "+=0",
                  overwrite: false
                });
                if (e._gsTransform.xOrigin === undefined) {
                  console.log("Draggable requires at least GSAP 1.17.0");
                }
              }
              v = e.getBBox();
              decoratee.x = (e._gsTransform.xOrigin - v.x);
              decoratee.y = (e._gsTransform.yOrigin - v.y);
            } else {
              if (e.getBBox && !e.offsetWidth && (x + y).indexOf("%") !== -1) {
                e = e.getBBox();
                e = {
                  offsetWidth: e.width,
                  offsetHeight: e.height
                };
              }
              decoratee.x = ((x.indexOf("%") !== -1) ? e.offsetWidth * parseFloat(x) / 100 : parseFloat(x));
              decoratee.y = ((y.indexOf("%") !== -1) ? e.offsetHeight * parseFloat(y) / 100 : parseFloat(y));
            }
            return decoratee;
          },
          _cache = function(e) {
            if (Draggable.cacheSVGData !== false && e._gsCache && e._gsCache.lastUpdate === TweenLite.ticker.frame) {
              return e._gsCache;
            }
            var cache = e._gsCache = e._gsCache || {},
                cs = _getComputedStyle(e),
                isSVG = (e.getBBox && _isSVG(e)),
                isSVGRoot = ((e.nodeName + "").toLowerCase() === "svg"),
                curSVG;
            cache.isSVG = isSVG;
            cache.isSVGRoot = isSVGRoot;
            cache.borderBox = (cs.boxSizing === "border-box");
            cache.computedStyle = cs;
            if (isSVGRoot) {
              if (!(cache.offsetParent = e.offsetParent)) {
                curSVG = e.parentNode || _docElement;
                curSVG.insertBefore(_tempDiv, e);
                cache.offsetParent = _tempDiv.offsetParent || _docElement;
                curSVG.removeChild(_tempDiv);
              }
            } else if (isSVG) {
              curSVG = e.parentNode;
              while (curSVG && (curSVG.nodeName + "").toLowerCase() !== "svg") {
                curSVG = curSVG.parentNode;
              }
              cache.offsetParent = curSVG;
            }
            return cache;
          },
          _getOffset2DMatrix = function(e, offsetOrigin, parentOffsetOrigin, zeroOrigin) {
            if (e === window || !e || !e.style || !e.parentNode) {
              return [1, 0, 0, 1, 0, 0];
            }
            var cache = e._gsCache || _cache(e),
                parent = e.parentNode,
                parentCache = parent._gsCache || _cache(parent),
                cs = cache.computedStyle,
                parentOffsetParent = cache.isSVG ? parentCache.offsetParent : parent.offsetParent,
                m,
                isRoot,
                offsets,
                rect,
                t,
                sx,
                sy,
                offsetX,
                offsetY,
                parentRect,
                borderTop,
                borderLeft,
                borderTranslateX,
                borderTranslateY;
            m = (cache.isSVG && (e.style[_transformProp] + "").indexOf("matrix") !== -1) ? e.style[_transformProp] : cs ? cs.getPropertyValue(_transformPropCSS) : e.currentStyle ? e.currentStyle[_transformProp] : "1,0,0,1,0,0";
            if (e.getBBox && (e.getAttribute("transform") + "").indexOf("matrix") !== -1) {
              m = e.getAttribute("transform");
            }
            m = (m + "").match(/(?:\-|\b)[\d\-\.e]+\b/g) || [1, 0, 0, 1, 0, 0];
            if (m.length > 6) {
              m = [m[0], m[1], m[4], m[5], m[12], m[13]];
            }
            if (zeroOrigin) {
              m[4] = m[5] = 0;
            } else if (cache.isSVG && (t = e._gsTransform) && (t.xOrigin || t.yOrigin)) {
              m[0] = parseFloat(m[0]);
              m[1] = parseFloat(m[1]);
              m[2] = parseFloat(m[2]);
              m[3] = parseFloat(m[3]);
              m[4] = parseFloat(m[4]) - (t.xOrigin - (t.xOrigin * m[0] + t.yOrigin * m[2]));
              m[5] = parseFloat(m[5]) - (t.yOrigin - (t.xOrigin * m[1] + t.yOrigin * m[3]));
            }
            if (offsetOrigin) {
              if (_svgBorderFactor === undefined) {
                _setEnvironmentVariables();
              }
              offsets = (cache.isSVG || cache.isSVGRoot) ? _getSVGOffsets(e) : e;
              if (cache.isSVG) {
                rect = e.getBBox();
                parentRect = (parentCache.isSVGRoot) ? {
                  x: 0,
                  y: 0
                } : parent.getBBox();
                offsets = {
                  offsetLeft: rect.x - parentRect.x,
                  offsetTop: rect.y - parentRect.y,
                  offsetParent: cache.offsetParent
                };
              } else if (cache.isSVGRoot) {
                borderTop = parseInt(cs.borderTopWidth, 10) || 0;
                borderLeft = parseInt(cs.borderLeftWidth, 10) || 0;
                borderTranslateX = ((m[0] - _svgBorderFactor) * borderLeft + m[2] * borderTop);
                borderTranslateY = (m[1] * borderLeft + (m[3] - _svgBorderFactor) * borderTop);
                sx = offsetOrigin.x;
                sy = offsetOrigin.y;
                offsetX = (sx - (sx * m[0] + sy * m[2]));
                offsetY = (sy - (sx * m[1] + sy * m[3]));
                m[4] = parseFloat(m[4]) + offsetX;
                m[5] = parseFloat(m[5]) + offsetY;
                offsetOrigin.x -= offsetX;
                offsetOrigin.y -= offsetY;
                sx = offsets.scaleX;
                sy = offsets.scaleY;
                offsetOrigin.x *= sx;
                offsetOrigin.y *= sy;
                m[0] *= sx;
                m[1] *= sy;
                m[2] *= sx;
                m[3] *= sy;
                if (!_isIE10orBelow) {
                  offsetOrigin.x += borderTranslateX;
                  offsetOrigin.y += borderTranslateY;
                }
              } else if (!_hasBorderBug && e.offsetParent) {
                offsetOrigin.x += parseInt(_getStyle(e.offsetParent, "borderLeftWidth"), 10) || 0;
                offsetOrigin.y += parseInt(_getStyle(e.offsetParent, "borderTopWidth"), 10) || 0;
              }
              isRoot = (parent === _docElement || parent === _doc.body);
              m[4] = Number(m[4]) + offsetOrigin.x + (offsets.offsetLeft || 0) - parentOffsetOrigin.x - (isRoot ? 0 : parent.scrollLeft || 0);
              m[5] = Number(m[5]) + offsetOrigin.y + (offsets.offsetTop || 0) - parentOffsetOrigin.y - (isRoot ? 0 : parent.scrollTop || 0);
              if (parent && _getStyle(e, "position", cs) === "fixed") {
                m[4] += _getDocScrollLeft();
                m[5] += _getDocScrollTop();
              }
              if (parent && parent !== _docElement && parentOffsetParent === offsets.offsetParent) {
                m[4] -= parent.offsetLeft || 0;
                m[5] -= parent.offsetTop || 0;
                if (!_hasBorderBug && parent.offsetParent && !cache.isSVG && !cache.isSVGRoot) {
                  m[4] -= parseInt(_getStyle(parent.offsetParent, "borderLeftWidth"), 10) || 0;
                  m[5] -= parseInt(_getStyle(parent.offsetParent, "borderTopWidth"), 10) || 0;
                }
              }
            }
            return m;
          },
          _getConcatenatedMatrix = function(e, invert) {
            if (!e || e === window || !e.parentNode) {
              return [1, 0, 0, 1, 0, 0];
            }
            var originOffset = _getOffsetTransformOrigin(e, _point1),
                parentOriginOffset = _getOffsetTransformOrigin(e.parentNode, _point2),
                m = _getOffset2DMatrix(e, originOffset, parentOriginOffset),
                a,
                b,
                c,
                d,
                tx,
                ty,
                m2,
                determinant;
            while ((e = e.parentNode) && e.parentNode && e !== _docElement) {
              originOffset = parentOriginOffset;
              parentOriginOffset = _getOffsetTransformOrigin(e.parentNode, (originOffset === _point1) ? _point2 : _point1);
              m2 = _getOffset2DMatrix(e, originOffset, parentOriginOffset);
              a = m[0];
              b = m[1];
              c = m[2];
              d = m[3];
              tx = m[4];
              ty = m[5];
              m[0] = a * m2[0] + b * m2[2];
              m[1] = a * m2[1] + b * m2[3];
              m[2] = c * m2[0] + d * m2[2];
              m[3] = c * m2[1] + d * m2[3];
              m[4] = tx * m2[0] + ty * m2[2] + m2[4];
              m[5] = tx * m2[1] + ty * m2[3] + m2[5];
            }
            if (invert) {
              a = m[0];
              b = m[1];
              c = m[2];
              d = m[3];
              tx = m[4];
              ty = m[5];
              determinant = (a * d - b * c);
              m[0] = d / determinant;
              m[1] = -b / determinant;
              m[2] = -c / determinant;
              m[3] = a / determinant;
              m[4] = (c * ty - d * tx) / determinant;
              m[5] = -(a * ty - b * tx) / determinant;
            }
            return m;
          },
          _localToGlobal = function(e, p, fromTopLeft, decoratee, zeroOrigin) {
            e = _unwrapElement(e);
            var m = _getConcatenatedMatrix(e, false, zeroOrigin),
                x = p.x,
                y = p.y;
            if (fromTopLeft) {
              _getOffsetTransformOrigin(e, p);
              x -= p.x;
              y -= p.y;
            }
            decoratee = (decoratee === true) ? p : decoratee || {};
            decoratee.x = x * m[0] + y * m[2] + m[4];
            decoratee.y = x * m[1] + y * m[3] + m[5];
            return decoratee;
          },
          _localizePoint = function(p, localToGlobal, globalToLocal) {
            var x = p.x * localToGlobal[0] + p.y * localToGlobal[2] + localToGlobal[4],
                y = p.x * localToGlobal[1] + p.y * localToGlobal[3] + localToGlobal[5];
            p.x = x * globalToLocal[0] + y * globalToLocal[2] + globalToLocal[4];
            p.y = x * globalToLocal[1] + y * globalToLocal[3] + globalToLocal[5];
            return p;
          },
          _getElementBounds = function(e, context, fromTopLeft) {
            if (!(e = _unwrapElement(e))) {
              return null;
            }
            context = _unwrapElement(context);
            var isSVG = (e.getBBox && _isSVG(e)),
                origin,
                left,
                right,
                top,
                bottom,
                mLocalToGlobal,
                mGlobalToLocal,
                p1,
                p2,
                p3,
                p4,
                bbox,
                width,
                height,
                cache,
                borderLeft,
                borderTop,
                viewBox,
                viewBoxX,
                viewBoxY,
                computedDimensions,
                cs;
            if (e === window) {
              top = _getDocScrollTop();
              left = _getDocScrollLeft();
              right = left + (_docElement.clientWidth || e.innerWidth || _doc.body.clientWidth || 0);
              bottom = top + (((e.innerHeight || 0) - 20 < _docElement.clientHeight) ? _docElement.clientHeight : e.innerHeight || _doc.body.clientHeight || 0);
            } else if (context === undefined || context === window) {
              return e.getBoundingClientRect();
            } else {
              origin = _getOffsetTransformOrigin(e);
              left = -origin.x;
              top = -origin.y;
              if (isSVG) {
                bbox = e.getBBox();
                width = bbox.width;
                height = bbox.height;
              } else if (e.offsetWidth) {
                width = e.offsetWidth;
                height = e.offsetHeight;
              } else {
                computedDimensions = _getComputedStyle(e);
                width = parseFloat(computedDimensions.width);
                height = parseFloat(computedDimensions.height);
              }
              right = left + width;
              bottom = top + height;
              if (e.nodeName.toLowerCase() === "svg" && !_isOldIE) {
                cache = _getSVGOffsets(e);
                cs = cache.computedStyle || {};
                viewBox = (e.getAttribute("viewBox") || "0 0").split(" ");
                viewBoxX = parseFloat(viewBox[0]);
                viewBoxY = parseFloat(viewBox[1]);
                borderLeft = parseFloat(cs.borderLeftWidth) || 0;
                borderTop = parseFloat(cs.borderTopWidth) || 0;
                right -= width - ((width - borderLeft) / cache.scaleX) - viewBoxX;
                bottom -= height - ((height - borderTop) / cache.scaleY) - viewBoxY;
                left -= borderLeft / cache.scaleX - viewBoxX;
                top -= borderTop / cache.scaleY - viewBoxY;
                if (computedDimensions) {
                  right += (parseFloat(cs.borderRightWidth) + borderLeft) / cache.scaleX;
                  bottom += (borderTop + parseFloat(cs.borderBottomWidth)) / cache.scaleY;
                }
              }
            }
            if (e === context) {
              return {
                left: left,
                top: top,
                width: right - left,
                height: bottom - top
              };
            }
            mLocalToGlobal = _getConcatenatedMatrix(e);
            mGlobalToLocal = _getConcatenatedMatrix(context, true);
            p1 = _localizePoint({
              x: left,
              y: top
            }, mLocalToGlobal, mGlobalToLocal);
            p2 = _localizePoint({
              x: right,
              y: top
            }, mLocalToGlobal, mGlobalToLocal);
            p3 = _localizePoint({
              x: right,
              y: bottom
            }, mLocalToGlobal, mGlobalToLocal);
            p4 = _localizePoint({
              x: left,
              y: bottom
            }, mLocalToGlobal, mGlobalToLocal);
            left = Math.min(p1.x, p2.x, p3.x, p4.x);
            top = Math.min(p1.y, p2.y, p3.y, p4.y);
            _temp1.x = _temp1.y = 0;
            if (fromTopLeft) {
              _getOffsetTransformOrigin(context, _temp1);
            }
            return {
              left: left + _temp1.x,
              top: top + _temp1.y,
              width: Math.max(p1.x, p2.x, p3.x, p4.x) - left,
              height: Math.max(p1.y, p2.y, p3.y, p4.y) - top
            };
          },
          _isArrayLike = function(e) {
            return (e && e.length && e[0] && ((e[0].nodeType && e[0].style && !e.nodeType) || (e[0].length && e[0][0]))) ? true : false;
          },
          _flattenArray = function(a) {
            var result = [],
                l = a.length,
                i,
                e,
                j;
            for (i = 0; i < l; i++) {
              e = a[i];
              if (_isArrayLike(e)) {
                j = e.length;
                for (j = 0; j < e.length; j++) {
                  result.push(e[j]);
                }
              } else if (e && e.length !== 0) {
                result.push(e);
              }
            }
            return result;
          },
          _isTouchDevice = (("ontouchstart" in _docElement) && ("orientation" in window)),
          _touchEventLookup = (function(types) {
            var standard = types.split(","),
                converted = ((_tempDiv.onpointerdown !== undefined) ? "pointerdown,pointermove,pointerup,pointercancel" : (_tempDiv.onmspointerdown !== undefined) ? "MSPointerDown,MSPointerMove,MSPointerUp,MSPointerCancel" : types).split(","),
                obj = {},
                i = 8;
            while (--i > -1) {
              obj[standard[i]] = converted[i];
              obj[converted[i]] = standard[i];
            }
            return obj;
          }("touchstart,touchmove,touchend,touchcancel")),
          _addListener = function(element, type, func, capture) {
            if (element.addEventListener) {
              element.addEventListener(_touchEventLookup[type] || type, func, capture);
            } else if (element.attachEvent) {
              element.attachEvent("on" + type, func);
            }
          },
          _removeListener = function(element, type, func) {
            if (element.removeEventListener) {
              element.removeEventListener(_touchEventLookup[type] || type, func);
            } else if (element.detachEvent) {
              element.detachEvent("on" + type, func);
            }
          },
          _hasTouchID = function(list, ID) {
            var i = list.length;
            while (--i > -1) {
              if (list[i].identifier === ID) {
                return true;
              }
            }
            return false;
          },
          _onMultiTouchDocumentEnd = function(e) {
            _isMultiTouching = (e.touches && _dragCount < e.touches.length);
            _removeListener(e.target, "touchend", _onMultiTouchDocumentEnd);
          },
          _onMultiTouchDocument = function(e) {
            _isMultiTouching = (e.touches && _dragCount < e.touches.length);
            _addListener(e.target, "touchend", _onMultiTouchDocumentEnd);
          },
          _parseThrowProps = function(draggable, snap, max, min, factor, forceZeroVelocity) {
            var vars = {},
                a,
                i,
                l;
            if (snap) {
              if (factor !== 1 && snap instanceof Array) {
                vars.end = a = [];
                l = snap.length;
                for (i = 0; i < l; i++) {
                  a[i] = snap[i] * factor;
                }
                max += 1.1;
                min -= 1.1;
              } else if (typeof(snap) === "function") {
                vars.end = function(value) {
                  return snap.call(draggable, value) * factor;
                };
              } else {
                vars.end = snap;
              }
            }
            if (max || max === 0) {
              vars.max = max;
            }
            if (min || min === 0) {
              vars.min = min;
            }
            if (forceZeroVelocity) {
              vars.velocity = 0;
            }
            return vars;
          },
          _isClickable = function(e) {
            var data;
            return (!e || !e.getAttribute || e.nodeName === "BODY") ? false : ((data = e.getAttribute("data-clickable")) === "true" || (data !== "false" && (e.onclick || _clickableTagExp.test(e.nodeName + "") || e.getAttribute("contentEditable") === "true"))) ? true : _isClickable(e.parentNode);
          },
          _setSelectable = function(elements, selectable) {
            var i = elements.length,
                e;
            while (--i > -1) {
              e = elements[i];
              e.ondragstart = e.onselectstart = selectable ? null : _emptyFunc;
              _setStyle(e, "userSelect", (selectable ? "text" : "none"));
            }
          },
          _addPaddingBR,
          _addPaddingLeft = (function() {
            var div = _doc.createElement("div"),
                child = _doc.createElement("div"),
                childStyle = child.style,
                parent = _doc.body || _tempDiv,
                val;
            childStyle.display = "inline-block";
            childStyle.position = "relative";
            div.style.cssText = child.innerHTML = "width:90px; height:40px; padding:10px; overflow:auto; visibility: hidden";
            div.appendChild(child);
            parent.appendChild(div);
            _addPaddingBR = (child.offsetHeight + 18 > div.scrollHeight);
            childStyle.width = "100%";
            if (!_transformProp) {
              childStyle.paddingRight = "500px";
              val = div.scrollLeft = div.scrollWidth - div.clientWidth;
              childStyle.left = "-90px";
              val = (val !== div.scrollLeft);
            }
            parent.removeChild(div);
            return val;
          }()),
          ScrollProxy = function(element, vars) {
            element = _unwrapElement(element);
            vars = vars || {};
            var content = _doc.createElement("div"),
                style = content.style,
                node = element.firstChild,
                offsetTop = 0,
                offsetLeft = 0,
                prevTop = element.scrollTop,
                prevLeft = element.scrollLeft,
                scrollWidth = element.scrollWidth,
                scrollHeight = element.scrollHeight,
                extraPadRight = 0,
                maxLeft = 0,
                maxTop = 0,
                elementWidth,
                elementHeight,
                contentHeight,
                nextNode,
                transformStart,
                transformEnd;
            if (_supports3D && vars.force3D !== false) {
              transformStart = "translate3d(";
              transformEnd = "px,0px)";
            } else if (_transformProp) {
              transformStart = "translate(";
              transformEnd = "px)";
            }
            this.scrollTop = function(value, force) {
              if (!arguments.length) {
                return -this.top();
              }
              this.top(-value, force);
            };
            this.scrollLeft = function(value, force) {
              if (!arguments.length) {
                return -this.left();
              }
              this.left(-value, force);
            };
            this.left = function(value, force) {
              if (!arguments.length) {
                return -(element.scrollLeft + offsetLeft);
              }
              var dif = element.scrollLeft - prevLeft,
                  oldOffset = offsetLeft;
              if ((dif > 2 || dif < -2) && !force) {
                prevLeft = element.scrollLeft;
                TweenLite.killTweensOf(this, true, {
                  left: 1,
                  scrollLeft: 1
                });
                this.left(-prevLeft);
                if (vars.onKill) {
                  vars.onKill();
                }
                return;
              }
              value = -value;
              if (value < 0) {
                offsetLeft = (value - 0.5) | 0;
                value = 0;
              } else if (value > maxLeft) {
                offsetLeft = (value - maxLeft) | 0;
                value = maxLeft;
              } else {
                offsetLeft = 0;
              }
              if (offsetLeft || oldOffset) {
                if (transformStart) {
                  if (!this._suspendTransforms) {
                    style[_transformProp] = transformStart + -offsetLeft + "px," + -offsetTop + transformEnd;
                  }
                } else {
                  style.left = -offsetLeft + "px";
                }
                if (_addPaddingLeft && offsetLeft + extraPadRight >= 0) {
                  style.paddingRight = offsetLeft + extraPadRight + "px";
                }
              }
              element.scrollLeft = value | 0;
              prevLeft = element.scrollLeft;
            };
            this.top = function(value, force) {
              if (!arguments.length) {
                return -(element.scrollTop + offsetTop);
              }
              var dif = element.scrollTop - prevTop,
                  oldOffset = offsetTop;
              if ((dif > 2 || dif < -2) && !force) {
                prevTop = element.scrollTop;
                TweenLite.killTweensOf(this, true, {
                  top: 1,
                  scrollTop: 1
                });
                this.top(-prevTop);
                if (vars.onKill) {
                  vars.onKill();
                }
                return;
              }
              value = -value;
              if (value < 0) {
                offsetTop = (value - 0.5) | 0;
                value = 0;
              } else if (value > maxTop) {
                offsetTop = (value - maxTop) | 0;
                value = maxTop;
              } else {
                offsetTop = 0;
              }
              if (offsetTop || oldOffset) {
                if (transformStart) {
                  if (!this._suspendTransforms) {
                    style[_transformProp] = transformStart + -offsetLeft + "px," + -offsetTop + transformEnd;
                  }
                } else {
                  style.top = -offsetTop + "px";
                }
              }
              element.scrollTop = value | 0;
              prevTop = element.scrollTop;
            };
            this.maxScrollTop = function() {
              return maxTop;
            };
            this.maxScrollLeft = function() {
              return maxLeft;
            };
            this.disable = function() {
              node = content.firstChild;
              while (node) {
                nextNode = node.nextSibling;
                element.appendChild(node);
                node = nextNode;
              }
              if (element === content.parentNode) {
                element.removeChild(content);
              }
            };
            this.enable = function() {
              node = element.firstChild;
              if (node === content) {
                return;
              }
              while (node) {
                nextNode = node.nextSibling;
                content.appendChild(node);
                node = nextNode;
              }
              element.appendChild(content);
              this.calibrate();
            };
            this.calibrate = function(force) {
              var widthMatches = (element.clientWidth === elementWidth),
                  x,
                  y;
              prevTop = element.scrollTop;
              prevLeft = element.scrollLeft;
              if (widthMatches && element.clientHeight === elementHeight && content.offsetHeight === contentHeight && scrollWidth === element.scrollWidth && scrollHeight === element.scrollHeight && !force) {
                return;
              }
              if (offsetTop || offsetLeft) {
                x = this.left();
                y = this.top();
                this.left(-element.scrollLeft);
                this.top(-element.scrollTop);
              }
              if (!widthMatches || force) {
                style.display = "block";
                style.width = "auto";
                style.paddingRight = "0px";
                extraPadRight = Math.max(0, element.scrollWidth - element.clientWidth);
                if (extraPadRight) {
                  extraPadRight += _getStyle(element, "paddingLeft") + (_addPaddingBR ? _getStyle(element, "paddingRight") : 0);
                }
              }
              style.display = "inline-block";
              style.position = "relative";
              style.overflow = "visible";
              style.verticalAlign = "top";
              style.width = "100%";
              style.paddingRight = extraPadRight + "px";
              if (_addPaddingBR) {
                style.paddingBottom = _getStyle(element, "paddingBottom", true);
              }
              if (_isOldIE) {
                style.zoom = "1";
              }
              elementWidth = element.clientWidth;
              elementHeight = element.clientHeight;
              scrollWidth = element.scrollWidth;
              scrollHeight = element.scrollHeight;
              maxLeft = element.scrollWidth - elementWidth;
              maxTop = element.scrollHeight - elementHeight;
              contentHeight = content.offsetHeight;
              style.display = "block";
              if (x || y) {
                this.left(x);
                this.top(y);
              }
            };
            this.content = content;
            this.element = element;
            this._suspendTransforms = false;
            this.enable();
          },
          Draggable = function(target, vars) {
            EventDispatcher.call(this, target);
            target = _unwrapElement(target);
            if (!ThrowPropsPlugin) {
              ThrowPropsPlugin = _globals.com.greensock.plugins.ThrowPropsPlugin;
            }
            this.vars = vars = _copy(vars || {});
            this.target = target;
            this.x = this.y = this.rotation = 0;
            this.dragResistance = parseFloat(vars.dragResistance) || 0;
            this.edgeResistance = isNaN(vars.edgeResistance) ? 1 : parseFloat(vars.edgeResistance) || 0;
            this.lockAxis = vars.lockAxis;
            this.autoScroll = vars.autoScroll || 0;
            this.lockedAxis = null;
            this.allowEventDefault = !!vars.allowEventDefault;
            var type = (vars.type || (_isOldIE ? "top,left" : "x,y")).toLowerCase(),
                xyMode = (type.indexOf("x") !== -1 || type.indexOf("y") !== -1),
                rotationMode = (type.indexOf("rotation") !== -1),
                xProp = rotationMode ? "rotation" : xyMode ? "x" : "left",
                yProp = xyMode ? "y" : "top",
                allowX = (type.indexOf("x") !== -1 || type.indexOf("left") !== -1 || type === "scroll"),
                allowY = (type.indexOf("y") !== -1 || type.indexOf("top") !== -1 || type === "scroll"),
                minimumMovement = vars.minimumMovement || 2,
                self = this,
                triggers = _slice(vars.trigger || vars.handle || target),
                killProps = {},
                dragEndTime = 0,
                checkAutoScrollBounds = false,
                isClickable = vars.clickableTest || _isClickable,
                enabled,
                scrollProxy,
                startPointerX,
                startPointerY,
                startElementX,
                startElementY,
                hasBounds,
                hasDragCallback,
                maxX,
                minX,
                maxY,
                minY,
                tempVars,
                cssVars,
                touch,
                touchID,
                rotationOrigin,
                dirty,
                old,
                snapX,
                snapY,
                isClicking,
                touchEventTarget,
                matrix,
                interrupted,
                clickTime,
                startScrollTop,
                startScrollLeft,
                applyObj,
                allowNativeTouchScrolling,
                touchDragAxis,
                isDispatching,
                clickDispatch,
                render = function(suppressEvents) {
                  if (self.autoScroll && (checkAutoScrollBounds || (self.isDragging && dirty))) {
                    var e = target,
                        autoScrollFactor = self.autoScroll * 15,
                        parent,
                        isRoot,
                        rect,
                        pointerX,
                        pointerY,
                        changeX,
                        changeY,
                        gap;
                    checkAutoScrollBounds = false;
                    _windowProxy.scrollTop = ((window.pageYOffset != null) ? window.pageYOffset : (_docElement.scrollTop != null) ? _docElement.scrollTop : _doc.body.scrollTop);
                    _windowProxy.scrollLeft = ((window.pageXOffset != null) ? window.pageXOffset : (_docElement.scrollLeft != null) ? _docElement.scrollLeft : _doc.body.scrollLeft);
                    pointerX = self.pointerX - _windowProxy.scrollLeft;
                    pointerY = self.pointerY - _windowProxy.scrollTop;
                    while (e && !isRoot) {
                      isRoot = _isRoot(e.parentNode);
                      parent = isRoot ? _windowProxy : e.parentNode;
                      rect = isRoot ? {
                        bottom: Math.max(_docElement.clientHeight, window.innerHeight || 0),
                        right: Math.max(_docElement.clientWidth, window.innerWidth || 0),
                        left: 0,
                        top: 0
                      } : parent.getBoundingClientRect();
                      changeX = changeY = 0;
                      if (allowY) {
                        gap = parent._gsMaxScrollY - parent.scrollTop;
                        if (gap < 0) {
                          changeY = gap;
                        } else if (pointerY > rect.bottom - 40 && gap) {
                          checkAutoScrollBounds = true;
                          changeY = Math.min(gap, (autoScrollFactor * (1 - Math.max(0, (rect.bottom - pointerY)) / 40)) | 0);
                        } else if (pointerY < rect.top + 40 && parent.scrollTop) {
                          checkAutoScrollBounds = true;
                          changeY = -Math.min(parent.scrollTop, (autoScrollFactor * (1 - Math.max(0, (pointerY - rect.top)) / 40)) | 0);
                        }
                        if (changeY) {
                          parent.scrollTop += changeY;
                        }
                      }
                      if (allowX) {
                        gap = parent._gsMaxScrollX - parent.scrollLeft;
                        if (gap < 0) {
                          changeX = gap;
                        } else if (pointerX > rect.right - 40 && gap) {
                          checkAutoScrollBounds = true;
                          changeX = Math.min(gap, (autoScrollFactor * (1 - Math.max(0, (rect.right - pointerX)) / 40)) | 0);
                        } else if (pointerX < rect.left + 40 && parent.scrollLeft) {
                          checkAutoScrollBounds = true;
                          changeX = -Math.min(parent.scrollLeft, (autoScrollFactor * (1 - Math.max(0, (pointerX - rect.left)) / 40)) | 0);
                        }
                        if (changeX) {
                          parent.scrollLeft += changeX;
                        }
                      }
                      if (isRoot && (changeX || changeY)) {
                        window.scrollTo(parent.scrollLeft, parent.scrollTop);
                        setPointerPosition(self.pointerX + changeX, self.pointerY + changeY);
                      }
                      e = parent;
                    }
                  }
                  if (dirty) {
                    var x = self.x,
                        y = self.y,
                        min = 0.000001;
                    if (x < min && x > -min) {
                      x = 0;
                    }
                    if (y < min && y > -min) {
                      y = 0;
                    }
                    if (rotationMode) {
                      applyObj.data.rotation = self.rotation = x;
                      applyObj.setRatio(1);
                    } else {
                      if (scrollProxy) {
                        if (allowY) {
                          scrollProxy.top(y);
                        }
                        if (allowX) {
                          scrollProxy.left(x);
                        }
                      } else if (xyMode) {
                        if (allowY) {
                          applyObj.data.y = y;
                        }
                        if (allowX) {
                          applyObj.data.x = x;
                        }
                        applyObj.setRatio(1);
                      } else {
                        if (allowY) {
                          target.style.top = y + "px";
                        }
                        if (allowX) {
                          target.style.left = x + "px";
                        }
                      }
                    }
                    if (hasDragCallback && !suppressEvents && !isDispatching) {
                      isDispatching = true;
                      _dispatchEvent(self, "drag", "onDrag");
                      isDispatching = false;
                    }
                  }
                  dirty = false;
                },
                syncXY = function(skipOnUpdate, skipSnap) {
                  var x = self.x,
                      y = self.y,
                      snappedValue;
                  if (!target._gsTransform && (xyMode || rotationMode)) {
                    TweenLite.set(target, {
                      x: "+=0",
                      overwrite: false
                    });
                  }
                  if (xyMode) {
                    self.y = target._gsTransform.y;
                    self.x = target._gsTransform.x;
                  } else if (rotationMode) {
                    self.x = self.rotation = target._gsTransform.rotation;
                  } else if (scrollProxy) {
                    self.y = scrollProxy.top();
                    self.x = scrollProxy.left();
                  } else {
                    self.y = parseInt(target.style.top, 10) || 0;
                    self.x = parseInt(target.style.left, 10) || 0;
                  }
                  if ((snapX || snapY) && !skipSnap) {
                    if (snapX) {
                      snappedValue = snapX(self.x);
                      if (snappedValue !== self.x) {
                        self.x = snappedValue;
                        if (rotationMode) {
                          self.rotation = snappedValue;
                        }
                      }
                    }
                    if (snapY) {
                      snappedValue = snapY(self.y);
                      if (snappedValue !== self.y) {
                        self.y = snappedValue;
                      }
                    }
                  }
                  if (x !== self.x || y !== self.y) {
                    render(true);
                  }
                  if (!skipOnUpdate) {
                    _dispatchEvent(self, "throwupdate", "onThrowUpdate");
                  }
                },
                calculateBounds = function() {
                  var bounds,
                      targetBounds,
                      snap,
                      snapIsRaw;
                  hasBounds = false;
                  if (scrollProxy) {
                    scrollProxy.calibrate();
                    self.minX = minX = -scrollProxy.maxScrollLeft();
                    self.minY = minY = -scrollProxy.maxScrollTop();
                    self.maxX = maxX = self.maxY = maxY = 0;
                    hasBounds = true;
                  } else if (!!vars.bounds) {
                    bounds = _getBounds(vars.bounds, target.parentNode);
                    if (rotationMode) {
                      self.minX = minX = bounds.left;
                      self.maxX = maxX = bounds.left + bounds.width;
                      self.minY = minY = self.maxY = maxY = 0;
                    } else if (vars.bounds.maxX !== undefined || vars.bounds.maxY !== undefined) {
                      bounds = vars.bounds;
                      self.minX = minX = bounds.minX;
                      self.minY = minY = bounds.minY;
                      self.maxX = maxX = bounds.maxX;
                      self.maxY = maxY = bounds.maxY;
                    } else {
                      targetBounds = _getBounds(target, target.parentNode);
                      self.minX = minX = _getStyle(target, xProp) + bounds.left - targetBounds.left;
                      self.minY = minY = _getStyle(target, yProp) + bounds.top - targetBounds.top;
                      self.maxX = maxX = minX + (bounds.width - targetBounds.width);
                      self.maxY = maxY = minY + (bounds.height - targetBounds.height);
                    }
                    if (minX > maxX) {
                      self.minX = maxX;
                      self.maxX = maxX = minX;
                      minX = self.minX;
                    }
                    if (minY > maxY) {
                      self.minY = maxY;
                      self.maxY = maxY = minY;
                      minY = self.minY;
                    }
                    if (rotationMode) {
                      self.minRotation = minX;
                      self.maxRotation = maxX;
                    }
                    hasBounds = true;
                  }
                  if (vars.liveSnap) {
                    snap = (vars.liveSnap === true) ? (vars.snap || {}) : vars.liveSnap;
                    snapIsRaw = (snap instanceof Array || typeof(snap) === "function");
                    if (rotationMode) {
                      snapX = buildSnapFunc((snapIsRaw ? snap : snap.rotation), minX, maxX, 1);
                      snapY = null;
                    } else {
                      if (allowX) {
                        snapX = buildSnapFunc((snapIsRaw ? snap : snap.x || snap.left || snap.scrollLeft), minX, maxX, scrollProxy ? -1 : 1);
                      }
                      if (allowY) {
                        snapY = buildSnapFunc((snapIsRaw ? snap : snap.y || snap.top || snap.scrollTop), minY, maxY, scrollProxy ? -1 : 1);
                      }
                    }
                  }
                },
                onThrowComplete = function() {
                  self.isThrowing = false;
                  _dispatchEvent(self, "throwcomplete", "onThrowComplete");
                },
                onThrowOverwrite = function() {
                  self.isThrowing = false;
                },
                animate = function(throwProps, forceZeroVelocity) {
                  var snap,
                      snapIsRaw,
                      tween,
                      overshootTolerance;
                  if (throwProps && ThrowPropsPlugin) {
                    if (throwProps === true) {
                      snap = vars.snap || {};
                      snapIsRaw = (snap instanceof Array || typeof(snap) === "function");
                      throwProps = {resistance: (vars.throwResistance || vars.resistance || 1000) / (rotationMode ? 10 : 1)};
                      if (rotationMode) {
                        throwProps.rotation = _parseThrowProps(self, snapIsRaw ? snap : snap.rotation, maxX, minX, 1, forceZeroVelocity);
                      } else {
                        if (allowX) {
                          throwProps[xProp] = _parseThrowProps(self, snapIsRaw ? snap : snap.x || snap.left || snap.scrollLeft, maxX, minX, scrollProxy ? -1 : 1, forceZeroVelocity || (self.lockedAxis === "x"));
                        }
                        if (allowY) {
                          throwProps[yProp] = _parseThrowProps(self, snapIsRaw ? snap : snap.y || snap.top || snap.scrollTop, maxY, minY, scrollProxy ? -1 : 1, forceZeroVelocity || (self.lockedAxis === "y"));
                        }
                      }
                    }
                    self.isThrowing = true;
                    overshootTolerance = (!isNaN(vars.overshootTolerance)) ? vars.overshootTolerance : (vars.edgeResistance === 1) ? 0 : (1 - self.edgeResistance) + 0.2;
                    self.tween = tween = ThrowPropsPlugin.to(scrollProxy || target, {
                      throwProps: throwProps,
                      ease: (vars.ease || _globals.Power3.easeOut),
                      onComplete: onThrowComplete,
                      onOverwrite: onThrowOverwrite,
                      onUpdate: (vars.fastMode ? _dispatchEvent : syncXY),
                      onUpdateParams: (vars.fastMode ? [self, "onthrowupdate", "onThrowUpdate"] : _emptyArray)
                    }, (isNaN(vars.maxDuration) ? 2 : vars.maxDuration), (!isNaN(vars.minDuration) ? vars.minDuration : (overshootTolerance === 0) ? 0 : 0.5), overshootTolerance);
                    if (!vars.fastMode) {
                      if (scrollProxy) {
                        scrollProxy._suspendTransforms = true;
                      }
                      tween.render(tween.duration(), true, true);
                      syncXY(true, true);
                      self.endX = self.x;
                      self.endY = self.y;
                      if (rotationMode) {
                        self.endRotation = self.x;
                      }
                      tween.play(0);
                      syncXY(true, true);
                      if (scrollProxy) {
                        scrollProxy._suspendTransforms = false;
                      }
                    }
                  } else if (hasBounds) {
                    self.applyBounds();
                  }
                },
                updateMatrix = function() {
                  var start = matrix || [1, 0, 0, 1, 0, 0],
                      a,
                      b,
                      c,
                      d,
                      tx,
                      ty,
                      determinant,
                      pointerX,
                      pointerY;
                  matrix = _getConcatenatedMatrix(target.parentNode, true);
                  if (self.isPressed && start.join(",") !== matrix.join(",")) {
                    a = start[0];
                    b = start[1];
                    c = start[2];
                    d = start[3];
                    tx = start[4];
                    ty = start[5];
                    determinant = (a * d - b * c);
                    pointerX = startPointerX * (d / determinant) + startPointerY * (-c / determinant) + ((c * ty - d * tx) / determinant);
                    pointerY = startPointerX * (-b / determinant) + startPointerY * (a / determinant) + (-(a * ty - b * tx) / determinant);
                    startPointerY = pointerX * matrix[1] + pointerY * matrix[3] + matrix[5];
                    startPointerX = pointerX * matrix[0] + pointerY * matrix[2] + matrix[4];
                  }
                  if (!matrix[1] && !matrix[2] && matrix[0] == 1 && matrix[3] == 1 && matrix[4] == 0 && matrix[5] == 0) {
                    matrix = null;
                  }
                },
                recordStartPositions = function() {
                  var edgeTolerance = 1 - self.edgeResistance;
                  updateMatrix();
                  if (scrollProxy) {
                    calculateBounds();
                    startElementY = scrollProxy.top();
                    startElementX = scrollProxy.left();
                  } else {
                    if (isTweening()) {
                      syncXY(true, true);
                      calculateBounds();
                    } else {
                      self.applyBounds();
                    }
                    if (rotationMode) {
                      rotationOrigin = _localToGlobal(target, {
                        x: 0,
                        y: 0
                      });
                      syncXY(true, true);
                      startElementX = self.x;
                      startElementY = self.y = Math.atan2(rotationOrigin.y - startPointerY, startPointerX - rotationOrigin.x) * _RAD2DEG;
                    } else {
                      startScrollTop = target.parentNode ? target.parentNode.scrollTop || 0 : 0;
                      startScrollLeft = target.parentNode ? target.parentNode.scrollLeft || 0 : 0;
                      startElementY = _getStyle(target, yProp);
                      startElementX = _getStyle(target, xProp);
                    }
                  }
                  if (hasBounds && edgeTolerance) {
                    if (startElementX > maxX) {
                      startElementX = maxX + (startElementX - maxX) / edgeTolerance;
                    } else if (startElementX < minX) {
                      startElementX = minX - (minX - startElementX) / edgeTolerance;
                    }
                    if (!rotationMode) {
                      if (startElementY > maxY) {
                        startElementY = maxY + (startElementY - maxY) / edgeTolerance;
                      } else if (startElementY < minY) {
                        startElementY = minY - (minY - startElementY) / edgeTolerance;
                      }
                    }
                  }
                },
                isTweening = function() {
                  return (self.tween && self.tween.isActive());
                },
                buildSnapFunc = function(snap, min, max, factor) {
                  if (typeof(snap) === "function") {
                    return function(n) {
                      var edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance;
                      return snap.call(self, (n > max ? max + (n - max) * edgeTolerance : (n < min) ? min + (n - min) * edgeTolerance : n)) * factor;
                    };
                  }
                  if (snap instanceof Array) {
                    return function(n) {
                      var i = snap.length,
                          closest = 0,
                          absDif = _max,
                          val,
                          dif;
                      while (--i > -1) {
                        val = snap[i];
                        dif = val - n;
                        if (dif < 0) {
                          dif = -dif;
                        }
                        if (dif < absDif && val >= min && val <= max) {
                          closest = i;
                          absDif = dif;
                        }
                      }
                      return snap[closest];
                    };
                  }
                  return isNaN(snap) ? function(n) {
                    return n;
                  } : function() {
                    return snap * factor;
                  };
                },
                onPress = function(e) {
                  var temp,
                      i;
                  if (!enabled || self.isPressed || !e || (e.type === "mousedown" && _getTime() - clickTime < 30 && _touchEventLookup[self.pointerEvent.type])) {
                    return;
                  }
                  interrupted = isTweening();
                  self.pointerEvent = e;
                  if (_touchEventLookup[e.type]) {
                    touchEventTarget = (e.type.indexOf("touch") !== -1) ? (e.currentTarget || e.target) : _doc;
                    _addListener(touchEventTarget, "touchend", onRelease);
                    _addListener(touchEventTarget, "touchmove", onMove);
                    _addListener(touchEventTarget, "touchcancel", onRelease);
                    _addListener(_doc, "touchstart", _onMultiTouchDocument);
                  } else {
                    touchEventTarget = null;
                    _addListener(_doc, "mousemove", onMove);
                  }
                  touchDragAxis = null;
                  _addListener(_doc, "mouseup", onRelease);
                  if (e && e.target) {
                    _addListener(e.target, "mouseup", onRelease);
                  }
                  isClicking = (isClickable.call(self, e.target) && !vars.dragClickables);
                  if (isClicking) {
                    _addListener(e.target, "change", onRelease);
                    _dispatchEvent(self, "press", "onPress");
                    _setSelectable(triggers, true);
                    return;
                  }
                  allowNativeTouchScrolling = (!touchEventTarget || allowX === allowY || scrollProxy || self.vars.allowNativeTouchScrolling === false) ? false : allowX ? "y" : "x";
                  if (_isOldIE) {
                    e = _populateIEEvent(e, true);
                  } else if (!allowNativeTouchScrolling && !self.allowEventDefault) {
                    e.preventDefault();
                    if (e.preventManipulation) {
                      e.preventManipulation();
                    }
                  }
                  if (e.changedTouches) {
                    e = touch = e.changedTouches[0];
                    touchID = e.identifier;
                  } else if (e.pointerId) {
                    touchID = e.pointerId;
                  } else {
                    touch = touchID = null;
                  }
                  _dragCount++;
                  _addToRenderQueue(render);
                  startPointerY = self.pointerY = e.pageY;
                  startPointerX = self.pointerX = e.pageX;
                  if (allowNativeTouchScrolling || self.autoScroll) {
                    _recordMaxScrolls(target.parentNode);
                  }
                  if (self.autoScroll && !rotationMode && !scrollProxy && target.parentNode && !target.getBBox && target.parentNode._gsMaxScrollX && !_placeholderDiv.parentNode) {
                    _placeholderDiv.style.width = (target.parentNode.scrollWidth) + "px";
                    target.parentNode.appendChild(_placeholderDiv);
                  }
                  recordStartPositions();
                  if (matrix) {
                    temp = startPointerX * matrix[0] + startPointerY * matrix[2] + matrix[4];
                    startPointerY = startPointerX * matrix[1] + startPointerY * matrix[3] + matrix[5];
                    startPointerX = temp;
                  }
                  if (self.tween) {
                    self.tween.kill();
                  }
                  self.isThrowing = false;
                  TweenLite.killTweensOf(scrollProxy || target, true, killProps);
                  if (scrollProxy) {
                    TweenLite.killTweensOf(target, true, {scrollTo: 1});
                  }
                  self.tween = self.lockedAxis = null;
                  if (vars.zIndexBoost || (!rotationMode && !scrollProxy && vars.zIndexBoost !== false)) {
                    target.style.zIndex = Draggable.zIndex++;
                  }
                  self.isPressed = true;
                  hasDragCallback = !!(vars.onDrag || self._listeners.drag);
                  if (!rotationMode) {
                    i = triggers.length;
                    while (--i > -1) {
                      _setStyle(triggers[i], "cursor", vars.cursor || "move");
                    }
                  }
                  _dispatchEvent(self, "press", "onPress");
                },
                onMove = function(e) {
                  var originalEvent = e,
                      touches,
                      pointerX,
                      pointerY,
                      i;
                  if (!enabled || _isMultiTouching || !self.isPressed || !e) {
                    return;
                  }
                  self.pointerEvent = e;
                  touches = e.changedTouches;
                  if (touches) {
                    e = touches[0];
                    if (e !== touch && e.identifier !== touchID) {
                      i = touches.length;
                      while (--i > -1 && (e = touches[i]).identifier !== touchID) {}
                      if (i < 0) {
                        return;
                      }
                    }
                  } else if (e.pointerId && touchID && e.pointerId !== touchID) {
                    return;
                  }
                  if (_isOldIE) {
                    e = _populateIEEvent(e, true);
                  } else {
                    if (touchEventTarget && allowNativeTouchScrolling && !touchDragAxis) {
                      pointerX = e.pageX;
                      pointerY = e.pageY;
                      if (matrix) {
                        i = pointerX * matrix[0] + pointerY * matrix[2] + matrix[4];
                        pointerY = pointerX * matrix[1] + pointerY * matrix[3] + matrix[5];
                        pointerX = i;
                      }
                      touchDragAxis = (Math.abs(pointerX - startPointerX) > Math.abs(pointerY - startPointerY) && allowX) ? "x" : "y";
                      if (self.vars.lockAxisOnTouchScroll !== false) {
                        self.lockedAxis = (touchDragAxis === "x") ? "y" : "x";
                        if (typeof(self.vars.onLockAxis) === "function") {
                          self.vars.onLockAxis.call(self, originalEvent);
                        }
                      }
                      if (_isAndroid && allowNativeTouchScrolling === touchDragAxis) {
                        onRelease(originalEvent);
                        return;
                      }
                    }
                    if (!self.allowEventDefault && (!allowNativeTouchScrolling || (touchDragAxis && allowNativeTouchScrolling !== touchDragAxis)) && originalEvent.cancelable !== false) {
                      originalEvent.preventDefault();
                      if (originalEvent.preventManipulation) {
                        originalEvent.preventManipulation();
                      }
                    }
                  }
                  if (self.autoScroll) {
                    checkAutoScrollBounds = true;
                  }
                  setPointerPosition(e.pageX, e.pageY);
                },
                setPointerPosition = function(pointerX, pointerY) {
                  var dragTolerance = 1 - self.dragResistance,
                      edgeTolerance = 1 - self.edgeResistance,
                      xChange,
                      yChange,
                      x,
                      y,
                      dif,
                      temp;
                  self.pointerX = pointerX;
                  self.pointerY = pointerY;
                  if (rotationMode) {
                    y = Math.atan2(rotationOrigin.y - pointerY, pointerX - rotationOrigin.x) * _RAD2DEG;
                    dif = self.y - y;
                    self.y = y;
                    if (dif > 180) {
                      startElementY -= 360;
                    } else if (dif < -180) {
                      startElementY += 360;
                    }
                    x = startElementX + (startElementY - y) * dragTolerance;
                  } else {
                    if (matrix) {
                      temp = pointerX * matrix[0] + pointerY * matrix[2] + matrix[4];
                      pointerY = pointerX * matrix[1] + pointerY * matrix[3] + matrix[5];
                      pointerX = temp;
                    }
                    yChange = (pointerY - startPointerY);
                    xChange = (pointerX - startPointerX);
                    if (yChange < minimumMovement && yChange > -minimumMovement) {
                      yChange = 0;
                    }
                    if (xChange < minimumMovement && xChange > -minimumMovement) {
                      xChange = 0;
                    }
                    if ((self.lockAxis || self.lockedAxis) && (xChange || yChange)) {
                      temp = self.lockedAxis;
                      if (!temp) {
                        self.lockedAxis = temp = (allowX && Math.abs(xChange) > Math.abs(yChange)) ? "y" : allowY ? "x" : null;
                        if (temp && typeof(self.vars.onLockAxis) === "function") {
                          self.vars.onLockAxis.call(self, self.pointerEvent);
                        }
                      }
                      if (temp === "y") {
                        yChange = 0;
                      } else if (temp === "x") {
                        xChange = 0;
                      }
                    }
                    x = startElementX + xChange * dragTolerance;
                    y = startElementY + yChange * dragTolerance;
                  }
                  if (snapX || snapY) {
                    if (snapX) {
                      x = snapX(x);
                    }
                    if (snapY) {
                      y = snapY(y);
                    }
                  } else if (hasBounds) {
                    if (x > maxX) {
                      x = maxX + (x - maxX) * edgeTolerance;
                    } else if (x < minX) {
                      x = minX + (x - minX) * edgeTolerance;
                    }
                    if (!rotationMode) {
                      if (y > maxY) {
                        y = maxY + (y - maxY) * edgeTolerance;
                      } else if (y < minY) {
                        y = minY + (y - minY) * edgeTolerance;
                      }
                    }
                  }
                  if (!rotationMode) {
                    x = Math.round(x);
                    y = Math.round(y);
                  }
                  if (self.x !== x || (self.y !== y && !rotationMode)) {
                    if (rotationMode) {
                      self.endRotation = self.x = self.endX = x;
                    } else {
                      if (allowY) {
                        self.y = self.endY = y;
                      }
                      if (allowX) {
                        self.x = self.endX = x;
                      }
                    }
                    dirty = true;
                    if (!self.isDragging && self.isPressed) {
                      self.isDragging = true;
                      _dispatchEvent(self, "dragstart", "onDragStart");
                    }
                  }
                },
                onRelease = function(e, force) {
                  if (!enabled || !self.isPressed || (e && touchID != null && !force && ((e.pointerId && e.pointerId !== touchID) || (e.changedTouches && !_hasTouchID(e.changedTouches, touchID))))) {
                    return;
                  }
                  self.isPressed = false;
                  var originalEvent = e,
                      wasDragging = self.isDragging,
                      touches,
                      i,
                      syntheticEvent,
                      eventTarget;
                  if (touchEventTarget) {
                    _removeListener(touchEventTarget, "touchend", onRelease);
                    _removeListener(touchEventTarget, "touchmove", onMove);
                    _removeListener(touchEventTarget, "touchcancel", onRelease);
                    _removeListener(_doc, "touchstart", _onMultiTouchDocument);
                  } else {
                    _removeListener(_doc, "mousemove", onMove);
                  }
                  _removeListener(_doc, "mouseup", onRelease);
                  if (e && e.target) {
                    _removeListener(e.target, "mouseup", onRelease);
                  }
                  dirty = false;
                  if (_placeholderDiv.parentNode) {
                    _placeholderDiv.parentNode.removeChild(_placeholderDiv);
                  }
                  if (isClicking) {
                    if (e) {
                      _removeListener(e.target, "change", onRelease);
                    }
                    _setSelectable(triggers, false);
                    _dispatchEvent(self, "release", "onRelease");
                    _dispatchEvent(self, "click", "onClick");
                    isClicking = false;
                    return;
                  }
                  _removeFromRenderQueue(render);
                  if (!rotationMode) {
                    i = triggers.length;
                    while (--i > -1) {
                      _setStyle(triggers[i], "cursor", vars.cursor || "move");
                    }
                  }
                  if (wasDragging) {
                    dragEndTime = _lastDragTime = _getTime();
                    self.isDragging = false;
                  }
                  _dragCount--;
                  if (e) {
                    if (_isOldIE) {
                      e = _populateIEEvent(e, false);
                    }
                    touches = e.changedTouches;
                    if (touches) {
                      e = touches[0];
                      if (e !== touch && e.identifier !== touchID) {
                        i = touches.length;
                        while (--i > -1 && (e = touches[i]).identifier !== touchID) {}
                        if (i < 0) {
                          return;
                        }
                      }
                    }
                    self.pointerEvent = originalEvent;
                    self.pointerX = e.pageX;
                    self.pointerY = e.pageY;
                  }
                  if (originalEvent && !wasDragging) {
                    if (interrupted && (vars.snap || vars.bounds)) {
                      animate(vars.throwProps);
                    }
                    _dispatchEvent(self, "release", "onRelease");
                    if (!_isAndroid || originalEvent.type !== "touchmove") {
                      _dispatchEvent(self, "click", "onClick");
                      eventTarget = originalEvent.target || originalEvent.srcElement || target;
                      clickTime = _getTime();
                      TweenLite.delayedCall(0.00001, function() {
                        if (clickTime !== clickDispatch && self.enabled() && !self.isPressed) {
                          if (eventTarget.click) {
                            eventTarget.click();
                          } else if (_doc.createEvent) {
                            syntheticEvent = _doc.createEvent("MouseEvents");
                            syntheticEvent.initMouseEvent("click", true, true, window, 1, self.pointerEvent.screenX, self.pointerEvent.screenY, self.pointerX, self.pointerY, false, false, false, false, 0, null);
                            eventTarget.dispatchEvent(syntheticEvent);
                          }
                        }
                      });
                    }
                  } else {
                    animate(vars.throwProps);
                    if (!_isOldIE && !self.allowEventDefault && originalEvent && (vars.dragClickables || !isClickable.call(self, originalEvent.target)) && wasDragging && (!allowNativeTouchScrolling || (touchDragAxis && allowNativeTouchScrolling === touchDragAxis)) && originalEvent.cancelable !== false) {
                      originalEvent.preventDefault();
                      if (originalEvent.preventManipulation) {
                        originalEvent.preventManipulation();
                      }
                    }
                    _dispatchEvent(self, "release", "onRelease");
                  }
                  if (wasDragging) {
                    _dispatchEvent(self, "dragend", "onDragEnd");
                  }
                  return true;
                },
                updateScroll = function(e) {
                  if (e && self.isDragging) {
                    var parent = e.target || e.srcElement || target.parentNode,
                        deltaX = parent.scrollLeft - parent._gsScrollX,
                        deltaY = parent.scrollTop - parent._gsScrollY;
                    if (deltaX || deltaY) {
                      startPointerX -= deltaX;
                      startPointerY -= deltaY;
                      parent._gsScrollX += deltaX;
                      parent._gsScrollY += deltaY;
                      setPointerPosition(self.pointerX, self.pointerY);
                    }
                  }
                },
                onClick = function(e) {
                  var time = _getTime(),
                      recentlyClicked = time - clickTime < 40,
                      recentlyDragged = time - dragEndTime < 40;
                  if (recentlyClicked && clickDispatch !== clickTime) {
                    clickDispatch = clickTime;
                    return;
                  }
                  if (self.isPressed || recentlyDragged || recentlyClicked) {
                    if (e.preventDefault) {
                      e.preventDefault();
                      if (recentlyClicked || (recentlyDragged && self.vars.suppressClickOnDrag !== false)) {
                        e.stopImmediatePropagation();
                      }
                    } else {
                      e.returnValue = false;
                    }
                    if (e.preventManipulation) {
                      e.preventManipulation();
                    }
                  }
                };
            old = Draggable.get(this.target);
            if (old) {
              old.kill();
            }
            this.startDrag = function(e) {
              onPress(e);
              if (!self.isDragging) {
                self.isDragging = true;
                _dispatchEvent(self, "dragstart", "onDragStart");
              }
            };
            this.drag = onMove;
            this.endDrag = function(e) {
              onRelease(e, true);
            };
            this.timeSinceDrag = function() {
              return self.isDragging ? 0 : (_getTime() - dragEndTime) / 1000;
            };
            this.hitTest = function(target, threshold) {
              return Draggable.hitTest(self.target, target, threshold);
            };
            this.getDirection = function(from, diagonalThreshold) {
              var mode = (from === "velocity" && ThrowPropsPlugin) ? from : (typeof(from) === "object" && !rotationMode) ? "element" : "start",
                  xChange,
                  yChange,
                  ratio,
                  direction,
                  r1,
                  r2;
              if (mode === "element") {
                r1 = _parseRect(self.target);
                r2 = _parseRect(from);
              }
              xChange = (mode === "start") ? self.x - startElementX : (mode === "velocity") ? ThrowPropsPlugin.getVelocity(this.target, xProp) : (r1.left + r1.width / 2) - (r2.left + r2.width / 2);
              if (rotationMode) {
                return xChange < 0 ? "counter-clockwise" : "clockwise";
              } else {
                diagonalThreshold = diagonalThreshold || 2;
                yChange = (mode === "start") ? self.y - startElementY : (mode === "velocity") ? ThrowPropsPlugin.getVelocity(this.target, yProp) : (r1.top + r1.height / 2) - (r2.top + r2.height / 2);
                ratio = Math.abs(xChange / yChange);
                direction = (ratio < 1 / diagonalThreshold) ? "" : (xChange < 0) ? "left" : "right";
                if (ratio < diagonalThreshold) {
                  if (direction !== "") {
                    direction += "-";
                  }
                  direction += (yChange < 0) ? "up" : "down";
                }
              }
              return direction;
            };
            this.applyBounds = function(newBounds) {
              var x,
                  y,
                  forceZeroVelocity;
              if (newBounds && vars.bounds !== newBounds) {
                vars.bounds = newBounds;
                return self.update(true);
              }
              syncXY(true);
              calculateBounds();
              if (hasBounds) {
                x = self.x;
                y = self.y;
                if (hasBounds) {
                  if (x > maxX) {
                    x = maxX;
                  } else if (x < minX) {
                    x = minX;
                  }
                  if (y > maxY) {
                    y = maxY;
                  } else if (y < minY) {
                    y = minY;
                  }
                }
                if (self.x !== x || self.y !== y) {
                  forceZeroVelocity = true;
                  self.x = self.endX = x;
                  if (rotationMode) {
                    self.endRotation = x;
                  } else {
                    self.y = self.endY = y;
                  }
                  dirty = true;
                  render();
                }
                if (self.isThrowing && (forceZeroVelocity || self.endX > maxX || self.endX < minX || self.endY > maxY || self.endY < minY)) {
                  animate(vars.throwProps, forceZeroVelocity);
                }
              }
              return self;
            };
            this.update = function(applyBounds, ignoreExternalChanges) {
              var x = self.x,
                  y = self.y;
              updateMatrix();
              if (applyBounds) {
                self.applyBounds();
              } else {
                if (dirty && ignoreExternalChanges) {
                  render();
                }
                syncXY(true);
              }
              if (self.isPressed && ((allowX && Math.abs(x - self.x) > 0.01) || (allowY && (Math.abs(y - self.y) > 0.01 && !rotationMode)))) {
                recordStartPositions();
              }
              if (self.autoScroll) {
                _recordMaxScrolls(target.parentNode);
                checkAutoScrollBounds = true;
                render();
              }
              return self;
            };
            this.enable = function(type) {
              var id,
                  i,
                  trigger;
              if (type !== "soft") {
                i = triggers.length;
                while (--i > -1) {
                  trigger = triggers[i];
                  _addListener(trigger, "mousedown", onPress);
                  _addListener(trigger, "touchstart", onPress);
                  _addListener(trigger, "click", onClick, true);
                  if (!rotationMode) {
                    _setStyle(trigger, "cursor", vars.cursor || "move");
                  }
                  _setStyle(trigger, "touchCallout", "none");
                  _setStyle(trigger, "touchAction", (allowX === allowY || scrollProxy) ? "none" : allowX ? "pan-y" : "pan-x");
                }
                _setSelectable(triggers, false);
              }
              _addScrollListener(self.target, updateScroll);
              enabled = true;
              if (ThrowPropsPlugin && type !== "soft") {
                ThrowPropsPlugin.track(scrollProxy || target, (xyMode ? "x,y" : rotationMode ? "rotation" : "top,left"));
              }
              if (scrollProxy) {
                scrollProxy.enable();
              }
              target._gsDragID = id = "d" + (_lookupCount++);
              _lookup[id] = this;
              if (scrollProxy) {
                scrollProxy.element._gsDragID = id;
              }
              TweenLite.set(target, {
                x: "+=0",
                overwrite: false
              });
              applyObj = {
                t: target,
                data: _isOldIE ? cssVars : target._gsTransform,
                tween: {},
                setRatio: (_isOldIE ? function() {
                  TweenLite.set(target, tempVars);
                } : CSSPlugin._internals.setTransformRatio || CSSPlugin._internals.set3DTransformRatio)
              };
              self.update(true);
              return self;
            };
            this.disable = function(type) {
              var dragging = self.isDragging,
                  i,
                  trigger;
              if (!rotationMode) {
                i = triggers.length;
                while (--i > -1) {
                  _setStyle(triggers[i], "cursor", null);
                }
              }
              if (type !== "soft") {
                i = triggers.length;
                while (--i > -1) {
                  trigger = triggers[i];
                  _setStyle(trigger, "touchCallout", null);
                  _setStyle(trigger, "touchAction", null);
                  _removeListener(trigger, "mousedown", onPress);
                  _removeListener(trigger, "touchstart", onPress);
                  _removeListener(trigger, "click", onClick);
                }
                _setSelectable(triggers, true);
                if (touchEventTarget) {
                  _removeListener(touchEventTarget, "touchcancel", onRelease);
                  _removeListener(touchEventTarget, "touchend", onRelease);
                  _removeListener(touchEventTarget, "touchmove", onMove);
                }
                _removeListener(_doc, "mouseup", onRelease);
                _removeListener(_doc, "mousemove", onMove);
              }
              _removeScrollListener(target, updateScroll);
              enabled = false;
              if (ThrowPropsPlugin && type !== "soft") {
                ThrowPropsPlugin.untrack(scrollProxy || target, (xyMode ? "x,y" : rotationMode ? "rotation" : "top,left"));
              }
              if (scrollProxy) {
                scrollProxy.disable();
              }
              _removeFromRenderQueue(render);
              self.isDragging = self.isPressed = isClicking = false;
              if (dragging) {
                _dispatchEvent(self, "dragend", "onDragEnd");
              }
              return self;
            };
            this.enabled = function(value, type) {
              return arguments.length ? (value ? self.enable(type) : self.disable(type)) : enabled;
            };
            this.kill = function() {
              self.isThrowing = false;
              TweenLite.killTweensOf(scrollProxy || target, true, killProps);
              self.disable();
              delete _lookup[target._gsDragID];
              return self;
            };
            if (type.indexOf("scroll") !== -1) {
              scrollProxy = this.scrollProxy = new ScrollProxy(target, _extend({onKill: function() {
                  if (self.isPressed) {
                    onRelease(null);
                  }
                }}, vars));
              target.style.overflowY = (allowY && !_isTouchDevice) ? "auto" : "hidden";
              target.style.overflowX = (allowX && !_isTouchDevice) ? "auto" : "hidden";
              target = scrollProxy.content;
            }
            if (vars.force3D !== false) {
              TweenLite.set(target, {force3D: true});
            }
            if (rotationMode) {
              killProps.rotation = 1;
            } else {
              if (allowX) {
                killProps[xProp] = 1;
              }
              if (allowY) {
                killProps[yProp] = 1;
              }
            }
            if (rotationMode) {
              tempVars = _tempVarsRotation;
              cssVars = tempVars.css;
              tempVars.overwrite = false;
            } else if (xyMode) {
              tempVars = (allowX && allowY) ? _tempVarsXY : allowX ? _tempVarsX : _tempVarsY;
              cssVars = tempVars.css;
              tempVars.overwrite = false;
            }
            this.enable();
          },
          p = Draggable.prototype = new EventDispatcher();
      p.constructor = Draggable;
      p.pointerX = p.pointerY = 0;
      p.isDragging = p.isPressed = false;
      Draggable.version = "0.14.3";
      Draggable.zIndex = 1000;
      _addListener(_doc, "touchcancel", function() {});
      _addListener(_doc, "contextmenu", function(e) {
        var p;
        for (p in _lookup) {
          if (_lookup[p].isPressed) {
            _lookup[p].endDrag();
          }
        }
      });
      Draggable.create = function(targets, vars) {
        if (typeof(targets) === "string") {
          targets = TweenLite.selector(targets);
        }
        var a = (!targets || targets.length === 0) ? [] : _isArrayLike(targets) ? _flattenArray(targets) : [targets],
            i = a.length;
        while (--i > -1) {
          a[i] = new Draggable(a[i], vars);
        }
        return a;
      };
      Draggable.get = function(target) {
        return _lookup[(_unwrapElement(target) || {})._gsDragID];
      };
      Draggable.timeSinceDrag = function() {
        return (_getTime() - _lastDragTime) / 1000;
      };
      var _tempRect = {},
          _oldIERect = function(e) {
            var top = 0,
                left = 0,
                width,
                height;
            e = _unwrapElement(e);
            width = e.offsetWidth;
            height = e.offsetHeight;
            while (e) {
              top += e.offsetTop;
              left += e.offsetLeft;
              e = e.offsetParent;
            }
            return {
              top: top,
              left: left,
              width: width,
              height: height
            };
          },
          _parseRect = function(e, undefined) {
            if (e === window) {
              _tempRect.left = _tempRect.top = 0;
              _tempRect.width = _tempRect.right = _docElement.clientWidth || e.innerWidth || _doc.body.clientWidth || 0;
              _tempRect.height = _tempRect.bottom = ((e.innerHeight || 0) - 20 < _docElement.clientHeight) ? _docElement.clientHeight : e.innerHeight || _doc.body.clientHeight || 0;
              return _tempRect;
            }
            var r = (e.pageX !== undefined) ? {
              left: e.pageX - _getDocScrollLeft(),
              top: e.pageY - _getDocScrollTop(),
              right: e.pageX - _getDocScrollLeft() + 1,
              bottom: e.pageY - _getDocScrollTop() + 1
            } : (!e.nodeType && e.left !== undefined && e.top !== undefined) ? e : _isOldIE ? _oldIERect(e) : _unwrapElement(e).getBoundingClientRect();
            if (r.right === undefined && r.width !== undefined) {
              r.right = r.left + r.width;
              r.bottom = r.top + r.height;
            } else if (r.width === undefined) {
              r = {
                width: r.right - r.left,
                height: r.bottom - r.top,
                right: r.right,
                left: r.left,
                bottom: r.bottom,
                top: r.top
              };
            }
            return r;
          };
      Draggable.hitTest = function(obj1, obj2, threshold) {
        if (obj1 === obj2) {
          return false;
        }
        var r1 = _parseRect(obj1),
            r2 = _parseRect(obj2),
            isOutside = (r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top),
            overlap,
            area,
            isRatio;
        if (isOutside || !threshold) {
          return !isOutside;
        }
        isRatio = ((threshold + "").indexOf("%") !== -1);
        threshold = parseFloat(threshold) || 0;
        overlap = {
          left: Math.max(r1.left, r2.left),
          top: Math.max(r1.top, r2.top)
        };
        overlap.width = Math.min(r1.right, r2.right) - overlap.left;
        overlap.height = Math.min(r1.bottom, r2.bottom) - overlap.top;
        if (overlap.width < 0 || overlap.height < 0) {
          return false;
        }
        if (isRatio) {
          threshold *= 0.01;
          area = overlap.width * overlap.height;
          return (area >= r1.width * r1.height * threshold || area >= r2.width * r2.height * threshold);
        }
        return (overlap.width > threshold && overlap.height > threshold);
      };
      _placeholderDiv.style.cssText = "visibility:hidden;height:1px;top:-1px;pointer-events:none;position:relative;clear:both;";
      return Draggable;
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
      require('../plugins/CSSPlugin');
      module.exports = getGlobal();
    }
  }("Draggable"));
})(require('process'));
