const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const { v4: uuidv4 } = require('uuid');

const Video = sequelize.define('Video', {
    videoId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `VIDEO-${uuidv4()}`,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    url: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    captionUrl: { 
        type: DataTypes.STRING,
        allowNull: true, 
    },
});

module.exports = Video;
