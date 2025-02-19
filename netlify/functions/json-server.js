const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Your mock database file
const middlewares = jsonServer.defaults();

// Set up middleware and routing
server.use(middlewares);
server.use(router);

// Start the server
server.listen(3000, () => {
  console.log('JSON Server is running');
});
