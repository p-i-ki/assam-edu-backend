const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const Section = require('../models/Section');
const { v4: uuidv4 } = require('uuid');

const Course = sequelize.define("Course", {
    courseId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `COURSE-${uuidv4()}`,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
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