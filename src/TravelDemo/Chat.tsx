import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ScriptLine, Speaker} from './script';

const SASHA_COLOR = '#f0f4f8';
const JON_COLOR = '#0066cc';
const MAX_VISIBLE = 5;

interface BubbleProps {
  line: ScriptLine;
  frameAppeared: number;
  index: number;
  total: number;
}

const Bubble: React.FC<BubbleProps> = ({line, frameAppeared, index, total}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isJon = line.speaker === 'Jon';

  const age = frame - frameAppeared;
  const slideUp = spring({frame: age, fps, config: {damping: 18, stiffness: 120, mass: 0.8}});
  const opacity = interpolate(slideUp, [0, 1], [0, 1]);
  const translateY = interpolate(slideUp, [0, 1], [20, 0]);

  // Fade old messages as they get pushed up
  const fadeFactor = total > MAX_VISIBLE ? interpolate(index, [0, 1], [0.3, 1], {extrapolateRight: 'clamp'}) : 1;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isJon ? 'flex-end' : 'flex-start',
        marginBottom: 10,
        opacity: opacity * fadeFactor,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {!isJon && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0066cc, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
            flexShrink: 0,
            fontSize: 16,
            marginTop: 4,
          }}
        >
          ✦
        </div>
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: '10px 14px',
          borderRadius: isJon ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isJon ? JON_COLOR : SASHA_COLOR,
          color: isJon ? '#fff' : '#1a202c',
          fontSize: 15,
          lineHeight: 1.5,
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  speaker: Speaker;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({speaker}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isJon = speaker === 'Jon';

  const dots = [0, 1, 2].map((i) =>
    interpolate(Math.sin((frame / fps) * 5 + i * 1.0), [-1, 1], [0.3, 1])
  );

  return (
    <div style={{display: 'flex', justifyContent: isJon ? 'flex-end' : 'flex-start', marginBottom: 10}}>
      {!isJon && (
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0066cc, #00b4d8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 10, flexShrink: 0, fontSize: 16, marginTop: 4,
          }}
        >
          ✦
        </div>
      )}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: isJon ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isJon ? JON_COLOR : SASHA_COLOR,
          display: 'flex', gap: 5, alignItems: 'center',
        }}
      >
        {dots.map((opacity, i) => (
          <div
            key={i}
            style={{width: 7, height: 7, borderRadius: '50%', backgroundColor: isJon ? 'rgba(255,255,255,0.8)' : '#4a5568', opacity}}
          />
        ))}
      </div>
    </div>
  );
};

interface ChatProps {
  currentTime: number;
  activeSpeaker: Speaker | null;
  nextLine: ScriptLine | null;
  visibleLines: {line: ScriptLine; frameAppeared: number}[];
}

export const Chat: React.FC<ChatProps> = ({activeSpeaker, nextLine, visibleLines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const startIdx = Math.max(0, visibleLines.length - MAX_VISIBLE);
  const toShow = visibleLines.slice(startIdx);

  // Show typing indicator 1.5s before a message appears
  const showTyping = nextLine !== null && activeSpeaker === null;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'hidden',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {toShow.map(({line, frameAppeared}, i) => (
        <Bubble
          key={line.id}
          line={line}
          frameAppeared={frameAppeared}
          index={i}
          total={toShow.length}
        />
      ))}
      {showTyping && nextLine && <TypingIndicator speaker={nextLine.speaker} />}
    </div>
  );
};
