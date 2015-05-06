---
layout: post
title: Using the data.police.uk API with Leaflet
permalink: blog/police_data_api_in_leaflet_part1
custom_js: [leaflet, jquery_2.1.4.min, geojson.min, html_entity_decode, get_html_translation_table]
custom_css: [leaflet, custom_dropdown]
---

Following on from my previous [post](http://jamesgardiner.github.io/blog/a-basic-leaflet-map-in-jekyll/) on setting up a Leaflet 
map in a Jekyll blog, I thought it would be useful to show off some of Leaflet's functionality using real world data.

The first part of this post is a walkthrough covering the steps taken to get a 'Neighbourhoods' boundary visible on a Leaflet map, via a few dropdowns and the [data.police.uk](data.police.uk) site.

-----
<!--more-->
The site makes police recorded crime data available through its API (If you're unfamiliar with APIs then check out
[this](http://benjyw.com/post/26966201626/apis-explained) post by Benjy Weinberger), which powers quite a few web and mobile apps 
(such as the [UK Crime statistics](http://www.crime-statistics.co.uk/postcode) site). It's a standard JSON web service, 
using HTTP GET and POST requests, and is relatively well documented [here](data.police.uk/docs). 

There are three high level methods in the data.police.uk API docs, broken down into *Force related*, *Crime related* and
*Neighbourhood related*. As there are more than a few neighbourhoods in England & Wales, I'm going to make users choose a Police Force first,
and then a neighbourhood within that force.

To get a list of forces, we can use ```https://data.police.uk/api/forces``` which returns a JSON object.

To select a specific force, we can add a dropdown to our map by 
extending the Leaflet [Control class](http://leafletjs.com/reference.html#control) with the 
following code:

```javascript
	var ForceControl = L.Control.extend({
		initialize: function (name, options) {
	    	L.Util.setOptions(this, options);
	    },
		
		//function to be called when the control is added to the map
	    onAdd: function (map) {
			
			//create the control container with a 
			//class name
	        var container = L.DomUtil.create('div', 'force-control');
			
			//create a list of available police force names and ids
			//using the data.police.uk api Forces method inside the 
			//'force' global variable.
			forces = [];
			
			//jquery method to retrieve JSON object
			$.getJSON("https://data.police.uk/api/forces", 
				function(data) {
					
					//create the htmlString that will form the
					//innerHTML of the forces dropdown
					var htmlString = '<select id=forcesList ' +
						'onchange="updateNeighbourhoods()"><option>' + 
						'Select a Force</option>';
					
					//create individual force <option> tags within the
					//<select> tag
					$.each(data, function(i, item){
			        	forces[i] = item;
						htmlString = htmlString + '<option>' + 
							forces[i].name + '</option>';
			    	});
					
					//close the select tag
					htmlString += '</select>';
					
					//update the dropdown list innerHTML 
					//with the list of forces
					container.innerHTML = htmlString;
					
					//allow a user to select a single option
		    		container.firstChild.onmousedown = 
						container.firstChild.ondblclick = 
							L.DomEvent.stopPropagation;
							
				});
			
			return container;
			
		}
	});
```
		
To update the list of neighbourhoods in the selected force we name a function in the innerHTML, 
```updateNeighbourhoods()``` that listens for an ```onChange``` event. This means that whenever a new
force is selected, the function is called. Before we cover that though, lets add a new dropdown to the map,
with a standard placeholder text instead of a neighbourhood name:

```javascript
	//extend the L.Control class to create a custom drop down box
	// initially with simple placeholder text
	var NeighbourhoodControl = L.Control.extend({
		initialize: function (name, options, placeholder) {
	        L.Util.setOptions(this, options);
		},
		
		//once added to the map div, carry out the following
		onAdd: function (map) {
			
			//create the control container with a particular
			//class name
	        var container = L.DomUtil.create(
				'div', 'neighbourhoods_control'
			);
			
			//add the following to the innerHTML
			var htmlString = '<select id="neighbourhoodsList"' +
				'onchange="neighbourhoodChanged()">' + 
				'<option>Select a police force</option></select>';
			
			//make this the div's innerHTML
			container.innerHTML = htmlString;
			
			//allow a user to select a single option
			container.firstChild.onmousedown = 
				container.firstChild.ondblclick = 
					L.DomEvent.stopPropagation;
			
			return container;
			
		}
	});
```

Both these controls can then be added:

```javascript
	map.addControl(new ForceControl('forcesList',
		{position: 'topright'}
	));
		
	map.addControl(new NeighbourhoodControl('neighbourhoodList',
		{position: 'topright'}
	));
```
 
 To update the innerHTML of this div dynamically, we can use the ```updateNeighbourhoods()```
 function that we call whenever a new police force is selected:
 
 ```javascript
 	//update the current list of neighbourhoods using the selected 
 	//force id
	var updateNeighbourhoods = function (name) {
	
	//get the force name
	var force = $("#forcesList").val()
	
	//empty the neighbourhoods array
	neighbourhoods = [];
	
	//find the force id for the api call
	for (var i in forces) {
  		if (forces[i].name === force) {
			var id = forces[i].id;
		};
	};
	
	//if the id is matched successfully then get a list of 
	//neighbourhoods in that force area.
	if (id) {
		
		//url to retrieve a list of neighbourhoods
		var url = "https://data.police.uk/api/" + 
			id + "/neighbourhoods";
		
		//jquery function to get the JSON object
		$.getJSON(url, function(data) {
			
			//create the html string to be used as the div's 
			//inner HTML
			var htmlString = '<select id="neighbourhoodsList">' + 
				'<option>Select a police force</option>';
			
			//loop through the JSON object
			$.each(data, function(i, item){
				
				//add each to an array
	    		neighbourhoods[i] = item;
				
				//create an <option> tag for each element in
				//the JSON object
				htmlString = htmlString + '<option>' + 
					neighbourhoods[i].name + 
						'</option>';
			});
			
			//add a closing </select> tag
			htmlString = htmlString + '</select>';
			
			//use the div id to update the innerHTML
			$("#neighbourhoodsList").html(htmlString);
			
			//reorder the options
			$("#neighbourhoodsList").
				html($("#neighbourhoodsList option").
					sort(function (a, b) {
    					return a.text == b.text ? 0 : 
							a.text < b.text ? -1 : 1
			}));
			
			//Prepend a placeholder so that onchange 
			//is fired when user selects a neighbourhood
			$('#neighbourhoodsList').
				prepend($('<option>Select a neighbourhood</option>'));	
		});
		
	} else {
		
		//retain the original placeholder text, or reset it
		$("#neighbourhoodsList").html('<select id=' +
			'"neighbourhoodsList"><option>Select a ' +
				'neighbourhood</option></select>');
		
		};
	};
```

The final thing to add is a function that is called when a neighbourhood is selected.
This queries the API for the selected neighbourhood boundary (which is returned as standard JSON rather than
GeoJSON), gets the bounding box of the boundary, automatically recenters and zooms to the specified position
then adds the layer.

```javascript
	//function called when the selected neighbourhood is changed
	var neighbourhoodChanged = function() {
	
		//get the selected 'hood name
		var hood = $("#neighbourhoodsList").val();
		
		//compare the name of the 'hood to get the id
		for (i in neighbourhoods) {
			if (neighbourhoods[i].name === hood) {
				var id = [];
				id[0] = neighbourhoods[i].id;
			};
		};
			
		//compare the name of the force to get the id
		var force = $("#forcesList").val();
		for (var i in forces) {
	  		if (forces[i].name === force) {
				id[1] = forces[i].id;
			};
		};
		
		//if we match both the force and 'hood then
		//carry on, else break
		if ( id[0] && id[1] ) {
			var latlng = [];
			var url = "https://data.police.uk/api/" + id[1] + "/" 
				+ id[0] + "/boundary";
			
			//jquery to get the JSON
			$.getJSON(url, function(data) {
				
				//create an array of boundary lat lon pairs
				$.each(data, function(i, item){
					latlng.push(new L.LatLng(data[i].latitude,
						data[i].longitude));
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
					
			});
		};
	};
```

Here is the final map, with the two drop down selections available, [here](http://jamesgardiner.github.io/maps/police_api_01) is a full screen example:

<div id="map" class="map leaflet-container" style="height: 500px; position:relative;"></div>
<script src='/javascript/police_api_tutorial1.js' type="text/javascript"></script>

That's a pretty long post, but I hope it gives you an idea of how we can tap into the police API, which we've only really scratched the surface of.
I'll follow this post up shortly, where I'll add a geocoder to the map div that takes postcodes and placenames and focuses the map on the relevant area.