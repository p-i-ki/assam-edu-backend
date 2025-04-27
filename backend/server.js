const sequelize = require("./config/index");
const app = require("./app");

// this will connect to our DB specified in config/index.js
// after successful connection start the server.
sequelize.sync().then(() => {
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
  });
});

// on nodejs event "unhandleReject" log and close the server
// TODO: add await sequelize.close() to close the connection to DB gracefully.
process.on("unhandleReject", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
