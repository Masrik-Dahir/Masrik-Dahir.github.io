function hourglass() {
    var a;
    a = document.getElementById("div1");
    a.innerHTML = "&#xf254;";
    setTimeout(function () {
        a.innerHTML = "&#xf251;";
    }, 1000);
    setTimeout(function () {
        a.innerHTML = "&#xf252;";
    }, 2000);
    setTimeout(function () {
        a.innerHTML = "&#xf253;";
    }, 3000);
}
hourglass();
setInterval(hourglass, 4000);