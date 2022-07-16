// function getBrowserSize(){
//     var w, h;
//
//     if(typeof window.innerWidth != 'undefined')
//     {
//         w = window.innerWidth; //other browsers
//         h = window.innerHeight;
//     }
//     else if(typeof document.documentElement != 'undefined' && typeof      document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0)
//     {
//         w =  document.documentElement.clientWidth; //IE
//         h = document.documentElement.clientHeight;
//     }
//     else{
//         w = document.body.clientWidth; //IE
//         h = document.body.clientHeight;
//     }
//     return {'width':w, 'height': h};
// }
//
// function reload(){
//     if(parseInt(getBrowserSize().width) < 1026){
//         document.getElementById("p9").style.display = "none";
//     }
//
// }
// reload()
// setInterval(reload, 5000);