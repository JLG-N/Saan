/* ============================================================
   STYLES — the pixel-game design system, as a single global
   <style> component mounted once at the root of the app.
   ============================================================ */

export function Styles() {
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

    .saan-root{
      --color-bg:           #FAF8F5;
      --color-surface:      #FFFFFF;
      --color-ink:          #1C1B19;
      --color-ink-soft:     #6B675F;
      --color-line:         #E7E3DC;
      --color-primary:      #1F6F54;
      --color-primary-dark: #175A44;
      --color-primary-soft: #E3F0EA;
      --color-warm:         #E8734A;
      --color-warm-text:    #A8461C;
      --color-warm-soft:    #FBEAE1;
      --color-error:        #C0392B;
      --color-error-soft:   #FBEAEA;

      --font-display: 'Sora', sans-serif;
      --font-body:    'Inter', sans-serif;
      --font-xs:   12px;
      --font-sm:   13px;
      --font-base: 15px;
      --font-label:14px;
      --font-lg:   16px;
      --font-xl:   19px;
      --font-2xl:  26px;

      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-5: 20px;
      --space-6: 24px;
      --space-8: 32px;
      --space-12: 48px;

      --shadow-card: 0 1px 2px rgba(28,27,25,.08), 0 12px 32px rgba(28,27,25,.08);

      background:var(--color-bg); color:var(--color-ink); font-family:var(--font-body);
      font-size:var(--font-base); line-height:1.5; min-height:100vh; width:100%;
    }
    .saan-root *{ box-sizing:border-box; }
    .sn-shell{ max-width:1200px; margin:0 auto; padding:var(--space-8) var(--space-6) var(--space-12); }

    .sn-h1{ font-family:var(--font-display); font-weight:700; font-size:var(--font-2xl); line-height:1.2; margin:0 0 var(--space-1); }
    .sn-h2{ font-family:var(--font-display); font-weight:600; font-size:var(--font-lg); line-height:1.3; color:var(--color-ink); margin:0 0 var(--space-3); }
    .sn-dim{ color:var(--color-ink-soft); }
    .sn-label{
      font-family:var(--font-body); font-size:var(--font-xs); text-transform:uppercase; letter-spacing:.04em;
      color:var(--color-ink-soft); margin-bottom:var(--space-2); display:block;
    }

    .sn-box{
      border:1px solid var(--color-line); background:var(--color-surface); border-radius:12px;
      padding:var(--space-3) var(--space-4); font-size:var(--font-sm); color:var(--color-ink);
    }
    .sn-box.filled{ background:var(--color-bg); }
    .sn-box.error{ border-color:var(--color-error); background:var(--color-error-soft); }

    .sn-input{
      border:1px solid var(--color-line); border-radius:10px; padding:var(--space-3) var(--space-4);
      font-size:var(--font-sm); font-family:var(--font-body); color:var(--color-ink);
      background:var(--color-surface); width:100%; outline:none; transition:border-color .15s;
    }
    .sn-input:focus{ border-color:var(--color-primary); }
    .sn-input::placeholder{ color:var(--color-ink-soft); }

    .sn-btn{
      display:inline-block; border:none; border-radius:10px;
      padding:var(--space-3) var(--space-5);
      font-family:var(--font-display); font-weight:600; font-size:var(--font-label); text-align:center;
      background:var(--color-primary); color:#fff;
      cursor:pointer; user-select:none; transition:background .15s, opacity .15s;
    }
    .sn-btn:hover{ background:var(--color-primary-dark); }
    .sn-btn:active{ opacity:.85; }
    .sn-btn.outline{ background:transparent; color:var(--color-ink); border:1px solid var(--color-line); }
    .sn-btn.outline:hover{ background:var(--color-bg); border-color:var(--color-ink-soft); }
    .sn-btn:disabled{ opacity:.45; cursor:not-allowed; }
    .sn-btn:disabled:hover{ background:var(--color-primary); }

    .sn-placeholder-img{
      border-radius:12px;
      background:linear-gradient(135deg,#E8DFCF,#D8C9AE);
      display:flex; align-items:center; justify-content:center; color:rgba(28,27,25,.35); font-size:var(--font-sm);
    }

    .sn-navbar{
      display:flex; align-items:center; justify-content:space-between;
      background:var(--color-surface); border:1px solid var(--color-line); border-radius:16px;
      box-shadow:var(--shadow-card);
      padding:var(--space-3) var(--space-4); margin-bottom:var(--space-6); font-size:var(--font-sm);
    }
    .sn-navbar .logo{ font-family:var(--font-display); font-weight:700; font-size:var(--font-lg); cursor:pointer; }
    .sn-navbar .links{ display:flex; gap:var(--space-2); align-items:center; }
    .sn-navbar .links span{
      font-family:var(--font-display); font-weight:600; font-size:var(--font-xs);
      color:var(--color-ink-soft); cursor:pointer; padding:var(--space-2) var(--space-3); border-radius:999px;
    }
    .sn-navbar .links span.active{ color:var(--color-primary-dark); background:var(--color-primary-soft); }
    .sn-navbar .links span:hover{ color:var(--color-ink); }
    .sn-navbar .user{
      width:32px; height:32px; border-radius:50%; background:var(--color-primary-soft); color:var(--color-primary-dark);
      display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:600; font-size:12px;
      margin-left:var(--space-2);
    }

    .sn-layout-2col{ display:grid; grid-template-columns:200px 1fr; gap:var(--space-4); }
    .sn-layout-2col-rev{ display:grid; grid-template-columns:1fr 320px; gap:var(--space-4); }
    .sn-sidebar .sn-box{ margin-bottom:var(--space-2); cursor:pointer; font-size:var(--font-sm); }
    .sn-sidebar .sn-box.active{ background:var(--color-primary-soft); border-color:var(--color-primary); color:var(--color-primary-dark); font-weight:600; }

    .sn-card-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-4); }
    .sn-spot-card{
      cursor:pointer; background:var(--color-surface); border:1px solid var(--color-line);
      border-radius:16px; box-shadow:var(--shadow-card); padding:var(--space-3);
      transition:transform .15s, box-shadow .15s;
    }
    .sn-spot-card:hover{ transform:translateY(-2px); }
    .sn-spot-card .sn-placeholder-img{ height:100px; margin-bottom:var(--space-2); }
    .sn-spot-media{ position:relative; }
    .sn-spot-fav{
      position:absolute; top:8px; right:8px; width:26px; height:26px; border-radius:50%;
      background:rgba(255,255,255,.92); display:flex; align-items:center; justify-content:center;
      cursor:pointer; font-size:14px; color:var(--color-warm-text);
    }

    .sn-split{
      display:grid; grid-template-columns:1fr 1fr; min-height:340px;
      border:1px solid var(--color-line); border-radius:16px; overflow:hidden; box-shadow:var(--shadow-card);
    }
    .sn-split .sn-left{
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      background:var(--color-primary); color:#fff; text-align:center; padding:var(--space-6);
    }
    .sn-split .sn-right{ padding:var(--space-12); display:flex; flex-direction:column; gap:var(--space-3); justify-content:center; background:var(--color-surface); }

    .sn-stack{ display:flex; flex-direction:column; gap:var(--space-3); }
    .sn-row{ display:flex; gap:var(--space-3); }
    .sn-row > *{ flex:1; }
    .sn-row.sn-row-tight{ gap:var(--space-3); }
    .sn-row.sn-row-fixed > *{ flex:none; }

    .sn-breadcrumb{ font-size:var(--font-sm); color:var(--color-ink-soft); margin-bottom:var(--space-3); cursor:pointer; display:inline-block; }
    .sn-breadcrumb:hover{ color:var(--color-primary-dark); }
    .sn-stars{ font-size:var(--font-base); color:var(--color-warm-text); letter-spacing:1px; }

    .sn-list-row{
      display:flex; align-items:center; justify-content:space-between;
      background:var(--color-surface); border:1px solid var(--color-line); border-radius:12px;
      padding:var(--space-3) var(--space-4); font-size:var(--font-sm); gap:var(--space-3);
      transition:border-color .15s;
    }
    .sn-list-row.sn-clickable{ cursor:pointer; }
    .sn-list-row.sn-clickable:hover{ border-color:var(--color-primary); }
    .sn-mini-btn{
      font-family:var(--font-body); font-size:12px;
      border:1px solid var(--color-line); background:var(--color-surface); color:var(--color-ink-soft);
      border-radius:6px; padding:3px 7px; cursor:pointer; transition:background .15s, color .15s;
    }
    .sn-mini-btn:hover{ background:var(--color-primary-soft); color:var(--color-primary-dark); border-color:var(--color-primary-soft); }

    .sn-tag{
      display:inline-block; font-family:var(--font-display); font-weight:600; font-size:12px;
      border-radius:999px; padding:5px 12px;
    }
    .sn-tag:not(.draft){ background:var(--color-primary-soft); color:var(--color-primary-dark); }
    .sn-tag.draft{ background:var(--color-warm-soft); color:var(--color-warm-text); }

    .sn-footer-bar{
      border-top:1px solid var(--color-line); margin-top:var(--space-4); padding-top:var(--space-3);
      display:flex; justify-content:center; gap:var(--space-4); font-size:var(--font-xs); color:var(--color-ink-soft);
    }

    .sn-empty{ border:1px dashed var(--color-line); border-radius:16px; padding:var(--space-8) var(--space-4); text-align:center; background:var(--color-surface); }
    .sn-empty .sn-h1{ font-size:var(--font-lg); }

    .sn-error-banner{
      border:1px solid var(--color-error); background:var(--color-error-soft); border-radius:10px;
      color:var(--color-error); padding:var(--space-3) var(--space-4); margin-bottom:var(--space-4);
      font-size:var(--font-sm);
    }
    .sn-loading{ color:var(--color-ink-soft); font-size:var(--font-sm); padding:var(--space-4) 0; }
    .sn-link{ color:var(--color-primary); text-decoration:underline; cursor:pointer; }
  `}</style>
  );
}
