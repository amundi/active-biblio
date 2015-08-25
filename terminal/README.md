ActiveBiblio terminal
=====================

The device next to the bookshelf to add, rent or return a book.


Requirements
------------

- For users :
	- Install the apk on your device
	
- For developers :
	- Apache Ant (http://ant.apache.org/bindownload.cgi)
	- Node JS (http://nodejs.org/download/)
	- Ionic & Cordova
		- On the node command prompt: `npm install -g cordova ionic`
	- Java JDK (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
	- SDK for your app environment (Android, IOS, Windows)
	
Tuto : http://www.gajotres.net/building-a-native-mobile-app-with-cordova-and-ionic/

Build and test the application
-------------------------------

On the node command prompt :    
	- `ionic start appName tabs`    
	- `cd appName`    
	- Insert the projet in www repository and complete config.js file like the config example     
	- `cordova plugin add https://github.com/wildabeast/BarcodeScanner.git` (barcode scanner)    
	- `ionic add platform android` (or ios, windows, ...)    
	- `ionic build android`       
	
To test the application, there are three methods :    
	- Install the generated apk on a device    
	- Emulate it on your computer: `ionic emulate android`    
	- Run it in a browser: `ionic serve`    
