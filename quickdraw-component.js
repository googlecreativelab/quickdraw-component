define(["./node_modules/@polymer/lit-element/lit-element.js", "./categories.js"], function (_litElement, _categories) {
  "use strict";

  var _templateObject_848ba720e8f011e8a0fd47edc2354806 = /*#__PURE__*/ babelHelpers.taggedTemplateLiteral(["\n      <style>\n        :host {\n          display: block;\n        }\n        :host([hidden]) {\n          display: none;\n        }\n      </style>\n      <canvas id=\"canvas\">", "</canvas>\n    "]);

  // temporary deferring update until connectedCallback
  // see more: https://github.com/Polymer/lit-element/issues/258
  var DeferUntilConnected = function DeferUntilConnected(superClass) {
    return (
      /*#__PURE__*/
      function (_superClass) {
        babelHelpers.inherits(_class, _superClass);

        function _class() {
          babelHelpers.classCallCheck(this, _class);
          return babelHelpers.possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        babelHelpers.createClass(_class, [{
          key: "_invalidate",
          value: function _invalidate() {
            if (this._hasConnected) {
              babelHelpers.get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), "_invalidate", this).call(this);
            }
          }
        }, {
          key: "connectedCallback",
          value: function connectedCallback() {
            this._hasConnected = true;
            babelHelpers.get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), "connectedCallback", this).call(this);
            this.requestUpdate();
          }
        }]);
        return _class;
      }(superClass)
    );
  };

  var QuickDrawElement = DeferUntilConnected(
  /*#__PURE__*/
  function (_LitElement) {
    babelHelpers.inherits(_class2, _LitElement);
    babelHelpers.createClass(_class2, null, [{
      key: "properties",
      // Public property API that triggers re-render (synced with attributes)
      get: function get() {
        return {
          category: {
            type: String
          },
          speed: {
            type: Number
          },
          strokeWidth: {
            type: Number
          },
          strokeColor: {
            type: String
          },
          width: {
            type: String
          },
          height: {
            type: String
          },
          key: {
            type: String
          },
          host: {
            type: String
          },
          index: {
            type: Number
          },
          animated: {
            type: Boolean
          },
          debug: {
            type: Boolean
          },
          time: {
            type: Number
          },
          paused: {
            type: Boolean
          }
        };
      } // set default properties

    }]);

    function _class2() {
      var _this;

      babelHelpers.classCallCheck(this, _class2);
      _this = babelHelpers.possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this));
      _this.category = null;
      _this.key = null;
      _this.index = -1;
      _this.width = 'auto';
      _this.height = 'auto';
      _this.strokeWidth = 4;
      _this.strokeColor = '#000000';
      _this.speed = 0.5;
      _this.host = 'https://quickdrawfiles.appspot.com';
      _this.imageData = null;
      _this.animated = false;
      _this.debug = false;
      _this.time = null; // ms

      _this.paused = false;
      _this._isFetching = false;
      return _this;
    } // runs only once after first render()


    babelHelpers.createClass(_class2, [{
      key: "firstUpdated",
      value: function firstUpdated() {
        // get references
        this.canvas = this.shadowRoot.querySelector('#canvas');
        this.ctx = this.canvas.getContext('2d');
      } // when properties are updated

    }, {
      key: "updated",
      value: function updated(changedProperties) {
        // do property checks
        if (!this.key) {
          console.error('No API Key provided.');
          return;
        }

        if (!this.category) {
          console.error('No category provided.');
          return;
        }

        if (this._isFetching) {
          console.warn('Tried to change property while fetch is still in flight.');
          return;
        } // draw to canvas, fetching new data if necessary


        this._init(changedProperties.has('category') || changedProperties.has('index') || changedProperties.has('animated'));
      }
    }, {
      key: "_init",
      value: function () {
        var _init2 = babelHelpers.asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(isNewFetch) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // cancel anything that is currently going on
                  if (this.cancelDrawing) {
                    if (this.reqFrame) {
                      window.cancelAnimationFrame(this.reqFrame);
                    }

                    this.cancelDrawing();
                    this.cancelDrawing = null;
                  } // clear canvas


                  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // load image data

                  if (!isNewFetch) {
                    _context.next = 16;
                    break;
                  }

                  _context.prev = 3;

                  this._log('Fetching new data...');

                  this._isFetching = true;
                  _context.next = 8;
                  return this.fetchImageData(this.category, this.index);

                case 8:
                  this.imageData = _context.sent;
                  this._isFetching = false;
                  _context.next = 16;
                  break;

                case 12:
                  _context.prev = 12;
                  _context.t0 = _context["catch"](3);
                  console.error(_context.t0);
                  return _context.abrupt("return");

                case 16:
                  if (this.paused) {
                    _context.next = 26;
                    break;
                  }

                  _context.prev = 17;
                  _context.next = 20;
                  return this.drawImage();

                case 20:
                  _context.next = 25;
                  break;

                case 22:
                  _context.prev = 22;
                  _context.t1 = _context["catch"](17);

                  this._log('Drawing stopped short.');

                case 25:
                  this.lastIndex = 0;

                case 26:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[3, 12], [17, 22]]);
        }));

        return function _init(_x) {
          return _init2.apply(this, arguments);
        };
      }()
    }, {
      key: "refresh",
      value: function refresh() {
        this._init(true);
      }
    }, {
      key: "fetchImageData",
      value: function () {
        var _fetchImageData = babelHelpers.asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(category, index) {
          var filepath, res, resJson, data;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  filepath = this.host + "/drawing/".concat(category, "?isAnimated=").concat(this.animated, "&key=").concat(this.key);

                  if (typeof index != 'undefined' && parseInt(index, 10) >= 0) {
                    filepath += "&id=".concat(index);
                  } // fetch local file


                  _context2.prev = 2;
                  _context2.next = 5;
                  return fetch(filepath);

                case 5:
                  res = _context2.sent;

                  if (!(res.status == 404)) {
                    _context2.next = 10;
                    break;
                  }

                  this._log('Could not find file: ' + filepath);

                  _context2.next = 24;
                  break;

                case 10:
                  _context2.prev = 10;
                  _context2.next = 13;
                  return res.json();

                case 13:
                  resJson = _context2.sent;

                  this._log('id -> ' + resJson.index);

                  data = {
                    detail: {
                      index: resJson.index,
                      category: this.category,
                      data: resJson
                    }
                  };
                  this.imageData = data.detail.data;
                  this.dispatchEvent(new CustomEvent('drawingData', data));
                  return _context2.abrupt("return", resJson);

                case 21:
                  _context2.prev = 21;
                  _context2.t0 = _context2["catch"](10);
                  throw _context2.t0;

                case 24:
                  _context2.next = 29;
                  break;

                case 26:
                  _context2.prev = 26;
                  _context2.t1 = _context2["catch"](2);
                  throw _context2.t1;

                case 29:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this, [[2, 26], [10, 21]]);
        }));

        return function fetchImageData(_x2, _x3) {
          return _fetchImageData.apply(this, arguments);
        };
      }()
    }, {
      key: "drawImage",
      value: function () {
        var _drawImage = babelHelpers.asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          var _this2 = this;

          var imageData, ratio, _ratio, destWidth, destHeight, sourceWidth, sourceHeight, scaleX, scaleY, total, i, ttc, timeToCompleteThisPath, timeToCompleteLastPath, _i;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (this.imageData) {
                    _context3.next = 3;
                    break;
                  }

                  console.error('drawImage() called before drawing data has loaded.');
                  return _context3.abrupt("return");

                case 3:
                  imageData = this.imageData.drawing; // make sure canvas is cleared

                  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // call this method when canceling before finished

                  this.cancelDrawing = function () {
                    if (_this2.promisePathCancel) {
                      _this2.promisePathCancel();

                      _this2.promisePathCancel = null;
                    }
                  }; // get image properties
                  // {x_range, y_range, width, height, x, y}


                  this.currentImageProperties = this._getDrawingProperties(imageData); // account for stroke width to the image properties

                  this.currentImageProperties.width += this.strokeWidth * 2;
                  this.currentImageProperties.height += this.strokeWidth * 2;
                  this.currentImageScaleRatio = 1; // default, automatic width and height based on original drawing

                  if (this.width == 'auto' && this.height == 'auto') {
                    this.canvas.width = this.currentImageProperties.width;
                    this.canvas.height = this.currentImageProperties.height;
                  } // user gave height value, width is auto
                  else if (this.width == 'auto' && this.height != 'auto') {
                      this.canvas.height = parseInt(this.height, 10);
                      ratio = this.height / this.currentImageProperties.height;
                      this.currentImageScaleRatio = ratio;
                      this.canvas.width = this.currentImageProperties.width * ratio;
                    } // user gave width value, height is auto
                    else if (this.width != 'auto' && this.height == 'auto') {
                        this.canvas.width = parseInt(this.width, 10);
                        _ratio = this.width / this.currentImageProperties.width;
                        this.currentImageScaleRatio = _ratio;
                        this.canvas.height = this.currentImageProperties.height * _ratio;
                      } // user provided both width and height
                      else {
                          this.canvas.width = this.width;
                          this.canvas.height = this.height; // let's best fit the drawing in the user-defined canvas dimensions

                          destWidth = this.width;
                          destHeight = this.height;
                          sourceWidth = this.currentImageProperties.width;
                          sourceHeight = this.currentImageProperties.height; // Determine the appropriate scale

                          scaleX = destWidth / sourceWidth;
                          scaleY = destHeight / sourceHeight;
                          this.currentImageScaleRatio = scaleX < scaleY ? scaleX : scaleY;
                        } // lose decimal precision, using floor & 90% of original value to give slight padding
                  // eg: 0.3463203463203463 -> 0.31


                  this.currentImageScaleRatio = Math.floor(this.currentImageScaleRatio * 0.9 * 100) / 100; // need to get time ratios for each path, used when user sets time
                  // first get total time for drawing

                  if (this.animated) {
                    total = imageData[imageData.length - 1][2][imageData[imageData.length - 1][2].length - 1]; // add ratios to path data

                    for (i = 0; i < imageData.length; i++) {
                      ttc = imageData[i][2][imageData[i][2].length - 1];
                      imageData[i].push(ttc / total);
                    }

                    this._log("Original time: ".concat(total, "ms"), '#9f8029');

                    this._log("New time: ".concat(this.time, "ms"), '#9f8029');
                  } // loop through each segment and draw


                  timeToCompleteThisPath = 0, timeToCompleteLastPath = 0;
                  _i = 0;

                case 15:
                  if (!(_i < imageData.length)) {
                    _context3.next = 31;
                    break;
                  }

                  if (this.animated) {
                    if (this.time) {
                      timeToCompleteThisPath = imageData[_i][3] * this.time;
                    } else {
                      timeToCompleteThisPath = imageData[_i][2][imageData[_i][2].length - 1];
                    }

                    if (_i > 0) {
                      if (this.time) {
                        timeToCompleteLastPath = imageData[_i - 1][3] * this.time;
                      } else {
                        timeToCompleteLastPath = imageData[_i - 1][2][imageData[_i - 1][2].length - 1];
                      }

                      timeToCompleteThisPath -= timeToCompleteLastPath;
                    }
                  }

                  this._log("Path ".concat(_i + 1, "/").concat(imageData.length, " time: ").concat(timeToCompleteThisPath, "ms"), '#e2b537');

                  _context3.prev = 18;
                  _context3.next = 21;
                  return this._drawSegment(imageData[_i], timeToCompleteThisPath);

                case 21:
                  _context3.next = 26;
                  break;

                case 23:
                  _context3.prev = 23;
                  _context3.t0 = _context3["catch"](18);
                  throw 'Segment drawing cut short.';

                case 26:
                  this.promisePathCancel = null;
                  this.lastIndex = 0;

                case 28:
                  _i++;
                  _context3.next = 15;
                  break;

                case 31:
                  this.dispatchEvent(new CustomEvent('drawingComplete', {
                    detail: {
                      index: this.imageData.index,
                      category: this.category,
                      data: this.imageData
                    }
                  }));

                case 32:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this, [[18, 23]]);
        }));

        return function drawImage() {
          return _drawImage.apply(this, arguments);
        };
      }()
    }, {
      key: "_drawSegment",
      value: function _drawSegment(points, timeToComplete) {
        var _this3 = this;

        return new Promise(function (resolve, reject) {
          if (_this3.animated) {
            // for canceling the drawing of segment before finished
            _this3.promisePathCancel = function () {
              reject();
            }; // assuming 60 FPS


            var totalFrames = Math.floor(timeToComplete / 1000 * 60);

            _this3._refreshLoop(points, totalFrames, 0, resolve);
          } else {
            _this3.lastIndex = _this3._drawPath(points, _this3.lastIndex || 0, 1);
            resolve();
          }
        });
      }
    }, {
      key: "_refreshLoop",
      value: function _refreshLoop(points, totalFrames, counter, resolve) {
        var that = this;
        this.reqFrame = window.requestAnimationFrame(function () {
          var ratioComplete = counter / totalFrames;
          that.lastIndex = that._drawPath(points, that.lastIndex || 0, ratioComplete);

          if (counter >= totalFrames) {
            window.cancelAnimationFrame(that.reqFrame);
            resolve();
          } else {
            counter++;

            that._refreshLoop(points, totalFrames, counter, resolve);
          }
        });
      }
    }, {
      key: "_drawPath",
      value: function _drawPath(points, startIndex, ratioComplete) {
        var x_points = points[0],
            y_points = points[1],
            stroke_len = x_points.length,
            // number of x & y points in stroke
        ratio_complete_len = Math.floor(ratioComplete * stroke_len),
            len = Math.min(ratio_complete_len, x_points.length);
        this.ctx.beginPath();
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.strokeStyle = this.strokeColor; // gives smoother rendering
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#A_lineJoin_example

        this.ctx.lineJoin = this.ctx.lineCap = 'round';

        var _this$_transformPoint = this._transformPoint(x_points[startIndex], y_points[startIndex]),
            x = _this$_transformPoint.x,
            y = _this$_transformPoint.y;

        this.ctx.moveTo(x, y);

        for (var j = startIndex; j < len; j++) {
          var _this$_transformPoint2 = this._transformPoint(x_points[j], y_points[j]),
              _x4 = _this$_transformPoint2.x,
              _y = _this$_transformPoint2.y;

          if (j > 0) {
            // Note: tried using quadraticCurveTo as a smoothing effect but found
            // normal lineTo with a round line cap yielded smoother results
            this.ctx.lineTo(_x4, _y);
          }
        }

        this.ctx.stroke();
        return len - 1;
      }
    }, {
      key: "_transformPoint",
      value: function _transformPoint(x, y) {
        x = (x - this.currentImageProperties.x) * this.currentImageScaleRatio + this.strokeWidth;
        y = (y - this.currentImageProperties.y) * this.currentImageScaleRatio + this.strokeWidth;
        return {
          x: x,
          y: y
        };
      }
    }, {
      key: "_getDrawingProperties",
      value: function _getDrawingProperties(points) {
        var x_range = {
          min: 99999,
          max: 0
        },
            y_range = {
          min: 99999,
          max: 0
        };

        for (var i = 0; i < points.length; i++) {
          var stroke_len = points[i][0].length;

          for (var j = 0; j < stroke_len; j++) {
            var this_x = points[i][0][j],
                this_y = points[i][1][j];
            if (this_x < x_range.min) x_range.min = this_x;else if (this_x > x_range.max) x_range.max = this_x;
            if (this_y < y_range.min) y_range.min = this_y;else if (this_y > y_range.max) y_range.max = this_y;
          }
        }

        return {
          x_range: x_range,
          y_range: y_range,
          width: x_range.max - x_range.min,
          height: y_range.max - y_range.min,
          x: x_range.min,
          y: y_range.min
        };
      }
    }, {
      key: "_logProperties",
      value: function _logProperties() {
        if (this.debug) {
          console.log('Properties:::');
          console.log('\tthis.category:', this.category, '\n', '\tthis.key:', this.key, '\n', '\tthis.index:', this.index, '\n', '\tthis.width:', this.width, '\n', '\tthis.height:', this.height, '\n', '\tthis.strokeWidth:', this.strokeWidth, '\n', '\tthis.strokeColor:', this.strokeColor, '\n', '\tthis.speed:', this.speed, '\n', '\tthis.host:', this.host, '\n', '\tthis.imageData:', this.imageData, '\n', '\tthis.animated:', this.animated, '\n', '\tthis.debug:', this.debug, '\n', '\tthis.time:', this.time, '\n', '\tthis.pause:', this.paused, '\n');
        }
      }
    }, {
      key: "_log",
      value: function _log(s, color) {
        if (this.debug) {
          console.log('%c Quick, Draw! Component ::: ' + '%c' + s, "color:#ffd139;", "color:".concat(color || '#000', ";"));
        }
      } // Render method should return a `TemplateResult` using the provided lit-html `html` tag function

    }, {
      key: "render",
      value: function render() {
        return (0, _litElement.html)(_templateObject_848ba720e8f011e8a0fd47edc2354806, this.category);
      }
    }]);
    return _class2;
  }(_litElement.LitElement));
  customElements.define('quick-draw', QuickDrawElement);
});