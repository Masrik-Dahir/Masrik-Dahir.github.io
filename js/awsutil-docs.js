// ── Syntax highlighting token sets ──
var PY_KW = new Set(["def","async","await","class","return","import","from","if","else","elif","for","while","try","except","finally","with","as","pass","break","continue","yield","lambda","None","True","False","in","not","and","or","is","raise"]);
var PY_BI = new Set(["str","int","float","bool","bytes","list","dict","set","tuple","Any","Optional","Union","Callable","Iterator","Generator","Sequence","Mapping","Iterable","Type","ClassVar"]);
var LANG_KW = {
  csharp: new Set(["public","private","protected","internal","static","async","await","class","record","struct","interface","enum","void","var","new","return","using","namespace","sealed","abstract","virtual","override","readonly","const","null","true","false","this","base","Task"]),
  go: new Set(["func","type","struct","interface","map","chan","go","defer","return","if","else","for","range","switch","case","default","var","const","package","import","nil","true","false","error","context","Context"]),
  java: new Set(["public","private","protected","static","final","abstract","class","record","interface","enum","void","return","new","null","true","false","this","super","throws","extends","implements","CompletableFuture","Optional"]),
  rust: new Set(["pub","fn","async","await","struct","enum","impl","trait","type","let","mut","const","self","Self","return","use","mod","where","Result","Option","Vec","Box","Arc","String","dyn"]),
  typescript: new Set(["function","async","await","class","interface","type","enum","const","let","var","return","export","import","new","null","undefined","true","false","this","Promise","Partial","Record"]),
  ruby: new Set(["def","class","module","end","do","return","nil","true","false","self","require","include","extend","attr_reader","attr_accessor"])
};
var LANG_TY = {
  csharp: new Set(["string","int","long","float","double","bool","decimal","byte","object","dynamic","List","Dictionary","IEnumerable","Task","CancellationToken"]),
  go: new Set(["string","int","int64","float64","bool","byte","error","any"]),
  java: new Set(["String","int","long","float","double","boolean","byte","Object","List","Map","Set"]),
  rust: new Set(["str","i32","i64","f64","bool","u8","usize","String"]),
  typescript: new Set(["string","number","boolean","void","any","unknown","never","Array","Map","Set","Promise"]),
  ruby: new Set(["String","Integer","Float","Symbol","Hash","Array","Boolean","NilClass"])
};
var OP_SET = new Set(["->","=>","=",":",",","(",")","[","]","{","}","|","*","**","&","<",">",";"]);
var TOK_RE = /\"[^\"]*\"|'[^']*'|[a-zA-Z_]\w*(?:\.\w+)*|\S|\s+/g;
var PASCAL_RE = /^[A-Z][a-zA-Z0-9]+$/;
var NUM_RE = /^[0-9]/;

function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function _colorTok(tok, kw, ty, ma) {
  if (kw.has(tok)) return '<span class="syn-kw">' + esc(tok) + '</span>';
  if (ty.has(tok)) return '<span class="syn-type">' + esc(tok) + '</span>';
  if (ma[tok]) return '<a href="#' + ma[tok] + '" class="syn-model">' + esc(tok) + '</a>';
  if (tok.charAt(0) === '"' || tok.charAt(0) === "'") return '<span class="syn-str">' + esc(tok) + '</span>';
  if (NUM_RE.test(tok)) return '<span class="syn-num">' + esc(tok) + '</span>';
  if (OP_SET.has(tok)) return '<span class="syn-op">' + esc(tok) + '</span>';
  if (PASCAL_RE.test(tok) && !ty.has(tok)) {
    if (ma[tok]) return '<a href="#' + ma[tok] + '" class="syn-model">' + esc(tok) + '</a>';
    return '<span class="syn-type">' + esc(tok) + '</span>';
  }
  return esc(tok);
}

function colorize(sig, lang, ma) {
  var kw = lang === 'python' ? PY_KW : (LANG_KW[lang] || new Set());
  var ty = lang === 'python' ? PY_BI : (LANG_TY[lang] || new Set());
  var tokens = sig.match(TOK_RE) || [];
  return tokens.map(function(t) { return _colorTok(t, kw, ty, ma); }).join('');
}

