function chargebattery3() {
    var a;
    a = document.getElementById("div_briefcase3");
    a.innerHTML = "&#xf57f;";
    setTimeout(function () {
        a.innerHTML = "&#xf580;";

    }, 1000);
    setTimeout(function () {
        a.innerHTML = "&#xf581;";
    }, 2000);
    setTimeout(function () {
        a.innerHTML = "&#xf582;";
    }, 3000);
    setTimeout(function () {
        a.innerHTML = "&#xf583;";
    }, 4000);
    setTimeout(function () {
        a.innerHTML = "&#xf584;";
    }, 5000);
    setTimeout(function () {
        a.innerHTML = "&#xf585;";
    }, 6000);
    setTimeout(function () {
        a.innerHTML = "&#xf586;";
    }, 7000);
    setTimeout(function () {
        a.innerHTML = "&#xf587;";
    }, 8000);
    setTimeout(function () {
        a.innerHTML = "&#xf588;";
    }, 9000);
    setTimeout(function () {
        a.innerHTML = "&#xf589;";
    }, 10000);
    // setTimeout(function () {
    //     a.innerHTML = "&#xf200;";
    // }, 3000);
    // setTimeout(function () {
    //     a.innerHTML = "&#xf240;";
    // }, 4000);
}
chargebattery3();
setInterval(chargebattery3, 11000);