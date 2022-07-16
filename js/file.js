function chargebattery() {
    var a;
    a = document.getElementById("div_file");
    a.innerHTML = "&#xf1c6;";
    setTimeout(function () {
        a.innerHTML = "&#xf1c7;";
    }, 1000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c9;";
    }, 2000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c3;";
    }, 3000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c5;";
    }, 4000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c8;";
    }, 5000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c1;";
    }, 6000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c4;";
    }, 7000);
    setTimeout(function () {
        a.innerHTML = "&#xf15c;";
    }, 8000);
    setTimeout(function () {
        a.innerHTML = "&#xf1c2;";
    }, 9000);
}
chargebattery();
setInterval(chargebattery, 10000);