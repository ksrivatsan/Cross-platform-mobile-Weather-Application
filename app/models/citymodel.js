import DS from 'ember-data';

var citymodel = DS.Model.extend({
  cityName: DS.attr('string'),
  cityTemperature: DS.attr('number'),
  cityTime: DS.attr('number'),
  citySummary: DS.attr('string'),
  offset: DS.attr('number'),
  cityLat: DS.attr('string'),
  cityLng: DS.attr('string'),
});

export default citymodel;