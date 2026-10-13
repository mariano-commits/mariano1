import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  FPS,
  framesPortada,
  MAX_TITULARES_SUMARIO,
  SEG_APERTURA,
  SEG_POR_TITULAR,
  type EscenaVideo,
  type NoticieroProps,
} from './tipos';

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
  const portada = framesPortada(props);
  return (
    <AbsoluteFill style={{backgroundColor: C.fondo, fontFamily: FUENTE, color: C.texto}}>
      <Series>
        <Series.Sequence durationInFrames={Math.round(SEG_APERTURA * FPS)}>
          <Apertura {...props} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={portada - Math.round(SEG_APERTURA * FPS)}>
          <Sumario titulares={props.titulares.slice(0, MAX_TITULARES_SUMARIO)} />
        </Series.Sequence>
        {props.escenas.map((e, i) => (
          <Series.Sequence key={i} durationInFrames={Math.max(1, Math.round(e.duracionSeg * FPS))}>
            <Escena escena={e} />
          </Series.Sequence>
        ))}
      </Series>
      {/* Mosca y ticker solo sobre el programa, no sobre la portada. */}
      <Sequence from={portada} layout="none">
        <Mosca programa={props.programa} />
        <Ticker titulares={props.titulares} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Apertura: barras que barren la pantalla, entra la marca, la edición y la fecha. */
const Apertura: React.FC<NoticieroProps> = ({programa, fecha, edicion}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const barra = (retraso: number) =>
    interpolate(spring({frame: frame - retraso, fps, config: {damping: 20}}), [0, 1], [-2200, 0]);
  const marca = spring({frame: frame - 18, fps, config: {damping: 12}});
  const linea = spring({frame: frame - 30, fps, config: {damping: 18}});
  const datos = interpolate(frame, [42, 58], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const salida = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  const brillo = interpolate(frame, [0, durationInFrames], [-30, 130]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, ${C.fondo2}, ${C.fondo} 70%)`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: salida,
        overflow: 'hidden',
      }}
    >
      {[0, 4, 8].map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: [170, 880, 905][i],
            width: 2200,
            height: i === 1 ? 14 : 4,
            background: i === 1 ? C.acento : C.tenue,
            opacity: i === 1 ? 0.9 : 0.25,
            transform: `translateX(${i % 2 ? -barra(r) : barra(r)}px)`,
          }}
        />
      ))}
      <div style={{textAlign: 'center', transform: `scale(${0.6 + 0.4 * marca})`, opacity: marca}}>
        <div
          style={{
            fontSize: 190,
            fontWeight: 900,
            letterSpacing: -6,
            backgroundImage: `linear-gradient(100deg, #fff 0%, #fff ${brillo - 10}%, ${C.acento} ${brillo}%, #fff ${brillo + 10}%, #fff 100%)`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {programa.toUpperCase()}
        </div>
        <div style={{height: 10, width: 520 * linea, background: C.acento, margin: '10px auto 34px'}} />
        <div style={{opacity: datos, transform: `translateY(${(1 - datos) * 20}px)`}}>
          {edicion && (
            <div style={{fontSize: 46, fontWeight: 800, letterSpacing: 8, color: C.acento}}>{edicion.toUpperCase()}</div>
          )}
          <div style={{fontSize: 40, color: C.tenue, marginTop: 14}}>{fecha}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Sumario: "Hoy en el programa" y los titulares, uno por uno. */
const Sumario: React.FC<{titulares: string[]}> = ({titulares}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const porTitular = SEG_POR_TITULAR * fps;
  const actual = Math.min(titulares.length - 1, Math.floor(frame / porTitular));
  const local = frame - actual * porTitular;
  const entrada = spring({frame: local, fps, config: {damping: 16}});
  const entradaTitulo = spring({frame, fps, config: {damping: 16}});
  const salida = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.fondo2}, ${C.fondo})`,
        padding: '0 160px',
        justifyContent: 'center',
        opacity: salida,
      }}
    >
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: 6,
          color: C.acento,
          transform: `translateX(${(1 - entradaTitulo) * -200}px)`,
        }}
      >
        HOY EN EL PROGRAMA
      </div>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 40, marginTop: 40, minHeight: 260}}>
        <div style={{fontSize: 130, fontWeight: 900, color: C.acento, lineHeight: 1, opacity: entrada}}>
          {actual + 1}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.15,
            opacity: entrada,
            transform: `translateY(${(1 - entrada) * 40}px)`,
          }}
        >
          {titulares[actual]}
        </div>
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 50}}>
        {titulares.map((_, i) => (
          <div
            key={i}
            style={{height: 8, width: 90, background: i <= actual ? C.acento : 'rgba(255,255,255,0.2)'}}
          />
        ))}
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
