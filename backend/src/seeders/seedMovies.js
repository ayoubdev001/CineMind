import "dotenv/config";
import { sequelize, Genre, Movie } from "../models/index.js";
import { fetchGenres, fetchPopular, posterUrl, fetchNowPlaying } from "../services/tmdbService.js";

const PAGES_PER_TYPE = 1; // ~how many data per list 



//get the new movies in home screen
async function markNowPlaying() {
  const NOW_PLAYING_PAGES = 2; // ~40 titles

  for (let page = 1; page <= NOW_PLAYING_PAGES; page++) {
    const { results } = await fetchNowPlaying(page);

    for (const item of results) {
      await Movie.update(
        { isNowPlaying: true },
        { where: { tmdbId: item.id, mediaType: "movie" } }
      );
    }
  }
}

async function seedGenres(type) {
  const { genres } = await fetchGenres(type);
  const rows = [];
  for (const g of genres) {
    const [genre] = await Genre.findOrCreate({
      where: { tmdbId: g.id },
      defaults: { name: g.name },
    });
    rows.push(genre);
  }
  return rows; // array of Genre model instances, indexed by tmdbId via .find()
}

async function seedTitles(type, genreRows) {
  const mediaType = type === "movie" ? "movie" : "tv_show";
  let count = 0;

  for (let page = 1; page <= PAGES_PER_TYPE; page++) {
    const { results } = await fetchPopular(type, page);

    for (const item of results) {
      const [movie] = await Movie.findOrCreate({
        where: { tmdbId: item.id, mediaType },
        defaults: {
          tmdbId: item.id,
          mediaType,
          title: item.title ?? item.name,
          overview: item.overview,
          posterUrl: posterUrl(item.poster_path),
          releaseDate: (item.release_date || item.first_air_date) || null,
          
        },
      });

      const matchedGenres = genreRows.filter((g) => item.genre_ids?.includes(g.tmdbId));
      await movie.setGenres(matchedGenres);
      count++;
    }
  }

  return count;
}

async function run() {
  console.log("Seeding genres...");
  const movieGenres = await seedGenres("movie");
  const tvGenres = await seedGenres("tv");

  console.log("Seeding movies...");
  const movieCount = await seedTitles("movie", movieGenres);

  console.log("Seeding TV shows...");
  const tvCount = await seedTitles("tv", tvGenres);

    console.log("Marking now-playing titles...");
  await markNowPlaying();

  console.log(`Done. Movies: ${movieCount}, TV shows: ${tvCount}`);
  await sequelize.close();
}

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await sequelize.close();
  process.exit(1);
});

