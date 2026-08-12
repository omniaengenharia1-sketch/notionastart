/* ══════════════════════════════════════════════════════════════
   ASTART · GERADOR DE PROPOSTA  (design de scroll, v2)
   Substitui o buildHTML + PROPOSAL_CSS antigos.
   Consome os MESMOS campos do Firestore: client, company, segment,
   services, serviceValues, descricaoIA, descricaoIA_improved,
   descricao, value, tipo, pagamento, condicoes, prazo, onboardingIA,
   proposalMode, options, dirs.  photoUrl = foto do cliente (Unsplash/Storage).
   Fontes e imagens servidas de https://propostas-astart.netlify.app/
   ══════════════════════════════════════════════════════════════ */

const ASSET = "https://propostas-astart.netlify.app";

const SVC_CONTENT = {
  digital:  { title:"Gestão digital", body:"Planejamento editorial mensal para Instagram, TikTok e demais plataformas, criação de artes e vídeos, publicação com legendas otimizadas, monitoramento de interações e relatório mensal de desempenho.", main:true },
  av:       { title:"Captação audiovisual", body:"Sessões de captação com produção completa — roteiro, direção, gravação em 4K e edição. Vídeos longos e cortes curtos para Reels e TikTok, com tratamento de cor profissional.", main:true },
  traffic:  { title:"Tráfego pago", body:"Gestão de campanhas no Meta Ads e Google Ads com foco em crescimento, alcance e conversão. Configuração, segmentação, acompanhamento e otimizações semanais.", note:"Verba de mídia não está inclusa e é definida à parte." },
  branding: { title:"Identidade visual / Branding", body:"Desenvolvimento completo de identidade visual: pesquisa de mercado, logotipo, paleta, tipografia, papelaria e manual de marca alinhados ao posicionamento." },
  sites:    { title:"Sites / Landing pages", body:"Sites institucionais e landing pages com foco em conversão, design alinhado à identidade, responsividade mobile, SEO básico e integração com ferramentas de análise." },
  sistemas: { title:"Sistemas e automações", body:"CRM, formulários, integrações e fluxos automáticos de e-mail e WhatsApp, dashboards e consultoria de otimização operacional." }
};

