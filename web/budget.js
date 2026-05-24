/* budget.js — Personal Finance calculators for web/budget.html.
   10 calculators wired here; markup lives in budget.html.
   Depends on window.FA (js/finance-app.js) + Chart.js. */
(function(){
    'use strict';
    if (!window.FA) { console.error('FA helpers missing'); return; }
    var $ = function(id){ return document.getElementById(id); };

    /* ════════════════════════════════════════════════════════════════
       1. MONTHLY BUDGET PLANNER  (50/30/20 rule)
       ════════════════════════════════════════════════════════════════ */
    window.calcBudget = function(){
        var income = FA.num('bp_income');
        if (!isFinite(income) || income <= 0) {
            $('bp_results').classList.remove('fa-active');
            $('bp_err').textContent = 'Enter a monthly take-home income greater than 0.';
            $('bp_err').style.display = 'block';
            return;
        }
        $('bp_err').style.display = 'none';
        var needs   = income * 0.50;
        var wants   = income * 0.30;
        var savings = income * 0.20;
        FA.renderStats('bp_stats', [
            { label: 'Needs (50%)',   value: FA.fmtMoney(needs),   sub: 'Rent, food, utilities, insurance' },
            { label: 'Wants (30%)',   value: FA.fmtMoney(wants),   sub: 'Dining, hobbies, travel, streaming' },
            { label: 'Savings (20%)', value: FA.fmtMoney(savings), sub: 'Emergency fund, retirement, debt payoff', kind: 'positive' }
        ]);
        FA.renderTable('bp_table',
            ['Category', 'Allocation', 'Monthly', 'Annual'],
            [
                ['Needs',   '50%', FA.fmtMoney(needs),   FA.fmtMoney(needs*12)],
                ['Wants',   '30%', FA.fmtMoney(wants),   FA.fmtMoney(wants*12)],
                ['Savings', '20%', FA.fmtMoney(savings), FA.fmtMoney(savings*12)],
                ['Total',  '100%', FA.fmtMoney(income),  FA.fmtMoney(income*12)]
            ],
            [2, 3]
        );
        /* Multi-chart dashboard: doughnut + bar + 12-month
           sparkline projection + cumulative-savings line. Every
           dataset uses tooltipFormat:'money' so hover shows $X,XXX. */
        var labels = ['Needs', 'Wants', 'Savings'];
        var data   = [needs, wants, savings];
        var colors = ['#6366f1', '#0ea5e9', '#10b981'];
        var months = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'];
        var savingsTrend = months.map(function(_, i){ return Math.round(savings * (i + 1)); });
        var cumIncome    = months.map(function(_, i){ return Math.round(income  * (i + 1)); });
        var dashHost = $('bp_dashboard') || (function(){
            var d = document.createElement('div'); d.id = 'bp_dashboard';
            $('bp_results').insertBefore(d, $('bp_table').previousElementSibling);
            return d;
        })();
        FA.dashboard('bp_dashboard', [
            {
                title: 'Allocation breakdown',
                type:  'doughnut',
                data:  { labels: labels,
                         datasets: [{ data: data, backgroundColor: colors, tooltipFormat: 'money' }] },
                options: { cutout: '62%' }
            },
            {
                title: 'Monthly vs annual',
                type:  'bar',
                data:  { labels: labels,
                         datasets: [
                            { label: 'Monthly', data: data,                backgroundColor: '#6366f1', tooltipFormat: 'money' },
                            { label: 'Annual',  data: data.map(function(x){return x*12;}), backgroundColor: '#f59e0b', tooltipFormat: 'money' }
                         ] }
            },
            {
                title: '12-month savings projection',
                type:  'line',
                data:  { labels: months,
                         datasets: [{ label: 'Cumulative savings', data: savingsTrend, fill: true, tooltipFormat: 'money' }] }
            },
            {
                title: 'Income earned vs saved',
                type:  'line',
                data:  { labels: months,
                         datasets: [
                            { label: 'Income earned',  data: cumIncome,    borderColor: '#0ea5e9', borderDash: [5,4], pointRadius: 0, tension: 0.3, tooltipFormat: 'money' },
                            { label: 'Savings banked', data: savingsTrend, borderColor: '#10b981', fill: true, tooltipFormat: 'money' }
                         ] }
            }
        ]);
        FA.show('bp_results');
    };

    /* ════════════════════════════════════════════════════════════════
       2. NET WORTH TRACKER
       ════════════════════════════════════════════════════════════════ */
    window.addAsset      = function(){ FA.addRow('nw_assets',     [{ph:'Asset name'},     {ph:'Value', prefix:'$', type:'number'}].slice(0,2).concat([{ph:'',type:'hidden'}])); };
    window.addLiability  = function(){ FA.addRow('nw_liabilities',[{ph:'Liability name'}, {ph:'Balance', prefix:'$', type:'number'}].slice(0,2).concat([{ph:'',type:'hidden'}])); };
    /* simpler 2-col rows: re-define using a 2-col schema by passing
       hidden 3rd to satisfy 3-col grid in CSS. We'll override layout. */
    function netWorthRows(host){
        var out = [];
        Array.prototype.forEach.call(host.querySelectorAll('.fa-row'), function(row){
            var inputs = row.querySelectorAll('input');
            var name = inputs[0] ? inputs[0].value.trim() : '';
            var amt  = inputs[1] ? parseFloat(inputs[1].value) : NaN;
            if (name && isFinite(amt)) out.push({name: name, amt: amt});
        });
        return out;
    }
    window.calcNetWorth = function(){
        var assets = netWorthRows($('nw_assets'));
        var liab   = netWorthRows($('nw_liabilities'));
        var totA = assets.reduce(function(s,r){ return s + r.amt; }, 0);
        var totL = liab.reduce(function(s,r){ return s + r.amt; }, 0);
        var nw = totA - totL;
        FA.renderStats('nw_stats', [
            { label: 'Total Assets',      value: FA.fmtMoney(totA), kind: 'positive' },
            { label: 'Total Liabilities', value: FA.fmtMoney(totL), kind: 'negative' },
            { label: 'Net Worth',         value: FA.fmtMoney(nw),
              kind: nw >= 0 ? 'positive' : 'negative',
              sub: nw >= 0 ? 'You own more than you owe' : 'Liabilities exceed assets' }
        ]);
        var labels = assets.map(function(a){ return a.name; }).concat(liab.map(function(l){ return '(liability) ' + l.name; }));
        var data   = assets.map(function(a){ return a.amt; }).concat(liab.map(function(l){ return -l.amt; }));
        var colors = labels.map(function(_, i){ return i < assets.length ? '#10b981' : '#ef4444'; });
        FA.chart('nw_chart', 'bar', {
            labels: labels,
            datasets: [{ label: 'Balance', data: data, backgroundColor: colors }]
        }, { indexAxis: 'y', plugins: { legend: { display: false }}});
        FA.show('nw_results');
    };

    /* ════════════════════════════════════════════════════════════════
       3. SAVINGS GOAL CALCULATOR
       ════════════════════════════════════════════════════════════════ */
    window.calcSavingsGoal = function(){
        var goal    = FA.num('sg_goal');
        var current = FA.num('sg_current', 0);
        var monthly = FA.num('sg_monthly');
        var ratePct = FA.num('sg_rate', 0);
        if (!isFinite(goal) || goal <= 0 || !isFinite(monthly) || monthly <= 0) {
            $('sg_err').textContent = 'Enter a positive goal amount and monthly contribution.';
            $('sg_err').style.display = 'block';
            $('sg_results').classList.remove('fa-active');
            return;
        }
        $('sg_err').style.display = 'none';
        var r = (ratePct / 100) / 12;     // monthly rate
        var balance = current;
        var months = 0;
        var series = [{m: 0, bal: balance}];
        var MAX = 600;     // 50 years cap
        while (balance < goal && months < MAX) {
            balance = balance * (1 + r) + monthly;
            months++;
            if (months % Math.max(1, Math.floor(MAX/120)) === 0 || balance >= goal) {
                series.push({m: months, bal: balance});
            }
        }
        var reached = balance >= goal;
        var totalContrib = current + monthly * months;
        var interest = balance - totalContrib;
        FA.renderStats('sg_stats', [
            { label: 'Time to Goal',   value: reached ? FA.fmtDuration(months) : '50+ yr',
              kind: reached ? 'positive' : 'warning',
              sub: reached ? 'At current contribution' : 'Increase contributions' },
            { label: 'Total Contributed', value: FA.fmtMoney(totalContrib) },
            { label: 'Interest Earned',   value: FA.fmtMoney(interest), kind: 'positive' },
            { label: 'Final Balance',     value: FA.fmtMoney(balance) }
        ]);
        FA.chart('sg_chart', 'line', {
            labels: series.map(function(p){ return (p.m/12).toFixed(1) + ' yr'; }),
            datasets: [{
                label: 'Balance',
                data: series.map(function(p){ return p.bal; }),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.15)',
                fill: true, tension: 0.3, pointRadius: 0
            }, {
                label: 'Goal',
                data: series.map(function(){ return goal; }),
                borderColor: '#10b981', borderDash: [6,4],
                pointRadius: 0, fill: false
            }]
        });
        FA.show('sg_results');
    };

    /* ════════════════════════════════════════════════════════════════
       4. EMERGENCY FUND CALCULATOR
       ════════════════════════════════════════════════════════════════ */
    window.calcEmergencyFund = function(){
        var monthlyExp = FA.num('ef_expenses');
        var current    = FA.num('ef_current', 0);
        if (!isFinite(monthlyExp) || monthlyExp <= 0) {
            $('ef_err').textContent = 'Enter monthly essential expenses.';
            $('ef_err').style.display = 'block';
            $('ef_results').classList.remove('fa-active');
            return;
        }
        $('ef_err').style.display = 'none';
        var runway = monthlyExp > 0 ? current / monthlyExp : 0;
        var t3 = monthlyExp * 3;
        var t6 = monthlyExp * 6;
        var t12 = monthlyExp * 12;
        var status = runway < 1 ? 'negative' :
                     runway < 3 ? 'warning' :
                     runway < 6 ? 'positive' : 'positive';
        FA.renderStats('ef_stats', [
            { label: 'Months of Runway', value: runway.toFixed(1) + ' mo', kind: status,
              sub: runway < 3 ? 'Below minimum target' : runway < 6 ? 'On track' : 'Excellent buffer' },
            { label: '3-Month Target',   value: FA.fmtMoney(t3),  sub: current >= t3  ? 'Reached' : 'Need ' + FA.fmtMoney(t3-current)   + ' more' },
            { label: '6-Month Target',   value: FA.fmtMoney(t6),  sub: current >= t6  ? 'Reached' : 'Need ' + FA.fmtMoney(t6-current)   + ' more' },
            { label: '12-Month Target',  value: FA.fmtMoney(t12), sub: current >= t12 ? 'Reached' : 'Need ' + FA.fmtMoney(t12-current)  + ' more' }
        ]);
        FA.chart('ef_chart', 'bar', {
            labels: ['Current', '3-month', '6-month', '12-month'],
            datasets: [{
                label: 'Emergency Fund ($)',
                data: [current, t3, t6, t12],
                backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#0ea5e9']
            }]
        }, { plugins: { legend: { display: false }}});
        FA.show('ef_results');
    };

    /* ════════════════════════════════════════════════════════════════
       5. COST-OF-LIVING COMPARISON  (uses input COL indexes; index=100 baseline)
       ════════════════════════════════════════════════════════════════ */
    window.calcCOL = function(){
        var cityA = FA.text('col_cityA') || 'City A';
        var cityB = FA.text('col_cityB') || 'City B';
        var salary= FA.num('col_salary');
        var idxA  = FA.num('col_idxA');
        var idxB  = FA.num('col_idxB');
        if (!isFinite(salary) || salary <= 0 || !isFinite(idxA) || idxA <= 0 || !isFinite(idxB) || idxB <= 0) {
            $('col_err').textContent = 'Enter salary and both cost-of-living indexes (try 100 = U.S. average).';
            $('col_err').style.display = 'block';
            $('col_results').classList.remove('fa-active');
            return;
        }
        $('col_err').style.display = 'none';
        var equivalent = salary * (idxB / idxA);
        var diff = equivalent - salary;
        var pct  = (idxB / idxA - 1) * 100;
        FA.renderStats('col_stats', [
            { label: 'Current Salary in ' + cityA, value: FA.fmtMoney(salary) },
            { label: 'Equivalent Salary in ' + cityB, value: FA.fmtMoney(equivalent),
              kind: diff > 0 ? 'warning' : 'positive',
              sub: (diff > 0 ? 'Need ' : 'Save ') + FA.fmtMoney(Math.abs(diff)) + ' more/less' },
            { label: 'Cost Differential', value: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%',
              kind: pct > 0 ? 'negative' : 'positive',
              sub: pct > 0 ? cityB + ' is more expensive' : cityB + ' is cheaper' }
        ]);
        FA.chart('col_chart', 'bar', {
            labels: [cityA, cityB + ' (equivalent)'],
            datasets: [{
                label: 'Annual salary needed ($)',
                data: [salary, equivalent],
                backgroundColor: ['#6366f1', '#ec4899']
            }]
        }, { plugins: { legend: { display: false }}});
        FA.show('col_results');
    };

    /* ════════════════════════════════════════════════════════════════
       6. SUBSCRIPTION AUDITOR
       ════════════════════════════════════════════════════════════════ */
    window.addSubscription = function(name, monthly){
        var row = document.createElement('div');
        row.className = 'fa-row';
        row.innerHTML =
            '<div class="fa-input-wrap"><input type="text" placeholder="Service name" value="' + (name||'') + '"></div>' +
            '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="9.99" step="0.01" value="' + (monthly!=null?monthly:'') + '"><span class="fa-input-suffix">/mo</span></div>' +
            '<div></div>' +
            '<button type="button" class="fa-row-rm">&times;</button>';
        row.querySelector('.fa-row-rm').addEventListener('click', function(){ row.parentNode.removeChild(row); });
        $('sa_rows').appendChild(row);
    };
    window.calcSubscriptions = function(){
        var rows = Array.prototype.map.call($('sa_rows').querySelectorAll('.fa-row'), function(r){
            var inps = r.querySelectorAll('input');
            return {name: (inps[0].value||'').trim(), m: parseFloat(inps[1].value) || 0};
        }).filter(function(r){ return r.name && r.m > 0; });
        if (!rows.length) {
            $('sa_err').textContent = 'Add at least one subscription.';
            $('sa_err').style.display = 'block';
            $('sa_results').classList.remove('fa-active');
            return;
        }
        $('sa_err').style.display = 'none';
        rows.sort(function(a,b){ return b.m - a.m; });
        var totalM = rows.reduce(function(s,r){ return s + r.m; }, 0);
        var totalY = totalM * 12;
        var total10 = totalY * 10;
        FA.renderStats('sa_stats', [
            { label: 'Monthly Spend', value: FA.fmtMoney(totalM) },
            { label: 'Annual Spend',  value: FA.fmtMoney(totalY), kind: 'warning' },
            { label: '10-Year Cost',  value: FA.fmtMoney(total10), kind: 'negative',
              sub: 'If you cancelled all and invested at 7%, you’d have ' +
                   FA.fmtMoney(totalM * 12 * 13.82) },
            { label: 'Services',      value: rows.length + '' }
        ]);
        FA.renderTable('sa_table',
            ['Service', 'Monthly', 'Yearly', '10-Year'],
            rows.map(function(r){
                return [r.name, FA.fmtMoney(r.m), FA.fmtMoney(r.m*12), FA.fmtMoney(r.m*12*10)];
            }).concat([['<b>Total</b>', '<b>'+FA.fmtMoney(totalM)+'</b>',
                       '<b>'+FA.fmtMoney(totalY)+'</b>', '<b>'+FA.fmtMoney(total10)+'</b>']]),
            [1,2,3]
        );
        FA.chart('sa_chart', 'bar', {
            labels: rows.map(function(r){ return r.name; }),
            datasets: [{
                label: 'Annual cost ($)',
                data: rows.map(function(r){ return r.m * 12; }),
                backgroundColor: FA.PALETTE
            }]
        }, { indexAxis: 'y', plugins: { legend: { display: false }}});
        FA.show('sa_results');
    };

    /* ════════════════════════════════════════════════════════════════
       7. INFLATION CALCULATOR
       ════════════════════════════════════════════════════════════════ */
    window.calcInflation = function(){
        var amt = FA.num('in_amount');
        var yr1 = Math.round(FA.num('in_yearFrom'));
        var yr2 = Math.round(FA.num('in_yearTo'));
        var rate = FA.num('in_rate', 3.2) / 100;
        if (!isFinite(amt) || amt <= 0 || !isFinite(yr1) || !isFinite(yr2) || yr1 >= yr2) {
            $('in_err').textContent = 'Enter amount and valid years (start < end).';
            $('in_err').style.display = 'block';
            $('in_results').classList.remove('fa-active');
            return;
        }
        $('in_err').style.display = 'none';
        var yrs = yr2 - yr1;
        var equivalent = amt * Math.pow(1 + rate, yrs);
        var lostPower = amt * (1 - 1/Math.pow(1+rate, yrs));
        var labels = [], data = [], purchasing = [];
        for (var i = 0; i <= yrs; i++) {
            labels.push(String(yr1 + i));
            data.push(amt * Math.pow(1+rate, i));
            purchasing.push(amt / Math.pow(1+rate, i));
        }
        FA.renderStats('in_stats', [
            { label: '$' + FA.fmtNumber(amt) + ' in ' + yr1, value: FA.fmtMoney(amt) },
            { label: 'Equivalent in ' + yr2,                 value: FA.fmtMoney(equivalent), kind: 'warning' },
            { label: 'Purchasing power lost', value: FA.fmtMoney(lostPower), kind: 'negative',
              sub: 'Over ' + yrs + ' years at ' + FA.fmtPercent(rate*100, 1) },
            { label: 'Cumulative inflation',  value: FA.fmtPercent((equivalent/amt - 1)*100, 1) }
        ]);
        FA.chart('in_chart', 'line', {
            labels: labels,
            datasets: [
                { label: 'Nominal value needed ($)', data: data,
                  borderColor: '#ef4444', backgroundColor: 'rgba(99,102,241,0.10)',
                  fill: true, tension: 0.3, pointRadius: 0 },
                { label: 'Purchasing power of original $', data: purchasing,
                  borderColor: '#10b981', backgroundColor: 'rgba(99,102,241,0.10)',
                  fill: true, tension: 0.3, pointRadius: 0 }
            ]
        });
        FA.show('in_results');
    };

    /* ════════════════════════════════════════════════════════════════
       8. SALARY ↔ HOURLY CONVERTER
       ════════════════════════════════════════════════════════════════ */
    window.calcSalary = function(){
        var mode = FA.text('sh_mode');     // 'fromSalary' or 'fromHourly'
        var hours = FA.num('sh_hours', 40);
        var weeks = FA.num('sh_weeks', 52);
        var salary, hourly;
        if (mode === 'fromSalary') {
            salary = FA.num('sh_salary');
            if (!isFinite(salary) || salary <= 0) { return showShErr(); }
            hourly = salary / (hours * weeks);
        } else {
            hourly = FA.num('sh_hourly');
            if (!isFinite(hourly) || hourly <= 0) { return showShErr(); }
            salary = hourly * hours * weeks;
        }
        $('sh_err').style.display = 'none';
        FA.renderStats('sh_stats', [
            { label: 'Annual',  value: FA.fmtMoney(salary) },
            { label: 'Monthly', value: FA.fmtMoney(salary/12) },
            { label: 'Weekly',  value: FA.fmtMoney(salary/weeks) },
            { label: 'Daily',   value: FA.fmtMoney(salary/(weeks*5)) },
            { label: 'Hourly',  value: FA.fmtMoney(hourly) },
            { label: 'Per minute', value: FA.fmtMoney(hourly/60, {digits: 3}), sub: 'Surprisingly small' }
        ]);
        FA.renderTable('sh_table',
            ['Period', 'Earnings'],
            [
                ['Hour',  FA.fmtMoney(hourly)],
                ['Day (8h)', FA.fmtMoney(hourly*8)],
                ['Week (' + hours + 'h)', FA.fmtMoney(hourly*hours)],
                ['Month',  FA.fmtMoney(salary/12)],
                ['Quarter', FA.fmtMoney(salary/4)],
                ['Year',  FA.fmtMoney(salary)]
            ], [1]);
        FA.chart('sh_chart', 'bar', {
            labels: ['Hour', 'Day', 'Week', 'Month', 'Year'],
            datasets: [{
                label: 'Earnings ($)',
                data: [hourly, hourly*8, hourly*hours, salary/12, salary],
                backgroundColor: ['#6366f1','#3b82f6','#0ea5e9','#10b981','#84cc16']
            }]
        }, { plugins: { legend: { display: false }}, scales: { y: { type: 'logarithmic' }}});
        FA.show('sh_results');
    };
    function showShErr(){
        $('sh_err').textContent = 'Pick a mode and enter a positive value.';
        $('sh_err').style.display = 'block';
        $('sh_results').classList.remove('fa-active');
    }
    window.toggleSalaryMode = function(mode){
        $('sh_mode').value = mode;
        $('sh_salary_wrap').style.display = (mode === 'fromSalary') ? 'flex' : 'none';
        $('sh_hourly_wrap').style.display = (mode === 'fromHourly') ? 'flex' : 'none';
        document.querySelectorAll('.sh-tab').forEach(function(b){
            b.classList.toggle('fa-btn', b.dataset.mode === mode);
            b.classList.toggle('fa-btn-ghost', b.dataset.mode !== mode);
        });
    };

    /* ════════════════════════════════════════════════════════════════
       9. TAKE-HOME PAY CALCULATOR
       ════════════════════════════════════════════════════════════════ */
    window.calcTakeHome = function(){
        var gross  = FA.num('th_gross');
        var fed    = FA.num('th_fed', 12) / 100;
        var state  = FA.num('th_state', 5) / 100;
        var fica   = FA.num('th_fica', 7.65) / 100;
        var ret    = FA.num('th_401k', 6) / 100;
        var health = FA.num('th_health', 200);     // monthly
        if (!isFinite(gross) || gross <= 0) {
            $('th_err').textContent = 'Enter gross annual salary.';
            $('th_err').style.display = 'block';
            $('th_results').classList.remove('fa-active');
            return;
        }
        $('th_err').style.display = 'none';
        var fed$    = gross * fed;
        var state$  = gross * state;
        var fica$   = gross * fica;
        var ret$    = gross * ret;
        var health$ = health * 12;
        var net = gross - fed$ - state$ - fica$ - ret$ - health$;
        FA.renderStats('th_stats', [
            { label: 'Gross Annual',  value: FA.fmtMoney(gross) },
            { label: 'Take-Home Annual', value: FA.fmtMoney(net), kind: 'positive' },
            { label: 'Take-Home Monthly', value: FA.fmtMoney(net/12), kind: 'positive' },
            { label: 'Effective Tax Rate', value: FA.fmtPercent((1 - net/gross)*100, 1), kind: 'warning' }
        ]);
        FA.renderTable('th_table',
            ['Deduction', 'Annual', 'Monthly'],
            [
                ['Federal Tax',  FA.fmtMoney(fed$),   FA.fmtMoney(fed$/12)],
                ['State Tax',    FA.fmtMoney(state$), FA.fmtMoney(state$/12)],
                ['FICA',         FA.fmtMoney(fica$),  FA.fmtMoney(fica$/12)],
                ['401(k)',       FA.fmtMoney(ret$),   FA.fmtMoney(ret$/12)],
                ['Health Premiums', FA.fmtMoney(health$), FA.fmtMoney(health)],
                ['<b>Take-home</b>', '<b>'+FA.fmtMoney(net)+'</b>', '<b>'+FA.fmtMoney(net/12)+'</b>']
            ], [1,2]);
        FA.chart('th_chart', 'doughnut', {
            labels: ['Take-Home', 'Federal Tax', 'State Tax', 'FICA', '401(k)', 'Health Premiums'],
            datasets: [{
                data: [net, fed$, state$, fica$, ret$, health$],
                backgroundColor: ['#10b981','#ef4444','#f59e0b','#8b5cf6','#6366f1','#0ea5e9'],
                borderWidth: 2, borderColor: '#fff'
            }]
        }, { cutout: '55%' });
        FA.show('th_results');
    };

    /* ════════════════════════════════════════════════════════════════
       10. LATTE FACTOR (small daily spend compounded)
       ════════════════════════════════════════════════════════════════ */
    window.calcLatte = function(){
        var perDay = FA.num('lf_perDay');
        var yrs    = FA.num('lf_years', 30);
        var rate   = FA.num('lf_rate', 7) / 100;
        if (!isFinite(perDay) || perDay <= 0 || !isFinite(yrs) || yrs <= 0) {
            $('lf_err').textContent = 'Enter daily spend and years.';
            $('lf_err').style.display = 'block';
            $('lf_results').classList.remove('fa-active');
            return;
        }
        $('lf_err').style.display = 'none';
        var perMonth = perDay * 30.4375;
        var r = rate / 12;
        var balance = 0, totalIn = 0;
        var labels = [], invested = [], grown = [];
        for (var y = 0; y <= yrs; y++) {
            labels.push(y + ' yr');
            invested.push(totalIn);
            grown.push(balance);
            if (y < yrs) {
                for (var m = 0; m < 12; m++) {
                    balance = balance * (1 + r) + perMonth;
                    totalIn += perMonth;
                }
            }
        }
        var interest = balance - totalIn;
        FA.renderStats('lf_stats', [
            { label: 'Daily Spend',    value: FA.fmtMoney(perDay) + '/day' },
            { label: 'Total Spent',    value: FA.fmtMoney(totalIn), kind: 'negative',
              sub: 'Over ' + yrs + ' years' },
            { label: 'If Invested',    value: FA.fmtMoney(balance), kind: 'positive',
              sub: 'At ' + FA.fmtPercent(rate*100, 1) + '/yr' },
            { label: 'Compound Interest', value: FA.fmtMoney(interest), kind: 'positive',
              sub: 'Pure growth (free money)' }
        ]);
        FA.chart('lf_chart', 'line', {
            labels: labels,
            datasets: [
                { label: 'Total contributed', data: invested,
                  borderColor: '#ef4444', backgroundColor: 'rgba(99,102,241,0.10)',
                  fill: true, tension: 0.3, pointRadius: 0 },
                { label: 'Grown to', data: grown,
                  borderColor: '#10b981', backgroundColor: 'rgba(99,102,241,0.18)',
                  fill: true, tension: 0.3, pointRadius: 0 }
            ]
        });
        FA.show('lf_results');
    };

    /* ── Boot: seed default rows / values so each calc has something
       to compute on first open ────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function(){
        /* Net worth — start with a couple example assets/liabilities */
        function seedNw(host, items){
            items.forEach(function(it){
                var row = document.createElement('div');
                row.className = 'fa-row';
                row.innerHTML =
                    '<div class="fa-input-wrap"><input type="text" placeholder="Name" value="' + it[0] + '"></div>' +
                    '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" step="100" value="' + it[1] + '"></div>' +
                    '<div></div>' +
                    '<button type="button" class="fa-row-rm">&times;</button>';
                row.querySelector('.fa-row-rm').addEventListener('click', function(){ row.parentNode.removeChild(row); });
                host.appendChild(row);
            });
        }
        seedNw($('nw_assets'),      [['Checking', 4000], ['Savings', 15000], ['401(k)', 45000], ['Home', 320000]]);
        seedNw($('nw_liabilities'), [['Mortgage', 240000], ['Credit Card', 2500], ['Student Loan', 18000]]);

        /* Subscriptions seed */
        ['Netflix:15.49','Spotify:11.99','iCloud+:9.99','Adobe CC:54.99','Gym:29.00'].forEach(function(s){
            var p = s.split(':'); window.addSubscription(p[0], parseFloat(p[1]));
        });

        /* Default mode for salary converter */
        if ($('sh_mode')) window.toggleSalaryMode('fromSalary');
    });

    /* ════════════════════════════════════════════════════════════════
       EXAMPLE BUTTONS — auto-populate inputs + run the calc.
       Each card gets a "Load example" pill in its head via FA.example.
       ════════════════════════════════════════════════════════════════ */
    FA.example('section.fa-card:nth-of-type(1)', function(){
        FA.set('bp_income', 6500); window.calcBudget();
    });
    FA.example('section.fa-card:nth-of-type(2)', function(){
        window.calcNetWorth();
    });
    FA.example('section.fa-card:nth-of-type(3)', function(){
        FA.set('sg_goal', 100000); FA.set('sg_current', 12000);
        FA.set('sg_monthly', 800); FA.set('sg_rate', 5.5);
        window.calcSavingsGoal();
    });
    FA.example('section.fa-card:nth-of-type(4)', function(){
        FA.set('ef_expenses', 4200); FA.set('ef_current', 10500);
        window.calcEmergencyFund();
    });
    FA.example('section.fa-card:nth-of-type(5)', function(){
        FA.set('col_cityA','Austin, TX'); FA.set('col_salary', 95000);
        FA.set('col_idxA', 108); FA.set('col_cityB','New York, NY');
        FA.set('col_idxB', 187);
        window.calcCOL();
    });
    FA.example('section.fa-card:nth-of-type(6)', function(){
        window.calcSubscriptions();
    });
    FA.example('section.fa-card:nth-of-type(7)', function(){
        FA.set('in_amount', 5000); FA.set('in_yearFrom', 2010);
        FA.set('in_yearTo', 2026); FA.set('in_rate', 3.2);
        window.calcInflation();
    });
    FA.example('section.fa-card:nth-of-type(8)', function(){
        if (window.toggleSalaryMode) window.toggleSalaryMode('fromSalary');
        FA.set('sh_salary', 95000); FA.set('sh_hours', 40); FA.set('sh_weeks', 52);
        window.calcSalary();
    });
    FA.example('section.fa-card:nth-of-type(9)', function(){
        FA.set('th_gross', 95000); FA.set('th_fed', 14); FA.set('th_state', 5);
        FA.set('th_fica', 7.65); FA.set('th_401k', 8); FA.set('th_health', 250);
        window.calcTakeHome();
    });
    FA.example('section.fa-card:nth-of-type(10)', function(){
        FA.set('lf_perDay', 7); FA.set('lf_years', 30); FA.set('lf_rate', 7);
        window.calcLatte();
    });

})();
