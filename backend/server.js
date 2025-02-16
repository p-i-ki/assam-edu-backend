const sequelize = require("./config/index");
const app = require("./app");

sequelize.sync({ force: true }).then(() => {
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
  });
});

process.on("unhandleReject", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
