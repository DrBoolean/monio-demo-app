import Maybe from "monio/maybe";
import Either from "monio/either";
import IO from "monio/io";
import IOx from "monio/iox";
import {
	log,
	match,
	applyIO,
	getPropIO
} from "monio/io/helpers";
import { waitFor } from "monio/iox/helpers";

import {
	identity,
	setProp,
	getElement,
	createElement,
	appendElement,
	disableElement,
	enableElement,
	apiGet,
	reportError
} from "./util.mjs";


// run the app
IO.do(app)
.run(/*readerEnv=*/{ doc: window.document, })
.catch(reportError);


// *****************************************************

function *app(viewContext) {
	// wait for DOM-ready
	yield waitFor(IOx.onEvent(viewContext.doc,"DOMContentLoaded"));

	// get DOM element references
	var platformsEl = yield getElement("platforms-list");
	var searchBtn = yield getElement("search-btn");
	var searchResultsEl = yield getElement("search-results");

	// add DOM elements into the view-context
	viewContext = {
		// copy the view-context so we can safely modify
		// it locally
		...viewContext,

		platformsEl,
		searchBtn,
		searchResultsEl,
	};

	// run the rest of the app in our amended view-context
	return applyIO(IO.doEither(runApp),viewContext);
}

function *runApp(viewContext) {
	var { platformsEl, searchBtn } = viewContext;

	// attempt to load platforms list (throws on failure)
	yield IO.doEither(loadPlatforms);

	// platform loading worked, so move along
	yield enableElement(platformsEl);

	// listen for changes of the platforms-selector
	//
	// note: not `yield`ing here, but `run()`ing manually,
	// so that we don't block waiting for the first event
	// to fire
	IOx.do(changePlatform,[ IOx.onEvent(platformsEl,"change") ])
	.run(viewContext);

	// listen for clicks on the search button
	//
	// note: ditto about `yield` vs `run()`

	// IOx.doEither(doSearch,[ IOx.onEvent(searchBtn,"click") ])
	// .run(viewContext);

	IOx(() => void(
		IO.doEither(doSearch).run(viewContext).catch(err => console.log("ugh",err))
	),[ IOx.onEvent(searchBtn,"click") ])
	.run(viewContext);
}

function *loadPlatforms({ platformsEl, }) {
	// throws on failure
	var platforms = yield IO.doEither(apiGet,"platforms");

	// populate the platform selector
	for (let platformName of platforms) {
		let optEl = yield createElement("option");
		optEl.innerText = platformName;
		yield appendElement(platformsEl,optEl);
	}
}

function *getPlatformName({ platformsEl, }) {
	return Maybe.from(platformsEl.value || undefined);
}

function *changePlatform({ platformsEl, searchBtn, searchResultsEl }) {
	// returns a Maybe
	var platformNameM = yield IO.do(getPlatformName);

	return platformNameM.fold(

		// platform name not selected?
		() => (
			IO.do(noShowsAvailable)
			.chain(() => disableElement(searchBtn))
		),

		// otherwise, platform name selected
		() => enableElement(searchBtn)

	);
}

function *doSearch({ platformsEl, searchResultsEl, }) {
	// returns a Maybe
	var platformNameM = yield IO.do(getPlatformName);

	// short-circuit out if no platform is selected
	var platformName = yield platformNameM;

	// attempt to load list of shows for platform
	try {
		// throws (Either:Left) if it fails
		let shows = yield IO.doEither(
			apiGet,
			`platform/${ encodeURIComponent(platformName) }`
		);

		return IO.do(displayShows,shows);
	}
	catch (err) {
		reportError(err);
		return IO.do(noShowsAvailable);
	}
}

function *noShowsAvailable({ searchResultsEl, }) {
	return IO(() => searchResultsEl.innerHTML = "--no shows--");
}

function *displayShows({ searchResultsEl, },showList) {
	// VERSION 1 (friendly do-syntax):
	yield setProp("innerHTML","",searchResultsEl);

	var docFragment = yield IO(({ doc }) => doc.createDocumentFragment());

	for (let showData of showList) {
		let el = yield createElement("div");
		yield setProp("innerText",`${showData.Title} (${showData.Year})`,el);
		yield appendElement(docFragment,el);
	}

	yield appendElement(searchResultsEl,docFragment);


	// // VERSION 2 (expression-chain syntax):
	// yield (
	// 	setProp("innerHTML","",searchResultsEl)
	// 	.chain(() => (
	// 		showList.reduce(
	// 			(ioChain,showData) => (
	// 				ioChain.chain(docFragment => (
	// 					createElement("div")
	// 					.chain(setProp("innerText",`${showData.Title} (${showData.Year})`))
	// 					.chain(appendElement(docFragment))
	// 					.map(() => docFragment)
	// 				))
	// 			),
	// 			IO(({ doc }) => doc.createDocumentFragment())
	// 		)
	// 	))
	// 	.chain(appendElement(searchResultsEl))
	// );
}
