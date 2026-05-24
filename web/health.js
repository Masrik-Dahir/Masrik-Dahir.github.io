/* health.js — 11 health/fitness calculators (48-58) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 48. BMI / body fat (Navy method approx) */
window.calcBMI = function(){
    var sex = FA.text('bm_sex')||'male';
    var ht = FA.num('bm_height'), wt = FA.num('bm_weight'),
        neck = FA.num('bm_neck',0), waist = FA.num('bm_waist',0), hip = FA.num('bm_hip',0);
    if (!isFinite(ht)||!isFinite(wt)) return showErr('bm');
    hideErr('bm');
    var hM = ht/100, bmi = wt/(hM*hM);
    var bf = null;
    if (neck>0 && waist>0){
        if (sex === 'male'){
            bf = 86.010 * Math.log10(waist - neck) - 70.041*Math.log10(ht) + 36.76;
        } else if (hip>0){
            bf = 163.205*Math.log10(waist+hip-neck) - 97.684*Math.log10(ht) - 78.387;
        }
    }
    var cat = bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';
    FA.renderStats('bm_stats',[
        {label:'BMI', value:bmi.toFixed(1), kind: cat==='Normal'?'positive':'warning', sub:cat},
        {label:'Body Fat %', value: bf!=null ? bf.toFixed(1)+'%' : '—', sub: bf!=null?'(Navy method)':'Enter neck & waist for BF%'},
        {label:'Healthy BMI Range', value:'18.5 - 24.9'},
        {label:'Ideal Weight (BMI 22)', value:(22*hM*hM).toFixed(1)+' kg'}
    ]);
    FA.chart('bm_chart','bar',{
        labels:['Under','Normal','Over','Obese','You'],
        datasets:[{data:[18.5,24.9,29.9,40,bmi],
            backgroundColor:['#0ea5e9','#10b981','#f59e0b','#ef4444','#6366f1']}]
    },{plugins:{legend:{display:false}}});
    FA.show('bm_results');
};

