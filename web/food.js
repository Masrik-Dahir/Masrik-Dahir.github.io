/* food.js — 7 food/drink/nutrition calcs (59-65) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 59. Recipe scaler */
window.calcRecipeScale = function(){
    var orig = FA.num('rs_orig'), want = FA.num('rs_want');
    if (!isFinite(orig)||!isFinite(want)||orig<=0) return showErr('rs');
    hideErr('rs');
    var f = want/orig;
    var ings = Array.prototype.map.call($('rs_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'', amt:parseFloat(i[1].value)||0, unit:i[2].value||''};
    }).filter(function(x){return x.name;});
    FA.renderStats('rs_stats',[
        {label:'Scale Factor', value:'×'+f.toFixed(2), kind:'positive'},
        {label:'Original Servings', value:orig+''},
        {label:'Target Servings', value:want+''}
    ]);
    FA.renderTable('rs_table',['Ingredient','Original','Scaled'],
        ings.map(function(x){
            return [x.name, x.amt+' '+x.unit, (x.amt*f).toFixed(2)+' '+x.unit];
        }),[1,2]);
    FA.show('rs_results');
};
window.addRecipeRow = function(name,amt,unit){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Ingredient" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" step="0.01" placeholder="Amount" value="'+(amt||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="text" placeholder="Unit" value="'+(unit||'')+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('rs_rows').appendChild(r);
};

/* 60. Cooking measurement converter */
var UNITS = {
    'tsp':4.92892, 'tbsp':14.7868, 'fl oz':29.5735, 'cup':236.588,
    'pint':473.176, 'quart':946.353, 'gallon':3785.41,
    'ml':1, 'l':1000
};
window.convertMeasure = function(){
    var amt = FA.num('cm_amount'), from = FA.text('cm_from'), to = FA.text('cm_to');
    if (!isFinite(amt)||!UNITS[from]||!UNITS[to]) return showErr('cm');
    hideErr('cm');
    var ml = amt*UNITS[from];
    var converted = ml/UNITS[to];
    FA.renderStats('cm_stats',[
        {label:'Input', value:amt+' '+from},
        {label:'Result', value:converted.toFixed(3)+' '+to, kind:'positive'},
        {label:'Milliliters', value:ml.toFixed(1)+' ml'}
    ]);
    var common = ['tsp','tbsp','fl oz','cup','ml','l'];
    FA.renderTable('cm_table',['Unit','Equivalent'],
        common.map(function(u){ return [u, (ml/UNITS[u]).toFixed(3)]; }),[1]);
    FA.show('cm_results');
};

/* 61. Coffee brew ratio */
window.calcCoffeeRatio = function(){
    var ratio = FA.num('cf_ratio'), waterG = FA.num('cf_water');
    if (!isFinite(ratio)||!isFinite(waterG)||ratio<=0) return showErr('cf');
    hideErr('cf');
    var coffee = waterG/ratio;
    FA.renderStats('cf_stats',[
        {label:'Coffee', value:coffee.toFixed(1)+' g', kind:'positive'},
        {label:'Water', value:waterG+' g'},
        {label:'Ratio', value:'1 : '+ratio.toFixed(1)},
        {label:'Strength', value: ratio<14?'Strong': ratio<16?'Standard':'Mild'}
    ]);
    var strengths = [14,15,16,17,18];
    FA.chart('cf_chart','bar',{
        labels:strengths.map(function(s){return '1:'+s;}),
        datasets:[{label:'Coffee (g)',data:strengths.map(function(s){return waterG/s;}),
                   backgroundColor:['#7c2d12','#b45309','#92400e','#a16207','#854d0e']}]
    },{plugins:{legend:{display:false}}});
    FA.show('cf_results');
};

/* 62. BAC estimator (Widmark) */
window.calcBAC = function(){
    var drinks = FA.num('bc_drinks'), oz = FA.num('bc_oz',1.5), abv = FA.num('bc_abv',40)/100,
        weight = FA.num('bc_weight',75), sex = FA.text('bc_sex')||'male',
        hours = FA.num('bc_hours',1);
    if (!isFinite(drinks)||!isFinite(weight)) return showErr('bc');
    hideErr('bc');
    var ethanol = drinks * oz * 29.5735 * abv * 0.789;     // grams ethanol
    var r = sex==='male' ? 0.68 : 0.55;
    var bac = (ethanol*100)/(weight*1000*r) - 0.015*hours;
    bac = Math.max(0, bac);
    var status = bac<0.04?'OK': bac<0.08?'Buzzed': bac<0.15?'Impaired (illegal)':'Severely impaired';
    FA.renderStats('bc_stats',[
        {label:'Est. BAC', value:bac.toFixed(3)+'%', kind:bac<0.04?'positive':bac<0.08?'warning':'negative', sub:status},
        {label:'Ethanol Consumed', value:ethanol.toFixed(1)+' g'},
        {label:'Legal Limit', value:'0.08% (most US)'},
        {label:'Sober Estimate', value:(bac/0.015).toFixed(1)+' hours'}
    ]);
    var hrs = [0,1,2,3,4,5,6,8];
    FA.chart('bc_chart','line',{
        labels:hrs.map(function(h){return h+'h';}),
        datasets:[{label:'BAC %',data:hrs.map(function(h){
            return Math.max(0, (ethanol*100)/(weight*1000*r) - 0.015*h);
        }),borderColor:'#ef4444',backgroundColor:'rgba(99,102,241,0.18)',fill:true,tension:0.3,pointRadius:0}]
    });
    FA.show('bc_results');
};