function linkType(ann, ma) {
  if (!ann) return '';
  var tokens = ann.match(/[a-zA-Z_]\w*|\S|\s+/g) || [];
  return tokens.map(function(t) {
    if (ma[t]) return '<a href="#' + ma[t] + '" class="syn-model">' + esc(t) + '</a>';
    if (PY_BI.has(t) || PASCAL_RE.test(t)) return '<span class="syn-type">' + esc(t) + '</span>';
    if ("|,[,]".indexOf(t) >= 0) return '<span class="syn-op">' + esc(t) + '</span>';
    return esc(t);
  }).join('');
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Vue App ──
document.addEventListener('DOMContentLoaded', function() {
  if (typeof AWSUTIL_DATA === 'undefined') return;
  var d = AWSUTIL_DATA;

  var app = Vue.createApp({
    data: function() {
      return {
        d: d,
        searchQuery: '',
        expandedMods: {},
        openEntries: {}
      };
    },
    computed: {
      filteredCategories: function() {
        var q = this.searchQuery.toLowerCase().trim();
        if (!q) return this.d.categories;
        var out = [];
        for (var i = 0; i < this.d.categories.length; i++) {
          var cat = this.d.categories[i];
          var mods = [];
          for (var j = 0; j < cat.modules.length; j++) {
            var mod = cat.modules[j];
            if (mod.name.toLowerCase().indexOf(q) >= 0) { mods.push(mod); continue; }
            var anyFn = false;
            for (var k = 0; k < mod.funcs.length; k++) {
              if (mod.funcs[k].n.toLowerCase().indexOf(q) >= 0) { anyFn = true; break; }
            }
            if (!anyFn) {
              for (var k = 0; k < mod.models.length; k++) {
                if (mod.models[k].n.toLowerCase().indexOf(q) >= 0) { anyFn = true; break; }
              }
            }
            if (anyFn) mods.push(mod);
          }
          if (mods.length) out.push({name: cat.name, modules: mods});
        }
        return out;
      }
    },
    methods: {
      slugify: slugify,
      colorSig: function(sig) { return colorize(sig, this.d.lang, this.d.modelAnchors); },
      linkType: function(ann) { return linkType(ann, this.d.modelAnchors); },
      toggleMod: function(name) { this.expandedMods[name] = !this.expandedMods[name]; },
      toggleEntry: function(id) { this.openEntries[id] = !this.openEntries[id]; },
      onSearch: function() { /* filteredCategories computed handles it */ }
    },
    mounted: function() {
      var self = this;
      // Dismiss loader
      var loader = document.getElementById('page-loader');
      if (loader) { loader.classList.add('done'); setTimeout(function(){ loader.remove(); }, 400); }

      // Scroll progress
      var prog = document.querySelector('.scroll-progress');
      if (prog) window.addEventListener('scroll', function() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? (window.scrollY / h * 100) : 0) + '%';
      }, { passive: true });

      // Hash navigation
      function openHash() {
        var hash = location.hash;
        if (!hash || hash.length < 2) return;
        var id = hash.substring(1);
        self.$set ? self.$set(self.openEntries, id, true) : (self.openEntries[id] = true);
        self.$nextTick(function() {
          var el = document.getElementById(id);
          if (el) el.scrollIntoView({block:'start'});
        });
      }
      window.addEventListener('hashchange', openHash);
      if (location.hash) openHash();

      // Resizable sidebar
      var handle = document.querySelector('.sidebar-resize');
      var sidebar = document.getElementById('sidebar');
      if (handle && sidebar) {
        var startX, startW;
        function onMove(e) {
          var newW = Math.min(500, Math.max(220, startW + (e.clientX - startX)));
          document.documentElement.style.setProperty('--sidebar-w', newW + 'px');
        }
        function onUp() {
          handle.classList.remove('dragging');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.body.style.userSelect = '';
          document.body.style.cursor = '';
          localStorage.setItem('awsutil-sidebar-w', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w').trim());
        }
        handle.addEventListener('mousedown', function(e) {
          e.preventDefault();
          handle.classList.add('dragging');
          startX = e.clientX;
          startW = sidebar.offsetWidth;
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'col-resize';
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        });
        var savedW = localStorage.getItem('awsutil-sidebar-w');
        if (savedW) document.documentElement.style.setProperty('--sidebar-w', savedW);
      }
    }
  });

  app.mount('#api-docs-wrapper');
});
