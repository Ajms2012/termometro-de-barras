const CLAVE_TEMA = "termometro.tema";
const $body = document.body;
const $escena = document.getElementById("weather-scene");
const $ambiente = document.getElementById("theme-scene");
const $canvasRive = document.getElementById("rive-weather");
const $botonTema = document.getElementById("btn-tema");

let riveActual = null;
let escenaTimeline = null;
let ambienteTimeline = null;

function movimientoReducido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reiniciarTimeline(timeline) {
  timeline?.kill();
  return null;
}

const ICONOS = {
  soleado: `
    <svg class="weather-icon weather-icon--sun" viewBox="0 0 120 120" role="presentation">
      <circle class="sun-core" cx="60" cy="60" r="24" />
      <g class="sun-rays">
        <path d="M60 10v18" />
        <path d="M60 92v18" />
        <path d="M10 60h18" />
        <path d="M92 60h18" />
        <path d="M24.6 24.6l12.7 12.7" />
        <path d="M82.7 82.7l12.7 12.7" />
        <path d="M95.4 24.6 82.7 37.3" />
        <path d="M37.3 82.7 24.6 95.4" />
      </g>
    </svg>`,
  lluvia: `
    <svg class="weather-icon weather-icon--rain" viewBox="0 0 140 120" role="presentation">
      <path class="cloud" d="M41 72h60a24 24 0 0 0 1-48 34 34 0 0 0-63-6 27 27 0 0 0 2 54Z" />
      <g class="drops">
        <path d="M44 84v18" />
        <path d="M70 82v22" />
        <path d="M96 84v18" />
      </g>
    </svg>`,
  frio: `
    <svg class="weather-icon weather-icon--cold" viewBox="0 0 120 120" role="presentation">
      <path class="snowflake" d="M60 16v88M22 38l76 44M98 38 22 82M43 24l17 18 17-18M43 96l17-18 17 18M23 58l25-7-7-25M97 62l-25 7 7 25" />
    </svg>`,
  calor: `
    <svg class="weather-icon weather-icon--heat" viewBox="0 0 140 120" role="presentation">
      <circle class="sun-core" cx="54" cy="50" r="26" />
      <path class="heat-wave" d="M92 28c16 14-14 24 2 40s-14 24 2 40" />
      <path class="heat-wave heat-wave--two" d="M112 22c14 16-12 26 2 42s-12 24 2 40" />
    </svg>`,
  nublado: `
    <svg class="weather-icon weather-icon--cloud" viewBox="0 0 150 110" role="presentation">
      <path class="cloud cloud--back" d="M35 72h80a25 25 0 0 0 0-50 33 33 0 0 0-61-6A31 31 0 0 0 35 72Z" />
      <path class="cloud" d="M49 86h70a22 22 0 0 0 1-44 30 30 0 0 0-56-5 25 25 0 0 0-15 49Z" />
    </svg>`,
};

