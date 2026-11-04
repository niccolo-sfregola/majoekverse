// Motore WebGL del pianeta (vedi DESIGN.md e design/Pianeta.dc.html).
// È codice "normale", fuori da React: il componente Pianeta gli passa il
// canvas una volta sola e poi gli dice solo se deve disegnare o stare fermo.
//
// Tutto il pianeta è un unico fragment shader su un triangolo che copre il
// canvas: per ogni pixel si calcola se cade sulla sfera, che punto della
// superficie è (dopo la rotazione) e di che colore è la "lava" lì.

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

const FRAGMENT = `
precision highp float;
uniform vec2 uR;      // dimensioni del canvas in pixel
uniform float uA;     // angolo di rotazione
uniform float uT;     // tempo in secondi (anima lava e sfarfallio)
uniform sampler2D uL; // logo neon: rosso = tubo, verde = alone

// Rumore 3D e fbm (più ottave sommate) per la superficie procedurale.
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}

// Direzione della luce (da in alto a sinistra).
const vec3 L=vec3(-.583,.535,.61);

// Inclina un po' l'asse del pianeta, poi lo fa girare di uA.
vec3 ruota(vec3 n){vec3 q=n;float c=cos(.11),s=sin(.11);q.xy=mat2(c,-s,s,c)*q.xy;
c=cos(.04);s=sin(.04);q.yz=mat2(c,s,-s,c)*q.yz;
c=cos(uA);s=sin(uA);return vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z);}

// Superficie viola a bande con venature di lava corallo che scorrono.
vec3 lava(vec3 n,vec3 q){
vec3 w=q*1.55;
vec3 v=vec3(fbm(w+1.+uT*.018),fbm(w+7.-uT*.014),fbm(w+13.+uT*.01));
float f=fbm(w*1.15+v*2.6);
vec3 c=vec3(.045,.018,.10);
if(f>.40)c=vec3(.13,.05,.26);if(f>.47)c=vec3(.27,.11,.47);if(f>.53)c=vec3(.47,.24,.72);if(f>.60)c=vec3(.74,.58,.93);
float lum=max(dot(n,L),0.);
c*=.5+.3*step(.2,lum)+.3*step(.6,lum);
float m=fbm(q*1.25+v*1.5+20.+vec3(0.,uT*.012,0.))-q.y*.11-.05*exp(-q.y*q.y*26.);
float t=.5;
c+=vec3(.9,.2,.05)*exp(-max(t-m,0.)*24.)*.32*step(m,t);
if(m>t)c=vec3(.62,.07,.09);if(m>t+.018)c=vec3(.95,.27,.05);if(m>t+.05)c=vec3(1.,.53,.06);if(m>t+.09)c=vec3(1.,.77,.18);if(m>t+.13)c=vec3(1.,.95,.62);
vec3 g=q*34.;vec3 id=floor(g);float e=h(id+3.);
if(e>.965){float r=length(fract(g)-.5);float z=step(r,.12+(e-.965)*5.);c=mix(c,m>t?vec3(.3,.05,.1):vec3(.97,.94,1.),z);}
c+=vec3(.55,.36,1.)*pow(1.-n.z,4.)*.55;
return c;}

void main(){
// La sfera occupa il 78% del canvas: il resto serve all'alone.
vec2 p=(gl_FragCoord.xy-.5*uR)/(.5*min(uR.x,uR.y))/.78;
float d=length(p);
vec3 col=vec3(0.);float a=0.;
// Alone stretto che si azzera prima del bordo, così il riquadro non si vede.
float alone=exp(-max(d-1.,0.)*17.)*(1.-smoothstep(1.03,1.22,d));
if(d<1.){
vec3 n=vec3(p,sqrt(1.-d*d));vec3 q=ruota(n);
col=lava(n,q);
// Insegna neon: il logo è "avvolto" lungo l'equatore (lon/lat → uv).
float lon=atan(q.x,q.z),lat=asin(clamp(q.y,-1.,1.));
vec2 uv=vec2(fract(lon/6.28318+.75),lat/.7854+.5);
vec2 ne=(uv.y>0.&&uv.y<1.)?texture2D(uL,uv).rg:vec2(0.);
float fl=.93+.07*sin(uT*41.)*sin(uT*17.);
fl*=mix(1.,.35,step(.94,fract(sin(floor(uT*8.))*43758.5453)));
float fr=smoothstep(.02,.3,n.z);
col+=(vec3(1.,.95,.88)*ne.r*1.8+vec3(1.,.24,.30)*ne.g*1.15)*fl*fr;
a=1.-smoothstep(.99,1.,d);
}
gl_FragColor=vec4(col*a+vec3(.46,.42,1.)*alone*.36*(1.-a),a+alone*.36*(1.-a));
}
`;

// Velocità di rotazione in rad/s.
const VELOCITA = 0.22;
// Sotto ~22 fps di media il pianeta è "troppo lento".
const FRAME_LENTO_MS = 45;

export type Motore = {
  // false quando il pianeta è nascosto (es. in /universo): smette di disegnare.
  setAttivo: (attivo: boolean) => void;
  // Quanti px si è mosso il mouse nell'ultimo trascinamento: serve a
  // distinguere un clic (apre l'Universo) da un trascinamento.
  ultimoTrascinamento: () => number;
  stop: () => void;
};

