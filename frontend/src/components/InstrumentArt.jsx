export default function InstrumentArt() {
  return (
    <svg viewBox="0 0 520 290" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="bodyGlow"><stop stopColor="#9b733e" stopOpacity=".18"/><stop offset="1" stopColor="#9b733e" stopOpacity=".01"/></radialGradient>
        <linearGradient id="neckFill" x2="0" y2="1"><stop stopColor="#30291d"/><stop offset="1" stopColor="#191b16"/></linearGradient>
      </defs>
      <path d="M18 145H510M345 15V275" stroke="#aaa084" strokeOpacity=".12" strokeDasharray="3 6"/>
      <circle cx="345" cy="145" r="121" stroke="#ac9565" strokeOpacity=".13"/>
      <circle cx="345" cy="145" r="95" stroke="#ac9565" strokeOpacity=".08"/>
      <g transform="rotate(-15 285 145)">
        <path d="M294 108C267 79 287 36 322 40C344 43 354 63 368 65C388 69 406 39 438 57C483 82 488 201 439 228C409 244 388 215 368 219C349 223 340 246 311 242C272 235 268 191 294 175C313 163 314 130 294 108Z" fill="url(#bodyGlow)" stroke="#ab9362" strokeWidth="1.2"/>
        <path d="M299 110C278 82 293 45 322 47C343 48 355 71 370 72C391 73 407 46 434 64C474 90 479 196 435 221C407 236 389 208 368 212C346 217 338 240 312 235C282 229 278 195 300 178C321 161 321 133 299 110Z" stroke="#ab9362" strokeOpacity=".35"/>
        <circle cx="342" cy="144" r="35" stroke="#ab9362" strokeWidth="1.5"/>
        <circle cx="342" cy="144" r="30" stroke="#ab9362" strokeOpacity=".45"/>
        <circle cx="342" cy="144" r="26" fill="#10120e" stroke="#ab9362" strokeOpacity=".5"/>
        <path d="M65 126L316 123V165L65 162Z" fill="url(#neckFill)" stroke="#ab9362" strokeOpacity=".65"/>
        {[98, 131, 161, 188, 213, 236, 256, 275, 292, 307].map((x) => <path key={x} d={`M${x} 125V164`} stroke="#ab9362" strokeOpacity=".55"/>)}
        <path d="M65 126L51 118L15 121L10 167L50 171L65 162Z" stroke="#ab9362" strokeOpacity=".75"/>
        <path d="M427 120V169" stroke="#ab9362" strokeWidth="7"/>
        {[132, 137, 142, 147, 152, 157].map((y, i) => <path key={y} d={`M25 ${y}H427`} stroke="#bdb396" strokeWidth={0.4 + i * 0.1} strokeOpacity=".6"/>)}
        {[131, 188, 236].map((x) => <circle key={x} cx={x} cy="144" r="2.2" fill="#b8a477"/>)}
      </g>
      <path d="M76 241H240M76 236V246M240 236V246" stroke="#a78c51" strokeOpacity=".5"/>
      <text x="76" y="265" fill="#9e967f" fontSize="9" letterSpacing="2" fontFamily="monospace">PRECISÃO QUE SE OUVE.</text>
      <text x="365" y="27" fill="#9e967f" fontSize="9" letterSpacing="2" fontFamily="monospace">ESCALA TEMPERADA</text>
    </svg>
  )
}
