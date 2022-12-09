const express = require("express");
var cors = require("cors");
const ingestor = require("./lib/ingestion");
const db = require("./lib/db");
const stats = require("./lib/stats");
const { AsyncParser } = require('@json2csv/node');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/ingest", (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    res.status(401).send({
      success: false,
      error: "expecting JSON array [] of entries {}",
    });
    return;
  }
  for (entry of data) {
    try {
      ingestor.validate(entry);
    } catch (error) {
      res.status(401).send({
        success: false,
        error: error,
        entry,
      });
      return;
    }
  }
  for (entry of data) {
    try {
      ingestor.ingest(entry);
    } catch (error) {
      res.status(401).send({
        success: false,
        error: error,
        entry,
      });
      return;
    }
  }

  res.json({
    success: true,
    entries: data.length,
  });
});
app.post("/reset", (req, res) => {
  try {
    db.reset();
    res.json({
        success: true
      });
  } catch (error) {
    res.status(401).send({
      success: false,
      error: error,
    });
  }
});
app.post("/clear-pos", (req, res) => {
  const pos = req.query.pos || null;
  if(pos){
    try {
      db.clearPos(pos);
      res.json({
          success: true
        });
    } catch (error) {
      res.status(401).send({
        success: false,
        error: error,
      });
    }
  } else {
    res.status(401).send({
      success: false,
      error: 'no pos specified',
    });
  }
});
app.get("/pull", (req, res) => {
  const q = req.query.dt || null;
  try {
    const newRecord = stats.getLatestNormalizedValues(q);
    res.json({
      success: true,
      newRecord,
    });
  } catch (error) {
    res.status(401).send({
      success: false,
      error: error,
    });
  }
});
app.get("/pull-abs", (req, res) => {
  const q = req.query.dt || null;
  try {
    const newRecord = stats.getLatestAbsValues(q);
    res.json({
      success: true,
      newRecord,
    });
  } catch (error) {
    res.status(401).send({
      success: false,
      error: error,
    });
  }
});
app.get("/latest", (req, res) => {
    const q = req.query.q ?? 100;
    try {
        const records = db.getLatestRecords(q);
        res.json({
          success: true,
          records,
        });

        //console.log(records);
      } catch (error) {
        res.status(401).send({
          success: false,
          error: error,
        });
      }
})
app.get("/csv-entries", async (req, res) => {
  try {
      const records = db.getAllData();
     
      // const opts = {};
      // const transformOpts = {};
      // const asyncOpts = {};
      const parser = new AsyncParser();

      const csv = await parser.parse(records).promise();
      res.send(csv);

    } catch (error) {
      res.status(401).send({
        success: false,
        error: error,
      });
    }
})
app.get("/csv-avg", async (req, res) => {
  try {
      const records = db.getAverages();
     
      // const opts = {};
      // const transformOpts = {};
      // const asyncOpts = {};
      const parser = new AsyncParser();

      const csv = await parser.parse(records).promise();
      res.send(csv);

    } catch (error) {
      res.status(401).send({
        success: false,
        error: error,
      });
    }
})
// app.all('/', (req, res) => {
//     console.log("Just got sa request!")
//     res.send('Yoss!')
// })
app.listen(process.env.PORT || 3000);
