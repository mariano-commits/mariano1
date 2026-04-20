import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Speaker} from './script';

interface Props {
  activeSpeaker: Speaker | null;
}

export const JonPIP: React.FC<Props> = ({activeSpeaker}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isSpeaking = activeSpeaker === 'Jon';

  const pulse = spring({frame: frame % (fps * 1.2), fps, config: {damping: 200, stiffness: 80}});
  const glowOpacity = isSpeaking ? interpolate(pulse, [0, 1], [0.4, 0.9]) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 32,
        left: 40,
        width: 280,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 0 0 3px ${isSpeaking ? `rgba(0,180,216,${glowOpacity})` : 'rgba(255,255,255,0.15)'},
                    0 8px 32px rgba(0,0,0,0.5)`,
        transition: 'box-shadow 0.3s',
      }}
    >
      <Img
        src={staticFile('jon.jpg')}
        style={{width: '100%', height: 320, objectFit: 'cover', objectPosition: 'top', display: 'block'}}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32px 16px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {isSpeaking && (
          <div style={{display: 'flex', gap: 3, alignItems: 'flex-end', height: 14}}>
            {[0, 1, 2].map((i) => {
              const barH = interpolate(
                Math.sin((frame / fps) * 8 + i * 1.2),
                [-1, 1],
                [3, 14]
              );
              return (
                <div
                  key={i}
                  style={{width: 3, height: barH, backgroundColor: '#00b4d8', borderRadius: 2}}
                />
              );
            })}
          </div>
        )}
        <span style={{color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 1, fontFamily: 'sans-serif'}}>
          JON
        </span>
      </div>
    </div>
  );
};
