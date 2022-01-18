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
} from "app-util";


var noShowsAvailable = (
	IO(({ searchResultsEl, }) => searchResultsEl)
		.chain(setProp("innerHTML","--no shows--"))
);


// run the app
IO.do(app)
.run(/*readerEnv=*/{ doc: window.document })
.catch(reportError);


// *****************************************************

function *app(viewContext) {
	// wait for DOM-ready
	yield waitFor(
		IOx.onEvent(viewContext.doc,"DOMContentLoaded")
	);

	// get DOM element references
	var platformsEl = yield getElement("platforms-list");
	var searchBtn = yield getElement("search-btn");
	var searchResultsEl = yield getElement("search-results");

	// store DOM elements in the view-context
	viewContext = {
		// copy the original view-context so we
		// can safely modify it locally
		...viewContext,

		platformsEl,
		searchBtn,
		searchResultsEl
	};

	// run the rest of the app in our amended
	// view-context
	return applyIO(IO.doEither(runApp),viewContext);
}

function *runApp(viewContext) {
	var { platformsEl, searchBtn } = viewContext;

	// attempt to load platforms list (throws on
	// failure)
	yield IO.doEither(loadPlatforms);

	// platform loading worked, so move along
	yield enableElement(platformsEl);
	yield noShowsAvailable;

	// listen for changes of the platforms-selector
	//
	// note: not `yield`ing here, but `run()`ing
	// manually, so that we don't block waiting for
	// the first event to fire
	IOx.do(changePlatform,[ IOx.onEvent(platformsEl,"change") ])
		.run(viewContext);

	// VERSION 1 (listen for clicks on the search button)
	//
	// note: ditto about `yield` vs `run()`
	IOx.doEither(doSearch,[ IOx.onEvent(searchBtn,"click") ])
		.run(viewContext);


	// // VERSION 2 (listen for clicks on the search button)
	// //
	// // note: ditto about `yield` vs `run()`
	// IOx.do(doSearchAlt,[ IOx.onEvent(searchBtn,"click") ])
	// 	.run(viewContext);
}

function *loadPlatforms({ platformsEl }) {
	// throws on failure
	var platforms = yield IO.doEither(apiGet,"platforms");

	// populate the platform selector
	for (let platformName of platforms) {
		let optEl = yield createElement("option");
		yield setProp("innerText",platformName,optEl);
		yield appendElement(platformsEl,optEl);
	}
}

function *getPlatformName({ platformsEl }) {
	return Maybe.from(platformsEl.value || undefined);
}

function *changePlatform({ searchBtn }) {
	// returns a Maybe
	var platformNameM = yield IO.do(getPlatformName);

	return platformNameM.fold(

		// platform name not selected?
		() => (
			noShowsAvailable
			.chain(() => disableElement(searchBtn))
		),

		// otherwise, valid platform name selected
		() => enableElement(searchBtn)

	);
}

// VERSION 1 (`doSearch(..)` invoked with `doEither(..)`)
// Either:Left values throw, so error handling done with
// `try..catch` style
function *doSearch(viewContext) {
	// returns a Maybe
	var platformNameM = yield IO.do(getPlatformName);

	// short-circuit out if no platform is selected
	var platformName = yield platformNameM;

	// attempt to load list of shows for platform
	try {
		// since `doSearch(..)` is run by `doEither(..)`,
		// an Either:Left (if the API call fails) will
		// throw here
		let listOfShows = yield IO.doEither(
			apiGet,
			`platform/${encodeURIComponent(platformName)}`
		);

		return IO.do(displayShows,listOfShows);
	}
	catch (err) {
		reportError(err);
		return noShowsAvailable;
	}
}


// // ---------------------------------------------------
// // VERSION 2 (`doSearchAlt(..)` invoked with `do(..)`)
// // no automatic throwing of Either:Left, so uses
// // fold(..) for success/error handling
// function *doSearchAlt(viewContext) {
// 	// returns a Maybe
// 	var platformNameM = yield IO.do(getPlatformName);

// 	// short-circuit out if no platform is selected
// 	var platformName = yield platformNameM;

// 	var resE = yield IO.do(
// 		apiGet,
// 		`platform/${encodeURIComponent(platformName)}`
// 	);

// 	return resE.fold(
// 		err => {
// 			reportError(err);
// 			return noShowsAvailable;
// 		},
// 		listOfShows => IO.do(displayShows,listOfShows)
// 	);
// }

function *displayShows({ searchResultsEl },listOfShows) {
	// VERSION 1 (friendly do-syntax):
	yield setProp("innerHTML","",searchResultsEl);

	var docFragment = yield IO(({ doc }) => doc.createDocumentFragment());

	for (let showData of listOfShows) {
		let el = yield createElement("div");
		let showGenres = showData.Genres.split(",").join(" | ");
		yield setProp(
			"innerText",
			`${showData.Title} (${showData.Year}) | ${showGenres}`,
			el
		);
		yield appendElement(docFragment,el);
	}

	yield appendElement(searchResultsEl,docFragment);


	// // ---------------------------------------------------
	// // VERSION 2 (more canonical expression-chain syntax):
	// yield (
	// 	setProp("innerHTML","",searchResultsEl)
	// 	.chain(() => (
	// 		listOfShows.reduce(
	// 			(ioChain,showData) => (
	// 				ioChain.chain(docFragment => (
	// 					createElement("div")
	// 					.chain(setProp(
	// 						"innerText",
	// 						`${showData.Title} (${showData.Year}) | ${showData.Genres.split(",").join(" | ")}`
	// 					))
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
