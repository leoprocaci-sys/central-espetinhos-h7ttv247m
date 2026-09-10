import React from 'react'
import logoPng from '@/assets/logomarca-e8309.png'

export interface BrandLogoProps {
  /**
   * 'full': Marca emblemática + tipografia CENTRAL ESPETINHOS
   * 'mark': Apenas o emblema (C dourado, espetos cruzados e torre do relógio)
   * 'horizontal': Emblema ao lado da tipografia (ideal para barras estreitas ou cabeçalhos)
   */
  variant?: 'mark' | 'full' | 'horizontal'
  /**
   * Se true, renderiza a imagem oficial em alta fidelidade com recorte/fundo apropriado.
   * Se false, renderiza a ilustração vetorial SVG nativa equivalente.
   * Default: true (usa o asset oficial enviado com fallback/SVG integrado).
   */
  useOriginalAsset?: boolean
  className?: string
  alt?: string
}

/**
 * Componente oficial de logotipo da Central Espetinhos.
 * Inclui:
 * 1. Grande "C" em crescente dourado ao fundo com gradiente dourado claro a escuro
 * 2. Dois espetos de madeira cruzados em X com cubos de carne vermelha suculenta e pontas metálicas douradas
 * 3. Torre de relógio estilo Art Déco (estilo Central do Brasil) com mostrador branco e ponteiros
 * 4. Tipografia CENTRAL (carvão/relevo) e ESPETINHOS (dourado trabalhado)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  useOriginalAsset = true,
  className = '',
  alt = 'Central Espetinhos',
}) => {
  // Se solicitado usar o asset oficial gerado pelo usuário:
  if (useOriginalAsset) {
    if (variant === 'mark') {
      return (
        <div
          className={`relative inline-block overflow-hidden select-none ${className}`}
          style={{ aspectRatio: '1/1' }}
          title="Central Espetinhos"
        >
          {/* A imagem original tem o emblema na metade superior (~72%) e o texto embaixo.
              Para a variante "mark", enquadramos o topo/emblema com escala e posicionamento perfeito */}
          <div className="w-full h-full rounded-full bg-[#1A1A1A] p-0.5 flex items-center justify-center overflow-hidden shadow-xs border border-[#C68A4B]/40">
            <img
              src={logoPng}
              alt={alt}
              className="w-[130%] h-[130%] max-w-none object-cover -translate-y-[8%]"
              loading="eager"
            />
          </div>
        </div>
      )
    }

    if (variant === 'horizontal') {
      return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
          <div className="w-10 h-10 shrink-0 rounded-xl bg-[#1A1A1A] border border-[#C68A4B]/40 p-0.5 overflow-hidden flex items-center justify-center shadow-xs">
            <img
              src={logoPng}
              alt=""
              className="w-[130%] h-[130%] max-w-none object-cover -translate-y-[8%]"
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span
              className="font-black text-sm tracking-[0.14em] text-[#1A1A1A] uppercase"
              style={{ fontFamily: "'Cinzel', 'Trajan Pro', 'Cinzel Decorative', Georgia, serif" }}
            >
              CENTRAL
            </span>
            <span
              className="font-black text-xs tracking-[0.18em] uppercase bg-gradient-to-r from-[#D49E24] via-[#F5C542] to-[#B8860B] bg-clip-text text-transparent mt-0.5"
              style={{ fontFamily: "'Cinzel', 'Trajan Pro', Georgia, serif" }}
            >
              ESPETINHOS
            </span>
          </div>
        </div>
      )
    }

    // Default 'full' variant using the official logo
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <div className="w-full max-w-[220px] aspect-square rounded-2xl bg-[#121212] p-2 border border-[#C68A4B]/30 shadow-md flex items-center justify-center overflow-hidden">
          <img src={logoPng} alt={alt} className="w-full h-full object-contain" loading="eager" />
        </div>
      </div>
    )
  }

  // Componente 100% SVG vetorial puro (quando useOriginalAsset = false ou para renderização puramente vetorial)
  return <BrandLogoSvg variant={variant} className={className} />
}

/**
 * Ilustração vetorial SVG de alta definição recriando fielmente todos os elementos:
 * - O grande "C" crescente dourado com gradiente e borda chanfrada
 * - Dois espetos cruzados em X com cubos de carne texturizados e pontas de lança douradas
 * - A torre e edifício da Central com relógios Art Déco e detalhes arquitetônicos
 * - Tipografia Central Espetinhos com gradientes metálicos
 */
