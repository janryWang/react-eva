"use strict";

exports.__esModule = true;
exports.useEva = exports.createEffects = exports.createActions = exports.connect = void 0;

var _react = _interopRequireWildcard(require("react"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var EvaContext = _react.default.createContext();

var isFn = function isFn(val) {
  return typeof val === 'function';
};

var createEva = function createEva(actions, effects, subscribes) {
  subscribes = subscribes || {};

  var subscription = function subscription() {
    if (isFn(effects)) {
      effects(function (type, $filter) {
        if (!subscribes[type]) {
          subscribes[type] = new _rxjs.Subject();
        }

        if (isFn($filter)) {
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

  var implementAction = function implementAction(name, fn) {
    if (actions) {
      if (name && isFn(fn)) {
        if (Array.isArray(actions)) {
          var findedIndex = actions.findIndex(function (actions) {
            return !!actions[name];
          });

          if (findedIndex > -1) {
            actions[findedIndex][name] = fn;
          }
        } else if (typeof actions === 'object') {
          if (actions[name]) {
            actions[name] = fn;
          }
        }
      }
    }

    return fn;
  };

  var implementActions = function implementActions(obj) {
    var actions = {};

    for (var name in obj) {
      if (obj.hasOwnProperty(name) && isFn(obj[name])) {
        actions[name] = implementAction(name, obj[name]);
      }
    }

    return actions;
  };

  return {
    dispatch: dispatch,
    subscription: subscription,
    implementActions: implementActions
  };
};

var connect = function connect(options) {
  var Target;
  var defaultOptions = {
    autoRun: true
  };

  if (isFn(options)) {
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

        var _createEva = createEva(props.actions, props.effects, props.subscribes),
            subscription = _createEva.subscription,
            dispatch = _createEva.dispatch,
            implementActions = _createEva.implementActions;

        _this.implementActions = implementActions;
        _this.subscription = subscription;
        _this.dispatch = dispatch;

        if (options.autoRun) {
          subscription();
        }

        return _this;
      }

      var _proto = Effect.prototype;

      _proto.render = function render() {
        return _react.default.createElement(Target, _extends({}, this.props, {
          implementActions: this.implementActions,
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

exports.connect = connect;

var createActions = function createActions() {
  for (var _len2 = arguments.length, names = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    names[_key2] = arguments[_key2];
  }

  return names.reduce(function (buf, name) {
    buf[name] = function () {
      if (console && console.error) {
        console.error("The action \"" + name + "\" is not implemented!");
      }
    };

    return buf;
  }, {});
};

exports.createActions = createActions;

var createEffects = function createEffects(fn) {
  return fn;
};

exports.createEffects = createEffects;

var useEva = function useEva(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      actions = _ref.actions,
      effects = _ref.effects,
      subscribes = _ref.subscribes,
      _ref$autoRun = _ref.autoRun,
      autoRun = _ref$autoRun === void 0 ? true : _ref$autoRun;

  var context = _react.default.useContext(EffectsContext) || {};
  return _react.default.useMemo(function () {
    var manager = createEva(actions, effects, subscribes);

    if (autoRun) {
      manager.subscription();
    }

    return manager;
  });
};

exports.useEva = useEva;