const AMBIENTES = {
  light: `
    <svg class="ambient ambient--sun" viewBox="0 0 180 180" role="presentation">
      <circle class="ambient-sun__halo" cx="90" cy="90" r="62" />
      <circle class="ambient-sun__core" cx="90" cy="90" r="34" />
      <g class="ambient-sun__rays">
        <path d="M90 12v28" />
        <path d="M90 140v28" />
        <path d="M12 90h28" />
        <path d="M140 90h28" />
        <path d="M35 35l20 20" />
        <path d="M125 125l20 20" />
        <path d="M145 35l-20 20" />
        <path d="M55 125l-20 20" />
      </g>
    </svg>
    <svg class="ambient ambient--cloud ambient--cloud-one" viewBox="0 0 220 120" role="presentation">
      <path d="M42 89h126a31 31 0 0 0 1-62 44 44 0 0 0-82-7 38 38 0 0 0-45 69Z" />
    </svg>
    <svg class="ambient ambient--cloud ambient--cloud-two" viewBox="0 0 220 120" role="presentation">
      <path d="M40 84h138a28 28 0 0 0 0-56 39 39 0 0 0-73-8 35 35 0 0 0-65 20 31 31 0 0 0 0 44Z" />
    </svg>
    <svg class="ambient ambient--cloud ambient--cloud-three" viewBox="0 0 240 120" role="presentation">
      <path d="M44 88h152a30 30 0 0 0 0-60 48 48 0 0 0-89-7 41 41 0 0 0-63 67Z" />
    </svg>
    <svg class="ambient ambient--cloud ambient--cloud-four" viewBox="0 0 260 130" role="presentation">
      <path d="M46 92h166a32 32 0 0 0 2-64 52 52 0 0 0-96-8 42 42 0 0 0-72 72Z" />
    </svg>
    <svg class="ambient ambient--cloud ambient--cloud-five" viewBox="0 0 210 120" role="presentation">
      <path d="M38 82h136a27 27 0 0 0 0-54 37 37 0 0 0-69-7 34 34 0 0 0-67 15 29 29 0 0 0 0 46Z" />
    </svg>
    <svg class="ambient ambient--birds ambient--birds-one" viewBox="0 0 180 80" role="presentation">
      <g class="bird-flock">
        <g class="bird" transform="translate(18 38) scale(1.08)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
        <g class="bird" transform="translate(84 22) scale(.82)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
        <g class="bird" transform="translate(126 50) scale(.72)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
      </g>
    </svg>
    <svg class="ambient ambient--birds ambient--birds-two" viewBox="0 0 170 76" role="presentation">
      <g class="bird-flock">
        <g class="bird" transform="translate(18 32) scale(.82)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
        <g class="bird" transform="translate(76 46) scale(.7)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
        <g class="bird" transform="translate(122 24) scale(.64)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
      </g>
    </svg>
    <svg class="ambient ambient--birds ambient--birds-three" viewBox="0 0 150 70" role="presentation">
      <g class="bird-flock">
        <g class="bird" transform="translate(12 32) scale(.66)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
        <g class="bird" transform="translate(70 21) scale(.56)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
        <g class="bird" transform="translate(102 47) scale(.52)">
          <path class="bird__wing bird__wing--left" d="M20 13C11 2 3 1 0 11c6-2 12 1 19 9" />
          <path class="bird__wing bird__wing--right" d="M24 13C34 2 43 2 46 12c-7-2-14 1-21 8" />
          <path class="bird__body" d="M16 15c6-5 13-5 19 0c-4 4-14 5-19 0Z" />
          <path class="bird__tail" d="M17 17l-7 4l8 1" />
          <path class="bird__beak" d="M35 15l6-2l-5 5" />
        </g>
      </g>
    </svg>`,
  dark: `
    <svg class="ambient ambient--moon" viewBox="0 0 170 170" role="presentation">
      <path class="ambient-moon__body" d="M116 124A58 58 0 0 1 64 24a64 64 0 1 0 76 76 57 57 0 0 1-24 24Z" />
      <circle class="ambient-moon__crater" cx="96" cy="76" r="6" />
      <circle class="ambient-moon__crater" cx="75" cy="111" r="4" />
    </svg>
    <svg class="ambient ambient--stars ambient--stars-one" viewBox="0 0 420 240" role="presentation">
      <g class="stars stars--slow">
        <path d="M58 34 63 48 78 53 64 58 58 72 52 58 38 53 52 48Z" />
        <path d="M320 42 324 53 336 57 325 62 320 74 315 62 304 57 316 53Z" />
        <path d="M184 132 188 142 199 146 189 150 184 161 179 150 169 146 180 142Z" />
      </g>
      <g class="stars stars--fast">
        <circle cx="122" cy="68" r="3" />
        <circle cx="248" cy="90" r="2.5" />
        <circle cx="356" cy="128" r="3.5" />
        <circle cx="84" cy="186" r="2.5" />
        <circle cx="278" cy="190" r="3" />
      </g>
    </svg>
    <svg class="ambient ambient--stars ambient--stars-two" viewBox="0 0 420 240" role="presentation">
      <g class="stars stars--slow">
        <path d="M95 48 99 58 110 62 100 66 95 77 90 66 80 62 91 58Z" />
        <path d="M282 32 287 46 301 51 288 56 282 70 276 56 263 51 277 46Z" />
        <path d="M348 154 352 165 364 169 353 174 348 186 343 174 332 169 344 165Z" />
      </g>
      <g class="stars stars--fast">
        <circle cx="54" cy="134" r="2.5" />
        <circle cx="166" cy="98" r="3" />
        <circle cx="226" cy="176" r="2.5" />
        <circle cx="386" cy="72" r="3.5" />
      </g>
    </svg>
    <svg class="ambient ambient--stars ambient--stars-three" viewBox="0 0 420 240" role="presentation">
      <g class="stars stars--slow">
        <path d="M45 172 49 183 61 187 50 192 45 204 40 192 29 187 41 183Z" />
        <path d="M214 44 218 55 230 59 219 64 214 76 209 64 198 59 210 55Z" />
      </g>
      <g class="stars stars--fast">
        <circle cx="128" cy="42" r="2.5" />
        <circle cx="252" cy="126" r="3" />
        <circle cx="334" cy="206" r="2.5" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-one" viewBox="0 0 260 70" role="presentation">
      <defs>
        <linearGradient id="sso-1" x1="8" y1="58" x2="242" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".52" stop-color="#b2c4ff" stop-opacity=".34" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".86" />
        </linearGradient>
        <linearGradient id="ssi-1" x1="162" y1="26" x2="242" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".96" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-1)" d="M8 58C76 42 145 25 242 10" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-1)" d="M162 26L242 10" />
      <circle class="shooting-star__head" cx="242" cy="10" r="2.4" />
      <g class="shooting-star__sparkle" transform="translate(242,10)">
        <line x1="0" y1="-7" x2="0" y2="7" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".52" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".52" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fff" stroke-width=".7" stroke-linecap="round" opacity=".28" />
        <line x1="5" y1="-5" x2="-5" y2="5" stroke="#fff" stroke-width=".7" stroke-linecap="round" opacity=".28" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-two" viewBox="0 0 220 64" role="presentation">
      <defs>
        <linearGradient id="sso-2" x1="7" y1="52" x2="202" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".5" stop-color="#8fa9ff" stop-opacity=".28" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".82" />
        </linearGradient>
        <linearGradient id="ssi-2" x1="134" y1="23" x2="202" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".94" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-2)" d="M7 52C64 39 119 24 202 9" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-2)" d="M134 23L202 9" />
      <circle class="shooting-star__head" cx="202" cy="9" r="2.1" />
      <g class="shooting-star__sparkle" transform="translate(202,9)">
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".48" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".48" />
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="#fff" stroke-width=".6" stroke-linecap="round" opacity=".25" />
        <line x1="4" y1="-4" x2="-4" y2="4" stroke="#fff" stroke-width=".6" stroke-linecap="round" opacity=".25" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-three" viewBox="0 0 280 76" role="presentation">
      <defs>
        <linearGradient id="sso-3" x1="10" y1="64" x2="260" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".56" stop-color="#cad5ff" stop-opacity=".38" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".92" />
        </linearGradient>
        <linearGradient id="ssi-3" x1="173" y1="30" x2="260" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".97" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-3)" d="M10 64C87 47 162 29 260 11" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-3)" d="M173 30L260 11" />
      <circle class="shooting-star__head" cx="260" cy="11" r="2.7" />
      <g class="shooting-star__sparkle" transform="translate(260,11)">
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".55" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".55" />
        <line x1="-5.5" y1="-5.5" x2="5.5" y2="5.5" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".3" />
        <line x1="5.5" y1="-5.5" x2="-5.5" y2="5.5" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".3" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-four" viewBox="0 0 210 58" role="presentation">
      <defs>
        <linearGradient id="sso-4" x1="7" y1="47" x2="192" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".53" stop-color="#a8baff" stop-opacity=".26" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".80" />
        </linearGradient>
        <linearGradient id="ssi-4" x1="127" y1="22" x2="192" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".92" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-4)" d="M7 47C60 35 114 22 192 8" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-4)" d="M127 22L192 8" />
      <circle class="shooting-star__head" cx="192" cy="8" r="1.9" />
      <g class="shooting-star__sparkle" transform="translate(192,8)">
        <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".46" />
        <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".46" />
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="#fff" stroke-width=".6" stroke-linecap="round" opacity=".22" />
        <line x1="4" y1="-4" x2="-4" y2="4" stroke="#fff" stroke-width=".6" stroke-linecap="round" opacity=".22" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-five" viewBox="0 0 250 68" role="presentation">
      <defs>
        <linearGradient id="sso-5" x1="8" y1="56" x2="228" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".51" stop-color="#b6c8ff" stop-opacity=".24" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".78" />
        </linearGradient>
        <linearGradient id="ssi-5" x1="152" y1="26" x2="228" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".93" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-5)" d="M8 56C76 42 137 27 228 10" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-5)" d="M152 26L228 10" />
      <circle class="shooting-star__head" cx="228" cy="10" r="2.2" />
      <g class="shooting-star__sparkle" transform="translate(228,10)">
        <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".5" />
        <line x1="-6.5" y1="0" x2="6.5" y2="0" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".5" />
        <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" stroke="#fff" stroke-width=".65" stroke-linecap="round" opacity=".26" />
        <line x1="4.5" y1="-4.5" x2="-4.5" y2="4.5" stroke="#fff" stroke-width=".65" stroke-linecap="round" opacity=".26" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-six" viewBox="0 0 238 65" role="presentation">
      <defs>
        <linearGradient id="sso-6" x1="8" y1="53" x2="218" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".54" stop-color="#c2d0ff" stop-opacity=".32" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".84" />
        </linearGradient>
        <linearGradient id="ssi-6" x1="144" y1="25" x2="218" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".95" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-6)" d="M8 53C72 39 130 25 218 9" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-6)" d="M144 25L218 9" />
      <circle class="shooting-star__head" cx="218" cy="9" r="2.3" />
      <g class="shooting-star__sparkle" transform="translate(218,9)">
        <line x1="0" y1="-7" x2="0" y2="7" stroke="#fff" stroke-width="1.05" stroke-linecap="round" opacity=".5" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="#fff" stroke-width="1.05" stroke-linecap="round" opacity=".5" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fff" stroke-width=".68" stroke-linecap="round" opacity=".26" />
        <line x1="5" y1="-5" x2="-5" y2="5" stroke="#fff" stroke-width=".68" stroke-linecap="round" opacity=".26" />
      </g>
    </svg>
    <svg class="ambient ambient--shooting-star ambient--shooting-star-seven" viewBox="0 0 198 54" role="presentation">
      <defs>
        <linearGradient id="sso-7" x1="7" y1="44" x2="182" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset=".5" stop-color="#a4bbff" stop-opacity=".22" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".76" />
        </linearGradient>
        <linearGradient id="ssi-7" x1="121" y1="21" x2="182" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="1" stop-color="#ffffff" stop-opacity=".9" />
        </linearGradient>
      </defs>
      <path class="shooting-star__tail" stroke="url(#sso-7)" d="M7 44C54 33 106 21 182 8" />
      <path class="shooting-star__inner-tail" stroke="url(#ssi-7)" d="M121 21L182 8" />
      <circle class="shooting-star__head" cx="182" cy="8" r="1.8" />
      <g class="shooting-star__sparkle" transform="translate(182,8)">
        <line x1="0" y1="-5" x2="0" y2="5" stroke="#fff" stroke-width=".85" stroke-linecap="round" opacity=".44" />
        <line x1="-5" y1="0" x2="5" y2="0" stroke="#fff" stroke-width=".85" stroke-linecap="round" opacity=".44" />
        <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#fff" stroke-width=".55" stroke-linecap="round" opacity=".22" />
        <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#fff" stroke-width=".55" stroke-linecap="round" opacity=".22" />
      </g>
    </svg>`,
};

