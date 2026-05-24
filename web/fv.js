/* fv.js — Real Estate Analyzer calculators for web/re.html.
   Markup lives in re.html, shared helpers in js/finance-app.js (window.FA).
   Five calculators wired here:
     1. Annuity / TVM
     2. Discounted cash flow (NPV / IRR / Payback)
     3. Rental property analyzer
     4. Mortgage affordability (28/36 rule)
     5. Rent vs Buy
*/
(function () {
    'use strict';
    if (!window.FA) { console.error('FA helpers missing'); return; }
    var $ = function (id) { return document.getElementById(id); };

    /* ──────────────────────────────────────────────────────────────
       TVM primitives — same identity used across every calc.
       Identity: PV + PMT·(1 + r·type)·(1 − v^n)/r + FV·v^n = 0
       where r = I/Y / 100, v = 1/(1+r), type ∈ {0,1}.
       ────────────────────────────────────────────────────────────── */
    function tvmResidual(pv, pmt, iy, n, fv, type) {
        var r = iy / 100;
        var adj = 1 + r * type;
        if (Math.abs(r) < 1e-12) return pv + pmt * adj * n + fv;
        var v_n = Math.pow(1 + r, -n);
        var a_n = (1 - v_n) / r;
        return pv + pmt * adj * a_n + fv * v_n;
    }
    function solveFV(pv, pmt, iy, n, type) {
        var r = iy / 100, adj = 1 + r * type;
        if (Math.abs(r) < 1e-12) return -(pv + pmt * adj * n);
        var v_n = Math.pow(1 + r, -n);
        var a_n = (1 - v_n) / r;
        return -(pv + pmt * adj * a_n) / v_n;
    }
    function solvePV(pmt, iy, n, fv, type) {
        var r = iy / 100, adj = 1 + r * type;
        if (Math.abs(r) < 1e-12) return -(pmt * adj * n + fv);
        var v_n = Math.pow(1 + r, -n);
        var a_n = (1 - v_n) / r;
        return -(pmt * adj * a_n + fv * v_n);
    }
    function solvePMT(pv, iy, n, fv, type) {
        var r = iy / 100, adj = 1 + r * type;
        if (Math.abs(r) < 1e-12) {
            if (n === 0) throw new Error('PMT undefined when N = 0 and I/Y = 0.');
            return -(pv + fv) / (adj * n);
        }
        var v_n = Math.pow(1 + r, -n);
        var a_n = (1 - v_n) / r;
        return -(pv + fv * v_n) / (adj * a_n);
    }
    function solveN(pv, pmt, iy, fv, type) {
        var r = iy / 100, adj = 1 + r * type;
        if (Math.abs(r) < 1e-12) {
            if (Math.abs(pmt) < 1e-15) {
                if (Math.abs(pv + fv) < 1e-9) return 0;
                throw new Error('N has no solution with PMT=0 and PV ≠ -FV at zero rate.');
            }
            return -(pv + fv) / pmt;
        }
        if (Math.abs(pmt) < 1e-15) {
            var ratio = -pv / fv;
            if (!isFinite(ratio) || ratio <= 0) throw new Error('N has no real solution.');
            return -Math.log(ratio) / Math.log(1 + r);
        }
        var k = pmt * adj / r;
        var num = pv + k, den = k - fv;
        if (Math.abs(den) < 1e-15) throw new Error('N undefined — denominator vanishes.');
        var X = num / den;
        if (X <= 0) throw new Error('N has no real solution for these inputs.');
        return -Math.log(X) / Math.log(1 + r);
    }
    function solveIY(pv, pmt, n, fv, type) {
        function f(iy) { return tvmResidual(pv, pmt, iy, n, fv, type); }
        var seeds = [0.01, 0.5, 1, 5, 10, 25, 50, -1, -10, -25];
        for (var s = 0; s < seeds.length; s++) {
            var iy = seeds[s], ok = false;
            for (var i = 0; i < 100; i++) {
                var fi = f(iy);
                var h = Math.max(1e-7, Math.abs(iy) * 1e-7);
                var df = (f(iy + h) - f(iy - h)) / (2 * h);
                if (!isFinite(fi) || !isFinite(df) || Math.abs(df) < 1e-15) break;
                var step = fi / df;
                var next = iy - step;
                if (!isFinite(next) || next < -99 || next > 1e6) break;
                if (Math.abs(step) < 1e-10 || Math.abs(fi) < 1e-10) { iy = next; ok = true; break; }
                iy = next;
            }
            if (ok && isFinite(f(iy)) && Math.abs(f(iy)) < 1e-6) return iy;
        }
        /* Bisection fallback on a finite-valued bracket */
        var lo = -50, hi = 1000;
        var samples = [-50, -10, -1, 0, 0.001, 0.5, 1, 5, 10, 50, 100, 500, 1000];
        var bracketed = false;
        for (var k = 0; k < samples.length - 1; k++) {
            var fa = f(samples[k]), fb = f(samples[k + 1]);
            if (isFinite(fa) && isFinite(fb) && fa * fb < 0) {
                lo = samples[k]; hi = samples[k + 1]; bracketed = true; break;
            }
        }
        if (!bracketed) throw new Error('I/Y did not converge for these inputs.');
        for (var j = 0; j < 200; j++) {
            var mid = (lo + hi) / 2, fm = f(mid);
            if (!isFinite(fm)) { hi = mid; continue; }
            if (Math.abs(fm) < 1e-10 || (hi - lo) < 1e-12) return mid;
            if (f(lo) * fm < 0) hi = mid; else lo = mid;
        }
        return (lo + hi) / 2;
    }

    function pmtFor(loan, ratePerMonth, months) {
        if (months <= 0) return 0;
        if (ratePerMonth === 0) return loan / months;
        return loan * ratePerMonth / (1 - Math.pow(1 + ratePerMonth, -months));
    }

    /* ════════════════════════════════════════════════════════════════
       1. ANNUITY
       ════════════════════════════════════════════════════════════════ */
    var AN_IDS = ['an_fv', 'an_pv', 'an_iy', 'an_n', 'an_pmt'];

    window.reAnnuityClear = function () {
        AN_IDS.forEach(function (id) { var el = $(id); if (el) el.value = ''; });
        $('an_type').value = '0';
        FA.hide('an_results');
        $('an_err').style.display = 'none';
    };
    window.reAnnuityExample = function () {
        var examples = [
            { fv:0,        pv:200000,   iy:0.5,    n:360, pmt:'',         type:0 },  /* blank PMT */
            { fv:'',       pv:-1000,    iy:5,      n:10,  pmt:0,          type:0 },  /* blank FV */
            { fv:-205516.83, pv:0,      iy:0.4167, n:240, pmt:500,        type:0 },  /* recover something */
            { fv:0,        pv:25000,    iy:'',     n:60,  pmt:-460.4145,  type:0 },  /* blank IY */
            { fv:-27590.32,pv:10000,    iy:7,      n:'',  pmt:0,          type:0 }   /* blank N */
        ];
        var s = examples[Math.floor(Math.random() * examples.length)];
        ['fv','pv','iy','n','pmt'].forEach(function (k) {
            $('an_' + k).value = s[k] === '' ? '' : String(s[k]);
        });
        $('an_type').value = String(s.type);
    };
    window.reAnnuityCalc = function () {
        $('an_err').style.display = 'none';
        var fields = AN_IDS.map(function (id) {
            var v = FA.num(id);
            return { empty: !isFinite(v), value: v };
        });
        var emptyCount = fields.filter(function (f) { return f.empty; }).length;
        if (emptyCount !== 1) {
            $('an_err').textContent = 'Leave exactly one of FV, PV, I/Y, N, PMT empty. You left ' + emptyCount + ' empty.';
            $('an_err').style.display = 'block';
            FA.hide('an_results');
            return;
        }
        var type = parseInt($('an_type').value, 10) || 0;
        var fv = fields[0].value, pv = fields[1].value, iy = fields[2].value, n = fields[3].value, pmt = fields[4].value;
        var label, answer;
        try {
            if (fields[0].empty)       { answer = solveFV(pv, pmt, iy, n, type); fv  = answer; label = 'FV'; }
            else if (fields[1].empty)  { answer = solvePV(pmt, iy, n, fv, type); pv  = answer; label = 'PV'; }
            else if (fields[2].empty)  { answer = solveIY(pv, pmt, n, fv, type); iy  = answer; label = 'I/Y'; }
            else if (fields[3].empty)  { answer = solveN(pv, pmt, iy, fv, type); n   = answer; label = 'N'; }
            else if (fields[4].empty)  { answer = solvePMT(pv, iy, n, fv, type); pmt = answer; label = 'PMT'; }
            if (!isFinite(answer)) throw new Error('No real solution for these inputs.');
        } catch (err) {
            $('an_err').textContent = err.message;
            $('an_err').style.display = 'block';
            FA.hide('an_results');
            return;
        }
        var fieldId = { FV:'an_fv', PV:'an_pv', 'I/Y':'an_iy', N:'an_n', PMT:'an_pmt' }[label];
        $(fieldId).value = Number(answer.toFixed(4));

        var sched = buildSchedule(pv, pmt, iy, n, type);
        var totalInt   = sched.reduce(function (s, r) { return s + Math.abs(r.interest); }, 0);
        var totalPrinc = sched.reduce(function (s, r) { return s + Math.abs(r.principal); }, 0);
        var totalPmt   = sched.reduce(function (s, r) { return s + Math.abs(r.payment); }, 0);
        var rPeriod = iy / 100;
        var periodsPerYear = Math.abs(rPeriod) < 0.02 ? 12 : Math.abs(rPeriod) < 0.08 ? 4 : 1;
        var effectiveAnnual = (Math.pow(1 + rPeriod, periodsPerYear) - 1) * 100;

        FA.renderStats('an_stats', [
            { label: 'Solved for ' + label, value: FA.fmtMoney(answer, { digits: 4, symbol: label==='I/Y' ? '' : (label==='N'?'':'$') }) + (label==='I/Y'?'%':''), kind: 'positive' },
            { label: 'Total payments',  value: FA.fmtMoney(totalPmt) },
            { label: 'Total interest',  value: FA.fmtMoney(totalInt), kind: 'warning' },
            { label: 'Total principal', value: FA.fmtMoney(totalPrinc) },
            { label: 'Effective annual',value: FA.fmtPercent(effectiveAnnual, 3) }
        ]);

        var labels = sched.map(function (r) { return String(r.period); });
        var balances = sched.map(function (r) { return Math.abs(r.endBalance); });
        var cumP = 0, cumI = 0;
        var cumPSeries = [], cumISeries = [];
        sched.forEach(function (r) { cumP += Math.abs(r.principal); cumI += Math.abs(r.interest); cumPSeries.push(cumP); cumISeries.push(cumI); });

        FA.chart('an_chart_line', 'line', {
            labels: labels,
            datasets: [
                { label:'Remaining balance', data:balances,  borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.18)', fill:true,  tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Cumulative principal', data:cumPSeries, borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0)', fill:false, tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Cumulative interest',  data:cumISeries, borderColor:'#ec4899', backgroundColor:'rgba(236,72,153,0)', fill:false, tension:0.30, pointRadius:0, borderWidth:2 }
            ]
        }, { scales: { x: { ticks: { maxTicksLimit: 12 }}, y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        FA.chart('an_chart_bar', 'bar', {
            labels: labels,
            datasets: [
                { label:'Principal', data: sched.map(function(r){ return Math.abs(r.principal); }), backgroundColor:'#10b981' },
                { label:'Interest',  data: sched.map(function(r){ return Math.abs(r.interest); }),  backgroundColor:'#ec4899' }
            ]
        }, { scales: { x: { stacked:true, ticks: { maxTicksLimit: 12 }}, y: { stacked:true, ticks: { callback:function(v){ return FA.fmtMoney(v,{digits:0});}}}}});

        var displayCount = Math.min(60, sched.length);
        var rows = sched.slice(0, displayCount).map(function (r) {
            return [
                String(r.period),
                FA.fmtMoney(r.begBalance),
                FA.fmtMoney(Math.abs(r.interest)),
                FA.fmtMoney(r.payment),
                FA.fmtMoney(Math.abs(r.principal)),
                FA.fmtMoney(r.endBalance)
            ];
        });
        FA.renderTable('an_table',
            ['#', 'Beginning', 'Interest', 'Payment', 'Principal', 'Ending'],
            rows, [1,2,3,4,5]);
        FA.show('an_results');
    };

    function buildSchedule(pv, pmt, iy, n, type) {
        var r = iy / 100, rows = [];
        var balance = pv, nInt = Math.max(1, Math.round(n));
        for (var k = 1; k <= nInt; k++) {
            var beg = balance, interest, end;
            if (type === 1) {
                var afterPay = beg + pmt;
                interest = afterPay * r;
                end = afterPay + interest;
            } else {
                interest = beg * r;
                end = beg + interest + pmt;
            }
            var principal = -(pmt + interest);
            rows.push({ period:k, begBalance:beg, interest:interest, payment:pmt, principal:principal, endBalance:end });
            balance = end;
        }
        return rows;
    }

    /* ════════════════════════════════════════════════════════════════
       2. CASH FLOW (NPV / IRR / Payback)
       ════════════════════════════════════════════════════════════════ */
    var cfCount = 0;
    function cfAddRowDOM(value) {
        var list = $('cf_rows'); if (!list) return;
        var idx = cfCount++;
        var row = document.createElement('div');
        row.className = 'fa-row';
        row.dataset.cfIdx = idx;
        row.innerHTML =
            '<div style="font-weight:700; color:var(--fa-indigo-dark); font-family:JetBrains Mono,monospace; padding:9px 6px;">CF' + idx + '</div>' +
            '<div class="fa-input-wrap" style="grid-column: span 2;"><span class="fa-input-prefix">$</span><input type="number" step="0.01" data-cf-input placeholder="0.00"' + (value != null ? ' value="' + value + '"' : '') + '></div>' +
            '<button type="button" class="fa-row-rm" title="Remove this period">&times;</button>';
        row.querySelector('.fa-row-rm').addEventListener('click', function () {
            row.parentNode.removeChild(row);
            renumberCF();
        });
        list.appendChild(row);
    }
    function renumberCF() {
        var rows = $('cf_rows').querySelectorAll('.fa-row');
        cfCount = rows.length;
        rows.forEach(function (r, i) {
            r.dataset.cfIdx = i;
            r.querySelector('div').textContent = 'CF' + i;
        });
    }
    window.cfAddRow = function () { cfAddRowDOM(null); };

    window.reCashflowClear = function () {
        $('cf_rate').value = '';
        $('cf_rows').innerHTML = '';
        cfCount = 0;
        FA.hide('cf_results');
        $('cf_err').style.display = 'none';
    };
    window.reCashflowExample = function () {
        reCashflowClear();
        $('cf_rate').value = '10';
        [-100000, 20000, 20000, 25000, 30000, 35000, 40000].forEach(function (v) { cfAddRowDOM(v); });
    };
    window.reCashflowCalc = function () {
        $('cf_err').style.display = 'none';
        var rate = FA.num('cf_rate');
        if (!isFinite(rate)) {
            $('cf_err').textContent = 'Enter a numeric discount rate.';
            $('cf_err').style.display = 'block';
            FA.hide('cf_results');
            return;
        }
        var inputs = $('cf_rows').querySelectorAll('input[data-cf-input]');
        if (inputs.length < 2) {
            $('cf_err').textContent = 'Add at least two cash flows (CF0 and CF1).';
            $('cf_err').style.display = 'block';
            FA.hide('cf_results');
            return;
        }
        var flows = [];
        for (var i = 0; i < inputs.length; i++) {
            var raw = String(inputs[i].value || '').replace(/[$,\s]/g, '').trim();
            flows.push(raw === '' ? 0 : (parseFloat(raw) || 0));
        }
        var r = rate / 100;
        var npv = 0, cum = 0, cumDisc = 0;
        var cumSeries = [], cumDiscSeries = [], periodLabels = [];
        var pay = -1, dpay = -1;
        for (var k = 0; k < flows.length; k++) {
            var d = flows[k] / Math.pow(1 + r, k);
            npv += d;
            cum += flows[k]; cumDisc += d;
            cumSeries.push(cum); cumDiscSeries.push(cumDisc); periodLabels.push('P' + k);
            if (pay  < 0 && cum     >= 0) pay  = k;
            if (dpay < 0 && cumDisc >= 0) dpay = k;
        }
        function npvAt(rate) {
            var s = 0;
            for (var j = 0; j < flows.length; j++) s += flows[j] / Math.pow(1 + rate, j);
            return s;
        }
        var irr = null;
        [0.10, 0.05, 0.20, 0.50, -0.20, 0.005].some(function (seed) {
            var x = seed;
            for (var it = 0; it < 100; it++) {
                var f = npvAt(x);
                var h = Math.max(1e-7, Math.abs(x) * 1e-7);
                var df = (npvAt(x + h) - npvAt(x - h)) / (2 * h);
                if (!isFinite(f) || !isFinite(df) || Math.abs(df) < 1e-15) break;
                var nx = x - f / df;
                if (!isFinite(nx) || nx <= -0.999) break;
                if (Math.abs(nx - x) < 1e-9) { x = nx; break; }
                x = nx;
            }
            if (isFinite(x) && Math.abs(npvAt(x)) < 1e-5) { irr = x; return true; }
            return false;
        });
        var pvFuture = npv - flows[0];
        var pi = Math.abs(flows[0]) > 0 ? pvFuture / Math.abs(flows[0]) : NaN;

        FA.renderStats('cf_stats', [
            { label:'NPV @ ' + rate + '%', value: FA.fmtMoney(npv), kind: npv >= 0 ? 'positive' : 'negative', sub: npv >= 0 ? 'creates value' : 'destroys value' },
            { label:'IRR',                 value: irr === null ? '—' : FA.fmtPercent(irr * 100, 3), sub: irr === null ? 'no real root' : 'NPV = 0' },
            { label:'Payback',             value: pay  >= 0 ? 'P' + pay  : 'never', sub: 'undiscounted' },
            { label:'Disc. payback',       value: dpay >= 0 ? 'P' + dpay : 'never', sub: 'at ' + rate + '%' },
            { label:'Profitability Index', value: isFinite(pi) ? pi.toFixed(3) : '—', sub: 'PV future ÷ |CF₀|', kind: isFinite(pi) && pi >= 1 ? 'positive' : 'negative' }
        ]);

        FA.chart('cf_chart_bar', 'bar', {
            labels: periodLabels,
            datasets: [{
                label: 'Cash flow',
                data: flows,
                backgroundColor: flows.map(function (f) { return f >= 0 ? '#10b981' : '#ec4899'; })
            }]
        }, { plugins: { legend: { display: false }}, scales: { y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        FA.chart('cf_chart_cum', 'line', {
            labels: periodLabels,
            datasets: [
                { label:'Cumulative (undiscounted)', data:cumSeries,     borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.18)', fill:true, tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Cumulative (discounted)',   data:cumDiscSeries, borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0)',    fill:false, tension:0.30, pointRadius:0, borderWidth:2 }
            ]
        }, { scales: { y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        var profile = [];
        for (var rr = -0.50; rr <= 1.001; rr += 0.025) profile.push({ rate: rr * 100, npv: npvAt(rr) });
        FA.chart('cf_chart_profile', 'line', {
            labels: profile.map(function (p) { return p.rate.toFixed(0) + '%'; }),
            datasets: [{ label:'NPV', data: profile.map(function(p){ return p.npv; }), borderColor:'#0ea5e9', backgroundColor:'rgba(14,165,233,0.18)', fill:true, tension:0.30, pointRadius:0, borderWidth:2 }]
        }, { scales: { y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        FA.show('cf_results');
    };

    /* ════════════════════════════════════════════════════════════════
       3. RENTAL PROPERTY ANALYZER
       ════════════════════════════════════════════════════════════════ */
    window.reRentalExample = function () {
        var defaults = { rp_price:350000, rp_down:25, rp_rate:7.0, rp_term:30,
            rp_rent:3000, rp_otherinc:0, rp_tax:1.2, rp_ins:1800, rp_hoa:0,
            rp_maint:8, rp_vac:5, rp_mgmt:8, rp_close:8000, rp_appr:3, rp_hold:10 };
        Object.keys(defaults).forEach(function (k) { $(k).value = String(defaults[k]); });
    };
    window.reRentalClear = function () {
        ['rp_price','rp_down','rp_rate','rp_term','rp_rent','rp_otherinc','rp_tax',
         'rp_ins','rp_hoa','rp_maint','rp_vac','rp_mgmt','rp_close','rp_appr','rp_hold']
        .forEach(function (id) { $(id).value = ''; });
        FA.hide('rp_results');
        $('rp_err').style.display = 'none';
    };
    window.reRentalCalc = function () {
        $('rp_err').style.display = 'none';
        var v = {
            price: FA.num('rp_price'), down: FA.num('rp_down'), rate: FA.num('rp_rate'), term: FA.num('rp_term'),
            rent: FA.num('rp_rent'), otherinc: FA.num('rp_otherinc', 0), tax: FA.num('rp_tax'), ins: FA.num('rp_ins'),
            hoa: FA.num('rp_hoa', 0), maint: FA.num('rp_maint'), vac: FA.num('rp_vac'), mgmt: FA.num('rp_mgmt'),
            close: FA.num('rp_close', 0), appr: FA.num('rp_appr'), hold: FA.num('rp_hold')
        };
        if (!isFinite(v.price) || v.price <= 0) {
            $('rp_err').textContent = 'Enter a positive purchase price.';
            $('rp_err').style.display = 'block';
            FA.hide('rp_results');
            return;
        }
        var loan = v.price * (1 - v.down/100);
        var months = v.term * 12;
        var rPerMo = (v.rate/100) / 12;
        var mortgageMo = pmtFor(loan, rPerMo, months);
        var grossRentYr = v.rent * 12;
        var vacancyYr = grossRentYr * (v.vac/100);
        var effectiveGross = grossRentYr - vacancyYr + v.otherinc*12;
        var taxYr = v.price * (v.tax/100);
        var hoaYr = v.hoa*12;
        var maintYr = grossRentYr * (v.maint/100);
        var mgmtYr  = grossRentYr * (v.mgmt/100);
        var opExp = taxYr + v.ins + hoaYr + maintYr + mgmtYr;
        var noi = effectiveGross - opExp;
        var capRate = (noi / v.price) * 100;
        var debtSvc = mortgageMo * 12;
        var annualCF = noi - debtSvc;
        var monthlyCF = annualCF / 12;
        var cashIn = v.price * (v.down/100) + v.close;
        var coc = cashIn > 0 ? (annualCF / cashIn) * 100 : NaN;
        var dscr = debtSvc > 0 ? noi / debtSvc : Infinity;
        var grm = grossRentYr > 0 ? v.price / grossRentYr : NaN;
        var rule1 = (v.rent / v.price) * 100;
        var rule50 = grossRentYr > 0 ? (opExp / grossRentYr) * 100 : NaN;

        var years = Math.max(1, Math.round(v.hold));
        var balance = loan, propVal = v.price, cumCF = 0, projection = [];
        for (var y = 1; y <= years; y++) {
            for (var m = 0; m < 12; m++) {
                var i = balance * rPerMo;
                var p = Math.min(mortgageMo - i, balance);
                balance -= p; if (balance < 0) balance = 0;
            }
            propVal *= 1 + v.appr/100;
            cumCF += annualCF;
            projection.push({ year:y, propVal:propVal, balance:balance, equity:propVal - balance, cumCF:cumCF, total:propVal - balance + cumCF });
        }
        var sellCost = projection[projection.length-1].propVal * 0.06;
        var saleProceeds = projection[projection.length-1].propVal - sellCost - projection[projection.length-1].balance;
        var totalProfit = saleProceeds + cumCF - cashIn;
        var equityMult = cashIn > 0 ? (saleProceeds + cumCF) / cashIn : NaN;
        var cfArr = [-cashIn];
        for (var yi = 0; yi < projection.length; yi++) cfArr.push(annualCF + (yi === projection.length - 1 ? saleProceeds : 0));
        var irr = null;
        function npvR(rate) { var s = 0; for (var j = 0; j < cfArr.length; j++) s += cfArr[j]/Math.pow(1+rate, j); return s; }
        [0.08,0.10,0.15,0.05,0.02,0.20].some(function (seed) {
            var x = seed;
            for (var it = 0; it < 80; it++) {
                var f = npvR(x), h = Math.max(1e-7, Math.abs(x)*1e-7), df = (npvR(x+h)-npvR(x-h))/(2*h);
                if (!isFinite(df) || Math.abs(df) < 1e-15) break;
                var nx = x - f/df;
                if (!isFinite(nx) || nx <= -0.999) break;
                if (Math.abs(nx-x) < 1e-9) { x = nx; break; }
                x = nx;
            }
            if (isFinite(x) && Math.abs(npvR(x)) < 1) { irr = x; return true; }
            return false;
        });

        FA.renderStats('rp_stats', [
            { label:'Monthly cash flow', value: FA.fmtMoney(monthlyCF), kind: monthlyCF >= 0 ? 'positive' : 'negative', sub: 'after PITI + opex' },
            { label:'Cap rate',          value: FA.fmtPercent(capRate, 2), sub: 'NOI ÷ price' },
            { label:'Cash-on-cash',      value: isFinite(coc) ? FA.fmtPercent(coc, 2) : '—', kind: coc >= 8 ? 'positive' : coc >= 0 ? 'warning' : 'negative', sub: 'CF ÷ invested' },
            { label:'DSCR',              value: isFinite(dscr) ? dscr.toFixed(2) : '—', kind: dscr >= 1.25 ? 'positive' : dscr >= 1 ? 'warning' : 'negative', sub: 'NOI ÷ debt service' },
            { label:'GRM',               value: isFinite(grm) ? grm.toFixed(2) : '—', sub: 'price ÷ gross rent' },
            { label:years+'-yr IRR',     value: irr === null ? '—' : FA.fmtPercent(irr*100, 2), sub: 'incl. appreciation' },
            { label:'Equity multiple',   value: isFinite(equityMult) ? equityMult.toFixed(2) + 'x' : '—', sub: 'returned ÷ invested' },
            { label:'Total profit',      value: FA.fmtMoney(totalProfit), kind: totalProfit >= 0 ? 'positive' : 'negative', sub: 'over '+years+' years' }
        ]);
        FA.renderStats('rp_rules', [
            { label:'1% rule', value: FA.fmtPercent(rule1, 3), sub: 'monthly rent ÷ price', kind: rule1 >= 1 ? 'positive' : 'warning' },
            { label:'50% rule', value: FA.fmtPercent(rule50, 1), sub: 'opex ÷ gross rent', kind: rule50 <= 50 ? 'positive' : 'warning' }
        ]);

        FA.chart('rp_chart_pie', 'doughnut', {
            labels: ['Mortgage P&I','Property tax','Insurance','HOA','Maintenance','Mgmt'],
            datasets: [{ data: [debtSvc, taxYr, v.ins, hoaYr, maintYr, mgmtYr], backgroundColor: FA.PALETTE.slice(0, 6), borderWidth: 2, borderColor: '#fff' }]
        }, { cutout: '55%', plugins: { legend: { position: 'right' }}});

        FA.chart('rp_chart_wealth', 'line', {
            labels: projection.map(function (p) { return 'Y' + p.year; }),
            datasets: [
                { label:'Equity', data: projection.map(function(p){ return p.equity; }), borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.18)', fill:true, tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Cumulative cash flow', data: projection.map(function(p){ return p.cumCF; }), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0)', fill:false, tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Total wealth', data: projection.map(function(p){ return p.total; }), borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0)', borderDash:[6,4], fill:false, tension:0.30, pointRadius:0, borderWidth:2 }
            ]
        }, { scales: { y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        FA.renderTable('rp_table',
            ['Expense', 'Annual', 'Monthly'],
            [
                ['Mortgage P&I', FA.fmtMoney(debtSvc), FA.fmtMoney(debtSvc/12)],
                ['Property tax', FA.fmtMoney(taxYr), FA.fmtMoney(taxYr/12)],
                ['Insurance',    FA.fmtMoney(v.ins), FA.fmtMoney(v.ins/12)],
                ['HOA',          FA.fmtMoney(hoaYr), FA.fmtMoney(hoaYr/12)],
                ['Maintenance',  FA.fmtMoney(maintYr), FA.fmtMoney(maintYr/12)],
                ['Management',   FA.fmtMoney(mgmtYr), FA.fmtMoney(mgmtYr/12)],
                ['NOI (no debt)', FA.fmtMoney(noi), FA.fmtMoney(noi/12)]
            ], [1, 2]);
        FA.show('rp_results');
    };

    /* ════════════════════════════════════════════════════════════════
       4. MORTGAGE AFFORDABILITY (28/36 rule)
       ════════════════════════════════════════════════════════════════ */
    window.reAffordExample = function () {
        var d = { af_income:120000, af_debts:400, af_down:60000, af_rate:7.0, af_term:30, af_tax:1.2, af_ins:1500, af_hoa:0 };
        Object.keys(d).forEach(function (k) { $(k).value = String(d[k]); });
    };
    window.reAffordClear = function () {
        ['af_income','af_debts','af_down','af_rate','af_term','af_tax','af_ins','af_hoa']
        .forEach(function (id) { $(id).value = ''; });
        FA.hide('af_results');
        $('af_err').style.display = 'none';
    };
    window.reAffordCalc = function () {
        $('af_err').style.display = 'none';
        var v = {
            income: FA.num('af_income'), debts: FA.num('af_debts', 0), down: FA.num('af_down'),
            rate: FA.num('af_rate'), term: FA.num('af_term'),
            tax: FA.num('af_tax'), ins: FA.num('af_ins', 0), hoa: FA.num('af_hoa', 0)
        };
        if (!isFinite(v.income) || v.income <= 0) {
            $('af_err').textContent = 'Enter a positive annual income.'; $('af_err').style.display = 'block'; FA.hide('af_results'); return;
        }
        var monthlyIncome = v.income / 12;
        var max28 = monthlyIncome * 0.28;
        var max36 = monthlyIncome * 0.36 - v.debts;
        var maxHousing = Math.max(0, Math.min(max28, max36));
        var rPerMo = (v.rate/100)/12, months = v.term*12;
        function houseCost(price) {
            var loan = Math.max(0, price - v.down);
            var pi = pmtFor(loan, rPerMo, months);
            var taxMo = price * (v.tax/100) / 12;
            return pi + taxMo + v.ins/12 + v.hoa;
        }
        var lo = v.down, hi = 1e9;
        for (var b = 0; b < 80; b++) {
            var mid = (lo + hi) / 2;
            if (houseCost(mid) > maxHousing) hi = mid; else lo = mid;
        }
        var maxPrice = lo;
        var loan = Math.max(0, maxPrice - v.down);
        var pi = pmtFor(loan, rPerMo, months);
        var taxMo = maxPrice * (v.tax/100) / 12;
        var pitia = pi + taxMo + v.ins/12 + v.hoa;
        var dti = (pitia + v.debts) / monthlyIncome * 100;
        var ltv = maxPrice > 0 ? (loan / maxPrice * 100) : 0;
        var frontRatio = pitia / monthlyIncome * 100;
        var binding = max28 <= max36 ? '28% front-end' : '36% back-end';

        FA.renderStats('af_stats', [
            { label:'Max home price', value: FA.fmtMoney(maxPrice), kind:'positive', sub:'binding: '+binding },
            { label:'Monthly housing', value: FA.fmtMoney(pitia), sub:'PITI + HOA' },
            { label:'Total DTI', value: FA.fmtPercent(dti, 1), kind: dti <= 36 ? 'positive' : 'negative', sub:'≤ 36% is healthy' },
            { label:'LTV',       value: FA.fmtPercent(ltv, 1), kind: ltv <= 80 ? 'positive' : 'warning', sub:'≤ 80% avoids PMI' },
            { label:'Front-end ratio', value: FA.fmtPercent(frontRatio, 1), sub:'≤ 28% rule of thumb' },
            { label:'Monthly income',  value: FA.fmtMoney(monthlyIncome), sub:'gross' }
        ]);

        FA.chart('af_chart_pie', 'doughnut', {
            labels: ['Principal & interest','Property tax','Insurance','HOA'],
            datasets: [{ data: [pi, taxMo, v.ins/12, v.hoa], backgroundColor: FA.PALETTE.slice(0, 4), borderWidth: 2, borderColor: '#fff' }]
        }, { cutout: '55%', plugins: { legend: { position: 'right' }}});

        var freeIncome = Math.max(0, monthlyIncome - pitia - v.debts);
        FA.chart('af_chart_bar', 'bar', {
            labels: ['Monthly income'],
            datasets: [
                { label:'Housing (PITI + HOA)', data:[pitia],     backgroundColor:'#6366f1' },
                { label:'Other debts',           data:[v.debts],   backgroundColor:'#ec4899' },
                { label:'Free income',           data:[freeIncome],backgroundColor:'#10b981' }
            ]
        }, { indexAxis: 'y', plugins: { legend: { position: 'right' }}, scales: { x: { stacked:true, ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}, y: { stacked:true }}});

        FA.show('af_results');
    };

    /* ════════════════════════════════════════════════════════════════
       5. RENT vs BUY
       ════════════════════════════════════════════════════════════════ */
    window.reRentVsBuyExample = function () {
        var d = { rb_price:400000, rb_down:20, rb_rate:7.0, rb_term:30, rb_tax:1.2, rb_ins:1500, rb_maint:1, rb_appr:3, rb_close:10000, rb_rent:2500, rb_rentinc:3, rb_rentins:200, rb_invret:7, rb_years:15 };
        Object.keys(d).forEach(function (k) { $(k).value = String(d[k]); });
    };
    window.reRentVsBuyClear = function () {
        ['rb_price','rb_down','rb_rate','rb_term','rb_tax','rb_ins','rb_maint','rb_appr','rb_close','rb_rent','rb_rentinc','rb_rentins','rb_invret','rb_years']
        .forEach(function (id) { $(id).value = ''; });
        FA.hide('rb_results');
        $('rb_err').style.display = 'none';
    };
    window.reRentVsBuyCalc = function () {
        $('rb_err').style.display = 'none';
        var v = {
            price: FA.num('rb_price'), down: FA.num('rb_down'), rate: FA.num('rb_rate'), term: FA.num('rb_term'),
            tax: FA.num('rb_tax'), ins: FA.num('rb_ins'), maint: FA.num('rb_maint'), appr: FA.num('rb_appr'),
            close: FA.num('rb_close'), rent: FA.num('rb_rent'), rentinc: FA.num('rb_rentinc'),
            rentins: FA.num('rb_rentins'), invret: FA.num('rb_invret'), years: FA.num('rb_years')
        };
        for (var k in v) if (!isFinite(v[k])) {
            $('rb_err').textContent = 'All fields are required and must be numeric.';
            $('rb_err').style.display = 'block';
            FA.hide('rb_results');
            return;
        }
        var rPerMo = (v.rate/100)/12, months = v.term*12;
        var loan = v.price * (1 - v.down/100);
        var pmt = pmtFor(loan, rPerMo, months);
        var down = v.price * (v.down/100);
        var portfolio = down + v.close, balance = loan, propVal = v.price, curRent = v.rent;
        var invGrowthMo = Math.pow(1 + v.invret/100, 1/12) - 1;
        var rentIncMo = Math.pow(1 + v.rentinc/100, 1/12) - 1;
        var rows = [], buyCum = down + v.close, rentCum = 0;
        for (var y = 1; y <= v.years; y++) {
            var byc = 0, ryc = 0;
            for (var m = 0; m < 12; m++) {
                var i = balance * rPerMo;
                var p = Math.min(pmt - i, balance);
                balance -= p; if (balance < 0) balance = 0;
                var taxMo = propVal * (v.tax/100)/12, insMo = v.ins/12, maintMo = propVal * (v.maint/100)/12;
                var buyMo = pmt + taxMo + insMo + maintMo;
                var rentMo = curRent + v.rentins/12;
                byc += buyMo; ryc += rentMo;
                portfolio = (portfolio + Math.max(0, buyMo - rentMo)) * (1 + invGrowthMo);
                propVal *= Math.pow(1 + v.appr/100, 1/12);
                curRent *= 1 + rentIncMo;
            }
            buyCum += byc; rentCum += ryc;
            var equity = propVal - balance;
            var sellCost = propVal * 0.06;
            var ownerNet = equity - sellCost;
            rows.push({ year:y, buyCum:buyCum, rentCum:rentCum, ownerNet:ownerNet, renterNet:portfolio, diff:ownerNet-portfolio });
        }
        var breakeven = -1;
        for (var ri = 0; ri < rows.length; ri++) if (rows[ri].diff >= 0) { breakeven = rows[ri].year; break; }
        var last = rows[rows.length-1];
        var winner = last.diff >= 0 ? 'Buying' : 'Renting';

        FA.renderStats('rb_stats', [
            { label:'Winner', value: winner, kind: last.diff >= 0 ? 'positive' : 'negative', sub: last.diff >= 0 ? 'buy ahead by '+FA.fmtMoney(last.diff) : 'rent ahead by '+FA.fmtMoney(-last.diff) },
            { label:'Breakeven year', value: breakeven > 0 ? 'Y' + breakeven : 'never', sub: 'first year buy ≥ rent' },
            { label:'Buy net wealth',  value: FA.fmtMoney(last.ownerNet),  sub:'equity − selling costs' },
            { label:'Rent net wealth', value: FA.fmtMoney(last.renterNet), sub:'invested down + savings' },
            { label:'Total spent (buy)', value: FA.fmtMoney(buyCum),  sub:'PITI + maint over '+v.years+'yr' },
            { label:'Total spent (rent)',value: FA.fmtMoney(rentCum), sub:'rent + ins over '+v.years+'yr' }
        ]);

        var labels = rows.map(function (r) { return 'Y' + r.year; });
        FA.chart('rb_chart_wealth', 'line', {
            labels: labels,
            datasets: [
                { label:'Buy net wealth',  data: rows.map(function(r){ return r.ownerNet;  }), borderColor:'#10b981', backgroundColor:'rgba(99,102,241,0.18)', fill:true, tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Rent net wealth', data: rows.map(function(r){ return r.renterNet; }), borderColor:'#ec4899', backgroundColor:'rgba(236,72,153,0.18)', fill:true, tension:0.30, pointRadius:0, borderWidth:2 }
            ]
        }, { scales: { y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        FA.chart('rb_chart_cost', 'line', {
            labels: labels,
            datasets: [
                { label:'Cumulative buy cost',  data: rows.map(function(r){ return r.buyCum;  }), borderColor:'#6366f1', fill:false, tension:0.30, pointRadius:0, borderWidth:2 },
                { label:'Cumulative rent cost', data: rows.map(function(r){ return r.rentCum; }), borderColor:'#f59e0b', fill:false, tension:0.30, pointRadius:0, borderWidth:2 }
            ]
        }, { scales: { y: { ticks: { callback: function(v){ return FA.fmtMoney(v,{digits:0}); }}}}});

        FA.show('rb_results');
    };

    /* Seed initial CF rows on page load so the section is usable
       without user having to click +Add first. */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCF);
    } else {
        initCF();
    }
    function initCF() {
        if ($('cf_rows') && $('cf_rows').children.length === 0) {
            for (var i = 0; i < 5; i++) cfAddRowDOM(null);
        }
    }
}());
