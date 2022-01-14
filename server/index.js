"use strict";

const path = require("path");
const fs = require("fs");

const express = require("express");
const { parse } = require("csv-parse");
const PORT = process.env.PORT || 8090;
const MONIO_DEMO_CLIENT_DIR = path.resolve(
	path.join(__dirname,".."),
	process.env.MONIO_DEMO_CLIENT_DIR || "client-1"
);
const app = express();

fs.readFile(path.join(__dirname,"data.csv"), "utf8", (err, data) => {
	parse(data, { columns: true }, (err,csv) => {
		const db = [ ...csv ];

		app.get("/api/platforms", (req,res) => (
			res.json(["Netflix", "Prime Video", "Hulu", "Disney+"])
		));

		app.get("/api/rows/:id", (req,res) => (
			res.json(db.filter(r => (Number(req.params.id) === Number(r.ID))))
		));

		app.get("/api/platform/:platform", (req,res) => (
			res.json(db.filter(r => (Number(r[req.params.platform]) === 1)))
		));

		// silence annoying browser auto-requests for favicon
		app.get("/favicon.ico", (req,res) => {
			res.writeHead(204,{ "Cache-Control": `public, max-age=${60*60*24*30}`, }).end();
		});

		app.use(express.static(MONIO_DEMO_CLIENT_DIR,{
			etag: false,
			lastModified: false,
			fallthrough: false,
			setHeaders(res,path,stat) {
				res.set("Cache-Control","no-cache, no-store");
			},
		}));

		app.listen(PORT,() => console.log(`Server started on port: ${ PORT }, client served from: ${ MONIO_DEMO_CLIENT_DIR }`));
	});
});
