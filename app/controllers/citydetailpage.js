import Ember from 'ember';

var AddCityController = Ember.ArrayController.extend({

	useUSUnits: true,

	contentDidChange: function() {
		this.setAllDetailsOfCity();
	}.observes('content'),

	setAllDetailsOfCity: function(){
		var content = this.get('content');
		for(var i = 0; i < content.length; i++){
			this.getCityDetails(content[i]);
		}
	}.observes('useUSUnits'),

	getCityDetails: function(city) {
		var cityLat = city.get('cityLat');
		var cityLng = city.get('cityLng');

		var self = this;
		var string = "";
		if(this.get('useUSUnits')){
			string = "?units=us";
		}
		else {
			string = "?units=si";	
		}

		Ember.$.ajax({
				url: 'https://api.forecast.io/forecast/' + 'b4f66810c090675fdf504bb51714e908' + '/' + cityLat + ',' + cityLng+string,
				jsonp: 'callback',
				dataType: 'jsonp',
			}).then(function(response) {
				self.setCityDetails(city, response);
			});

	},

	formatData: function(city) {
		city.set('cityTemperature', Math.round(city.get('cityTemperature')));
		city.set('cityTime', this.formatTime(this.getLocalTime(city.get('cityTime'), city.get('offset')), true));
	},

	formatTime: function(date, showMinutes) {
    var hours    = date.getHours(),
    meridian = 'AM';
    
    if(hours >= 12) {
      if(hours > 12) {
        hours -= 12;
      }
      meridian = 'PM';
    }
    
    if (hours === 0) {
      hours = 12;
    }
    
    if(showMinutes) {
      var minutes = date.getMinutes();
      if(minutes < 10) {
        minutes = '0'+minutes;
      }
      
      return hours + ':' + minutes + ' ' + meridian;
    }
    return hours + ' ' + meridian;
  },

	getLocalTime: function(time, timezoneOffset) {
    var date  = new Date(time * 1000);
    var utc   = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
    utc.setHours(utc.getHours() + timezoneOffset);
    return utc;
  },

  formatPercentage: function(value) {
    return Math.round(value * 100) + "%";
  },

  formatWind: function(windSpeed, windBearing) {
    
    // // If US units, then convert from km to miles.
    // // var useUSUnits = this.useUSUnits,
    //     // speed    = (useUSUnits ? conditions.windSpeed * 0.621371 : conditions.windSpeed).toFixed(1);
    //    var speed    = (windSpeed * 0.621371).toFixed(1);
    
    // // Also, add the bearing.
    // return speed + ' mph';

    var useUSUnits = this.get('useUSUnits');
    var speed    = (useUSUnits ? windSpeed * 0.621371 : windSpeed).toFixed(1);
    
    // Also, add the bearing.
    return speed + (useUSUnits ? ' mph' : ' kph') + ' ' + this.formatBearing(new Date(windBearing), true);
  },

  formatBearing: function(brng) {
    // From: http://stackoverflow.com/questions/3209899/determine-compass-direction-from-one-lat-lon-to-the-other
    var bearings = ["NE", "E", "SE", "S", "SW", "W", "NW", "N"],
        index    = brng - 22.5;
        
    if (index < 0)
      index += 360;
    index = parseInt(index / 45);

    return(bearings[index]);
  },

  formatVisibilty: function(visibility) {
    
    // If using US units, convert to miles.
    var useUSUnits = this.get('useUSUnits');
    var distance    = (useUSUnits ? visibility * 0.621371 : visibility).toFixed(1);
    
    return distance + ((useUSUnits) ? ' mi' : ' km');
  },

  formatPressureFromHPA: function(pressure) {
    
    // If using US units, convert to inches.
    if(this.get('useUSUnits')) {
      return ((pressure*0.000295299830714*100).toFixed(2)) + " in";
    }
    
    return (pressure).toFixed(2) + ' hPa';
    // return ((pressure*0.000295299830714*100).toFixed(2)) + " in";
  },

  getLocalDate: function(time, timezoneOffset, timeOffsetSinceLastRefresh) {
    timeOffsetSinceLastRefresh = timeOffsetSinceLastRefresh ? timeOffsetSinceLastRefresh : 0;
    var date  = new Date(time * 1000 + timeOffsetSinceLastRefresh);
    var utc   = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
    
    utc.setHours(utc.getHours() + timezoneOffset);
    return utc;
  },

  updateSelectedCityToday: function(city, response) {
    var localDate = this.getLocalDate(city.get('cityTime'), city.get('offset'));
    var diff           = Math.round((localDate.getTime() - new Date().getTime())/(24*3600*1000));
    var relativeDate   = 'Today';
    if(diff < 0) {
      relativeDate = 'Yesterday';
    } else if(diff > 0) {
      relativeDate = 'Tomorrow';
    }
    this.set('relative_day', relativeDate);
		this.set('today_day', this.weekDayForDate(localDate));
		this.set('max_temp', Math.round(response.daily.data[0].temperatureMax));
		this.set('min_temp', Math.round(response.daily.data[0].temperatureMin));
    
  },

  weekDayForDate: function(date) {
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][date.getDay()];
  },

  formatPrecipitation: function(precipitation) {
    if(precipitation == 0) {
      return '--';
    }
    
    // If using US units, convert from mm to inches.
    var useUSUnits = this.useUSUnits,
        amount      = ((useUSUnits) ? (precipitation * 0.0393701).toFixed(2) : precipitation);
    
    return amount + ((useUSUnits) ? ' in' : ' mm');
  },

  updateDailyDataForSelectedCity: function(city, response) {
  	var sevenDayForecast = [];

    if (response.daily) {
      var dailyForecastData = response.daily.data;
      for(var i = 1, iLen=dailyForecastData.length; i < iLen; i++) {
        var dailyForecast     = dailyForecastData[i];
        var dailyForecastDate = this.getLocalDate(dailyForecast.time, response.offset);
        var day = this.weekDayForDate(dailyForecastDate); 
        var icon = '/assets/images/'+dailyForecast.icon + '.png';
        var daily_max = Math.round(dailyForecast.temperatureMax);
        var daily_min = Math.round(dailyForecast.temperatureMin);
        sevenDayForecast.push(Ember.Object.create({day: day, icon: icon, daily_max: daily_max, daily_min: daily_min}));
      }
    }
    this.set('dailyDetails', sevenDayForecast);
  },

	setCityDetails: function(city, response) {
		
		var todays_summary = response.currently.summary;
		var todays_temperature = Math.round(response.currently.temperature);
		var sunrise = this.formatTime(this.getLocalTime(response.daily.data[0].sunriseTime, response.offset), true);
		var sunset = this.formatTime(this.getLocalTime(response.daily.data[0].sunsetTime, response.offset), true);
		var chance_of_rain = this.formatPrecipitation(response.daily.data[0].precipProbability);
		var humidity = this.formatPrecipitation(response.daily.data[0].precipProbability);
		var wind_speed = this.formatWind(response.currently.windSpeed, response.currently.windBearing);
		var feels_like = Math.round(response.currently.apparentTemperature);
		var precip = this.formatPercentage(response.currently.precipProbability);
		var pressure = this.formatPressureFromHPA(response.currently.pressure);
		var visibility = this.formatVisibilty(response.currently.windSpeed);
		// I don't get visibility anywhere in the response so it keeps displaying NaN so I rather just printed the value of windSpeed.

		this.set('todays_summary', todays_summary);
		this.set('todays_temperature', todays_temperature);
		this.set('summary', response.daily.summary);
		this.set('sunrise', sunrise);
		this.set('sunset', sunset);
		this.set('chance_of_rain', chance_of_rain);
		this.set('humidity', humidity);
		this.set('wind_speed', wind_speed);
		this.set('feels_like', feels_like);
		this.set('precip', precip);
		this.set('pressure', pressure);
		this.set('visibility', visibility);

		this.updateSelectedCityToday(city, response);
		this.updateDailyDataForSelectedCity(city, response);

		var array_for_hourly_data = [];
		for(var i=0; i < 24; i++){
			var time = this.formatTime(this.getLocalTime(response.hourly.data[i].time, response.offset), true);
			var icon = '/assets/images/' + response.hourly.data[i].icon + '.png';
			var temp = Math.round(response.hourly.data[i].temperature);
			array_for_hourly_data.push(Ember.Object.create({time: time, icon: icon, temperature: temp}));
		}

		this.set('hourlyDetails', array_for_hourly_data);
	},

	formatTemperature: function(temp) {
    // If using US units, then convert from Celsius.
    // See: http://fahrenheittocelsius.com
    return Math.round(this.useUSUnits ?  (temp * 9/5 + 32) : temp) +"˚";
  },

	actions: {
		toggleToUS: function() {
			if((this.get('useUSUnits'))){
				this.set('useUSUnits', false);
			}
    },

    toggleToSI: function() {
   		if(!(this.get('useUSUnits'))){
				this.set('useUSUnits', true);
			}
    },

    nextCity: function(city){
    	var self = this;
    	this.store.find('citymodel').then(function(cities){
    		for(var i = 0; i < cities.content.length; i++) {
    			var id = cities.content[i].get('id');
    			if (id == city){
    				var next_index = i + 1;
    				var obj_id = cities.objectAt(next_index).get('id');
    				self.transitionToRoute('citydetailpage', obj_id);
    			}
    		}
    	});
    },

    previousCity: function(city){
    	var self = this;
    	this.store.find('citymodel').then(function(cities){
    		for(var i = 0; i < cities.content.length; i++) {
    			var id = cities.content[i].get('id');
    			if (id == city){
    				var previous_index = i - 1;
    				var obj_id = cities.objectAt(previous_index).get('id');
    				self.transitionToRoute('citydetailpage', obj_id);
    			}
    		}
    	});
    }

	}

});

export default AddCityController;