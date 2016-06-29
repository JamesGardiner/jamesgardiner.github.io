---
layout: post
title: Setting up Python on Ubuntu
permalink: blog/ubuntu_python_setup
---

A few colleagues asked me to run them through my AWS/Python setup, as we are making the transition to a cloud based computing environment for our data analytics team. I've turned my thoughts into this blog post. That way, I have a copy and hopefully it will help others with their setup too.

-----
<!--more-->

This post assumes that you have an Amazon EC2 instance running Ubuntu Linux, and are setup to access the machine via SSH in a terminal. If not, head [here](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html). Done? Great, read on!

First up, open a terminal and type:

```bash
$ ssh -i ~/path/to/.pem ubuntu@public_dns_of_instance
```

The public DNS can be found on your EC2 console, under 'Public DNS'.

Once you're connected, you'll need to set up a number of tools that will help with day to day development. Luckily for us, there are tons of Ubuntu setup scripts out there that simplify the process.

I'm currently using [Cătălin Mariș'](https://github.com/alrra) dotfiles repo to do this. In the terminal, run the following:

```bash
$ bash -c "$(wget -qO - https://raw.github.com/alrra/dotfiles/master/src/os/setup.sh)"
```

That command will download the bash script and run it, setting up an initial environment in Ubuntu. It will ask you a number of questions during the setup all of which are relatively straightforward.

To understand what this does, look at [https://github.com/alrra/dotfiles/blob/master/src/os/setup.sh](https://github.com/alrra/dotfiles/blob/master/src/os/setup.sh).

Once the script has run and you've restarted  the machine, we can get on with installing Python 3 alongside the system Python, along with dependencies needed for devleopment.

Go ahead and run this:

```bash
$ sudo apt-get install build-essential python-dev libsqlite3-dev libreadline6-dev libgdbm-dev zlib1g-dev libbz2-dev sqlite3 zip
```

and once the dependencies have been installed, run:

```bash
$ sudo add-apt-repository ppa:fkrull/deadsnakes
$ sudo apt-get update
$ sudo apt-get install python3.5
```

This will install Python 3.5 on the system alongside the system's Python 2. Now get pip installed for both versions of the language:

```bash
$ sudo apt-get install python-pip
```

```bash
$ sudo apt-get install python3-pip
```

This will get you far enough to start using Python however, if you don't want your packages being installed system wide it's a good idea to use [virtualenv](https://virtualenv.pypa.io/en/stable/) and [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/).

Virtualenv allows you to create isolated Python development environments. The beauty of this is that multiple projects can depend on different Python versions, or different package versions, without worrying about a system wide upgrade breaking them.

Virtualenvwrapper is an extension to virtualenv, gifting you with easy to use commands for the creation and management of virtual environments.

To start, install Virtualenv (you may need to run this with sudo):

```bash
$ pip install virtualenv
```

then create a directory where your virtualenvs will be stored:

```bash
$ mkdir ~/.venvs
```

Now install virtualenvwrapper:

```bash
$ pip install virtualenvwrapper
```

Virtualenvwrapper needs a few environment variables set to work properly. Add these to the bottom of your `~/.bashrc` file like so:

```bash
$ printf '\n%s\n%s\n%s\n%s' '# virtualenv' 'export WORKON_HOME=~/virtualenvs' \
'export PROJECT_HOME=~/projects' 'source /usr/local/bin/virtualenvwrapper.sh' >> ~/.bash_functions
```

reload the bash file by running:

```bash
$ source ~/.bash_profile
```

Now make the projects directory, which will contain your projects' actual code:

```bash
$ mkdir ~/projects
```

Now test the install by creating a new environment:

```bash
$ mkvirtualenv -p python3.5 test
```

That tells virtualenv to create an isolated environment called test, using Python 3.5, with the project code being kept in `~/projects/test`. The new environment will automatically be created and the project directory will become the current working directory.

To deactivate the virtual environment, simply type:

```bash
deactivate
```

If you want to go back and work on it again, use:

```bash
workon test
```

which will activate the environment and make its root the current working directory. Check out the virutalenvwrapper docs for other useful commands.

At this point, you should be good to go, but you might want to consider setting up a few local settings for yourself, such as git and Vim configurations.


