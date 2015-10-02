ActiveBiblio webclient
=====================

TODO: WAMP is not really needed for development.
It's only used to serve files of the web client,
which can be done from WebStorm.
Should rework this README.

Windows
--------

### Install

Download Wamp : http://www.wampserver.com/    

Run the installer (`wamp.exe`). If it complains about a missing dll,    
then install [Microsoft visual c++ 2012 redistributable (x64)]
(https://www.microsoft.com/fr-fr/download/details.aspx?id=30679) and relaunch the installer.    

Insert the project in `/www` repository and complete the `config.js` file like in the config example.     

### Running WAMP

- Run WAMP server (a green **W** should appear on the desktop bar).   
- On the browser, go to `localhost/WebClient`.   

### Running in WebStorm

1. Open `index.html` in WebStorm

2. Hover the mouse over the html code, and a toolbar will pop up
   in the top-right corner with multiple browser choices.
   http://stackoverflow.com/a/23590431/641955