// Se WebGL non c'è (o lo shader non compila) il canvas diventa una sfera CSS
// statica (classe .pianeta-statico) e la funzione restituisce null.
export function avviaPianeta(canvas: HTMLCanvasElement, fontLogo: string): Motore | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  });
  const programma = gl && creaProgramma(gl);
  if (!gl || !programma) {
    canvas.classList.add("pianeta-statico");
    return null;
  }

  gl.useProgram(programma);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(programma, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(programma, "uR");
  const uA = gl.getUniformLocation(programma, "uA");
  const uT = gl.getUniformLocation(programma, "uT");

  const fermo = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Densità di pixel: massimo 1.5, solo 1 su dispositivi con pochi core.
  const debole = (navigator.hardwareConcurrency ?? 8) <= 4;
  let dpr = Math.min(devicePixelRatio || 1, debole ? 1 : 1.5);

  let raf = 0;
  let attivo = true;
  let visibile = true; // dentro lo schermo (IntersectionObserver)
  let congelato = false; // troppo lento: resta l'ultimo fotogramma
  let tempo = 0; // secondi di animazione accumulati (si ferma in pausa)
  let ultimo = 0;
  let extra = 0; // rotazione aggiunta trascinando
  let drag: number | null = null;
  let mosso = 0;

  // Misura della velocità: media dei fotogrammi dopo un secondo di rodaggio.
  let campioni = 0;
  let somma = 0;
  let rodaggio = 1;

  // Logo neon su un canvas 2D, scritto due volte (una per metà pianeta).
  // Rosso = tubo sottile, verde = alone sfocato: lo shader li colora.
  const logo = document.createElement("canvas");
  logo.width = 2048;
  logo.height = 256;
  const tex = gl.createTexture();
  const caricaLogo = () => {
    const ctx = logo.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 2048, 256);
    ctx.font = `104px ${fontLogo}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalCompositeOperation = "lighter";
    for (const cx of [512, 1536]) {
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 8;
      ctx.strokeText("maJoekverse", cx, 132);
      ctx.strokeText("maJoekverse", cx, 132);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 4.5;
      ctx.strokeText("maJoekverse", cx, 132);
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logo);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  caricaLogo();
  // Blowbrush potrebbe non essere ancora pronto: si riscrive appena arriva.
  document.fonts.load(`104px ${fontLogo}`).then(() => {
    caricaLogo();
    richiedi();
  }, () => {});

  const disegna = () => {
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uA, tempo * VELOCITA + extra);
    gl.uniform1f(uT, tempo);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Gira solo se serve: attivo, nello schermo, scheda visibile, non congelato
  // e senza "movimento ridotto". Altrimenti nessun requestAnimationFrame.
  const deveGirare = () =>
    attivo && visibile && !document.hidden && !congelato && !fermo;

  const fotogramma = (ora: number) => {
    raf = 0;
    if (!deveGirare()) return;
    const dt = ultimo ? (ora - ultimo) / 1000 : 0;
    ultimo = ora;
    tempo += Math.min(dt, 0.1);
    disegna();
    controllaVelocita(dt);
    raf = requestAnimationFrame(fotogramma);
  };

  // Troppo lento: prima si abbassa la risoluzione, poi si congela il pianeta
  // sull'ultimo fotogramma (diventa di fatto un'immagine statica).
  const controllaVelocita = (dt: number) => {
    if (!dt || congelato) return;
    if (rodaggio > 0) {
      rodaggio -= dt;
      return;
    }
    somma += dt * 1000;
    campioni++;
    if (campioni < 60) return;
    const media = somma / campioni;
    campioni = 0;
    somma = 0;
    if (media <= FRAME_LENTO_MS) return;
    if (dpr > 0.75) {
      dpr = dpr > 1 ? 1 : 0.75;
      rodaggio = 0.5;
    } else {
      congelato = true;
    }
  };

  // Un fotogramma "a richiesta" anche quando il loop è fermo (movimento
  // ridotto, congelato): trascinando o al caricamento del font.
  function richiedi() {
    if (raf || !attivo) return;
    if (deveGirare()) {
      ultimo = 0;
      raf = requestAnimationFrame(fotogramma);
    } else {
      raf = requestAnimationFrame(() => {
        raf = 0;
        disegna();
      });
    }
  }

  // Ripartenza dopo una pausa: si azzera la misura, così il tempo passato
  // in pausa non conta come un fotogramma lentissimo.
  const riprendi = () => {
    campioni = 0;
    somma = 0;
    rodaggio = 1;
    richiedi();
  };

  const osservatore = new IntersectionObserver(([voce]) => {
    visibile = voce.isIntersecting;
    if (visibile) riprendi();
  });
  osservatore.observe(canvas);

  const onVisibilita = () => {
    if (!document.hidden) riprendi();
  };
  document.addEventListener("visibilitychange", onVisibilita);

  // Trascinamento solo col mouse: sul telefono il dito deve poter scorrere
  // la pagina (touch-action: pan-y sul canvas) e un tocco apre l'Universo.
  const onDown = (e: PointerEvent) => {
    mosso = 0;
    if (e.pointerType !== "mouse") return;
    drag = e.clientX;
    canvas.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent) => {
    if (drag === null) return;
    extra -= (e.clientX - drag) * 0.008;
    mosso += Math.abs(e.clientX - drag);
    drag = e.clientX;
    richiedi();
  };
  const onUp = () => {
    drag = null;
    canvas.style.cursor = "";
  };
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  richiedi();

  return {
    setAttivo(valore) {
      attivo = valore;
      if (attivo) riprendi();
    },
    ultimoTrascinamento: () => mosso,
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      attivo = false;
      osservatore.disconnect();
      document.removeEventListener("visibilitychange", onVisibilita);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    },
  };
}

function creaProgramma(gl: WebGLRenderingContext) {
  const shader = (tipo: number, sorgente: string) => {
    const s = gl.createShader(tipo);
    if (!s) return null;
    gl.shaderSource(s, sorgente);
    gl.compileShader(s);
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, VERTEX);
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
  const p = gl.createProgram();
  if (!vs || !fs || !p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}
