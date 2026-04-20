import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface Props {
  icon: string;
  text: string;
  frameAppeared: number;
}

export const MilestoneToast: React.FC<Props> = ({icon, text, frameAppeared}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const age = frame - frameAppeared;
  const visibleFrames = fps * 3.5;

  const enter = spring({frame: age, fps, config: {damping: 14, stiffness: 150}});
  const exitProgress = interpolate(age, [visibleFrames - fps * 0.5, visibleFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opacity = interpolate(enter, [0, 1], [0, 1]) * (1 - exitProgress);
  const translateX = interpolate(enter, [0, 1], [60, 0]);

  if (age > visibleFrames) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        right: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #0f3460, #16213e)',
        border: '1px solid rgba(0,180,216,0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,180,216,0.1)',
        opacity,
        transform: `translateX(${translateX}px)`,
        maxWidth: 340,
        zIndex: 100,
      }}
    >
      <span style={{fontSize: 28}}>{icon}</span>
      <span style={{color: '#e2e8f0', fontSize: 15, fontFamily: 'sans-serif', fontWeight: 600, lineHeight: 1.3}}>
        {text}
      </span>
    </div>
  );
};
