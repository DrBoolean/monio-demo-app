# Monio Demo App

This app demonstrates various usages of the [Monio library's monads](https://github.com/getify/monio/blob/master/README.md#monios-monads), especially the [IO](https://github.com/getify/monio/blob/master/README.md#io-monad-one-monad-to-rule-them-all) and [IOx](https://github.com/getify/monio/blob/master/README.md#iox-aka-reactive-io-aka-observable-io) (aka "reactive IO" or "observable IO") monads.

## Run The Demo Locally

1. Clone this repo

2. run `npm install`

3. run `npm start`

By default, this will start the server locally on port `8090`, and the client can thus be viewed in the browser at `http://localhost:8090`.

To run the server on a different port than the default `8090`, set the `PORT` environment variable to a different number, such as `PORT=3000 npm start`.

By default, the client defined in the `client-1` directory will be served up via the browser. To select a different client in a different directory, set the `MONIO_DEMO_CLIENT_DIR` to a relative (from the project root) or absolute path, such as `MONIO_DEMO_CLIENT_DIR=/tmp/client npm start`. Note that the specified directory is treated as the web-root.

## License

All code and documentation are (c) 2022 Kyle Simpson and Brian Lonsdorf, and released under the MIT License. A copy of the MIT License [is also included](LICENSE.txt).
