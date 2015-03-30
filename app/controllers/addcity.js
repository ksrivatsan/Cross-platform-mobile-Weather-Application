import Ember from 'ember';

var AddCityController = Ember.ArrayController.extend({

	cities: '',

	citiesDidChange: function() {
		this.getResultsFromSearch();
	}.observes('cities'),

	getResultsFromSearch: function (){
		var self = this;
		return Ember.$.ajax({
			url: "http://coen268.peterbergstrom.com/locationautocomplete.php?query=" + this.get('cities'),
			dataType: 'jsonp'
		}).then(function(response){
			var cities = [];
			for(var i = 0; i < response.length; i++) {
				cities.push(Ember.Object.create(response[i]));
				
				self.set('content', cities);
			}
			return cities;

		});
	},

	actions: {

		citySelected: function(city_lat, city_lng, city_name){

			var self = this;

			Ember.$.ajax({
				url: 'https://api.forecast.io/forecast/' + 'b4f66810c090675fdf504bb51714e908' + '/' + city_lat + ',' + city_lng,
				jsonp: 'callback',
				dataType: 'jsonp',
			}).then(function(response) {

				var new_record = self.store.createRecord('citymodel', {
					id: city_name,
					cityName: city_name,
					cityTemperature: response.currently.temperature,
					cityTime: response.currently.time,
					citySunrise: response.daily.data[0].sunriseTime,
          citySunset: response.daily.data[0].sunsetTime,
					cityLat: response.latitude,
					cityLng: response.longitude,
					offset: response.offset,
				});

				new_record.save();

			});

			self.transitionToRoute('citylist');	
		},

		cancel: function() {
			this.transitionToRoute('citylist');
		}
	},

});

export default AddCityController;