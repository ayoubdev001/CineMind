import sequelize from "../config/database.js";
import { User } from "./User.js";
import { UserPreference } from "./UserPreference.js";
import { Genre } from "./Genre.js";
import { Movie } from "./Movie.js";
import { Watchlist } from "./Watchlist.js";
import { Favorite } from "./Favorite.js";

// 1-1
User.hasOne(UserPreference, { foreignKey: "userId", onDelete: "CASCADE" });
UserPreference.belongsTo(User, { foreignKey: "userId" });

// 1-N
for (const Model of [Watchlist, Favorite]) {
  User.hasMany(Model, { foreignKey: "userId", onDelete: "CASCADE" });
  Model.belongsTo(User, { foreignKey: "userId" });
  Movie.hasMany(Model, { foreignKey: "movieId", onDelete: "CASCADE" });
  Model.belongsTo(Movie, { foreignKey: "movieId" });
}


// N-N
Movie.belongsToMany(Genre, {
  through: "movie_genres",
  foreignKey: "movieId",
  otherKey: "genreId",
});
Genre.belongsToMany(Movie, {
  through: "movie_genres",
  foreignKey: "genreId",
  otherKey: "movieId",
});

export {
  sequelize,
  User,
  UserPreference,
  Genre,
  Movie,
  Watchlist,
  Favorite,
};