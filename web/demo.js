
function pv(input_1_y, input_n, input_pmt){
    var retval = 0;
    var t = false;
    if (input_1_y === 0) {
        retval = -1*((input_n*input_pmt));
    }
    else {
        var r1 = input_1_y + 1;
        retval =
            (((1 - Math.pow(r1, input_n)) / input_1_y) * (t ? r1 : 1) * input_pmt)
            /
            Math.pow(r1, input_n);
    }
    return retval
}

console.log(pv(0.05, 20, 10000));
console.log(pv(1, 1, 1));