function mediaTemperatura(datosHorarios) {
  const total = datosHorarios.reduce((suma, dato) => suma + dato.temperatura, 0);
  return total / datosHorarios.length;
}

function contar(datosHorarios, predicado) {
  return datosHorarios.filter(predicado).length;
}

function tipoClima(datosHorarios) {
  const media = mediaTemperatura(datosHorarios);
  const lluvias = contar(datosHorarios, (dato) =>
    (dato.codigoClima >= 51 && dato.codigoClima <= 67)
    || (dato.codigoClima >= 80 && dato.codigoClima <= 82)
    || dato.codigoClima >= 95
    || dato.probabilidadLluvia >= 55
  );
  const nieve = contar(datosHorarios, (dato) =>
    (dato.codigoClima >= 71 && dato.codigoClima <= 77)
    || (dato.codigoClima >= 85 && dato.codigoClima <= 86)
  );
  const nubes = contar(datosHorarios, (dato) =>
    dato.codigoClima >= 2 && dato.codigoClima <= 48
  );

  if (lluvias >= 3) return "lluvia";
  if (nieve >= 2 || media <= 7) return "frio";
  if (media >= 29) return "calor";
  if (nubes >= 8) return "nublado";
  return "soleado";
}

function hashCiudad(texto) {
  return [...texto].reduce((total, letra) => total + letra.charCodeAt(0), 0);
}

