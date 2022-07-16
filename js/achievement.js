function chargetemp() {
    var a;
    a = document.getElementById("div2");
    a.innerHTML = "&#xf2cb;";
    setTimeout(function () {
        a.innerHTML = "&#xf2ca;";
    }, 1000);
    setTimeout(function () {
        a.innerHTML = "&#xf2c9;";
    }, 2000);
    setTimeout(function () {
        a.innerHTML = "&#xf2c8;";
    }, 3000);
    setTimeout(function () {
        a.innerHTML = "&#xf2c7;";
    }, 4000);
}
chargetemp();
setInterval(chargetemp, 5000);