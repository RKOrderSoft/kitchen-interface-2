var kitchen = new orderSoftClient();  

window.onload = async () => { 

    document.getElementById("modalAuthenticate").classList.add("shown");
    document.getElementById("orderHistory").classList.add('hide');
    //check server ip
    document.getElementById("btnNext").onclick = async () => {
        try {
            var ip = "http://" + document.getElementById("ip").value + "/" ; 
            await kitchen.init(ip);
            document.getElementById("serverAuthenticate").classList.add("hide");
            document.getElementById("userLogin").classList.remove("hide");
        } catch (error) {
            document.getElementById("wrongIP").innerHTML = error.toString();
        }
    }

    //user login  
    document.getElementById("btnLogin").onclick = async () => {
        try {
            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;
            await kitchen.authenticate(username, password);

            document.getElementById("modalAuthenticate").classList.remove("shown");
            getOrderItems();
            setInterval(getCompletedOrder, 3000);
            setInterval(getOrderItems, 3000);
            window.setTimeout(getOrderItems, 500);
        } catch (error) {
            document.getElementById("wrongLogin").innerHTML = "Wrong username/password"
        }
        
    }

    //refresh page
    document.getElementById("refresh").onclick = () => {
        getOrderItems();
    }

    //open history modal
    document.getElementById("viewHistory").onclick = () => {
        document.getElementById("orderHistory").classList.remove('hide');
        document.getElementById("orderHistory").classList.add("shown");
        console.log('viewHistory');
    }

    // get system time
    setInterval(timerTick, 500);
}


//get unpaid orders
async function getCompletedOrder() {
    var completeOrderIds = (await kitchen.unpaidOrders()).unpaidOrders; //get unpaid orders

    for (var i = 0; i < completeOrderIds.length; i++) { //repeat for each unpaid order
        var orderToGet = completeOrderIds[i];
        var completeOrders = (await kitchen.getOrder("orderId", orderToGet)).order; //get orderIds
        displayCompletedOrders(completeOrders); //display orders
    }
}

async function displayCompletedOrders(orderToDisplay) {
    var newOrder = document.createElement("tr");

    //separate dishIds in dishes
    var completeDishesArray = (orderToDisplay.dishes.split(','));
    //console.log(completeDishesArray)
    //get list of dishes in order
    for (var i = 0; i < completeDishesArray.length; i++) { //get dish name from Id
        var dishId = dishesArray[i];
        console.log(dishId);
        var dishName = await getDishName(dishId);
        var newDish = document.createElement("li");
        newDish.appendChild(document.createTextNode(dishName.dishName));
        //get size 
        if (dishName.sizeName !== undefined) {
            newDish.appendChild(document.createTextNode(dishName.sizeName)); //display size
        };
        newDish.querySelector("completedOrderDishes").appendChild(newDish);
    }
    newOrder.appendChild(document.createElement('td').innerHTML = orderToDisplay.tableNumber);
    newOrder.appendChild(document.createElement('td').innerHTML = orderToDisplay.timecompleted);
    document.getElementById("completeOrders").appendChild(newOrder);
    
}
//get open orders and display them
async function getOrderItems() {
    var openOrderIds = (await kitchen.openOrders()).openOrders; // openOrderIds is an array of strings

    // Get all orders
    var toDisplay = [];
    //get each order
    for (var i = 0; i < openOrderIds.length; i++) {
        var orderToGet = openOrderIds[i];
        var currentOrder = (await kitchen.getOrder("orderId", orderToGet)).order; // currentOrder is an order object
        // do whatever with currentOrder here
        toDisplay.push(await getOrderItem(currentOrder));
    }

    // Populate container
    var container = document.getElementById("orders-container");
    clearOrders();
    toDisplay.forEach((order) => {
        // Add order to container
        container.appendChild(order);
    })
}


// create array of order details to display
async function getOrderItem(orderToDisplay) {
    var newOrder = await document.getElementById("orderTemplate").content.cloneNode(true);//create new instance of orderTemplate

    //separate dishIds in dishes
    var dishesArray = orderToDisplay.dishes.split(",");

    // Add each dish to newOrder
    for (var i = 0; i < dishesArray.length; i++) { //get dish name from Id
        var dishId = dishesArray[i];
        var dishName = await getDishName(dishId);
        var newDish = document.createElement('li');

        var nameSpan = document.createElement("span");
        nameSpan.classList.add("nameSpan");
        nameSpan.classList.add("flex-spacer");
        nameSpan.innerHTML = dishName.dishName

        newDish.appendChild(nameSpan); //display dishName
        //if size is defined insert size name
        if (dishName.sizeName !== undefined) {
            var sizeSpan = document.createElement("span");
            sizeSpan.classList.add("sizeSpan");
            sizeSpan.innerHTML = dishName.sizeName;
            newDish.appendChild(sizeSpan); //display size
        };

        //add newDish to new Order window
        newOrder.querySelector(".displayDishes").appendChild(newDish);
    }

    // Adding data to fields
    var orderTime = orderDisplayTime(orderToDisplay.timeSubmitted);
    newOrder.querySelector(".displayOrderTime").innerHTML = "Submitted: " + orderTime; //add time submitted to order
    newOrder.querySelector(".displayTableNumber").innerHTML = "Table " + orderToDisplay.tableNumber; // add table number
    newOrder.querySelector(".orderComplete").onclick = () => { //mark order made
        kitchen.markOrderMade('orderId', orderToDisplay.orderId);
        getOrderItem();
    }
    
    //displaying notes
    if (orderToDisplay.notes) {
        newOrder.querySelector(".displayNotes").innerHTML = "Notes: " + orderToDisplay.notes;
    }

    return newOrder;
}   



//translate item in order to dish id and size
async function getDishName(dishIdString) {
    //split order into Id and size
    var dishIdSize = dishIdString.split("/"); //dishIdString is a single item on order
    var dishIdToGet = dishIdSize[0];
    var dishSize = dishIdSize[1];
    //change dish ID to dish name
    var dishToDisplay = (await kitchen.getDishes({ dishId: dishIdToGet })).results[0]; //dishToDisplay is the name of dish
    return { dishName: dishToDisplay.name, sizeName: dishSize } //return object with size and name
}

//set time to system time 
function timerTick() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDay();
    var systemMinute = today.getMinutes();
    var systemSecond = today.getSeconds();
    var hour = today.getHours();
    // Pad minutes and seconds
    systemMinute = checkTime(systemMinute);
    systemSecond = checkTime(systemSecond);
    // Display date
    document.getElementById('date').innerHTML = hour + ":" + systemMinute + ":" + systemSecond;
    return year + "-" + month + "-" + day + " " + hour + ":" + systemMinute + ":" + systemSecond;
} 

//pad second/minute if number<10
function checkTime(i) {
    // add zero in front of numbers < 10
    if (i < 10) {
        i = "0" + i.toString();
    };
    return i;
}

//calculate current order time
function orderDisplayTime(currentOrder) {
    var orderDateTime = currentOrder.split(" ");
    var orderTime = orderDateTime[1].split(":");
    var orderHour = orderTime[0];
    var orderMinute = orderTime[1];
    var orderSeconds = orderTime[2];
    return orderHour + ':' + orderMinute + ':' + orderMinute;

}

//clear orders container
function clearOrders() {
    var container = document.getElementById("orders-container");
    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }
};

//get complete orders and place in array 
