const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100], // Ensures a reasonable name length
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Ensures valid email format
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase()); // Stores lowercase emails
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100], // Ensures strong passwords
      },
    },
    role: {
      type: DataTypes.ENUM("Admin", "User", "Owner"),
      allowNull: false,
      defaultValue: "User",
    },
  },
  {
    indexes: [
      { unique: true, fields: ["email"] }, // Fast lookup by email
      { fields: ["role"] }, // Optimized filtering by role
    ],
  }
);

module.exports = User;
