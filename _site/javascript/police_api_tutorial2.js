/// <reference path="../typings/jquery/jquery.d.ts"/>
/* global L */
//The javascript accompanying jamesgardiner.gihub.io/blog/police_data_api_in_leaflet_part2

//initialise global variables
var forcesJSON;
var forces;
var neighbourhoods;
var areaLayer;
var i;

//mapbox access token
L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXNnODciLCJhIjoiZzRUOXJmNCJ9.Z45onlIUlsuxu3nHclV1sQ';

// create the map object and set the cooridnates of the initial view:
var map = L.mapbox.map('map', 'jamesg87.goac2bf1')
		.setView([51.4833, -3.1833], 10);

//create marker feature group
var markers = new L.FeatureGroup();

//create crime cluster marker
var crime_markers = new L.MarkerClusterGroup();

// create the tile layer with correct attribution:
L.tileLayer('http://{s}.tiles.mapbox.com/v3/jamesg87.goac2bf1/{z}/{x}/{y}.png', {
    //attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

//create a geocoder
var geocoderControl = L.mapbox.geocoderControl(
	'mapbox.places', {
	autocomplete: true
});

//add it to the map
geocoderControl.addTo(map);

//add an event listener to the geocoderControl
//that is fired when a user selects a query return
geocoderControl.on('select', function(res) {

	//get the lat lon
  var latlng = (res.feature.center);

	//construct the url to call the neighbourhood boundary
	var url = "https://data.police.uk/api/locate-neighbourhood?"
		+ "q=" + latlng[1] + "," + latlng[0];

	$.getJSON(url, function(data) {
		if ( data ) {
			//add a new marker at the lat lon of postcode centroid
			var marker = L.marker([latlng[1], latlng[0]]);
			markers.addLayer(marker);
			map.addLayer(markers);

			loadBoundary(data.force, data.neighbourhood);
		};
	});
});

//extend the L.Control class to create a custom drop down box populated with a list
//of police forces in England & Wales.
var ForceControl = L.Control.extend({
	initialize: function (name, options) {
    	L.Util.setOptions(this, options);
    },

	//function to be called when the control is added to the map
    onAdd: function (map) {

		// create the control container with a particular class name
        var container = L.DomUtil.create('div', 'dropdown-control');

		//create a list of available police force names and ids
		//using the data.police.uk api Forces method inside the
		//'force' global variable.
		forces = [];
		$.getJSON("https://data.police.uk/api/forces", function(data) {
			var htmlString = '<label>Police force: <select id=forcesList ' +
				'onchange="updateNeighbourhoods()"><option>' +
					'Select a Force</option>';
			$.each(data, function(i, item){
	        	forces[i] = item;
				htmlString = htmlString + '<option>' + forces[i].name + '</option>';
	    	});
			htmlString += '</select>';

			//update the dropdown list innerhtml with the list of forces
			container.innerHTML = htmlString;

			//allow a user to select a single option
    		container.firstChild.onmousedown =
				container.firstChild.ondblclick =
					L.DomEvent.stopPropagation;
		});

		return container;

	}
});

//extend the L.Control class to create a custom drop down box
// initially with simple placeholder text
var NeighbourhoodControl = L.Control.extend({
	initialize: function (name, options, placeholder) {
        L.Util.setOptions(this, options);
	},

	//once added to the map div, carry out the following
	onAdd: function (map) {

		//create the control container with a particular class name
    var container = L.DomUtil.create('div', 'dropdown-control');

		//add the following to the innerHTML
		var htmlString =
			'<label>Neighbourhood:<select id="neighbourhoodsList" ' +
			'onchange="neighbourhoodChanged()"">' +
			'<option>Select a neighbourhood</option></select>';
		container.innerHTML = htmlString;

		//allow a user to select a single option
		container.firstChild.onmousedown =
			container.firstChild.ondblclick =
				L.DomEvent.stopPropagation;

		return container;

	}
});

map.addControl(new ForceControl('forcesList', {position: 'topright'}));
map.addControl(new NeighbourhoodControl('neighbourhoodList', {position: 'topright'}));

/* --- Functions begin here --- */
/* --- 1. updateNeighbourhoods(name) --- */
/* --- 2. neighbourhoodChanged() --- */
/* --- 3.  --- */
/* --- 							--- */


/* --- 1. updateNeighbourhoods(name) --- */
/* --- update the current list of neighbourhoods using the selected force id --- */

var updateNeighbourhoods = function (name) {

	//get the force name
	var force = $("#forcesList").val()

	//empty the neighbourhoods array
	neighbourhoods = [];

	//find the force id for the api call
	for (i in forces) {
  		if (forces[i].name === force) {
			var id = forces[i].id;
		};
	};

	//if the id is matched successfully then get a list of neighbourhoods in
	//that force area.
	if (id) {
		var url = "https://data.police.uk/api/" + id + "/neighbourhoods";
		$.getJSON(url, function(data) {
			var htmlString = '<select id="neighbourhoodsList">';
			$.each(data, function(i, item){
	    		neighbourhoods[i] = item;
				htmlString = htmlString + '<option>' + neighbourhoods[i].name + '</option>';
			});
			htmlString = htmlString + '</select>';

			//change the innerHTML
			$("#neighbourhoodsList").html(htmlString);

			//reorder the options
			$("#neighbourhoodsList").html($("#neighbourhoodsList option").sort(function (a, b) {
    			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
			}));

			//Prepend a placeholder so that onchange is fired when user selects
			$('#neighbourhoodsList').prepend($('<option>Select a neighbourhood</option>'));

		});
	} else {
		$("#neighbourhoodsList").html('<select id="neighbourhoodsList"><option>Select a police force</option></select>');
	};
};

/* --- 2. neighbourhoodChanged() --- */
/* --- function called when the selected neighbourhood is changed --- */

var neighbourhoodChanged = function() {

	//get the selected 'hood name
	var hood = $("#neighbourhoodsList").val();

	//compare the name of the 'hood to get the id
	for (i in neighbourhoods) {
		if (html_entity_decode(neighbourhoods[i].name) === html_entity_decode(hood)) {
			var id = [];
			id[0] = neighbourhoods[i].id;
		};
	};

	//compare the name of the force to get the id
	var force = $("#forcesList").val();
	for (i in forces) {
  		if (forces[i].name === force) {
			id[1] = forces[i].id;
		};
	};

	//if we match both the force and 'hood then carry on, else break
	if ( id[0] && id[1] ) {
		//remove all markers
		map.removeLayer(markers);
		loadBoundary(id[1], id[0]);
	};
};

/* --- 3. loadBoundary(forceID, neighbourhoodID) --- */
/* --- load a neighbourhood boundary using a force id and neighbourhood id --- */

var loadBoundary = function (forceID, neighbourhoodID) {
	var latlng = [];
	var url = "https://data.police.uk/api/" + forceID + "/" + neighbourhoodID + "/boundary";
	$.getJSON(url, function(data) {

		//create an array of boundary lat lon pairs
		$.each(data, function(i, item){
			latlng.push(new L.LatLng(data[i].latitude, data[i].longitude));
		});

		//if a layer is already present, remove it
		if ( areaLayer ) {
			map.removeLayer(areaLayer);
		};

		//create a new polygon object using the latlng array
	   	areaLayer = new L.Polygon(latlng, {
	        clickable: true,
			weight: 3,
			opacity: 0.4,
			fillOpacity: 0.1
	    });

		//redraw the map to the bounds of the new polygon
		map.fitBounds(areaLayer.getBounds());
		//add the polygon to the map
		areaLayer.addTo(map);

		getStreetCrimes(latlng);
	});
};

/* --- 4. getStreetCrimes(polygon, date(optional)) --- */
/* --- request all crimes within a polygon --- */
/* --- default is crimes from last month --- */

var getStreetCrimes = function (polygon, date) {

	var data = '';

	var url = 'https://data.police.uk/api/crimes-street/all-crime';

	$.each(polygon, function(i, item){
		data += polygon[i].lat + ',' + polygon[i].lng + ':';
	});

	if (typeof date !== 'undefined') {
		data += '&date=' + date;
	} else {
		data = data.substring(0, data.length - 1);
		data = "poly=" + data + "&date=2015-03";
	};

	$.post( url, data, function( crimes ) {
	 addCrimeLayer(crimes);
	});
};

/* --- 5. addCrimeLayer(crimes) --- */
/* --- plot a JSON object of crimes --- */

var addCrimeLayer = function (crimes){

	crime_markers.clearLayers();

	for (var i = 0; i < crimes.length; i++) {
        var a = crimes[i];
		var content = "<p>Category:	" + a.category +
			"<br /> Location:	" + a.location.street.name;

        var crime_marker = L.marker(new L.LatLng(a.location.latitude, a.location.longitude), {
            icon: L.mapbox.marker.icon({
				'marker-color': '9C9E99'
			}),
       	});

		crime_markers.addLayer(crime_marker);
        crime_marker.bindPopup(content);

    }

	map.addLayer(crime_markers);

};
