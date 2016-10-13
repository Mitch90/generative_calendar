var lines = [],
    angle = 0,

    //get date and weather parameters
    today = new Date(),
    monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    apiKey = "7079495971bd26ae",
    cityName = "Milan",
    geoCoords = {
        lon: 9.18951,
        lat: 45.464272
    },
    weather,
    tempRange,
    currentTemp = "no data",
    maxWind = 20,
    lineColor = 0,

    //set planet01's and planet02' parameters
    planet01 = {
        position: 0,
        speed: 5,
        radius: 200,
        dimension: 22,
        colour: [237, 175, 0]
    },
    planet02 = {
        position: 0,
        speed: 8,
        radius: 150,
        dimension: 15,
        colour: [0, 161, 141]
    };

function preload() {
    //determine location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            geoCoords.lon = position.coords.longitude;
            geoCoords.lat = position.coords.latitude;

            //call the weather api with correct location
            var url1 = "http://api.wunderground.com/api/" + apiKey + "/conditions/q/" + geoCoords.lat + "," + geoCoords.lon + ".json";
            weather = loadJSON(url1, loadTemperature, err);
            var url2 = "http://api.wunderground.com/api/" + apiKey + "/forecast/q/" + geoCoords.lat + "," + geoCoords.lon + ".json";
            tempRange = loadJSON(url2, getRange, err);
        }, function() {
            //call the weather api with Milan set as default
            var url1 = "http://api.wunderground.com/api/" + apiKey + "/conditions/q/" + geoCoords.lat + "," + geoCoords.lon + ".json";
            weather = loadJSON(url1, loadTemperature, err);
            var url2 = "http://api.wunderground.com/api/" + apiKey + "/forecast/q/" + geoCoords.lat + "," + geoCoords.lon + ".json";
            tempRange = loadJSON(url2, getRange, err);
        });
    } else {
        console.log("impossible to use geolocation, loading default location");
    }
}

function setup() {
    createCanvas(600, 600);
    frameRate(24);
    angleMode(DEGREES);
    //update planets speed woth current Date
    planet01.speed = month();
    planet02.speed = day();
}

function draw() {
    //update planet01's and planet02' positions
    planet01.position = angle;
    planet02.position = angle;

    background(255);

    noStroke();
    textFont("Georgia");
    textSize(14);
    text(cityName + ", " + today.getDate() + " " + monthList[today.getMonth()] + " " + today.getFullYear(), 20, 30);
    text("Temp: " + currentTemp, 20, 50);
    textSize(12);
    text("Weather data courtesy of The Weather Company, LLC", 20, 595);

    translate(width / 2, height / 2);

    //draw lines between planets
    var newLine = {
        x0: cos(planet01.position * planet01.speed) * planet01.radius,
        y0: sin(planet01.position * planet01.speed) * planet01.radius,
        x1: cos(planet02.position * planet02.speed) * planet02.radius,
        y1: sin(planet02.position * planet02.speed) * planet02.radius

    };

    //stop drawing lines after a while
    if (angle <= 360) {
        lines.push(newLine);
    }

    //draw lines
    stroke(lineColor, 50)
    for (var i = 0; i < lines.length; i++) {
        line(lines[i].x0, lines[i].y0, lines[i].x1, lines[i].y1);
    }

    //draw planets
    stroke(planet01.colour);
    ellipse(cos(planet01.position * planet01.speed) * planet01.radius, sin(planet01.position * planet01.speed) * planet01.radius, planet01.dimension);
    stroke(planet02.colour);
    ellipse(cos(planet02.position * planet02.speed) * planet02.radius, sin(planet02.position * planet02.speed) * planet02.radius, planet02.dimension);

    angle++;
}

function loadTemperature(data) {
    //update text with current location and temperature
    var observation = data.current_observation;
    cityName = observation.display_location.city;
    currentTemp = observation.temp_c + "°C";

    //calculate correct color for temperature
    var hotColor = color(237, 175, 0, 80),
        coldColor = color(0, 161, 141, 80),
        low = -20,
        high = 45,
        lerpAmount = map(observation.temp_c, low, high, 0, 1);
    lineColor = lerpColor(coldColor, hotColor, lerpAmount);

    //update small orbit with current wind
    planet02.radius = round(map(observation.wind_kph, 0, maxWind, 100, 225));
}

function getRange(data) {
    //restart drawing now that everything is loaded
    angle = 0;
    lines = [];

    //update planets sizes with high and low temperature of the day
    var forecast = data.forecast.simpleforecast.forecastday[0];
    maxWind = forecast.maxwind.kph;
    planet01.dimension = forecast.high.celsius * 2;
    planet02.dimension = forecast.low.celsius * 2;

    //update large orbit with max wind of the day
    planet01.radius = round(map(maxWind, 0, maxWind, 100, 225));
}

function err(error) {
    console.log(error);
}
