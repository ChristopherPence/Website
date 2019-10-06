//Christopher Pence
var position = [null, null];
var clock = $('#clock');
var greeting = $('#greeting');
var day = $('#day');
var sunset = null;
var weatherCheck = 0;
var skycons = new Skycons({"color": "black"});

$(document).ready(function(){
	//Initialize the skycons
	skycons.add("current-icon", "clear_day");
	skycons.add("f-1-icon", "rain");
	skycons.add("f-2-icon", "snow");
	skycons.add("f-3-icon", "clear_day");
	skycons.add("f-4-icon", "wind");
	skycons.add("f-5-icon", "clear_day");
	skycons.play();
	//update the clock and get weather data
	updatePage();
	getLocation();
	//check for updates to the page
	var timer = setInterval(updatePage,1000);
});

/*
	Every second : update the clock
	Every 30 minutes : update...
						- greeting
						- day info
						- weather
*/
function updatePage(){
	var time = new Date();

	//update clock
	var output = '';
	clock.html('It is ' + timeIs(time));

	//Update day
	output = 'Today is ';
	output += todayIs(time);
	output += ', ';
	if(time.getMonth() == 0) output += 'January';
	else if(time.getMonth() == 1) output += 'February';
	else if(time.getMonth() == 2) output += 'March';
	else if(time.getMonth() == 3) output += 'April';
	else if(time.getMonth() == 4) output += 'May';
	else if(time.getMonth() == 5) output += 'June';
	else if(time.getMonth() == 6) output += 'July';
	else if(time.getMonth() == 7) output += 'August';
	else if(time.getMonth() == 8) output += 'September';
	else if(time.getMonth() == 9) output += 'October';
	else if(time.getMonth() == 10) output += 'November';
	else if(time.getMonth() == 11) output += 'December';
	output += ' ' + time.getDate();
	output += ', ' + time.getFullYear();
	day.html(output);

	//update greeting
	if(weatherCheck == 1){
		output = '';
		if(time.getHours() > 0 && time.getHours() < 12) output += 'Good Morning!';
		else if(sunset == null) output += "Good Afternoon!";
		else if(sunset != null && time.getHours() >= 12 && time < sunset) output += 'Good Afternoon!';
		else if(sunset != null && time >= sunset && time.getHours() < 22) output += 'Good Evening!';
		else if(time.getHours() >= 22 && time.getHours() < 24) output += 'Good Night!';
		else output += "Welcome!";
		greeting.html(output);
	}
	else{
		greeting.html("Welcome!");
	}

	//Only run this every 30 minutes
	if(time.getMinutes() % 30 == 0 && time.getSeconds() == 1){
		getWeather();
	}	
}

/*
	Make the darkskyapi call to get the weather
*/
function getWeather(location){
	//This is where the ajax call to the weather app would normally be
	// loadWeather() would be called to load the page with info
}
/*
	Take in entire weather json
	Output all html elements with proper weather information
*/
function loadWeather(weather){
	overlayClose();
	weatherCheck = 1;
	var output = "";
	var i = 0;
	//List the normal current weather data
	sunset = new Date(weather.daily.data[0].sunsetTime*1000);//save sunset time
	skycons.set("current-icon", weather.currently.icon);//set the current skycon
	document.getElementById("current-summary").innerHTML = weather.hourly.summary; //Set the weather summary
	document.getElementById("current-condition").innerHTML = weather.currently.summary; //set the weather currently
	document.getElementById("current-temperature").innerHTML = "The current temperature is "
		+ parseInt(weather.currently.temperature)
		+ "&#176;F. Today there will be a high of "
		+ parseInt(weather.daily.data[0].temperatureHigh)
		+ "&#176;F and a low of "
		+ parseInt(weather.daily.data[0].temperatureLow)
		+ "&#176;F.";
	//List the weather alerts for the area if there are any
	if(weather.alerts && weather.alerts.length > 0){
		$("#alert-box").empty();
		output = "";
		output2 = "";
		output += "There are "+ weather.alerts.length +" warnings for your area: ";
		for(i = 0; i < weather.alerts.length; i++){
			output += weather.alerts[i].title;
			if(i != weather.alerts.length - 1) output += ", ";
			$("#alert-box").append("<h3>" + weather.alerts[i].title + "</h3>");
			$("#alert-box").append("<p>" + weather.alerts[i].description + "</p>");
		}
		document.getElementById("alert").innerHTML = output;
		$("#alert-banner").show();
	}
	else{
		$("#alert-banner").hide();
	}

	//load the 5 day forecast including the current day
	for(i = 1; i < 6; i++){
		var idToChange = 'f-' + i + '-';
		skycons.set(idToChange + 'icon', weather.daily.data[i].icon); //set the icon
		//set the day
		var tmp = new Date(parseInt(weather.daily.data[i].time)*1000);
		document.getElementById(idToChange + 'date').innerHTML = todayIs(tmp);
		//Preciptation type and percentage
		if(weather.daily.data[i].precipIntensity == 0){//there is no precipitation
			document.getElementById(idToChange + 'precipType').innerHTML = "No Precipitation!";
		}
		else{//There will be preciptation
			var str = weather.daily.data[i].precipType;
			document.getElementById(idToChange + 'precipType').innerHTML = str.charAt(0).toUpperCase() 
				+ str.slice(1) + ": " + parseInt((parseFloat(weather.daily.data[i].precipProbability)*100)) + "%";
		}
		//Temperatures
		document.getElementById(idToChange + 'tempHigh').innerHTML = "High: " + parseInt(weather.daily.data[i].temperatureHigh) + "&#176;F";
		document.getElementById(idToChange + 'tempLow').innerHTML = "Low: " + parseInt(weather.daily.data[i].temperatureLow) + "&#176;F";
	}

	//Update the user on the last time the weather was updated
	var time = new Date();
	document.getElementById("lastUpdate").innerHTML = "Last Updated: " + timeIs(time);
}

