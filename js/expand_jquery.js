$(document).ready(function () {
    var pairs = [
        { up: ".btn1",  down: ".btn2",  target: "p1" },
        { up: ".btn3",  down: ".btn4",  target: "p34" },
        { up: ".btn5",  down: ".btn6",  target: "p56" },
        { up: ".btn7",  down: ".btn8",  target: "p78" },
        { up: ".btn9",  down: ".btn10", target: "p910" }
    ];

    pairs.forEach(function (pair) {
        $(pair.up).click(function () {
            $(pair.target).slideUp();
        });
        $(pair.down).click(function () {
            $(pair.target).slideDown();
        });
    });
});
