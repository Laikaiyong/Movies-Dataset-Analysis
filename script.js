var fs = require("fs");

// File to JSON array objects
const data = JSON.parse(fs.readFileSync("./collection.json"));

// Preview data
console.table(data.splice(0, 5), ["plot", "genre", "title", "year"]);
console.log(data.length);

//// Original program - Imperative

// Number of wins and nominations for events according to film type and language (leaderboard)
function leaderboardTotal(type, language) {
  try {
    let awardsArray = [];

    // Filter for type and language
    for (let i = 0; i < data.length; i++) {
      if ("type" in data[i] && "languages" in data[i] && "awards" in data[i]) {
        if (data[i].type === type && data[i].languages.includes(language)) {
          let totalAwards = data[i].awards.wins + data[i].awards.nominations;
          awardsArray.push({
            title: data[i].title,
            wins: data[i].awards.wins,
            nominations: data[i].awards.nominations,
            total: totalAwards,
          });
        }
      }
    }

    // Sorting
    for (let i = 0; i < awardsArray.length; i++) {
      for (let j = i + 1; j < awardsArray.length; j++) {
        if (awardsArray[j].total > awardsArray[i].total) {
          let temp = awardsArray[i];
          awardsArray[i] = awardsArray[j];
          awardsArray[j] = temp;
        }
      }
    }

    return awardsArray;
  } catch (error) {
    console.warn(error);
  }
}
const leaderboardResult = leaderboardTotal("movie", "English");
console.table(leaderboardResult.splice(0, 10));

// Popularity category According to runtime
// <= 20 Unpopular
// > 20 && <= 100 Normal
// > 100 Very Popular
function popularityCategorize() {
  const popularityDataset = [];
  const processData = [...data];
  for (let i = 0; i < processData.length; i++) {
    if ("runtime" in processData[i]) {
      if (processData[i]["runtime"] <= 20) {
        processData[i]["popularity"] = "Unpopular";
      } else if (
        processData[i]["runtime"] > 20 &&
        processData[i]["runtime"] <= 100
      ) {
        processData[i]["popularity"] = "Normal";
      } else if (processData[i]["runtime"] > 100) {
        processData[i]["popularity"] = "Very Popular";
      } else {
        processData[i]["popularity"] = "Undefined";
      }
    } else {
      processData[i]["popularity"] = "Undefined";
    }
    popularityDataset.push(processData[i]);
  }

  return popularityDataset;
}
const popularityTunedData = popularityCategorize();
console.table(popularityTunedData.splice(0, 5), [
  "title",
  "runtime",
  "popularity",
]);

// Sum of movie rating in IMDB and Tomatoes
function sumMovieRating() {
  let ratingSums = [];
  let i = 0;

  while (i < data.length) {
    if ("imdb" in data[i] || "tomatoes" in data[i]) {
      let imdbRating = data[i].imdb ? data[i].imdb.rating : 0;
      let tomatoesRating =
        data[i].tomatoes && data[i].tomatoes.viewer
          ? data[i].tomatoes.viewer.rating
          : 0;
      let tomatoesRating1 =
        data[i].tomatoes && data[i].tomatoes.critic
          ? data[i].tomatoes.critic.rating
          : 0;

      let sum = (imdbRating + tomatoesRating + tomatoesRating1) / 3;
      ratingSums.push({
        title: data[i].title,
        ratingSum: sum,
      });
      i++;
    }
  }
  return ratingSums;
}
const movieRating = sumMovieRating();
console.table(movieRating.splice(0, 5));

// Filter movies according to country
function filterMoviesByCountry(country) {
  var filteredMovies = [];
  for (var i = 0; i < data.length; i++) {
    if ("countries" in data[i])
      if (data[i].countries.includes(country)) {
        filteredMovies.push(data[i]);
      }
  }
  return filteredMovies;
}
const filteredMoviesByCountry = filterMoviesByCountry("Brazil");
console.table(filteredMoviesByCountry.splice(0, 5), [
  "title",
  "countries",
  "year",
]);

// Movies from the oldest to the latest
function sortMoviesByYear() {
  const processData = [...data];
  for (var i = 0; i < processData.length; i++) {
    for (var j = 0; j < processData.length - i - 1; j++) {
      if (processData[j].year > processData[j + 1].year) {
        var tempMovie = processData[j];
        processData[j] = processData[j + 1];
        processData[j + 1] = tempMovie;
      }
    }
  }
  return processData;
}
const sortedYearMovies = sortMoviesByYear();
console.table(sortedYearMovies.splice(0, 5), ["title", "year"]);

// Getting specific movie with keyword (First one only or all)
function getMoviesByKeyword(keyword, getAll) {
  var matchedMovies = [];
  for (var i = 0; i < data.length; i++) {
    var plotMatched = false;
    if ("plot" in data[i]) {
      if (data[i].plot.toLowerCase().includes(keyword.toLowerCase())) {
        if (getAll === 0) {
          return [data[i]];
        } else {
          matchedMovies.push(data[i]);
          plotMatched = true;
        }
      }
    }
    if (
      data[i].title.toLowerCase().includes(keyword.toLowerCase()) &&
      plotMatched
    ) {
      if (getAll === 0) {
        return [data[i]];
      } else {
        matchedMovies.push(data[i]);
      }
    }
  }
  return matchedMovies;
}

const matchedMovies = getMoviesByKeyword("Halloween", 1);
console.table(matchedMovies.splice(0, 5), ["title", "plot"]);

const matchedMovies1 = getMoviesByKeyword("Halloween", 0);
console.table(matchedMovies1, ["title", "plot"]);

