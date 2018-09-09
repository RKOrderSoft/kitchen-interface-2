class orderSoftClient {

	constructor() {
		this._sessionID;
		this._accessLevel;
		this._urlEndPoint;
		this._client = "js";
	}


	// getters and setters
	get sessionID() {
		return this._sessionID;
	}

	get accessLevel() {
		return this._accessLevel;
	}

	// pads single digit numbers for dates
	pad(num) {
    	if (num < 10) {
        	return "0" + num.toString();
    	}
    	return num.toString();
	}

	// helper function for fetching from server
	// postURL is string, body is JSO, type is request type
	requestFromServer(postUrl, body, type) {
		if (this._urlEndPoint === undefined) throw Error("No url endpoint - run init() first!");

		var status;

		return fetch(this._urlEndPoint + "/" + postUrl, {
			method : type,
			headers : {
				"content-type" : "application/json",
				"client" : this._client,
				"sessionId" : this._sessionID
			},
			body : JSON.stringify(body)
		}).then(resp => {
			status = resp.status.toString();
			return resp.json();
		}).then(resp => {
			var reason = JSON.parse(resp).reason;
			if (status == 200) { 				// if status is OK
				return JSON.parse(resp);
			} else { 							// if status is not 200/not OK
				if (reason == undefined) { 		// if server gave no reason
					throw status + " no reason"
				} else { 						// if server gave reason
					throw status + " " + reason;
				}
			}
		});
	}

	// test post, returns the response from server
	// DONE & TESTED
	init(ip) {
		var objToSend = {
			"test" : true
		};

		this._urlEndPoint = ip + "api";

		return new Promise(async (resolve, cancel) => {
			try {
				await this.requestFromServer("test", objToSend, "POST");
				resolve();
			} catch (e) {
                this._urlEndPoint = undefined;
				throw new Error(ip + " is not an ordersoft server");
			}
		});

	}



	// given a username and password returns response from server
	// if login is successful then the session ID and access level
	// will be set
	// DONE AND SEEMS TO WORK
	authenticate(username, password) {
		var loginDetails = {
			"username" : username,
			"password" : password
		};


		this.requestFromServer("login", loginDetails, "POST").then(resp => {
			this._sessionID = resp.sessionId;
			this._accessLevel = resp.accessLevel;
			return resp;
		}).catch((err) => {
			console.log(err);
			return err;
		});
	}

	// logs out, clearing session ID and access level
	// DONE & TESTED
	logout() {
		this._sessionID = undefined;
		this._accessLevel = undefined;
	}



	// given a reference of either "tableNumber" or "orderId" and then
	// the reference number, returns response from server
	// DONE & TESTED
	getOrder(reference, referenceNum) {
		if (reference == "tableNumber") {
			var objToSend = {
				"tableNumber" : referenceNum
			};
		} else if (reference == "orderId") {
			var objToSend = {
				"orderId" : referenceNum
			};
		} else {
			throw "must specify 'tableNumber' or 'orderId' in first parameter";
		}

		return this.requestFromServer("getOrder", objToSend, "POST");
	}

	// returns response from server
	// response contains field openOrders, array of orderId (strings)
	// of orders that are not yet complete
	// DONE
	// TESTED
	openOrders() {
		return this.requestFromServer("openOrders", {}, "POST");
	}

	/*
	incorporates both change and submit order
	given an order in JSON, will change/submit order to database
	if tableNum or orderId is not in the database, will make a new
	order. if tableNum or orderId is already in the database, will
	change the order. returns response from server
	*/
	// DONE & TESTED
	setOrder(order) {
		// error handling
		console.log(order);
		var undef = false
		if (order.tableNumber == undefined) {
			console.log(order.tableNum);
			console.log("1");
			undef = true
		} else if (order.orderId != undefined) {
			console.log("2");
			undef = false
		} else {
			console.log("3");
			undef = false
		}
		if (undef == true) {
			throw "orderId or tableNumber must be defined in order";
		}

		var objToSend = {
			"order" : order
		};

		return this.requestFromServer("setOrder", objToSend, "POST");
	}



	// given a reference of either "tableNum" or "orderId" and then
	// the reference number, returns response from server
	// DONE & TESTED
    markOrderMade(reference, referenceNum) {
        this.getOrder(reference, referenceNum).then(resp => {
            var orderToChange = resp.order;

            // date formatting
            var time = new Date(Date.now());
            time.setMinutes(time.getMinutes() + time.getTimezoneOffset());
            var timeString = time.getFullYear().toString() + "-" + this.pad(time.getMonth()).toString() + "-" + this.pad(time.getDate()).toString() + " " + this.pad(time.getHours()).toString() + ":" + this.pad(time.getMinutes()).toString() + ":" + this.pad(time.getSeconds()).toString();
            
            orderToChange.timeCompleted = timeString;
            return this.setOrder(orderToChange);
        }).then(resp => {
            console.log(resp);
        })
    }




	// given optional parameters returns response from server with
	// dishes from database
	// DONE & TESTED
	getDishes(parameters) {
		return this.requestFromServer("getDishes", parameters, "POST");
	}
}

// testing below

/*
const kitchen = new orderSoftClient();
kitchen.testPost().then(resp => {
	console.log(resp);
});
*/


/*
setTimeout(() => {
	kitchen.getOrder("orderId","f4Ke-Uu2D").then(resp => {
		var order1 = resp.order;
		console.log(order1);
		order1.dishes = "13";
		kitchen.setOrder(order1);
	});
}, 1000);*/


//kitchen.authenticate("JasonXiao", "glasses");

/*setTimeout(() => {
	kitchen.getOrder("tableNum", 4).then(resp => {
		orderToSend = resp.order;
		orderToSend.dishes = 5;
		kitchen.setOrder(orderToSend);

	})
}, 1000);*/


// henry this works, tested it, it returns an array of orders using the openOrders and getOrder methods
/*
try {

	orders = [];
	var numOrders = 0;
	kitchen.openOrders().then(resp => {
		var orderIds = resp.openOrders;
		numOrders = orderIds.length;
		for (var i = 0; i < numOrders; i++) {
			kitchen.getOrder("orderId", orderIds[i]).then(order => {
				orders.push(order);
			})
		}
	});
} catch(err) {
	console.log(err);
}
*/