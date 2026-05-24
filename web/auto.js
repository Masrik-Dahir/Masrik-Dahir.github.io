/* auto.js — 9 automotive/travel calcs (75-83) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 75. Trip fuel cost (gas vs EV) */
window.calcTripCost = function(){
    var miles = FA.num('tf_miles'), mpg = FA.num('tf_mpg'), gasP = FA.num('tf_gasPrice'),
        mpkWh = FA.num('tf_mpkwh'), kwhP = FA.num('tf_kwhPrice');
    if (!isFinite(miles)) return showErr('tf');
    hideErr('tf');
    var gasGals = miles/mpg, gasCost = gasGals*gasP;
    var ev_kWh = miles/mpkWh, evCost = ev_kWh*kwhP;
    FA.renderStats('tf_stats',[
        {label:'Gas Cost', value:FA.fmtMoney(gasCost), sub:gasGals.toFixed(2)+' gal', kind:'warning'},
        {label:'EV Cost', value:FA.fmtMoney(evCost), sub:ev_kWh.toFixed(2)+' kWh', kind:'positive'},
        {label:'Savings (EV)', value:FA.fmtMoney(gasCost-evCost), kind:'positive'},
        {label:'Per Mile', value:FA.fmtMoney(gasCost/miles,{digits:3})+' gas / '+FA.fmtMoney(evCost/miles,{digits:3})+' EV'}
    ]);
    FA.chart('tf_chart','bar',{
        labels:['Gas','EV'],
        datasets:[{data:[gasCost,evCost],backgroundColor:['#ef4444','#10b981']}]
    },{plugins:{legend:{display:false}}});
    FA.show('tf_results');
};

/* 76. EV charging & range */
window.calcEV = function(){
    var battery = FA.num('ev_battery'), efficiency = FA.num('ev_efficiency'),
        chargeKw = FA.num('ev_chargeKw'), kwhPrice = FA.num('ev_kwhPrice');
    if (!isFinite(battery)||!isFinite(efficiency)) return showErr('ev');
    hideErr('ev');
    var range = battery/efficiency*1000;     // miles
    var fullChargeTime = battery/chargeKw;
    var fullCost = battery*kwhPrice;
    FA.renderStats('ev_stats',[
        {label:'Range (full)', value:range.toFixed(0)+' mi'},
        {label:'0→100% Time', value:fullChargeTime.toFixed(1)+' hr'},
        {label:'Full Charge Cost', value:FA.fmtMoney(fullCost), kind:'positive'},
        {label:'$/mile', value:FA.fmtMoney(fullCost/range,{digits:3})}
    ]);
    FA.show('ev_results');
};

/* 77. Lease vs buy */
window.calcLease = function(){
    var price = FA.num('lb_price'), buyDown = FA.num('lb_buyDown',0),
        rate = FA.num('lb_rate')/100, buyTerm = FA.num('lb_buyTerm'),
        leaseDown = FA.num('lb_leaseDown',0), leaseMo = FA.num('lb_leaseMo'),
        leaseTerm = FA.num('lb_leaseTerm'), residual = FA.num('lb_residual')/100;
    if (!isFinite(price)) return showErr('lb');
    hideErr('lb');
    var buyLoan = price - buyDown;
    var r = rate/12, n = buyTerm*12;
    var buyMo = buyLoan*r/(1-Math.pow(1+r,-n));
    var buyTotal = buyMo*n + buyDown;
    var buyEquity = price * (1 - residual);     // crude depreciation
    var leaseTotal = leaseMo*leaseTerm*12 + leaseDown;
    FA.renderStats('lb_stats',[
        {label:'Buy /mo', value:FA.fmtMoney(buyMo)},
        {label:'Buy Total Out-of-Pocket', value:FA.fmtMoney(buyTotal)},
        {label:'Lease Total ('+leaseTerm+'yr)', value:FA.fmtMoney(leaseTotal)},
        {label:'Equity at term-end (buy)', value:FA.fmtMoney(price*residual), kind:'positive'}
    ]);
    FA.chart('lb_chart','bar',{
        labels:['Buy '+buyTerm+'yr','Lease '+leaseTerm+'yr'],
        datasets:[{label:'Total cost',data:[buyTotal,leaseTotal],backgroundColor:['#10b981','#f59e0b']}]
    },{plugins:{legend:{display:false}}});
    FA.show('lb_results');
};

