/* work.js — 7 productivity/work calcs (84-90) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 84. Exact age + birthday countdown */
window.calcAge = function(){
    var dob = FA.text('ag_dob');
    if (!dob) return showErr('ag');
    hideErr('ag');
    var d = new Date(dob), now = new Date();
    var years = now.getFullYear() - d.getFullYear();
    var months = now.getMonth() - d.getMonth();
    var days = now.getDate() - d.getDate();
    if (days < 0){ months--; days += 30; }
    if (months < 0){ years--; months += 12; }
    var ms = now - d;
    var totalDays = Math.floor(ms/(24*3600*1000));
    var nextBday = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (nextBday < now) nextBday.setFullYear(now.getFullYear()+1);
    var daysToBday = Math.ceil((nextBday - now)/(24*3600*1000));
    FA.renderStats('ag_stats',[
        {label:'Age', value:years+' yr '+months+' mo '+days+' d', kind:'positive'},
        {label:'Total Days Lived', value:FA.fmtNumber(totalDays)},
        {label:'Total Hours', value:FA.fmtNumber(totalDays*24)},
        {label:'Next Birthday In', value:daysToBday+' days'}
    ]);
    var milestones = [
        {label:'1,000 days', target:1000},
        {label:'10,000 days', target:10000},
        {label:'25,000 days', target:25000},
        {label:'30,000 days', target:30000}
    ];
    FA.renderTable('ag_table',['Milestone','Date','Status'],
        milestones.map(function(m){
            var when = new Date(d.getTime() + m.target*24*3600*1000);
            return [m.label, when.toISOString().slice(0,10), totalDays >= m.target ? 'Done' : 'in '+(m.target-totalDays)+' d'];
        }),[]);
    FA.show('ag_results');
};

/* 85. Date diff */
window.calcDateDiff = function(){
    var d1 = FA.text('dd_d1'), d2 = FA.text('dd_d2');
    if (!d1||!d2) return showErr('dd');
    hideErr('dd');
    var a = new Date(d1), b = new Date(d2);
    var diff = Math.abs(b - a);
    var days = Math.round(diff/(24*3600*1000));
    var weeks = (days/7).toFixed(1);
    var months = (days/30.4375).toFixed(2);
    var years = (days/365.25).toFixed(2);
    var workDays = Math.round(days*5/7);
    FA.renderStats('dd_stats',[
        {label:'Days', value:days+''},
        {label:'Weeks', value:weeks},
        {label:'Months', value:months},
        {label:'Years', value:years},
        {label:'Workdays (~)', value:workDays+''}
    ]);
    FA.show('dd_results');
};

