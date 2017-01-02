---
layout: post
title: Connecting to Postrges with Pandas and Jupyter
permalink: blog/read_sql_pandas
---

One of my main activities at the moment is the collection and storage of web data from a number of sources, which is being stored in an AWS RDS PostgreSQL server. Unfortunately, none of the team I'm working with have used PostgreSQL before, certainly not through an AWS instance and definitely not through a Jupyter notebook and Pandas, though they do have a fair bit of experience using Pandas/R for centralized data analysis using flat file, such as CSVs.

-----
<!--more-->

To show them how to do this, I put together a quick notebook showing how easy it is to do, and thought it would port over well to a short blog post.

### Config Files
First thing to do is setup a config file. This allows you to keep information you don't want to share private, but means you don't have to constantly enter passwords, usernames, host URLs and other such tedious details!

There's a few ways to do this type of thing (including using environment variables), but my preference here is to save a JSON formatted config.json file in the same directory that the notebook server is started in. I use the following format:

``` json
{
  "database": "db_name",
  "schema": "schema_name",
  "user": "user_name",
  "host": "host_url",
  "port": "port_num",
  "passw": "user_password"
}
```

Obviously the values need to be changed to match your own. This can be read by using:

``` python
import json

with open('config.json') as f:
    conf = json.load(f)
```


which returns a python dict object with the keys specified in the JSON document. We can use these to construct a connection string to use with psycopg2:

``` python
conn_str = "host={} dbname={} user={} password={}".format(host, database, user, passw)
```

which is then passed to the psycopg2.connect method as the only parameter:

``` python
conn = psycopg2.connect(conn_str)
```

To read this in to Pandas as a dataframe is simple (swap `table_name` for the relevant table:

``` python
import pandas as pd

df = pd.read_sql('select * from table_name', con=conn)
```

If the table is large, Pandas offers the ability to iterate over the database by specifying the `chunksize` keyword argument, where `chunksize` is the number of rows to include in each chunk. The example below iterates over a table 5000 rows at time, and can squeeze some bigger databases into a dataframe:

```python
df = pd.DataFrame()
for chunk in pd.read_sql('select * from table_name', con=conn, chunksize=5000):
    df = df.append(chunk)
```

Obviously, if the database is too large even when represented in memory, then you will have to try another approach, such as implementing a workflow using specific tools such as [Blaze](http://blaze.pydata.org/pages/overview/).

