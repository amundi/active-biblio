Biblio service
==============

The backend of the library, exposing access to clients through a REST API.


Requirements
------------

- Apache web server
- MySQL database
- Node.js + libraries


Install in Windows
------------------

### WAMP

Download : http://www.wampserver.com/   

Run the installer (`wamp.exe`). If it complains about a missing dll,
then install [Microsoft visual c++ 2012 redistributable (x64)]
(https://www.microsoft.com/fr-fr/download/details.aspx?id=30679) and relaunch the installer.

Run WAMP server (a green W should appear on the desktop bar).

### MySQL database

MySQL server is running with WAMPServer.   

1. Start WAMPServer  
2. Open http://localhost/phpmyadmin in a browser
3. Import [DB_ActiveBiblio.sql](database/DB_ActiveBiblio.sql)

### Node js

Download and execute msi from: https://nodejs.org/    

See the Node.js modules section below to install dependencies.


Installation for Linux (openSuse OS)
--------------------------------

### LAMP

Install Apache:

    sudo zypper install apache2    

Start Apache:

    sudo apache2ctl start    

If Apache complains about a missing config file, create an empty file as a workaround:

    touch /etc/apache2/sysconfig.d/include.conf 
       
Install PHP and MySQL:

    sudo zypper install php53 apache2-mod_php53 php53-mysql

Enable PHP for Apache:

    sudo a2enmod php5  # Apache 2 Enable Module

### MySQL database

TODO

### Node js

Download and install `nave` as `root`:

    sudo su -
    mkdir .nave
    cd .nave
    wget http://github.com/isaacs/nave/raw/master/nave.sh
    chmod a+x nave.sh
    ln -s $PWD/nave.sh /usr/local/bin/nave
    nave usemain stable

Download and install Node.js:

    wget https://www.npmjs.org/install.sh
    bash install.sh


Node libraries
--------------

`npm` is the package manager of Node.js, and packages are called modules.
To install modules for a project, use `npm install` inside the project directory.

    npm install

If you are behind a proxy, configure the proxy server address with:

    npm config set proxy http://proxy.company.com:8080    
    npm config set https-proxy http://proxy.company.com:8080

Run the service
---------------

Run:

    node service.js


For developers
--------------

### IDE

[WebStorm](https://www.jetbrains.com/webstorm/)

### Run/Unit test

To run the projet, there are two ways :  

- On the command line, inside the project directory, run: `node service.js`   
- In WebStorm, run service.js

For unit testing:

- Install mocha (npm install mocha)  
- Go to WebStorm -> Run -> Edit Configurations and create a new mocha configuration
- To run : click on green button (top right)   

![Running mocha](docs/specs/images/running_mocha.png)

- To re-run tests: Alt + Shift + R

- On the command line:
	- Inside the project directory, run: `mocha tests`

### Debugging

1. Make sure the tests are running
  - Good to do sanity test before you start working
  - Re-run the tests before creating Merge Requests

2. An easy way to do sanity checks with `curl`, for example: `curl localhost:8080/books`
  - A non-empty `http_proxy` variable may cause problems. In that case: `http_proxy= curl localhost:8080/books`

More examples:

    curl localhost:8080/login -X POST -d mail=admin -d password=admin
    # should pass if the password file has a line: admin:admin

The [SQLite command line client][1] can be an indispensable tool for debugging.

[1]: https://www.sqlite.org/download.html
