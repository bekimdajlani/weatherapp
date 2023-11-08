let city = JSON.parse(localStorage.getItem('cities'));
let latitude, longitude, mainUrl;
let firstTime = true;
// function to change city by longitude and latitude
function changeCity(latitude, longitude) {
  firstTime = false;
  latitude = latitude
  longitude = longitude
};
let rainyday = 'url(./weatherAppPictures/rainglass.jpg)';
let nightStars = 'url(./weatherAppPictures/night-sky-stars.jpg)';
let nightSky = 'url(./weatherAppPictures/night-sky.jpg)';
let dayBlueClouds = 'url(./weatherAppPictures/cloud-sky-high.jpg)';
let dayOrangeClouds = 'url(./weatherAppPictures/Clouds-background.jpg)';
// cities array to display
let cities = city.map((element) => { let e = `${element.city}, ${element.state}`; return e });
let cityDisplay = document.querySelector('.cityDisplay');
// function to remove the first 24 hourly temperatures
function RemoveElements() {
  let list = document.querySelector('.hour-list');
  let child = document.querySelector('.flex-container');
  while (child) {
    list.removeChild(child);
    child = list.lastElementChild;
  };
};

let searchedCity = document.querySelector('.location-button');
searchedCity.addEventListener('input', e => {
  cityDisplay.innerHTML = cities.filter(e => {
    return e.toLowerCase().startsWith(searchedCity.value.toLowerCase())
  });

});
searchedCity.addEventListener('input', () => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].city.toLocaleLowerCase() === searchedCity.value.toLocaleLowerCase()) {
      latitude = data[i].lat;
      longitude = data[i].lng;
      document.querySelector('.location').innerHTML = `${data[i].city},</br>${data[i].state}`;
      changeCity(latitude, longitude);
      RemoveElements();
      GetWeather(latitude, longitude);
      return;
    };
  }
});

let button = document.querySelector('.location-button');
let cityNAme = document.querySelector('.citynames');
cityDisplay.style.opacity = '0';
cityNAme.style.opacity = '0';
window.addEventListener('click', e => {
  if (button.contains(e.target)) {
    button.style.width = '75%';
    button.placeholder = '';
    cityDisplay.style.opacity = '1';
    cityNAme.style.opacity = '1';
  } else {
    button.style.width = '65%';
    button.placeholder = 'Change Location';
    button.value = '';
    cityDisplay.style.opacity = '0';
    cityNAme.style.opacity = '0';

  }
});
function AddElement(temperature, temperature_2m, hour, rain, precipitation) {

  const newLI = document.createElement('li');
  newLI.className = 'flex-container';

  const newSpan = document.createElement('span');
  newSpan.className = 'hour';
  newSpan.textContent = (`${hour}`);

  const newSpan1 = document.createElement('span');
  newSpan1.className = 'temperature';
  newSpan1.textContent = (`${temperature}${temperature_2m}`);

  const newSpan2 = document.createElement('span');
  newSpan2.className = 'rain';
  newSpan2.textContent = (`${rain}${precipitation}`);

  newLI.appendChild(newSpan);
  newLI.appendChild(newSpan1);
  newLI.appendChild(newSpan2);

  let currentLi = document.querySelector('.hour-list');
  currentLi.appendChild(newLI);
};

