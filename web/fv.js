
function operation() {
    var input_fv = document.getElementById('input_fv');
    var input_pv = document.getElementById('input_pv');
    var input_1_y = document.getElementById('input_1_y');
    var input_n = document.getElementById('input_n');
    var input_pmt = document.getElementById('input_pmt');
    var input_p_y = document.getElementById('input_p_y');
    var input_c_y = document.getElementById('input_c_y');

    if (typeof input_pv !== "undefined" && input_pv.value === ''){
        input_pv.value = pv(parseFloat(input_1_y.value), parseFloat(input_n.value), parseFloat(input_pmt.value));
    }

}

function pv(input_y, input_n, input_pmt){
    var retval = 0;
    var t = false;
    if (input_y === 0) {
        retval = -1*((input_n*input_pmt));
    }
    else {
        var r1 = input_y + 1;
        retval =
            (((1 - Math.pow(r1, input_n)) / input_y) * (t ? r1 : 1) * input_pmt)
            /
            Math.pow(r1, input_n);
    }
    return parseFloat(retval.toFixed(5))
}

