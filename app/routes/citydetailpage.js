import Ember from 'ember';

var CityDetailPageRoute = Ember.Route.extend({

  model: function(params) {
  	return this.store.find('citymodel', params);
  },

  setupController: function(controller, model) {
    controller.set('content', model.get('content'));
  }

});

export default CityDetailPageRoute;