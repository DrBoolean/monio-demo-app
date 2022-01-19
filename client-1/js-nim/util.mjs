import { curry, isMonad, isFunction } from "/js-nim/monio/lib/util.mjs";
import Maybe from "/js-nim/monio/maybe.mjs";
import Either from "/js-nim/monio/either.mjs";
import IO from "/js-nim/monio/io/io.mjs";
import { iif, els, iReturn, ifReturned } from "/js-nim/monio/io/helpers.mjs";
const setPropC = curry(setProp, 3);
const appendElementC = curry(appendElement, 2);
export { identity, setPropC as setProp, getElement, createElement, appendElementC as appendElement, disableElement, enableElement, apiGet, reportError }; // *********************************************

function identity(v) {
  return v;
}

function setProp(propName, val, obj) {
  return IO(() => {
    obj[propName] = val;
    return obj;
  });
}

function getElement(id) {
  return IO(({
    doc
  }) => doc.getElementById(id));
}

function createElement(type) {
  return IO(({
    doc
  }) => doc.createElement(type));
}

function appendElement(parentEl, childEl) {
  return IO(() => parentEl.appendChild(childEl));
}

function disableElement(el) {
  return IO(() => el.disabled = true);
}

function enableElement(el) {
  return IO(() => el.disabled = false);
} // returns an Either


function* apiGet(env, endpoint) {
  var apiEndpointURL = `/api/${endpoint}`;

  try {
    let res = yield fetch(apiEndpointURL);
    let json = Maybe.from(yield ifReturned(iif(res && res.ok, $ => [iReturn(res.json())])));
    return json.fold(() => Either.Left(`API call failed: ${apiEndpointURL}`), res => Either.Right(res));
  } catch (err) {
    return Either.Left(`API call failed: ${apiEndpointURL}`);
  }
}

function reportError(err) {
  if (Either.Left.is(err)) {
    console.log(err.fold(identity, identity));
  } else if (isMonad(err)) {
    console.log(err._inspect());
  } else if (isFunction(err.toString)) {
    console.log(err.toString());
  } else {
    console.log(err);
  }
}