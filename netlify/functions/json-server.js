const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

module.exports.handler = async (event, context) => {
  server.listen(3000, () => {
    console.log('JSON Server is running');
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'JSON Server is running' }),
  };
};