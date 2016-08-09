---
layout: post
title: Jupyter Progress Bars
permalink: blog/jupyter_progress_bar
---

Jupyter notebooks have a number of built in widgets that can be used to enhance a notebooks functionality and appearance. One of these is the `FloatProgress` widget, which creates an updateable visual progress bar.

-----
<!--more-->

I was recently batch geocoding a large number of address strings inside a Jupyter notebook, and was looking for an easy visual way to track the progress of this operation, which is run as a `pandas.Series.map()` method.

My first thought was [tqdm](https://pypi.python.org/pypi/tqdm), _"A Fast, Extensible Progress Meter"_ for Python, though from what I can see it doesn't offer the ability to work with Panda's Series objects (but it [can be used with `pandas.DataFrame.apply()` methods](https://github.com/tqdm/tqdm/blob/master/examples/pandas_progress_apply.py)) (_edit_ - This has now been implemented. See https://github.com/tqdm/tqdm/issues/214 for details).

Not wanting to print and update a string, a bit of searching threw up [this](https://www.reddit.com/r/Python/comments/34tdr2/a_simple_progress_bar_for_ipython_notebooks/) thread, the final comment of which shows how to implement a progress bar widget in Jupyter. The syntax in this comment is now deprecated but essentially all that is needed is to import the `FloatProgress` class from `ipywidgets` and the `display` method from the `IPython.display` module:

```python
from ipywidgets import FloatProgress
from IPython.display import display
```

Then create a `FloatProgress` object with the relevant min and max values and display it below the selected cell:

```python
f = FloatProgress(min=0, max=100)
display(f)
```

The bar can be updated by setting the f.value variable:

```python
f.value += 1
```

Other keyword arguments for FloatProgress object include `step` which controls the step (obviously!), `description` which sets the bar's name and `bar_style` which sets the color of the bar. More info can be found at the [ipywidgets GitHub page](https://github.com/ipython/ipywidgets).

This is a simple, easy and very quick way to get a progress bar up and running in Jupyter.
