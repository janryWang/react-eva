"use strict";

exports.__esModule = true;
exports.createEffects = exports.declareActions = exports.effectable = exports.EffectProvider = void 0;

var _react = _interopRequireWildcard(require("react"));

var _utils = require("./utils");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _React$createContext = _react.default.createContext(),
    Provider = _React$createContext.Provider,
    Consumer = _React$createContext.Consumer;

var EffectProvider = function EffectProvider(props) {
  return _react.default.createElement(Provider, {
    actions: props.actions,
    effects: props.effects
  });
};

exports.EffectProvider = EffectProvider;

var effectable = function effectable(options) {
  var Target;
  var defaultOptions = {
    autoRun: true
  };

  if ((0, _utils.isFn)(options)) {
    Target = options;
    options = _extends({}, defaultOptions);
  } else {
    options = _extends({}, defaultOptions, options);
  }

  var _class_ = function _class_(Target) {
    var Effect =
    /*#__PURE__*/
    function (_Component) {
      _inheritsLoose(Effect, _Component);

      function Effect(props) {
        var _this;

        _this = _Component.call(this, props) || this;

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "subscription", function () {
          _this.runEffects();
        });

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "createAction", function (name, fn) {
          var actions = _this.props.actions;

          if (name && (0, _utils.isFn)(fn)) {
            if (actions) {
              actions[name] = fn;
              return actions[name];
            }
          }
        });

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "createEvents", function () {
          for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
            names[_key] = arguments[_key];
          }

          return names.reduce(function (buf, name) {
            buf[name] = function () {
              var _this2;

              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              (_this2 = _this).dispatch.apply(_this2, [name].concat(args));
            };

            return buf;
          }, {});
        });

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "dispatch", function (type) {
          if (_this.subscribes[type]) {
            var _this$subscribes$type;

            for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              args[_key3 - 1] = arguments[_key3];
            }

            (_this$subscribes$type = _this.subscribes[type]).next.apply(_this$subscribes$type, args);
          }
        });

        _this.initialize(props);

        return _this;
      }

      var _proto = Effect.prototype;

      _proto.initialize = function initialize(props) {
        this.subscribes = {};

        if (options.autoRun) {
          this.runEffects(props);
        }
      };

      _proto.runEffects = function runEffects(props) {
        var _this3 = this;

        var _ref = props || this.props,
            effects = _ref.effects;

        if ((0, _utils.isFn)(effects)) {
          effects(function (type, $filter) {
            if (!_this3.subscribes[type]) {
              _this3.subscribes[type] = new _rxjs.Subject();
            }

            if ((0, _utils.isFn)($filter)) {
              return _this3.subscribes[type].pipe((0, _operators.filter)($filter));
            }

            return _this3.subscribes[type];
          });
        }
      };

      _proto.render = function render() {
        return _react.default.createElement(Target, _extends({}, this.props, {
          createAction: this.createAction,
          createEvents: this.createEvents,
          dispatch: this.dispatch,
          subscribes: this.subscribes,
          subscription: this.subscription
        }));
      };

      return Effect;
    }(_react.Component);

    return function (props) {
      return _react.default.createElement(Consumer, null, function (_temp) {
        var _ref2 = _temp === void 0 ? {} : _temp,
            actions = _ref2.actions,
            effects = _ref2.effects;

        return _react.default.createElement(Effect, _extends({
          actions: actions,
          effects: effects
        }, props));
      });
    };
  };

  return Target ? _class_(Target) : _class_;
};

exports.effectable = effectable;

var declareActions = function declareActions() {
  for (var _len4 = arguments.length, names = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    names[_key4] = arguments[_key4];
  }

  return names.reduce(function (buf, name) {
    buf[name] = function () {
      if (console && console.error) {
        console.error("The action \"" + name + "\" is not handshake successfully!");
      }
    };

    return buf;
  }, {});
};

exports.declareActions = declareActions;

var createEffects = function createEffects(fn) {
  return fn;
};

exports.createEffects = createEffects;