/* 63. Meal-prep cost per serving */
window.calcMealCost = function(){
    var ings = Array.prototype.map.call($('mp_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'', cost:parseFloat(i[1].value)||0};
    }).filter(function(x){return x.name;});
    var servings = FA.num('mp_servings',1);
    if (!ings.length||!isFinite(servings)) return showErr('mp');
    hideErr('mp');
    var total = ings.reduce(function(s,x){ return s+x.cost; },0);
    var per = total/servings;
    FA.renderStats('mp_stats',[
        {label:'Total Cost', value:FA.fmtMoney(total)},
        {label:'Per Serving', value:FA.fmtMoney(per), kind:'positive'},
        {label:'Daily (5 servings)', value:FA.fmtMoney(per*5)},
        {label:'Vs Restaurant (~$15)', value:FA.fmtMoney(15-per)+' saved', kind:'positive'}
    ]);
    FA.chart('mp_chart','doughnut',{
        labels:ings.map(function(i){return i.name;}),
        datasets:[{data:ings.map(function(i){return i.cost;}),backgroundColor:FA.PALETTE,borderWidth:2,borderColor:'#fff'}]
    },{cutout:'55%'});
    FA.show('mp_results');
};
window.addMealRow = function(name,cost){
    var r = document.createElement('div'); r.className='fa-row';
    r.style.gridTemplateColumns = '2fr 1fr auto auto';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Ingredient" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" step="0.01" value="'+(cost||'')+'"></div>'+
        '<div></div><button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('mp_rows').appendChild(r);
};

/* 64. Baking pan converter (area-based) */
window.calcPanSize = function(){
    var fromShape = FA.text('pan_fromShape'), fromW = FA.num('pan_fromW'), fromH = FA.num('pan_fromH',0),
        toShape = FA.text('pan_toShape'), toW = FA.num('pan_toW'), toH = FA.num('pan_toH',0);
    function area(shape, w, h){
        if (shape==='round') return Math.PI*(w/2)*(w/2);
        if (shape==='square') return w*w;
        return w*h;
    }
    if (!isFinite(fromW)||!isFinite(toW)) return showErr('pan');
    hideErr('pan');
    var a1 = area(fromShape,fromW,fromH), a2 = area(toShape,toW,toH);
    var f = a2/a1;
    FA.renderStats('pan_stats',[
        {label:'From area', value:a1.toFixed(0)+' cm²'},
        {label:'To area', value:a2.toFixed(0)+' cm²'},
        {label:'Scale ingredients', value:'×'+f.toFixed(2), kind:'positive'},
        {label:'Adjust bake time', value:f>1?'~+25%':'~-15%'}
    ]);
    FA.chart('pan_chart','bar',{
        labels:['From','To'],
        datasets:[{label:'Area (cm²)',data:[a1,a2],backgroundColor:['#6366f1','#10b981']}]
    },{plugins:{legend:{display:false}}});
    FA.show('pan_results');
};

/* 65. Caffeine tracker */
window.calcCaffeine = function(){
    var items = Array.prototype.map.call($('ca_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'', mg:parseFloat(i[1].value)||0, hour:parseInt(i[2].value)||0};
    }).filter(function(x){return x.name && x.mg>0;});
    if (!items.length) return showErr('ca');
    hideErr('ca');
    var total = items.reduce(function(s,x){ return s+x.mg; },0);
    var hrs = Array.from({length:24},function(_,i){return i;});
    var data = hrs.map(function(h){
        return items.reduce(function(s,it){
            if (h < it.hour) return s;
            var elapsed = h - it.hour;
            return s + it.mg * Math.pow(0.5, elapsed/5);     // 5h half-life
        },0);
    });
    FA.renderStats('ca_stats',[
        {label:'Total Intake', value:total+' mg', kind:total>400?'negative':total>200?'warning':'positive', sub:'400mg is FDA safe limit'},
        {label:'Items', value:items.length+''},
        {label:'Peak Level', value:Math.max.apply(null,data).toFixed(0)+' mg', kind:'warning'},
        {label:'Bedtime Residual (11pm)', value:data[23].toFixed(0)+' mg', kind: data[23]>40?'negative':'positive'}
    ]);
    FA.chart('ca_chart','line',{
        labels:hrs.map(function(h){return h+':00';}),
        datasets:[{label:'mg in bloodstream',data:data,borderColor:'#7c2d12',backgroundColor:'rgba(124,45,18,0.18)',fill:true,tension:0.3,pointRadius:0}]
    });
    FA.show('ca_results');
};
window.addCaffeineRow = function(name,mg,hour){
    var r = document.createElement('div'); r.className='fa-row';
    r.style.gridTemplateColumns = '2fr 1fr 1fr auto';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Drink" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><input type="number" placeholder="mg" value="'+(mg||'')+'"><span class="fa-input-suffix">mg</span></div>'+
        '<div class="fa-input-wrap"><input type="number" min="0" max="23" placeholder="Hour" value="'+(hour||0)+'"><span class="fa-input-suffix">h</span></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('ca_rows').appendChild(r);
};

document.addEventListener('DOMContentLoaded', function(){
    addRecipeRow('Flour',300,'g'); addRecipeRow('Sugar',200,'g'); addRecipeRow('Butter',150,'g'); addRecipeRow('Eggs',3,'units');
    addMealRow('Chicken breast',12); addMealRow('Brown rice',5); addMealRow('Broccoli',4); addMealRow('Olive oil',2);
    addCaffeineRow('Morning coffee',95,7); addCaffeineRow('Espresso',64,10); addCaffeineRow('Iced tea',45,14);
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcRecipeScale(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcCoffeeRatio(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcBAC(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcMealCost(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcPanSize(); });
FA.example('section.fa-card:nth-of-type(6)', function(){ window.calcCaffeine(); });
})();
