/* loans.js — Loans & Debt calculators (11-20) for web/loans.html */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };

function pmt(rate, n, pv){
    if (rate === 0) return pv / n;
    return pv * rate / (1 - Math.pow(1+rate, -n));
}

/* 11. MORTGAGE WITH AMORTIZATION */
window.calcMortgage = function(){
    var price = FA.num('mtg_price'), down = FA.num('mtg_down',0),
        rate = FA.num('mtg_rate'), yrs = FA.num('mtg_years');
    if (!isFinite(price)||price<=0||!isFinite(rate)||rate<0||!isFinite(yrs)||yrs<=0) return showErr('mtg');
    hideErr('mtg');
    var principal = price - down, r = rate/100/12, n = yrs*12;
    var monthly = pmt(r, n, principal);
    var total = monthly * n, interest = total - principal;
    var schedule = [], bal = principal, yearly = {};
    for (var i = 1; i <= n; i++){
        var int$ = bal * r, prin$ = monthly - int$;
        bal -= prin$;
        var yr = Math.ceil(i/12);
        yearly[yr] = yearly[yr] || {prin:0, int:0, bal:0};
        yearly[yr].prin += prin$; yearly[yr].int += int$; yearly[yr].bal = bal;
    }
    FA.renderStats('mtg_stats', [
        {label:'Monthly Payment', value:FA.fmtMoney(monthly), kind:'warning'},
        {label:'Total Paid', value:FA.fmtMoney(total)},
        {label:'Total Interest', value:FA.fmtMoney(interest), kind:'negative'},
        {label:'Loan Amount', value:FA.fmtMoney(principal)}
    ]);
    var labels=[], prin=[], int_=[], bals=[];
    for (var y = 1; y <= yrs; y++){
        labels.push('Yr '+y); prin.push(yearly[y].prin); int_.push(yearly[y].int); bals.push(yearly[y].bal);
    }
    FA.chart('mtg_chart','bar',{
        labels:labels,
        datasets:[
            {label:'Principal',data:prin,backgroundColor:'#10b981',stack:'s'},
            {label:'Interest',data:int_,backgroundColor:'#ef4444',stack:'s'}
        ]
    },{scales:{x:{stacked:true},y:{stacked:true}}});
    var rows = labels.map(function(l,i){
        return [l, FA.fmtMoney(prin[i]), FA.fmtMoney(int_[i]), FA.fmtMoney(bals[i])];
    });
    FA.renderTable('mtg_table',['Year','Principal','Interest','Balance'],rows,[1,2,3]);
    FA.show('mtg_results');
};

/* 12. EXTRA PAYMENT / EARLY PAYOFF */
window.calcExtraPayment = function(){
    var principal = FA.num('ep_principal'), rate = FA.num('ep_rate'),
        yrs = FA.num('ep_years'), extra = FA.num('ep_extra',0);
    if (!isFinite(principal)||principal<=0||!isFinite(rate)||rate<0||!isFinite(yrs)||yrs<=0) return showErr('ep');
    hideErr('ep');
    var r = rate/100/12, n = yrs*12, monthly = pmt(r,n,principal);
    function run(extra$){
        var bal = principal, months = 0, totInt = 0;
        while (bal > 0.01 && months < n+1){
            months++;
            var int$ = bal*r;
            var pay = Math.min(monthly+extra$, bal+int$);
            bal -= (pay - int$);
            totInt += int$;
        }
        return {months:months, totInt:totInt, totPaid:totInt+principal};
    }
    var base = run(0), with$ = run(extra);
    var saved = base.totInt - with$.totInt, savedMo = base.months - with$.months;
    FA.renderStats('ep_stats',[
        {label:'Standard Payoff', value:FA.fmtDuration(base.months), sub:'Interest: '+FA.fmtMoney(base.totInt)},
        {label:'With Extra '+FA.fmtMoney(extra)+'/mo', value:FA.fmtDuration(with$.months), kind:'positive'},
        {label:'Interest Saved', value:FA.fmtMoney(saved), kind:'positive'},
        {label:'Time Saved', value:FA.fmtDuration(savedMo), kind:'positive'}
    ]);
    FA.chart('ep_chart','bar',{
        labels:['Standard','With extra'],
        datasets:[
            {label:'Principal',data:[principal,principal],backgroundColor:'#10b981',stack:'s'},
            {label:'Interest',data:[base.totInt,with$.totInt],backgroundColor:'#ef4444',stack:'s'}
        ]
    },{scales:{x:{stacked:true},y:{stacked:true}}});
    FA.show('ep_results');
};

