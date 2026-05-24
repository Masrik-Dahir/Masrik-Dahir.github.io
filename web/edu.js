/* edu.js — 5 education/career calcs (91-95) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 91. GPA + grade-needed */
var GRADE_PTS = {A:4.0,'A-':3.7,'B+':3.3,B:3.0,'B-':2.7,'C+':2.3,C:2.0,'C-':1.7,'D+':1.3,D:1.0,F:0.0};
window.calcGPA = function(){
    var rows = Array.prototype.map.call($('gp_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input,select');
        return {course:i[0].value||'', credits:parseFloat(i[1].value)||0, grade:i[2].value||'A'};
    }).filter(function(x){return x.credits>0;});
    if (!rows.length) return showErr('gp');
    hideErr('gp');
    var totalPts = 0, totalCredits = 0;
    rows.forEach(function(r){
        totalPts += r.credits * (GRADE_PTS[r.grade]||0);
        totalCredits += r.credits;
    });
    var gpa = totalPts/totalCredits;
    /* What grade do you need on a future final to hit target GPA? */
    var targetGPA = FA.num('gp_target',3.7);
    var futureCredits = FA.num('gp_futureCredits',3);
    var needed = (targetGPA*(totalCredits+futureCredits) - totalPts) / futureCredits;
    var letter = 'F';
    var sorted = Object.keys(GRADE_PTS).sort(function(a,b){return GRADE_PTS[b]-GRADE_PTS[a];});
    for (var i=0;i<sorted.length;i++){
        if (GRADE_PTS[sorted[i]] <= needed){
            letter = sorted[i]; break;
        }
    }
    FA.renderStats('gp_stats',[
        {label:'Current GPA', value:gpa.toFixed(3), kind:gpa>=3.5?'positive':'warning'},
        {label:'Total Credits', value:totalCredits+''},
        {label:'To Reach '+targetGPA, value:'Need '+needed.toFixed(2)+' GPA', sub:'≈ '+(needed>4?'>A':letter)+' in next '+futureCredits+'cr'},
        {label:'Achievable', value: needed<=4?'Yes':'No', kind: needed<=4?'positive':'negative'}
    ]);
    FA.chart('gp_chart','bar',{
        labels:rows.map(function(r){return r.course||r.grade;}),
        datasets:[{label:'Grade points × credits',data:rows.map(function(r){return r.credits*GRADE_PTS[r.grade];}),
                   backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('gp_results');
};
window.addGradeRow = function(course,credits,grade){
    var r = document.createElement('div'); r.className='fa-row';
    var opts = Object.keys(GRADE_PTS).map(function(g){
        return '<option value="'+g+'"'+(g===grade?' selected':'')+'>'+g+'</option>';
    }).join('');
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Course" value="'+(course||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" step="0.5" placeholder="Credits" value="'+(credits||3)+'"></div>'+
        '<div class="fa-input-wrap"><select>'+opts+'</select></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('gp_rows').appendChild(r);
};

/* 92. Raise impact */
window.calcRaise = function(){
    var cur = FA.num('ra_current'), pct = FA.num('ra_pct')/100, yrs = FA.num('ra_years',10);
    if (!isFinite(cur)) return showErr('ra');
    hideErr('ra');
    var newSal = cur*(1+pct);
    var lifetime = 0;
    var labels=[], baseline=[], withRaise=[];
    for (var i=0;i<=yrs;i++){
        labels.push(i+' yr');
        baseline.push(cur*i);
        var s = newSal * i;
        withRaise.push(s);
        if (i===yrs) lifetime = s - cur*i;
    }
    FA.renderStats('ra_stats',[
        {label:'Current Salary', value:FA.fmtMoney(cur)},
        {label:'New Salary', value:FA.fmtMoney(newSal), kind:'positive'},
        {label:'Annual Increase', value:FA.fmtMoney(newSal-cur), kind:'positive'},
        {label:yrs+'-Year Total Impact', value:FA.fmtMoney(lifetime), kind:'positive'}
    ]);
    FA.chart('ra_chart','line',{
        labels:labels,
        datasets:[
            {label:'Cumulative (no raise)',data:baseline,borderColor:'#ef4444',pointRadius:0,tension:0.3,fill:false},
            {label:'Cumulative (with raise)',data:withRaise,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('ra_results');
};

/* 93. Job offer comparison */
window.calcOffer = function(){
    var s1 = FA.num('jo_sal1'), col1 = FA.num('jo_col1',100), bonus1 = FA.num('jo_bonus1',0), equity1 = FA.num('jo_equity1',0);
    var s2 = FA.num('jo_sal2'), col2 = FA.num('jo_col2',100), bonus2 = FA.num('jo_bonus2',0), equity2 = FA.num('jo_equity2',0);
    if (!isFinite(s1)||!isFinite(s2)) return showErr('jo');
    hideErr('jo');
    var tc1 = s1 + bonus1 + equity1;
    var tc2 = s2 + bonus2 + equity2;
    var adj1 = tc1 * (100/col1);
    var adj2 = tc2 * (100/col2);
    FA.renderStats('jo_stats',[
        {label:'Offer A TC', value:FA.fmtMoney(tc1)},
        {label:'Offer B TC', value:FA.fmtMoney(tc2)},
        {label:'A COL-adjusted', value:FA.fmtMoney(adj1), kind:adj1>=adj2?'positive':'warning'},
        {label:'B COL-adjusted', value:FA.fmtMoney(adj2), kind:adj2>adj1?'positive':'warning'},
        {label:'Winner', value: adj1>adj2 ? 'A' : 'B', kind:'positive',
         sub:'Wins by '+FA.fmtMoney(Math.abs(adj1-adj2))+' adjusted'}
    ]);
    FA.chart('jo_chart','bar',{
        labels:['Salary','Bonus','Equity','Total','COL-Adj'],
        datasets:[
            {label:'Offer A',data:[s1,bonus1,equity1,tc1,adj1],backgroundColor:'#6366f1'},
            {label:'Offer B',data:[s2,bonus2,equity2,tc2,adj2],backgroundColor:'#10b981'}
        ]
    });
    FA.show('jo_results');
};

/* 94. Student budget */
window.calcStudentBudget = function(){
    var rows = Array.prototype.map.call($('sb_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input,select');
        return {name:i[0].value||'', amt:parseFloat(i[1].value)||0, type:i[2].value||'exp'};
    }).filter(function(x){return x.name;});
    if (!rows.length) return showErr('sb');
    hideErr('sb');
    var income = rows.filter(function(r){return r.type==='inc';}).reduce(function(s,r){return s+r.amt;},0);
    var expenses = rows.filter(function(r){return r.type==='exp';}).reduce(function(s,r){return s+r.amt;},0);
    var net = income - expenses;
    FA.renderStats('sb_stats',[
        {label:'Monthly Income', value:FA.fmtMoney(income), kind:'positive'},
        {label:'Monthly Expenses', value:FA.fmtMoney(expenses), kind:'negative'},
        {label:'Net', value:FA.fmtMoney(net), kind:net>=0?'positive':'negative'},
        {label:'Per Semester (4mo)', value:FA.fmtMoney(net*4), kind:net>=0?'positive':'negative'}
    ]);
    var expRows = rows.filter(function(r){return r.type==='exp';});
    FA.chart('sb_chart','doughnut',{
        labels:expRows.map(function(r){return r.name;}),
        datasets:[{data:expRows.map(function(r){return r.amt;}),backgroundColor:FA.PALETTE,borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('sb_results');
};
window.addBudgetRow = function(name,amt,type){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Item" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" step="1" value="'+(amt||0)+'"></div>'+
        '<div class="fa-input-wrap"><select><option value="exp"'+(type==='exp'?' selected':'')+'>Expense</option><option value="inc"'+(type==='inc'?' selected':'')+'>Income</option></select></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('sb_rows').appendChild(r);
};

/* 95. Typing speed (WPM) — interactive */
var typingState = { startedAt: null, finished: false };
var SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Sphinx of black quartz judge my vow. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.";
window.startTypingTest = function(){
    $('ty_target').textContent = SAMPLE_TEXT;
    $('ty_input').value = '';
    $('ty_input').disabled = false;
    $('ty_input').focus();
    typingState = { startedAt: null, finished: false };
    $('ty_results').classList.remove('fa-active');
};
window.checkTyping = function(){
    var v = $('ty_input').value;
    if (!typingState.startedAt && v.length > 0) typingState.startedAt = Date.now();
    if (v === SAMPLE_TEXT && !typingState.finished){
        typingState.finished = true;
        var elapsed = (Date.now() - typingState.startedAt)/1000;
        var words = SAMPLE_TEXT.split(' ').length;
        var wpm = (words/elapsed)*60;
        var cpm = (SAMPLE_TEXT.length/elapsed)*60;
        var acc = 100;     // they got it perfectly
        FA.renderStats('ty_stats',[
            {label:'WPM', value:wpm.toFixed(1), kind:'positive', sub:wpm<40?'Below avg':wpm<60?'Avg':wpm<80?'Above avg':'Fast'},
            {label:'CPM', value:cpm.toFixed(0)},
            {label:'Time', value:elapsed.toFixed(1)+'s'},
            {label:'Accuracy', value:acc+'%'}
        ]);
        var benchmarks = [{l:'Slow',v:25},{l:'Avg',v:40},{l:'Fast',v:60},{l:'Pro',v:90},{l:'You',v:wpm}];
        FA.chart('ty_chart','bar',{
            labels:benchmarks.map(function(b){return b.l;}),
            datasets:[{label:'WPM',data:benchmarks.map(function(b){return b.v;}),
                       backgroundColor:['#94a3b8','#0ea5e9','#10b981','#f59e0b','#6366f1']}]
        },{plugins:{legend:{display:false}}});
        FA.show('ty_results');
    }
};

document.addEventListener('DOMContentLoaded', function(){
    addGradeRow('Calc I',4,'A');
    addGradeRow('Eng Lit',3,'B+');
    addGradeRow('CS 101',4,'A-');
    addBudgetRow('Tuition',500,'exp');
    addBudgetRow('Rent',650,'exp');
    addBudgetRow('Food',300,'exp');
    addBudgetRow('Books',80,'exp');
    addBudgetRow('Part-time job',1200,'inc');
    addBudgetRow('Scholarship',400,'inc');
    if ($('ty_target')) $('ty_target').textContent = SAMPLE_TEXT;
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcGPA(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcRaise(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcOffer(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcStudentBudget(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.startTypingTest(); });
})();