function animarEscena(tipo) {
  if (!window.gsap) return;

  escenaTimeline = reiniciarTimeline(escenaTimeline);
  window.gsap.killTweensOf(".weather-icon, .sun-rays, .drops path, .heat-wave, .snowflake, .cloud");

  if (movimientoReducido()) {
    window.gsap.set(".weather-icon", { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
    window.gsap.set(".sun-rays, .drops path, .heat-wave, .snowflake, .cloud", { clearProps: "transform,opacity,visibility" });
    return;
  }

  escenaTimeline = window.gsap.timeline();
  escenaTimeline.fromTo(
    ".weather-icon",
    { autoAlpha: 0, y: 18, scale: 0.92 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, ease: "power2.out" }
  );

  if (tipo === "soleado" || tipo === "calor") {
    escenaTimeline.to(".sun-rays", {
      rotate: 360,
      transformOrigin: "center",
      duration: tipo === "calor" ? 18 : 26,
      repeat: -1,
      ease: "none",
    }, 0);
  }

  if (tipo === "lluvia") {
    escenaTimeline.fromTo(
      ".drops path",
      { y: -10, autoAlpha: 0.25 },
      { y: 14, autoAlpha: 1, duration: 0.75, repeat: -1, stagger: 0.12, ease: "power1.in" },
      0
    );
  }

  if (tipo === "frio") {
    escenaTimeline.to(".snowflake", {
      rotate: 12,
      transformOrigin: "center",
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }, 0);
  }

  if (tipo === "nublado") {
    escenaTimeline.to(".cloud", {
      x: 10,
      duration: 3.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.3,
    }, 0);
  }

  if (tipo === "calor") {
    escenaTimeline.fromTo(
      ".heat-wave",
      { y: 10, autoAlpha: 0.35 },
      { y: -12, autoAlpha: 1, duration: 1.2, repeat: -1, yoyo: true, stagger: 0.16, ease: "sine.inOut" },
      0
    );
  }
}

function animarAmbiente(tema) {
  if (!window.gsap) return;

  ambienteTimeline = reiniciarTimeline(ambienteTimeline);
  window.gsap.killTweensOf(".ambient, .ambient-sun__rays, .ambient--cloud, .ambient--birds, .bird__wing, .ambient--moon, .ambient--stars, .ambient--shooting-star, .stars path, .stars circle");

  if (movimientoReducido()) {
    window.gsap.set(".ambient", { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
    window.gsap.set(".ambient--shooting-star", { autoAlpha: 0 });
    window.gsap.set(".ambient-sun__rays, .bird__wing, .stars path, .stars circle", { clearProps: "transform,opacity,visibility" });
    return;
  }

  ambienteTimeline = window.gsap.timeline();
  ambienteTimeline.fromTo(
    ".ambient",
    { autoAlpha: 0, y: 16, scale: 0.96 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
  );

  if (tema === "light") {
    ambienteTimeline.to(".ambient-sun__rays", {
      rotate: 360,
      transformOrigin: "center",
      duration: 36,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--cloud-one", {
      x: "-36vw",
      y: 0,
    }, {
      x: "116vw",
      y: 12,
      duration: 58,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--cloud-two", {
      x: "112vw",
      y: 0,
    }, {
      x: "-42vw",
      y: -10,
      duration: 76,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--cloud-three", {
      x: "-54vw",
      y: 0,
    }, {
      x: "110vw",
      y: -14,
      duration: 94,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--cloud-four", {
      x: "118vw",
      y: 0,
    }, {
      x: "-48vw",
      y: 18,
      duration: 88,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--cloud-five", {
      x: "-44vw",
      y: 0,
    }, {
      x: "118vw",
      y: -8,
      duration: 67,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--birds-one", {
      x: "-22vw",
      y: 0,
    }, {
      x: "112vw",
      y: -18,
      duration: 34,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--birds-two", {
      x: "112vw",
      y: 0,
    }, {
      x: "-22vw",
      y: 14,
      duration: 42,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.fromTo(".ambient--birds-three", {
      x: "-18vw",
      y: 0,
    }, {
      x: "110vw",
      y: 10,
      duration: 52,
      repeat: -1,
      ease: "none",
    }, 0);
    ambienteTimeline.to(".bird__wing--left", {
      rotate: -16,
      y: -2,
      transformOrigin: "right bottom",
      duration: 0.38,
      repeat: -1,
      yoyo: true,
      stagger: 0.06,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.to(".bird__wing--right", {
      rotate: 16,
      y: -2,
      transformOrigin: "left bottom",
      duration: 0.38,
      repeat: -1,
      yoyo: true,
      stagger: 0.06,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.to(".bird-flock", {
      y: -3,
      transformOrigin: "center",
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }, 0);
  } else {
    const lanzarEstrellaFugaz = (selector, opciones) => {
      const starTl = window.gsap.timeline({
        repeat: -1,
        repeatDelay: opciones.repeatDelay,
      });

      starTl
        .set(selector, {
          x: opciones.xInicio,
          y: opciones.yInicio,
          rotate: opciones.rotate,
          scale: opciones.scale * 0.3,
          autoAlpha: 0,
        })
        // Flash de aparición: brilla intenso y escala desde un punto
        .to(selector, {
          autoAlpha: Math.min(opciones.opacity * 1.4, 1),
          scale: opciones.scale * 1.15,
          duration: 0.07,
          ease: "power4.out",
        })
        // Establece opacidad y escala normales
        .to(selector, {
          autoAlpha: opciones.opacity,
          scale: opciones.scale,
          duration: 0.2,
          ease: "power2.out",
        })
        // Vuelo completo: empieza lento, termina muy rápido (aceleración meteórica)
        .to(selector, {
          x: opciones.xFin,
          y: opciones.yFin,
          duration: opciones.duration,
          ease: "power3.in",
        }, 0)
        // Burnout final: se encoge y desaparece bruscamente
        .to(selector, {
          autoAlpha: 0,
          scale: opciones.scale * 0.4,
          duration: opciones.fade,
          ease: "power4.in",
        }, `-=${opciones.fade}`);

      ambienteTimeline.add(starTl, opciones.delay);
    };

    ambienteTimeline.to(".ambient--moon", {
      y: 10,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.fromTo(".ambient--stars-one", {
      x: "-12vw",
      y: 0,
    }, {
      x: "16vw",
      y: 10,
      duration: 38,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.fromTo(".ambient--stars-two", {
      x: "18vw",
      y: 0,
    }, {
      x: "-18vw",
      y: -12,
      duration: 52,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.fromTo(".ambient--stars-three", {
      x: "-8vw",
      y: 0,
    }, {
      x: "22vw",
      y: -8,
      duration: 68,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.to(".stars--slow path", {
      autoAlpha: 0.35,
      scale: 0.82,
      transformOrigin: "center",
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.28,
      ease: "sine.inOut",
    }, 0);
    ambienteTimeline.to(".stars--fast circle", {
      autoAlpha: 0.2,
      scale: 0.72,
      transformOrigin: "center",
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      stagger: 0.16,
      ease: "sine.inOut",
    }, 0);
    lanzarEstrellaFugaz(".ambient--shooting-star-one", {
      xInicio: "-34vw",
      xFin: "104vw",
      yInicio: -10,
      yFin: 126,
      rotate: -7,
      scale: 0.78,
      opacity: 0.72,
      duration: 1.2,
      repeatDelay: 6.2,
      delay: 0.4,
      fade: 0.32,
    });
    lanzarEstrellaFugaz(".ambient--shooting-star-two", {
      xInicio: "-20vw",
      xFin: "96vw",
      yInicio: 0,
      yFin: 96,
      rotate: -8,
      scale: 0.56,
      opacity: 0.58,
      duration: 0.95,
      repeatDelay: 8.8,
      delay: 2.2,
      fade: 0.24,
    });
    lanzarEstrellaFugaz(".ambient--shooting-star-three", {
      xInicio: "-42vw",
      xFin: "102vw",
      yInicio: 0,
      yFin: 154,
      rotate: -6,
      scale: 0.9,
      opacity: 0.66,
      duration: 1.45,
      repeatDelay: 10.4,
      delay: 4.8,
      fade: 0.34,
    });
    lanzarEstrellaFugaz(".ambient--shooting-star-four", {
      xInicio: "-22vw",
      xFin: "92vw",
      yInicio: 0,
      yFin: 78,
      rotate: -9,
      scale: 0.5,
      opacity: 0.5,
      duration: 0.85,
      repeatDelay: 11.6,
      delay: 6.1,
      fade: 0.22,
    });
    lanzarEstrellaFugaz(".ambient--shooting-star-five", {
      xInicio: "-38vw",
      xFin: "100vw",
      yInicio: 0,
      yFin: 132,
      rotate: -7,
      scale: 0.64,
      opacity: 0.54,
      duration: 1.08,
      repeatDelay: 13,
      delay: 8.4,
      fade: 0.26,
    });
    lanzarEstrellaFugaz(".ambient--shooting-star-six", {
      xInicio: "-30vw",
      xFin: "98vw",
      yInicio: 0,
      yFin: 110,
      rotate: -6,
      scale: 0.74,
      opacity: 0.62,
      duration: 1.16,
      repeatDelay: 7.4,
      delay: 3.2,
      fade: 0.28,
    });
    lanzarEstrellaFugaz(".ambient--shooting-star-seven", {
      xInicio: "-26vw",
      xFin: "94vw",
      yInicio: 0,
      yFin: 86,
      rotate: -8,
      scale: 0.48,
      opacity: 0.46,
      duration: 0.78,
      repeatDelay: 14.5,
      delay: 10.8,
      fade: 0.2,
    });
  }
}

function pintarAmbiente(tema) {
  $ambiente.innerHTML = AMBIENTES[tema];
  $ambiente.dataset.themeScene = tema;
  animarAmbiente(tema);
}

export function aplicarClima(ciudad, datosHorarios) {
  if (!datosHorarios.length) return;

  const tipo = tipoClima(datosHorarios);
  const media = mediaTemperatura(datosHorarios);
  const ciudadClave = hashCiudad(ciudad.nombre);

  $body.dataset.weather = tipo;
  $body.style.setProperty("--temp-media", media.toFixed(1));
  $body.style.setProperty("--city-shift", `${ciudadClave % 28}px`);

  $escena.innerHTML = ICONOS[tipo] + ICONOS[tipo === "soleado" ? "nublado" : "soleado"];
  $escena.dataset.weather = tipo;
  animarEscena(tipo);
}

export function inicializarTema() {
  const temaGuardado = localStorage.getItem(CLAVE_TEMA);
  const tema = temaGuardado === "light" || temaGuardado === "dark" ? temaGuardado : "dark";

  function aplicarTema(siguienteTema) {
    $body.dataset.theme = siguienteTema;
    pintarAmbiente(siguienteTema);
    $botonTema.checked = siguienteTema === "dark";
    $botonTema.setAttribute("aria-checked", String(siguienteTema === "dark"));
    $botonTema.setAttribute(
      "aria-label",
      siguienteTema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
    );
    localStorage.setItem(CLAVE_TEMA, siguienteTema);

    if (window.gsap) {
      window.gsap.fromTo(
        "body",
        { opacity: 0.92 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      window.gsap.fromTo(
        ".theme-toggle__track",
        { filter: "brightness(1.12)" },
        { filter: "brightness(1)", duration: 0.34, ease: "power2.out" }
      );
    }
  }

  aplicarTema(tema);
  $botonTema.addEventListener("change", () => {
    aplicarTema($botonTema.checked ? "dark" : "light");
  });
}

export function inicializarRive() {
  if (!window.rive || !$canvasRive) return;

  try {
    riveActual = new window.rive.Rive({
      src: "https://cdn.rive.app/animations/vapor_loader.riv",
      canvas: $canvasRive,
      autoplay: true,
      onLoad: () => {
        riveActual.resizeDrawingSurfaceToCanvas();
        $canvasRive.classList.add("weather-backdrop__rive--ready");
      },
      onLoadError: () => {
        $canvasRive.hidden = true;
      },
    });

    window.addEventListener("resize", () => {
      riveActual?.resizeDrawingSurfaceToCanvas();
    });
  } catch {
    $canvasRive.hidden = true;
  }
}
