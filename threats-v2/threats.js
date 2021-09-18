const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const request = require("request");
const MongoClient = require("mongodb").MongoClient;
const port = process.argv.slice(2)[0];
const app = express();
app.use(bodyParser.json());
const heroesService = "http://localhost:9090/hero-service";

// Connection--------
const dbUrl =
  "mongodb+srv://micro:microdb@micro-service-cluster.t3gt6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbClient = new MongoClient(dbUrl, { useNewUrlParser: true });
dbClient.connect((err) => {
  if (err) throw err;
});

//Routes--------
app.get("/threats", (req, res) => {
  console.log("Returns threats list.");
  dbClient
    .db("myFirstDatabase")
    .collection("threats")
    .find({})
    .project({ _id: 0 })
    .toArray((err, objects) => {
      res.send(objects);
    });
});
app.post("/assignment", (req, res) => {
  console.log("Assigning hero.");
  const threatsCollection = dbClient
    .db("myFirstDatabase")
    .collection("threats");

  console.log({ threatsCollection });
  if (!threatsCollection) {
    console.log(`Threats collection not found.`);
    res.status(400).send("Connection to database cannot be established.");
    return;
  }

  request.post(
    {
      headers: { "content-type": "application/json" },
      url: `${heroesService}/hero/${req.body.heroId}`,
      body: `{
           "busy": true
       }`,
    },
    (err, heroResponse, body) => {
      console.log(heroResponse.statusCode);
      if (!err && heroResponse.statusCode === 202) {
        const threatId = parseInt(req.body.threatId);
        threatsCollection
          .find({})
          .project({ _id: 0 })
          .toArray((err, threats) => {
            const threat = threats.find((subject) => subject.id === threatId);
            if (threat) {
              console.log("Updating threat.");
              threat.assignedHero = req.body.heroId;
              threatsCollection.updateOne(
                { id: threat.id },
                { $set: { assignedHero: threat.assignedHero } }
              );
              res.status(202).send(threat);
            } else {
              console.error({ err });
              console.log("Threat not found.");
              res.status(404).send("Threat not found.");
            }
          });
      } else {
        if (err)
          res
            .status(400)
            .send({ problem: `Hero Service responded with issue ${err}.` });
        if (heroResponse.statusCode != 202)
          res.status(heroResponse.statusCode).send(heroResponse.body);
      }
    }
  );
});
app.use("/img", express.static(path.join(__dirname, "img")));
require("../eureka-helper/").registerWithEureka("threat-service", port);
console.log(`Threats service listening on port ${port}.`);
app.listen(port);
