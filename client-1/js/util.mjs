import Maybe from "monio/maybe";
import Either from "monio/either";
import IO from "monio/io";
import {
	iif,
	els,
	iReturn,
	ifReturned
} from "monio/io/helpers";

export {
	identity,
	getElement,
	createElement,
	appendElement,
	disableElement,
	enableElement,
	apiGet
};


// *********************************************

function identity(v) { return v; }
function getElement(id) { return IO(({ doc }) => doc.getElementById(id)); }
function createElement(type) { return IO(({ doc }) => doc.createElement(type)); }
function appendElement(parentEl,childEl) { return IO(() => parentEl.appendChild(childEl)); }
function disableElement(el) { return IO(() => el.disabled = true); }
function enableElement(el) { return IO(() => el.disabled = false); }

function *apiGet(env,endpoint) {
	try {
		let res = yield fetch(`/api/${endpoint}`);
		let json = Maybe.from(
			yield ifReturned(
				iif(res && res.ok,$=>[
					iReturn(res.json()),
				])
			)
		);
		return json.fold(
			() => Either.Left("API call failed."),
			Either.Right
		);
	}
	catch (err) {
		return Either.Left("API call failed.");
	}
}
