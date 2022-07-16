function chargebtc() {
    var image = document.getElementById("image-btc");
    image.src = "Images/btc.svg";
    setTimeout(function () {
        image.src = "Images/eth.svg";
    }, 1000);
    setTimeout(function () {
        image.src = "Images/algo.svg";
    }, 2000);
    setTimeout(function () {
        image.src = "Images/atom.svg";
    }, 3000);
    setTimeout(function () {
        image.src = "Images/dot.svg";
    }, 4000);
    setTimeout(function () {
        image.src = "Images/aave.svg";
    }, 5000);
}
chargebtc();
setInterval(chargebtc, 6000);