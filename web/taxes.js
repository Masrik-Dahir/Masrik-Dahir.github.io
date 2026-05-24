/* taxes.js — 6 tax calculators (42-47) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 42. Income tax estimator with bracket visualizer (2024 single brackets) */
var BRACKETS_2024_SINGLE = [
    {top: 11600, rate: 0.10},
    {top: 47150, rate: 0.12},
    {top: 100525, rate: 0.22},
    {top: 191950, rate: 0.24},
    {top: 243725, rate: 0.32},
    {top: 609350, rate: 0.35},
    {top: Infinity, rate: 0.37}
];
window.calcIncomeTax = function(){
    var income = FA.num('it_income'), deduction = FA.num('it_deduction', 14600);
    if (!isFinite(income)||income<=0) return showErr('it');
    hideErr('it');
    var taxable = Math.max(0, income - deduction);
    var prev = 0, totTax = 0, taxByBracket = [];
    BRACKETS_2024_SINGLE.forEach(function(b){
        var top = Math.min(taxable, b.top);
        var amount = Math.max(0, top - prev);
        var tax = amount * b.rate;
        totTax += tax;
        taxByBracket.push({rate: b.rate, top: b.top, amount: amount, tax: tax});
        prev = b.top;
    });
    var effective = totTax/income*100;
    var marginal = 0;
    for (var i=0; i<BRACKETS_2024_SINGLE.length; i++){
        if (taxable < BRACKETS_2024_SINGLE[i].top) { marginal = BRACKETS_2024_SINGLE[i].rate*100; break; }
    }
    FA.renderStats('it_stats',[
        {label:'Taxable Income', value:FA.fmtMoney(taxable)},
        {label:'Total Tax', value:FA.fmtMoney(totTax), kind:'negative'},
        {label:'Effective Rate', value:effective.toFixed(2)+'%'},
        {label:'Marginal Rate', value:marginal.toFixed(0)+'%', kind:'warning'},
        {label:'Take-home', value:FA.fmtMoney(income-totTax), kind:'positive'}
    ]);
    FA.renderTable('it_table',['Bracket','Rate','Income in bracket','Tax'],
        taxByBracket.filter(function(b){return b.amount>0;}).map(function(b){
            return ['Up to '+(b.top===Infinity?'∞':FA.fmtMoney(b.top)), (b.rate*100).toFixed(0)+'%',
                    FA.fmtMoney(b.amount), FA.fmtMoney(b.tax)];
        }), [2,3]);
    FA.chart('it_chart','bar',{
        labels: BRACKETS_2024_SINGLE.map(function(b){ return (b.rate*100).toFixed(0)+'%'; }),
        datasets:[{label:'Tax in bracket',data:taxByBracket.map(function(b){return b.tax;}),
                   backgroundColor:['#10b981','#84cc16','#f59e0b','#f97316','#ef4444','#dc2626','#7c2d12']}]
    },{plugins:{legend:{display:false}}});
    FA.show('it_results');
};

