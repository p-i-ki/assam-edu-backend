const { DataTypes } = require('sequelize');
const sequelize =  require("../config/index");
const User = require("../models/User");
const Course = require('../models/Course.js');

const InstructorProfile = sequelize.define('InstructorProfile', {
    instructorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    profilePicture: {
        type: DataTypes.STRING
    }
});

InstructorProfile.hasMany(Course, { foreignKey: 'instructorId', onDelete:'CASCADE'});
Course.belongsTo(InstructorProfile, { foreignKey:'instructorId', onDelete:'CASCADE'});

module.exports = InstructorProfile;