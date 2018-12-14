"use strict";

exports.__esModule = true;
exports.isFn = exports.toArr = void 0;

var toArr = function toArr(arr) {
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
};

exports.toArr = toArr;

var isFn = function isFn(val) {
  return typeof val === "function";
};

exports.isFn = isFn;