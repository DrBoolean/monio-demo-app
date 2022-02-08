# Monio Demo App

This app demonstrates various usages of the [Monio library's monads](https://github.com/getify/monio/blob/master/README.md#monios-monads), especially the [IO](https://github.com/getify/monio/blob/master/README.md#io-monad-one-monad-to-rule-them-all) and [IOx](https://github.com/getify/monio/blob/master/README.md#iox-aka-reactive-io-aka-observable-io) (aka "reactive IO" or "observable IO") monads.

## Run The Demo Locally

1. Clone this repo

2. run `npm install`

3. run `npm start`

By default, this will start the server locally on port `8090`, and the client can thus be viewed in the browser at `http://localhost:8090`.

To run the server on a different port than the default `8090`, set the `PORT` environment variable to a different number, such as `PORT=3000 npm start`.

By default, the client defined in the `client-1` directory will be served up via the browser. To select a different client in a different directory, set the `MONIO_DEMO_CLIENT_DIR` to a relative (from the project root) or absolute path, such as `MONIO_DEMO_CLIENT_DIR=/tmp/other-client npm start`. Note that the specified directory will be treated as the web-root.

## Modifying Client Files (Import Maps In Browser)

The client code uses `import`s with friendly specifiers (e.g., `"monio/io"`) rather than full paths (e.g., `"/js/monio/io/io.mjs"`) as browsers typically require. It does so by relying on [Import Maps](https://github.com/WICG/import-maps), a browser feature that allows the browser to automatically translate specifiers like `"monio/io"` to `"/js/monio/io/io.mjs"` when it finds them in `import` statements.

Unfortunately, [browser support for Import Maps](https://caniuse.com/?search=importmap) isn't so great; at time of writing, it's only Chrome/Chromium-based browsers.

To work around this limitation, the original client code (in `/js/` directory) is also transpiled, with a tool called [Import-Remap](https://github.com/getify/import-remap), so that all the `import` specifiers have already been translated. The outcome is that any non-Chromium browsers (Firefox, Safari, etc) will load the client files from the `/js-nim/` directory rather than from the `/js/` directory.

If you modify any of the client files in `/js/`, and want to see those changes reflected in all browsers (besides Chromium), you'll need to rebuild the `/js-nim/` directory tree. In the `scripts/` directory of this repository, a helper tool (`scripts/build-client`) is provided to perform this re-build.

To run the tool:

```cmd
npm run build
```

**Note:** This tool is also automatically run whenever you start the server with `npm start`.

That defaults to rebuilding the client code under the `/client-1/` directory. However, you can also tell the tool to run against a different client directory, like this:

```cmd
npm run build -- --client=/path/to/another/client
```

The build tool will assume to build ESM files from the specified client directory's `/js/` sub-directory to a `/js-nim/` sub-directory (which must already exist).

## License

All code and documentation are (c) 2022 Kyle Simpson and Brian Lonsdorf, and released under the MIT License. A copy of the MIT License [is also included](LICENSE.txt).