/* 43. Self-employment tax */
window.calcSelfEmp = function(){
    var net = FA.num('se_net');
    if (!isFinite(net)||net<=0) return showErr('se');
    hideErr('se');
    var seBase = net * 0.9235;
    var ssMax = 168600;     // 2024
    var ss = Math.min(seBase, ssMax) * 0.124;
    var medicare = seBase * 0.029;
    var seTax = ss + medicare;
    var deduction = seTax / 2;
    FA.renderStats('se_stats',[
        {label:'Net Earnings', value:FA.fmtMoney(net)},
        {label:'SE Tax', value:FA.fmtMoney(seTax), kind:'negative'},
        {label:'Social Security (12.4%)', value:FA.fmtMoney(ss)},
        {label:'Medicare (2.9%)', value:FA.fmtMoney(medicare)},
        {label:'Deductible Half', value:FA.fmtMoney(deduction), kind:'positive'}
    ]);
    FA.chart('se_chart','doughnut',{
        labels:['Take-home','Social Security','Medicare'],
        datasets:[{data:[net-seTax,ss,medicare],backgroundColor:['#10b981','#6366f1','#f59e0b'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('se_results');
};

/* 44. Sales tax / VAT */
window.calcSalesTax = function(){
    var price = FA.num('st_price'), rate = FA.num('st_rate')/100, dir = FA.text('st_dir') || 'add';
    if (!isFinite(price)||price<=0) return showErr('st');
    hideErr('st');
    var base, tax, total;
    if (dir === 'add'){
        base = price; tax = price*rate; total = base+tax;
    } else {
        total = price; base = total/(1+rate); tax = total-base;
    }
    FA.renderStats('st_stats',[
        {label:'Pre-tax', value:FA.fmtMoney(base)},
        {label:'Tax ('+(rate*100).toFixed(2)+'%)', value:FA.fmtMoney(tax), kind:'warning'},
        {label:'Total', value:FA.fmtMoney(total), kind:'positive'}
    ]);
    FA.chart('st_chart','doughnut',{
        labels:['Pre-tax','Tax'],
        datasets:[{data:[base,tax],backgroundColor:['#10b981','#ef4444'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('st_results');
};
window.toggleSalesDir = function(d){
    $('st_dir').value = d;
    document.querySelectorAll('.st-tab').forEach(function(b){
        b.classList.toggle('fa-btn', b.dataset.dir===d);
        b.classList.toggle('fa-btn-ghost', b.dataset.dir!==d);
    });
};

/* 45. Capital gains */
window.calcCapGains = function(){
    var basis = FA.num('cg_basis'), proceeds = FA.num('cg_proceeds'),
        held = FA.num('cg_heldMonths'), income = FA.num('cg_income',60000);
    if (!isFinite(basis)||!isFinite(proceeds)) return showErr('cg');
    hideErr('cg');
    var gain = proceeds - basis;
    var isLong = held >= 12;
    var rate;
    if (isLong){
        if (income < 47025) rate = 0;
        else if (income < 518900) rate = 0.15;
        else rate = 0.20;
    } else {
        /* short-term: ordinary income — use marginal estimate */
        if (income < 47150) rate = 0.12;
        else if (income < 100525) rate = 0.22;
        else if (income < 191950) rate = 0.24;
        else if (income < 243725) rate = 0.32;
        else if (income < 609350) rate = 0.35;
        else rate = 0.37;
    }
    var tax = Math.max(0, gain*rate);
    FA.renderStats('cg_stats',[
        {label:'Gain', value:FA.fmtMoney(gain), kind:gain>=0?'positive':'negative'},
        {label:'Holding Period', value:held+' mo'+(isLong?' (long-term)':' (short-term)'),
         kind:isLong?'positive':'warning'},
        {label:'Tax Rate Applied', value:(rate*100).toFixed(0)+'%'},
        {label:'Tax', value:FA.fmtMoney(tax), kind:'negative'},
        {label:'After-tax Gain', value:FA.fmtMoney(gain-tax), kind:'positive'}
    ]);
    /* If held just under 12 months, show what waiting would save */
    var savings = isLong ? 0 : Math.max(0, gain*rate - gain*0.15);
    FA.chart('cg_chart','bar',{
        labels:['Short-term tax','Long-term tax'],
        datasets:[{data:[gain*(isLong?(income<47025?0.12:(income<100525?0.22:0.24)):rate),
                         gain*(income<47025?0:(income<518900?0.15:0.20))],
                   backgroundColor:['#ef4444','#10b981']}]
    },{plugins:{legend:{display:false}}});
    FA.show('cg_results');
};

/* 46. W-4 withholding (simplified) */
window.calcWithholding = function(){
    var wages = FA.num('w4_wages'), allowances = FA.num('w4_extra',0), filing = FA.text('w4_filing') || 'single';
    if (!isFinite(wages)||wages<=0) return showErr('w4');
    hideErr('w4');
    var annual = wages*52;
    var sd = filing === 'married' ? 29200 : 14600;
    var taxable = Math.max(0, annual - sd);
    var prev = 0, totTax = 0;
    BRACKETS_2024_SINGLE.forEach(function(b){
        var top = Math.min(taxable, b.top);
        var amount = Math.max(0, top - prev);
        totTax += amount*b.rate;
        prev = b.top;
    });
    var withholdWeekly = totTax/52 + allowances;
    FA.renderStats('w4_stats',[
        {label:'Annual Wages', value:FA.fmtMoney(annual)},
        {label:'Estimated Annual Tax', value:FA.fmtMoney(totTax), kind:'negative'},
        {label:'Weekly Withholding', value:FA.fmtMoney(withholdWeekly), kind:'warning'},
        {label:'Net Weekly Take-home', value:FA.fmtMoney(wages-withholdWeekly), kind:'positive'}
    ]);
    FA.chart('w4_chart','doughnut',{
        labels:['Take-home','Federal Tax'],
        datasets:[{data:[annual-totTax,totTax],backgroundColor:['#10b981','#ef4444'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('w4_results');
};

/* 47. Bill + tip + tax splitter */
window.calcBillSplit = function(){
    var bill = FA.num('bs_bill'), tax = FA.num('bs_tax',0)/100, tip = FA.num('bs_tip',18)/100,
        people = Math.max(1, Math.round(FA.num('bs_people',1)));
    if (!isFinite(bill)||bill<=0) return showErr('bs');
    hideErr('bs');
    var tax$ = bill*tax;
    var tip$ = bill*tip;
    var total = bill + tax$ + tip$;
    var perPerson = total/people;
    FA.renderStats('bs_stats',[
        {label:'Subtotal', value:FA.fmtMoney(bill)},
        {label:'Tax', value:FA.fmtMoney(tax$)},
        {label:'Tip', value:FA.fmtMoney(tip$)},
        {label:'Total', value:FA.fmtMoney(total), kind:'warning'},
        {label:'Per Person ('+people+')', value:FA.fmtMoney(perPerson), kind:'positive'}
    ]);
    FA.chart('bs_chart','doughnut',{
        labels:['Food','Tax','Tip'],
        datasets:[{data:[bill,tax$,tip$],backgroundColor:['#6366f1','#f59e0b','#10b981'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('bs_results');
};

document.addEventListener('DOMContentLoaded', function(){
    if ($('st_dir')) toggleSalesDir('add');
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcIncomeTax(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcSelfEmp(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcSalesTax(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcCapGains(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcWithholding(); });
FA.example('section.fa-card:nth-of-type(6)', function(){ window.calcBillSplit(); });
})();
