/*! Monio: just.mjs
    v0.34.0-pre (c) 2022 Kyle Simpson
    MIT License: http://getify.mit-license.org
*/
import{isFunction}from"./lib/util.mjs";const BRAND={};export default Object.assign(Just,{of:Just,pure:Just,unit:Just,is:is});function Just(n){var i={map:function map(i){return Just(i(n))},chain:chain,flatMap:chain,bind:chain,ap:function ap(i){return i.map(n)},concat:function concat(i){return i.map((i=>n.concat(i)))},_inspect:function _inspect(){return`${i[Symbol.toStringTag]}(${_serialize(n)})`},_is:function _is(n){return n===BRAND},[Symbol.toStringTag]:"Just"};return i;function chain(i){return i(n)}function _serialize(n){return"string"==typeof n?`"${n}"`:void 0===n?"":isFunction(n)?n.name||"anonymous function":n&&isFunction(n._inspect)?n._inspect():Array.isArray(n)?`[${n.map((n=>null==n?String(n):_serialize(n)))}]`:String(n)}}function is(n){return!!(n&&isFunction(n._is)&&n._is(BRAND))}