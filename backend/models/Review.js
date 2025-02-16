const { DataTypes } = require('sequelize');
const sequelize = require("../config/index");
const Course = require("../models/Course");
const User = require('./User');
const { v4: uuidv4 } = require('uuid');

const Review = sequelize.define("Review", {
    reviewId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `REVIEW-${uuidv4()}`,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
})

User.hasMany(Review, { foreignKey:'userId', onDelete: 'CASCADE'});
Review.belongsTo(User, { foreignKey:'userId', onDelete: 'CASCADE'});

Course.hasMany(Review, { foreignKey: 'courseId', as:'Reviews', onDelete:"CASCADE"});
Review.belongsTo(Course, { foreignKey: 'courseId', onDelete:"CASCADE"});

module.exports = Review;