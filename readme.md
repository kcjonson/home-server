Home Server
===========

##Core Features
* Beautiful and usable interface for smart home devices
* User accounts and authentication
* Resident location tracking (Home or Away)

##Technologies
* Node
* Handlebars
* Express
* MongoDB
* Mongoose (Schema, Model)
* JQuery
* Underscore
* Backbone (Router, View, Collection)
* Backbone Relational (RelationalModel)
* LESS

##Integrations
* Indigo Home Automation Server to manage Insteon 
* Foursquare (Swarm technically)
* Geohopper for iOS geofencing

##Organization

**/app** - Core application, sets up the express server and starts up all the various controllers.  This single backend application creates functionality for multiple font end Javascript applications.
 
**/app/controllers** - Endpoints, public API, all of the URL mapping for REST like communication happens here.  Most of these are pretty thin and pass the work to the related library.
  
**/app/lib** - backend libraries and utilities.  These do not have any endpoints themselves, but many have a corresponding controller to handle public communication.
  
**/app/models** - Mongoose models and schema. Mongo is not queried directly, all database transactions go through Mongoose models.
  
**/app/views & /app/templates** - Handlebars backend templated views and templates.  Sparsely used as much of the templating and views are managed by the JS applications.

**/app/public/scripts/apps/** - Base directory for front end JS applications.
  
  
