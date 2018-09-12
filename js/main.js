var kitchen = new orderSoftClient();  

window.onload = async () => {
    // Get the modal
    var modal = document.getElementById('model-content');
    /*
    // Get the button that opens the modal
    var btn = document.getElementById("viewHistory");
    */
    
    document.getElementById("modalAuthenticate").classList.add("shown");

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
            setInterval(getOrderItems, 3000);
        }
        catch (error) {
            document.getElementById("wrongLogin").innerHTML = "Wrong username/password"
        }
    }
    document.getElementById("refresh").onclick = () => {
        clearOrders();
        getOrderItems();
    }

    // get system time
    setInterval(timerTick, 500);
}

async function getOrderItems() {
    var openOrderIds = (await kitchen.openOrders()).openOrders; // openOrderIds is an array of strings
    openOrderIds.forEach(async (orderToGet) => {
        var currentOrder = (await kitchen.getOrder("orderId", orderToGet)).order; // currentOrder is an order object
        // do whatever with currentOrder here
        displayOrderItems(currentOrder);
        //setInterval(orderTimer, 1000);
        clearOrders();
    })
}
// display order items
async function displayOrderItems(orderToDisplay) {
    var newOrder = document.getElementById("orderTemplate").content.cloneNode(true);//create new instance of orderTemplate
    var systemTime = timerTick();
    //separate dishId in dishes
    var dishesArray = orderToDisplay.dishes.split(","); 
    for (var i = 0; i < dishesArray.length; i++) { //get dish name from Id
        var dishId = dishesArray[i];
        var dishName = await getDishName(dishId);
        var newDish = document.createElement('li');
        newDish.appendChild(document.createTextNode(dishName.dishName)); //display dishName
        //if size is not undefined insert size name
        if (dishName.sizeName !== undefined) { 
            newDish.appendChild(document.createTextNode(dishName.sizeName)); //display size
        };
        //add newDish to new Order window
        newOrder.querySelector(".displayDishes").appendChild(newDish);
    }
    // Adding data to fields
    newOrder.querySelector(".displayTableNumber").innerHTML = orderToDisplay.tableNumber;
    newOrder.querySelector(".orderComplete").onclick = () => {
        kitchen.markOrderMade('tableNumber', orderToDisplay.tableNumber);
        console.log("orderComplete");
    }
    //displaying notes
    newOrder.querySelector(".displayNotes").innerHTML = orderToDisplay.notes;
    var container = document.getElementById("orders-container");
    await container.appendChild(newOrder);
    
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

// append ordertime
/*
var totalSeconds = 0
function orderTimer() {
    ++totalSeconds;
    var orderMinute = Math.floor(totalSeconds/60);
    var orderSecond = Math.floor(totalSeconds - (orderMinute * 60));
    orderMinute = checkTime(orderMinute);
    orderSecond = checkTime(orderSecond);
    return orderMinute + ":" + orderSecond;
}*/

//set time to system time 
function timerTick() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDay();
    var hour = today.getHours();
    var systemMinute = today.getMinutes();
    var systemSecond = today.getSeconds();
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

//clear orders container
function clearOrders() {
    var container = document.getElementById("orders-container");
    while (container.hasChildNodes) {
        container.removeChild(container.firstChild);
    }
};