// Sum of movies according to country
function countMoviesByCountry(countries) {
  var countryCounts = {};
  for (var i = 0; i < data.length; i++) {
    if ("countries" in data[i]) {
      for (var j = 0; j < data[i].countries.length; j++) {
        var country = data[i].countries[j];
        switch (country) {
          case countries[0]:
          case countries[1]:
          case countries[2]:
            if (countryCounts[country]) {
              countryCounts[country]++;
            } else {
              countryCounts[country] = 1;
            }
            break;
          default:
            break;
        }
      }
    }
  }
  return countryCounts;
}

const countryCounts = countMoviesByCountry(["USA", "UK", "India"]);
console.table(countryCounts);

//// Improvised - Functional programming

// Number of wins and nominaions for events according to film type and language (leaderboard)
const filteringLeaderboard = (item) =>
  item.type === "movie" &&
  Array.isArray(item.languages) &&
  item.languages.includes("English") &&
  "awards" in item;
const leaderboardResultNew = [...data]
  .filter(filteringLeaderboard)
  .map((item) => {
    return {
      title: item.title,
      wins: item.awards.wins,
      nominations: item.awards.nominations,
      total: item.awards.wins + item.awards.nominations,
    };
  })
  .sort((a, b) => b.total - a.total);
console.table(leaderboardResultNew.splice(0, 10));

// Popularity category According to runtime
// <= 20 Unpopular
// > 20 && <= 100 Normal
// > 100 Very Popular
const popularityTunedDataNew = [...data].map((item) => {
  if ("runtime" in item) {
    if (item.runtime <= 20) {
      return { ...item, popularity: "Unpopular" };
    } else if (item.runtime > 20 && item.runtime <= 100) {
      return { ...item, popularity: "Normal" };
    } else if (item.runtime > 100) {
      return { ...item, popularity: "Very Popular" };
    } else {
      return { ...item, popularity: "Undefined" };
    }
  } else {
    return { ...item, popularity: "Undefined" };
  }
});
console.table(popularityTunedDataNew.splice(0, 5), [
  "title",
  "runtime",
  "popularity",
]);

// Sum of movies rating in IMDB and Tomatoes
const movieRatingNew = data
  .filter((item) => "imdb" in item || "tomatoes" in item)
  .map((item) => {
    return {
      title: item.title,
      ratingSum:
        (item.imdb
          ? item.imdb.rating
          : 0 + item.tomatoes && item.tomatoes.viewer
          ? item.tomatoes.viewer.rating
          : 0 + item.tomatoes && item.tomatoes.critic
          ? item.tomatoes.critic.rating
          : 0) / 3,
    };
  });
console.table(movieRatingNew.splice(0, 5));

// Type 2 Recursion method
function calculateRatingSums(movies, index = 0, ratingSums = []) {
  if (index === movies.length - 20000) {
    return ratingSums;
  }

  ratingSums.push({
    title: movies[index].title,
    ratingSum:
      (movies[index].imdb
        ? movies[index].imdb.rating
        : 0 + movies[index].tomatoes && movies[index].tomatoes.viewer
        ? movies[index].tomatoes.viewer.rating
        : 0 + movies[index].tomatoes && movies[index].tomatoes.critic
        ? movies[index].tomatoes.critic.rating
        : 0) / 3,
  });

  return calculateRatingSums(movies, index + 1, ratingSums);
}

let ratingSums = calculateRatingSums(data);
console.table(ratingSums.splice(0, 5));

// Filter movies according to country
const filteredMoviesByCountryNew = [...data].filter(
  (movie) =>
    Array.isArray(movie.countries) && movie.countries.includes("Brazil")
);
console.table(filteredMoviesByCountryNew.splice(0, 5), [
  "title",
  "countries",
  "year",
]);

// Movies from the oldest to the latest
const sortedYearMoviesNew = [...data].sort((a, b) => a.year - b.year);
console.table(sortedYearMoviesNew.splice(0, 5), ["title", "year"]);

// Getting specific movie with keyword (First one only or all)
const getMoviesByKeywordNew = (movies) => (keyword) => (getAll) => {
  return getAll === 0
    ? movies.find(
        (movie) =>
          movie.title.toLowerCase().includes(keyword.toLowerCase()) ||
          ("plot" in movie &&
            movie.plot.toLowerCase().includes(keyword.toLowerCase()))
      )
    : movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(keyword.toLowerCase()) ||
          ("plot" in movie &&
            movie.plot.toLowerCase().includes(keyword.toLowerCase()))
      );
};
const matchedMoviesNew = getMoviesByKeywordNew(data)("Halloween")(1);
console.table(matchedMoviesNew.splice(0, 5), ["title", "plot"]);

const matchedMoviesNew1 = getMoviesByKeywordNew(data)("Halloween")(0);
console.log(matchedMoviesNew1);

// Sum of movies according to country
const countMoviesByCountryNew = (movies, countries) => {
  return movies
    .filter((movie) => Array.isArray(movie.countries))
    .reduce((countryCounts, movie) => {
      movie.countries.forEach((country) => {
        if (countries.includes(country)) {
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
      });
      return countryCounts;
    }, {});
};
const countryCountsNew = countMoviesByCountryNew(data, ["USA", "UK", "India"]);
console.table(countryCountsNew);

// Comparison
console.time("imperative-timer");
const matchedMoviesTest = getMoviesByKeyword("Halloween", 1);
console.table(matchedMoviesTest.splice(0, 5), ["title", "plot"]);
console.timeEnd("imperative-timer");

console.time("functional-timer");
const matchedMoviesNewTest = getMoviesByKeywordNew(data)("Halloween")(1);
console.table(matchedMoviesNewTest.splice(0, 5), ["title", "plot"]);
console.timeEnd("functional-timer");
