import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Chat} from './Chat';
import {JonPIP} from './JonPIP';
import {MilestoneToast} from './Milestone';
import {MILESTONES, SCRIPT, TOTAL_SECONDS, type Speaker} from './script';

const TYPING_LEAD = 1.5; // seconds before message appears to show typing indicator

export const TravelDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentTime = frame / fps;

  // Lines that have already appeared
  const visibleLines = SCRIPT
    .filter((l) => l.start <= currentTime)
    .map((l) => ({line: l, frameAppeared: Math.round(l.start * fps)}));

  // Currently speaking line
  const currentLine = SCRIPT.find((l) => currentTime >= l.start && currentTime < l.end) ?? null;
  const activeSpeaker: Speaker | null = currentLine?.speaker ?? null;

  // Next upcoming line (for typing indicator)
  const nextLine = SCRIPT.find((l) => l.start > currentTime && l.start - currentTime <= TYPING_LEAD) ?? null;

  // Active milestones
  const activeMilestones = MILESTONES.filter(
    (m) => currentTime >= m.time && currentTime <= m.time + 3.5
  );

  // Session break transition at 4:36 (276s)
  const sessionBreak = currentTime >= 274 && currentTime <= 278;
  const breakOpacity = sessionBreak
    ? interpolate(currentTime, [274, 275.5, 277, 278], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#0d1117', fontFamily: "'Inter', 'Helvetica Neue', sans-serif"}}>
      {/* Desktop gradient background */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0,102,204,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,180,216,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Browser window */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 360,
          right: 40,
          bottom: 40,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            height: 44,
            backgroundColor: '#1c1c1e',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 16,
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840'}} />
          <div
            style={{
              marginLeft: 12,
              flex: 1,
              maxWidth: 360,
              height: 26,
              backgroundColor: '#2c2c2e',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 10,
              gap: 6,
            }}
          >
            <span style={{color: '#888', fontSize: 12}}>🔒</span>
            <span style={{color: '#888', fontSize: 12, fontFamily: 'monospace'}}>sasha-3.replit.app</span>
          </div>
        </div>

        {/* Sasha website content */}
        <div style={{flex: 1, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          {/* Sasha header */}
          <div
            style={{
              height: 64,
              background: 'linear-gradient(135deg, #0f3460, #0066cc)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              gap: 14,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}
            >
              ✦
            </div>
            <div>
              <div style={{color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 0.5}}>Sasha</div>
              <div style={{color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5}}>
                <div style={{width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ade80'}} />
                AI Travel Concierge · Online 24/7
              </div>
            </div>
            <div style={{marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: 13}}>
              Luxurious Traveler
            </div>
          </div>

          {/* Chat messages area */}
          <Chat
            currentTime={currentTime}
            activeSpeaker={activeSpeaker}
            nextLine={nextLine}
            visibleLines={visibleLines}
          />

          {/* Input bar */}
          <div
            style={{
              height: 56,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 12,
              backgroundColor: '#f8fafc',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                flex: 1, height: 36, backgroundColor: '#fff',
                borderRadius: 20, border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', paddingLeft: 16,
              }}
            >
              <span style={{color: '#a0aec0', fontSize: 14}}>
                {activeSpeaker === 'Jon' ? 'Jon is typing...' : 'Message Sasha...'}
              </span>
            </div>
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0066cc, #00b4d8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}
            >
              ➤
            </div>
          </div>
        </div>
      </div>

      {/* Jon PIP */}
      <JonPIP activeSpeaker={activeSpeaker} />

      {/* Milestone toasts */}
      {activeMilestones.map((m) => (
        <MilestoneToast
          key={m.time}
          icon={m.icon}
          text={m.text}
          frameAppeared={Math.round(m.time * fps)}
        />
      ))}

      {/* Session break overlay */}
      {breakOpacity > 0 && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: `rgba(0,0,0,${breakOpacity * 0.85})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{textAlign: 'center'}}>
            <div style={{color: 'rgba(255,255,255,0.9)', fontSize: 32, fontWeight: 700, marginBottom: 8}}>
              A few days later...
            </div>
            <div style={{color: 'rgba(255,255,255,0.5)', fontSize: 18}}>Jon returns to Sasha</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
