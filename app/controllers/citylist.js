import Ember from 'ember';

var IndexController = Ember.ArrayController.extend({

  userIsEditing: false,
  tempIsFar: true,

	contentDidChange: function() {
		this.getCityDetails();
	}.observes('content'),

	getCityDetails: function() {
		var citymodel = this.get('content');
		for(var i = 0; i < citymodel.length; i++) {
			this.formatData(citymodel[i]);
		}
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

  userEditingProp: function(){
    if(this.get('userIsEditing')) {
      this.set('userIsEditing', true);
      return 'Done';
    } else {
      this.set('userIsEditing', false);
    }
    return 'Edit';

  }.property('userEditingProp'),

  label: function() {
    if(this.get('userIsEditing')) {
      return 'Done';
    } else {
      return 'Edit';
    }
  }.property('userIsEditing'),

  getCurrentLocation: function(pos){
    var cityLat = pos.coords.latitude;
    var cityLng = pos.coords.longitude;
    var self = this;

    Ember.$.ajax({
        url: 'https://api.forecast.io/forecast/' + 'b4f66810c090675fdf504bb51714e908' + '/' + cityLat + ',' + cityLng,
        jsonp: 'callback',
        dataType: 'jsonp',
      }).then(function(response) {
        var new_record = self.store.createRecord('citymodel', {
          id: 'Current Location',
          cityName: 'Current Location',
          cityTemperature: response.currently.temperature,
          cityTime: response.currently.time,
          offset: response.offset,
          cityLat: cityLat,
          cityLng: cityLng
        });
        new_record.save();
      });
  },

  actions: {
    userIsEditing: function(){
      if(this.get('userIsEditing')){
        this.set('userIsEditing', false);
      } else {
        this.set('userIsEditing', true);
      }
    },

    delete: function(city){
      this.store.find('citymodel', city.get('id')).then(function(city){
        city.destroyRecord();
      });
    },

    toggleToCelcius: function() {
      if(this.get('tempIsFar')){
        this.store.find('citymodel').then(function(cities){
          for(var i = 0; i < cities.content.length; i++){
            var temp_in_far = cities.content[i].get('cityTemperature');
            var temp_in_cel = Math.round((temp_in_far - 30)/2);
            cities.content[i].set('cityTemperature', temp_in_cel);
          }
        });
        this.set('tempIsFar', false);
      }
    },

    toggleToFarenheit: function() {
      if(!(this.get('tempIsFar'))){
        this.store.find('citymodel').then(function(cities){
          for(var i = 0; i < cities.content.length; i++){
            var temp_in_cel = cities.content[i].get('cityTemperature');
            var temp_in_far = Math.round((temp_in_cel * 2) + 30);
            cities.content[i].set('cityTemperature', temp_in_far);
          }
        });
        this.set('tempIsFar', true);
      }
    }
  }


});

export default IndexController;