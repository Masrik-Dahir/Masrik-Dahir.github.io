/* nyc-widgets.js
   Polls nyc-city.js APIs and (a) builds the chip grids inside each
   widget tooltip and (b) syncs live status text + active-chip
   highlights. Originally an inline <script> block in index.html;
   extracted so nyc.html can reuse it. Safe to load multiple times —
   each builder is gated on a `_built` flag on the host node and on
   the presence of the matching `window.getAll*` API. */
(function(){
    if (window.__nycWidgetsBooted) return;
    window.__nycWidgetsBooted = true;

    function setText(id, val){
        var el = document.getElementById(id);
        if (el && el.textContent !== val) el.textContent = val;
    }

    /* Strip any native title attributes so the browser default
       tooltip never appears on top of our custom rich tooltip. */
    ['citySwitchBtn','weatherWidget','missileBtn'].forEach(function(id){
        var n = document.getElementById(id);
        if (!n) return;
        n.removeAttribute('title');
        n.querySelectorAll('[title]').forEach(function(c){ c.removeAttribute('title'); });
    });
    document.querySelectorAll('.widget-host,.widget-host *').forEach(function(c){ c.removeAttribute('title'); });

    /* ── build the chip grids inside each tooltip ─────────────────────── */
    function buildCityGrid(){
        var host = document.getElementById('ttCityGrid');
        if (!host || host._built) return;
        if (!window.getAllCities) return;
        var cities = window.getAllCities();
        host.innerHTML = '';
        var CITY_FLAGS = {
            'NEW YORK':'🇺🇸','CHICAGO':'🇺🇸','TOKYO':'🇯🇵','BEIJING':'🇨🇳',
            'LONDON':'🇬🇧','DUBAI':'🇦🇪','PARIS':'🇫🇷','PRAGUE':'🇨🇿'
        };
        cities.forEach(function(c){
            var b = document.createElement('button');
            b.className = 'tt-chip tt-chip-flag';
            b.dataset.idx = c.index;
            var flag = CITY_FLAGS[c.name] || '';
            b.innerHTML = (flag ? '<span class="tt-flag">' + flag + '</span>' : '') + c.name;
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttCityHoverRow');
                var val = document.getElementById('ttCityHover');
                if (val) val.textContent = (flag ? flag + ' ' : '') + c.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttCityHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(e){
                e.stopPropagation();
                if (window.flyToCity) window.flyToCity(c.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildWeatherGrid(){
        var host = document.getElementById('ttWeatherGrid');
        if (!host || host._built) return;
        if (!window.getAllWeatherEvents) return;
        var evts = window.getAllWeatherEvents();
        host.innerHTML = '';
        evts.forEach(function(e){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = e.index;
            b.innerHTML = '<i class="fa ' + e.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttWeatherHoverRow');
                var val = document.getElementById('ttWeatherHover');
                if (val) val.textContent = e.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttWeatherHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setWeatherEvent) window.setWeatherEvent(e.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildMissileGrid(){
        var host = document.getElementById('ttMissileGrid');
        if (!host || host._built) return;
        if (!window.getAllMissileTypes) return;
        var types = window.getAllMissileTypes();
        host.innerHTML = '';
        types.forEach(function(t){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = t.index;
            b.innerHTML = '<i class="fa ' + t.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttMissileHoverRow');
                var val = document.getElementById('ttMissileHover');
                if (val) val.textContent = t.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttMissileHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setMissileTypeIndex) window.setMissileTypeIndex(t.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildDefenceGrid(){
        var host = document.getElementById('ttDefenceGrid');
        if (!host || host._built) return;
        if (!window.getAllDefenceTypes) return;
        var types = window.getAllDefenceTypes();
        host.innerHTML = '';
        types.forEach(function(t){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = t.index;
            b.innerHTML = '<i class="fa ' + t.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttDefenceHoverRow');
                var val = document.getElementById('ttDefenceHover');
                if (val) val.textContent = t.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttDefenceHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setDefenceTypeIndex) window.setDefenceTypeIndex(t.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildParadeGrid(){
        var host = document.getElementById('ttParadeGrid');
        if (!host || host._built) return;
        if (!window.getAllParadeThemes) return;
        var themes = window.getAllParadeThemes();
        host.innerHTML = '';
        themes.forEach(function(t){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = t.index;
            if (t.colorA) b.style.setProperty('--diamond-a', t.colorA);
            if (t.colorB) b.style.setProperty('--diamond-b', t.colorB);
            b.innerHTML = '<i class="fa ' + t.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttParadeHoverRow');
                var val = document.getElementById('ttParadeHover');
                if (val) val.textContent = t.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttParadeHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setParadeThemeIndex) window.setParadeThemeIndex(t.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildSuperheroGrid(){
        var host = document.getElementById('ttSuperheroGrid');
        if (!host || host._built) return;
        if (!window.getAllSuperheroUniverses) return;
        var us = window.getAllSuperheroUniverses();
        host.innerHTML = '';
        us.forEach(function(u){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = u.index;
            if (u.colorA) b.style.setProperty('--diamond-a', u.colorA);
            if (u.colorB) b.style.setProperty('--diamond-b', u.colorB);
            b.innerHTML = '<i class="fa ' + u.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttSuperheroHoverRow');
                var val = document.getElementById('ttSuperheroHover');
                if (val) val.textContent = u.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttSuperheroHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setSuperheroUniverseIndex) window.setSuperheroUniverseIndex(u.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildAbductionMissileGrid(){
        var host = document.getElementById('ttAbductionMissileGrid');
        if (!host || host._built) return;
        if (!window.getAllAbductionMissileTypes) return;
        var ms = window.getAllAbductionMissileTypes();
        host.innerHTML = '';
        ms.forEach(function(m){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = m.index;
            if (m.colorA) b.style.setProperty('--diamond-a', m.colorA);
            if (m.colorB) b.style.setProperty('--diamond-b', m.colorB);
            b.innerHTML = '<i class="fa ' + m.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttAbductionHoverRow');
                var val = document.getElementById('ttAbductionHover');
                if (val) val.textContent = m.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttAbductionHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setAbductionMissileTypeIndex) window.setAbductionMissileTypeIndex(m.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function buildAbductionGrid(){
        var host = document.getElementById('ttAbductionGrid');
        if (!host || host._built) return;
        if (!window.getAllAbductionShips) return;
        var ships = window.getAllAbductionShips();
        host.innerHTML = '';
        ships.forEach(function(s){
            var b = document.createElement('button');
            b.className = 'tt-chip';
            b.dataset.idx = s.index;
            if (s.colorA) b.style.setProperty('--diamond-a', s.colorA);
            if (s.colorB) b.style.setProperty('--diamond-b', s.colorB);
            b.innerHTML = '<i class="fa ' + s.icon + '"></i>';
            b.addEventListener('mouseenter', function(){
                var row = document.getElementById('ttAbductionHoverRow');
                var val = document.getElementById('ttAbductionHover');
                if (val) val.textContent = s.name;
                if (row) row.classList.add('active');
            });
            b.addEventListener('mouseleave', function(){
                var row = document.getElementById('ttAbductionHoverRow');
                if (row) row.classList.remove('active');
            });
            b.addEventListener('click', function(ev){
                ev.stopPropagation();
                if (window.setAbductionShipIndex) window.setAbductionShipIndex(s.index);
            });
            host.appendChild(b);
        });
        host._built = true;
    }
    function syncActive(hostId, currentIdx){
        var host = document.getElementById(hostId);
        if (!host) return;
        var chips = host.children;
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('active', String(currentIdx) === chips[i].dataset.idx);
        }
    }
    function pollCity(){
        buildCityGrid(); buildWeatherGrid(); buildMissileGrid(); buildDefenceGrid();
        buildParadeGrid(); buildAbductionGrid(); buildAbductionMissileGrid();
        buildSuperheroGrid();

        /* ── FLIGHT widget ── */
        if (window.getCityName)        setText('ttCityFrom', window.getCityName());
        if (window.getNextCityName)    setText('ttCityTo',   window.getNextCityName());
        if (window.getCurrentCityIndex) syncActive('ttCityGrid', window.getCurrentCityIndex());

        /* ── WEATHER widget ── */
        if (window.getWeatherEventIcon){
            var wi = document.getElementById('wwIcon');
            if (wi){
                var ic = window.getWeatherEventIcon();
                if (wi._cur !== ic){ wi.className = 'fa ww-icon ' + ic; wi._cur = ic; }
            }
        }
        if (window.getWeatherEventName) setText('ttWeatherName', window.getWeatherEventName());
        if (window.isWeatherPinned){
            var pinned = window.isWeatherPinned();
            var ww = document.getElementById('weatherWidget');
            if (ww) ww.classList.toggle('pinned', pinned);
            setText('ttWeatherStatus', pinned ? 'PINNED' : 'AUTO');
        }
        if (window.getWeatherEventIndex) syncActive('ttWeatherGrid', window.getWeatherEventIndex());

        /* ── ATTACK widget ── */
        if (window.getMissileTypeIcon){
            var mIc = document.getElementById('missileIcon');
            if (mIc){
                var icN = window.getMissileTypeIcon();
                if (mIc._cur !== icN){ mIc.className = 'fa missile-icon ' + icN; mIc._cur = icN; }
            }
        }
        if (window.getMissileTypeName) setText('ttMissileType', window.getMissileTypeName());
        if (window.isMissileArmed){
            var armed = window.isMissileArmed();
            var mb = document.getElementById('missileBtn');
            if (mb) mb.classList.toggle('armed', armed);
            setText('ttMissileStatus', armed ? 'ARMED' : 'IDLE');
        }
        if (window.getMissileTypeIndex) syncActive('ttMissileGrid', window.getMissileTypeIndex());

        /* ── DEFENCE widget ── */
        if (window.getDefenceTypeIcon){
            var dIc = document.getElementById('defenceIcon');
            if (dIc){
                var dIcN = window.getDefenceTypeIcon();
                if (dIc._cur !== dIcN){ dIc.className = 'fa defence-icon ' + dIcN; dIc._cur = dIcN; }
            }
        }
        if (window.getDefenceTypeName) setText('ttDefenceType', window.getDefenceTypeName());
        if (window.isDefenceMode){
            var dm = window.isDefenceMode();
            var dWrap = document.getElementById('defenceBtn');
            if (dWrap) dWrap.classList.toggle('offline', !dm);
            setText('ttDefenceStatus', dm ? 'DEFEND CITY!' : 'OFFLINE');
        }
        if (window.getDefenceTypeIndex) syncActive('ttDefenceGrid', window.getDefenceTypeIndex());

        /* ── PARADE widget polling ── */
        if (window.isParadeOn){
            var pOn = window.isParadeOn();
            var pWrap = document.getElementById('paradeBtn');
            if (pWrap) pWrap.classList.toggle('active', pOn);
            setText('ttPrdStatus', pOn ? 'MARCHING' : 'IDLE');
            if (window.getParadeStats){
                var ps = window.getParadeStats();
                setText('ttPrdAir',    pOn ? String(ps.air)    : '—');
                setText('ttPrdGround', pOn ? String(ps.ground) : '—');
            }
        }
        if (window.getParadeThemeName)  setText('ttPrdTheme', window.getParadeThemeName());
        if (window.getParadeThemeIndex) syncActive('ttParadeGrid', window.getParadeThemeIndex());

        /* ── ABDUCTION widget polling ── */
        if (window.isAbductionOn){
            var aOn = window.isAbductionOn();
            var aWrap = document.getElementById('abductionBtn');
            if (aWrap) aWrap.classList.toggle('active', aOn);
            if (window.getAbductionStats){
                var as = window.getAbductionStats();
                var phaseLabel = aOn ? (as.phase || '—').toUpperCase() : 'IDLE';
                setText('ttAbdPhase', phaseLabel);
                setText('ttAbdAbducted', aOn ? (as.abducted + ' / ' + as.target) : '—');
            } else {
                setText('ttAbdPhase', aOn ? 'ACTIVE' : 'IDLE');
            }
        }
        if (window.getAbductionShipName)  setText('ttAbdShip', window.getAbductionShipName());
        if (window.getAbductionShipIndex) syncActive('ttAbductionGrid', window.getAbductionShipIndex());
        if (window.getAbductionMissileTypeName)  setText('ttAbdMissile', window.getAbductionMissileTypeName());
        if (window.getAbductionMissileTypeIndex) syncActive('ttAbductionMissileGrid', window.getAbductionMissileTypeIndex());
        if (window.getAbductionShipIcon){
            var ai = document.getElementById('abdIcon');
            if (ai){
                var aIc = window.getAbductionShipIcon();
                if (ai._cur !== aIc){ ai.className = 'fa abd-icon ' + aIc; ai._cur = aIc; }
            }
        }

        /* ── SUPERHERO widget polling ── */
        if (window.isSuperheroOn){
            var supOn = window.isSuperheroOn();
            var sWrap = document.getElementById('superheroBtn');
            if (sWrap) sWrap.classList.toggle('active', supOn);
            if (window.getSuperheroStats){
                var ss = window.getSuperheroStats();
                setText('ttSupAlive',  supOn ? String(ss.alive) : '—');
                setText('ttSupWinner', ss.winner ? ss.winner : (supOn ? '—' : 'NONE'));
            }
        }
        if (window.getSuperheroUniverseName)  setText('ttSupUniverse', window.getSuperheroUniverseName());
        if (window.getSuperheroUniverseIndex) syncActive('ttSuperheroGrid', window.getSuperheroUniverseIndex());

        /* ── RECONSTRUCTION widget polling ── */
        if (window.isReconstructing){
            var rOn = window.isReconstructing();
            var rWrap = document.getElementById('reconstructBtn');
            if (rWrap) rWrap.classList.toggle('active', rOn);
            setText('ttRcnStatus', rOn ? 'REBUILDING' : 'IDLE');
            if (window.getReconstructionTimer){
                var rT = window.getReconstructionTimer();
                setText('ttRcnTimer', rOn ? (rT / 1000).toFixed(1) + ' s' : '—');
            }
            if (window.getReconstructionDamage){
                var rD = window.getReconstructionDamage();
                setText('ttRcnDamage', rOn ? String(rD) : '—');
            }
        }

        setTimeout(pollCity, 350);
    }
    pollCity();
}());
