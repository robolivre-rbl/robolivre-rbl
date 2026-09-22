/* RoboLivre — interações compartilhadas da versão HTML estática */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
let motionOn = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  sun: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
};

function applyMotion() {
  document.documentElement.classList.toggle('no-motion', !motionOn);
  const b = $('#motionBtn');
  if (b) b.setAttribute('aria-checked', String(motionOn));
}

function initThemeAndMenu() {
  const root = document.documentElement;
  const btn = $('#themeBtn');
  try {
    const t = localStorage.getItem('rl-theme');
    if (t) root.setAttribute('data-theme', t);
  } catch (e) {}
  const isDark = () => root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const paint = () => {
    btn.innerHTML = isDark() ? ICON.sun : ICON.moon;
    btn.setAttribute('aria-label', isDark() ? 'Mudar para tema claro' : 'Mudar para tema escuro');
  };
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('rl-theme', next); } catch (e) {}
    paint();
  });
  paint();

  const hdr = $('#hdr'), mb = $('#menuBtn');
  mb.addEventListener('click', () => {
    const open = hdr.classList.toggle('open');
    mb.setAttribute('aria-expanded', String(open));
    mb.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hdr.classList.contains('open')) {
      hdr.classList.remove('open');
      mb.setAttribute('aria-expanded', 'false');
      mb.focus();
    }
  });
  $('#skip').addEventListener('click', e => {
    e.preventDefault();
    $('#main').focus();
  });

  const current = location.pathname.split('/').pop() || 'index.html';
  $$('#nav a').forEach(a => {
    if (a.getAttribute('href') === current) a.setAttribute('aria-current','page');
  });
}

function initMotionButton() {
  const mb = $('#motionBtn');
  if (!mb) return;
  mb.addEventListener('click', () => {
    motionOn = !motionOn;
    applyMotion();
  });
  applyMotion();
}

function initProjects() {
  const list = $('#plist');
  if (!list) return;
  const chips = $$('#chips .chip');
  const rows = $$('.project-row', list);
  const count = $('#pcount');
  const names = {
    escolas:'Escolas',
    universidades:'Universidades',
    eventos:'Eventos e competições',
    inclusao:'Inclusão'
  };
  const show = area => {
    let visible = 0;
    rows.forEach(row => {
      const on = area === 'todos' || row.dataset.area === area;
      row.hidden = !on;
      if (on) visible++;
    });
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.a === area)));
    count.textContent = `${visible} ${visible === 1 ? 'projeto' : 'projetos'}${area === 'todos' ? '' : ' em ' + names[area]}`;
  };
  chips.forEach(c => c.addEventListener('click', () => show(c.dataset.a)));
  const area = new URLSearchParams(location.search).get('area');
  show(area && names[area] ? area : 'todos');
}

