const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/index.js');
const InstructorProfile = require("../models/InstructorProfile.js");

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () =>`${uuidv4()}`,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("student", "instructor", "admin"),
        allowNull: false,
        defaultValue: 'student'
    },
    otp: {
        type: DataTypes.STRING,
    },
    otpExpiration: {
        type: DataTypes.DATE,
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
    },
    resetPasswordExpires : {
        type: DataTypes.DATE,
    }
});

User.beforeSave(async(user, options) => {
    if( user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

User.prototype.getJWTToken = function() {
    const token = jwt.sign({id: this.userId, email: this.email}, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE
    });
    return token;
}

User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

User.prototype.getResetPasswordToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    return token;
}

User.prototype.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    this.otp = otp;
    this.otpExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes
    return otp;
}

User.hasOne(InstructorProfile, { foreignKey: 'userId', onDelete:'CASCADE'});
InstructorProfile.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE'});

module.exports = User;
