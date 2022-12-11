class City {
  constructor(name = "", stateCode = "", countryCode = "", timeZone = 0) {
    this.name = name;
    this.stateCode = stateCode;
    this.countryCode = countryCode;
    this.timeZone = timeZone;
  }
}

class Weather {
  constructor(city, temp = 0, description = "", icon = "") {
    this.city = city;
    this.temp = temp;
    this.description = description;
    this.icon = icon;
  }

  getWeather() {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${this.city.name},${this.city.stateCode},${this.city.countryCode}&appid=${key}&lang=${language}&units=metric`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return this.processWeather(data);
      })
      .then((weather) => {
        return this.renderWeather(weather);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  processWeather(data) {
    const city = new City(
      this.city.name,
      this.city.stateCode,
      this.city.countryCode,
      (this.city.timeZone = data.timezone)
    );

    const weather = new Weather(
      city,
      Math.floor(data.main.temp),
      data.weather[0].description,
      data.weather[0].icon
    );

    return weather;
  }

  renderWeather(weather) {
    document.getElementById("description").innerHTML = weather.description;
    document.getElementById("temp").innerHTML = weather.temp + "&deg;C";

    let locationContent = "";
    weather.city.stateCode.length > 0
      ? (locationContent = `${weather.city.name}, ${weather.city.stateCode}, ${
          weather.city.countryCode
        } <img class="flag" src="./flags/${weather.city.countryCode.toLowerCase()}.png">`)
      : (locationContent = `${weather.city.name}, ${
          weather.city.countryCode
        } <img class="flag" src="./flags/${weather.city.countryCode.toLowerCase()}.png">`);
    document.getElementById("location").innerHTML = locationContent;
    document.getElementById("icon").innerHTML =
      '<i class="' + iconList[weather.icon] + '"></i>';
  }
}

class Forecast {
  constructor(city, dateTime, temp, description, icon) {
    this.city = city;
    this.dateTime = dateTime;
    this.temp = Math.floor(temp);
    this.description = description;
    this.icon = icon;
  }

  getForecast() {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${this.city.name},${this.city.stateCode},${this.city.countryCode}&appid=${key}&lang=${language}&units=metric`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return this.processForecast(data);
      })
      .then((forecastList) => {
        return this.renderForecast(forecastList);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  processForecast(data) {
    let forecastList = [];

    data.list.forEach((item) => {
      const forecast = new Forecast(
        new City(
          this.city.name,
          this.city.stateCode,
          this.city.countryCode,
          this.city.timeZone
        ),
        item.dt,
        item.main.temp,
        item.weather[0].description,
        item.weather[0].icon
      );

      forecastList.push(forecast);
    });

    return forecastList;
  }

  renderForecast(forecastList) {
    document.querySelector("#forecast .swiper-wrapper").innerHTML = "";

    let timeZoneOffset = forecastList[0].city.timeZone;

    console.log("timeZoneOffset = " + timeZoneOffset);

    forecastList.forEach((forecast) => {
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");
      forecastItem.classList.add("swiper-slide");

      const forecastDateTime = document.createElement("div");
      forecastDateTime.classList.add("forecast-date-time");

      let dateTime = new Date((forecast.dateTime + timeZoneOffset) * 1000);

      let date = dateTime.getUTCDate().toString().padStart(2, "0");
      let month = dateTime.getUTCMonth() + 1;
      let year = dateTime.getUTCFullYear();
      let hours = dateTime.getUTCHours().toString().padStart(2, "0");
      let minutes = dateTime.getUTCMinutes().toString().padStart(2, "0");

      forecastDateTime.textContent = `${date}-${month}-${year} ${hours}:${minutes}`;

      const forecastIcon = document.createElement("i");
      forecastIcon.classList.add(iconList[forecast.icon]);

      const forecastTemp = document.createElement("div");
      forecastTemp.classList.add("forecast-temperature");
      forecastTemp.textContent = `${forecast.temp}°C`;

      const forecastDescription = document.createElement("div");
      forecastDescription.classList.add("forecast-description");
      forecastDescription.textContent = forecast.description;

      forecastItem.appendChild(forecastDateTime);
      forecastItem.appendChild(forecastIcon);
      forecastItem.appendChild(forecastTemp);
      forecastItem.appendChild(forecastDescription);

      document
        .querySelector("#forecast .swiper-wrapper")
        .appendChild(forecastItem);
    });

    const swiperButtons = document.querySelectorAll(".swiper-button");

    for (const btn of swiperButtons) {
      btn.classList.remove("hidden");
    }

    const swiperScrollBar = document.querySelector(".swiper-scrollbar");

    swiperScrollBar.classList.remove("hidden");

    swiper.update();
    swiper.slideTo(0, 0, false);
  }
}

const key = "2b26a8bf93ca985460732981188bf01c";
const language = navigator.language;
const searchLabel = language == "pl" ? "Szukaj..." : "Search...";

let jsonCitiesStates = [];
let filteredCities = [];
let sortedCities = [];

const iconList = {
  "01d": "wi-day-sunny",
  "02d": "wi-day-cloudy",
  "03d": "wi-cloud",
  "04d": "wi-cloudy",
  "09d": "wi-day-rain-showers",
  "10d": "wi-day-rain",
  "11d": "wi-day-lightning",
  "13d": "wi-day-snow",
  "50d": "wi-day-fog",

  "01n": "wi-night-clear",
  "02n": "wi-night-alt-cloudy",
  "03n": "wi-cloud",
  "04n": "wi-cloudy",
  "09n": "wi-night-showers",
  "10n": "wi-night-alt-rain",
  "11n": "wi-night-alt-lightning",
  "13n": "wi-night-alt-snow",
  "50n": "wi-night-fog",
};

const cityList = document.getElementById("city-list");
const cityName = document.getElementById("city-name");
const cityNameLabel = document.getElementById("city-name-label");
const weatherContainer = document.getElementById("weather");
const forecastContainer = document.getElementById("forecast");

const swiper = new Swiper(".swiper-container", {
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  scrollbar: {
    el: ".swiper-scrollbar",
    draggable: true,
  },
  // Default parameters
  slidesPerGroup: 1,
  slidesPerView: 1,
  spaceBetween: 0,
  // Responsive breakpoints
  breakpoints: {
    320: {
      slidesPerView: 1,
      slidesPerGroup: 1,
    },

    400: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },

    980: {
      slidesPerView: 4,
      slidesPerGroup: 4,
    },
  },
  observer: true,
  observeParents: true,
  on: {
    resize() {
      swiper.scrollbar.setTranslate();
      swiper.scrollbar.updateSize();
    },
  },
});