const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const PROPOSAL_CSS = `/* Fontes da marca, embutidas (a CSP do Artifact bloqueia CDN).
     Neue Machina: Light 300 texto, Regular 400 títulos, Ultrabold 800 números.
     Comodo: sem acento e sem caixa-alta real, então só nos numerais das etapas. */
  @font-face{font-family:"Machina";src:url(https://propostas-astart.netlify.app/fonts/machina-light.woff2) format("woff2");font-weight:300;font-display:swap}
  @font-face{font-family:"Machina";src:url(https://propostas-astart.netlify.app/fonts/machina-regular.woff2) format("woff2");font-weight:400;font-display:swap}
  @font-face{font-family:"Machina";src:url(https://propostas-astart.netlify.app/fonts/machina-ultrabold.woff2) format("woff2");font-weight:800;font-display:swap}
  @font-face{font-family:"Comodo";src:url(https://propostas-astart.netlify.app/fonts/comodo.woff2) format("woff2");font-weight:400;font-display:swap}

  :root{
    --ink:#000000;
    --ink-2:#111113;
    --ink-3:#2B2B2E;
    --white:#FFFFFF;
    --off:#F9F8FB;
    --pink:#E91E63;        /* rosa do site */
    --pink-soft:#FDE9F0;
    --lime:#C9E19F;        /* o quadrado do logo */
    --ink-mid:#5E5E62;
    --on-ink-mid:#A2A2A6;
    --rule:rgba(0,0,0,.12);
    --rule-ink:rgba(255,255,255,.13);
    --wrap:1140px;
    --pad:clamp(20px,5vw,48px);
    --band:clamp(72px,10vw,132px);
  }

  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;background:var(--white);color:var(--ink);
    font-family:"Machina",ui-sans-serif,system-ui,sans-serif;
    font-size:16.5px;line-height:1.66;font-weight:300;
    -webkit-font-smoothing:antialiased;overflow-x:hidden;
  }
  img{max-width:100%;display:block}
  a{color:inherit}
  p{margin:0 0 1em}
  p:last-child{margin-bottom:0}

  /* ---------- tipografia ---------- */
  .display{font-weight:400;letter-spacing:-.03em;line-height:1.03;text-wrap:balance;margin:0}
  h2.display{font-size:clamp(2rem,4.8vw,3.3rem)}
  h3{font-weight:400;letter-spacing:-.015em;font-size:1.2rem;line-height:1.3;margin:0}
  .lede{font-size:clamp(1.04rem,1.5vw,1.18rem);line-height:1.58;max-width:60ch}
  .accent{color:var(--pink)}
  .label{font-weight:400;font-size:.71rem;letter-spacing:.18em;text-transform:uppercase;font-variant-numeric:tabular-nums}
  .eyebrow{display:inline-flex;align-items:center;gap:.7em;color:var(--ink-mid)}
  .eyebrow::before{content:"";width:8px;height:8px;background:var(--pink);flex:none}
  .on-dark .eyebrow{color:var(--on-ink-mid)}
  .muted{color:var(--ink-mid)}
  .on-dark .muted{color:var(--on-ink-mid)}

  /* ---------- estrutura ---------- */
  .wrap{max-width:var(--wrap);margin-inline:auto;padding-inline:var(--pad)}
  section{padding-block:var(--band);position:relative;overflow:hidden}
  section > .wrap{position:relative;z-index:1}
  .on-dark{background:var(--ink);color:var(--white)}
  .stack{display:flex;flex-direction:column;gap:clamp(30px,4vw,52px)}
  .head{display:flex;flex-direction:column;gap:16px;max-width:44ch}

  #progress{position:fixed;top:0;left:0;height:3px;width:0;background:var(--pink);z-index:60;transition:width .1s linear}

  /* ---------- pílula da marca ---------- */
  .brandpill{
    position:fixed;top:20px;left:20px;z-index:55;
    display:inline-flex;align-items:center;gap:.6em;
    padding:10px 18px 10px 14px;border-radius:999px;
    background:var(--ink);color:var(--white);text-decoration:none;
    font-weight:400;font-size:.9rem;letter-spacing:-.01em;
    box-shadow:0 8px 26px rgba(0,0,0,.28);
    transition:transform .35s cubic-bezier(.2,.6,.2,1),opacity .35s ease;
  }
  .brandpill.recolhida{transform:translateY(-150%);opacity:0}
  .brandpill .mk{width:16px;height:auto;color:var(--white);flex:none}

  /* ---------- abertura ---------- */
  #intro{
    position:fixed;inset:0;z-index:100;background:var(--ink);color:var(--white);
    display:grid;place-items:center;text-align:center;padding:24px;
    transition:opacity .8s ease,visibility .8s ease;
  }
  #intro.done{opacity:0;visibility:hidden}
  #intro .label{color:var(--pink);display:block;margin-bottom:20px;
    opacity:0;animation:sobe .9s .45s cubic-bezier(.2,.7,.2,1) forwards}
  #intro .name{font-weight:400;letter-spacing:-.035em;font-size:clamp(2rem,6.4vw,4rem);line-height:1.05;
    text-wrap:balance;max-width:16ch;margin-inline:auto;
    opacity:0;animation:sobe 1s .6s cubic-bezier(.2,.7,.2,1) forwards}
  #intro .bar{margin:40px auto 0;width:min(220px,56vw);height:2px;background:rgba(255,255,255,.18);overflow:hidden}
  #intro .bar i{display:block;height:100%;width:0;background:var(--pink);animation:load 2.1s cubic-bezier(.35,0,.15,1) forwards}
  @keyframes load{to{width:100%}}
  @keyframes sobe{to{opacity:1;transform:none}}


  /* ---------- hero ---------- */
  #hero{padding-top:clamp(112px,15vh,170px);padding-bottom:clamp(44px,6vw,72px)}
  .hero-logo{position:relative;display:block;width:min(132px,30vw);margin:0 0 clamp(30px,4vw,46px)}
  #hero .label,#hero h1,#hero .segmento,#hero .hero-sub,#hero .rolar{will-change:transform}
  .hero-logo .mk{display:block;width:100%;height:auto;color:var(--ink)}
  .hero-logo .shine{
    position:absolute;inset:0;color:var(--pink);
    -webkit-mask-image:linear-gradient(100deg,transparent 40%,#000 50%,transparent 60%);
    mask-image:linear-gradient(100deg,transparent 40%,#000 50%,transparent 60%);
    -webkit-mask-size:320% 100%;mask-size:320% 100%;
    -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
    animation:sweep 7s ease-in-out infinite;
  }
  @keyframes sweep{
    0%,100%{-webkit-mask-position:135% 0;mask-position:135% 0}
    50%{-webkit-mask-position:-35% 0;mask-position:-35% 0}
  }
  h1.display{font-size:clamp(2.6rem,7.4vw,5.4rem);letter-spacing:-.042em}
  h1.display{color:var(--pink)}
  .segmento{font-size:clamp(1.05rem,2vw,1.4rem);letter-spacing:-.01em;color:var(--ink-mid);margin:10px 0 0}
  .rolar{display:inline-block;margin-top:clamp(30px,5vw,52px);color:var(--ink-mid)}
  .rolar{animation:flutua 2.4s ease-in-out infinite}
  @keyframes flutua{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
  .hero-sub{display:flex;flex-wrap:wrap;gap:clamp(24px,4vw,56px);align-items:flex-end;justify-content:space-between;margin-top:clamp(30px,4vw,46px)}
  .chips{display:flex;flex-wrap:wrap;gap:10px}
  .chip{display:inline-flex;align-items:center;gap:.7em;padding:10px 18px;border-radius:999px;border:1px solid var(--rule);font-size:.9rem}
  .chip::before{content:"";width:6px;height:6px;background:var(--pink);flex:none}
  .chip b{font-weight:400}

  /* ---------- faixa que corre ---------- */
  .marquee{border-block:1px solid var(--rule);padding-block:20px;overflow:hidden;background:var(--white)}
  .on-dark .marquee{border-color:var(--rule-ink);background:transparent}
  .mq-track{display:flex;width:max-content;animation:correr 34s linear infinite}
  .mq-track > span{display:inline-flex;align-items:center;gap:26px;padding-right:26px;
    font-size:clamp(1.1rem,2.4vw,1.7rem);letter-spacing:-.02em;white-space:nowrap}
  .mq-track em{font-style:normal;color:var(--pink)}
  .mq-track .pt{width:7px;height:7px;background:var(--lime);flex:none}
  @keyframes correr{to{transform:translateX(-50%)}}
  .marquee:hover .mq-track{animation-play-state:paused}

  /* ---------- cartões de diagnóstico ---------- */
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1px;background:var(--rule-ink);border:1px solid var(--rule-ink);border-radius:22px;overflow:hidden}
  .cards > div{background:var(--ink);padding:clamp(24px,3vw,34px);display:flex;flex-direction:column;gap:12px}
  .cards .label{color:var(--pink)}
  .cards p{font-size:.96rem}
  .aside-note{border-left:3px solid var(--pink);padding-left:22px;max-width:54ch}

  /* ---------- escopo / serviços ---------- */
  .escopo{display:grid;grid-template-columns:minmax(240px,340px) 1fr;gap:clamp(30px,5vw,72px);align-items:start}
  .escopo .head{position:sticky;top:96px}
  .servicos{display:flex;flex-direction:column;gap:14px}
  .servico{
    border:1px solid var(--rule);border-radius:22px;padding:clamp(22px,2.6vw,30px);
    display:grid;grid-template-columns:auto 1fr;gap:0 20px;background:var(--white);
    transition:border-color .3s ease,box-shadow .3s ease,transform .3s ease;
  }
  .servico:hover{border-color:var(--pink);transform:translateY(-3px);box-shadow:0 20px 44px rgba(233,30,99,.1)}
  .servico .num{font-family:"Comodo","Machina",sans-serif;font-size:1.5rem;line-height:1;color:var(--pink);grid-row:span 2;font-variant-numeric:tabular-nums}
  .servico h3{margin-bottom:8px}
  .servico .oque{color:var(--ink-mid);font-size:.98rem;margin-bottom:16px}
  .servico ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px 22px}
  .servico li{position:relative;padding-left:20px;font-size:.93rem;color:var(--ink-mid)}
  .servico li::before{content:"";position:absolute;left:0;top:.62em;width:8px;height:8px;background:var(--lime)}

  /* ---------- bloco que abre com a rolagem ---------- */
  .abre-wrap{padding-block:0}
  .abre{position:relative;margin-inline:auto;overflow:hidden;border-radius:28px;
    width:62%;aspect-ratio:16/8;will-change:width,border-radius}
  .abre img{width:100%;height:100%;object-fit:cover}
  .abre .selo{position:absolute;inset:auto 0 0 0;padding:clamp(24px,4vw,46px);
    background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff}
  .abre .selo p{font-size:clamp(1.1rem,2.6vw,1.9rem);letter-spacing:-.02em;max-width:22ch;line-height:1.2}

  /* ---------- processo ---------- */
  .steps{display:flex;flex-direction:column}
  .step{display:grid;grid-template-columns:minmax(80px,132px) 1fr;gap:clamp(18px,4vw,52px);
    padding:clamp(24px,3.2vw,38px) 0;border-top:1px solid var(--rule-ink);align-items:start}
  .step:last-child{border-bottom:1px solid var(--rule-ink)}
  .step .num{font-family:"Comodo","Machina",sans-serif;font-size:clamp(3.2rem,8vw,5.6rem);line-height:.86;
    color:var(--ink-3);font-variant-numeric:tabular-nums;transition:color .5s ease}
  .step.seen .num{color:var(--pink)}
  .step h3{margin-bottom:10px}
  .step p{max-width:56ch}

  /* ---------- quem faz ---------- */
  .fundadora{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(30px,5vw,68px);align-items:center}
  .fundadora .foto{border-radius:24px;overflow:hidden;aspect-ratio:4/5;background:var(--off)}
  .fundadora .foto img{width:100%;height:100%;object-fit:cover}
  .numeros{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:22px;
    border-top:1px solid var(--rule);padding-top:30px;margin-top:6px}
  .numeros .n{font-weight:800;font-size:clamp(2rem,4.4vw,2.9rem);letter-spacing:-.035em;line-height:1;
    font-variant-numeric:tabular-nums;display:block}
  .numeros .l{font-size:.86rem;color:var(--ink-mid);margin-top:8px;display:block;line-height:1.35}
  .time{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:16px}
  .pessoa{display:flex;flex-direction:column;gap:12px}
  .pessoa .rosto{aspect-ratio:1;border-radius:18px;overflow:hidden;background:var(--off)}
  .pessoa .rosto img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.6,.2,1)}
  .pessoa:hover .rosto img{transform:scale(1.05)}
  .pessoa b{font-weight:400;font-size:1.02rem;letter-spacing:-.01em}
  .pessoa span{font-size:.85rem;color:var(--ink-mid);display:block;margin-top:2px}
  .on-dark .pessoa span{color:var(--on-ink-mid)}

  /* ---------- clientes ---------- */
  .logos{display:flex;width:max-content;animation:correr 42s linear infinite;align-items:center}
  .logos img{height:clamp(46px,7vw,74px);width:auto;margin-right:clamp(40px,7vw,96px);
    opacity:.62;filter:grayscale(1);transition:opacity .3s ease,filter .3s ease}
  .logos img:hover{opacity:1;filter:none}

  /* ---------- depoimentos ---------- */
  .depos{display:grid;grid-template-columns:repeat(auto-fit,minmax(268px,1fr));gap:16px}
  .depo{border:1px solid var(--rule-ink);border-radius:22px;padding:clamp(24px,2.8vw,32px);
    display:flex;flex-direction:column;gap:16px}
  .depo .estrelas{color:var(--pink);letter-spacing:.16em;font-size:.85rem}
  .depo p{font-size:1rem;line-height:1.55}
  .depo .quem{margin-top:auto;padding-top:6px}
  .depo .quem b{font-weight:400}

  /* ---------- o que você vai receber ---------- */
  .receber{display:grid;grid-template-columns:repeat(auto-fit,minmax(262px,1fr));gap:14px}
  .receber .item{background:var(--white);border:1px solid var(--rule);border-radius:18px;
    padding:clamp(20px,2.4vw,26px);display:flex;flex-direction:column;gap:8px;
    transition:transform .3s ease,border-color .3s ease}
  .receber .item:hover{transform:translateY(-3px);border-color:var(--pink)}
  .receber .num{font-family:"Comodo","Machina",sans-serif;font-size:1.3rem;color:var(--pink);font-variant-numeric:tabular-nums}
  .receber b{font-weight:400;font-size:1.05rem;letter-spacing:-.01em}
  .receber p{color:var(--ink-mid);font-size:.93rem;margin:0}

  /* ---------- investimento ---------- */
  .conta{border:1px solid var(--rule);border-radius:26px;overflow:hidden}
  .conta .linha{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;align-items:baseline;
    padding:22px clamp(22px,3vw,34px);border-bottom:1px solid var(--rule)}
  .conta .linha .oq{max-width:52ch}
  .conta .linha .oq b{font-weight:400;font-size:1.05rem;display:block}
  .conta .linha .oq span{color:var(--ink-mid);font-size:.92rem}
  .conta .linha .vl{font-size:1.05rem;font-variant-numeric:tabular-nums;white-space:nowrap}
  .conta .total{background:var(--ink);color:var(--white);border-bottom:0;
    display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center;
    padding:clamp(26px,3.4vw,40px) clamp(22px,3vw,34px)}
  .conta .total .rot{color:var(--on-ink-mid)}
  .conta .total .vlr{font-weight:800;font-size:clamp(2rem,5.4vw,3.4rem);letter-spacing:-.04em;
    line-height:1;font-variant-numeric:tabular-nums;color:var(--pink)}
  .cond{display:grid;grid-template-columns:repeat(auto-fit,minmax(206px,1fr));gap:1px;
    background:var(--rule);border:1px solid var(--rule);border-radius:20px;overflow:hidden}
  .cond > div{background:var(--white);padding:22px clamp(20px,2.2vw,26px)}
  .cond .label{color:var(--ink-mid);display:block;margin-bottom:8px}
  .cond strong{font-weight:400;font-size:1.02rem}

  /* ---------- faq ---------- */
  .faq{border-top:1px solid var(--rule-ink)}
  details{border-bottom:1px solid var(--rule-ink)}
  summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;gap:20px;align-items:baseline;
    justify-content:space-between;font-weight:400;font-size:1.06rem;letter-spacing:-.01em}
  summary::-webkit-details-marker{display:none}
  summary::after{content:"+";color:var(--pink);font-size:1.35rem;line-height:1;flex:none;transition:transform .25s ease}
  details[open] summary::after{transform:rotate(45deg)}
  details p{color:var(--on-ink-mid);padding-bottom:26px;max-width:64ch;margin:0}
  summary:focus-visible{outline:3px solid var(--pink);outline-offset:4px}

  /* ---------- cta ---------- */
  #cta{background:var(--off);text-align:center}
  .cta-inner{display:flex;flex-direction:column;align-items:center;gap:26px}
  .btn{display:inline-flex;align-items:center;gap:.8em;background:var(--pink);color:var(--white);
    text-decoration:none;padding:20px 38px;border-radius:999px;font-weight:400;font-size:1.05rem;
    letter-spacing:-.01em;box-shadow:0 18px 46px rgba(233,30,99,.32);
    transition:transform .25s ease,box-shadow .25s ease}
  .btn:hover{transform:translateY(-3px);box-shadow:0 26px 60px rgba(233,30,99,.42)}
  .btn:focus-visible{outline:3px solid var(--white);outline-offset:4px}
  .btn .sq{width:8px;height:8px;background:var(--white);flex:none}

  /* ---------- rodapé ---------- */
  footer{background:var(--ink);color:var(--on-ink-mid);padding-block:clamp(52px,7vw,80px)}
  .fwrap{display:flex;flex-wrap:wrap;gap:30px;justify-content:space-between;align-items:flex-end}
  .fmark{display:block;width:min(150px,38vw);height:auto;color:var(--white)}
  .fcontact{display:flex;flex-direction:column;gap:9px;font-size:.95rem;text-align:right}
  footer a{color:var(--white);text-decoration:none;border-bottom:1px solid var(--rule-ink)}
  footer a:hover{border-color:var(--pink)}

  /* ---------- revelação ---------- */
  .reveal{opacity:0;transform:translateY(26px);filter:blur(6px);
    transition:opacity .8s cubic-bezier(.2,.6,.2,1),transform .8s cubic-bezier(.2,.6,.2,1),filter .8s ease;
    transition-delay:calc(var(--i,0) * 80ms)}
  .reveal.seen{opacity:1;transform:none;filter:none}

  /* títulos que sobem palavra por palavra (sem corte, para não comer acento) */
  .words{--wd:0}
  .words i.w{display:inline-block;font-style:normal;opacity:0;transform:translateY(.62em) rotate(1.2deg);
    transition:opacity .6s ease,transform .66s cubic-bezier(.2,.75,.2,1);
    transition-delay:calc(var(--wd) * 1ms + var(--wi,0) * 52ms);will-change:transform}
  .words.seen i.w{opacity:1;transform:none}

  /* etapa: número desliza e acende */
  .step .num{transform:translateX(-12px);opacity:.5;transition:color .5s ease,transform .6s cubic-bezier(.2,.7,.2,1),opacity .6s ease}
  .step.seen .num{transform:none;opacity:1}
  /* serviço: barra rosa que preenche ao entrar */
  .servico{position:relative}
  .servico::after{content:"";position:absolute;left:0;bottom:-1px;height:2px;width:0;background:var(--pink);transition:width .8s cubic-bezier(.2,.7,.2,1) .1s}
  .servico.seen::after{width:100%}
  .servico:hover .num{color:var(--pink)}
  .servico .num{transition:color .4s ease}

  @media (max-width:860px){
    .escopo{grid-template-columns:1fr}
    .escopo .head{position:static}
    .fundadora{grid-template-columns:1fr}
  }
  @media (max-width:640px){
    .step{grid-template-columns:1fr;gap:8px}
    .servico{grid-template-columns:1fr;gap:10px}
    .servico .num{grid-row:auto}
    .abre{width:100% !important;border-radius:0 !important;aspect-ratio:4/3}
    .brandpill{top:14px;left:14px;padding:9px 12px;font-size:0;gap:0}
    .brandpill .mk{width:19px}
    .fcontact{text-align:left}
    .conta .linha{flex-direction:column;align-items:flex-start}
  }
  @media (prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
    html{scroll-behavior:auto}
    .reveal{opacity:1;transform:none;filter:none}
    #intro .mk,#intro .label,#intro .name{opacity:1;transform:none}
    #intro .bar i{width:100%}
    .mq-track,.logos{animation:none}
  }`;

