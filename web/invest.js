/* invest.js — Investing & Retirement calculators (21-32). */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,msg){ $(p+'_err').textContent=msg||'Fill in all required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 21. COMPOUND INTEREST */
window.calcCompound = function(){
    var p = FA.num('ci_principal'), c = FA.num('ci_contrib',0), r = FA.num('ci_rate')/100,
        y = FA.num('ci_years'), n = FA.num('ci_freq',12);
    if (!isFinite(p)||p<0||!isFinite(r)||!isFinite(y)||y<=0) return showErr('ci');
    hideErr('ci');
    var perPeriod = r/n;
    var labels=[], bal=[], contribs=[], curBal=p, totC=p;
    for (var i=0; i<=y; i++){
        labels.push(i+' yr');
        bal.push(curBal); contribs.push(totC);
        for (var k=0; k<n && i<y; k++){
            curBal = curBal*(1+perPeriod) + c;
            totC += c;
        }
    }
    FA.renderStats('ci_stats',[
        {label:'Starting', value:FA.fmtMoney(p)},
        {label:'Total Contributed', value:FA.fmtMoney(totC)},
        {label:'Final Balance', value:FA.fmtMoney(curBal), kind:'positive'},
        {label:'Interest Earned', value:FA.fmtMoney(curBal-totC), kind:'positive'}
    ]);
    FA.chart('ci_chart','line',{
        labels:labels,
        datasets:[
            {label:'Contributions',data:contribs,borderColor:'#ef4444',backgroundColor:'rgba(99,102,241,0.10)',fill:true,tension:0.3,pointRadius:0},
            {label:'Balance',data:bal,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('ci_results');
};

/* 22. RETIREMENT PROJECTOR */
window.calcRetirement = function(){
    var age = FA.num('rp_age'), retire = FA.num('rp_retire'),
        salary = FA.num('rp_salary'), pct = FA.num('rp_pct')/100,
        match = FA.num('rp_match')/100, cap = FA.num('rp_cap')/100,
        cur = FA.num('rp_current',0), rate = FA.num('rp_rate')/100;
    if (!isFinite(age)||!isFinite(retire)||retire<=age) return showErr('rp');
    hideErr('rp');
    var yrs = retire - age;
    var employee = salary * pct;
    var employer = salary * Math.min(pct, cap) * match;
    var annualContrib = employee + employer;
    var bal = cur;
    var labels=[], bals=[], pure=[];
    for (var i=0; i<=yrs; i++){
        labels.push((age+i)+' y');
        bals.push(bal);
        pure.push(cur + annualContrib*i);
        bal = bal*(1+rate) + annualContrib;
    }
    var withdraw4 = bals[bals.length-1] * 0.04;
    FA.renderStats('rp_stats',[
        {label:'Years to Retirement', value:yrs+''},
        {label:'Annual Contribution', value:FA.fmtMoney(annualContrib), sub:'Includes '+FA.fmtMoney(employer)+' employer match'},
        {label:'Projected Balance @ '+retire, value:FA.fmtMoney(bals[bals.length-1]), kind:'positive'},
        {label:'Safe Annual Withdrawal', value:FA.fmtMoney(withdraw4), kind:'positive', sub:'4% rule'}
    ]);
    FA.chart('rp_chart','line',{
        labels:labels,
        datasets:[
            {label:'Contributions only',data:pure,borderColor:'#ef4444',pointRadius:0,tension:0.3,fill:false},
            {label:'With investment growth',data:bals,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('rp_results');
};

/* 23. FIRE */
window.calcFire = function(){
    var income = FA.num('fi_income'), exp = FA.num('fi_exp'),
        cur = FA.num('fi_current',0), rate = FA.num('fi_rate')/100;
    if (!isFinite(income)||!isFinite(exp)||exp>=income) return showErr('fi','Expenses must be below income.');
    hideErr('fi');
    var save = income - exp;
    var savingsRate = save/income;
    var fireNumber = exp * 25;
    var leanFire = exp * 0.7 * 25;
    var fatFire  = exp * 1.5 * 25;
    var bal = cur, yrs = 0;
    while (bal < fireNumber && yrs < 100){
        bal = bal*(1+rate) + save; yrs++;
    }
    var labels=[], bals=[]; var b=cur;
    for (var i=0; i<=Math.min(yrs+5,60); i++){
        labels.push(i+' yr'); bals.push(b);
        b = b*(1+rate)+save;
    }
    FA.renderStats('fi_stats',[
        {label:'Savings Rate', value:FA.fmtPercent(savingsRate*100,1), kind:savingsRate>0.5?'positive':'warning'},
        {label:'FIRE Number', value:FA.fmtMoney(fireNumber), sub:'25× annual expenses'},
        {label:'Years to FIRE', value:yrs+' yr', kind:'positive'},
        {label:'Lean / Fat FIRE', value:FA.fmtMoney(leanFire)+' / '+FA.fmtMoney(fatFire)}
    ]);
    FA.chart('fi_chart','line',{
        labels:labels,
        datasets:[
            {label:'Portfolio',data:bals,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0},
            {label:'FIRE target',data:labels.map(function(){return fireNumber;}),borderColor:'#6366f1',borderDash:[6,4],pointRadius:0,fill:false}
        ]
    });
    FA.show('fi_results');
};

/* 24. DOLLAR-COST AVERAGING */
window.calcDCA = function(){
    var perMo = FA.num('dc_perMo'), yrs = FA.num('dc_years'),
        start = FA.num('dc_start'), end = FA.num('dc_end'),
        vol = FA.num('dc_vol',20)/100;
    if (!isFinite(perMo)||!isFinite(yrs)||!isFinite(start)||!isFinite(end)) return showErr('dc');
    hideErr('dc');
    var n = yrs*12, shares = 0, totIn = 0;
    var labels=[], values=[], invested=[];
    var p = start;
    var growth = Math.pow(end/start, 1/n);
    for (var i=0; i<=n; i++){
        if (i>0){
            var jitter = 1 + (Math.sin(i*0.7)+Math.cos(i*1.3))*vol*0.5;
            p = start * Math.pow(growth, i) * jitter;
            shares += perMo / p;
            totIn += perMo;
        }
        if (i%6===0 || i===n){
            labels.push((i/12).toFixed(1)+' yr');
            values.push(shares * p);
            invested.push(totIn);
        }
    }
    var finalVal = shares * p;
    var roi = (finalVal/totIn - 1)*100;
    FA.renderStats('dc_stats',[
        {label:'Invested', value:FA.fmtMoney(totIn)},
        {label:'Shares Owned', value:FA.fmtNumber(shares,2)},
        {label:'Final Value', value:FA.fmtMoney(finalVal), kind:finalVal>totIn?'positive':'negative'},
        {label:'Return', value:FA.fmtPercent(roi,1), kind:roi>0?'positive':'negative'}
    ]);
    FA.chart('dc_chart','line',{
        labels:labels,
        datasets:[
            {label:'Total invested',data:invested,borderColor:'#ef4444',pointRadius:0,tension:0.3,fill:false},
            {label:'Portfolio value',data:values,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('dc_results');
};

/* 25. ALLOCATION VISUALIZER */
window.calcAllocation = function(){
    var rows = Array.prototype.map.call($('pa_rows').querySelectorAll('.fa-row'), function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'', target:parseFloat(i[1].value)||0, actual:parseFloat(i[2].value)||0};
    }).filter(function(d){ return d.name; });
    if (!rows.length) return showErr('pa');
    hideErr('pa');
    var sumActual = rows.reduce(function(s,r){ return s+r.actual; },0);
    rows.forEach(function(r){ r.actualPct = sumActual>0 ? r.actual/sumActual*100 : 0; });
    rows.forEach(function(r){ r.drift = r.actualPct - r.target; });
    FA.renderStats('pa_stats',[
        {label:'Total Portfolio', value:FA.fmtMoney(sumActual)},
        {label:'Assets', value:rows.length+''},
        {label:'Max Drift', value:FA.fmtPercent(Math.max.apply(null,rows.map(function(r){return Math.abs(r.drift);})),1)+'%',
         kind:'warning'}
    ]);
    FA.chart('pa_chart','doughnut',{
        labels:rows.map(function(r){return r.name;}),
        datasets:[{data:rows.map(function(r){return r.actual;}),
                   backgroundColor:FA.PALETTE,borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.renderTable('pa_table',
        ['Asset','Target %','Actual %','Drift','Action'],
        rows.map(function(r){
            return [r.name, r.target.toFixed(1)+'%', r.actualPct.toFixed(1)+'%',
                    (r.drift>=0?'+':'')+r.drift.toFixed(1)+'%',
                    Math.abs(r.drift)<2?'OK':r.drift>0?'Trim':'Buy'];
        }),[1,2,3]);
    FA.show('pa_results');
};
window.addAllocation = function(name,target,actual){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Asset" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" step="0.1" placeholder="Target" value="'+(target||'')+'"><span class="fa-input-suffix">%</span></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Value" value="'+(actual||'')+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('pa_rows').appendChild(r);
};

/* 26. DRIP CALCULATOR */
window.calcDrip = function(){
    var shares = FA.num('dp_shares'), price = FA.num('dp_price'),
        dividend = FA.num('dp_div'), growth = FA.num('dp_divGrowth',5)/100,
        priceGrow = FA.num('dp_priceGrow',7)/100, yrs = FA.num('dp_years');
    if (!isFinite(shares)||shares<=0||!isFinite(price)||!isFinite(dividend)) return showErr('dp');
    hideErr('dp');
    var s = shares, p = price, d = dividend, totDiv=0;
    var labels=[], values=[], divsOnly=[];
    for (var y=0; y<=yrs; y++){
        labels.push(y+' yr');
        values.push(s*p);
        divsOnly.push(totDiv);
        if (y<yrs){
            var divAmt = s*d;
            totDiv += divAmt;
            s += divAmt/p;
            p *= (1+priceGrow);
            d *= (1+growth);
        }
    }
    FA.renderStats('dp_stats',[
        {label:'Starting Shares', value:FA.fmtNumber(shares,2)},
        {label:'Ending Shares', value:FA.fmtNumber(s,2), kind:'positive'},
        {label:'Total Dividends', value:FA.fmtMoney(totDiv), kind:'positive'},
        {label:'Final Portfolio', value:FA.fmtMoney(s*p), kind:'positive'}
    ]);
    FA.chart('dp_chart','line',{
        labels:labels,
        datasets:[
            {label:'Total dividends',data:divsOnly,borderColor:'#f59e0b',pointRadius:0,tension:0.3,fill:false},
            {label:'Portfolio value',data:values,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('dp_results');
};

/* 27. ROTH VS TRADITIONAL */
window.calcRoth = function(){
    var contrib = FA.num('ri_contrib'), yrs = FA.num('ri_years'),
        rate = FA.num('ri_rate')/100, taxNow = FA.num('ri_taxNow')/100, taxRet = FA.num('ri_taxRet')/100;
    if (!isFinite(contrib)||contrib<=0) return showErr('ri');
    hideErr('ri');
    /* Traditional: contribute pre-tax, taxed on withdrawal */
    var trBal = 0;
    for (var i=0;i<yrs;i++) trBal = trBal*(1+rate) + contrib;
    var trAfterTax = trBal * (1 - taxRet);
    /* Roth: contribute post-tax, withdraw tax-free */
    var roContrib = contrib * (1 - taxNow);
    var roBal = 0;
    for (var j=0;j<yrs;j++) roBal = roBal*(1+rate) + roContrib;
    var winner = roBal > trAfterTax ? 'Roth' : 'Traditional';
    FA.renderStats('ri_stats',[
        {label:'Traditional Balance', value:FA.fmtMoney(trBal)},
        {label:'Traditional After-tax', value:FA.fmtMoney(trAfterTax)},
        {label:'Roth Balance (= take-home)', value:FA.fmtMoney(roBal), kind:winner==='Roth'?'positive':'warning'},
        {label:'Better Option', value:winner, kind:'positive',
         sub:'Wins by '+FA.fmtMoney(Math.abs(roBal-trAfterTax))}
    ]);
    FA.chart('ri_chart','bar',{
        labels:['Traditional pre-tax','Traditional after-tax','Roth (already taxed)'],
        datasets:[{data:[trBal,trAfterTax,roBal],backgroundColor:['#6366f1','#f59e0b','#10b981']}]
    },{plugins:{legend:{display:false}}});
    FA.show('ri_results');
};

/* 28. RULE OF 72 */
window.calcRule72 = function(){
    var rate = FA.num('r72_rate');
    if (!isFinite(rate)||rate<=0) return showErr('r72');
    hideErr('r72');
    var rule72 = 72/rate;
    var actual = Math.log(2)/Math.log(1+rate/100);
    var rates = [1,2,3,5,7,8,10,12,15,20];
    FA.renderStats('r72_stats',[
        {label:'Rule of 72', value:rule72.toFixed(2)+' yr'},
        {label:'Actual (exact)', value:actual.toFixed(2)+' yr'},
        {label:'Approximation Error', value:Math.abs(rule72-actual).toFixed(3)+' yr'}
    ]);
    FA.chart('r72_chart','line',{
        labels:rates.map(function(r){return r+'%';}),
        datasets:[
            {label:'Rule of 72',data:rates.map(function(r){return 72/r;}),borderColor:'#6366f1',pointRadius:3,tension:0.2,fill:false},
            {label:'Actual',data:rates.map(function(r){return Math.log(2)/Math.log(1+r/100);}),borderColor:'#10b981',pointRadius:3,tension:0.2,fill:false}
        ]
    });
    FA.show('r72_results');
};

/* 29. POSITION SIZE */
window.calcPosSize = function(){
    var account = FA.num('ps_account'), riskPct = FA.num('ps_riskPct')/100,
        entry = FA.num('ps_entry'), stop = FA.num('ps_stop');
    if (!isFinite(account)||!isFinite(entry)||!isFinite(stop)||entry===stop) return showErr('ps');
    hideErr('ps');
    var riskDollars = account * riskPct;
    var riskPerShare = Math.abs(entry - stop);
    var shares = Math.floor(riskDollars / riskPerShare);
    var positionSize = shares * entry;
    var pctOfAccount = positionSize/account*100;
    FA.renderStats('ps_stats',[
        {label:'Risk Budget', value:FA.fmtMoney(riskDollars)},
        {label:'Risk per Share', value:FA.fmtMoney(riskPerShare,{digits:2})},
        {label:'Position Size', value:shares+' shares ('+FA.fmtMoney(positionSize)+')'},
        {label:'% of Account', value:FA.fmtPercent(pctOfAccount,1), kind:pctOfAccount>50?'warning':'positive'}
    ]);
    FA.chart('ps_chart','bar',{
        labels:['Account','Position Size','Risk Budget'],
        datasets:[{data:[account,positionSize,riskDollars],backgroundColor:['#6366f1','#10b981','#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('ps_results');
};

/* 30. CRYPTO P&L */
window.calcCrypto = function(){
    var buyP = FA.num('cp_buyPrice'), qty = FA.num('cp_qty'),
        sellP = FA.num('cp_sellPrice'), fee = FA.num('cp_fee',0.5)/100;
    if (!isFinite(buyP)||!isFinite(qty)||!isFinite(sellP)) return showErr('cp');
    hideErr('cp');
    var costBasis = buyP*qty*(1+fee);
    var proceeds = sellP*qty*(1-fee);
    var pl = proceeds - costBasis;
    var pct = pl/costBasis*100;
    FA.renderStats('cp_stats',[
        {label:'Cost Basis', value:FA.fmtMoney(costBasis)},
        {label:'Proceeds', value:FA.fmtMoney(proceeds)},
        {label:'P/L', value:(pl>=0?'+':'')+FA.fmtMoney(pl), kind:pl>=0?'positive':'negative'},
        {label:'Return', value:(pct>=0?'+':'')+pct.toFixed(2)+'%', kind:pct>=0?'positive':'negative'}
    ]);
    FA.chart('cp_chart','bar',{
        labels:['Bought','Sold','Net P/L'],
        datasets:[{data:[costBasis,proceeds,pl],backgroundColor:['#6366f1','#10b981',pl>=0?'#10b981':'#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('cp_results');
};

/* 31. ANNUITY PAYOUT */
window.calcAnnuity = function(){
    var bal = FA.num('an_balance'), rate = FA.num('an_rate')/100,
        yrs = FA.num('an_years');
    if (!isFinite(bal)||!isFinite(rate)||!isFinite(yrs)||yrs<=0) return showErr('an');
    hideErr('an');
    var r = rate/12, n = yrs*12;
    var pmt = bal*r/(1-Math.pow(1+r,-n));
    var pmtYr = pmt*12;
    FA.renderStats('an_stats',[
        {label:'Monthly Payout', value:FA.fmtMoney(pmt)},
        {label:'Annual Payout', value:FA.fmtMoney(pmtYr)},
        {label:'Total Received', value:FA.fmtMoney(pmt*n)},
        {label:'Total Interest', value:FA.fmtMoney(pmt*n - bal), kind:'positive'}
    ]);
    var labels=[], bals=[]; var b=bal;
    for (var i=0;i<=yrs;i++){
        labels.push(i+' yr');
        bals.push(b);
        for (var k=0;k<12;k++) b = b*(1+r) - pmt;
    }
    FA.chart('an_chart','line',{
        labels:labels,
        datasets:[{label:'Remaining balance',data:bals,borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.15)',fill:true,tension:0.3,pointRadius:0}]
    });
    FA.show('an_results');
};

/* 32. FEE DRAG */
window.calcFeeDrag = function(){
    var p = FA.num('fd_principal'), c = FA.num('fd_contrib',0),
        yrs = FA.num('fd_years'), gross = FA.num('fd_gross')/100,
        fee = FA.num('fd_fee')/100;
    if (!isFinite(p)||!isFinite(yrs)||!isFinite(gross)) return showErr('fd');
    hideErr('fd');
    function project(returnRate){
        var bal = p; var arr=[bal];
        for (var i=0;i<yrs;i++){
            bal = bal*(1+returnRate) + c*12;
            arr.push(bal);
        }
        return arr;
    }
    var noFee = project(gross);
    var withFee = project(gross - fee);
    var lost = noFee[yrs] - withFee[yrs];
    var pctLost = lost / noFee[yrs] * 100;
    FA.renderStats('fd_stats',[
        {label:'No-fee balance', value:FA.fmtMoney(noFee[yrs]), kind:'positive'},
        {label:'After '+(fee*100).toFixed(2)+'% fee', value:FA.fmtMoney(withFee[yrs])},
        {label:'Lost to Fees', value:FA.fmtMoney(lost), kind:'negative'},
        {label:'% of Wealth Lost', value:pctLost.toFixed(1)+'%', kind:'negative'}
    ]);
    var labels = noFee.map(function(_,i){ return i+' yr'; });
    FA.chart('fd_chart','line',{
        labels:labels,
        datasets:[
            {label:'No fees',data:noFee,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0},
            {label:'With '+(fee*100).toFixed(2)+'% fee',data:withFee,borderColor:'#ef4444',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('fd_results');
};

document.addEventListener('DOMContentLoaded', function(){
    addAllocation('US Stocks',60,42000);
    addAllocation('Intl Stocks',20,11000);
    addAllocation('Bonds',15,8500);
    addAllocation('Cash',5,3000);
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)',  function(){ window.calcCompound(); });
FA.example('section.fa-card:nth-of-type(2)',  function(){ window.calcRetirement(); });
FA.example('section.fa-card:nth-of-type(3)',  function(){ window.calcFire(); });
FA.example('section.fa-card:nth-of-type(4)',  function(){ window.calcDCA(); });
FA.example('section.fa-card:nth-of-type(5)',  function(){ window.calcAllocation(); });
FA.example('section.fa-card:nth-of-type(6)',  function(){ window.calcDrip(); });
FA.example('section.fa-card:nth-of-type(7)',  function(){ window.calcRoth(); });
FA.example('section.fa-card:nth-of-type(8)',  function(){ window.calcPosSize(); });
FA.example('section.fa-card:nth-of-type(9)',  function(){ window.calcCrypto(); });
FA.example('section.fa-card:nth-of-type(10)', function(){ window.calcAnnuity(); });
FA.example('section.fa-card:nth-of-type(11)', function(){ window.calcFeeDrag(); });
})();
