const chongxie = function () {
  const consoleLine = () => {
    if (!env.isDevelop()) {
      return '';
    }
    try {
      let err = new Error(),
        strErr = err.stack,
        strLineErr = strErr.split(/\r|\n/)[4],
        arrErrResult = strLineErr.match(/[^/|:|\\]{1,}/gi),
        temp = {};
      temp.colNum = +arrErrResult.pop();
      temp.lineNum = +arrErrResult.pop();
      temp.fileName = arrErrResult.slice(4).join('/');
      return /\\|\//gi.test(strLineErr)
        ? `${temp.fileName}:${temp.lineNum}`
        : '';
    } catch (error) {
      return '';
    }
  };

  // 重写日志输出对象，限制输出内容
  const oldLog = console.log;
  console.log = (...data) => {
    let shuchu = true;
    function baohan(str) {
      return data.toString().includes(str);
    }
    try {
      if (baohan('<INFO>') || baohan('getUserMedia err TypeError')) {
        shuchu = false;
      }
    } catch (error) {}

    shuchu && oldLog(...data, getNowTime(), consoleLine());
  };

  console.info = (...data) => {
    // console.log(...data);
  };

  const oldWarn = console.warn;
  console.warn = async (...data) => {
    let shuchu = true;
    function baohan(str) {
      return data.toString().includes(str);
    }

    try {
      // 网络断开后trtc SDK会输出这句，所以可以断定为网络断开
      if (baohan('websocket and schedule') || baohan('sync user list failed')) {
        layer.msg('当前网络已断开');
        networkIsDisconnect = true;
      }
      if (baohan('devicesAdded')) {
        layer.msg('设备添加');
      }
      if (baohan('devicesRemoved')) {
        layer.msg('设备拔出');
      }
      if (baohan('current camera')) {
        console.log('当前摄像头丢失');
        if ((await TRTC.getCameras()).length == 0) {
          videoHandle(false, meetInfo.CHID);
        }
        shuchu = false;
      }
      if (baohan('current microphone')) {
        shuchu = false;
        console.log('当前麦克风丢失');
      }
      // 修改恢复弹窗提示
      if (baohan('show autoplay dialog')) {
        $('.trtc_autoplay_header').html('提示');
        $('.trtc_autoplay_question').remove();
        $('.trtc_autoplay_collapse').remove();
        $('.trtc_autoplay_content').html(
          '因各机型策略不同，在用户与页面产生交互（点击、触摸）之前，浏览器禁止播放有声媒体。该弹窗用于帮助用户恢复音视频播放。'
        );
      }
      if (
        baohan('mirror') ||
        baohan('has been remove') ||
        baohan('sync user list') ||
        baohan('video resolution of') ||
        baohan('prev audio track is muted') ||
        baohan('please check your') ||
        baohan('recoverCapture') ||
        baohan('DevTools failed to load')
      ) {
        shuchu = false;
      }
    } catch (error) {}

    shuchu && oldWarn(...data, getNowTime(), consoleLine());
  };

  const oldError = console.error;
  console.error = async (...data) => {
    let shuchu = true;
    function baohan(str) {
      return data.toString().includes(str);
    }
    try {
      if (baohan('无法初始化共享流')) {
        setTimeout(() => {
          if (meetInfo.CHID == roomDetail.SpeakerID || !roomDetail.SpeakerID) {
            $('#zjr_mask').show();
          } else {
            $('#mask_' + meetInfo.CHID).show();
          }
        }, 500);
      }
      if (
        baohan('Cannot send data if the connection is not in the') ||
        baohan('Websocket closed with status code: 1006')
      ) {
        console.error('errcode:1006，chathub断开了！！');
        chclient.reConnect();
      }
      if (baohan('failed to subscribe stream, reason: because the remote')) {
        chclient.huoquhuiyihuancun();
      }
      if (baohan('your device does not support H.264 encoding')) {
        layer.alert(`您的浏览器不兼容，请更换浏览器。`);
      }
      if (baohan('Could not start video source')) {
        $('#mask_' + meetInfo.CHID).show();
        if (meetInfo.CHID == roomDetail.SpeakerID) {
          $('#zjr_mask_').show();
        }
      }
      // 忽略以下
      if (
        baohan("'elementId' is not found in the") ||
        baohan('Invalid attempt to spread') ||
        baohan('sdpMLineIndex are both') ||
        baohan('getUserMedia error observed') ||
        baohan('no camera detected') ||
        baohan('or has been closed') ||
        baohan('cannot switch device when publishing localStream')
      ) {
        shuchu = false;
      }
    } catch (error) {}
    shuchu && oldError(...data, getNowTime(), consoleLine());
  };

  // 重写XMLHttpRequest，捕获SDK请求异常
  /*const oldXMLHttpRequest = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new oldXMLHttpRequest();
    try {
      if (xhr.addEventListener) {
        xhr.addEventListener('loadend', () => {
          try {
            const { responseText, status, statusText, responseURL } = xhr;
            console.log(responseURL);
          } catch (err) {
            // console.error('loadend', err);
          }
        });
      }
    } catch (err) {
      // console.error('xhr', err);
    }
    return xhr;
  };*/
};

