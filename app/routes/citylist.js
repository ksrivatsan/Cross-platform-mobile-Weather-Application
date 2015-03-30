import Ember from 'ember';

var IndexRoute = Ember.Route.extend({

  model: function() {
    return this.store.find('citymodel');
  },

  setupController: function(controller, model) {
    controller.set('content', model.get('content'));
  },

  init: function() {
    this._super();
    var self = this;
    return new Ember.RSVP.Promise(function() {
      navigator.geolocation.getCurrentPosition(function(pos){
        self.controller.getCurrentLocation(pos);
      });
    });
  }

});

export default IndexRoute;