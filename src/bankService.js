// ------------------------------------------------------------
//                          Init
// ------------------------------------------------------------

// Load properties file
var propertiesReader = require("properties-reader");
var properties = propertiesReader(__dirname + "/bankService.properties");

// Include Express and Mongoose
var express = require("express");
var mongoose = require("mongoose");

// Create database model
var Schema = mongoose.Schema;
var operationSchema = new Schema({
	account : String,
	label : String,
	state : String,
	amount : Number,
	date : { type : Date, default : Date.now },
	createDate : { type : Date, default : Date.now },
	updateDate : { type : Date, default : Date.now }
});
var Operation = mongoose.model('Operation', operationSchema);

// ------------------------------------------------------------
//                          Methods
// ------------------------------------------------------------

var findCallback = function(request, response) {
	Operation.find(null, function(error, results) {
		if (error) {
			throw error;
		} else {
			console.log(results.length + " operations found");
			var result;
			for (var i = 0; i < results.length; i++) {
				result = results[i];
				console.log('------------------------------');
				console.log("ID : " + result._id);
				console.log("Account : " + result.account);
				console.log("Label : " + result.label);
				console.log("State : " + result.state);
				console.log("Amount : " + result.amount);
				console.log("Date : " + result.date);
				console.log('------------------------------');
			}
			response.send(results);
		}
	});
};

var searchCallback = function(request, response) {
	var query = Operation.find(null);
	query.where("account", request.params.account);
	query.exec(function(error, results) {
		if (error) {
			throw error;
		} else {
			console.log(results.length + " operations found");
			var result;
			for (var i = 0; i < results.length; i++) {
				result = results[i];
				console.log('------------------------------');
				console.log("ID : " + result._id);
				console.log("Account : " + result.account);
				console.log("Label : " + result.label);
				console.log("State : " + result.state);
				console.log("Amount : " + result.amount);
				console.log("Date : " + result.date);
				console.log('------------------------------');
			}
			response.send(results);
		}
	});
};

var addCallback = function(request, response) {
	
	// Create operation object
	var operationContent = {
		account : request.params.account,
		label : request.query.label,
		state : request.query.state,
		amount : request.query.amount,
		date : new Date(request.query.date)
	};
	var operation = new Operation(operationContent);

	// Save operation object in MongoDB !
	operation.save(function(error) {
		if (error) {
			throw error;
		} else {
			console.log("Operation saved in database");
			response.send(operationContent);
		}
	});
};

// ------------------------------------------------------------
//                          Start REST server
// ------------------------------------------------------------

// Init connection to database
var mongoUrl = properties.get("mongo.url");
mongoose.connect(mongoUrl, function(error) {
	if (error) {
		throw error;
	} else {
		console.log("Connected to Mongo database!");
	}
});

// Init REST server
var app = express();
app.get("/operations", findCallback);
app.get("/operations/:account", searchCallback);
app.post("/operations/:account", addCallback);

// Start REST server
var server = app.listen(8080, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Server is listening at http://%s:%s", host, port);
});

// Close connection
server.on("close", function(error) {
	console.log("Stopping server...");
	mongoose.connection.close();
	console.log("... server stopped!");
});

// process.on("SIGINT", function() {
//  server.close();
//});
