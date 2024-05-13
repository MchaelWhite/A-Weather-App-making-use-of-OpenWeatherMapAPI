// Get the geo-coordinates of the entered city because it is required to get the weather details
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "7d2c17d647fcc6d35cdfd7783162a49b";
// API_KEY is required to get the geo-coordinates of the entered city

const getDayOfWeek = (dt_txt) => {
  const date = new Date(dt_txt);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) { // HTML for the main weather card
    const dayOfWeek = getDayOfWeek(weatherItem.dt_txt);
    return `<div class="details">
                <h2>${cityName}, ${dayOfWeek}</h2>
                <><h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4><h4>Wind: ${weatherItem.wind.speed} M/S</h4><h4>Humidity: ${weatherItem.main.humidity} %</h4></>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt=""/>
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
  } else { // HTML for the other five day forecast card
    const dayOfWeek = getDayOfWeek(weatherItem.dt_txt);
    return `<li class="card">
                    <h3>${dayOfWeek}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`; // Get a 7-day forecast for particular coordinates using OpenWeatherMap API.
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // filters forecast to only get one forecast per day
      const uniqueForecastDays = [];
      const sevenDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      console.log(sevenDaysForecast);
      sevenDaysForecast.forEach((weatherItem, index) => {
        if (index < 7) {
          if (index === 0) {
            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
          } else {
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)); // adding weather cards to the page
          }
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();  // get user entered city name and remove extra spaces 
  if (!cityName) return; // return if city name is empty

  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
   .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { lat, lon } = position.coords;
      // Getting the city name of the user's coordinates using OpenWeatherMap reverse geocoding API
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`; 

      // Get city name from coordinates using reverse geocoding API
      fetch(REVERSE_GEOCODING_URL)
       .then((res) => res.json())
       .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, lat, lon);
        })
       .catch(() => {
          alert("An error occurred while fetching the coordinates!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.")
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates()); // if pressed key is enter then call the getCityCoordinates function