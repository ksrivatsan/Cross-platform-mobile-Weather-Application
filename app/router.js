import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
	this.resource('citylist', {path: '/'});
	this.route('addcity');
	this.route('citydetailpage', {path: '/:id'});
});

export default Router;
