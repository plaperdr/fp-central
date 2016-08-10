#Fingerprint Central
Welcome to the official Fingerprint Central repository!
This project is developed as part of the
[Google Summer of Code 2016](https://summerofcode.withgoogle.com/projects/#5574889654190080)
by Pierre Laperdrix for the Tor organisation.

Fingerprint Central is a platform where users can learn about browser fingerprinting and
where developers can study device diversity.
You will find here global information on the project.
Additional details on the technical implementation can be found in readmes in the **fingerprint** folder.

## Goal
The goal of FP Central is to collect browser fingerprints from thousands of users and study
the diversity of devices on the Internet. Data is key in understanding how much identifying
information transpires through a browser and collecting fingerprints will help developers
design smart defenses against unwanted leaks.

FP Central is designed first and foremost for the Tor community and Tor developers.
The aim is to remove as much differences as possible between Tor browsers to reinforce the
privacy and anonymity of Tor users.

FP Central is built in a way so that tests can be added and removed easily.
Any developers can quickly set up a test to find out if a a fingerprinting-related fix
is working or to study a newly discovered technique.


## Local installation
The only way to launch FP Central is through the **run.py** script.
Other ways will be added later on as new features get added to the project.

For an easy installation, you can download everything through **[pip](https://packaging.python.org/en/latest/install_requirements_linux/#installing-pip-setuptools-wheel-with-linux-package-managers)**
by executing the following instruction at the root of the repo:

    pip3 install -r requirements.txt


Then you need to have MongoDB running on your system.
Refer to the official documentation [HERE](https://docs.mongodb.com/manual/installation/)
for instructions on how to install it on your operating system.

After this step, you can directly run

    python3 run.py

By default, the website is launched on port 5000.

    http://127.0.0.1:5000

## Technology behind the project
Here is the list of technology or libraries currently used by the project for the back-end:
* Python 3 ([Official](https://www.python.org/) - [Debian](https://packages.debian.org/jessie/python3) - [Ubuntu](http://packages.ubuntu.com/xenial/python3) - [Fedora](https://apps.fedoraproject.org/packages/python3))
* Flask ([Official](http://flask.pocoo.org/) - [GitHub](https://github.com/pallets/flask) - [Debian](https://packages.debian.org/jessie/python3-flask) - [Ubuntu](http://packages.ubuntu.com/xenial/python3-flask) - [Fedora](https://apps.fedoraproject.org/packages/python3-flask))
* MongoDB ([Official](https://www.mongodb.com/) - [GitHub](https://github.com/mongodb/mongo) - [Debian](https://packages.debian.org/jessie/mongodb) - [Ubuntu](http://packages.ubuntu.com/xenial/mongodb) - [Fedora](https://apps.fedoraproject.org/packages/mongodb))
* PyMongo ([Official](https://api.mongodb.com/python/current/) - [GitHub](https://github.com/mongodb/mongo-python-driver) - [Pypi](https://pypi.python.org/pypi/pymongo) - [Debian](https://packages.debian.org/jessie/python3-pymongo) - [Ubuntu](http://packages.ubuntu.com/xenial/python3-pymongo) - [Fedora](https://apps.fedoraproject.org/packages/python3-pymongo))
* Flask-Babel [Official](https://pythonhosted.org/Flask-Babel/) - [GitHub](https://github.com/python-babel/flask-babel) - [Pypi](https://pypi.python.org/pypi/Flask-Babel) - [Debian](https://packages.debian.org/stretch/python3-flask-babel) - [Ubuntu](http://packages.ubuntu.com/xenial/python3-flask-babel) - [Fedora](https://apps.fedoraproject.org/packages/python-flask-babel))
* Flask-RESTful ([Official](https://flask-restful.readthedocs.io/en/latest/) - [GitHub](https://github.com/flask-restful/flask-restful) - [Pypi](https://pypi.python.org/pypi/Flask-RESTful) - [Debian](https://packages.debian.org/stretch/python3-flask-restful) - [Ubuntu](http://packages.ubuntu.com/xenial/python3-flask-restful) - [Fedora](https://apps.fedoraproject.org/packages/python-flask-restful))
* Flask-PyMongo ([Official](https://flask-pymongo.readthedocs.io/en/latest/) - [GitHub](https://github.com/dcrosta/flask-pymongo) - [Pypi](https://pypi.python.org/pypi/Flask-PyMongo))

And for the front-end:
* Bootstrap ([Official](https://getbootstrap.com/) - [GitHub](https://github.com/twbs/bootstrap))
* Sandstone Bootswatch theme ([Official](https://bootswatch.com/) - [GitHub](https://github.com/thomaspark/bootswatch))
* jQuery ([Official](https://jquery.com/) - [GitHub](https://github.com/jquery/jquery))
* Highcharts ([Official](http://www.highcharts.com/) - [GitHub](https://github.com/highcharts/highcharts))
* Date Range Picker ([Official](http://www.daterangepicker.com/) - [GitHub](https://github.com/dangrossman/bootstrap-daterangepicker))
* Bootstrap Table ([Official](http://bootstrap-table.wenzhixin.net.cn/) - [GitHub](https://github.com/wenzhixin/bootstrap-table))

## Features
You will find below the list of currently supported features.

- [x] Basic front-end and back-end with Flask and Bootstrap
- [x] Support of a dynamic test suite
- [x] Addition of MongoDB and storage of collected fingerprints
- [x] Addition of standard and Tor Browser specific fingerprinting tests
- [x] Support of returning visitors
- [x] Addition of basic statistics (for users + global page with aggregate statistics)
- [x] Addition of finer-grained statistics with lifetime stats, epoched stats and browser version stats
- [x] Addition of a RESTful API to get specific statistics easily
- [x] Support for localization
- [x] Addition of a page for acceptable Tor fingerprints
- [x] Support of additional browsers through the tagging system

#Contributions
As the project is in early phases of development, it is subject to heavy modifications
and refactoring. For that reason, I'm not accepting pull requests for the moment.
However, as soon as the project is online, I'll gladly welcome any contributions with open arms
to fix bugs or add new features.

#License
This project is licensed under the MIT License. See the LICENSE file for details.
