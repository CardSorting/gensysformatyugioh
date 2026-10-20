'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface KonamiVideoShowcaseProps {
  tweetUrl?: string;
  videoSrc?: string;
  posterSrc?: string;
}

export function KonamiVideoShowcase({
  tweetUrl = 'https://x.com/YuGiOh_TCG/status/2112574773662220663/video/1',
  videoSrc = '/videos/kenneth_walker_genesys.mp4',
  posterSrc = '/images/kenneth_walker_genesys_thumb.jpg',
}: KonamiVideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(47.3);
  const [embedMode, setEmbedMode] = useState<'native' | 'twitter'>('native');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load Twitter widget if switched to twitter embed mode
  useEffect(() => {
    if (embedMode === 'twitter') {
      const win = window as unknown as { twttr?: { widgets?: { load: () => void } } };
      if (!win.twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        document.body.appendChild(script);
      } else {
        win.twttr.widgets?.load();
      }
    }
  }, [embedMode]);

  // Video time & duration updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {
        // Autoplay policy fallback
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyVideoLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(tweetUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      });
    }
  };

  const scrollToSandbox = (e: React.MouseEvent) => {
    e.preventDefault();
    const sandboxEl = document.getElementById('sandbox');
    if (sandboxEl) {
      const top = sandboxEl.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="spotlight-video"
      className="glass-panel"
      style={{
        padding: '24px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(11, 15, 23, 0.96) 0%, rgba(19, 25, 36, 0.92) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 240, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Glow Ambient */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Ticker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.675rem',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#fff',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
            KONAMI OFFICIAL SHOWCASE
          </span>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.675rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--color-gold-light)',
            }}
          >
            🏈 SUPER BOWL LX MVP KENNETH WALKER III
          </span>
        </div>

        {/* Mode Selector & External Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setEmbedMode('native')}
              style={{
                background: embedMode === 'native' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: embedMode === 'native' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              HD Player
            </button>
            <button
              onClick={() => setEmbedMode('twitter')}
              style={{
                background: embedMode === 'twitter' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: embedMode === 'twitter' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Post on X
            </button>
          </div>

          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.725rem', padding: '4px 10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
            title="Open video directly on X (Twitter)"
          >
            <span>Open on 𝕏</span>
            <span style={{ fontSize: '0.75rem' }}>↗</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Left = Video Player, Right = Context & High-Converting CTAs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 22,
          alignItems: 'center',
        }}
      >
        {/* Left Column: Video Embed Player */}
        <div style={{ width: '100%' }}>
          {embedMode === 'native' ? (
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#04060a',
                border: '2px solid rgba(0, 240, 255, 0.4)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 240, 255, 0.15)',
                aspectRatio: '16 / 9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  display: 'block',
                }}
              >
                <source src={videoSrc} type="video/mp4" />
                <source
                  src="https://video.twimg.com/ext_tw_video/2112574678678044673/pu/vid/avc1/1280x720/BqqqUVon98WweKBE.mp4?tag=12"
                  type="video/mp4"
                />
                Your browser does not support HTML5 video playback.
              </video>

              {/* Big Initial Play Button Overlay */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(7, 9, 14, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: hasStarted ? 'none' : 'blur(2px)',
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7, #00f0ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 28px rgba(0, 240, 255, 0.7), 0 4px 16px rgba(0,0,0,0.8)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#07090e" style={{ marginLeft: 3 }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#fff',
                      fontWeight: 800,
                      background: 'rgba(7, 9, 14, 0.85)',
                      padding: '4px 12px',
                      borderRadius: 16,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ▶ PLAY KONAMI HQ FEATURE (0:47)
                  </div>
                </div>
              )}

              {/* Top Video Overlay Ribbon */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    background: 'rgba(7, 9, 14, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  🎬 Konami Office Deck Lab
                </div>
                <div
                  style={{
                    background: 'rgba(7, 9, 14, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-cyan)',
                    fontWeight: 800,
                  }}
                >
                  1080p HD
                </div>
              </div>

              {/* Bottom Custom Playback Bar (Always Accessible) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(180deg, transparent 0%, rgba(7, 9, 14, 0.95) 100%)',
                  padding: '16px 12px 8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {/* Progress Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={duration || 47.3}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    height: 4,
                    accentColor: 'var(--color-cyan)',
                    cursor: 'pointer',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={togglePlay}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>

                    <button
                      onClick={toggleMute}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isMuted ? 'var(--color-red)' : '#fff',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={toggleFullscreen}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title="Fullscreen"
                    >
                      {isFullscreen ? '⤦' : '⛶'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Twitter / X Official Embed Box */
            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                background: 'rgba(7, 9, 14, 0.85)',
                border: '1px solid var(--border-medium)',
                padding: 16,
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <blockquote className="twitter-tweet" data-theme="dark" style={{ margin: '0 auto', maxWidth: '100%' }}>
                <p lang="en" dir="ltr">
                  SB LX MVP <a href="https://x.com/Kenneth_Walker9">@Kenneth_Walker9</a> dropped by the KONAMI office to get some help building his Yu-Gi-Oh! Genesys Deck! Did he make the right moves?{' '}
                  <a href="https://x.com/hashtag/YuGiOh">#YuGiOh</a> <a href="https://x.com/hashtag/YuGiOhTCG">#YuGiOhTCG</a>{' '}
                  <a href="https://x.com/hashtag/YGOGenesys">#YGOGenesys</a>{' '}
                  <a href="https://t.co/ie9kTiSY34">pic.twitter.com/ie9kTiSY34</a>
                </p>
                &mdash; Yu-Gi-Oh! TCG (@YuGiOh_TCG){' '}
                <a href="https://x.com/YuGiOh_TCG/status/2112574773662220663">October 20, 2026</a>
              </blockquote>
            </div>
          )}
        </div>

        {/* Right Column: Pedagogical Insights & World-Class CTA Suite */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.2rem, 2.4vw, 1.6rem)',
                color: '#fff',
                margin: 0,
                fontWeight: 900,
                letterSpacing: '-0.3px',
              }}
            >
              Kenneth Walker III Duels into Genesys
            </h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
            Konami welcomed Super Bowl LX MVP <strong>Kenneth Walker III</strong> to the official headquarters to construct his inaugural Yu-Gi-Oh! Genesys format deck. Watch how an elite competitor solves the 100-point budget dilemma and strategizes across the classic 5×5 field!
          </p>

          {/* 3 Core Deckbuilding Insights from the Konami Session */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>💎</span>
              <div>
                <div style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
                  100-Point Budget Allocation
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Balancing high-cost power spells like Pot of Sloth (10p) against zero-point engine extenders.
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>⚔️</span>
              <div>
                <div style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--color-gold-light)' }}>
                  Classic 5×5 Battlefield Strategy
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Zero Link arrows and no Pendulum scales ensure deliberate backrow and monster combat.
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🏈</span>
              <div>
                <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#34d399' }}>
                  The NFL MVP&apos;s Deck Choice
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  &ldquo;Did he make the right moves?&rdquo; Try crafting a competitive counter-build in our interactive sandbox!
                </div>
              </div>
            </div>
          </div>

          {/* High-Converting CTA Suite */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="#sandbox"
              onClick={scrollToSandbox}
              className="btn btn-primary"
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '10px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
              }}
            >
              <span>Build in 100-Pt Sandbox</span>
              <span>🎛️</span>
            </a>

            <Link
              href="/tournaments/ycs-houston-2026"
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '10px 16px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              <span>See YCS Houston Decks</span>
              <span>🏆</span>
            </Link>

            <button
              onClick={handleCopyVideoLink}
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '10px 14px',
                borderRadius: 8,
              }}
              title="Copy official X video link"
            >
              <span>{copiedLink ? '✓ Copied Link!' : '🔗 Share Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
