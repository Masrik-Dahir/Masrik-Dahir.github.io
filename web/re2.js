/* re2.js — 9 additional real estate calcs (33-41) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }
function pmt(r,n,pv){ return r===0?pv/n:pv*r/(1-Math.pow(1+r,-n)); }

/* 33. Rent vs Buy */
window.calcRentVsBuy = function(){
    var price = FA.num('rb_price'), down = FA.num('rb_down')/100, rate = FA.num('rb_rate')/100,
        years = FA.num('rb_years'), rent = FA.num('rb_rent'), rentGrowth = FA.num('rb_rentGrow')/100,
        appreciation = FA.num('rb_apprec')/100, taxRate = FA.num('rb_taxRate')/100,
        invReturn = FA.num('rb_invRet')/100;
    if (!isFinite(price)) return showErr('rb');
    hideErr('rb');
    var downPmt = price*down;
    var loan = price - downPmt;
    var r = rate/12, n = years*12;
    var monthly = pmt(r,n,loan);
    var labels=[], buyWealth=[], rentWealth=[];
    var homeValue = price, rentBal = downPmt, mortgageBal = loan, curRent = rent;
    var breakeven = -1;
    for (var i=0; i<=years; i++){
        var equity = homeValue - mortgageBal;
        buyWealth.push(equity);
        rentWealth.push(rentBal);
        labels.push(i+' yr');
        if (breakeven < 0 && equity > rentBal) breakeven = i;
        homeValue *= (1+appreciation);
        for (var m=0;m<12;m++){
            var int$ = mortgageBal*r;
            mortgageBal -= (monthly - int$);
        }
        var yearlyTax = homeValue*taxRate;
        var buyOutflow = monthly*12 + yearlyTax;
        var rentOutflow = curRent*12;
        var diff = buyOutflow - rentOutflow;
        if (diff > 0){
            /* renter has surplus — invests it */
            rentBal = rentBal*(1+invReturn) + (rentOutflow > buyOutflow ? -diff : 0);
        } else {
            rentBal = rentBal*(1+invReturn) + (-diff);
        }
        curRent *= (1+rentGrowth);
    }
    FA.renderStats('rb_stats',[
        {label:'Monthly Mortgage', value:FA.fmtMoney(monthly)},
        {label:'Down Payment', value:FA.fmtMoney(downPmt)},
        {label:'Buy Wealth @ '+years+'yr', value:FA.fmtMoney(buyWealth[years]), kind:buyWealth[years]>rentWealth[years]?'positive':'warning'},
        {label:'Rent Wealth @ '+years+'yr', value:FA.fmtMoney(rentWealth[years]), kind:rentWealth[years]>buyWealth[years]?'positive':'warning'},
        {label:'Buy Beats Rent at', value: breakeven >= 0 ? 'Yr '+breakeven : 'Never (' + years + 'yr horizon)', kind: breakeven >= 0 ? 'positive':'negative'}
    ]);
    FA.chart('rb_chart','line',{
        labels:labels,
        datasets:[
            {label:'Buy: home equity',data:buyWealth,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.15)',fill:true,tension:0.3,pointRadius:0},
            {label:'Rent: invested savings',data:rentWealth,borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.10)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('rb_results');
};

/* 34. Home affordability */
window.calcHomeAfford = function(){
    var income = FA.num('ha_income'), down = FA.num('ha_down'), debts = FA.num('ha_debts',0),
        rate = FA.num('ha_rate'), term = FA.num('ha_term',30), tax = FA.num('ha_tax')/100,
        ins = FA.num('ha_ins'), dti = FA.num('ha_dti',36)/100;
    if (!isFinite(income)) return showErr('ha');
    hideErr('ha');
    var monthly = income/12;
    var maxPITI = monthly*dti - debts;
    var monthlyTax = 0, monthlyIns = ins/12;
    var r = rate/100/12, n = term*12;
    /* iterate to converge on home price (tax depends on price) */
    var price = 300000;
    for (var i=0;i<20;i++){
        monthlyTax = price*tax/12;
        var availForLoan = maxPITI - monthlyTax - monthlyIns;
        var maxLoan = availForLoan * (1 - Math.pow(1+r,-n)) / r;
        price = maxLoan + down;
    }
    FA.renderStats('ha_stats',[
        {label:'Max Home Price', value:FA.fmtMoney(price), kind:'positive'},
        {label:'Max PITI', value:FA.fmtMoney(maxPITI), sub:'At '+(dti*100).toFixed(0)+'% DTI'},
        {label:'Loan Amount', value:FA.fmtMoney(price-down)},
        {label:'Monthly Payment (~)', value:FA.fmtMoney(maxPITI)}
    ]);
    var dtis = [0.28, 0.36, 0.43, 0.50];
    FA.chart('ha_chart','bar',{
        labels:dtis.map(function(d){return (d*100).toFixed(0)+'%';}),
        datasets:[{label:'Max home price',data:dtis.map(function(d){
            var maxP = monthly*d - debts - ins/12;
            var p = 300000;
            for (var j=0;j<20;j++){
                var avail = maxP - p*tax/12;
                p = (avail*(1-Math.pow(1+r,-n))/r) + down;
                if (p<0) p=0;
            }
            return p;
        }),backgroundColor:['#10b981','#6366f1','#f59e0b','#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('ha_results');
};

/* 35. Rental property cash flow / ROI */
window.calcRental = function(){
    var price = FA.num('rp_price'), down = FA.num('rp_down')/100,
        rate = FA.num('rp_rate')/100, term = FA.num('rp_term',30),
        rent = FA.num('rp_rent'), vacancy = FA.num('rp_vacancy',8)/100,
        mgmt = FA.num('rp_mgmt',10)/100, tax = FA.num('rp_tax')/100,
        ins = FA.num('rp_ins'), maint = FA.num('rp_maint'),
        hoa = FA.num('rp_hoa',0);
    if (!isFinite(price)) return showErr('rp');
    hideErr('rp');
    var downPmt = price*down;
    var loan = price - downPmt;
    var monthly = pmt(rate/12, term*12, loan);
    var effectiveRent = rent*(1-vacancy);
    var monthlyExpenses = effectiveRent*mgmt + price*tax/12 + ins/12 + maint/12 + hoa;
    var monthlyCF = effectiveRent - monthly - monthlyExpenses;
    var yearlyCF = monthlyCF*12;
    var cashOnCash = yearlyCF/downPmt*100;
    var capRate = (effectiveRent*12 - (effectiveRent*12*mgmt + price*tax + ins + maint*12 + hoa*12))/price*100;
    FA.renderStats('rp_stats',[
        {label:'Monthly Cash Flow', value:FA.fmtMoney(monthlyCF), kind:monthlyCF>0?'positive':'negative'},
        {label:'Annual Cash Flow', value:FA.fmtMoney(yearlyCF), kind:yearlyCF>0?'positive':'negative'},
        {label:'Cash-on-Cash', value:cashOnCash.toFixed(2)+'%', kind:cashOnCash>8?'positive':'warning'},
        {label:'Cap Rate', value:capRate.toFixed(2)+'%', kind:capRate>6?'positive':'warning'}
    ]);
    FA.chart('rp_chart','bar',{
        labels:['Rent','Mortgage','Tax','Insurance','Mgmt','Maint','HOA','Net'],
        datasets:[{label:'Monthly',
            data:[effectiveRent,-monthly,-price*tax/12,-ins/12,-effectiveRent*mgmt,-maint/12,-hoa,monthlyCF],
            backgroundColor:['#10b981','#ef4444','#ef4444','#ef4444','#ef4444','#ef4444','#ef4444',monthlyCF>0?'#10b981':'#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('rp_results');
};

/* 36. Closing cost estimator */
window.calcClosing = function(){
    var price = FA.num('cc_price'), loan = FA.num('cc_loan');
    if (!isFinite(price)||!isFinite(loan)) return showErr('cc');
    hideErr('cc');
    var origin = loan*0.01;
    var title = price*0.005;
    var appraisal = 500;
    var inspection = 400;
    var rec = 150;
    var transferTax = price*0.001;
    var prepaid = loan*0.005;
    var total = origin+title+appraisal+inspection+rec+transferTax+prepaid;
    FA.renderStats('cc_stats',[
        {label:'Loan Origination (1%)', value:FA.fmtMoney(origin)},
        {label:'Title Insurance', value:FA.fmtMoney(title)},
        {label:'Inspection + Appraisal', value:FA.fmtMoney(appraisal+inspection)},
        {label:'Prepaid Interest/Escrow', value:FA.fmtMoney(prepaid)},
        {label:'Total Closing Costs', value:FA.fmtMoney(total), kind:'warning', sub:'~'+(total/price*100).toFixed(1)+'% of price'}
    ]);
    FA.chart('cc_chart','doughnut',{
        labels:['Origination','Title','Appraisal','Inspection','Recording','Transfer Tax','Prepaid'],
        datasets:[{data:[origin,title,appraisal,inspection,rec,transferTax,prepaid],backgroundColor:FA.PALETTE,borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('cc_results');
};

/* 37. LTV */
window.calcLTV = function(){
    var value = FA.num('lv_value'), loan = FA.num('lv_loan');
    if (!isFinite(value)||!isFinite(loan)) return showErr('lv');
    hideErr('lv');
    var ltv = loan/value*100;
    var equity = value - loan;
    var equityPct = equity/value*100;
    FA.renderStats('lv_stats',[
        {label:'LTV', value:ltv.toFixed(1)+'%', kind:ltv<80?'positive':ltv<90?'warning':'negative'},
        {label:'Equity', value:FA.fmtMoney(equity), kind:'positive'},
        {label:'Equity %', value:equityPct.toFixed(1)+'%'},
        {label:'PMI Required?', value:ltv>80?'Yes':'No', kind:ltv<=80?'positive':'negative'}
    ]);
    FA.chart('lv_chart','doughnut',{
        labels:['Equity','Loan'],
        datasets:[{data:[equity,loan],backgroundColor:['#10b981','#ef4444'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'60%'});
    FA.show('lv_results');
};

/* 38. Cash-out refinance */
window.calcCashOut = function(){
    var value = FA.num('co_value'), curLoan = FA.num('co_curLoan'),
        cashOut = FA.num('co_cashOut'), newRate = FA.num('co_newRate')/100,
        newTerm = FA.num('co_newTerm');
    if (!isFinite(value)) return showErr('co');
    hideErr('co');
    var newLoan = curLoan + cashOut;
    var newLTV = newLoan/value*100;
    var newPmt = pmt(newRate/12, newTerm*12, newLoan);
    FA.renderStats('co_stats',[
        {label:'Old Loan', value:FA.fmtMoney(curLoan)},
        {label:'Cash Pulled Out', value:FA.fmtMoney(cashOut), kind:'positive'},
        {label:'New Loan', value:FA.fmtMoney(newLoan)},
        {label:'New LTV', value:newLTV.toFixed(1)+'%', kind:newLTV<80?'positive':'warning'},
        {label:'New Monthly Payment', value:FA.fmtMoney(newPmt)}
    ]);
    FA.chart('co_chart','doughnut',{
        labels:['Equity remaining','Old loan','Cash out'],
        datasets:[{data:[value-newLoan,curLoan,cashOut],backgroundColor:['#10b981','#6366f1','#f59e0b'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('co_results');
};

/* 39. Property tax */
window.calcPropTax = function(){
    var value = FA.num('pt_value'), rate = FA.num('pt_rate')/100;
    var assessedRatio = FA.num('pt_assessed',100)/100;
    if (!isFinite(value)||!isFinite(rate)) return showErr('pt');
    hideErr('pt');
    var assessed = value*assessedRatio;
    var annual = assessed*rate;
    var monthly = annual/12;
    var states = [
        {name:'NJ',rate:2.21},{name:'IL',rate:2.05},{name:'NH',rate:1.96},
        {name:'TX',rate:1.69},{name:'NY',rate:1.40},{name:'OH',rate:1.36},
        {name:'US avg',rate:0.99},{name:'CA',rate:0.71},{name:'AL',rate:0.40},
        {name:'HI',rate:0.27}
    ];
    FA.renderStats('pt_stats',[
        {label:'Assessed Value', value:FA.fmtMoney(assessed)},
        {label:'Annual Tax', value:FA.fmtMoney(annual), kind:'warning'},
        {label:'Monthly', value:FA.fmtMoney(monthly)},
        {label:'Effective Rate', value:(annual/value*100).toFixed(3)+'%'}
    ]);
    FA.chart('pt_chart','bar',{
        labels:states.map(function(s){return s.name;}),
        datasets:[{label:'Tax on $'+FA.fmtNumber(value),
            data:states.map(function(s){return value*s.rate/100;}),
            backgroundColor:states.map(function(s){return s.rate>2?'#ef4444':s.rate>1?'#f59e0b':'#10b981';})}]
    },{plugins:{legend:{display:false}}});
    FA.show('pt_results');
};

/* 40. Moving cost */
window.calcMoving = function(){
    var miles = FA.num('mv_miles'), rooms = FA.num('mv_rooms',2),
        movers = FA.text('mv_type')||'professional';
    if (!isFinite(miles)) return showErr('mv');
    hideErr('mv');
    var truck = miles*0.85 + 80;
    var fuel = miles/10*3.65;
    var pros = movers==='professional' ? rooms*900 + miles*0.85 : 0;
    var diy = movers==='diy' ? rooms*40 : 0;
    var supplies = 100 + rooms*30;
    var deposit = 1500;
    var total = (movers==='professional' ? pros : truck+fuel+diy) + supplies + (miles>500?deposit:0);
    FA.renderStats('mv_stats',[
        {label:'Truck Rental', value:FA.fmtMoney(truck), sub:'If DIY'},
        {label:'Fuel', value:FA.fmtMoney(fuel)},
        {label:'Pro Movers', value:FA.fmtMoney(pros||rooms*900), sub:'If hired'},
        {label:'Supplies', value:FA.fmtMoney(supplies)},
        {label:'Total Estimate', value:FA.fmtMoney(total), kind:'warning'}
    ]);
    FA.chart('mv_chart','bar',{
        labels:['DIY','Hybrid (truck+labor)','Full-service'],
        datasets:[{label:'Estimated cost',
            data:[truck+fuel+supplies, truck+fuel+rooms*150+supplies, rooms*900+miles*0.85+supplies+deposit],
            backgroundColor:['#10b981','#f59e0b','#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('mv_results');
};

/* 41. Down payment & PMI */
window.calcDownPMI = function(){
    var price = FA.num('dp_price'), savings = FA.num('dp_savings'),
        rate = FA.num('dp_rate')/100, term = FA.num('dp_term',30);
    if (!isFinite(price)||!isFinite(savings)) return showErr('dp');
    hideErr('dp');
    var downPmts = [3, 5, 10, 15, 20, 25];
    var rows = downPmts.map(function(pct){
        var down = price*pct/100;
        var loan = price - down;
        var monthly = pmt(rate/12, term*12, loan);
        var ltv = loan/price*100;
        var pmi = ltv > 80 ? loan*0.005/12 : 0;     // 0.5% annual
        return {pct:pct, down:down, loan:loan, monthly:monthly, pmi:pmi,
                total:monthly+pmi, possible:down<=savings};
    });
    var your = rows.find(function(r){return !r.possible;}) ?
               rows[rows.findIndex(function(r){return !r.possible;})-1] :
               rows[rows.length-1];
    FA.renderStats('dp_stats',[
        {label:'Affordable Down', value:FA.fmtMoney(savings)},
        {label:'Best Pct You Can Afford', value:your?your.pct+'%':'—', kind:'positive'},
        {label:'Monthly @ 20% down', value:FA.fmtMoney(rows[4].monthly), sub:'No PMI'},
        {label:'PMI cost if <20%', value:FA.fmtMoney(rows[3].pmi)+'/mo', kind:'warning'}
    ]);
    FA.renderTable('dp_table',['Down %','Down $','Loan','P&I','PMI','Total /mo'],
        rows.map(function(r){
            return [r.pct+'%', FA.fmtMoney(r.down), FA.fmtMoney(r.loan),
                    FA.fmtMoney(r.monthly), FA.fmtMoney(r.pmi),
                    FA.fmtMoney(r.total) + (r.possible?'':' (insufficient)')];
        }), [1,2,3,4,5]);
    FA.chart('dp_chart','bar',{
        labels:rows.map(function(r){return r.pct+'%';}),
        datasets:[
            {label:'P&I',data:rows.map(function(r){return r.monthly;}),backgroundColor:'#6366f1',stack:'s'},
            {label:'PMI',data:rows.map(function(r){return r.pmi;}),backgroundColor:'#ef4444',stack:'s'}
        ]
    },{scales:{x:{stacked:true},y:{stacked:true}}});
    FA.show('dp_results');
};


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcRentVsBuy(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcHomeAfford(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcRental(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcClosing(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcLTV(); });
FA.example('section.fa-card:nth-of-type(6)', function(){ window.calcCashOut(); });
FA.example('section.fa-card:nth-of-type(7)', function(){ window.calcPropTax(); });
FA.example('section.fa-card:nth-of-type(8)', function(){ window.calcMoving(); });
FA.example('section.fa-card:nth-of-type(9)', function(){ window.calcDownPMI(); });
})();
