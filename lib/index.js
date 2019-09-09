"use strict";

exports.__esModule = true;
exports.useEva = exports.createEffects = exports.mergeActions = exports.createAsyncActions = exports.createActions = exports.connect = void 0;

var _react = _interopRequireWildcard(require("react"));

var _Subject = require("rxjs/internal/Subject");

var _filter = require("rxjs/internal/operators/filter");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var isFn = function isFn(val) {
  return typeof val === 'function';
};

var implementSymbol = Symbol('__IMPLEMENT__');
var namesSymbol = Symbol('__NAMES__');

var createEva = function createEva(actions, effects, subscribes) {
  subscribes = subscribes || {};

  var subscription = function subscription() {
    if (isFn(effects)) {
      effects(function (type, $filter) {
        if (!subscribes[type]) {
          subscribes[type] = new _Subject.Subject();
        }

        if (isFn($filter)) {
          return subscribes[type].pipe((0, _filter.filter)($filter));
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

  dispatch.lazy = function (type, fn) {
    if (subscribes[type] && isFn(fn)) {
      subscribes[type].next(fn());
    }
  };

  var implementAction = function implementAction(name, fn) {
    if (actions && actions[implementSymbol]) {
      actions[implementSymbol](name, fn);
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

var ActionFactory = function ActionFactory(names, isAsync) {
  var _this = this;

  if (isAsync === void 0) {
    isAsync = true;
  }

  var resolvers = {};
  var actions = {};
  names.forEach(function (name) {
    _this[name] = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (isAsync) {
        return new Promise(function (resolve, reject) {
          if (actions[name]) {
            resolve(actions[name].apply(actions, args));
          } else {
            resolvers[name] = resolvers[name] || [];
            resolvers[name].push({
              resolve: resolve,
              args: args,
              reject: reject
            });
          }
        });
      } else {
        if (actions[name]) {
          return actions[name].apply(actions, args);
        } else {
          resolvers[name] = resolvers[name] || [];
          resolvers[name].push({
            resolve: null,
            args: args,
            reject: null
          });

          if (console && console.error) {
            console.error("The action \"" + name + "\" is not implemented! We recommend that you call this method by `createAscyncActions`");
          }
        }
      }
    };
  });
  this[namesSymbol] = names;

  this[implementSymbol] = function (name, fn) {
    if (resolvers[name] && resolvers[name].length) {
      setTimeout(function () {
        for (var i = 0; i < resolvers[name].length; i++) {
          var _resolvers$name$i = resolvers[name][i],
              resolve = _resolvers$name$i.resolve,
              args = _resolvers$name$i.args;
          if (resolve) resolve(fn.apply(void 0, args));else {
            fn.apply(void 0, args);
          }
        }

        resolvers[name].length = 0;
      });
    }

    actions[name] = fn;
    return fn;
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
    options = _extends({}, defaultOptions, {}, options);
  }

  var _class_ = function _class_(Target) {
    var Effect =
    /*#__PURE__*/
    function (_Component) {
      _inheritsLoose(Effect, _Component);

      function Effect(props) {
        var _this2;

        _this2 = _Component.call(this, props) || this;
        _this2.subscribes = {};

        var _createEva = createEva(props.actions, props.effects, props.subscribes),
            subscription = _createEva.subscription,
            dispatch = _createEva.dispatch,
            implementActions = _createEva.implementActions;

        _this2.implementActions = implementActions;
        _this2.subscription = subscription;
        _this2.dispatch = dispatch;

        if (options.autoRun) {
          subscription();
        }

        return _this2;
      }

      var _proto = Effect.prototype;

      _proto.render = function render() {
        return _react["default"].createElement(Target, _extends({}, this.props, {
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
  for (var _len3 = arguments.length, names = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    names[_key3] = arguments[_key3];
  }

  return new ActionFactory(names, false);
};

exports.createActions = createActions;

var createAsyncActions = function createAsyncActions() {
  for (var _len4 = arguments.length, names = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    names[_key4] = arguments[_key4];
  }

  return new ActionFactory(names, true);
};

exports.createAsyncActions = createAsyncActions;

var mergeActions = function mergeActions() {
  for (var _len5 = arguments.length, all = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    all[_key5] = arguments[_key5];
  }

  var implement = function implement(name, fn) {
    all.forEach(function (actions) {
      if (actions[implementSymbol] && actions[namesSymbol].indexOf(name) > -1) {
        actions[implementSymbol](name, fn);
      }
    });
    return fn;
  };

  var result = {};

  for (var i = 0; i < all.length; i++) {
    var actions = all[i];
    result[namesSymbol] = result[namesSymbol] || [];
    result[namesSymbol] = result[namesSymbol].concat(actions[namesSymbol]);
    var key = void 0;

    for (key in actions) {
      if (actions.hasOwnProperty(key) && key !== implementSymbol && key !== namesSymbol) {
        result[key] = actions[key];
      }
    }
  }

  result[implementSymbol] = implement;
  return result;
};

exports.mergeActions = mergeActions;

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

  return _react["default"].useMemo(function () {
    var manager = createEva(actions, effects, subscribes);

    if (autoRun) {
      manager.subscription();
    }

    return manager;
  }, []);
};

exports.useEva = useEva;