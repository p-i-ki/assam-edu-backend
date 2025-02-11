const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const Section = require('../models/Section');

const Course = sequelize.define("Course", {
    courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categrory: {
        type: DataTypes.STRING(255),
    },
    tags: {
        type: DataTypes.STRING(255)
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    thumbnailUrl: {
        type: DataTypes.STRING(255),
    }
});

Course.hasMany(Section, { as: "sections",foreignKey:'courseId', onDelete:'CASCADE'});
Section.belongsTo(Course, { as:'course',foreignKey: 'courseId', onDelete:'CASCADE'});

module.exports = Course;