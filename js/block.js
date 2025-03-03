function chargebtc() {
    var image = document.getElementById("image-btc");
    image.src = "https://d30tgmewtclfrp.cloudfront.net/btc.svg";
    setTimeout(function () {
        image.src = "https://d30tgmewtclfrp.cloudfront.net/eth.svg";
    }, 1000);
    setTimeout(function () {
        image.src = "https://d30tgmewtclfrp.cloudfront.net/algo.svg";
    }, 2000);
    setTimeout(function () {
        image.src = "https://d30tgmewtclfrp.cloudfront.net/atom.svg";
    }, 3000);
    setTimeout(function () {
        image.src = "https://d30tgmewtclfrp.cloudfront.net/dot.svg";
    }, 4000);
    setTimeout(function () {
        image.src = "https://d30tgmewtclfrp.cloudfront.net/aave.svg";
    }, 5000);
}
chargebtc();
setInterval(chargebtc, 6000);