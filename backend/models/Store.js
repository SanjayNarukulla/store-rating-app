const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Store = sequelize.define(
  "Store",
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
        len: [3, 100], // Prevents extremely short or long names
      },
    },
    address: {
      type: DataTypes.STRING(255), // Limits size instead of unlimited TEXT
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Foreign key reference
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    indexes: [
      { fields: ["ownerId"] }, // Speeds up queries filtering by owner
      { fields: ["name"] }, // Helps with store search
    ],
  }
);

module.exports = Store;