/* 13. AUTO LOAN */
window.calcAutoLoan = function(){
    var price = FA.num('al_price'), down = FA.num('al_down',0),
        trade = FA.num('al_trade',0), tax = FA.num('al_tax',0)/100,
        rate = FA.num('al_rate'), yrs = FA.num('al_years');
    if (!isFinite(price)||price<=0||!isFinite(rate)||rate<0||!isFinite(yrs)||yrs<=0) return showErr('al');
    hideErr('al');
    var taxedPrice = price * (1 + tax);
    var principal = taxedPrice - down - trade;
    var r = rate/100/12, n = yrs*12, monthly = pmt(r,n,principal);
    var total = monthly*n, interest = total - principal;
    FA.renderStats('al_stats',[
        {label:'Monthly Payment',value:FA.fmtMoney(monthly),kind:'warning'},
        {label:'Total of Payments',value:FA.fmtMoney(total)},
        {label:'Total Interest',value:FA.fmtMoney(interest),kind:'negative'},
        {label:'Out the Door',value:FA.fmtMoney(taxedPrice)}
    ]);
    FA.chart('al_chart','doughnut',{
        labels:['Vehicle','Tax','Interest'],
        datasets:[{data:[price,price*tax,interest],backgroundColor:['#6366f1','#f59e0b','#ef4444']}]
    },{cutout:'55%'});
    FA.show('al_results');
};

/* 14. STUDENT LOAN */
window.calcStudentLoan = function(){
    var bal = FA.num('sl_balance'), rate = FA.num('sl_rate'),
        yrs = FA.num('sl_years'), incomePct = FA.num('sl_incomePct',0)/100,
        salary = FA.num('sl_salary',0);
    if (!isFinite(bal)||bal<=0||!isFinite(rate)||rate<0||!isFinite(yrs)||yrs<=0) return showErr('sl');
    hideErr('sl');
    var r = rate/100/12, n = yrs*12, std = pmt(r,n,bal);
    var ibrCap = salary * incomePct / 12;
    var ibr = incomePct > 0 ? Math.min(std, ibrCap) : std;
    var totStd = std * n, intStd = totStd - bal;
    var totIbr = ibr * n, intIbr = totIbr - bal;
    FA.renderStats('sl_stats',[
        {label:'Standard /mo', value:FA.fmtMoney(std)},
        {label:'Income-Driven /mo', value:incomePct>0?FA.fmtMoney(ibr):'—',
         sub: incomePct>0?(incomePct*100).toFixed(0)+'% of income capped':'Enter income & %'},
        {label:'Total Interest (Std)', value:FA.fmtMoney(intStd), kind:'negative'},
        {label:'Forgivable After 20yr', value:incomePct>0?FA.fmtMoney(Math.max(0,bal-ibr*Math.min(240,n))):'—',
         kind:'positive', sub:'Public service: 10yr / 120 pmts'}
    ]);
    FA.chart('sl_chart','bar',{
        labels:['Standard','Income-Driven'],
        datasets:[
            {label:'Principal',data:[bal,bal],backgroundColor:'#10b981',stack:'s'},
            {label:'Interest',data:[intStd,intIbr],backgroundColor:'#ef4444',stack:'s'}
        ]
    },{scales:{x:{stacked:true},y:{stacked:true}}});
    FA.show('sl_results');
};

