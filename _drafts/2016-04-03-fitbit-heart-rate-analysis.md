---
layout: post
title: Fitbit Data Analysis
permalink: blog/fitbit-data-analysis
---

For Christmas I was lucky enough to get a [Fitbit Charge HR](https://www.fitbit.com/uk/chargehr) from my wife. The fact that I'd previously asked for one to 'do data analysis on' slightly mystified and amused her, but she still went ahead and suprised me with it!

I've been hoping to use it as a way to personalise an analysis of data, to see how the results feel when they relate to me (and especially my health), rather than some data that are abstract from me as an indivdual. If at the same time I can view my own health through new tools, then it's a bonus.

-----
<!--more-->

In terms of sensors, the Charge HR is well equipped: it has an optical heart rate monitor, a 3-axis accelerometer and an altimeter. These produce high resolution heart rate (hr) data, length of time asleep (and quality of sleep), floors climbed and an estimate of the number of minutes the wearer is 'active' for a day. This is all pretty comprehensive, but for this post I'm focussing on my hr data, and in particular what Fitbit calls *intraday* data, which are heart rate data at up to 1 second resolution.

## Accessing the Data
There are two ways to get access to intraday data. Either pay $49.99 a year on a [Fitbit Premium subscription](https://www.fitbit.com/premium/export) which allows export of the data in CSV format, or gather the data using [Fitbit's API](https://dev.fitbit.com/docs/heart-rate/). Obviously I'm not going to pay to get data when I can do the same for free, but I think there are some questions to be asked about requiring paid access to your own personally generated data if you lack the technical skills to gather them through an API.