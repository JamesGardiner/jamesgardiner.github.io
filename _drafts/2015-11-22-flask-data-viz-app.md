---
layout: post
title: A simple data viz app using Flask and D3 - Part 1
permalink: blog/flask_app_pt1
---

In this post I'll cover the set-up of a simple [Flask](http://flask.pocoo.org/) data visualisation project using D3.js backed by a postgresql database. The instructions are aimed at OS X users, but Windows and Linux users should get a good idea of what is required in each step.

-----
<!--more-->

The data we'll be looking at is [*Budgeted revenue expenditure by authority and service*](https://statswales.wales.gov.uk/Catalogue/Local-Government/Finance/Revenue/Budgets/budgetedrevenueexpenditure-by-authority-service) which shows the revenue expenditure of Welsh local authorities, police authorities, fire authorities and national park authorities on services such as education and social care.

[Flask](http://flask.pocoo.org/) is a microframework for Python that has been around since 2010. It's easier to setup and develop basic web-apps with than the more fully featured Django framework, and is especially ideal for rapid prototyping of ideas.

[PostgreSQL](http://www.postgresql.org/about/) is a powerful, mature and open-source object-relational database system that has been in active development for over 15 years. And luckily for us, it plays really well with Python via the [Pyscopg](http://initd.org/psycopg/) package. For me, nothing comes close to Postgres in terms of storing and querying lasrge geospatial data sets via the [PostGIS](http://postgis.net/) database extension, which is core to my day-to-day.

I'll also be throwing some client side JavaScript into the mix, mainly [Mike Bostock's](http://bost.ocks.org/mike/) amazing Data-Driven-Documents JS library, or [D3.js](http://d3js.org/), for visualising our data in the browser.

## Setup PostgreSQL
There's a fair few ways to install PostgreSQL to OS X; personally, I follow [Ivan Storck's](http://ivanstorck.com/) method for OS X [here](https://www.codefellows.org/blog/three-battle-tested-ways-to-install-postgresql). Come back once PostgreSQL is up and running.

All set? Great, lets create a new database and a user role to access the database. In a terminal type the following:

{% highlight bash %}
createdb flask_app
createuser flask_user
{% endhighlight %}

This creates the database we wil connect to, and the role we will use to connect to it.

### Setup Flask

First off, `cd` into the directory that you'll be setting the project up in. I keep all my local Python dev inside a `~/Virtualenv` folder. Setup a new folder here and name it whatever you like; I'll call mine FlaskApp:

{% highlight bash %}
mkdir FlaskApp
{% endhighlight %}

Then use [virtualenv](https://virtualenv.readthedocs.org/en/latest/) or the really useful [virtualenvwrapper](https://virtualenvwrapper.readthedocs.org/en/latest/) to setup a virtual environment in which we will develop our application. If you need to, go install these tools and learn about their use, as they will save a lot of headaches further down the line.

Now, using virtualenvwrapper, issue the following command to create a new virtual environment, assosciate a directory with it and activate it once its setup:

{% highlight bash %}
cd FlaskApp
mkvirtualenvwrapper -a . FlaskApp
{% endhighlight %}

Your command prompt should now have `(FlaskApp)` at the start, signifying that the virtual environment is active, so lets install Flask and other dependencies:


{% highlight bash %}
pip install Flask
pip install Flask-Script
{% endhighlight %}

To check that everything is working, we can create a simple Flask app and run it via the built in Flask development server.  Note that this server is  for development purposes only, and shouldn't be used in a production environment. See the [Flask development server pages](http://flask.pocoo.org/docs/0.10/server/) for more info.

First, make the following directories in your working directory:
{% highlight bash %}
mkdir project/templates
{% endhighlight %}

Then add an HTML file called `index.html` in the `templates` directory.

Create a file called `hello.py` in your project folder which contains the following code. The app.run() method is called when the module is run as the main program:

{% highlight python %}
from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()
{% endhighlight %}

 Run `python hello.py` at the command line to invoke the Flask development server. Navigate over to `http://127.0.0.1:5000` and, if everything is setup correctly, you'll see a simple web page with 'Hello world!' at the top.

 Note that a Command Line Interface (CLI) comes bundled as part of Flask 1.0, and you can use it to run Flask apps as follows:

{% highlight bash %}
flask -a hello run
{% endhighlight %}

## Get the data!
So before we go any further, lets get the data and make it useable. First download the data file in csv format from [here](https://statswales.wales.gov.uk/Catalogue/Local-Government/Finance/Revenue/Budgets/budgetedrevenueexpenditure-by-authority-service), and then install a few more module dependencies:

{% highlight python %}
pip install sqlalchemy
pip install psycopg2
{% endhighlight %}

I've used the pandas library to shape the data to fit our needs using the following code. Notice the sqlalchemy import at the top, which we will use to get the data into our Postgres instance:

{% highlight python %}
import pandas as pd
from sqlalchemy import create engine

# Read the csv into a pandas dataframe
df = pd.read_csv('/path/to/export.csv')

# Drop unused columns
df = df.drop(['Unnamed: 0'], axis=1)

# Merge the first two columns where there are NaNs
df['Unnamed: 2'].fillna(df['Unnamed: 1'], inplace=True)

# Then delete the first column
del df['Unnamed: 1']

# And rename the first entry to 'Wales'
df.loc[0, 'Unnamed: 2'] = 'Wales'

# Rename columns
df.rename(columns = {'Unnamed: 2': 'Area', '.': 'Total'}, inplace = True)

{% endhighlight %}
