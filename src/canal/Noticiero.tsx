import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {FPS, SEG_CORTINA, type EscenaVideo, type NoticieroProps} from './tipos';

const C = {
  fondo: '#0b1426',
  fondo2: '#16294d',
  acento: '#ffb23f',
  texto: '#ffffff',
  tenue: 'rgba(255,255,255,0.7)',
  barra: 'rgba(8,16,32,0.88)',
};
const FUENTE = "'Inter', 'Helvetica Neue', Arial, sans-serif";

export const Noticiero: React.FC<NoticieroProps> = (props) => {
  return (
    <AbsoluteFill style={{backgroundColor: C.fondo, fontFamily: FUENTE, color: C.texto}}>
      <Series>
        <Series.Sequence durationInFrames={SEG_CORTINA * FPS}>
          <Cortina {...props} />
        </Series.Sequence>
        {props.escenas.map((e, i) => (
          <Series.Sequence key={i} durationInFrames={Math.max(1, Math.round(e.duracionSeg * FPS))}>
            <Escena escena={e} />
          </Series.Sequence>
        ))}
      </Series>
      <Mosca programa={props.programa} />
      <Ticker titulares={props.titulares} />
    </AbsoluteFill>
  );
};

const Cortina: React.FC<NoticieroProps> = ({programa, titulo, fecha}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrada = spring({frame, fps, config: {damping: 14}});
  const salida = interpolate(frame, [SEG_CORTINA * fps - 12, SEG_CORTINA * fps], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, ${C.fondo2}, ${C.fondo})`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: salida,
      }}
    >
      <div style={{transform: `scale(${0.8 + 0.2 * entrada})`, textAlign: 'center'}}>
        <div style={{fontSize: 140, fontWeight: 900, letterSpacing: -4}}>
          {programa.toUpperCase()}
        </div>
        <div style={{height: 8, width: 360 * entrada, background: C.acento, margin: '24px auto'}} />
        <div style={{fontSize: 44, color: C.tenue}}>{fecha}</div>
        <div style={{fontSize: 52, marginTop: 40, maxWidth: 1400}}>{titulo}</div>
      </div>
    </AbsoluteFill>
  );
};

const Escena: React.FC<{escena: EscenaVideo}> = ({escena}) => {
  return (
    <AbsoluteFill>
      {escena.videoSrc ? (
        <OffthreadVideo src={staticFile(escena.videoSrc)} />
      ) : (
        <Borrador escena={escena} />
      )}
      <Zocalo escena={escena} />
    </AbsoluteFill>
  );
};

/** Escena sin avatar: tarjeta del personaje + texto, para revisar ritmo y contenido sin gastar en HeyGen. */
const Borrador: React.FC<{escena: EscenaVideo}> = ({escena}) => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const iniciales = escena.personaje.nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.fondo2}, ${C.fondo})`,
        padding: '120px 140px 320px',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 80,
        opacity: opacidad,
      }}
    >
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: C.acento,
          color: C.fondo,
          fontSize: 130,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {iniciales}
      </div>
      <div style={{fontSize: 46, lineHeight: 1.35}}>{escena.texto}</div>
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          fontSize: 24,
          padding: '6px 14px',
          border: `2px dashed ${C.tenue}`,
          color: C.tenue,
        }}
      >
        BORRADOR · sin avatar
      </div>
    </AbsoluteFill>
  );
};

const Zocalo: React.FC<{escena: EscenaVideo}> = ({escena}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = interpolate(spring({frame: frame - 6, fps, config: {damping: 16}}), [0, 1], [-1200, 0]);
  return (
    <div style={{position: 'absolute', left: 80, bottom: 150, transform: `translateX(${x}px)`}}>
      <div style={{display: 'inline-block', background: C.acento, color: C.fondo, padding: '8px 22px', fontSize: 28, fontWeight: 800}}>
        {escena.personaje.nombre} · {escena.personaje.rol}
      </div>
      <div style={{background: C.barra, padding: '18px 26px', fontSize: 44, fontWeight: 700, maxWidth: 1500}}>
        {escena.zocalo}
      </div>
      {escena.fuentes.length > 0 && (
        <div style={{background: C.barra, padding: '6px 26px 12px', fontSize: 24, color: C.tenue}}>
          Fuente: {escena.fuentes.join(' · ')}
        </div>
      )}
    </div>
  );
};

const Mosca: React.FC<{programa: string}> = ({programa}) => (
  <div style={{position: 'absolute', top: 40, right: 50, textAlign: 'right'}}>
    <div style={{fontSize: 34, fontWeight: 900, letterSpacing: 1}}>{programa.toUpperCase()}</div>
    <div style={{fontSize: 18, color: C.tenue}}>Contenido generado con IA · personajes ficticios</div>
  </div>
);

const Ticker: React.FC<{titulares: string[]}> = ({titulares}) => {
  const frame = useCurrentFrame();
  const texto = titulares.join('   •   ');
  const ancho = texto.length * 16 + 1920;
  const x = 1920 - ((frame * 4) % ancho);
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: C.barra,
        borderTop: `4px solid ${C.acento}`,
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', top: 16, left: x, whiteSpace: 'nowrap', fontSize: 30}}>{texto}</div>
    </div>
  );
};
