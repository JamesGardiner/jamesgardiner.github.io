---
layout: post
title: Fitbit Data Analysis
permalink: blog/fitbit-data-analysis
---

For Christmas I was lucky enough to get a [Fitbit Charge HR](https://www.fitbit.com/uk/chargehr) from my wife. The fact that I'd previously asked for one to 'do data analysis on' slightly mystified and amused her, but she still went ahead and suprised me with it!

I've been hoping to use it as a way to personalise an analysis of data, to see how the results feel when they relate to me (and especially my health), rather than some data that are abstract from me as an indivdual. If at the same time I can view my own health through new tools, then it's a bonus.

-----
<!--more-->

### Charge HR

In terms of sensors, the Charge HR is well equipped: it has an optical heart rate monitor, a 3-axis accelerometer and an altimeter. These produce high resolution heart rate (hr) data, length of time asleep (and quality of sleep), floors climbed and an estimate of the number of minutes the wearer is 'active' for a day. This is all pretty comprehensive, but for this post I'm focussing on my hr data, and in particular what Fitbit calls *intraday* data, which are heart rate data at up to 1 second resolution.

### Accessing the Data
There are two ways to get access to intraday data. Either pay $49.99 a year on a [Fitbit Premium subscription](https://www.fitbit.com/premium/export) which allows export of the data in CSV format, or gather the data using [Fitbit's API](https://dev.fitbit.com/docs/heart-rate/). Obviously I'm not going to pay to get data when I can do the same for free, but I think there are some questions to be asked about requiring paid access to your own personally generated data if you lack the technical skills to gather them through an API.

In any case, to get the data I used the following methodology.

1. Sign up for the Fitbit API and register a 'personal' type app. The important aspects here are ensuring the *Browser* app type is selected and the callback url is set to http://127.0.0.1:8080/.
2. Install [python-fitbit](https://github.com/orcasgit/python-fitbit) to whatever Python environment you work in. At the time of writing, I needed to install from master on github rather than PyPi due to issues with OAUTH2 authentication. This may be released by the time you read this.
3. Run the `gather_keys_oauth2.py` script available in the repo, passing it the client id and client secret for your app (which are available on the manage my apps page of the Fitbit site). Save the access token and refresh tokens in a file. I used a simple JSON file called tokens.json with the format:

        {
          "ACCESS_TOKEN": "YOURACCESSTOKEN",
          "CLIENT_SECRET": "YOURCLIENTSECRET",
          "REFRESH_TOKEN": "YOURREFRESHTOKEN",
          "CLIENT_ID": "YOURCLIENTID"
        }

4. 