const { DataTypes } = require('sequelize');
const sequelize =  require("../config/index");
const User = require("../models/User");
const Course = require('../models/Course.js');
const { v4: uuidv4 } = require('uuid');

const InstructorProfile = sequelize.define('InstructorProfile', {
    instructorId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `${uuidv4()}`,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    qualification: {
        type: DataTypes.STRING
    },
    profilePicture: {
        type: DataTypes.STRING
    }
});

InstructorProfile.hasMany(Course, { foreignKey: 'instructorId', onDelete:'CASCADE'});
Course.belongsTo(InstructorProfile, { foreignKey:'instructorId', onDelete:'CASCADE'});

module.exports = InstructorProfile;