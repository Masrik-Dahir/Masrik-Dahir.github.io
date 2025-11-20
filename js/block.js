function chargebtc() {
    var image = document.getElementById("image-btc");
    image.src = "https://d3dw5jtb3w1kgy.cloudfront.net/btc.svg";
    setTimeout(function () {
        image.src = "https://d3dw5jtb3w1kgy.cloudfront.net/eth.svg";
    }, 1000);
    setTimeout(function () {
        image.src = "https://d3dw5jtb3w1kgy.cloudfront.net/algo.svg";
    }, 2000);
    setTimeout(function () {
        image.src = "https://d3dw5jtb3w1kgy.cloudfront.net/atom.svg";
    }, 3000);
    setTimeout(function () {
        image.src = "https://d3dw5jtb3w1kgy.cloudfront.net/dot.svg";
    }, 4000);
    setTimeout(function () {
        image.src = "https://d3dw5jtb3w1kgy.cloudfront.net/aave.svg";
    }, 5000);
}
chargebtc();
setInterval(chargebtc, 6000);