function initContact() {
  const form = $('#cform');
  if (!form) return;
  const assunto = {
    oficina:'Oficina de robótica',
    formacao:'Formação de professores e multiplicadores',
    clube:'Clube de robótica',
    competicao:'Competição, arena ou arbitragem',
    kits:'BuzzLine e kits',
    parceria:'Parceria ou projeto institucional',
    outro:'Outro assunto'
  };
  const q = id => document.querySelector(id);
  const pre = new URLSearchParams(location.search).get('assunto');
  if (pre && assunto[pre]) q('#f-int').value = pre;
  const build = () => {
    const nome = q('#f-nome').value.trim() || '[seu nome]';
    const org = q('#f-org').value.trim();
    const cid = q('#f-cid').value.trim();
    const it = assunto[q('#f-int').value];
    const msg = q('#f-msg').value.trim() || '[conte o que você quer fazer]';
    let l1 = `Olá, RoboLivre! Meu nome é ${nome}`;
    if (org) l1 += `, da ${org}`;
    if (cid) l1 += ` (${cid})`;
    l1 += '.';
    return `${l1}\nTenho interesse em: ${it}.\n\n${msg}`;
  };
  const render = () => q('#preview').textContent = build();
  ['#f-nome','#f-org','#f-cid','#f-int','#f-msg'].forEach(id => q(id).addEventListener('input',render));
  render();
  const st = q('#status');
  const ok = () => {
    if (!q('#f-nome').value.trim()) {
      st.className='status status--err'; st.textContent='Preencha seu nome para continuar.'; q('#f-nome').focus(); return false;
    }
    if (!q('#f-msg').value.trim()) {
      st.className='status status--err'; st.textContent='Conte o que você quer fazer para continuar.'; q('#f-msg').focus(); return false;
    }
    return true;
  };
  form.addEventListener('submit', e => e.preventDefault());
  q('#bCopy').addEventListener('click', async () => {
    if (!ok()) return;
    const text=build();
    try {
      await navigator.clipboard.writeText(text);
      st.className='status'; st.textContent='Mensagem copiada. Agora é só colar e enviar.';
    } catch(err) {
      const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select();
      let done=false; try { done=document.execCommand('copy'); } catch(e) {}
      ta.remove(); st.className=done?'status':'status status--err';
      st.textContent=done?'Mensagem copiada. Agora é só colar e enviar.':'Não foi possível copiar automaticamente. Selecione o texto da mensagem e copie.';
    }
  });
}

const SIM_TRACKS = {
  oval: 'M200 70H440C530 70 580 120 580 200C580 280 530 330 440 330H200C110 330 60 280 60 200C60 120 110 70 200 70Z',
  ondas: 'M110 200C110 110 200 90 260 140C320 190 380 200 430 140C480 80 590 100 590 190C590 290 480 320 420 270C360 220 300 230 250 280C200 330 110 310 110 200Z'
};

