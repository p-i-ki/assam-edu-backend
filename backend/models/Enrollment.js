const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const User = require('../models/User');
const Course = require('../models/Course');

const Enrollment = sequelize.define("Enrollment", {
    enrollmentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    status: {
        type: DataTypes.ENUM('in-progress', 'completed', 'dropped'),
        allowNull: false,
        defaultValue: 'in-progress'
    }
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
