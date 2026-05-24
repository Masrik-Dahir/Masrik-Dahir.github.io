/* life.js — 5 lifestyle/misc calcs (96-100) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 96. Wedding / event budget */
window.calcWedding = function(){
    var rows = Array.prototype.map.call($('wd_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'', est:parseFloat(i[1].value)||0, actual:parseFloat(i[2].value)||0};
    }).filter(function(x){return x.name;});
    if (!rows.length) return showErr('wd');
    hideErr('wd');
    var est = rows.reduce(function(s,r){ return s+r.est; },0);
    var act = rows.reduce(function(s,r){ return s+r.actual; },0);
    var guests = FA.num('wd_guests',100);
    var perGuest = act > 0 ? act/guests : est/guests;
    FA.renderStats('wd_stats',[
        {label:'Estimated Total', value:FA.fmtMoney(est)},
        {label:'Spent So Far', value:FA.fmtMoney(act), kind:'warning'},
        {label:'Per Guest', value:FA.fmtMoney(perGuest)},
        {label:'Variance', value:FA.fmtMoney(act-est), kind: act>est?'negative':'positive'}
    ]);
    FA.chart('wd_chart','doughnut',{
        labels:rows.map(function(r){return r.name;}),
        datasets:[{data:rows.map(function(r){return r.est;}),backgroundColor:FA.PALETTE,borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.renderTable('wd_table',['Category','Estimate','Actual','Variance'],
        rows.map(function(r){
            var v = r.actual - r.est;
            return [r.name, FA.fmtMoney(r.est), FA.fmtMoney(r.actual),
                    (v>=0?'+':'')+FA.fmtMoney(v)];
        }),[1,2,3]);
    FA.show('wd_results');
};
window.addWedRow = function(name,est,act){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Category" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Est" value="'+(est||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Actual" value="'+(act||0)+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('wd_rows').appendChild(r);
};

/* 97. Pet age + lifetime cost */
var PET_MULT = {dog_small:5, dog_med:6, dog_large:7, cat:4, rabbit:8, hamster:30};
var PET_LIFESPAN = {dog_small:14, dog_med:12, dog_large:10, cat:15, rabbit:8, hamster:3};
window.calcPet = function(){
    var type = FA.text('pt_type')||'dog_med', age = FA.num('pt_age');
    var annualCost = FA.num('pt_annual',1500);
    if (!isFinite(age)) return showErr('pt');
    hideErr('pt');
    var humanAge = age * (PET_MULT[type]||6);
    var lifespan = PET_LIFESPAN[type]||12;
    var remaining = Math.max(0, lifespan - age);
    var lifetimeCost = annualCost * lifespan;
    var remainingCost = annualCost * remaining;
    FA.renderStats('pt_stats',[
        {label:'Pet Age', value:age+' yr'},
        {label:'Human-equivalent', value:humanAge+' human years'},
        {label:'Expected Lifespan', value:lifespan+' yr', kind:'positive'},
        {label:'Years Remaining', value:remaining.toFixed(1)+' yr'},
        {label:'Lifetime Care Cost', value:FA.fmtMoney(lifetimeCost), kind:'warning'},
        {label:'Remaining Cost', value:FA.fmtMoney(remainingCost)}
    ]);
    var yrs = Array.from({length:Math.ceil(lifespan)+1}, function(_,i){return i;});
    FA.chart('pt_chart','line',{
        labels:yrs.map(function(y){return 'Yr '+y;}),
        datasets:[
            {label:'Cumulative cost',data:yrs.map(function(y){return y*annualCost;}),
             borderColor:'#ef4444',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0},
            {label:'Human-equivalent age',data:yrs.map(function(y){return y*(PET_MULT[type]||6);}),
             borderColor:'#10b981',pointRadius:0,tension:0.3,fill:false,yAxisID:'y1'}
        ]
    },{scales:{y:{position:'left',title:{display:true,text:'$'}},y1:{position:'right',title:{display:true,text:'Human yr'},grid:{drawOnChartArea:false}}}});
    FA.show('pt_results');
};

/* 98. Who-owes-whom settler */
window.calcSettle = function(){
    var expenses = Array.prototype.map.call($('se_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {payer:(i[0].value||'').trim(), amt:parseFloat(i[1].value)||0, desc:i[2].value||''};
    }).filter(function(x){return x.payer && x.amt>0;});
    if (!expenses.length) return showErr('se');
    hideErr('se');
    /* gather unique participants — listed in #se_people */
    var people = ($('se_people').value||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
    if (people.length<2) return showErr('se','Enter at least 2 people (comma-separated).');
    var total = expenses.reduce(function(s,e){ return s+e.amt; },0);
    var share = total/people.length;
    var balance = {};
    people.forEach(function(p){ balance[p] = -share; });
    expenses.forEach(function(e){
        if (balance[e.payer] != null) balance[e.payer] += e.amt;
    });
    /* settle: positives pay negatives */
    var owed = [], owes = [];
    Object.keys(balance).forEach(function(p){
        if (balance[p] > 0.01) owed.push({name:p, amt:balance[p]});
        else if (balance[p] < -0.01) owes.push({name:p, amt:-balance[p]});
    });
    var transfers = [];
    owed.sort(function(a,b){return b.amt-a.amt;});
    owes.sort(function(a,b){return b.amt-a.amt;});
    while (owed.length && owes.length){
        var pay = Math.min(owed[0].amt, owes[0].amt);
        transfers.push({from:owes[0].name, to:owed[0].name, amt:pay});
        owed[0].amt -= pay; owes[0].amt -= pay;
        if (owed[0].amt < 0.01) owed.shift();
        if (owes[0].amt < 0.01) owes.shift();
    }
    FA.renderStats('se_stats',[
        {label:'Total Spent', value:FA.fmtMoney(total)},
        {label:'Fair Share Each', value:FA.fmtMoney(share)},
        {label:'People', value:people.length+''},
        {label:'Transfers Needed', value:transfers.length+''}
    ]);
    FA.renderTable('se_table',['From','→','To','Amount'],
        transfers.map(function(t){ return [t.from, '→', t.to, FA.fmtMoney(t.amt)]; }),[3]);
    FA.chart('se_chart','bar',{
        labels:people,
        datasets:[{label:'Net (positive = owed money, negative = owes)',
            data:people.map(function(p){return balance[p];}),
            backgroundColor:people.map(function(p){return balance[p]>=0?'#10b981':'#ef4444';})}]
    },{plugins:{legend:{display:false}}});
    FA.show('se_results');
};
window.addSettleRow = function(payer,amt,desc){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Payer" value="'+(payer||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" step="0.01" value="'+(amt||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="text" placeholder="What for" value="'+(desc||'')+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('se_rows').appendChild(r);
};

/* 99. Gift / holiday spending planner */
window.calcGifts = function(){
    var rows = Array.prototype.map.call($('gf_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {person:i[0].value||'', budget:parseFloat(i[1].value)||0};
    }).filter(function(x){return x.person && x.budget>0;});
    if (!rows.length) return showErr('gf');
    hideErr('gf');
    var total = rows.reduce(function(s,r){ return s+r.budget; },0);
    var perPerson = total/rows.length;
    FA.renderStats('gf_stats',[
        {label:'Total Budget', value:FA.fmtMoney(total)},
        {label:'People', value:rows.length+''},
        {label:'Average per person', value:FA.fmtMoney(perPerson)},
        {label:'Max gift', value:FA.fmtMoney(Math.max.apply(null,rows.map(function(r){return r.budget;})))}
    ]);
    FA.chart('gf_chart','bar',{
        labels:rows.map(function(r){return r.person;}),
        datasets:[{label:'Budget',data:rows.map(function(r){return r.budget;}),backgroundColor:FA.PALETTE}]
    },{indexAxis:'y',plugins:{legend:{display:false}}});
    FA.show('gf_results');
};
window.addGiftRow = function(person,budget){
    var r = document.createElement('div'); r.className='fa-row';
    r.style.gridTemplateColumns='2fr 1fr auto auto';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Person" value="'+(person||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" value="'+(budget||'')+'"></div>'+
        '<div></div><button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('gf_rows').appendChild(r);
};

/* 100. Carbon footprint */
window.calcCarbon = function(){
    var miles = FA.num('cb_miles'), mpg = FA.num('cb_mpg'),
        kWh = FA.num('cb_kwh'), flights = FA.num('cb_flights'),
        diet = FA.text('cb_diet')||'mixed';
    if (!isFinite(miles)) return showErr('cb');
    hideErr('cb');
    /* CO2 factors (lbs CO2 per unit) */
    var carCO2 = (miles/mpg)*19.6;
    var elecCO2 = kWh*0.92;
    var flightCO2 = flights*1100;     // avg domestic flight
    var dietCO2 = ({meat:8200, mixed:5500, vegetarian:3800, vegan:3000})[diet];
    var total = carCO2 + elecCO2 + flightCO2 + dietCO2;
    var totalTons = total/2204.62;
    var avgUS = 16;     // tons per person US
    FA.renderStats('cb_stats',[
        {label:'Annual CO₂', value:totalTons.toFixed(2)+' tons', kind:totalTons<10?'positive':totalTons<16?'warning':'negative'},
        {label:'vs US avg ('+avgUS+')', value:((totalTons/avgUS-1)*100).toFixed(0)+'%'},
        {label:'Trees to offset', value:Math.round(total/22)},
        {label:'Score', value: totalTons<8?'Excellent': totalTons<14?'Good': totalTons<20?'High':'Very high',
         kind: totalTons<14?'positive':'negative'}
    ]);
    FA.chart('cb_chart','doughnut',{
        labels:['Car','Electricity','Flights','Diet'],
        datasets:[{data:[carCO2,elecCO2,flightCO2,dietCO2],backgroundColor:['#ef4444','#f59e0b','#6366f1','#10b981'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('cb_results');
};

document.addEventListener('DOMContentLoaded', function(){
    addWedRow('Venue',12000,0);
    addWedRow('Catering',8000,0);
    addWedRow('Photography',3500,0);
    addWedRow('Music',1500,0);
    addWedRow('Flowers',1200,0);
    addWedRow('Attire',2500,0);
    addSettleRow('Alice',120,'Dinner');
    addSettleRow('Bob',80,'Gas');
    addSettleRow('Alice',60,'Drinks');
    addGiftRow('Mom',150); addGiftRow('Dad',120); addGiftRow('Sister',80); addGiftRow('Partner',300);
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcWedding(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcPet(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcSettle(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcGifts(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcCarbon(); });
})();