async function GetWeather(latitude, longitude) {
  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          resolve();
        }, reject);
      } else {
        reject(new Error("Geolocation is not supported in this browser."));
      }
    });
  }
  let data;
  try {
    if (firstTime) {
      await getCurrentLocation();
    }
    mainUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,cloudcover,windspeed_10m&daily=sunrise,sunset&timezone=auto`;
    const response = await fetch(mainUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    data = await response.json();


  } catch (error) {
    console.error("Error fetching weather data:", error);
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "You need to allow location services to get weather!Try reload and click yes for location";
    errorContainer.style.display = "block";
  }
  // create an object to extract the data just with the arrrays
  const { hourly } = data;
  const { daily } = data;
  const { hourly_units } = data;
  let temperature = hourly.temperature_2m;
  let wind = hourly.windspeed_10m;
  let rain = hourly.precipitation;
  let cloudy = hourly.cloudcover;
  let time = hourly.time;
  let hour = time.map((element) => { let e = new Date(element).getHours(); return e });
  let timeZone = data.timezone;
  let changeTime = new Date().toLocaleString('en-EU', { timeZone: timeZone })
  let currenTime = new Date(changeTime);
  let indexStart = -1;
  let endIndex;

  time.forEach((element, index) => {
    let e = new Date(element);

    if (
      (currenTime.getDate() == e.getDate())
      &&
      (currenTime.getHours() == e.getHours())
    ) {
      indexStart = index;
      endIndex = indexStart + 24;
      return;
    }

  });

  for (let i = indexStart; i < endIndex; i++) {
    AddElement(temperature[i], hourly_units.temperature_2m, hour[i], rain[i], hourly_units.precipitation);
  }
  // create 2 arrays for sunset and sunrise
  let sunset = [];
  let sunRise = [];
  // take the sunset and sunrise data from api
  let sunDown = daily.sunset;
  let sunUp = daily.sunrise;
  // convert everything in minutes (in need typeof number for comarison)
  sunDown.forEach(element => {
    let e = new Date(element).getHours() * 60 + new Date(element).getMinutes()
    sunset.push(e);
  });
  sunUp.forEach(element => {
    let e = new Date(element).getHours() * 60 + new Date(element).getMinutes();
    sunRise.push(e);
  });
  // get HH:MM in minutes to compare with sunrise and sunset
  let dayTime = currenTime.getHours() * 60 + currenTime.getMinutes();
  // changing the background images according to daylight time
  if ((dayTime > sunset[0]) || (dayTime < sunRise[0])) {
    document.getElementById('bgimg').style.backgroundImage = nightSky;
    document.querySelector('body').style.backgroundImage = nightStars;
    document.querySelector('body').style.backgroundSize = 'cover';
  } else {
    document.querySelector('body').style.backgroundImage = dayBlueClouds;
    document.getElementById('bgimg').style.backgroundImage = dayOrangeClouds;
    document.querySelector('body').style.backgroundSize = 'cover';
  }
  //get hh:mm from sunrise & sunset 
  let morning = daily.sunrise[0].substring(11, 16);
  let evening = daily.sunset[0].substring(11, 16);
  //display daily sunrise and sunset
  document.getElementById('sunset0').innerHTML = (`<h3>Sunrise at ${morning}</h3>Sunset at ${evening}`);

  // create an array to push the iterated arrays
  let days = [];
  // iterating the array to get the seven days
  for (let i = 0; i < time.length; i++) {
    let temp = hourly.temperature_2m.splice(0, 24);
    let wnd = hourly.windspeed_10m.splice(0, 24);
    let prc = hourly.precipitation.splice(0, 24);
    let cloud = hourly.cloudcover.splice(0, 24);
    let dayI = hourly.time.splice(0, 24);
    // each day is separated with 4 paralel arrays
    // create an object with the arrays to extract from loop
    let day = { temp, wnd, prc, dayI, cloud };
    // add the object to the array days
    days.push(day);
  }
  // array for the week days (we get 0-6 numbers from getDay) and one for the months
  const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  //display Day
  document.getElementById('today').innerHTML = week[currenTime.getDay()];
  document.getElementById('day0').innerHTML = week[(currenTime.getDay() + 1) % 7];
  document.getElementById('day1').innerHTML = week[(currenTime.getDay() + 2) % 7];
  document.getElementById('day2').innerHTML = week[(currenTime.getDay() + 3) % 7];
  document.getElementById('day3').innerHTML = week[(currenTime.getDay() + 4) % 7];
  // display Month
  document.getElementById('date-num').innerHTML = `${month[currenTime.getMonth()]}, ${currenTime.getDate()}`;

  let todayHours = [];
  let today = days[0].dayI;
  today.forEach(element => {
    let e = `${new Date(element).getHours()}`
    todayHours.push(e)
  });
  // use for loop and if stament for finding the data correspoding to the hour
  for (let i = 0; i < todayHours.length; i++) {
    if (currenTime.getHours() == todayHours[i]) {
      document.getElementById('today-temp').innerHTML = (`${days[0].temp[i]} ${hourly_units.temperature_2m}`)
      document.getElementById('prc-value').innerHTML = (`${days[0].prc[i]} ${hourly_units.precipitation}`)
      document.getElementById('wnd-value').innerHTML = (`${days[0].wnd[i]} ${hourly_units.windspeed_10m}`)
      document.getElementById('clouds').innerHTML = (`${days[0].cloud[i]} ${hourly_units.cloudcover}`)
      document.getElementById('day0-temp').innerHTML = (`${days[1].temp[i]} ${hourly_units.temperature_2m}`)
      document.getElementById('day1-temp').innerHTML = (`${days[2].temp[i]} ${hourly_units.temperature_2m}`)
      document.getElementById('day2-temp').innerHTML = (`${days[3].temp[i]} ${hourly_units.temperature_2m}`)
      document.getElementById('day3-temp').innerHTML = (`${days[4].temp[i]} ${hourly_units.temperature_2m}`)
      document.getElementById('day1Prc').innerHTML = (`${days[1].prc[i]} ${hourly_units.precipitation}`)
      document.getElementById('day2Prc').innerHTML = (`${days[2].prc[i]} ${hourly_units.precipitation}`)
      document.getElementById('day3Prc').innerHTML = (`${days[3].prc[i]} ${hourly_units.precipitation}`)
      document.getElementById('day4Prc').innerHTML = (`${days[4].prc[i]} ${hourly_units.precipitation}`)
      if (days[0].prc[i] > 0) {
        document.getElementById('bgimg').style.backgroundImage = rainyday;
      }
      break;
    }
  }
}
GetWeather(latitude, longitude);
const slider = document.querySelector('.hour-list');
const grabber = document.querySelector('span');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => {
  isDown = false;

});
slider.addEventListener('mouseup', () => {
  isDown = false;

});
slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 3; //scroll-fast
  slider.scrollLeft = scrollLeft - walk;
});
slider.addEventListener('click', function () {

  slider.style.cursor = ('grabbing');
  grabber.style.cursor = ('grabbing');
  slider.scrollLeft += 1;

});