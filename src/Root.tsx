import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';
import {TravelDemo} from './TravelDemo';
import {TOTAL_SECONDS} from './TravelDemo/script';

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
