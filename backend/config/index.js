require('dotenv').config({path: 'backend/config/config.env'});
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

sequelize.authenticate()
.then(() => console.log('Connected to database'))
.catch(err => console.error('Error connecting to database:', err));


module.exports = sequelize;