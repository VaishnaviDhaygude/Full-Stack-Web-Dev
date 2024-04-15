

const express = require('express');
const routes = express.Router();


const restuarantsController = require('../Controllers/RestuarantsController');
const locationsController = require('../Controllers/locations');
const mealtypeController = require('../Controllers/mealtypes');
const menuItemsController = require('../Controllers/MenuItemsController');
const userController = require('../Controllers/userController');
const paymentController = require('../Controllers/Payment');



routes.get('/locations',locationsController.getLocations);
routes.get('/mealtypes',mealtypeController.getMealtypes);
routes.post('/filter', restuarantsController.filter);
routes.get("/restaurants", restuarantsController.getAllRestuarant);
routes.get('/locations/:id', restuarantsController.getRestaurantByLocation);
routes.get('/restaurants/:id', restuarantsController.getRestaurantById);
routes.get('/getmenu/:id', menuItemsController.getMenuItemsByRestaurant);
routes.post('/signup', userController.signUp);
routes.post('/login', userController.logIn);
routes.post('/payment', paymentController.handlePayment);


module.exports = routes; 