/* 86. Freelance hourly rate */
window.calcFreelanceRate = function(){
    var targetIncome = FA.num('fr_income'), expenses = FA.num('fr_exp',0),
        vacWeeks = FA.num('fr_vac',4), hrsPerWeek = FA.num('fr_hrs',30),
        billable = FA.num('fr_billable',70)/100;
    if (!isFinite(targetIncome)) return showErr('fr');
    hideErr('fr');
    var workWeeks = 52 - vacWeeks;
    var totalGross = targetIncome + expenses;
    var totalBillableHrs = workWeeks * hrsPerWeek * billable;
    var rate = totalGross / totalBillableHrs;
    FA.renderStats('fr_stats',[
        {label:'Target Take-home', value:FA.fmtMoney(targetIncome)},
        {label:'Required Gross', value:FA.fmtMoney(totalGross), sub:'Includes business expenses'},
        {label:'Billable Hours/Year', value:totalBillableHrs.toFixed(0)},
        {label:'Hourly Rate', value:FA.fmtMoney(rate), kind:'positive'},
        {label:'Day Rate (8h)', value:FA.fmtMoney(rate*8)},
        {label:'Week Rate', value:FA.fmtMoney(rate*hrsPerWeek)}
    ]);
    var billables = [50,60,70,80,90];
    FA.chart('fr_chart','bar',{
        labels:billables.map(function(b){return b+'%';}),
        datasets:[{label:'Required hourly rate',
            data:billables.map(function(b){return totalGross/(workWeeks*hrsPerWeek*b/100);}),
            backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('fr_results');
};

/* 87. Project quote */
window.calcProject = function(){
    var items = Array.prototype.map.call($('pq_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {task:i[0].value||'', hrs:parseFloat(i[1].value)||0, rate:parseFloat(i[2].value)||0};
    }).filter(function(x){return x.task;});
    var contingency = FA.num('pq_contingency',15)/100;
    if (!items.length) return showErr('pq');
    hideErr('pq');
    var labor = items.reduce(function(s,x){ return s+x.hrs*x.rate; },0);
    var hours = items.reduce(function(s,x){ return s+x.hrs; },0);
    var cont = labor*contingency;
    var total = labor + cont;
    FA.renderStats('pq_stats',[
        {label:'Total Hours', value:hours.toFixed(1)+' h'},
        {label:'Labor', value:FA.fmtMoney(labor)},
        {label:'Contingency ('+(contingency*100).toFixed(0)+'%)', value:FA.fmtMoney(cont)},
        {label:'Total Quote', value:FA.fmtMoney(total), kind:'positive'}
    ]);
    FA.renderTable('pq_table',['Task','Hours','Rate','Subtotal'],
        items.map(function(x){
            return [x.task, x.hrs.toFixed(1), FA.fmtMoney(x.rate), FA.fmtMoney(x.hrs*x.rate)];
        }).concat([['<b>Total</b>', hours.toFixed(1), '', '<b>'+FA.fmtMoney(total)+'</b>']]),
        [1,2,3]);
    FA.show('pq_results');
};
window.addQuoteRow = function(task,hrs,rate){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Task" value="'+(task||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" step="0.5" value="'+(hrs||'')+'"><span class="fa-input-suffix">h</span></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" step="5" value="'+(rate||'')+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('pq_rows').appendChild(r);
};

/* 88. Pomodoro planner */
window.calcPomodoro = function(){
    var tasks = FA.num('pm_tasks'), focus = FA.num('pm_focus',25), brk = FA.num('pm_break',5),
        longBrk = FA.num('pm_long',15);
    if (!isFinite(tasks)) return showErr('pm');
    hideErr('pm');
    var totalMin = 0;
    for (var i=1; i<=tasks; i++){
        totalMin += focus;
        if (i < tasks){
            totalMin += (i%4===0) ? longBrk : brk;
        }
    }
    var endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + totalMin);
    FA.renderStats('pm_stats',[
        {label:'Total Pomodoros', value:tasks+''},
        {label:'Focus Time', value:(tasks*focus)+' min'},
        {label:'Session Duration', value:Math.floor(totalMin/60)+'h '+(totalMin%60)+'m'},
        {label:'Finish At', value:endTime.toTimeString().slice(0,5), kind:'positive'}
    ]);
    FA.show('pm_results');
};

/* 89. Reading time */
window.calcReading = function(){
    var pages = FA.num('rd_pages'), wpm = FA.num('rd_wpm',250),
        wordsPerPage = FA.num('rd_wordsPerPage',250), daily = FA.num('rd_daily',30);
    if (!isFinite(pages)) return showErr('rd');
    hideErr('rd');
    var totalWords = pages*wordsPerPage;
    var totalMin = totalWords/wpm;
    var days = Math.ceil(totalMin/daily);
    var booksPerYear = 365/days;
    FA.renderStats('rd_stats',[
        {label:'Total Reading Time', value:Math.floor(totalMin/60)+'h '+Math.round(totalMin%60)+'m'},
        {label:'Days to Finish', value:days+' days', kind:'positive', sub:'At '+daily+' min/day'},
        {label:'Books / Year', value:booksPerYear.toFixed(1)},
        {label:'30-Year Total', value:Math.round(booksPerYear*30)+' books'}
    ]);
    var dailyMins = [10,20,30,45,60,90,120];
    FA.chart('rd_chart','bar',{
        labels:dailyMins.map(function(m){return m+' min/day';}),
        datasets:[{label:'Days to finish',data:dailyMins.map(function(m){return Math.ceil(totalMin/m);}),backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('rd_results');
};

/* 90. Meeting cost */
window.calcMeetingCost = function(){
    var rows = Array.prototype.map.call($('mt_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {role:i[0].value||'', salary:parseFloat(i[1].value)||0, count:parseFloat(i[2].value)||0};
    }).filter(function(x){return x.salary>0;});
    var hours = FA.num('mt_hours');
    if (!rows.length||!isFinite(hours)) return showErr('mt');
    hideErr('mt');
    var hourlyCost = rows.reduce(function(s,r){ return s + (r.salary/2080)*r.count; },0);
    var meetingCost = hourlyCost*hours;
    FA.renderStats('mt_stats',[
        {label:'Total Hourly Burn', value:FA.fmtMoney(hourlyCost)},
        {label:'This Meeting', value:FA.fmtMoney(meetingCost), kind:'warning'},
        {label:'Weekly (if recurring)', value:FA.fmtMoney(meetingCost*52), kind:'negative'},
        {label:'Cost per Minute', value:FA.fmtMoney(hourlyCost/60,{digits:2})}
    ]);
    FA.chart('mt_chart','bar',{
        labels:rows.map(function(r){return r.role+' (×'+r.count+')';}),
        datasets:[{label:'Cost during meeting',data:rows.map(function(r){return (r.salary/2080)*r.count*hours;}),
                   backgroundColor:FA.PALETTE}]
    },{plugins:{legend:{display:false}}});
    FA.show('mt_results');
};
window.addMeetingRow = function(role,salary,count){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Role" value="'+(role||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Salary" value="'+(salary||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" value="'+(count||1)+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('mt_rows').appendChild(r);
};

document.addEventListener('DOMContentLoaded', function(){
    addQuoteRow('Design',20,85);
    addQuoteRow('Development',60,95);
    addQuoteRow('Testing',12,75);
    addMeetingRow('Engineer',140000,4);
    addMeetingRow('Manager',180000,1);
    addMeetingRow('Designer',120000,1);
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcAge(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcDateDiff(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcFreelanceRate(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcProject(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcPomodoro(); });
FA.example('section.fa-card:nth-of-type(6)', function(){ window.calcReading(); });
FA.example('section.fa-card:nth-of-type(7)', function(){ window.calcMeetingCost(); });
})();
