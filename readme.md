Home Server
===========

##Core Features
* REST API to interact with home automation suite
* User accounts and authentication
* Resident location tracking (Home or Away)
* Device control

##Technologies
* Node
* Express
* MongoDB & Mongoose (Schema, Model)
* Gulp
* Nodemon 


##Integrations
* Indigo Home Automation Server to manage Insteon Hardware Devices
* Geohopper for iOS geofencing
* Foursquare (Swarm technically) to increase user geo awareness
* Forecast.io for current weather conditions
* Applescript for control of iTunes, Airfoil, and Spoken Alerts

##Organization

**/app** - Core application, sets up the express server and starts up all the various controllers.  This single backend application creates functionality for multiple font end Javascript applications.
 
**/app/controllers** - Endpoints, public API, all of the URL mapping for REST like communication happens here.  Most of these are pretty thin and pass the work to the related library.
  
**/app/lib** - backend libraries and utilities.  These do not have any endpoints themselves, but many have a corresponding controller to handle public communication.
  
**/app/models** - Mongoose models and schema. Mongo is not queried directly, all database transactions go through Mongoose models.
  
**/app/util** - General Utilities

**/app/middleware** - Express middleware for auth and logging

