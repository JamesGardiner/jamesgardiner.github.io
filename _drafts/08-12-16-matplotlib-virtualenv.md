---
layout: post
title: Matplotlib in Virtualenv
permalink: blog/matplotlib_virtualenv
---

Users of Matplotlib/Virtualenv/macOS have experienced some [well documented](http://matplotlib.org/faq/virtualenv_faq.html#osx) issues in getting the two to play nicely with Apple's Python framework build. Here's a simple workaround that uses Matplotlib's `TkAgg` backend for plotting.

-----
<!--more-->

First up, this post assumes that your using Homebrew to install Python alongside the system's framework build. If not, there's no guarentee this will work.

The fix should be as simple as creating a new `matplotlibrc` file in Matplotlib's default configuration directory and specifying that the TkAgg backend should be used. On macOS the config directory should be `~/.matplotlib`. You can check by doing the following in a Python shell:

``` python
>>> import matplotlib as mpl
>>> mpl.get_configdir()
/Users/username/.matplotlib/
```

In that directory create a new `matplotlibrc` file (if one doesn't already exist) by typing `echo "backend: TkAgg" > ~/.matplotlib/matplotlibrc` in a terminal.

In some instances, that will be enough to get Matplotlib working. If this doesn't fix the issue, try `pip uninstall matplotlib`  then `pip install matplotlib`.