/* 15. CREDIT CARD: SNOWBALL VS AVALANCHE */
window.calcSnowball = function(){
    var rows = Array.prototype.map.call($('cc_rows').querySelectorAll('.fa-row'), function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'Card', bal:parseFloat(i[1].value)||0,
                apr:parseFloat(i[2].value)||0, min:parseFloat(i[3].value)||0};
    }).filter(function(d){ return d.bal>0; });
    var extra = FA.num('cc_extra',0);
    if (!rows.length) return showErr('cc');
    hideErr('cc');
    function simulate(order){
        var debts = JSON.parse(JSON.stringify(rows.sort(order)));
        var months=0, totInt=0;
        while (debts.length && months < 600){
            months++;
            var pool = extra;
            for (var i=0;i<debts.length;i++){
                var d = debts[i];
                var int$ = d.bal*d.apr/100/12; totInt += int$;
                d.bal += int$;
                var pay = Math.min(d.min, d.bal);
                d.bal -= pay;
                pool += (d.min - pay);
            }
            if (debts.length>0){
                debts[0].bal -= Math.min(pool, debts[0].bal);
            }
            debts = debts.filter(function(d){ return d.bal>0.01; });
        }
        return {months:months, totInt:totInt};
    }
    var sb = simulate(function(a,b){ return a.bal-b.bal; });          // snowball
    var av = simulate(function(a,b){ return b.apr-a.apr; });          // avalanche
    FA.renderStats('cc_stats',[
        {label:'Snowball Payoff', value:FA.fmtDuration(sb.months), sub:'Smallest balance first'},
        {label:'Avalanche Payoff', value:FA.fmtDuration(av.months), sub:'Highest APR first'},
        {label:'Snowball Interest', value:FA.fmtMoney(sb.totInt), kind:'warning'},
        {label:'Avalanche Interest', value:FA.fmtMoney(av.totInt), kind:'positive',
         sub:'Saves '+FA.fmtMoney(sb.totInt-av.totInt)+' vs snowball'}
    ]);
    FA.chart('cc_chart','bar',{
        labels:['Snowball','Avalanche'],
        datasets:[
            {label:'Months',data:[sb.months,av.months],backgroundColor:'#6366f1',yAxisID:'y'},
            {label:'Interest $',data:[sb.totInt,av.totInt],backgroundColor:'#ef4444',yAxisID:'y1'}
        ]
    },{scales:{
        y:{position:'left',title:{display:true,text:'Months'}},
        y1:{position:'right',grid:{drawOnChartArea:false},title:{display:true,text:'Interest $'}}
    }});
    FA.show('cc_results');
};
window.addCard = function(name, bal, apr, min){
    var r = document.createElement('div'); r.className='fa-row';
    r.style.gridTemplateColumns = '1.4fr 1fr 1fr 1fr auto';
    r.innerHTML =
        '<div class="fa-input-wrap"><input type="text" placeholder="Card name" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Balance" value="'+(bal||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" step="0.1" placeholder="APR" value="'+(apr||'')+'"><span class="fa-input-suffix">%</span></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Min pmt" value="'+(min||'')+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('cc_rows').appendChild(r);
};

/* 16. DEBT CONSOLIDATION */
window.calcConsolidation = function(){
    var rows = Array.prototype.map.call($('dc_rows').querySelectorAll('.fa-row'), function(r){
        var i = r.querySelectorAll('input');
        return {bal:parseFloat(i[1].value)||0, apr:parseFloat(i[2].value)||0, min:parseFloat(i[3].value)||0};
    }).filter(function(d){ return d.bal>0; });
    var newRate = FA.num('dc_newRate'), newYrs = FA.num('dc_newYears');
    if (!rows.length||!isFinite(newRate)||!isFinite(newYrs)) return showErr('dc');
    hideErr('dc');
    var totBal = rows.reduce(function(s,d){ return s+d.bal; },0);
    var weightedApr = rows.reduce(function(s,d){ return s+d.bal*d.apr; },0)/totBal;
    var curMin = rows.reduce(function(s,d){ return s+d.min; },0);
    var r1 = weightedApr/100/12;
    var curMonths = curMin > 0 && r1 > 0 ? Math.log(curMin/(curMin-totBal*r1))/Math.log(1+r1) : totBal/curMin;
    var curInt = curMin*curMonths - totBal;
    var newR = newRate/100/12, newN = newYrs*12;
    var newPay = pmt(newR,newN,totBal);
    var newInt = newPay*newN - totBal;
    FA.renderStats('dc_stats',[
        {label:'Current Total Balance', value:FA.fmtMoney(totBal)},
        {label:'Weighted APR', value:FA.fmtPercent(weightedApr,2)},
        {label:'Consolidated /mo', value:FA.fmtMoney(newPay), kind: newPay<curMin?'positive':'warning'},
        {label:'Interest Difference', value:FA.fmtMoney(newInt-curInt),
         kind: newInt<curInt?'positive':'negative',
         sub: newInt<curInt?'Saves money':'Costs more'}
    ]);
    FA.chart('dc_chart','bar',{
        labels:['Current','Consolidated'],
        datasets:[
            {label:'Principal',data:[totBal,totBal],backgroundColor:'#10b981',stack:'s'},
            {label:'Interest',data:[curInt,newInt],backgroundColor:'#ef4444',stack:'s'}
        ]
    },{scales:{x:{stacked:true},y:{stacked:true}}});
    FA.show('dc_results');
};

/* 17. REFINANCE BREAK-EVEN */
window.calcRefi = function(){
    var curBal = FA.num('rf_balance'), curRate = FA.num('rf_curRate'),
        curYrs = FA.num('rf_curYearsLeft'), newRate = FA.num('rf_newRate'),
        newYrs = FA.num('rf_newYears'), closing = FA.num('rf_closing',0);
    if (!isFinite(curBal)||curBal<=0) return showErr('rf');
    hideErr('rf');
    var curM = pmt(curRate/100/12, curYrs*12, curBal);
    var newM = pmt(newRate/100/12, newYrs*12, curBal);
    var saved = curM - newM;
    var breakeven = saved > 0 ? closing/saved : Infinity;
    var totSaved = saved*newYrs*12 - closing;
    FA.renderStats('rf_stats',[
        {label:'Current Payment', value:FA.fmtMoney(curM)},
        {label:'Refi Payment', value:FA.fmtMoney(newM), kind: newM<curM?'positive':'negative'},
        {label:'Monthly Savings', value:FA.fmtMoney(saved), kind: saved>0?'positive':'negative'},
        {label:'Break-even', value:isFinite(breakeven)?FA.fmtDuration(breakeven):'Never',
         sub:'Lifetime savings: '+FA.fmtMoney(totSaved)}
    ]);
    var months = newYrs*12;
    var labels=[], curC=[], newC=[];
    for (var i=0;i<=months;i+=Math.max(1,Math.floor(months/24))){
        labels.push(Math.round(i/12*10)/10+' yr');
        curC.push(curM*i);
        newC.push(closing + newM*i);
    }
    FA.chart('rf_chart','line',{
        labels:labels,
        datasets:[
            {label:'Keep current loan',data:curC,borderColor:'#ef4444',pointRadius:0,tension:0.2,fill:false},
            {label:'Refinance (incl. closing)',data:newC,borderColor:'#10b981',pointRadius:0,tension:0.2,fill:false}
        ]
    });
    FA.show('rf_results');
};

/* 18. LOAN AFFORDABILITY */
window.calcAffordability = function(){
    var income = FA.num('af_income'), debts = FA.num('af_debts',0),
        rate = FA.num('af_rate'), yrs = FA.num('af_years'), dti = FA.num('af_dti',36)/100;
    if (!isFinite(income)||income<=0) return showErr('af');
    hideErr('af');
    var monthly = income/12;
    var maxDebtPmt = monthly * dti;
    var availForLoan = Math.max(0, maxDebtPmt - debts);
    var r = rate/100/12, n = yrs*12;
    var maxLoan = availForLoan * (1 - Math.pow(1+r,-n)) / r;
    FA.renderStats('af_stats',[
        {label:'Monthly Income', value:FA.fmtMoney(monthly)},
        {label:'Max Debt Pmt', value:FA.fmtMoney(maxDebtPmt), sub:'At '+(dti*100).toFixed(0)+'% DTI'},
        {label:'Available for Loan /mo', value:FA.fmtMoney(availForLoan), kind:'positive'},
        {label:'Max Loan Amount', value:FA.fmtMoney(maxLoan), kind:'positive',
         sub:'At '+rate+'% for '+yrs+' yr'}
    ]);
    var pcts = [0.28, 0.36, 0.43, 0.50];
    FA.chart('af_chart','bar',{
        labels: pcts.map(function(p){ return (p*100)+'% DTI'; }),
        datasets:[{label:'Max loan',data:pcts.map(function(p){
            var a = Math.max(0,monthly*p - debts);
            return a * (1 - Math.pow(1+r,-n))/r;
        }),backgroundColor:['#10b981','#6366f1','#f59e0b','#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('af_results');
};

/* 19. INTEREST-ONLY VS AMORTIZING */
window.calcInterestOnly = function(){
    var principal = FA.num('io_principal'), rate = FA.num('io_rate'),
        ioYrs = FA.num('io_ioYears'), amYrs = FA.num('io_amYears');
    if (!isFinite(principal)||principal<=0) return showErr('io');
    hideErr('io');
    var r = rate/100/12;
    var ioPay = principal*r;
    var amPay = pmt(r, amYrs*12, principal);
    var ioTotalInt = ioPay*ioYrs*12;       // interest during IO period
    var ioRemainingMonths = (amYrs - ioYrs)*12;
    var afterIoPay = pmt(r, ioRemainingMonths, principal); // balloon-style
    var amTotalInt = amPay*amYrs*12 - principal;
    var ioGrandInt = ioTotalInt + (afterIoPay*ioRemainingMonths - principal);
    FA.renderStats('io_stats',[
        {label:'Interest-Only /mo', value:FA.fmtMoney(ioPay), sub:'During IO period'},
        {label:'After-IO /mo', value:FA.fmtMoney(afterIoPay), kind:'warning', sub:'Jump after '+ioYrs+'yr'},
        {label:'Amortizing /mo', value:FA.fmtMoney(amPay), kind:'positive'},
        {label:'Total Interest (IO vs Am)', value:FA.fmtMoney(ioGrandInt-amTotalInt),
         kind: ioGrandInt>amTotalInt?'negative':'positive',
         sub:'IO costs '+(ioGrandInt>amTotalInt?'more':'less')}
    ]);
    FA.chart('io_chart','bar',{
        labels:['Amortizing','Interest-Only Hybrid'],
        datasets:[
            {label:'Principal repaid',data:[principal,principal],backgroundColor:'#10b981',stack:'s'},
            {label:'Total interest',data:[amTotalInt,ioGrandInt],backgroundColor:'#ef4444',stack:'s'}
        ]
    },{scales:{x:{stacked:true},y:{stacked:true}}});
    FA.show('io_results');
};

/* 20. APR VS APY */
window.calcAprApy = function(){
    var inputRate = FA.num('aa_rate'), nper = FA.num('aa_periods',12);
    var mode = FA.text('aa_mode') || 'aprToApy';
    if (!isFinite(inputRate)||inputRate<0) return showErr('aa');
    hideErr('aa');
    var apr, apy, daily;
    if (mode === 'aprToApy'){
        apr = inputRate/100;
        apy = Math.pow(1+apr/nper, nper) - 1;
        daily = apr/365;
    } else {
        apy = inputRate/100;
        apr = nper * (Math.pow(1+apy, 1/nper) - 1);
        daily = apr/365;
    }
    var amount = 10000;
    var grew = amount * (1+apy);
    FA.renderStats('aa_stats',[
        {label:'APR', value:FA.fmtPercent(apr*100,3)},
        {label:'APY', value:FA.fmtPercent(apy*100,3), kind:'warning'},
        {label:'Daily Rate', value:FA.fmtPercent(daily*100,5)},
        {label:'$10k grows to', value:FA.fmtMoney(grew), kind:'positive', sub:'After 1 yr'}
    ]);
    var labels=[], data=[];
    for (var n=1; n<=365; n*=2){
        labels.push(n+'×/yr');
        data.push((Math.pow(1+apr/n,n)-1)*100);
        if (n > 250) break;
    }
    labels.push('Continuous');
    data.push((Math.exp(apr)-1)*100);
    FA.chart('aa_chart','line',{
        labels:labels,
        datasets:[{label:'Effective APY at varying compounding',data:data,
                   borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.15)',fill:true,tension:0.3}]
    });
    FA.show('aa_results');
};
window.toggleAprApy = function(mode){
    $('aa_mode').value = mode;
    document.querySelectorAll('.aa-tab').forEach(function(b){
        b.classList.toggle('fa-btn', b.dataset.mode === mode);
        b.classList.toggle('fa-btn-ghost', b.dataset.mode !== mode);
    });
};

function showErr(prefix){ $(prefix+'_err').textContent='Fill in all required fields.'; $(prefix+'_err').style.display='block'; $(prefix+'_results').classList.remove('fa-active'); }
function hideErr(prefix){ $(prefix+'_err').style.display='none'; }

document.addEventListener('DOMContentLoaded', function(){
    addCard('Chase Sapphire',5200,21.99,150);
    addCard('Capital One Quicksilver',1800,18.99,75);
    addCard('Discover',3400,24.99,110);
    /* dc rows */
    function addDcRow(name,bal,apr,min){
        var r = document.createElement('div'); r.className='fa-row';
        r.style.gridTemplateColumns = '1.4fr 1fr 1fr 1fr auto';
        r.innerHTML =
            '<div class="fa-input-wrap"><input type="text" placeholder="Debt" value="'+name+'"></div>'+
            '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" value="'+bal+'"></div>'+
            '<div class="fa-input-wrap"><input type="number" step="0.1" value="'+apr+'"><span class="fa-input-suffix">%</span></div>'+
            '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" value="'+min+'"></div>'+
            '<button type="button" class="fa-row-rm">&times;</button>';
        r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
        $('dc_rows').appendChild(r);
    }
    addDcRow('Credit card',10000,22,250);
    addDcRow('Personal loan',8000,12,200);
    addDcRow('Medical',3000,0,100);
    window.addDcRow = addDcRow;
    if ($('aa_mode')) toggleAprApy('aprToApy');
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)',  function(){ window.calcMortgage(); });
FA.example('section.fa-card:nth-of-type(2)',  function(){ window.calcExtraPayment(); });
FA.example('section.fa-card:nth-of-type(3)',  function(){ window.calcAutoLoan(); });
FA.example('section.fa-card:nth-of-type(4)',  function(){ window.calcStudentLoan(); });
FA.example('section.fa-card:nth-of-type(5)',  function(){ window.calcSnowball(); });
FA.example('section.fa-card:nth-of-type(6)',  function(){ window.calcConsolidation(); });
FA.example('section.fa-card:nth-of-type(7)',  function(){ window.calcRefi(); });
FA.example('section.fa-card:nth-of-type(8)',  function(){ window.calcAffordability(); });
FA.example('section.fa-card:nth-of-type(9)',  function(){ window.calcInterestOnly(); });
FA.example('section.fa-card:nth-of-type(10)', function(){ window.calcAprApy(); });
})();
