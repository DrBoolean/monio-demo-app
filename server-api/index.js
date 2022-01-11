const express = require( 'express' );
const parse = require('csv-parse')
const fs = require('fs')
const PORT = process.env.PORT || 3000;
const app = express();

const format = (cols, row) =>
  row.reduce((acc, value, i) => Object.assign(acc, {[cols[i]]: value}), {})

fs.readFile('data.csv', 'utf-8', (err, data) => {
  parse(data, (err, csv) => {
    const columns = csv[0]
    const db = csv.slice(1).map(r => format(columns, r))

    app.get('/platforms', (req, res) =>
      ['Netflix', 'Prime Video', 'Hulu', 'Disney+']
    )

    app.get('/rows/:id', (req, res) =>
      res.json(db[Number(req.params.id)])
    )

    app.get('/platform/:platform', (req, res) =>
      res.json(db.filter(r => Boolean(r[req.params.platform])))
    )

    app.listen( PORT, () => console.info( `Server started on port ${ PORT }` ) );
  })
})
