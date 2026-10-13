import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';
import {TravelDemo} from './TravelDemo';
import {TOTAL_SECONDS} from './TravelDemo/script';
import {Noticiero} from './canal/Noticiero';
import {duracionTotalFrames, FPS, type NoticieroProps} from './canal/tipos';

const noticieroDemo: NoticieroProps = {
  programa: 'Central IA',
  titulo: 'Vista previa',
  fecha: '',
  titulares: ['Titular de ejemplo'],
  escenas: [
    {
      tipo: 'apertura',
      personaje: {nombre: 'Inés Arce', rol: 'Presentadora'},
      texto: 'Buenas tardes. Esto es una vista previa de Central IA.',
      zocalo: 'Vista previa',
      fuentes: [],
      videoSrc: null,
      duracionSeg: 4,
    },
  ],
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="TravelDemo"
        component={TravelDemo}
        durationInFrames={TOTAL_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Noticiero"
        component={Noticiero}
        durationInFrames={duracionTotalFrames(noticieroDemo)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={noticieroDemo}
        calculateMetadata={({props}) => ({durationInFrames: duracionTotalFrames(props)})}
      />
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
