import Ember from 'ember';

var AddCityRoute = Ember.Route.extend({
	
	setupController: function(controller, model){
		controller.set('content', model);
	},

});

export default AddCityRoute;