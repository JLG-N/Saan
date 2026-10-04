




export function Styles() {
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

    .saan-root{
      --color-bg:           #F4EEDF;
      --color-surface:      #FFFFFF;
      --color-ink:          #1E1B18;
      --color-ink-soft:     #625D57;
      --color-line:         #E9E1D8;
      --color-primary:      #1D705C;
      --color-primary-dark: #164F44;
      --color-primary-soft: #E7F3EE;
      --color-warm:         #D7734B;
      --color-warm-text:    #A75A30;
      --color-warm-soft:    #FBE9E0;
      --color-error:        #B93C34;
      --color-error-soft:   #FCE9E9;

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

      background:linear-gradient(180deg, #faf7ef 0%, #f2ebdc 100%);
      color:var(--color-ink); font-family:var(--font-body); font-size:var(--font-base);
      line-height:1.5; min-height:100vh; width:100%;
    }
    html,body,#root{ width:100%; min-height:100%; margin:0; }
    .saan-root *{ box-sizing:border-box; }
    #root:has(.saan-auth-root){ position:fixed; inset:0; width:100vw; height:100vh; background:var(--color-primary); }
    .saan-root.saan-auth-root{ position:fixed; inset:0; width:100vw; height:100vh; overflow:auto; background:var(--color-primary); }
    .sn-shell{ max-width:1180px; margin:0 auto; padding:var(--space-8) var(--space-6) var(--space-12); }
    .sn-shell.sn-shell-auth{ width:100%; max-width:none; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:var(--space-6); background:var(--color-primary); }
    .sn-shell-auth > .sn-split{ width:min(100%, 860px); }

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
      transition:all .15s ease;
    }
    .sn-box.filled{ background:var(--color-bg); }
    .sn-box.error{ border-color:var(--color-error); background:var(--color-error-soft); }

    .sn-input{
      border:1px solid var(--color-line); border-radius:14px; padding:var(--space-4) var(--space-5);
      font-size:var(--font-sm); font-family:var(--font-body); color:var(--color-ink);
      background:rgba(255,255,255,.8); width:100%; outline:none; transition:border-color .15s, box-shadow .15s;
      box-shadow:0 1px 0 rgba(20,22,24,.02);
    }
    .sn-input:focus{ border-color:var(--color-primary); box-shadow:0 0 0 4px rgba(29,112,92,.08); }
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
    .sn-btn.danger{ background:var(--color-error); }
    .sn-btn.danger:hover{ background:#9B2E2B; }
    .sn-btn:disabled{ opacity:.45; cursor:not-allowed; }
    .sn-btn:disabled:hover{ background:var(--color-primary); }

    .sn-warning-card{
      border:1px solid rgba(185, 60, 52, 0.25); background:var(--color-error-soft); border-radius:14px;
      padding:var(--space-4); color:var(--color-ink);
    }
    .sn-warning-title{
      font-family:var(--font-display); font-weight:700; font-size:var(--font-base); color:var(--color-error);
      margin-bottom:var(--space-2);
    }
    .sn-warning-copy{ color:var(--color-ink); font-size:var(--font-sm); line-height:1.5; margin-bottom:var(--space-3); }
    .sn-warning-actions{ display:flex; gap:var(--space-2); justify-content:flex-end; }

    .sn-placeholder-img{
      border-radius:12px;
      background:linear-gradient(135deg,#E8DFCF,#D8C9AE);
      display:flex; align-items:center; justify-content:center; color:rgba(28,27,25,.35); font-size:var(--font-sm);
    }
    .sn-plan-map{ height:260px; min-width:0; overflow:hidden; border:1px solid var(--color-line); border-radius:12px; background:var(--color-bg); display:flex; flex-direction:column; }
    .sn-plan-map iframe{ display:block; width:100%; flex:1; min-height:0; border:0; }
    .sn-plan-map-empty{ display:flex; align-items:center; justify-content:center; color:var(--color-ink-soft); font-size:var(--font-sm); }
    .sn-map-stop{ width:100%; font:inherit; text-align:left; cursor:pointer; }
    .sn-map-stop:hover{ border-color:var(--color-primary); }
    .sn-map-stop.selected{ background:var(--color-primary-soft); border-color:var(--color-primary); color:var(--color-primary-dark); }
    .sn-map-stop:focus-visible,.sn-map-route-reset:focus-visible{ outline:2px solid var(--color-primary); outline-offset:2px; }
    .sn-map-route-reset{ align-self:flex-start; padding:5px 10px; border:0; background:var(--color-surface); color:var(--color-primary-dark); font:600 var(--font-xs) var(--font-body); cursor:pointer; }

    .sn-navbar{
      display:flex; align-items:center; justify-content:space-between;
      background:rgba(255,255,255,.9); border:1px solid rgba(25,26,26,.06); border-radius:18px;
      box-shadow:0 8px 24px rgba(23,31,27,.04);
      padding:var(--space-3) var(--space-4); margin-bottom:var(--space-6); font-size:var(--font-sm);
      backdrop-filter:blur(8px);
    }
    .sn-navbar .logo{ font-family:var(--font-display); font-weight:700; font-size:var(--font-lg); cursor:pointer; letter-spacing:-.02em; }
    .sn-navbar .links{ display:flex; gap:var(--space-2); align-items:center; }
    .sn-navbar .links span{
      font-family:var(--font-display); font-weight:600; font-size:var(--font-xs);
      color:var(--color-ink-soft); cursor:pointer; padding:var(--space-2) var(--space-3); border-radius:999px;
      transition:all .15s ease;
    }
    .sn-navbar .links span.active{ color:var(--color-primary-dark); background:var(--color-primary-soft); }
    .sn-navbar .links span:hover{ color:var(--color-ink); background:rgba(29,112,92,.04); }
    .sn-navbar .user{
      width:32px; height:32px; border-radius:50%; background:var(--color-primary-soft); color:var(--color-primary-dark);
      display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:600; font-size:12px;
      margin-left:var(--space-2);
    }

    .sn-layout-2col{ display:grid; grid-template-columns:220px minmax(0,1fr); gap:var(--space-4); align-items:start; }
    .sn-layout-2col-rev{ display:grid; grid-template-columns:1fr 320px; gap:var(--space-4); }
    .sn-sidebar{ display:flex; flex-direction:column; gap:var(--space-2); }
    .sn-sidebar .sn-box{ margin-bottom:0; cursor:pointer; font-size:var(--font-sm); }
    .sn-sidebar button.sn-box{ width:100%; font-family:var(--font-body); text-align:left; }
    .sn-sidebar .sn-box.active{ background:var(--color-primary-soft); border-color:rgba(29,112,92,.4); color:var(--color-primary-dark); font-weight:600; box-shadow:inset 0 0 0 1px rgba(29,112,92,.08); }
    .sn-filter-sidebar{ gap:var(--space-3); }
    .sn-filter-option{
      appearance:none; border:1px solid var(--color-line); background:var(--color-surface); color:var(--color-ink);
      border-radius:12px; padding:var(--space-3) var(--space-4); text-align:left; font-size:var(--font-base);
      font-family:var(--font-body); cursor:pointer; transition:all .15s ease;
    }
    .sn-filter-option.selected{
      background:var(--color-primary-soft); border-color:rgba(29,112,92,.35); color:var(--color-primary-dark);
      font-weight:600;
    }
    .sn-filter-option:hover{ border-color:rgba(29,112,92,.2); }
    .sn-profile-panel{ padding-top:0; }
    .sn-profile-details{ display:flex; flex-direction:column; gap:var(--space-4); max-width:420px; }
    .sn-profile-field{ display:flex; flex-direction:column; gap:var(--space-2); }
    .sn-value-box{
      display:block; min-height:44px; padding:var(--space-3) var(--space-4); border:1px solid var(--color-line);
      background:var(--color-surface); border-radius:12px; font-size:var(--font-base); color:var(--color-ink);
      display:flex; align-items:center;
    }
    .sn-value-box.muted{ color:var(--color-ink-soft); }

    .sn-card-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-4); }
    .sn-spot-card{
      cursor:pointer; background:var(--color-surface); border:1px solid rgba(28,27,25,.06);
      border-radius:18px; box-shadow:0 10px 24px rgba(25,24,23,.05); padding:var(--space-3);
      transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;
    }
    .sn-spot-card:hover{ transform:translateY(-2px); box-shadow:0 16px 30px rgba(25,24,23,.08); border-color:rgba(29,112,92,.14); }
    .sn-spot-card .sn-placeholder-img{ height:100px; margin-bottom:var(--space-2); }
    .sn-spot-media{ position:relative; }
    .sn-spot-fav{
      position:absolute; top:8px; right:8px; width:30px; height:30px; border-radius:50%;
      border:0; padding:0; background:rgba(255,255,255,.96); display:flex; align-items:center; justify-content:center;
      cursor:pointer; font-size:14px; line-height:1; color:var(--color-warm-text);
      box-shadow:0 6px 16px rgba(17,24,39,.12);
    }

    .sn-split{
      display:grid; grid-template-columns:1fr 1fr; min-height:340px;
      border:1px solid var(--color-line); border-radius:16px; overflow:hidden; box-shadow:var(--shadow-card);
    }
    .sn-split .sn-left{
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      background:var(--color-bg); color:var(--color-primary-dark); text-align:center;
      padding:var(--space-6) var(--space-2);
      border-right:1px solid var(--color-line);
    }
    .sn-brand-panel{ display:flex; width:100%; flex-direction:column; align-items:center; justify-content:center; }
    .sn-brand-crop{ position:relative; width:100%; height:320px; overflow:hidden; }
    .sn-brand-mark{
      position:absolute; left:50%; top:50%; width:230%; max-width:none; height:auto;
      display:block; transform:translate(-50%, -50%);
    }
    .sn-brand-wordmark{
      font-family:var(--font-display); font-weight:700; font-size:clamp(58px, 5.2vw, 104px);
      line-height:0.88; letter-spacing:-.07em; color:var(--color-primary-dark);
      margin-top:var(--space-1);
    }
    .sn-brand-tagline{
      font-family:var(--font-display); font-size:clamp(16px, 1.8vw, 28px); font-weight:500;
      letter-spacing:-.03em; color:var(--color-primary-dark); font-style:italic; opacity:0.9;
      margin-top:var(--space-1);
    }
    .sn-split .sn-right{ padding:var(--space-12); display:flex; flex-direction:column; gap:var(--space-3); justify-content:center; background:var(--color-surface); }

    .sn-stack{ display:flex; flex-direction:column; gap:var(--space-3); }
    .sn-row{ display:flex; gap:var(--space-3); }
    .sn-row > *{ flex:1; }
    .sn-row.sn-row-tight{ gap:var(--space-3); }
    .sn-row.sn-row-fixed > *{ flex:none; }

    .sn-breadcrumb{
      display:inline-flex; align-items:center; gap:var(--space-2); padding:8px 12px; border-radius:999px;
      font-size:var(--font-sm); color:var(--color-primary-dark); background:var(--color-primary-soft);
      border:1px solid rgba(29,112,92,.15); margin-bottom:var(--space-3); cursor:pointer; font-weight:600;
      transition:all .15s ease; text-decoration:none;
    }
    .sn-breadcrumb:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(29,112,92,.08); }
    .sn-stars{ font-size:var(--font-base); color:var(--color-warm-text); letter-spacing:1px; }

    .sn-list-row{
      display:flex; align-items:center; justify-content:space-between;
      background:var(--color-surface); border:1px solid var(--color-line); border-radius:12px;
      padding:var(--space-3) var(--space-4); font-size:var(--font-sm); gap:var(--space-3);
      transition:border-color .15s;
    }
    .sn-list-row.sn-clickable{ cursor:pointer; }
    .sn-list-row.sn-clickable:hover{ border-color:var(--color-primary); }
    .sn-plan-row{ gap:var(--space-3); }
    .sn-plan-open{ display:flex; flex:1; min-width:0; align-items:center; justify-content:space-between; gap:var(--space-3); padding:4px 0; border:0; background:transparent; color:inherit; font:inherit; text-align:left; cursor:pointer; }
    .sn-plan-open:focus-visible{ outline:2px solid var(--color-primary); outline-offset:3px; }
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
