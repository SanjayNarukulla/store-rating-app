const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" }, // Foreign Key
      onDelete: "CASCADE",
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Stores", key: "id" }, // Foreign Key
      onDelete: "CASCADE",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    indexes: [
      { fields: ["storeId"] }, // Index for faster lookup
      { fields: ["userId"] },
    ],
  }
);

module.exports = Rating;