/*
	Ask the user to share their geolocation
	success : call save position
	fail : call getLocationViaIP
*/
function getLocation(){
	if('geolocation' in navigator){
		navigator.geolocation.getCurrentPosition(savePosition, getLocationViaIP);
	}else{
		//broswer doesnt support geolocation in html 5
		getLocationViaIP();
	}
}

/*
	Save the position of the device for later use
	Call the getWeather function
*/
function savePosition(pos){
	position[0] = pos.coords.latitude;
	position[1] = pos.coords.longitude;
	getWeather(position);
}

/*
	Backup method for getting location if user blocks geoloc
*/
function getLocationViaIP(){
	//Get the users ip address
	// $.ajax('https://jsonip.com').then(
	// function success(response){
	// 	$.ajax('http://ip-api.com/json/' + response.ip).then(
	// 	function success(response){
	// 		position[0] = response.lat;
	// 		position[1] = response.lon;
	// 		getWeather(position);
	// 	},
	// 	function fail(data, status){
	// 		alert("We were unable to get your location so weather data will not be available for you until you enable GeoLocation in your browser.")
	// 		document.getElementById("lastUpdate").innerHTML = "Turn on GeoLocations to get weather!";
	// 	});
	// }, 
	// function fail(data, status){
	// 	alert("We were unable to get your location so weather data will not be available for you until you enable GeoLocation in your browser.");
	// 	document.getElementById("lastUpdate").innerHTML = "Turn on GeoLocations to get weather!";
	// });
}
	
/*
	Function to return what day it is in plain english
	Input: JS Date Object
	Output: Plain english day text Sunday-Sunday
*/
function todayIs(time){
	var output = '';
	if(time.getDay() == 0) output += 'Sunday';
	else if(time.getDay() == 1) output += 'Monday';
	else if(time.getDay() == 2) output += 'Tuesday';
	else if(time.getDay() == 3) output += 'Wednesday';
	else if(time.getDay() == 4) output += 'Thursday';
	else if(time.getDay() == 5) output += 'Friday';
	else if(time.getDay() == 6) output += 'Saturday';
	return output;
}	

/*
	Function to return time in normal format
	Input: JS Date Object
	Output: Normal format i.e. 2:34 pm
*/
function timeIs(time){
	var output = '';
	if(time.getHours() % 12 == 0) output += '12' + ':';
	else output += (time.getHours() % 12) + ':';
	if(time.getMinutes() < 10) output += '0' + time.getMinutes();
	else output += time.getMinutes();
	if(time.getHours() > 11) output += ' pm';
	else output += ' am';
	return output;
}

/*
	Weather alerts overlay functionality
*/
function overlayOpen(){ //Open the overlay
	var tmp = document.getElementsByClassName("container-fluid half");
	tmp[0].style.filter = 'blur(5px)';
	tmp[1].style.filter = 'blur(5px)';
	$("#alert-banner").hide(); 
	$("#alert-box").fadeIn();
	$("#overlayClose").fadeIn();
	skycons.pause();
	
}
function overlayClose(){ //Close the overlay
	var tmp = document.getElementsByClassName("container-fluid half");
	tmp[0].style.filter = 'blur(0px)';
	tmp[1].style.filter = 'blur(0px)'; 
	$("#alert-banner").show();
	$("#alert-box").fadeOut();
	$("#overlayClose").fadeOut();
	skycons.play();
}
$("#overlayClose").click(function(){overlayClose();});

/**/
function devShowBar(){
	$("#alert-banner").show();
}
function devHideBar(){
	$("#alert-banner").hide();
}