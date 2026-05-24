/* home.js — 9 home/DIY/garden calcs (66-74) */
(function(){
'use strict';
if (!window.FA) return;
var $ = function(id){ return document.getElementById(id); };
function showErr(p,m){ $(p+'_err').textContent=m||'Fill required fields.'; $(p+'_err').style.display='block'; $(p+'_results').classList.remove('fa-active'); }
function hideErr(p){ $(p+'_err').style.display='none'; }

/* 66. Paint quantity */
window.calcPaint = function(){
    var l = FA.num('pn_length'), w = FA.num('pn_width'), h = FA.num('pn_height'),
        doors = FA.num('pn_doors',1), windows = FA.num('pn_windows',2),
        coats = FA.num('pn_coats',2), coverage = FA.num('pn_coverage',32);
    if (!isFinite(l)||!isFinite(w)||!isFinite(h)) return showErr('pn');
    hideErr('pn');
    var wallArea = 2*(l+w)*h;
    var ceilArea = l*w;
    var deductions = doors*1.9 + windows*1.5;
    var paintable = wallArea + ceilArea - deductions;
    var totalArea = paintable * coats;
    var liters = totalArea / coverage;
    var gallons = liters * 0.264172;
    FA.renderStats('pn_stats',[
        {label:'Wall Area', value:wallArea.toFixed(1)+' m²'},
        {label:'Ceiling', value:ceilArea.toFixed(1)+' m²'},
        {label:'Total Paintable', value:paintable.toFixed(1)+' m²', sub:'After doors/windows'},
        {label:'Liters Needed', value:liters.toFixed(2)+' L', kind:'positive', sub:gallons.toFixed(2)+' US gal'}
    ]);
    FA.chart('pn_chart','bar',{
        labels:['Walls','Ceiling','Deductions','Total'],
        datasets:[{label:'Area m²',data:[wallArea,ceilArea,-deductions,paintable],
                   backgroundColor:['#6366f1','#10b981','#ef4444','#f59e0b']}]
    },{plugins:{legend:{display:false}}});
    FA.show('pn_results');
};

/* 67. Tile / flooring */
window.calcTile = function(){
    var l = FA.num('tl_length'), w = FA.num('tl_width'),
        tileW = FA.num('tl_tileW',30), tileH = FA.num('tl_tileH',30),
        waste = FA.num('tl_waste',10)/100;
    if (!isFinite(l)||!isFinite(w)) return showErr('tl');
    hideErr('tl');
    var floorArea = l*w;     // m²
    var tileArea = (tileW*tileH)/10000;     // cm² → m²
    var tiles = Math.ceil(floorArea/tileArea * (1+waste));
    var withoutWaste = Math.ceil(floorArea/tileArea);
    FA.renderStats('tl_stats',[
        {label:'Floor Area', value:floorArea.toFixed(2)+' m²'},
        {label:'Single Tile', value:tileArea.toFixed(3)+' m²'},
        {label:'Tiles (no waste)', value:withoutWaste+''},
        {label:'Tiles (with '+(waste*100).toFixed(0)+'% waste)', value:tiles+'', kind:'positive'}
    ]);
    FA.chart('tl_chart','bar',{
        labels:[5,10,15,20,25].map(function(w){return w+'%';}),
        datasets:[{label:'Tiles needed',
            data:[5,10,15,20,25].map(function(w){return Math.ceil(floorArea/tileArea*(1+w/100));}),
            backgroundColor:'#6366f1'}]
    },{plugins:{legend:{display:false}}});
    FA.show('tl_results');
};

/* 68. Wallpaper rolls */
window.calcWallpaper = function(){
    var l = FA.num('wp_length'), w = FA.num('wp_width'), h = FA.num('wp_height'),
        rollW = FA.num('wp_rollW',53), rollL = FA.num('wp_rollL',10);
    if (!isFinite(l)||!isFinite(w)||!isFinite(h)) return showErr('wp');
    hideErr('wp');
    var perimeter = 2*(l+w);
    var stripsPerRoll = Math.floor(rollL/h);
    var totalStrips = Math.ceil(perimeter*100/rollW);
    var rolls = Math.ceil(totalStrips/stripsPerRoll * 1.1);
    FA.renderStats('wp_stats',[
        {label:'Wall Perimeter', value:perimeter.toFixed(2)+' m'},
        {label:'Strips per Roll', value:stripsPerRoll+''},
        {label:'Total Strips', value:totalStrips+''},
        {label:'Rolls Needed', value:rolls+'', kind:'positive', sub:'10% pattern match buffer'}
    ]);
    FA.show('wp_results');
};

/* 69. Concrete / mulch volume */
window.calcVolume = function(){
    var l = FA.num('cv_length'), w = FA.num('cv_width'), depth = FA.num('cv_depth');
    var material = FA.text('cv_material')||'concrete';
    if (!isFinite(l)||!isFinite(w)||!isFinite(depth)) return showErr('cv');
    hideErr('cv');
    var vol = l*w*depth/100;     // depth cm → m
    var cubicYards = vol*1.30795;
    var bags;
    if (material==='concrete') bags = Math.ceil(vol/0.014);     // 0.014m³ per 60lb bag
    else if (material==='mulch') bags = Math.ceil(vol/0.0566);   // 2cuft bag
    else bags = Math.ceil(vol/0.0283);
    FA.renderStats('cv_stats',[
        {label:'Volume', value:vol.toFixed(3)+' m³', kind:'positive'},
        {label:'Cubic Yards', value:cubicYards.toFixed(2)},
        {label:'Cubic Feet', value:(vol*35.3147).toFixed(2)},
        {label:'Bags Needed (~)', value:bags+'', sub:material+' standard bag'}
    ]);
    FA.show('cv_results');
};

/* 70. Appliance electricity cost */
window.calcElectricity = function(){
    var watts = FA.num('el_watts'), hours = FA.num('el_hours'),
        rate = FA.num('el_rate', 0.16);
    if (!isFinite(watts)||!isFinite(hours)) return showErr('el');
    hideErr('el');
    var kWh = watts*hours/1000;
    var dailyCost = kWh*rate;
    var yearly = dailyCost*365;
    FA.renderStats('el_stats',[
        {label:'kWh/day', value:kWh.toFixed(3)},
        {label:'Daily Cost', value:FA.fmtMoney(dailyCost)},
        {label:'Monthly Cost', value:FA.fmtMoney(dailyCost*30)},
        {label:'Yearly Cost', value:FA.fmtMoney(yearly), kind:'warning'}
    ]);
    FA.chart('el_chart','bar',{
        labels:['Daily','Weekly','Monthly','Yearly','10-Year'],
        datasets:[{label:'Cost',data:[dailyCost,dailyCost*7,dailyCost*30,yearly,yearly*10],backgroundColor:['#10b981','#0ea5e9','#6366f1','#f59e0b','#ef4444']}]
    },{plugins:{legend:{display:false}}});
    FA.show('el_results');
};

/* 71. Solar payback */
window.calcSolar = function(){
    var system = FA.num('so_systemCost'), monthly = FA.num('so_monthlyBill'),
        offset = FA.num('so_offset',80)/100, deg = FA.num('so_deg',0.5)/100,
        utilGrow = FA.num('so_utilGrow',3)/100;
    if (!isFinite(system)||!isFinite(monthly)) return showErr('so');
    hideErr('so');
    var annualSavings = monthly*12*offset;
    var yrs = 25, cum = 0;
    var labels=[], cumArr=[], lineCost=[];
    var saved=0, bill = monthly*12*(1-offset);
    for (var i=0;i<=yrs;i++){
        labels.push(i+' yr');
        cumArr.push(saved - system);
        lineCost.push(monthly*12*Math.pow(1+utilGrow, i));     // no solar baseline
        var thisYrSave = annualSavings * Math.pow(1+utilGrow,i) * Math.pow(1-deg,i);
        saved += thisYrSave;
    }
    var payback = system/annualSavings;
    FA.renderStats('so_stats',[
        {label:'Annual Savings', value:FA.fmtMoney(annualSavings), kind:'positive'},
        {label:'Payback Period', value:payback.toFixed(1)+' yr'},
        {label:'25-Year Net', value:FA.fmtMoney(saved - system), kind:'positive'},
        {label:'ROI', value:((saved/system - 1)*100).toFixed(0)+'%'}
    ]);
    FA.chart('so_chart','line',{
        labels:labels,
        datasets:[
            {label:'Without solar (cumulative)',data:lineCost.map(function(v,i){
                return lineCost.slice(0,i+1).reduce(function(s,x){return s+x;},0);
            }),borderColor:'#ef4444',pointRadius:0,tension:0.3,fill:false},
            {label:'With solar (net)',data:cumArr,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.15)',fill:true,tension:0.3,pointRadius:0}
        ]
    });
    FA.show('so_results');
};

/* 72. Renovation budget */
window.calcReno = function(){
    var rows = Array.prototype.map.call($('rn_rows').querySelectorAll('.fa-row'),function(r){
        var i = r.querySelectorAll('input');
        return {name:i[0].value||'', est:parseFloat(i[1].value)||0, actual:parseFloat(i[2].value)||0};
    }).filter(function(x){return x.name;});
    if (!rows.length) return showErr('rn');
    hideErr('rn');
    var totEst = rows.reduce(function(s,r){ return s+r.est; },0);
    var totAct = rows.reduce(function(s,r){ return s+r.actual; },0);
    var contingency = totEst * 0.15;
    FA.renderStats('rn_stats',[
        {label:'Estimated Total', value:FA.fmtMoney(totEst)},
        {label:'Recommended Budget (+15%)', value:FA.fmtMoney(totEst+contingency), kind:'warning'},
        {label:'Actual Spent', value:FA.fmtMoney(totAct)},
        {label:'Variance', value:FA.fmtMoney(totAct-totEst), kind:totAct>totEst?'negative':'positive'}
    ]);
    FA.chart('rn_chart','bar',{
        labels:rows.map(function(r){return r.name;}),
        datasets:[
            {label:'Estimated',data:rows.map(function(r){return r.est;}),backgroundColor:'#6366f1'},
            {label:'Actual',data:rows.map(function(r){return r.actual;}),backgroundColor:'#ef4444'}
        ]
    });
    FA.show('rn_results');
};
window.addRenoRow = function(name,est,act){
    var r = document.createElement('div'); r.className='fa-row';
    r.innerHTML = '<div class="fa-input-wrap"><input type="text" placeholder="Task" value="'+(name||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Est" value="'+(est||'')+'"></div>'+
        '<div class="fa-input-wrap"><span class="fa-input-prefix">$</span><input type="number" placeholder="Actual" value="'+(act||'')+'"></div>'+
        '<button type="button" class="fa-row-rm">&times;</button>';
    r.querySelector('.fa-row-rm').addEventListener('click',function(){ r.parentNode.removeChild(r); });
    $('rn_rows').appendChild(r);
};

/* 73. Lawn seed coverage */
window.calcLawn = function(){
    var l = FA.num('ln_length'), w = FA.num('ln_width'),
        rate = FA.num('ln_rate',5);     // lb per 1000 sqft for new lawn
    if (!isFinite(l)||!isFinite(w)) return showErr('ln');
    hideErr('ln');
    var area = l*w;     // m²
    var areaSqft = area*10.7639;
    var seedKg = (areaSqft/1000)*rate*0.4536;
    FA.renderStats('ln_stats',[
        {label:'Area', value:area.toFixed(1)+' m²', sub:areaSqft.toFixed(0)+' sqft'},
        {label:'Seed Needed', value:seedKg.toFixed(2)+' kg', kind:'positive'},
        {label:'Fertilizer (1lb/1000sqft N)', value:(areaSqft/1000*0.4536).toFixed(2)+' kg N'}
    ]);
    FA.show('ln_results');
};

/* 74. Plant spacing & yield */
window.calcPlant = function(){
    var l = FA.num('gp_length'), w = FA.num('gp_width'), spacing = FA.num('gp_spacing',30),
        yieldPer = FA.num('gp_yield',2);     // kg per plant
    if (!isFinite(l)||!isFinite(w)) return showErr('gp');
    hideErr('gp');
    var area = l*w*10000;     // m² → cm²
    var perPlant = spacing*spacing;
    var plants = Math.floor(area/perPlant);
    var yieldKg = plants*yieldPer;
    FA.renderStats('gp_stats',[
        {label:'Garden Area', value:(l*w).toFixed(2)+' m²'},
        {label:'Plants', value:plants+'', kind:'positive'},
        {label:'Total Yield (est)', value:yieldKg.toFixed(1)+' kg'},
        {label:'Yield per m²', value:(yieldKg/(l*w)).toFixed(1)+' kg/m²'}
    ]);
    FA.show('gp_results');
};

document.addEventListener('DOMContentLoaded', function(){
    addRenoRow('Demo & prep',1200,0);
    addRenoRow('Cabinets',8500,0);
    addRenoRow('Countertops',4200,0);
    addRenoRow('Plumbing',1800,0);
    addRenoRow('Electrical',1500,0);
});


/* ════ EXAMPLE BUTTONS ════ */
FA.example('section.fa-card:nth-of-type(1)', function(){ window.calcPaint(); });
FA.example('section.fa-card:nth-of-type(2)', function(){ window.calcTile(); });
FA.example('section.fa-card:nth-of-type(3)', function(){ window.calcWallpaper(); });
FA.example('section.fa-card:nth-of-type(4)', function(){ window.calcVolume(); });
FA.example('section.fa-card:nth-of-type(5)', function(){ window.calcElectricity(); });
FA.example('section.fa-card:nth-of-type(6)', function(){ window.calcSolar(); });
FA.example('section.fa-card:nth-of-type(7)', function(){ window.calcReno(); });
FA.example('section.fa-card:nth-of-type(8)', function(){ window.calcLawn(); });
FA.example('section.fa-card:nth-of-type(9)', function(){ window.calcPlant(); });
})();