/* 49. TDEE / BMR */
window.calcTDEE = function(){
    var sex = FA.text('td_sex')||'male', age = FA.num('td_age'),
        ht = FA.num('td_height'), wt = FA.num('td_weight'),
        act = parseFloat(FA.text('td_activity')||'1.55');
    if (!isFinite(age)||!isFinite(ht)||!isFinite(wt)) return showErr('td');
    hideErr('td');
    var bmr;
    if (sex==='male') bmr = 10*wt + 6.25*ht - 5*age + 5;
    else bmr = 10*wt + 6.25*ht - 5*age - 161;
    var tdee = bmr*act;
    FA.renderStats('td_stats',[
        {label:'BMR', value:Math.round(bmr)+' kcal/day', sub:'At rest'},
        {label:'TDEE', value:Math.round(tdee)+' kcal/day', kind:'positive', sub:'Maintenance'},
        {label:'Cut (-500)', value:Math.round(tdee-500)+' kcal', sub:'-1 lb/wk'},
        {label:'Bulk (+300)', value:Math.round(tdee+300)+' kcal', sub:'Lean gain'}
    ]);
    FA.chart('td_chart','bar',{
        labels:['BMR','Sedentary','Light','Moderate','Active','Very active'],
        datasets:[{data:[bmr,bmr*1.2,bmr*1.375,bmr*1.55,bmr*1.725,bmr*1.9],
                   backgroundColor:['#94a3b8','#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('td_results');
};

/* 50. Macros */
window.calcMacros = function(){
    var cals = FA.num('mc_cals'), goal = FA.text('mc_goal') || 'maintain';
    if (!isFinite(cals)) return showErr('mc');
    hideErr('mc');
    var p,c,f;
    if (goal==='cut'){ p=0.40; c=0.30; f=0.30; }
    else if (goal==='bulk'){ p=0.30; c=0.50; f=0.20; }
    else { p=0.30; c=0.40; f=0.30; }
    var protein = Math.round(cals*p/4),
        carbs = Math.round(cals*c/4),
        fat   = Math.round(cals*f/9);
    FA.renderStats('mc_stats',[
        {label:'Protein', value:protein+' g', sub:(p*100)+'%'},
        {label:'Carbs', value:carbs+' g', sub:(c*100)+'%'},
        {label:'Fat', value:fat+' g', sub:(f*100)+'%'},
        {label:'Total kcal', value:Math.round(protein*4+carbs*4+fat*9)}
    ]);
    FA.chart('mc_chart','doughnut',{
        labels:['Protein','Carbs','Fat'],
        datasets:[{data:[protein*4,carbs*4,fat*9],backgroundColor:['#ef4444','#f59e0b','#6366f1'],borderWidth:2,borderColor:'#fff'}]
    },{cutout:'60%'});
    FA.show('mc_results');
};

/* 51. Weight loss timeline */
window.calcWeightLoss = function(){
    var cur = FA.num('wl_current'), goal = FA.num('wl_goal'), deficit = FA.num('wl_deficit',500);
    if (!isFinite(cur)||!isFinite(goal)||goal>=cur) return showErr('wl','Goal must be below current weight.');
    hideErr('wl');
    var lbsToLose = (cur - goal) * 2.20462;     // kg → lb
    var daysPerLb = 3500/deficit;
    var totalDays = Math.round(lbsToLose * daysPerLb);
    var weeks = totalDays/7;
    var d = new Date(); d.setDate(d.getDate()+totalDays);
    FA.renderStats('wl_stats',[
        {label:'Weight to Lose', value:(cur-goal).toFixed(1)+' kg'},
        {label:'Daily Deficit', value:deficit+' kcal'},
        {label:'Weekly Loss', value:(7*deficit/3500/2.20462).toFixed(2)+' kg'},
        {label:'Goal Date', value:d.toISOString().slice(0,10), kind:'positive', sub:Math.round(weeks)+' weeks'}
    ]);
    var labels=[], wts=[];
    for (var i=0;i<=totalDays;i+=Math.max(1,Math.floor(totalDays/30))){
        labels.push(Math.round(i/7)+' wk');
        wts.push(cur - (cur-goal)*i/totalDays);
    }
    FA.chart('wl_chart','line',{
        labels:labels,
        datasets:[{label:'Weight (kg)',data:wts,borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0},
                  {label:'Goal',data:labels.map(function(){return goal;}),borderColor:'#6366f1',borderDash:[6,4],pointRadius:0,fill:false}]
    });
    FA.show('wl_results');
};

/* 52. Water intake */
window.calcWater = function(){
    var wt = FA.num('wa_weight'), act = parseFloat(FA.text('wa_activity')||'30');
    if (!isFinite(wt)) return showErr('wa');
    hideErr('wa');
    var ml = wt*35 + act*12;  // 35 ml/kg + 12 ml per active minute
    var glasses = Math.round(ml/250);
    var liters = (ml/1000).toFixed(2);
    FA.renderStats('wa_stats',[
        {label:'Daily Water', value:liters+' L', kind:'positive'},
        {label:'In ml', value:Math.round(ml)+' ml'},
        {label:'8oz Glasses', value:glasses},
        {label:'500ml Bottles', value:(ml/500).toFixed(1)}
    ]);
    var hours = [6,8,10,12,14,16,18,20,22];
    FA.chart('wa_chart','bar',{
        labels:hours.map(function(h){return h+':00';}),
        datasets:[{label:'Cumulative ml',data:hours.map(function(_,i){return Math.round(ml*(i+1)/hours.length);}),backgroundColor:'#0ea5e9'}]
    },{plugins:{legend:{display:false}}});
    FA.show('wa_results');
};

/* 53. Heart rate zones */
window.calcHR = function(){
    var age = FA.num('hr_age'), rest = FA.num('hr_rest',60);
    if (!isFinite(age)) return showErr('hr');
    hideErr('hr');
    var max = 220 - age;
    var zones = [
        {name:'Zone 1 — Recovery',  lo:0.50, hi:0.60, color:'#0ea5e9'},
        {name:'Zone 2 — Endurance', lo:0.60, hi:0.70, color:'#10b981'},
        {name:'Zone 3 — Tempo',     lo:0.70, hi:0.80, color:'#84cc16'},
        {name:'Zone 4 — Threshold', lo:0.80, hi:0.90, color:'#f59e0b'},
        {name:'Zone 5 — VO₂ Max',   lo:0.90, hi:1.00, color:'#ef4444'}
    ];
    FA.renderStats('hr_stats',[
        {label:'Max HR', value:max+' bpm'},
        {label:'Resting HR', value:rest+' bpm'},
        {label:'HR Reserve', value:(max-rest)+' bpm'},
        {label:'Fat-burning (60-70%)', value:Math.round(max*0.6)+'-'+Math.round(max*0.7)+' bpm', kind:'positive'}
    ]);
    FA.renderTable('hr_table',['Zone','Range (bpm)','% of max'],
        zones.map(function(z){
            return [z.name, Math.round(max*z.lo)+'-'+Math.round(max*z.hi), (z.lo*100)+'-'+(z.hi*100)+'%'];
        }), [1,2]);
    FA.chart('hr_chart','bar',{
        labels: zones.map(function(z){return z.name.split(' — ')[0];}),
        datasets:[{label:'High end (bpm)',data:zones.map(function(z){return Math.round(max*z.hi);}),
                   backgroundColor:zones.map(function(z){return z.color;})}]
    },{plugins:{legend:{display:false}}});
    FA.show('hr_results');
};

/* 54. Running pace / race predictor (Riegel) */
window.calcPace = function(){
    var dist = FA.num('rp_dist'), timeMin = FA.num('rp_timeMin');
    if (!isFinite(dist)||!isFinite(timeMin)||dist<=0) return showErr('rp');
    hideErr('rp');
    var pace = timeMin/dist;
    function predict(d){ return timeMin * Math.pow(d/dist, 1.06); }
    var dists = [
        {k:1, name:'1 km'},{k:5, name:'5K'},{k:10, name:'10K'},
        {k:21.0975, name:'Half marathon'},{k:42.195, name:'Marathon'}];
    FA.renderStats('rp_stats',[
        {label:'Pace', value:pace.toFixed(2)+' min/km'},
        {label:'Speed', value:(60/pace).toFixed(2)+' km/h'},
        {label:'Mile pace', value:(pace*1.60934).toFixed(2)+' min/mi'}
    ]);
    FA.renderTable('rp_table',['Race','Predicted time','Predicted pace'],
        dists.map(function(d){
            var t = predict(d.k);
            return [d.name, Math.floor(t/60)+':'+('0'+Math.round(t%60)).slice(-2), (t/d.k).toFixed(2)+' min/km'];
        }),[1,2]);
    FA.chart('rp_chart','line',{
        labels:dists.map(function(d){return d.name;}),
        datasets:[{label:'Predicted time (min)',data:dists.map(function(d){return predict(d.k);}),
                   borderColor:'#10b981',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3}]
    });
    FA.show('rp_results');
};

/* 55. One-rep max (Epley, Brzycki) */
window.calcORM = function(){
    var w = FA.num('or_weight'), r = FA.num('or_reps');
    if (!isFinite(w)||!isFinite(r)||r<=0) return showErr('or');
    hideErr('or');
    var epley = w*(1 + r/30);
    var brzycki = w * 36 / (37 - r);
    var orm = (epley+brzycki)/2;
    var pcts = [50,60,70,75,80,85,90,95];
    FA.renderStats('or_stats',[
        {label:'Epley 1RM', value:epley.toFixed(1)},
        {label:'Brzycki 1RM', value:brzycki.toFixed(1)},
        {label:'Average', value:orm.toFixed(1), kind:'positive'}
    ]);
    FA.renderTable('or_table',['% 1RM','Weight','Recommended reps'],
        pcts.map(function(p){
            return [p+'%', (orm*p/100).toFixed(1), p<60?'15+':p<70?'12-15':p<80?'8-12':p<90?'4-8':'1-4'];
        }),[1]);
    FA.chart('or_chart','bar',{
        labels:pcts.map(function(p){return p+'%';}),
        datasets:[{label:'Weight',data:pcts.map(function(p){return orm*p/100;}),backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('or_results');
};

/* 56. Pregnancy due date */
window.calcDue = function(){
    var lmp = FA.text('pg_lmp');
    if (!lmp) return showErr('pg');
    hideErr('pg');
    var lmpD = new Date(lmp);
    var due = new Date(lmpD.getTime() + 280*24*60*60*1000);
    var today = new Date();
    var weeks = Math.floor((today - lmpD)/(7*24*60*60*1000));
    var daysToGo = Math.max(0, Math.round((due-today)/(24*60*60*1000)));
    var tri = weeks<13?'First':weeks<27?'Second':'Third';
    FA.renderStats('pg_stats',[
        {label:'Due Date', value:due.toISOString().slice(0,10), kind:'positive'},
        {label:'Weeks Pregnant', value:weeks+' weeks'},
        {label:'Trimester', value:tri},
        {label:'Days to Go', value:daysToGo+' days'}
    ]);
    FA.chart('pg_chart','bar',{
        labels:['Week 0','Week 13','Week 27','Week 40'],
        datasets:[{label:'Pregnancy progress',data:[0,13,27,40],backgroundColor:'#ec4899'},
                  {label:'Current',data:[0,0,0,Math.min(weeks,40)],backgroundColor:'#10b981'}]
    });
    FA.show('pg_results');
};

/* 57. Sleep cycle */
window.calcSleep = function(){
    var mode = FA.text('sl_mode')||'wake';
    var t = FA.text('sl_time');
    if (!t) return showErr('sl');
    hideErr('sl');
    var parts = t.split(':');
    var minTotal = parseInt(parts[0])*60 + parseInt(parts[1]);
    var fallAsleep = 15;
    var cycles = [3,4,5,6];
    var results = cycles.map(function(c){
        var sleep = c*90;
        var min = mode==='wake' ? minTotal - sleep - fallAsleep : minTotal + sleep + fallAsleep;
        min = ((min%1440)+1440)%1440;
        var h = Math.floor(min/60), m = min%60;
        return {cycles:c, hours:(sleep/60).toFixed(1), time:('0'+h).slice(-2)+':'+('0'+m).slice(-2)};
    });
    FA.renderStats('sl_stats', results.map(function(r){
        return {label:r.cycles+' cycles ('+r.hours+'h)',
                value:r.time,
                kind:r.cycles>=5?'positive':r.cycles===4?'warning':'negative'};
    }));
    FA.renderTable('sl_table',['Cycles','Sleep','Bed/Wake time'],
        results.map(function(r){ return [r.cycles, r.hours+'h', r.time]; }),[0]);
    FA.show('sl_results');
};
window.toggleSleepMode = function(m){
    $('sl_mode').value=m;
    document.querySelectorAll('.sl-tab').forEach(function(b){
        b.classList.toggle('fa-btn', b.dataset.mode===m);
        b.classList.toggle('fa-btn-ghost', b.dataset.mode!==m);
    });
};

/* 58. Steps → distance & calories */
window.calcSteps = function(){
    var steps = FA.num('st_steps'), height = FA.num('st_height',170), weight = FA.num('st_weight',70);
    if (!isFinite(steps)) return showErr('st_steps_err','st'), undefined;
    hideErr('st');
    var strideM = height*0.414/100;
    var meters = steps * strideM;
    var km = meters/1000;
    var miles = km*0.621371;
    var cals = steps * 0.04 * weight/70;
    FA.renderStats('st_stats',[
        {label:'Distance', value:km.toFixed(2)+' km', sub:miles.toFixed(2)+' mi'},
        {label:'Calories Burned', value:Math.round(cals)+' kcal', kind:'positive'},
        {label:'Steps', value:FA.fmtNumber(steps)},
        {label:'Active Minutes (~)', value:Math.round(steps/100)+' min'}
    ]);
    FA.chart('st_chart','bar',{
        labels:['Daily','Weekly','Monthly','Yearly'],
        datasets:[
            {label:'Steps',data:[steps,steps*7,steps*30,steps*365],backgroundColor:'#6366f1',yAxisID:'y'},
            {label:'kcal',data:[cals,cals*7,cals*30,cals*365],backgroundColor:'#ef4444',yAxisID:'y1'}
        ]
    },{scales:{y:{position:'left'},y1:{position:'right',grid:{drawOnChartArea:false}}}});
    FA.show('st_results');
};


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)',  function(){ window.calcBMI(); });
FA.example('section.fa-card:nth-of-type(2)',  function(){ window.calcTDEE(); });
FA.example('section.fa-card:nth-of-type(3)',  function(){ window.calcMacros(); });
FA.example('section.fa-card:nth-of-type(4)',  function(){ window.calcWeightLoss(); });
FA.example('section.fa-card:nth-of-type(5)',  function(){ window.calcWater(); });
FA.example('section.fa-card:nth-of-type(6)',  function(){ window.calcHR(); });
FA.example('section.fa-card:nth-of-type(7)',  function(){ window.calcPace(); });
FA.example('section.fa-card:nth-of-type(8)',  function(){ window.calcORM(); });
FA.example('section.fa-card:nth-of-type(9)',  function(){ var d=new Date(); d.setDate(d.getDate()-60); FA.set('pg_lmp', d.toISOString().slice(0,10)); window.calcDue(); });
FA.example('section.fa-card:nth-of-type(10)', function(){ window.calcSleep(); });
FA.example('section.fa-card:nth-of-type(11)', function(){ window.calcSteps(); });
})();
