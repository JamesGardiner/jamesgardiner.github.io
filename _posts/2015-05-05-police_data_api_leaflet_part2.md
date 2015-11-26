---
layout: post
title: Using the data.police.uk API with Leaflet - part 2
permalink: blog/police_data_api_in_leaflet_part2
custom_js: [jquery_2.1.4.min, html_entity_decode, get_html_translation_table]
cdn_js: ["https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.js", "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/leaflet.markercluster.js"]
custom_css: [custom_dropdown]
cdn_css: ["https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.css", "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.css", "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.Default.css"]
---

In this post I put a geocoder on the map, so that users can find street level crimes by postcode or place name.
I also use a clustering method to aggregate the crime data to a single point at higher zoom levels.

-----
<!--more-->

My [previous post](http://jamesgardiner.github.io/blog/police_data_api_in_leaflet_part1/) looked at querying
the data.police.uk API to get police neighbourhood boundaries displayed in a leaflet map. By adding a geocoder,
users can ENTER postcodes, street names or place names to look up crime data, which helps if they aren't sure
what police neighbourhood or police force they live in.

In this post I'm using the [mapbox geocoder](https://www.mapbox.com/mapbox.js/api/v2.1.9/l-mapbox-geocoder/) API,
but others are available such as the [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/)
and the [ArcGIS Geocoding API](https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find.htm). With the free MapBox
geocoding service, any results must be displayed on a MapBox map, so if implementing
elsewhere just be sure to check what map you're actually displaying your results on. If you're paying for enterprise level geocoding you can use the results
anywhere.

To start, add the following js and css files to the head of the html file. These allow access to the MarkerCluster plugin.

```html
	https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/leaflet.markercluster.js
	https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.css
	https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.Default.css
```

Then create a geocoder object using the mapbox.places geocoder index ID and add it to the map.

```javascript
	//create a geocoder
	var geocoderControl = L.mapbox.geocoderControl(
		'mapbox.places', {
		autocomplete: true
	});

	//add it to the map
	geocoderControl.addTo(map);
```

Using the mapbox.places ID allows you to make 1 geocode per request and to cache any results for up
to 30 days.

Next, add an event listener to the geocoderControl which is fired when a user
selects one of the autocomplete options listed in the geocoder.

```javascript
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
```

This returns a GeoJSON object from which the latitude and longitude of the center
can be found using ```(res.feature.center)```. This is then used in a jQuery call to the
police.uk locate-neighbourhood method.

The jQuery.getJSON method allows for a callback function to be put in place. This is used
to check the return contains data, to add a standard leaflet marker to
the map at the correct latitude and longitude, and finally to call the loadBoundary function
from part 1 of this post with the force name and neighbourhood name as parameters.

To make it easier to load neighbourhood boundaries, some of the code in the neighbourhoodChanged
function from part 1 is stripped out and becomes its own function, which is now called from both the
neighbourhoodChanged function and from the callback function in the geocoder event listener.

```javascript
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
```

At the end of this function, a new function called getStreetCrimes is called, which takes the
neighbourhood polygon as a custom area and an optional date parameter in ```YYYY-MM``` format
and uses jQuery.post to ```POST``` the custom area and date data to the police.uk API.
In this instance ```POST``` is used over ```GET``` due to ```GET``` having a URL character limit of 4,094
, which can easily be exceeded when using latitude longitude pairs for a neighbourhood boundary.

A callback function is implemented, so that a successful query fires the addCrimeLayer function, which is again a new function.

```javascript
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
	};

	data = "poly=" + data + "&date=2015-03";

	$.post( url, data, function( crimes ) {
	 addCrimeLayer(crimes);
	});
};
```

The addCrimeLayer works on a Leaflet MarkerClusterGroup, defined
towards the start of the javascript.

```javascript
	//create crime cluster marker
	var crime_markers = new L.MarkerClusterGroup();
```

It first clears any existing layers, then for each object in the ```crimes```
array, defined the objects category and the street name to which the crime was attributed
before creating a new marker for that object, adding this as a layer to the ```crime_markers```
```MarkerClusterGroup``` and binding a popup to it with the street name and crime category.

```javascript
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
```
Whilst not perfect (e.g. force name and neighbourhood name don't update when the geocoder is used)
this is a good example of how easy it is to use Leaflet to display geographic data, even when there
are high densities of points. Also, it's great to see the [police.uk](http://police.uk) site putting all
of this data out there as Open Data under an [Open Government License](http://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/licensing-for-re-use/).

A full screen map is available [here](/maps/police_api_02).
<div id="map" class="map leaflet-container" style="height: 500px; position:relative;"></div>
<script src='/javascript/police_api_tutorial2.js' type="text/javascript"></script>