/* 78. True cost of ownership */
window.calcTCO = function(){
    var price = FA.num('tc_price'), yrs = FA.num('tc_years'),
        mpg = FA.num('tc_mpg'), miles = FA.num('tc_miles'),
        gas = FA.num('tc_gasPrice'),
        ins = FA.num('tc_ins'), maint = FA.num('tc_maint'),
        depPct = FA.num('tc_dep',15)/100;
    if (!isFinite(price)) return showErr('tc');
    hideErr('tc');
    var depreciation = price * (1 - Math.pow(1-depPct, yrs));
    var fuel = (miles/mpg)*gas*yrs;
    var totIns = ins*yrs;
    var totMaint = maint*yrs;
    var total = depreciation + fuel + totIns + totMaint;
    FA.renderStats('tc_stats',[
        {label:'Depreciation', value:FA.fmtMoney(depreciation), kind:'negative'},
        {label:'Fuel ('+yrs+'yr)', value:FA.fmtMoney(fuel)},
        {label:'Insurance', value:FA.fmtMoney(totIns)},
        {label:'Maintenance', value:FA.fmtMoney(totMaint)},
        {label:'Total Cost', value:FA.fmtMoney(total), kind:'warning'},
        {label:'Per Mile', value:FA.fmtMoney(total/(miles*yrs),{digits:3}), kind:'warning'}
    ]);
    FA.chart('tc_chart','doughnut',{
        labels:['Depreciation','Fuel','Insurance','Maintenance'],
        datasets:[{data:[depreciation,fuel,totIns,totMaint],backgroundColor:['#ef4444','#f59e0b','#6366f1','#10b981'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('tc_results');
};

/* 79. Road trip planner */
window.calcRoadTrip = function(){
    var miles = FA.num('rt_miles'), avgSpeed = FA.num('rt_speed',60),
        mpg = FA.num('rt_mpg'), gas = FA.num('rt_gas'),
        nights = FA.num('rt_nights',0), perNight = FA.num('rt_perNight',120),
        food = FA.num('rt_food',60), days = FA.num('rt_days',1);
    if (!isFinite(miles)) return showErr('rt');
    hideErr('rt');
    var driveHrs = miles/avgSpeed;
    var fuelCost = (miles/mpg)*gas;
    var lodging = nights*perNight;
    var foodTotal = food*days;
    var total = fuelCost + lodging + foodTotal;
    FA.renderStats('rt_stats',[
        {label:'Drive Time', value:driveHrs.toFixed(1)+' hr'},
        {label:'Fuel', value:FA.fmtMoney(fuelCost)},
        {label:'Lodging', value:FA.fmtMoney(lodging)},
        {label:'Food', value:FA.fmtMoney(foodTotal)},
        {label:'Total', value:FA.fmtMoney(total), kind:'warning'}
    ]);
    FA.chart('rt_chart','doughnut',{
        labels:['Fuel','Lodging','Food'],
        datasets:[{data:[fuelCost,lodging,foodTotal],backgroundColor:['#ef4444','#6366f1','#10b981'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('rt_results');
};

/* 80. Currency converter (manual rate) */
window.calcCurrency = function(){
    var amt = FA.num('cu_amount'), rate = FA.num('cu_rate');
    if (!isFinite(amt)||!isFinite(rate)) return showErr('cu');
    hideErr('cu');
    var converted = amt*rate;
    var fee2 = converted*0.98;
    var fee35 = converted*0.965;
    FA.renderStats('cu_stats',[
        {label:'Mid-Market Rate', value:converted.toFixed(2)},
        {label:'With 2% Fee', value:fee2.toFixed(2), kind:'warning'},
        {label:'With 3.5% Fee', value:fee35.toFixed(2), kind:'negative'},
        {label:'Inverse Rate', value:(1/rate).toFixed(4)}
    ]);
    var fees = [0,1,2,3,4,5];
    FA.chart('cu_chart','bar',{
        labels:fees.map(function(f){return f+'%';}),
        datasets:[{label:'After fee',data:fees.map(function(f){return converted*(1-f/100);}),backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('cu_results');
};

/* 81. Time-zone meeting planner */
window.calcTimezone = function(){
    var t = FA.text('tz_time'), tzA = FA.num('tz_offsetA',0), tzB = FA.num('tz_offsetB',0);
    if (!t) return showErr('tz');
    hideErr('tz');
    var parts = t.split(':');
    var min = parseInt(parts[0])*60 + parseInt(parts[1]);
    var diff = (tzB - tzA)*60;
    var bMin = (min + diff + 24*60) % (24*60);
    var bH = Math.floor(bMin/60), bM = bMin%60;
    var bestStart = 14, bestEnd = 18; // 9am-1pm in offset 0 → 14:00-18:00 UTC roughly
    FA.renderStats('tz_stats',[
        {label:'Your time', value:t, sub:'UTC'+(tzA>=0?'+':'')+tzA},
        {label:'Their time', value:('0'+bH).slice(-2)+':'+('0'+bM).slice(-2), kind:'positive', sub:'UTC'+(tzB>=0?'+':'')+tzB},
        {label:'Time difference', value:diff/60+' hr'}
    ]);
    var hrs = Array.from({length:24},function(_,i){return i;});
    FA.chart('tz_chart','bar',{
        labels:hrs.map(function(h){return ('0'+h).slice(-2)+':00';}),
        datasets:[{label:'Working hours overlap (9-18)',
            data:hrs.map(function(h){
                var their = (h + (tzB-tzA) + 24)%24;
                return (h>=9&&h<18 && their>=9&&their<18) ? 1 : 0;
            }),backgroundColor:'#10b981'}]
    },{plugins:{legend:{display:false}},scales:{y:{display:false}}});
    FA.show('tz_results');
};

/* 82. Points / miles value */
window.calcPoints = function(){
    var points = FA.num('pt_points'), cashValue = FA.num('pt_cashValue'),
        targetCpp = FA.num('pt_targetCpp',1.5);
    if (!isFinite(points)) return showErr('pt');
    hideErr('pt');
    var cpp = cashValue / (points/100);     // cents per point
    var perceived = points * targetCpp/100;
    var fairValueBenchmark = points * 0.015;     // 1.5cpp benchmark
    FA.renderStats('pt_stats',[
        {label:'Points', value:FA.fmtNumber(points)},
        {label:'Cash Equivalent', value:FA.fmtMoney(cashValue)},
        {label:'Effective CPP', value:cpp.toFixed(2)+'¢', kind:cpp>=1.5?'positive':'warning'},
        {label:'At Target ('+targetCpp+'cpp)', value:FA.fmtMoney(perceived)}
    ]);
    var cppRange = [0.5,1.0,1.5,2.0,2.5,3.0];
    FA.chart('pt_chart','bar',{
        labels:cppRange.map(function(c){return c+'¢';}),
        datasets:[{label:'Value $',data:cppRange.map(function(c){return points*c/100;}),backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('pt_results');
};

/* 83. Tip by country */
var TIP_TABLE = {
    'United States':18, 'Canada':15, 'Mexico':10, 'Brazil':10,
    'United Kingdom':10, 'France':5, 'Germany':10, 'Italy':10,
    'Spain':10, 'Japan':0, 'China':0, 'India':10,
    'Australia':10, 'United Arab Emirates':10, 'Turkey':10, 'Greece':10
};
window.calcTipCountry = function(){
    var bill = FA.num('ti_bill'), country = FA.text('ti_country'), people = FA.num('ti_people',1);
    if (!isFinite(bill)) return showErr('ti');
    hideErr('ti');
    var customary = TIP_TABLE[country] || 15;
    var tip = bill*customary/100;
    var total = bill + tip;
    FA.renderStats('ti_stats',[
        {label:'Country', value:country, sub:'Customary '+customary+'%'},
        {label:'Tip', value:FA.fmtMoney(tip), kind:'warning'},
        {label:'Total', value:FA.fmtMoney(total), kind:'positive'},
        {label:'Per Person ('+people+')', value:FA.fmtMoney(total/people)}
    ]);
    var countries = Object.keys(TIP_TABLE);
    FA.chart('ti_chart','bar',{
        labels:countries,
        datasets:[{label:'Customary tip %',data:countries.map(function(c){return TIP_TABLE[c];}),
                   backgroundColor:countries.map(function(c){return c===country?'#ef4444':'#6366f1';})}]
    },{indexAxis:'y',plugins:{legend:{display:false}}});
    FA.show('ti_results');
};

document.addEventListener('DOMContentLoaded', function(){
    var sel = $('ti_country');
    if (sel){
        Object.keys(TIP_TABLE).forEach(function(c){
            var o = document.createElement('option'); o.value=c; o.textContent=c;
            if (c==='United States') o.selected=true;
            sel.appendChild(o);
        });
    }
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcTripCost(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcEV(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcLease(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcTCO(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcRoadTrip(); });
FA.example('section.fa-card:nth-of-type(6)', function(){ window.calcCurrency(); });
FA.example('section.fa-card:nth-of-type(7)', function(){ window.calcTimezone(); });
FA.example('section.fa-card:nth-of-type(8)', function(){ window.calcPoints(); });
FA.example('section.fa-card:nth-of-type(9)', function(){ window.calcTipCountry(); });
})();