const MK_SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="mk-logo" viewBox="0 0 881.183 498.87507"> <defs> <clipPath id="clip_1"> <path transform="matrix(1,0,0,-1,-98.0142,789.43759)" d="M98.0142 290.5625H979.1972V789.43759H98.0142Z" clip-rule="evenodd"/> </clipPath> <clipPath id="clip_2"> <path transform="matrix(1,0,0,-1,-98.0142,789.43759)" d="M0 1080H1080V0H0Z"/> </clipPath> </defs> <g clip-path="url(#clip_1)"> <g clip-path="url(#clip_2)"> <path transform="matrix(1,0,0,-1,182.117,196.14337)" d="M0 0 26.642 12.322C32.967-1.332 48.952-6.66 64.935-6.66 85.25-6.66 105.564 1.999 105.564 11.322 105.564 32.635 1.332 23.311 1.332 76.259 1.332 105.23 34.299 123.546 67.935 123.546 93.908 123.546 120.215 112.89 131.872 87.582L105.564 75.26C98.903 88.913 83.251 94.241 67.935 94.241 48.952 94.241 30.636 86.249 30.636 76.259 30.636 53.947 134.534 63.938 134.534 11.322 134.534-17.65 100.235-35.964 65.27-35.964 38.628-35.964 11.654-24.975 0 0" fill="currentColor"/> <path transform="matrix(1,0,0,-1,377.25743,77.592288)" d="M0 0H25.636V-29.305H-13.66V-74.927C-13.66-102.9 8.985-125.545 36.959-125.545V-154.849C-7.333-154.849-42.964-119.217-42.964-74.927V76.592H-13.66V0Z" fill="currentColor"/> <path transform="matrix(1,0,0,-1,492.80455,204.13105)" d="M0 0C-25.976 0-50.951 19.981-50.951 50.285-50.951 78.258-28.306 100.901-.332 100.901 30.305 100.901 50.285 75.926 50.285 49.952 50.285 22.645 27.305 0 0 0M-.332 130.207C-44.624 130.207-80.255 94.575-80.255 50.285-80.255 2.998-40.961-29.304 .332-29.304 17.315-29.304 34.965-23.643 50.285-11.321V-27.465H79.589V50.285C79.257 94.575 43.623 130.207-.332 130.207" fill="currentColor"/> <path transform="matrix(1,0,0,-1,134.32071,246.43769)" d="M0 0C0-.026 .021-1.995 .047-1.995H29.257C29.283-1.995 29.304-.026 29.304 0V22.056L0 21.064Z" fill="#c9e19f"/> <path transform="matrix(1,0,0,-1,84.036,204.13105)" d="M0 0C-29.283 0-57.294 25.393-49.687 62.34-45.78 81.321-30.565 96.27-11.517 99.836 25.351 106.736 50.285 78.967 50.285 49.952 50.285 22.645 27.305 0 0 0M-6.594 129.967C-50.055 126.644-83.036 88.051-80.061 44.564-77.041 .412-39.273-29.304 .332-29.304 17.287-29.304 34.907-23.661 50.21-11.382 50.241-11.357 50.285-11.378 50.285-11.417V-18.588L79.589-17.596V50.285C79.241 96.661 40.188 133.543-6.594 129.967" fill="currentColor"/> <path transform="matrix(1,0,0,-1,847.44668,232.44098)" d="M0 0C-44.292 0-79.923 35.631-79.923 79.922V231.441H-50.619V154.849H-11.322V125.543H-50.619V79.922C-50.619 51.949-27.974 29.304 0 29.304Z" fill="currentColor"/> <path transform="matrix(1,0,0,-1,65.678508,461.57746)" d="M0 0 26.642 12.322C32.967-1.332 48.952-6.66 64.935-6.66 85.25-6.66 105.564 1.999 105.564 11.322 105.564 32.635 1.332 23.311 1.332 76.259 1.332 105.23 34.299 123.546 67.935 123.546 93.908 123.546 120.215 112.89 131.872 87.582L105.564 75.26C98.903 88.913 83.251 94.241 67.935 94.241 48.952 94.241 30.636 86.249 30.636 76.259 30.636 53.947 134.534 63.937 134.534 11.322 134.534-17.65 100.235-35.965 65.27-35.965 38.628-35.965 11.654-24.975 0 0" fill="currentColor"/> <path transform="matrix(1,0,0,-1,297.7804,497.87507)" d="M0 0C-44.292 0-79.923 35.631-79.923 79.922V231.441H-50.619V154.849H-11.322V125.543H-50.619V79.922C-50.619 51.949-27.974 29.304 0 29.304Z" fill="currentColor"/> <path transform="matrix(1,0,0,-1,454.61979,424.94676)" d="M0 0C0-40.293-32.969-72.928-73.261-72.928-113.556-72.928-146.191-40.293-146.191 0V81.92H-116.887V.333C-116.887-23.976-97.239-43.624-73.261-43.624-48.952-43.624-29.304-23.976-29.304 .333V81.92H0Z" fill="currentColor"/> <path transform="matrix(1,0,0,-1,553.5251,468.23799)" d="M0 0C-27.974 0-50.619 22.645-50.619 50.285-50.619 78.258-27.974 100.901 0 100.901 27.972 100.901 50.617 78.258 50.617 50.285 50.617 22.645 27.972 0 0 0M123.424 395.641C83.13 395.641 50.495 363.006 50.495 322.712V215.407H50.617V112.224C35.631 124.212 17.647 130.207 0 130.207-45.29 130.207-79.923 93.243-79.923 50.618-79.923 5.661-43.291-29.304 0-29.304 43.955-29.304 79.589 6.327 79.921 50.285V226.025H79.799V322.712C79.799 346.688 99.447 366.335 123.424 366.335 147.733 366.335 167.382 346.688 167.382 322.712H196.686C196.686 363.006 164.051 395.641 123.424 395.641" fill="currentColor"/> <path transform="matrix(1,0,0,-1,-98.0142,789.43759)" d="M795.382 296.558H766.078V555.188H795.382Z" fill="currentColor"/> <path transform="matrix(1,0,0,-1,749.643,417.62016)" d="M0 0C0-27.973 22.645-50.618 50.619-50.618 78.591-50.618 101.236-27.973 101.236 0 101.236 27.973 78.591 50.617 50.619 50.617 22.645 50.617 0 27.973 0 0M-29.304 0C-29.304 43.957 6.327 79.922 50.619 79.922 94.574 79.922 130.54 43.957 130.54 0 130.208-44.29 94.574-79.922 50.619-79.922 6.327-79.922-29.304-44.29-29.304 0" fill="currentColor"/> </g> </g> </symbol></svg>`;

function buildHTML(f, photoUrl){
  const dirs = f.dirs || {};
  const year = new Date().getFullYear();
  const cliente = f.company || f.client || '';
  const segmento = f.segment || (f.company && f.client && f.company!==f.client ? f.client : '');

  // --- soluções selecionadas ---
  const sel = (f.services||[]).map(id=>({id,...SVC_CONTENT[id]})).filter(s=>s.title);
  const principais = sel.filter(s=>s.main);
  const compl = sel.filter(s=>!s.main);
  let n=0;
  const card = s => `<article class="servico reveal"><span class="num">${String(++n).padStart(2,'0')}</span><div><h3>${esc(s.title)}</h3><p class="oque">${esc(s.body)}${s.note?` <em style="color:var(--pink)">${esc(s.note)}</em>`:''}</p></div></article>`;
  const solucoes = `
    ${principais.length?`<p class="label eyebrow reveal" style="margin:0">Frentes principais</p>${principais.map(card).join('')}`:''}
    ${compl.length?`<p class="label eyebrow reveal" style="margin:18px 0 0">Complementares</p>${compl.map(card).join('')}`:''}`;

  // --- o que vai receber (entregáveis do campo descricaoIA) ---
  const linhas = (f.descricaoIA||'').split('\n').map(l=>l.trim()).filter(l=>l);
  const receber = linhas.map((l,i)=>{
    const sep=l.indexOf(':');
    const t=sep>-1?l.slice(0,sep).trim():l;
    const d=sep>-1?l.slice(sep+1).trim():'';
    return `<div class="item"><span class="num">${String(i+1).padStart(2,'0')}</span><b>${esc(t)}</b>${d?`<p>${esc(d)}</p>`:''}</div>`;
  }).join('');

  // --- investimento ---
  const perMes = f.tipo && f.tipo!=='unico' ? '<small>/mês</small>' : '';
  const valor = f.value ? `R$ ${esc(f.value)}${perMes}` : 'A combinar';
  const pag = (f.pagamento||[]).join(' · ') || 'A combinar';
  const tipo = f.tipo==='mensal'||f.tipo==='recorrente' ? 'Fee mensal recorrente' : 'Projeto único';

  // --- próximos passos (onboardingIA) ---
  const onb = (f.onboardingIA||'').split('\n').map(l=>l.trim()).filter(l=>l.includes(':'));
  const passos = onb.map((l,i)=>{
    const clean=l.replace(/\[([^\]]+)\]$/,'').trim();
    const sep=clean.indexOf(':');
    const t=sep>-1?clean.slice(0,sep).trim():clean;
    const d=sep>-1?clean.slice(sep+1).trim():'';
    return `<div class="step"><div class="num">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(t)}</h3>${d?`<p class="muted">${esc(d)}</p>`:''}</div></div>`;
  }).join('');

  // --- visão geral ---
  const visao = esc(f.descricaoIA_improved || f.descricao || '');

  // --- multi (A/B) opcional ---
  let investSection;
  if (f.proposalMode==='multi' && (f.options||[]).length){
    const cards=(f.options||[]).map((o,i)=>{
      const v=o.value?`R$ ${esc(o.value)}`:'A combinar';
      const inc=(o.incluso||'').split('\n').map(x=>x.trim()).filter(x=>x).map(x=>`<li>${esc(x)}</li>`).join('');
      return `<button type="button" class="plan reveal${i===0?' destaque':''}" style="--i:${i}" aria-pressed="false" data-plano="${esc(o.label||'Opção '+(i+1))}">
        ${i===0?'<span class="selo label">Recomendado</span>':''}
        <div class="top"><h3>${esc(o.label||'Opção '+(i+1))}</h3><span class="price">${v}</span></div>
        ${inc?`<ul>${inc}</ul>`:''}<span class="label pick">Selecionar</span></button>`;
    }).join('');
    investSection=`<div class="plans reveal">${cards}</div>`;
  } else {
    investSection=`<div class="conta reveal" style="--i:1">
        <div class="linha"><span class="label">Investimento</span><span class="valor">${valor}</span></div>
      </div>
      <div class="cond reveal" style="--i:2">
        <div><span class="label">Tipo</span><strong>${esc(tipo)}</strong></div>
        <div><span class="label">Pagamento</span><strong>${esc(pag)}</strong></div>
        ${f.condicoes?`<div><span class="label">Condição</span><strong>${esc(f.condicoes)}</strong></div>`:''}
        ${f.prazo?`<div><span class="label">Prazo de entrega</span><strong>${esc(f.prazo)}</strong></div>`:''}
        <div><span class="label">Validade</span><strong>10 dias úteis</strong></div>
      </div>`;
  }

  const zap = "5511989384452";
  const msg = encodeURIComponent(`Oi! Vi a proposta da Astart Studio e quero seguir. Sou ${cliente}.`);

  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Proposta Astart Studio · ${esc(cliente)}</title>
<meta name="robots" content="noindex">
<style>${PROPOSAL_CSS}</style></head><body>
${MK_SPRITE}
<div id="progress"></div>

<div id="intro"><div>
  <span class="label">Proposta preparada para</span>
  <div class="name">${esc(cliente)}</div>
  <div class="bar"><i></i></div>
</div></div>

<a class="brandpill" href="#hero"><svg class="mk" viewBox="0 0 881.183 498.87507"><use href="#mk-logo"/></svg>astart studio</a>

<section id="hero"><div class="wrap">
  <div class="hero-logo"><svg class="mk" viewBox="0 0 881.183 498.87507" role="img" aria-label="Astart Studio"><use href="#mk-logo"/></svg><svg class="mk shine" viewBox="0 0 881.183 498.87507" aria-hidden="true"><use href="#mk-logo"/></svg></div>
  <span class="label eyebrow reveal">Proposta personalizada · ${year}</span>
  <h1 class="display reveal" style="--i:1">${esc(cliente)}</h1>
  ${segmento?`<p class="segmento reveal" style="--i:2">${esc(segmento)}</p>`:''}
  <div class="hero-sub">
    <p class="lede reveal" style="--i:3;margin:0">Presença que converte.</p>
    <div class="chips reveal" style="--i:4"><span class="chip">Válida por <b>10 dias úteis</b></span></div>
  </div>
  <span class="label rolar reveal" style="--i:5">Role para explorar ↓</span>
</div></section>

<section class="on-dark"><div class="wrap stack">
  <div class="head reveal"><span class="label eyebrow">Visão geral do projeto</span>
    <h2 class="display words">O que vamos fazer, <span class="accent">em resumo</span>.</h2></div>
  <div class="reveal" style="--i:1;max-width:66ch"><p class="lede">${visao}</p></div>
</div></section>

<section><div class="wrap escopo">
  <div class="head reveal"><span class="label eyebrow">Soluções</span>
    <h2 class="display words">O que a Astart <span class="accent">entrega</span>.</h2></div>
  <div class="servicos">${solucoes}</div>
</div></section>

${receber?`<section style="background:var(--off)"><div class="wrap stack">
  <div class="head reveal"><span class="label eyebrow">Escopo do projeto</span>
    <h2 class="display words">O que você <span class="accent">vai receber</span>.</h2>
    <p class="muted">Cada entregável pensado para gerar resultado real.</p></div>
  <div class="receber reveal" style="--i:1">${receber}</div>