const fetchCities = () => {
  fetch("./jsonCitiesStates.min.json")
    .then((response) => response.json())
    .then((data) => (jsonCitiesStates = data))
    .catch((error) => console.log(error));
};

const createListItem = (city) => {
  const li = document.createElement("li");
  const span = document.createElement("span");
  const flag = document.createElement("img");

  flag.setAttribute("src", `./flags/${city.countryCode.toLowerCase()}.png`);
  flag.classList.add("flag");

  city.stateCode.length
    ? (span.textContent = `${city.name}, ${city.stateCode}, ${city.countryCode}`)
    : (span.textContent = `${city.name}, ${city.countryCode}`);

  li.appendChild(flag);
  li.appendChild(span);
  cityList.appendChild(li);

  li.addEventListener("click", () => {
    weatherContainer.classList.remove("opacity-1");
    forecastContainer.classList.remove("opacity-1");

    const currentWeather = new Weather(city);
    currentWeather.getWeather();
    weatherContainer.classList.add("opacity-1");

    const forecast = new Forecast(city);
    forecast.getForecast();
    forecastContainer.classList.add("opacity-1");

    clearCityList();
    clearCityName();
    cityNameLabel.classList.add("opacity-1");
  });
};

const handleInput = () => {
  cityNameLabel.classList.remove("opacity-1");

  if (cityName.value.length >= 2) {
    clearCityList();
    filterCities(cityName);
    sortCities(filteredCities);

    for (var i = 0; i < filteredCities.length; i++) {
      if (i == 10) {
        break;
      }
      const city = new City(
        sortedCities[i].name,
        sortedCities[i].state,
        sortedCities[i].country
      );

      createListItem(city);
    }
  } else {
    if (cityName.value.length == 0) {
      cityNameLabel.classList.add("opacity-1");
    }
  }
};

window.onload = () => {
  fetchCities();
  cityNameLabel.textContent = searchLabel;
  cityName.addEventListener("keyup", handleInput);
};

const filterCities = (cityName) => {
  filteredCities = jsonCitiesStates.filter((j) =>
    j.name.toLowerCase().startsWith(cityName.value.toLowerCase())
  );
};

const sortCities = (filteredCities) => {
  sortedCities = filteredCities
    .sort((first, second) =>
      first.country > second.country
        ? 1
        : first.country < second.country
        ? -1
        : 0
    )
    .sort((first, second) =>
      first.state > second.state ? 1 : first.state < second.state ? -1 : 0
    )
    .sort((first, second) =>
      first.name > second.name ? 1 : first.name < second.name ? -1 : 0
    );
};

const clearCityList = () => {
  cityList.innerHTML = "";
};

const clearCityName = () => {
  cityName.value = "";
};
