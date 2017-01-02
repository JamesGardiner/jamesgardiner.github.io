---
layout: post
title: Django Setup
permalink: blog/django_setup
---

At the moment I'm picking up Django and other Python web frameworks in more detail than I have done in the past. I'm going to write a few blog posts along the way to keep track of my learning. This post is about setting up a simple Django project.

-----
<!--more-->

First, create an isolated environment using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/), create a requirements.txt file in there with Django and cookiecutter as requirements and then install both using pip:

``` yaml
mkproject -p python3.5 mysite
echo "Django==1.9.7" > requirements.txt
echo "cookiecutter==1.4.0" >> requirements.txt
pip install -r requirements.txt
```

If you haven't used [cookiecutter](https://cookiecutter.readthedocs.io/en/latest/) before, go check it out. It makes generating boilerplate code for things like Django incredibly easy (it works with languages other than Python, too!).

Using cookiecutter means we can select from a number of Django templates. Here I'm using [Marco Fucci's cookiecutter-simple-django](https://github.com/marcofucci/cookiecutter-simple-django), which will create a simple Django project. Just run:

``` yaml
cookiecutter  https://github.com/marcofucci/cookiecutter-simple-django.git
```








