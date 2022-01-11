import Either from "monio/either";
import IO from "monio/io";
import IOx from "monio/iox";
import { log, applyIO, getPropIO } from "monio/io/helpers";
import { waitFor } from "monio/iox/helpers";

import {
	identity,
	getElement,
	createElement,
	appendElement,
	disableElement,
	enableElement,
	apiGet
} from "./util.mjs";


// run the app
IO.do(app)
.run(/*readerEnv=*/{ doc: window.document, })
.catch(err => console.log(err.toString()));


// *****************************************************

function *app(viewContext) {
	// wait for DOM-ready
	yield waitFor(IOx.onEvent(viewContext.doc,"DOMContentLoaded"));

	// get DOM element references
	var platformsEl = yield getElement("platforms-list");

	// add DOM elements into the viewContext
	viewContext = {
		// copy the readerEnv so we can safely modify it locally
		...viewContext,

		platformsEl,
	};

	return applyIO(IO.do(runApp),viewContext);
}

function *runApp({ platformsEl, }) {
	// attempt to load platforms list
	try {
		yield IO.doEither(loadPlatforms);
	}
	catch (err) {
		// print the error (by folding the Either:Left value)
		console.log(
			err.fold(identity,()=>{}).toString()
		);
		return;
	}

	yield enableElement(platformsEl);
}

function *loadPlatforms({ platformsEl, }) {
	var platforms = yield IO.doEither(apiGet,"platforms");

	// unwrap Either (throws if failed)
	platforms = yield platforms;

	for (let platformName of platforms) {
		let optEl = yield createElement("option");
		optEl.innerText = platformName;
		yield appendElement(platformsEl,optEl);
	}
}
