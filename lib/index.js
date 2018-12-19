"use strict";

exports.__esModule = true;
exports.usePipeEffects = exports.createEffects = exports.declareActions = exports.effectable = void 0;

var _react = _interopRequireWildcard(require("react"));

var _utils = require("./utils");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var EffectsContext = _react.default.createContext();

var createEffectsManager = function createEffectsManager(declaredActions, effects, subscribes) {
  subscribes = subscribes || {};

  var subscription = function subscription() {
    if ((0, _utils.isFn)(effects)) {
      effects(function (type, $filter) {
        if (!subscribes[type]) {
          subscribes[type] = new _rxjs.Subject();
        }

        if ((0, _utils.isFn)($filter)) {
          return subscribes[type].pipe((0, _operators.filter)($filter));
        }

        return subscribes[type];
      });
    }
  };

  var dispatch = function dispatch(type) {
    if (subscribes[type]) {
      var _subscribes$type;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_subscribes$type = subscribes[type]).next.apply(_subscribes$type, args);
    }
  };

  var createEvents = function createEvents() {
    for (var _len2 = arguments.length, names = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      names[_key2] = arguments[_key2];
    }

    return names.reduce(function (buf, name) {
      if (typeof name === "object") {
        var _loop = function _loop(key) {
          if (name.hasOwnProperty(key) && (0, _utils.isFn)(name[key])) {
            buf[key] = function () {
              for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
              }

              var res = name[key].apply(name, args);

              if (res !== undefined) {
                dispatch(key, res);
              } else {
                dispatch.apply(void 0, [key].concat(args));
              }
            };
          }
        };

        for (var key in name) {
          _loop(key);
        }
      } else if (typeof name === "string") {
        buf[name] = function () {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          dispatch.apply(void 0, [name].concat(args));
        };
      }

      return buf;
    }, {});
  };

  var handshakeAction = function handshakeAction(name, fn) {
    if (declaredActions) {
      if (name && (0, _utils.isFn)(fn)) {
        if (Array.isArray(declaredActions)) {
          var findedIndex = declaredActions.findIndex(function (actions) {
            return !!actions[name];
          });

          if (findedIndex > -1) {
            declaredActions[findedIndex][name] = fn;
          }
        } else if (typeof declaredActions === "object") {
          if (declaredActions[name]) {
            declaredActions[name] = fn;
          }
        }
      }
    }

    return fn;
  };

  var handshakeActions = function handshakeActions(obj) {
    var actions = {};

    for (var name in obj) {
      if (obj.hasOwnProperty(name) && (0, _utils.isFn)(obj[name])) {
        actions[name] = handshakeAction(name, obj[name]);
      }
    }

    return actions;
  };

  return {
    dispatch: dispatch,
    createEvents: createEvents,
    subscription: subscription,
    handshakeAction: handshakeAction,
    handshakeActions: handshakeActions
  };
};

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
        _this.subscribes = {};

        var _createEffectsManager = createEffectsManager(props.declaredActions || props.actions, props.effects, props.subscribes),
            subscription = _createEffectsManager.subscription,
            dispatch = _createEffectsManager.dispatch,
            createEvents = _createEffectsManager.createEvents,
            handshakeAction = _createEffectsManager.handshakeAction,
            handshakeActions = _createEffectsManager.handshakeActions;

        _this.handshakeAction = handshakeAction;
        _this.handshakeActions = handshakeActions;
        _this.subscription = subscription;
        _this.dispatch = dispatch;
        _this.createEvents = createEvents;

        if (options.autoRun) {
          subscription();
        }

        return _this;
      }

      var _proto = Effect.prototype;

      _proto.render = function render() {
        return _react.default.createElement(Target, _extends({}, this.props, {
          handshakeAction: this.handshakeAction,
          handshakeActions: this.handshakeActions,
          createEvents: this.createEvents,
          dispatch: this.dispatch,
          subscribes: this.subscribes,
          subscription: this.subscription
        }));
      };

      return Effect;
    }(_react.Component);

    return Effect;
  };

  return Target ? _class_(Target) : _class_;
};

exports.effectable = effectable;

var declareActions = function declareActions() {
  for (var _len5 = arguments.length, names = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    names[_key5] = arguments[_key5];
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

var usePipeEffects = function usePipeEffects(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      declaredActions = _ref.declaredActions,
      actions = _ref.actions,
      effects = _ref.effects,
      subscribes = _ref.subscribes,
      _ref$autoRun = _ref.autoRun,
      autoRun = _ref$autoRun === void 0 ? true : _ref$autoRun;

  var context = _react.default.useContext(EffectsContext) || {};
  declaredActions = declaredActions || actions;
  return _react.default.useMemo(function () {
    var manager = createEffectsManager(declaredActions, effects, subscribes);

    if (autoRun) {
      manager.subscription();
    }

    return manager;
  });
};

exports.usePipeEffects = usePipeEffects;