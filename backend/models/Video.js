const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');

const Video = sequelize.define('Video', {
    videoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    url: {
        type: DataTypes.JSON,
        allowNull: false,
    },
});

module.exports = Video;
