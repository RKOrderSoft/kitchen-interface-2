var kitchen = new orderSoftClient();

window.onload = async () => {
    // Get the modal
    var modal = document.getElementById('model-content');
    /*
    // Get the button that opens the modal
    var btn = document.getElementById("viewHistory");
    */
    // open modal automatically when window loads
    document.getElementById("login").classList.add("shown");
    document.getElementById("btnNext").onclick = async () => {
        try {
            await init(ip);
        } catch (error) {
            error.toString
            document.getElementById("wrongIP").innerHTML = error;
            
        }
    }
    // Start the timer
    setInterval(timerTick, 500);
}

//set time to system time 
function timerTick() {
    var today = new Date();
    var hour = today.getHours();
    var systemMinute = today.getMinutes();
    var systemSecond = today.getSeconds();

    // Pad minutes and seconds
    systemMinute = checkTime(systemMinute);
    systemSecond = checkTime(systemSecond);

    // Display date
    document.getElementById('date').innerHTML = hour + ":" + systemMinute + ":" + systemSecond;
    
} 
//pad number if number<10
function checkTime(i) {
    if (i < 10) {
        i = "0" + i.toString();
    };
    // add zero in front of numbers < 10
    return i;
}

/*modal stuff
// replace content in container with other information
function ReplaceContentInContainer(id, content) {
    var container = document.getElementById(id);
    container.innerHTML = content;
}
function remove() {
    ReplaceContentInContainer("order", 'Wow it work');
}*/