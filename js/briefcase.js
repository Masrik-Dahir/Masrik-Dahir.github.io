//&#xf0f2;


function chargebattery() {
    var a;
    a = document.getElementById("div_briefcase");
    a.innerHTML = "&#xf1fe;";
    setTimeout(function () {
        a.innerHTML = "&#xf080;";
    }, 1000);
    setTimeout(function () {
        a.innerHTML = "&#xf201;";
    }, 2000);
    // setTimeout(function () {
    //     a.innerHTML = "&#xf200;";
    // }, 3000);
    // setTimeout(function () {
    //     a.innerHTML = "&#xf240;";
    // }, 4000);
}
chargebattery();
setInterval(chargebattery, 3000);