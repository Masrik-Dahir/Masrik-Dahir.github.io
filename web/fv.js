
function operation() {
    var input_fv = document.getElementById('input_fv');
    var input_pv = document.getElementById('input_pv');
    var input_1_y = document.getElementById('input_1_y');
    var input_n = document.getElementById('input_n');
    var input_pmt = document.getElementById('input_pmt');
    var input_type = document.getElementById('input_type');

    var v_fv = eval(input_fv.value)
    var v_pv = eval(input_pv.value)
    var v_y = eval(input_1_y.value)
    var v_n = eval(input_n.value)
    var v_pmt = eval(input_pmt.value)


    if (typeof input_pv !== "undefined" && input_pv.value === ''){
        input_pv.value = PV(parseFloat(v_y), parseFloat(v_n), parseFloat(v_pmt), parseFloat(v_fv), parseFloat(input_type.value));
    }
    if (typeof input_fv !== "undefined" && input_fv.value === ''){
        input_fv.value = FV(parseFloat(v_y), parseFloat(v_n), parseFloat(v_pmt), parseFloat(v_pv), parseFloat(input_type.value));
    }
    if (typeof input_1_y !== "undefined" && input_1_y.value === ''){
        input_1_y.value = RATE(parseFloat(v_n), parseFloat(v_pmt), parseFloat(v_pv), parseFloat(v_fv), parseFloat(input_type.value), 0);
    }
    if (typeof input_n !== "undefined" && input_n.value === ''){
        input_n.value = NPER(parseFloat(v_y), parseFloat(v_pmt), parseFloat(v_pv), parseFloat(v_fv), parseFloat(input_type.value));
    }
    if (typeof input_pmt !== "undefined" && input_pmt.value === ''){
        console.log(PMT(parseFloat(v_y), parseFloat(v_n), parseFloat(v_pv), parseFloat(v_fv), parseFloat(input_type.value)));
        input_pmt.value = PMT(parseFloat(v_y), parseFloat(v_n), parseFloat(v_pv), parseFloat(v_fv), parseFloat(input_type.value));
    }

}
function clean_data(){
    var input_fv = document.getElementById('input_fv');
    var input_pv = document.getElementById('input_pv');
    var input_1_y = document.getElementById('input_1_y');
    var input_n = document.getElementById('input_n');
    var input_pmt = document.getElementById('input_pmt');
    var input_type = document.getElementById('input_type');

    input_pmt.value = "";
    input_n.value = "";
    input_fv.value = "";
    input_pv.value = "";
    input_1_y.value = "";
    input_type.value = "";
}

function PV (rate, nper, pmt, fv, type) {
    type = typeof type === "undefined" ? 0 : type;
    fv = typeof fv === "undefined" ? 0 : fv;

    if (rate === 0) {
        return -pmt * nper - fv;
    } else {

        var tempVar = type !== 0 ? 1 + rate : 1;
        var tempVar2 = 1 + rate;
        var tempVar3 = Math.pow(tempVar2, nper);

        return -(fv + pmt * tempVar * ((tempVar3 - 1) / rate)) / tempVar3;
    }
};

function NPER(rate, payment, present, future, type) {
    type = (typeof type === 'undefined') ? 0 : type;
    future = (typeof future === 'undefined') ? 0 : future;
    const num = payment * (1 + rate * type) - future * rate;
    const den = (present * rate + payment * (1 + rate * type));
    return Math.log(num / den) / Math.log(1 + rate);
}

function RATE (nper, pmt, pv, fv, type, guess) {
    type = typeof type === "undefined" ? 0 : type;
    fv = typeof fv === "undefined" ? 0 : fv;
    guess = typeof guess === "undefined" ? 0.1 : guess;

    if (nper <= 0) {
        return "Error - invalid Period"
    }

    var epslMax = 0.0000001;
    var step = 0.00001;
    var iterMax = 128;

    var Rate0 = guess;
    var Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);

    var Rate1 = Y0 > 0 ? Rate0 / 2 : Rate0 * 2;
    var Y1 = this.EVALRATE(Rate1, nper, pmt, pv, fv, type);

    var i = 0;

    while (i < iterMax) {
        if (Y1 === Y0) {
            Rate0 = Rate0 < Rate1 ? Rate0 - step : Rate0 - step * -1;

            Y0 = this.EVALRATE(Rate0, nper, pmt, pv, fv, type);
        }

        if (Y1 === Y0) {
            return "#NUM!";
        }

        Rate0 = Rate1 - (Rate1 - Rate0) * Y1 / (Y1 - Y0);
        Y0 = this.EVALRATE(Rate0, nper, pmt, pv, fv, type);

        if (Math.abs(Y0) < epslMax) {
            return Rate0;
        } else {
            var tempVar = Y0;
            Y0 = Y1;
            Y1 = tempVar;
            tempVar = Rate0;
            Rate0 = Rate1;
            Rate1 = tempVar;
        }
        i++;
    }
}

function FV(rate, nper, pmt, pv, type) {
    const pow = Math.pow(1 + rate, nper);
    let fv;

    pv = pv || 0;
    type = type || 0;

    if (rate) {
        fv = (pmt * (1 + rate * type) * ( 1 - pow) / rate) - pv * pow;
    } else {
        fv = -1 * (pv + pmt * nper);
    }
    return fv;
}

function PMT(rate, nper, pv, fv, type) {

    if (!fv) {
        fv = 0;
    }
    if (!type) {
        type = 0;
    }

    if (rate == 0) {
        return -(pv + fv) / nper;
    }

    const pvif = Math.pow(1 + rate, nper);
    let pmt = rate / (pvif - 1) * -(pv * pvif + fv);

    if (type == 1) {
        pmt /= (1 + rate);
    };

    return pmt;
}

function EVALRATE (rate, nper, pmt, pv, fv, type) {
    if (rate === 0) {
        return pv + pmt * nper + fv;
    } else {
        var tempVar3 = rate + 1;
        var tempVar = Math.pow(tempVar3, nper);

        var tempVar2 = type !== 0 ? 1 + rate : 1;

        return pv * tempVar + pmt * tempVar2 * (tempVar - 1) / rate + fv;
    }
};

function clean(name){
    var input = document.getElementById(name);
    input.value = "";
}