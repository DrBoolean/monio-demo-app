/*! Monio: maybe.mjs
    v0.34.0-pre (c) 2022 Kyle Simpson
    MIT License: http://getify.mit-license.org
*/
import{isFunction}from"./lib/util.mjs";import Just from"./just.mjs";import Nothing from"./nothing.mjs";const BRAND={};Object.assign(MaybeJust,Just),Object.assign(MaybeNothing,Nothing);export default Object.assign(Maybe,{Just:MaybeJust,Nothing:MaybeNothing,of:Maybe,pure:Maybe,unit:Maybe,is:is,from:from});function MaybeJust(n){return Maybe(n)}function MaybeNothing(){return Maybe(Nothing())}function Maybe(n){var t=n,i=MaybeJust.is(t)&&!is(t),a=MaybeNothing.is(t)&&!is(t);i||a?n=i?t.chain((n=>n)):void 0:(t=Just(n),i=!0);var o={map:function map(n){return i?Maybe(t.map(n)):o},chain:chain,flatMap:chain,bind:chain,ap:function ap(t){return i?t.map(n):o},concat:function concat(t){return i?t.map((t=>n.concat(t))):o},fold:function fold(t,a){return i?a(n):t(n)},_inspect:function _inspect(){var n=i?t._inspect().match(/^Just\((.*)\)$/)[1]:"";return`${o[Symbol.toStringTag]}(${n})`},_is:function _is(n){return!(n!==BRAND&&!t._is(n))},get[Symbol.toStringTag](){return`Maybe:${t[Symbol.toStringTag]}`}};return o;function chain(n){return i?t.chain(n):o}}function is(n){return!!(n&&isFunction(n._is)&&n._is(BRAND))}function from(n){return MaybeNothing.isEmpty(n)?MaybeNothing():Maybe(n)}