chongxie();

/*!
 * jQuery Color Animations v@VERSION
 * https://github.com/jquery/jquery-color
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: @DATE
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    factory(root.jQuery);
  }
})(this, function (jQuery, undefined) {
  var stepHooks =
      'backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor',
    // plusequals test for += 100 -= 100
    rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
    // a set of RE's that can match strings and generate color tuples.
    stringParsers = [
      {
        re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
        parse: function (execResult) {
          return [execResult[1], execResult[2], execResult[3], execResult[4]];
        },
      },
      {
        re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
        parse: function (execResult) {
          return [
            execResult[1] * 2.55,
            execResult[2] * 2.55,
            execResult[3] * 2.55,
            execResult[4],
          ];
        },
      },
      {
        // this regex ignores A-F because it's compared against an already lowercased string
        re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
        parse: function (execResult) {
          return [
            parseInt(execResult[1], 16),
            parseInt(execResult[2], 16),
            parseInt(execResult[3], 16),
          ];
        },
      },
      {
        // this regex ignores A-F because it's compared against an already lowercased string
        re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
        parse: function (execResult) {
          return [
            parseInt(execResult[1] + execResult[1], 16),
            parseInt(execResult[2] + execResult[2], 16),
            parseInt(execResult[3] + execResult[3], 16),
          ];
        },
      },
      {
        re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
        space: 'hsla',
        parse: function (execResult) {
          return [
            execResult[1],
            execResult[2] / 100,
            execResult[3] / 100,
            execResult[4],
          ];
        },
      },
    ],
    // jQuery.Color( )
    color = (jQuery.Color = function (color, green, blue, alpha) {
      return new jQuery.Color.fn.parse(color, green, blue, alpha);
    }),
    spaces = {
      rgba: {
        props: {
          red: {
            idx: 0,
            type: 'byte',
          },
          green: {
            idx: 1,
            type: 'byte',
          },
          blue: {
            idx: 2,
            type: 'byte',
          },
        },
      },
      hsla: {
        props: {
          hue: {
            idx: 0,
            type: 'degrees',
          },
          saturation: {
            idx: 1,
            type: 'percent',
          },
          lightness: {
            idx: 2,
            type: 'percent',
          },
        },
      },
    },
    propTypes = {
      byte: {
        floor: true,
        max: 255,
      },
      percent: {
        max: 1,
      },
      degrees: {
        mod: 360,
        floor: true,
      },
    },
    support = (color.support = {}),
    // element for support tests
    supportElem = jQuery('<p>')[0],
    // colors = jQuery.Color.names
    colors,
    // local aliases of functions called often
    each = jQuery.each;

  // determine rgba support immediately
  supportElem.style.cssText = 'background-color:rgba(1,1,1,.5)';
  support.rgba = supportElem.style.backgroundColor.indexOf('rgba') > -1;

  // define cache name and alpha properties
  // for rgba and hsla spaces
  each(spaces, function (spaceName, space) {
    space.cache = '_' + spaceName;
    space.props.alpha = {
      idx: 3,
      type: 'percent',
      def: 1,
    };
  });

  function clamp(value, prop, allowEmpty) {
    var type = propTypes[prop.type] || {};

    if (value == null) {
      return allowEmpty || !prop.def ? null : prop.def;
    }

    // ~~ is an short way of doing floor for positive numbers
    value = type.floor ? ~~value : parseFloat(value);

    // IE will pass in empty strings as value for alpha,
    // which will hit this case
    if (isNaN(value)) {
      return prop.def;
    }

    if (type.mod) {
      // we add mod before modding to make sure that negatives values
      // get converted properly: -10 -> 350
      return (value + type.mod) % type.mod;
    }

    // for now all property types without mod have min and max
    return 0 > value ? 0 : type.max < value ? type.max : value;
  }

  function stringParse(string) {
    var inst = color(),
      rgba = (inst._rgba = []);

    string = string.toLowerCase();

    each(stringParsers, function (i, parser) {
      var parsed,
        match = parser.re.exec(string),
        values = match && parser.parse(match),
        spaceName = parser.space || 'rgba';

      if (values) {
        parsed = inst[spaceName](values);

        // if this was an rgba parse the assignment might happen twice
        // oh well....
        inst[spaces[spaceName].cache] = parsed[spaces[spaceName].cache];
        rgba = inst._rgba = parsed._rgba;

        // exit each( stringParsers ) here because we matched
        return false;
      }
    });

    // Found a stringParser that handled it
    if (rgba.length) {
      // if this came from a parsed string, force "transparent" when alpha is 0
      // chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
      if (rgba.join() === '0,0,0,0') {
        jQuery.extend(rgba, colors.transparent);
      }
      return inst;
    }

    // named colors
    return colors[string];
  }

  color.fn = jQuery.extend(color.prototype, {
    parse: function (red, green, blue, alpha) {
      if (red === undefined) {
        this._rgba = [null, null, null, null];
        return this;
      }
      if (red.jquery || red.nodeType) {
        red = jQuery(red).css(green);
        green = undefined;
      }

      var inst = this,
        type = jQuery.type(red),
        rgba = (this._rgba = []);

      // more than 1 argument specified - assume ( red, green, blue, alpha )
      if (green !== undefined) {
        red = [red, green, blue, alpha];
        type = 'array';
      }

      if (type === 'string') {
        return this.parse(stringParse(red) || colors._default);
      }

      if (type === 'array') {
        each(spaces.rgba.props, function (key, prop) {
          rgba[prop.idx] = clamp(red[prop.idx], prop);
        });
        return this;
      }

      if (type === 'object') {
        if (red instanceof color) {
          each(spaces, function (spaceName, space) {
            if (red[space.cache]) {
              inst[space.cache] = red[space.cache].slice();
            }
          });
        } else {
          each(spaces, function (spaceName, space) {
            var cache = space.cache;
            each(space.props, function (key, prop) {
              // if the cache doesn't exist, and we know how to convert
              if (!inst[cache] && space.to) {
                // if the value was null, we don't need to copy it
                // if the key was alpha, we don't need to copy it either
                if (key === 'alpha' || red[key] == null) {
                  return;
                }
                inst[cache] = space.to(inst._rgba);
              }

              // this is the only case where we allow nulls for ALL properties.
              // call clamp with alwaysAllowEmpty
              inst[cache][prop.idx] = clamp(red[key], prop, true);
            });

            // everything defined but alpha?
            if (
              inst[cache] &&
              jQuery.inArray(null, inst[cache].slice(0, 3)) < 0
            ) {
              // use the default of 1
              inst[cache][3] = 1;
              if (space.from) {
                inst._rgba = space.from(inst[cache]);
              }
            }
          });
        }
        return this;
      }
    },
    is: function (compare) {
      var is = color(compare),
        same = true,
        inst = this;

      each(spaces, function (_, space) {
        var localCache,
          isCache = is[space.cache];
        if (isCache) {
          localCache =
            inst[space.cache] || (space.to && space.to(inst._rgba)) || [];
          each(space.props, function (_, prop) {
            if (isCache[prop.idx] != null) {
              same = isCache[prop.idx] === localCache[prop.idx];
              return same;
            }
          });
        }
        return same;
      });
      return same;
    },
    _space: function () {
      var used = [],
        inst = this;
      each(spaces, function (spaceName, space) {
        if (inst[space.cache]) {
          used.push(spaceName);
        }
      });
      return used.pop();
    },
    transition: function (other, distance) {
      var end = color(other),
        spaceName = end._space(),
        space = spaces[spaceName],
        startColor = this.alpha() === 0 ? color('transparent') : this,
        start = startColor[space.cache] || space.to(startColor._rgba),
        result = start.slice();

      end = end[space.cache];
      each(space.props, function (key, prop) {
        var index = prop.idx,
          startValue = start[index],
          endValue = end[index],
          type = propTypes[prop.type] || {};

        // if null, don't override start value
        if (endValue === null) {
          return;
        }
        // if null - use end
        if (startValue === null) {
          result[index] = endValue;
        } else {
          if (type.mod) {
            if (endValue - startValue > type.mod / 2) {
              startValue += type.mod;
            } else if (startValue - endValue > type.mod / 2) {
              startValue -= type.mod;
            }
          }
          result[index] = clamp(
            (endValue - startValue) * distance + startValue,
            prop
          );
        }
      });
      return this[spaceName](result);
    },
    blend: function (opaque) {
      // if we are already opaque - return ourself
      if (this._rgba[3] === 1) {
        return this;
      }

      var rgb = this._rgba.slice(),
        a = rgb.pop(),
        blend = color(opaque)._rgba;

      return color(
        jQuery.map(rgb, function (v, i) {
          return (1 - a) * blend[i] + a * v;
        })
      );
    },
    toRgbaString: function () {
      var prefix = 'rgba(',
        rgba = jQuery.map(this._rgba, function (v, i) {
          return v == null ? (i > 2 ? 1 : 0) : v;
        });

      if (rgba[3] === 1) {
        rgba.pop();
        prefix = 'rgb(';
      }

      return prefix + rgba.join() + ')';
    },
    toHslaString: function () {
      var prefix = 'hsla(',
        hsla = jQuery.map(this.hsla(), function (v, i) {
          if (v == null) {
            v = i > 2 ? 1 : 0;
          }

          // catch 1 and 2
          if (i && i < 3) {
            v = Math.round(v * 100) + '%';
          }
          return v;
        });

      if (hsla[3] === 1) {
        hsla.pop();
        prefix = 'hsl(';
      }
      return prefix + hsla.join() + ')';
    },
    toHexString: function (includeAlpha) {
      var rgba = this._rgba.slice(),
        alpha = rgba.pop();

      if (includeAlpha) {
        rgba.push(~~(alpha * 255));
      }

      return (
        '#' +
        jQuery
          .map(rgba, function (v) {
            // default to 0 when nulls exist
            v = (v || 0).toString(16);
            return v.length === 1 ? '0' + v : v;
          })
          .join('')
      );
    },
    toString: function () {
      return this._rgba[3] === 0 ? 'transparent' : this.toRgbaString();
    },
  });
  color.fn.parse.prototype = color.fn;

  // hsla conversions adapted from:
  // https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

  function hue2rgb(p, q, h) {
    h = (h + 1) % 1;
    if (h * 6 < 1) {
      return p + (q - p) * h * 6;
    }
    if (h * 2 < 1) {
      return q;
    }
    if (h * 3 < 2) {
      return p + (q - p) * (2 / 3 - h) * 6;
    }
    return p;
  }

  spaces.hsla.to = function (rgba) {
    if (rgba[0] == null || rgba[1] == null || rgba[2] == null) {
      return [null, null, null, rgba[3]];
    }
    var r = rgba[0] / 255,
      g = rgba[1] / 255,
      b = rgba[2] / 255,
      a = rgba[3],
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      diff = max - min,
      add = max + min,
      l = add * 0.5,
      h,
      s;

    if (min === max) {
      h = 0;
    } else if (r === max) {
      h = (60 * (g - b)) / diff + 360;
    } else if (g === max) {
      h = (60 * (b - r)) / diff + 120;
    } else {
      h = (60 * (r - g)) / diff + 240;
    }

    // chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
    // otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
    if (diff === 0) {
      s = 0;
    } else if (l <= 0.5) {
      s = diff / add;
    } else {
      s = diff / (2 - add);
    }
    return [Math.round(h) % 360, s, l, a == null ? 1 : a];
  };

  spaces.hsla.from = function (hsla) {
    if (hsla[0] == null || hsla[1] == null || hsla[2] == null) {
      return [null, null, null, hsla[3]];
    }
    var h = hsla[0] / 360,
      s = hsla[1],
      l = hsla[2],
      a = hsla[3],
      q = l <= 0.5 ? l * (1 + s) : l + s - l * s,
      p = 2 * l - q;

    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
      a,
    ];
  };

  each(spaces, function (spaceName, space) {
    var props = space.props,
      cache = space.cache,
      to = space.to,
      from = space.from;

    // makes rgba() and hsla()
    color.fn[spaceName] = function (value) {
      // generate a cache for this space if it doesn't exist
      if (to && !this[cache]) {
        this[cache] = to(this._rgba);
      }
      if (value === undefined) {
        return this[cache].slice();
      }

      var ret,
        type = jQuery.type(value),
        arr = type === 'array' || type === 'object' ? value : arguments,
        local = this[cache].slice();

      each(props, function (key, prop) {
        var val = arr[type === 'object' ? key : prop.idx];
        if (val == null) {
          val = local[prop.idx];
        }
        local[prop.idx] = clamp(val, prop);
      });

      if (from) {
        ret = color(from(local));
        ret[cache] = local;
        return ret;
      } else {
        return color(local);
      }
    };

    // makes red() green() blue() alpha() hue() saturation() lightness()
    each(props, function (key, prop) {
      // alpha is included in more than one space
      if (color.fn[key]) {
        return;
      }
      color.fn[key] = function (value) {
        var vtype = jQuery.type(value),
          fn = key === 'alpha' ? (this._hsla ? 'hsla' : 'rgba') : spaceName,
          local = this[fn](),
          cur = local[prop.idx],
          match;

        if (vtype === 'undefined') {
          return cur;
        }

        if (vtype === 'function') {
          value = value.call(this, cur);
          vtype = jQuery.type(value);
        }
        if (value == null && prop.empty) {
          return this;
        }
        if (vtype === 'string') {
          match = rplusequals.exec(value);
          if (match) {
            value = cur + parseFloat(match[2]) * (match[1] === '+' ? 1 : -1);
          }
        }
        local[prop.idx] = value;
        return this[fn](local);
      };
    });
  });

  // add cssHook and .fx.step function for each named hook.
  // accept a space separated string of properties
  color.hook = function (hook) {
    var hooks = hook.split(' ');
    each(hooks, function (i, hook) {
      jQuery.cssHooks[hook] = {
        set: function (elem, value) {
          var parsed,
            curElem,
            backgroundColor = '';

          if (
            value !== 'transparent' &&
            (jQuery.type(value) !== 'string' || (parsed = stringParse(value)))
          ) {
            value = color(parsed || value);
            if (!support.rgba && value._rgba[3] !== 1) {
              curElem = hook === 'backgroundColor' ? elem.parentNode : elem;
              while (
                (backgroundColor === '' || backgroundColor === 'transparent') &&
                curElem &&
                curElem.style
              ) {
                try {
                  backgroundColor = jQuery.css(curElem, 'backgroundColor');
                  curElem = curElem.parentNode;
                } catch (e) {}
              }

              value = value.blend(
                backgroundColor && backgroundColor !== 'transparent'
                  ? backgroundColor
                  : '_default'
              );
            }

            value = value.toRgbaString();
          }
          try {
            elem.style[hook] = value;
          } catch (e) {
            // wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
          }
        },
      };
      jQuery.fx.step[hook] = function (fx) {
        if (!fx.colorInit) {
          fx.start = color(fx.elem, hook);
          fx.end = color(fx.end);
          fx.colorInit = true;
        }
        jQuery.cssHooks[hook].set(fx.elem, fx.start.transition(fx.end, fx.pos));
      };
    });
  };

  color.hook(stepHooks);

  jQuery.cssHooks.borderColor = {
    expand: function (value) {
      var expanded = {};

      each(['Top', 'Right', 'Bottom', 'Left'], function (i, part) {
        expanded['border' + part + 'Color'] = value;
      });
      return expanded;
    },
  };

  // Basic color names only.
  // Usage of any of the other color names requires adding yourself or including
  // jquery.color.svg-names.js.
  colors = jQuery.Color.names = {
    // 4.1. Basic color keywords
    aqua: '#00ffff',
    black: '#000000',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    gray: '#808080',
    green: '#008000',
    lime: '#00ff00',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
    purple: '#800080',
    red: '#ff0000',
    silver: '#c0c0c0',
    teal: '#008080',
    white: '#ffffff',
    yellow: '#ffff00',

    // 4.2.3. "transparent" color keyword
    transparent: [null, null, null, 0],

    _default: '#ffffff',
  };
});

// countUp.js
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
// playground: stackblitz.com/edit/countup-typescript
var CountUp = /** @class */ (function () {
  function CountUp(target, endVal, options) {
    var _this = this;
    this.endVal = endVal;
    this.options = options;
    this.version = '2.3.2';
    this.defaults = {
      startVal: 0,
      decimalPlaces: 0,
      duration: 2,
      useEasing: true,
      useGrouping: true,
      smartEasingThreshold: 999,
      smartEasingAmount: 333,
      separator: ',',
      decimal: '.',
      prefix: '',
      suffix: '',
      enableScrollSpy: false,
      scrollSpyDelay: 200,
      scrollSpyOnce: false,
    };
    this.finalEndVal = null; // for smart easing
    this.useEasing = true;
    this.countDown = false;
    this.error = '';
    this.startVal = 0;
    this.paused = true;
    this.once = false;
    this.count = function (timestamp) {
      if (!_this.startTime) {
        _this.startTime = timestamp;
      }
      var progress = timestamp - _this.startTime;
      _this.remaining = _this.duration - progress;
      // to ease or not to ease
      if (_this.useEasing) {
        if (_this.countDown) {
          _this.frameVal =
            _this.startVal -
            _this.easingFn(
              progress,
              0,
              _this.startVal - _this.endVal,
              _this.duration
            );
        } else {
          _this.frameVal = _this.easingFn(
            progress,
            _this.startVal,
            _this.endVal - _this.startVal,
            _this.duration
          );
        }
      } else {
        _this.frameVal =
          _this.startVal +
          (_this.endVal - _this.startVal) * (progress / _this.duration);
      }
      // don't go past endVal since progress can exceed duration in the last frame
      var wentPast = _this.countDown
        ? _this.frameVal < _this.endVal
        : _this.frameVal > _this.endVal;
      _this.frameVal = wentPast ? _this.endVal : _this.frameVal;
      // decimal
      _this.frameVal = Number(
        _this.frameVal.toFixed(_this.options.decimalPlaces)
      );
      // format and print value
      _this.printValue(_this.frameVal);
      // whether to continue
      if (progress < _this.duration) {
        _this.rAF = requestAnimationFrame(_this.count);
      } else if (_this.finalEndVal !== null) {
        // smart easing
        _this.update(_this.finalEndVal);
      } else {
        if (_this.callback) {
          _this.callback();
        }
      }
    };
    // default format and easing functions
    this.formatNumber = function (num) {
      var neg = num < 0 ? '-' : '';
      var result, x1, x2, x3;
      result = Math.abs(num).toFixed(_this.options.decimalPlaces);
      result += '';
      var x = result.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? _this.options.decimal + x[1] : '';
      if (_this.options.useGrouping) {
        x3 = '';
        for (var i = 0, len = x1.length; i < len; ++i) {
          if (i !== 0 && i % 3 === 0) {
            x3 = _this.options.separator + x3;
          }
          x3 = x1[len - i - 1] + x3;
        }
        x1 = x3;
      }
      // optional numeral substitution
      if (_this.options.numerals && _this.options.numerals.length) {
        x1 = x1.replace(/[0-9]/g, function (w) {
          return _this.options.numerals[+w];
        });
        x2 = x2.replace(/[0-9]/g, function (w) {
          return _this.options.numerals[+w];
        });
      }
      return neg + _this.options.prefix + x1 + x2 + _this.options.suffix;
    };
    // t: current time, b: beginning value, c: change in value, d: duration
    this.easeOutExpo = function (t, b, c, d) {
      return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b;
    };
    this.options = __assign(__assign({}, this.defaults), options);
    this.formattingFn = this.options.formattingFn
      ? this.options.formattingFn
      : this.formatNumber;
    this.easingFn = this.options.easingFn
      ? this.options.easingFn
      : this.easeOutExpo;
    this.startVal = this.validateValue(this.options.startVal);
    this.frameVal = this.startVal;
    this.endVal = this.validateValue(endVal);
    this.options.decimalPlaces = Math.max(0 || this.options.decimalPlaces);
    this.resetDuration();
    this.options.separator = String(this.options.separator);
    this.useEasing = this.options.useEasing;
    if (this.options.separator === '') {
      this.options.useGrouping = false;
    }
    this.el =
      typeof target === 'string' ? document.getElementById(target) : target;
    if (this.el) {
      this.printValue(this.startVal);
    } else {
      this.error = '[CountUp] target is null or undefined';
    }
    // scroll spy
    if (typeof window !== 'undefined' && this.options.enableScrollSpy) {
      if (!this.error) {
        // set up global array of onscroll functions to handle multiple instances
        window['onScrollFns'] = window['onScrollFns'] || [];
        window['onScrollFns'].push(function () {
          return _this.handleScroll(_this);
        });
        window.onscroll = function () {
          window['onScrollFns'].forEach(function (fn) {
            return fn();
          });
        };
        this.handleScroll(this);
      } else {
        console.error(this.error, target);
      }
    }
  }
  CountUp.prototype.handleScroll = function (self) {
    if (!self || !window || self.once) return;
    var bottomOfScroll = window.innerHeight + window.scrollY;
    var rect = self.el.getBoundingClientRect();
    var bottomOfEl = rect.top + rect.height + window.pageYOffset;
    if (
      bottomOfEl < bottomOfScroll &&
      bottomOfEl > window.scrollY &&
      self.paused
    ) {
      // in view
      self.paused = false;
      setTimeout(function () {
        return self.start();
      }, self.options.scrollSpyDelay);
      if (self.options.scrollSpyOnce) self.once = true;
    } else if (window.scrollY > bottomOfEl && !self.paused) {
      // scrolled past
      self.reset();
    }
  };
  /**
   * Smart easing works by breaking the animation into 2 parts, the second part being the
   * smartEasingAmount and first part being the total amount minus the smartEasingAmount. It works
   * by disabling easing for the first part and enabling it on the second part. It is used if
   * usingEasing is true and the total animation amount exceeds the smartEasingThreshold.
   */
  CountUp.prototype.determineDirectionAndSmartEasing = function () {
    var end = this.finalEndVal ? this.finalEndVal : this.endVal;
    this.countDown = this.startVal > end;
    var animateAmount = end - this.startVal;
    if (
      Math.abs(animateAmount) > this.options.smartEasingThreshold &&
      this.options.useEasing
    ) {
      this.finalEndVal = end;
      var up = this.countDown ? 1 : -1;
      this.endVal = end + up * this.options.smartEasingAmount;
      this.duration = this.duration / 2;
    } else {
      this.endVal = end;
      this.finalEndVal = null;
    }
    if (this.finalEndVal !== null) {
      // setting finalEndVal indicates smart easing
      this.useEasing = false;
    } else {
      this.useEasing = this.options.useEasing;
    }
  };
  // start animation
  CountUp.prototype.start = function (callback) {
    if (this.error) {
      return;
    }
    this.callback = callback;
    if (this.duration > 0) {
      this.determineDirectionAndSmartEasing();
      this.paused = false;
      this.rAF = requestAnimationFrame(this.count);
    } else {
      this.printValue(this.endVal);
    }
  };
  // pause/resume animation
  CountUp.prototype.pauseResume = function () {
    if (!this.paused) {
      cancelAnimationFrame(this.rAF);
    } else {
      this.startTime = null;
      this.duration = this.remaining;
      this.startVal = this.frameVal;
      this.determineDirectionAndSmartEasing();
      this.rAF = requestAnimationFrame(this.count);
    }
    this.paused = !this.paused;
  };
  // reset to startVal so animation can be run again
  CountUp.prototype.reset = function () {
    cancelAnimationFrame(this.rAF);
    this.paused = true;
    this.resetDuration();
    this.startVal = this.validateValue(this.options.startVal);
    this.frameVal = this.startVal;
    this.printValue(this.startVal);
  };
  // pass a new endVal and start animation
  CountUp.prototype.update = function (newEndVal) {
    cancelAnimationFrame(this.rAF);
    this.startTime = null;
    this.endVal = this.validateValue(newEndVal);
    if (this.endVal === this.frameVal) {
      return;
    }
    this.startVal = this.frameVal;
    if (this.finalEndVal == null) {
      this.resetDuration();
    }
    this.finalEndVal = null;
    this.determineDirectionAndSmartEasing();
    this.rAF = requestAnimationFrame(this.count);
  };
  CountUp.prototype.printValue = function (val) {
    var result = this.formattingFn(val);
    if (this.el.tagName === 'INPUT') {
      var input = this.el;
      input.value = result;
    } else if (this.el.tagName === 'text' || this.el.tagName === 'tspan') {
      this.el.textContent = result;
    } else {
      this.el.innerHTML = result;
    }
  };
  CountUp.prototype.ensureNumber = function (n) {
    return typeof n === 'number' && !isNaN(n);
  };
  CountUp.prototype.validateValue = function (value) {
    var newValue = Number(value);
    if (!this.ensureNumber(newValue)) {
      this.error = '[CountUp] invalid start or end value: '.concat(value);
      return null;
    } else {
      return newValue;
    }
  };
  CountUp.prototype.resetDuration = function () {
    this.startTime = null;
    this.duration = Number(this.options.duration) * 1000;
    this.remaining = this.duration;
  };
  return CountUp;
})();
