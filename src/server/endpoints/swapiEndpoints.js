const httpStatusCodes = require("http-status-codes");
const swPeople = require("../../app/db").swPeople;
const swPlanet = require("../../app/db").swPlanet;
const url = "https://swapi.dev/api/";
const applySwapiEndpoints = (server, app) => {
  server.get("/hfswapi/test", async (req, res) => {
    const data = await app.swapiFunctions.genericRequest(
      url,
      "GET",
      null,
      true
    );
    res.send(data);
  });

  server.get("/hfswapi/getPeople/:id", async (req, res) => {
    try {
      let result = {};
      const id = parseInt(req.params.id);
      result = await swPeople.findOne({
        where: {
          id: id,
        },
      });
      if (!result) {
        const getPeople = await app.swapiFunctions.genericRequest(
          `${url}people/${id}`,
          "GET",
          null,
          true
        );
        const getPlanet = await app.swapiFunctions.genericRequest(
          getPeople.homeworld,
          "GET",
          null,
          true
        );
        result = {
          name: getPeople.name,
          mass: getPeople.mass,
          height: getPeople.height,
          homeworld_name: getPlanet.name,
          homeworld_id: getPeople.homeworld.replace(url, "/"),
        };
      }
      res.status(httpStatusCodes.OK).send(result);
    } catch (err) {
      console.log(err);
      res.status(err.code).send({ error: err.message });
    }
  });

  server.get("/hfswapi/getPlanet/:id", async (req, res) => {
    try {
      let result = {};
      const id = parseInt(req.params.id);
      result = await swPlanet.findOne({
        where: {
          id: id,
        },
      });
      if (!result) {
        const getPeople = await app.swapiFunctions.genericRequest(
          `${url}planets/${id}`,
          "GET",
          null,
          true
        );
        result = {
          name: getPeople.name,
          gravity: getPeople.gravity,
        };
      }
      res.status(httpStatusCodes.OK).send(result);
    } catch (err) {
      console.log(err);
      res.status(err.code).send({ error: err.message });
    }
  });

  server.get("/hfswapi/getWeightOnPlanetRandom", async (req, res) => {
    const peoples = await app.swapiFunctions.genericRequest(
      `${url}people`,
      "GET",
      null,
      false
    );
    const planets = await app.swapiFunctions.genericRequest(
      `${url}planets`,
      "GET",
      null,
      false
    );
    const randomPeople = Math.ceil(Math.random() * peoples.count);
    const randomPlanet = Math.ceil(Math.random() * planets.count);
    try {
      let People = await swPeople.findOne({
        where: {
          id: randomPeople,
        },
      });
      if (!People) {
        const getPeople = await app.swapiFunctions.genericRequest(
          `${url}people/${randomPeople}`,
          "GET",
          null,
          true
        );
        const getPlanet = await app.swapiFunctions.genericRequest(
          getPeople.homeworld,
          "GET",
          null,
          true
        );
        People = {
          name: getPeople.name,
          mass: getPeople.mass,
          height: getPeople.height,
          homeworld_name: getPlanet.name,
          homeworld_id: getPeople.homeworld.replace(url, "/"),
        };
      }
      let Planet = await swPlanet.findOne({
        where: {
          id: randomPlanet,
        },
      });
      if (!Planet) {
        const getPlanet = await app.swapiFunctions.genericRequest(
          `${url}planets/${randomPeople}`,
          "GET",
          null,
          true
        );
        Planet = {
          name: getPlanet.name,
          gravity: getPlanet.gravity,
        };
      }

      const peso = parseInt(Planet.gravity) * parseInt(People.mass);
      console.log(parseInt(Planet.gravity));
      console.log(parseInt(People.mass));
      console.log(peso);

      const PlanetId = parseInt(People.homeworld_id.replace(/[^0-9]+/g, ""));
      if(PlanetId !== randomPlanet){
        res.status(httpStatusCodes.OK).send({
          character: People.name,
        });
      } 
      res.sendStatus(httpStatusCodes.NOT_ACCEPTABLE)


    } catch (err) {
      console.log(err);
      res.status(err.code).send({ error: err.message });
    }
  });

  server.get("/hfswapi/getLogs", async (req, res) => {
    const data = await app.db.logging.findAll();
    res.send(data);
  });
};

module.exports = applySwapiEndpoints;