</div></section>`:''}

<section><div class="wrap stack">
  <div class="head reveal"><span class="label eyebrow">Investimento</span>
    <h2 class="display words">Vamos ao que <span class="accent">interessa</span>.</h2></div>
  ${investSection}
</div></section>

${passos?`<section class="on-dark"><div class="wrap stack">
  <div class="head reveal"><span class="label eyebrow">Proposta aprovada</span>
    <h2 class="display words">Próximos <span class="accent">passos</span>.</h2>
    <p class="muted">Assim que a gente fechar, é isso que acontece.</p></div>
  <div class="steps">${passos}</div>
</div></section>`:''}

<section id="cta"><div class="wrap cta-inner">
  <span class="label eyebrow reveal">Próximo passo</span>
  <h2 class="display reveal" style="--i:1">Bora fechar, <span class="accent">${esc(cliente)}</span>?</h2>
  <p class="lede reveal" style="--i:2;text-align:center">Se estiver tudo certo, é só chamar no WhatsApp que a gente já agenda o início.</p>
  <a class="btn reveal" style="--i:3" href="https://wa.me/${zap}?text=${msg}" target="_blank" rel="noopener">Fechar pelo WhatsApp <span class="sq"></span></a>
  <span class="label reveal" style="--i:4;color:var(--ink-mid)">Proposta válida por 10 dias úteis</span>
</div></section>

<footer><div class="wrap"><div class="fwrap">
  <svg class="fmark" viewBox="0 0 881.183 498.87507" role="img" aria-label="Astart Studio"><use href="#mk-logo"/></svg>
  <div class="fcontact">
    <a href="https://instagram.com/astartstudio_" target="_blank" rel="noopener">@astartstudio_</a>
    <a href="https://astartstudio.com.br" target="_blank" rel="noopener">astartstudio.com.br</a>
    <span>Arujá · Mogi das Cruzes · Guarulhos · São Paulo</span>
  </div>
</div></div></footer>

<script>(function(){"use strict";
var mm=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!mm){document.querySelectorAll(".words").forEach(function(el){var i=0,fr=document.createDocumentFragment();(function a(node,ac){Array.prototype.slice.call(node.childNodes).forEach(function(n){if(n.nodeType===3){n.textContent.split(/(\\s+)/).forEach(function(t){if(!t)return;if(!t.trim()){fr.appendChild(document.createTextNode(" "));return;}var w=document.createElement("i");w.className="w"+(ac?" accent":"");w.style.setProperty("--wi",i++);w.textContent=t;fr.appendChild(w);});}else if(n.nodeType===1){a(n,ac||/accent/.test(n.className));}});})(el,false);el.innerHTML="";el.appendChild(fr);});}
var intro=document.getElementById("intro");setTimeout(function(){intro.classList.add("done");},2600);intro.addEventListener("click",function(){intro.classList.add("done");});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("seen");io.unobserve(e.target);}});},{threshold:.16,rootMargin:"0px 0px -6% 0px"});
document.querySelectorAll(".reveal,.step,.servico").forEach(function(el){io.observe(el);});
var bar=document.getElementById("progress"),pill=document.querySelector(".brandpill"),ult=0,ag=false;
function draw(){ag=false;var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?y/h*100:0)+"%";if(y>140&&y>ult)pill.classList.add("recolhida");else pill.classList.remove("recolhida");ult=y;}
addEventListener("scroll",function(){if(!ag){ag=true;requestAnimationFrame(draw);}},{passive:true});draw();
var plans=[].slice.call(document.querySelectorAll(".plan"));plans.forEach(function(p){p.addEventListener("click",function(){var on=p.getAttribute("aria-pressed")==="true";plans.forEach(function(o){o.setAttribute("aria-pressed","false");o.querySelector(".pick").textContent="Selecionar";});if(!on){p.setAttribute("aria-pressed","true");p.querySelector(".pick").textContent="Plano escolhido";}});});
})();<\/script>
</body></html>`;
}