function initSim() {
  const $i = (id) => document.getElementById(id);
  const svg = $i('simSvg'), track = $i('simTrack'), bot = $i('simBot');
  const K = { W: 44, SX: 30, SY: 20, RS: 6.5, HW: 9, VMAX: 130, FLOOR: 640, DARK: 35, DT: 1 / 240 };
  const S = {
    x: 0, y: 0, th: 0, t: 0, nextLoop: 0, period: 0.032,
    pins: { esq: 0, esqtras: 0, dir: 0, dirtras: 0 },
    le: K.FLOOR, ld: K.FLOOR, branch: -1,
    media: 100, vel: 180, uno: true, run: motionOn, speed: 1,
    laps: 0, lapStart: 0, last: null, best: null, frac: 0, serial: []
  };
  let pts = [], N = 0, drag = false, off = { dx: 0, dy: 0 }, raf = 0, stopped = false;

  /* --- pista --- */
  function sample() {
    const L = track.getTotalLength(); pts = [];
    for (let s = 0; s < L; s += 2) { const p = track.getPointAtLength(s); pts.push(p.x, p.y); }
    N = pts.length / 2;
  }
  function nearest(x, y) {
    let m = 1e12, mi = 0;
    for (let i = 0; i < N; i++) { const dx = pts[2 * i] - x, dy = pts[2 * i + 1] - y, d = dx * dx + dy * dy; if (d < m) { m = d; mi = i; } }
    return { d: Math.sqrt(m), i: mi };
  }
  const local = (lx, ly) => ({ x: S.x + lx * Math.cos(S.th) - ly * Math.sin(S.th), y: S.y + lx * Math.sin(S.th) + ly * Math.cos(S.th) });
  function analogRead(p) {
    const cov = Math.max(0, Math.min(1, (K.HW + K.RS - nearest(p.x, p.y).d) / (2 * K.RS)));
    return Math.round(K.FLOOR - (K.FLOOR - K.DARK) * cov);
  }

  /* --- o loop() do .ino --- */
  function loopOnce() {
    S.le = analogRead(local(K.SX, -K.SY));   // A0, sensor esquerdo
    S.ld = analogRead(local(K.SX, K.SY));    // A1, sensor direito
    const p = S.pins;
    if (S.le < S.media) {                    // if (intensidadeLuzesq < media)
      p.dirtras = 0; p.dir = S.vel; p.esqtras = 0; p.esq = 0; S.branch = 1;
    } else if (S.ld < S.media) {             // else if (intensidadeLuzdir < media)
      p.esqtras = 0; p.esq = S.vel; p.dirtras = 0; p.dir = 0; S.branch = 2;
    } else {                                 // não há else: nada é escrito
      S.branch = 0;
    }
    S.serial.push('Esquerda: ' + S.le, ' | Direita: ' + S.ld);
    if (S.serial.length > 20) S.serial.splice(0, S.serial.length - 20);
    const bytes = 26 + String(S.le).length + String(S.ld).length;   // texto + \r\n de cada println
    S.period = bytes * 10 / 9600 + 0.0004;                          // 9600 baud, 10 bits por byte
  }

  /* --- saída dos pinos: analogWrite --- */
  const HAS_PWM = { esq: false, esqtras: true, dir: false, dirtras: true };   // Uno: PWM só em 3, 5, 6, 9, 10, 11
  const level = (name, v) => (!S.uno || HAS_PWM[name]) ? v / 255 : (v >= 128 ? 1 : 0);

  function stepPhys() {
    if (S.t >= S.nextLoop) { loopOnce(); S.nextLoop = S.t + S.period; }
    const p = S.pins;
    const vL = (level('esq', p.esq) - level('esqtras', p.esqtras)) * K.VMAX;
    const vR = (level('dir', p.dir) - level('dirtras', p.dirtras)) * K.VMAX;
    const v = (vL + vR) / 2, w = (vL - vR) / K.W;       // w > 0 gira no sentido horário (y para baixo)
    S.x += v * Math.cos(S.th) * K.DT; S.y += v * Math.sin(S.th) * K.DT; S.th += w * K.DT; S.t += K.DT;
    S.x = Math.max(12, Math.min(628, S.x)); S.y = Math.max(12, Math.min(388, S.y));
    if (Math.round(S.t / K.DT) % 12 === 0) lapCheck();
  }
  function lapCheck() {
    const n = nearest(S.x, S.y), f = n.i / N;
    if (n.d < 26) {
      if (S.frac > 0.85 && f < 0.15) {                       // cruzou a linha de largada
        if (!S.armed) { S.armed = true; S.lapStart = S.t; }  // a 1ª passagem só dispara o cronômetro
        else { const lt = S.t - S.lapStart; S.laps++; S.last = lt; if (S.best === null || lt < S.best) S.best = lt; S.lapStart = S.t; }
      } else if (S.frac < 0.15 && f > 0.85) {                // cruzou no sentido contrário
        if (S.laps > 0) S.laps--; else S.armed = false;
      }
    }
    S.frac = f;
  }

  /* --- controles --- */
  function reset() {
    const p0 = track.getPointAtLength(0), p1 = track.getPointAtLength(4);
    S.th = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    S.x = p0.x - K.SX * Math.cos(S.th) - K.SY * Math.sin(S.th);
    S.y = p0.y - K.SX * Math.sin(S.th) + K.SY * Math.cos(S.th);
    S.pins = { esq: 0, esqtras: 0, dir: 0, dirtras: 0 };
    S.t = 0; S.nextLoop = 0; S.branch = -1; S.armed = false; S.laps = 0; S.lapStart = 0; S.last = null; S.best = null; S.frac = 0; S.serial = [];
    const nx = -Math.sin(S.th) * 16, ny = Math.cos(S.th) * 16;
    const st = $i('simStart'); st.setAttribute('x1', p0.x - nx); st.setAttribute('y1', p0.y - ny); st.setAttribute('x2', p0.x + nx); st.setAttribute('y2', p0.y + ny);
    place(); paint(true);
  }
  function setTrack(k) { track.setAttribute('d', SIM_TRACKS[k]); sample(); reset(); }
  function say(msg) { $i('stStatus').textContent = msg; }
  function setRun(r) {
    S.run = r; $i('btnPlay').textContent = r ? 'Pausar' : 'Continuar';
    say(r ? 'Rodando. Com o mouse, arraste o robô para tirá-lo do lugar.' : 'Pausado.');
  }

  $i('btnPlay').addEventListener('click', () => setRun(!S.run));
  $i('btnReset').addEventListener('click', () => { reset(); say('Reiniciado: o sensor esquerdo começa sobre a linha.'); });
  $i('btnNudge').addEventListener('click', () => {
    S.x = Math.max(12, Math.min(628, S.x - Math.sin(S.th) * 70)); S.y = Math.max(12, Math.min(388, S.y + Math.cos(S.th) * 70));
    place(); say('Robô fora da linha: os motores mantêm o último comando.');
  });
  $i('selTrack').addEventListener('change', e => setTrack(e.target.value));
  $i('selSpeed').addEventListener('change', e => { S.speed = +e.target.value; });
  const rm = $i('rngMedia'), rv = $i('rngVel'), cu = $i('chkUno');
  const note = () => {
    $i('unoNote').innerHTML = S.uno
      ? 'No Uno, só os pinos 3, 5, 6, 9, 10 e 11 têm PWM. Os motores para frente estão nos pinos 2 e 4, então <code>analogWrite</code> vira liga/desliga: <b>128 ou mais liga no máximo</b> e abaixo de 128 desliga.'
      : 'PWM ideal: a velocidade é proporcional a <code>vel</code> (0 a 255), como o comentário do código sugere.';
  };
  rm.addEventListener('input', () => { S.media = +rm.value; $i('outMedia').textContent = S.media; paint(true); });
  rv.addEventListener('input', () => { S.vel = +rv.value; $i('outVel').textContent = S.vel; paint(true); });
  cu.addEventListener('change', () => { S.uno = cu.checked; note(); paint(true); });
  note();

  /* --- arrastar o robô (mouse e caneta) --- */
  const pt = (e) => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; return q.matrixTransform(svg.getScreenCTM().inverse()); };
  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    const p = pt(e);
    if (Math.hypot(p.x - S.x, p.y - S.y) < 52) { drag = true; off = { dx: S.x - p.x, dy: S.y - p.y }; svg.setPointerCapture(e.pointerId); svg.classList.add('drag'); e.preventDefault(); }
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return; const p = pt(e);
    S.x = Math.max(12, Math.min(628, p.x + off.dx)); S.y = Math.max(12, Math.min(388, p.y + off.dy)); place();
  });
  const endDrag = () => { if (drag) { drag = false; svg.classList.remove('drag'); say('Robô solto. Os motores mantêm o último comando até um sensor ver a linha.'); } };
  svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);

  /* --- desenho --- */
  function place() { bot.setAttribute('transform', `translate(${S.x.toFixed(2)} ${S.y.toFixed(2)}) rotate(${(S.th * 180 / Math.PI).toFixed(2)})`); }
  const fmt = (s) => s == null ? '–' : s.toFixed(1).replace('.', ',') + ' s';
  const outTxt = (name, v) => {
    if (!S.uno || HAS_PWM[name]) return v === 0 ? 'LOW' : v === 255 ? 'HIGH' : Math.round(v / 255 * 100) + '% PWM';
    return v >= 128 ? 'HIGH' : 'LOW';
  };
  const PINS = [['esq', 2, 'motoresq'], ['esqtras', 3, 'motoresqtras'], ['dir', 4, 'motordir'], ['dirtras', 5, 'motordirtras']];
  let codeKey = '';
  function codeHTML() {
    const L = [
      ['c', '// setup(): media = ' + S.media + ';'],
      ['', 'int intensidadeLuzesq = analogRead(pinoSensorLuzesq);'],
      ['', 'int intensidadeLuzdir = analogRead(pinoSensorLuzdir);'],
      ['', 'Serial.print("Esquerda: "); Serial.println(intensidadeLuzesq);'],
      ['', 'Serial.print(" | Direita: "); Serial.println(intensidadeLuzdir);'],
      ['', 'int vel = ' + S.vel + '; // 0 a 255'],
      ['', ''],
      ['1', 'if (intensidadeLuzesq < media) {'], ['1', '  analogWrite(motordirtras, 0);'], ['1', '  analogWrite(motordir, vel);'], ['1', '  analogWrite(motoresqtras, 0);'], ['1', '  analogWrite(motoresq, 0);'],
      ['2', '} else if (intensidadeLuzdir < media) {'], ['2', '  analogWrite(motoresqtras, 0);'], ['2', '  analogWrite(motoresq, vel);'], ['2', '  analogWrite(motordirtras, 0);'], ['2', '  analogWrite(motordir, 0);'], ['2', '}']
    ];
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return L.map(([b, s]) => `<span class="ln${b === 'c' ? ' ln--c' : ''}${(b === '1' || b === '2') && +b === S.branch ? ' on' : ''}">${esc(s) || ' '}</span>`).join('')
      + `<span class="ln ln--note${S.branch === 0 ? ' on' : ''}">Nenhuma condição verdadeira: nada é escrito e os motores mantêm o último comando.</span>`;
  }
  function paint(force) {
    const rows = [['adcE', S.le], ['adcD', S.ld]];
    rows.forEach(([id, v]) => {
      const r = $i(id); r.classList.toggle('on', v < S.media);
      r.querySelector('i').style.width = (v / 1023 * 100) + '%';
      r.querySelector('em').style.left = (S.media / 1023 * 100) + '%';
      r.querySelector('.readout').textContent = v;
    });
    $i('simSL').setAttribute('fill', S.le < S.media ? '#FF0044' : '#FFFFFF');
    $i('simSR').setAttribute('fill', S.ld < S.media ? '#FF0044' : '#FFFFFF');
    $i('simWL').setAttribute('fill', level('esq', S.pins.esq) > 0 ? '#04AA46' : '#000');
    $i('simWR').setAttribute('fill', level('dir', S.pins.dir) > 0 ? '#04AA46' : '#000');
    $i('pinRows').innerHTML = PINS.map(([k, n, nome]) => `<tr class="${level(k, S.pins[k]) > 0 ? 'on' : ''}"><td>${n}</td><td>${nome}</td><td>${S.pins[k]}</td><td>${outTxt(k, S.pins[k])}</td></tr>`).join('');
    $i('serial').textContent = S.serial.slice(-8).join('\n');
    const key = S.branch + '|' + S.media + '|' + S.vel;
    if (force || key !== codeKey) { codeKey = key; $i('code').innerHTML = codeHTML(); }
    $i('stLaps').textContent = S.laps; $i('stLast').textContent = fmt(S.last); $i('stBest').textContent = fmt(S.best);
  }

  /* --- laço de animação --- */
  let lastT = performance.now(), acc = 0, pT = 0;
  function frame(now) {
    if (stopped) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (S.run && !drag) { acc += dt * S.speed; let n = 0; while (acc >= K.DT && n < 3000) { stepPhys(); acc -= K.DT; n++; } }
    place();
    pT += dt; if (pT > 0.1) { pT = 0; paint(false); }
    raf = requestAnimationFrame(frame);
  }
  window.__simStop = () => { stopped = true; cancelAnimationFrame(raf); };
  window.__rlsim = { S, K, stepPhys, reset, setTrack, nearest };   // gancho de teste
  setTrack('oval');
  setRun(S.run);
  raf = requestAnimationFrame(frame);
}



document.addEventListener('DOMContentLoaded', () => {
  initThemeAndMenu();
  initMotionButton();
  initProjects();
  initContact();
  if ($('#simSvg')) initSim();
});
