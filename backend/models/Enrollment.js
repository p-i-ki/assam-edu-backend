const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const User = require('../models/User');
const Course = require('../models/Course');
const { v4: uuidv4 } = require('uuid');

const Enrollment = sequelize.define("Enrollment", {
    enrollmentId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `${uuidv4()}`,
    },
}, {
    createdAt: "enrollment_date",
    updatedAt: false
});

// Associations
User.belongsToMany(Course, { through: Enrollment, foreignKey: 'userId' });
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId' });

Enrollment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });

module.exports = Enrollment;