export const BrandLogoSvg: React.FC<{
  variant?: 'mark' | 'full' | 'horizontal'
  className?: string
}> = ({ variant = 'full', className = 'w-12 h-12' }) => {
  const isMarkOnly = variant === 'mark'
  const isHorizontal = variant === 'horizontal'

  const viewBox = isMarkOnly ? '0 0 400 400' : isHorizontal ? '0 0 600 160' : '0 0 400 460'

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Central Espetinhos Logo"
    >
      <defs>
        {/* Gradiente Dourado Principal */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE58F" />
          <stop offset="25%" stopColor="#F5C542" />
          <stop offset="60%" stopColor="#C99414" />
          <stop offset="100%" stopColor="#8C6207" />
        </linearGradient>

        <linearGradient id="goldGradLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF1B8" />
          <stop offset="40%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        <linearGradient id="goldGradAccent" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8D6" />
          <stop offset="50%" stopColor="#E6B422" />
          <stop offset="100%" stopColor="#7A5200" />
        </linearGradient>

        {/* Gradiente Madeira dos Espetos */}
        <linearGradient id="woodGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6E4720" />
          <stop offset="50%" stopColor="#B37A3E" />
          <stop offset="100%" stopColor="#E0AC69" />
        </linearGradient>
        <linearGradient id="woodGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0AC69" />
          <stop offset="50%" stopColor="#B37A3E" />
          <stop offset="100%" stopColor="#6E4720" />
        </linearGradient>

        {/* Gradiente Carne Vermelho-Acarajé */}
        <radialGradient id="meatGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#D94334" />
          <stop offset="45%" stopColor="#A6281E" />
          <stop offset="85%" stopColor="#70150E" />
          <stop offset="100%" stopColor="#4A0B06" />
        </radialGradient>

        {/* Gradiente Edifício Art Déco */}
        <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F7F3EB" />
          <stop offset="70%" stopColor="#EBE4D5" />
          <stop offset="100%" stopColor="#DDD2BD" />
        </linearGradient>

        <linearGradient id="buildingShade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E5DC Flora" />
          <stop offset="100%" stopColor="#CBC0A9" />
        </linearGradient>

        {/* Gradiente Wordmark Preto Relevo */}
        <linearGradient id="charcoalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="50%" stopColor="#1C1C1C" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>

        {/* Efeito de Sombra */}
        <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {isHorizontal ? (
        // Variante horizontal: emblema na esquerda, texto na direita
        <g>
          <g transform="translate(10, -5) scale(0.38)">
            {/* Emblema completo escalado */}
            <EmblemGroup />
          </g>
          {/* Texto ao lado */}
          <g transform="translate(170, 75)">
            <text
              x="0"
              y="0"
              fill="#1A1A1A"
              fontSize="44"
              fontWeight="900"
              letterSpacing="6"
              fontFamily="'Cinzel', 'Georgia', serif"
            >
              CENTRAL
            </text>
            <text
              x="2"
              y="38"
              fill="url(#goldGrad)"
              fontSize="34"
              fontWeight="800"
              letterSpacing="5"
              fontFamily="'Cinzel', 'Georgia', serif"
              stroke="#8C6207"
              strokeWidth="0.8"
            >
              ESPETINHOS
            </text>
          </g>
        </g>
      ) : (
        // Variante normal vertical (mark ou full)
        <g>
          {/* Emblema no topo */}
          <EmblemGroup />

          {/* Wordmark (se full) */}
          {!isMarkOnly && (
            <g transform="translate(200, 395)" textAnchor="middle">
              {/* CENTRAL com acabamento escuro sofisticado */}
              <text
                x="0"
                y="0"
                fill="url(#charcoalGrad)"
                fontSize="42"
                fontWeight="900"
                letterSpacing="7"
                fontFamily="'Cinzel', 'Times New Roman', serif"
                stroke="#333333"
                strokeWidth="0.6"
              >
                CENTRAL
              </text>
              {/* Brilho superior em CENTRAL */}
              <text
                x="0"
                y="-1"
                fill="none"
                stroke="#666666"
                strokeWidth="0.5"
                fontSize="42"
                fontWeight="900"
                letterSpacing="7"
                fontFamily="'Cinzel', 'Times New Roman', serif"
              >
                CENTRAL
              </text>

              {/* ESPETINHOS em dourado com contorno fino */}
              <text
                x="0"
                y="42"
                fill="url(#goldGrad)"
                fontSize="38"
                fontWeight="800"
                letterSpacing="5"
                fontFamily="'Cinzel', 'Georgia', serif"
                stroke="#8C6207"
                strokeWidth="1.2"
                filter="url(#glowGold)"
              >
                ESPETINHOS
              </text>
              <text
                x="0"
                y="42"
                fill="url(#goldGradLight)"
                fontSize="38"
                fontWeight="800"
                letterSpacing="5"
                fontFamily="'Cinzel', 'Georgia', serif"
              >
                ESPETINHOS
              </text>
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

/** Subgrupo com o emblema (C dourado, espetos cruzados, carne e edifício com torre) */
function EmblemGroup() {
  return (
    <g id="emblem">
      {/* 1. O Grande "C" crescente dourado ao fundo */}
      <g id="golden-c-crescent">
        {/* Arco do C voltado para a direita */}
        <path
          d="M 215 35
             C 125 35 60 105 60 200
             C 60 295 125 365 215 365
             C 275 365 315 330 330 305
             C 285 330 235 340 190 325
             C 125 305 95 245 95 200
             C 95 155 125 95 190 75
             C 235 60 285 70 330 95
             C 315 70 275 35 215 35 Z"
          fill="url(#goldGrad)"
          stroke="#7A5200"
          strokeWidth="3"
        />
        {/* Brilho interno do crescente */}
        <path
          d="M 205 50
             C 140 52 85 115 85 200
             C 85 285 140 348 205 350
             C 160 330 115 270 115 200
             C 115 130 160 70 205 50 Z"
          fill="url(#goldGradLight)"
          opacity="0.75"
        />
      </g>

      {/* 2. Dois espetos de madeira cruzados em X com pontas metálicas e cubos de carne */}
      <g id="skewers-cross">
        {/* Espeto 1: Diagonal Noroeste -> Sudeste */}
        <g id="skewer-left-to-right">
          {/* Haste de madeira */}
          <line
            x1="55"
            y1="55"
            x2="335"
            y2="335"
            stroke="url(#woodGrad1)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <line
            x1="55"
            y1="55"
            x2="335"
            y2="335"
            stroke="#4A2E10"
            strokeWidth="11"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Ponta metálica dourada afiada (topo-esquerdo) */}
          <polygon
            points="55,55 35,35 60,40"
            fill="url(#goldGrad)"
            stroke="#6B4500"
            strokeWidth="1.5"
          />
          <polygon
            points="55,55 35,35 40,60"
            fill="url(#goldGradLight)"
            stroke="#6B4500"
            strokeWidth="1.5"
          />

          {/* Cubos de carne no espeto 1 */}
          <MeatCube x={95} y={95} rotation={-45} />
          <MeatCube x={130} y={130} rotation={-45} />
          <MeatCube x={165} y={165} rotation={-45} />
        </g>

        {/* Espeto 2: Diagonal Nordeste -> Sudoeste */}
        <g id="skewer-right-to-left">
          {/* Haste de madeira */}
          <line
            x1="345"
            y1="55"
            x2="65"
            y2="335"
            stroke="url(#woodGrad2)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <line
            x1="345"
            y1="55"
            x2="65"
            y2="335"
            stroke="#4A2E10"
            strokeWidth="11"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Ponta metálica dourada afiada (topo-direito) */}
          <polygon
            points="345,55 365,35 340,40"
            fill="url(#goldGrad)"
            stroke="#6B4500"
            strokeWidth="1.5"
          />
          <polygon
            points="345,55 365,35 360,60"
            fill="url(#goldGradLight)"
            stroke="#6B4500"
            strokeWidth="1.5"
          />

          {/* Cubos de carne no espeto 2 */}
          <MeatCube x={305} y={95} rotation={45} />
          <MeatCube x={270} y={130} rotation={45} />
          <MeatCube x={235} y={165} rotation={45} />
        </g>
      </g>

      {/* 3. Prédio / Torre de Relógio Art Déco (Central do Brasil) centralizado na frente */}
      <g id="central-building" filter="url(#dropShadow)">
        {/* Base mais larga (prédio inferior) */}
        <rect
          x="125"
          y="280"
          width="150"
          height="65"
          fill="url(#buildingGrad)"
          stroke="#1F1F1F"
          strokeWidth="3.5"
          rx="2"
        />
        {/* Cornija decorativa da base */}
        <rect
          x="120"
          y="276"
          width="160"
          height="6"
          fill="#ECE4D6"
          stroke="#1F1F1F"
          strokeWidth="2.5"
        />

        {/* Janelas da base (grade escura Art Déco) */}
        <g id="base-windows">
          {/* Lado esquerdo */}
          <rect
            x="135"
            y="292"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <line x1="141" y1="292" x2="141" y2="307" stroke="#ECE4D6" strokeWidth="1" />
          <line x1="135" y1="299" x2="147" y2="299" stroke="#ECE4D6" strokeWidth="1" />

          <rect
            x="153"
            y="292"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <line x1="159" y1="292" x2="159" y2="307" stroke="#ECE4D6" strokeWidth="1" />
          <line x1="153" y1="299" x2="165" y2="299" stroke="#ECE4D6" strokeWidth="1" />

          {/* Lado direito */}
          <rect
            x="235"
            y="292"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <line x1="241" y1="292" x2="241" y2="307" stroke="#ECE4D6" strokeWidth="1" />
          <line x1="235" y1="299" x2="247" y2="299" stroke="#ECE4D6" strokeWidth="1" />

          <rect
            x="253"
            y="292"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <line x1="259" y1="292" x2="259" y2="307" stroke="#ECE4D6" strokeWidth="1" />
          <line x1="253" y1="299" x2="265" y2="299" stroke="#ECE4D6" strokeWidth="1" />

          {/* Janelas superiores da base */}
          <rect
            x="135"
            y="315"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <rect
            x="153"
            y="315"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <rect
            x="235"
            y="315"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
          <rect
            x="253"
            y="315"
            width="12"
            height="15"
            fill="#222"
            stroke="#1F1F1F"
            strokeWidth="1.5"
          />
        </g>

        {/* Portal de entrada principal / colunas centrais da base */}
        <g id="main-entrance">
          <rect
            x="180"
            y="290"
            width="40"
            height="55"
            fill="#E8DEC9"
            stroke="#1F1F1F"
            strokeWidth="2.5"
          />
          {/* Porta escura */}
          <rect
            x="190"
            y="308"
            width="20"
            height="37"
            fill="#1A1A1A"
            stroke="#1F1F1F"
            strokeWidth="2"
          />
          {/* Pilastras verticais da entrada */}
          <line x1="184" y1="290" x2="184" y2="345" stroke="#1F1F1F" strokeWidth="2" />
          <line x1="188" y1="290" x2="188" y2="345" stroke="#1F1F1F" strokeWidth="1.5" />
          <line x1="212" y1="290" x2="212" y2="345" stroke="#1F1F1F" strokeWidth="1.5" />
          <line x1="216" y1="290" x2="216" y2="345" stroke="#1F1F1F" strokeWidth="2" />
        </g>

        {/* Corpo principal da Torre Central alta */}
        <rect
          x="164"
          y="150"
          width="72"
          height="130"
          fill="url(#buildingGrad)"
          stroke="#1F1F1F"
          strokeWidth="3.5"
        />

        {/* Pilastras verticais e janelas da torre alta */}
        <g id="tower-shaft-windows">
          {/* 4 colunas verticais de janelas estreitas estilo Art Déco */}
          {[-20, -7, 7, 20].map((xOffset, idx) => (
            <g key={idx}>
              <line
                x1={200 + xOffset}
                y1={160}
                x2={200 + xOffset}
                y2={270}
                stroke="#1A1A1A"
                strokeWidth="4"
                strokeDasharray="4 3"
              />
            </g>
          ))}
          {/* Friso vertical central decorativo */}
          <line x1="200" y1="150" x2="200" y2="280" stroke="#DDD2BD" strokeWidth="1.5" />
        </g>

        {/* Seção dos Relógios da Torre */}
        <rect
          x="160"
          y="105"
          width="80"
          height="48"
          fill="url(#buildingGrad)"
          stroke="#1F1F1F"
          strokeWidth="3.5"
        />

        {/* Dois Mostradores de Relógio visíveis */}
        <g id="clocks">
          {/* Relógio esquerdo */}
          <circle cx="183" cy="129" r="14" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="2.5" />
          <circle cx="183" cy="129" r="1.5" fill="#1F1F1F" />
          {/* Ponteiros às ~10:10 */}
          <line
            x1="183"
            y1="129"
            x2="178"
            y2="123"
            stroke="#1F1F1F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="183"
            y1="129"
            x2="191"
            y2="125"
            stroke="#1F1F1F"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Marcadores de hora */}
          <circle cx="183" cy="118" r="0.8" fill="#1F1F1F" />
          <circle cx="183" cy="140" r="0.8" fill="#1F1F1F" />
          <circle cx="172" cy="129" r="0.8" fill="#1F1F1F" />
          <circle cx="194" cy="129" r="0.8" fill="#1F1F1F" />

          {/* Relógio direito */}
          <circle cx="217" cy="129" r="14" fill="#FFFFFF" stroke="#1F1F1F" strokeWidth="2.5" />
          <circle cx="217" cy="129" r="1.5" fill="#1F1F1F" />
          {/* Ponteiros às ~10:10 */}
          <line
            x1="217"
            y1="129"
            x2="212"
            y2="123"
            stroke="#1F1F1F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="217"
            y1="129"
            x2="225"
            y2="125"
            stroke="#1F1F1F"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Marcadores de hora */}
          <circle cx="217" cy="118" r="0.8" fill="#1F1F1F" />
          <circle cx="217" cy="140" r="0.8" fill="#1F1F1F" />
          <circle cx="206" cy="129" r="0.8" fill="#1F1F1F" />
          <circle cx="228" cy="129" r="0.8" fill="#1F1F1F" />
        </g>

        {/* Topo escalonado (Ziggurat Art Déco) */}
        <g id="stepped-crown">
          {/* Nível 1 */}
          <rect
            x="168"
            y="94"
            width="64"
            height="12"
            fill="#F7F3EB"
            stroke="#1F1F1F"
            strokeWidth="3"
          />
          {/* Nível 2 */}
          <rect
            x="176"
            y="84"
            width="48"
            height="11"
            fill="#EBE4D5"
            stroke="#1F1F1F"
            strokeWidth="2.5"
          />
          {/* Nível 3 */}
          <rect
            x="184"
            y="76"
            width="32"
            height="9"
            fill="#DDD2BD"
            stroke="#1F1F1F"
            strokeWidth="2"
          />
          {/* Pináculo / Antena central */}
          <line
            x1="200"
            y1="76"
            x2="200"
            y2="62"
            stroke="#1F1F1F"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="200" cy="62" r="2.5" fill="url(#goldGrad)" stroke="#1F1F1F" strokeWidth="1" />
        </g>
      </g>
    </g>
  )
}

/** Representação 3D de um cubo de carne grelhada suculenta */
function MeatCube({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Sombra de oclusão */}
      <rect
        x="-21"
        y="-21"
        width="42"
        height="42"
        rx="5"
        fill="#260402"
        opacity="0.4"
        transform="translate(2, 2)"
      />
      {/* Corpo principal do cubo de carne */}
      <rect
        x="-20"
        y="-20"
        width="40"
        height="40"
        rx="5"
        fill="url(#meatGrad)"
        stroke="#4A0B06"
        strokeWidth="2"
      />
      {/* Faceta chanfrada superior esquerda com brilho de suculência */}
      <path d="M -18 -18 L 14 -18 L -18 14 Z" fill="#FF6B5E" opacity="0.35" />
      {/* Marcas de grelha / textura da fibra muscular */}
      <line
        x1="-12"
        y1="-8"
        x2="10"
        y2="-8"
        stroke="#FFE7BA"
        strokeWidth="1.2"
        opacity="0.4"
        strokeLinecap="round"
      />
      <line
        x1="-8"
        y1="4"
        x2="12"
        y2="4"
        stroke="#FFE7BA"
        strokeWidth="1.2"
        opacity="0.3"
        strokeLinecap="round"
      />
      {/* Brilho dourado no vértice */}
      <circle cx="-10" cy="-10" r="2.5" fill="#FFF1B8" opacity="0.6" />
    </g>
  )
}
