const jsonServer = require("json-server");
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

module.exports.handler = async (event, context) => {
  const server = jsonServer.create();

  server.use(middlewares);
  server.use(router);

  return new Promise((resolve, reject) => {
    try {
      server.handle(event, context, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
