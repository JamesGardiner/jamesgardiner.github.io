---
layout: post
title: A basic Leaflet.js map in Jekyll
permalink: blog/a-basic-leaflet-map-in-jekyll
custom_css: leaflet
custom_js: leaflet
---

In this post I walk through the steps I took to get a working Leaflet.js map in a Jekyll blog post. 

-----
<!--more-->
I've recently started to develop lightweight and responsive apps using Leaflet as opposed to the more heavyweight and fully featured [OpenLayers](www.http://openlayers.org) library. That isn't to say that OpenLayers isn't a great library; in fact, it's been around quite some time and is incredibly feature rich. Leaflet however, is more than capable of fulfilling the requirements of most web-mapping projects (and it helps that I find Leaflet a lot quicker to develop with). 

According to its homepage [Leaflet.js](http://http://leafletjs.com) is a modern open-source JavaScript library for mobile-friendly interactive maps. It comes in at around 33 KB of JavaScript when built, and it has most of the features most developers will ever need for online mapping.

### Including Leaflet in Jekyll

Before displaying a Leaflet map in our post, we first have to include the leaflet.js and leaflet.css files in the site, and there are two main ways to achieve this. The first is to include the following code in the `<head>` section of the HTML code:

``` html

<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />

<script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>

```

The second is to [download](https://github.com/Leaflet/Leaflet/releases) the Leaflet source code from the Leaflet [GitHub repository](https://github.com/Leaflet/Leaflet). This then needs to be built using Node.js. Run the following commands (assuming you have already [installed Node.js on your machine](http://nodejs.org/)):

	npm install -g jake
	npm install
	
You may need to run these using sudo. Once installed, `cd` into the `/Leaflet` directory that your downloaded files are saved in and run the command 

	jake build

This will create a `dist` folder where you will find a `leaflet-source.js` file, a minified `leaflet.js` file for deployment as well as a `leaflet.css` file. These now need to be accessible to your jekyll build, so `cd` into your `username.github.io` folder that contains your jekyll site and run the following commands:

	mkdir javascript
	mkdir css
	
	cp path/to/leaflist/dist/leaflet.css css/
	cp path/to/leaflet/dist/leaflet.js javascript/
	
To include these in a jekyll blog post, I have used the method outlined by [Matt Gemmell](http://mattgemmell.com/page-specific-assets-with-jekyll/), where the post YAML front matter should include:
	
```yaml

---
custom_css: leaflet
custom_js: leaflet
---

```

and then include the following in the post's `HEAD`:

{% highlight html %}
{% raw %}
  {% if page.custom_js %}
    {% for js_file in page.custom_js %}	
    <script src='/javascript/{{ js_file }}.js' type="text/javascript"></script> 
    {% endfor %}
{% endif %}

{% if page.custom_css %}
    {% for stylesheet in page.custom_css %}
    <link rel="stylesheet" href="/css/{{ stylesheet }}.css" media="screen" type="text/css">
    {% endfor %}
{% endif %}
{% endraw %}
{% endhighlight %}

Then I add a div to the post which will contain the map:

{% highlight html %}
{% raw %}
<div id="map" class="map leaflet-container" style="height: 500px; position:relative;"></div>
{% endraw %}
{% endhighlight %}

followed by this `<script>` tag:
{% highlight html %}
{% raw %}
<script>
// create the map object and set the cooridnates of the initial view:
var map = L.map('map').setView([51.4833, -3.1833], 10);

// create the tile layer with correct attribution:
L.tileLayer('http://{s}.tiles.mapbox.com/v3/jamesg87.goac2bf1/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);
</script>
{% endraw %}
{% endhighlight %}

which initialises the map object, sets the coordinates of the initial view, sets the zoom layer and finally uses `L.tileLayer` to call a tile layer from MapBox and add it to the map.

<div id="map" class="map leaflet-container" style="height: 500px; position:relative;"></div>
<script>
// create the map object and set the cooridnates of the initial view:
var map = L.map('map').setView([51.4833, -3.1833], 10);

// create the tile layer with correct attribution:
L.tileLayer('http://{s}.tiles.mapbox.com/v3/jamesg87.goac2bf1/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);
</script>
 
This is an easy way to get a Leaflet.js map up and running on a GitHub hosted Jekyll blog.  I'm hoping to get more walkthroughs up showing further functionality of Leaflet and other open source GIS software, soon.
