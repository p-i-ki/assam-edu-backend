const { DataTypes} = require('sequelize');
const sequelize = require("../config/index");
const Video = require("../models/Video");

const Section = sequelize.define("Section", {
    sectionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sectionName: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Section.hasMany(Video, {as:"videos",foreignKey: 'sectionId', onDelete:'CASCADE'});
Video.belongsTo(Section, { as:"section",foreignKey: 'sectionId', onDelete:'CASCADE'});

module.exports = Section;