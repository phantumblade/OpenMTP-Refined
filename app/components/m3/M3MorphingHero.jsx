import React, { useEffect, useRef } from 'react';
import { Morph, toPathD } from 'shape-morph';
import {
  INDETERMINATE_SHAPES,
  MORPH_INTERVAL_MS,
  cubicsBoundsCenter,
  frameAt,
  getMorphSequence,
  springValue,
} from './M3LoadingIndicator';

// A Material 3 shape holding an icon that turns into the loading indicator
// and back. The idle shape is one of the indicator's own shapes, so loading
// starts by morphing straight out of it (shrinking to the indicator's active
// size); when loading ends the current morph completes and the shape morphs
// back into the idle one, rotation snapped to its symmetry, before the icon
// fades in again. No element is swapped, so nothing jumps.

const EXIT_DURATION_MS = 900;
// the indicator's spring is within 1% of its target 540ms into a morph
const MORPH_LANDED_MS = 540;

export default function M3MorphingHero({
  loading = false,
  size = 104,
  shape = 'Cookie9Sided',
  // rotations that leave the idle shape unchanged (a 9-sided cookie: 40deg)
  symmetryDegrees = 40,
  color = 'var(--md-sys-color-primary-container)',
  loadingColor = 'var(--md-sys-color-primary)',
  className,
  children,
  'aria-label': ariaLabel,
}) {
  const pathRef = useRef(null);
  const iconRef = useRef(null);
  const loadingRef = useRef(loading);

  loadingRef.current = loading;

  useEffect(() => {
    const { polygons, morphs, scaleFactor } = getMorphSequence();
    const idleIndex = Math.max(0, INDETERMINATE_SHAPES.indexOf(shape));
    const idlePolygon = polygons[idleIndex];
    const exitMorphs = new Map();
    const center = size / 2;
    const idleScale = size;
    const activeScale = size * scaleFactor;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // start the indicator's timeline at the morph that leaves the idle shape
    const timelineOffset = idleIndex * MORPH_INTERVAL_MS;

    let mode = 'idle';
    let startedAt = 0;
    let rotationOffset = 0;
    let scale = idleScale;
    let rotation = 0;
    let exit = null;
    let frameId = null;

    const setIcon = (visible) => {
      const icon = iconRef.current;

      if (!icon) {
        return;
      }

      icon.style.transitionDelay = visible ? '120ms' : '0ms';
      icon.style.opacity = visible ? '1' : '0';
      icon.style.transform = visible ? 'scale(1)' : 'scale(0.6)';
    };

    const setFill = (isLoading) => {
      if (pathRef.current) {
        pathRef.current.style.fill = isLoading ? loadingColor : color;
      }
    };

    const draw = (cubics, drawScale, drawRotation) => {
      const path = pathRef.current;

      if (!path) {
        return;
      }

      const boundsCenter = cubicsBoundsCenter(cubics);

      path.setAttribute('d', toPathD(cubics, drawScale));
      path.setAttribute(
        'transform',
        `rotate(${drawRotation} ${center} ${center}) translate(${
          center - boundsCenter.x * drawScale
        } ${center - boundsCenter.y * drawScale})`
      );
    };

    const drawIdle = () => draw(morphs[idleIndex].asCubics(0), idleScale, 0);

    const startLoading = (now) => {
      mode = 'loading';
      startedAt = now;
      rotationOffset = -frameAt(timelineOffset, morphs.length, !reduceMotion)
        .rotation;
      setIcon(false);
      setFill(true);
    };

    const tick = (now) => {
      if (mode === 'idle' && loadingRef.current) {
        startLoading(now);
      }

      if (mode === 'loading') {
        const elapsed = Math.max(0, now - startedAt);
        const timeline = elapsed + timelineOffset;
        const frame = frameAt(timeline, morphs.length, !reduceMotion);
        // a morph has (visually) landed on its target shape
        const morphLanded = frame.inCycle >= MORPH_LANDED_MS;
        const justStarted = elapsed < MORPH_LANDED_MS / 10;

        scale =
          idleScale + (activeScale - idleScale) * springValue(elapsed / 1000);
        rotation = frame.rotation + rotationOffset;
        draw(
          morphs[frame.morphIndex].asCubics(frame.progress),
          scale,
          rotation
        );

        // leave only from a resting shape, so the way back starts from it
        if (!loadingRef.current && (morphLanded || justStarted)) {
          const fromIndex = justStarted
            ? frame.morphIndex
            : (frame.morphIndex + 1) % morphs.length;

          if (!exitMorphs.has(fromIndex)) {
            exitMorphs.set(
              fromIndex,
              new Morph(polygons[fromIndex], idlePolygon)
            );
          }

          exit = {
            morph: exitMorphs.get(fromIndex),
            startedAt: now,
            fromScale: scale,
            fromRotation: rotation,
            toRotation: symmetryDegrees * Math.ceil(rotation / symmetryDegrees),
          };
          mode = 'exiting';
          setIcon(true);
          setFill(false);
        }
      } else if (mode === 'exiting') {
        const elapsed = now - exit.startedAt;
        const progress = springValue(elapsed / 1000);

        draw(
          exit.morph.asCubics(Math.min(1, Math.max(0, progress))),
          exit.fromScale + (idleScale - exit.fromScale) * progress,
          exit.fromRotation + (exit.toRotation - exit.fromRotation) * progress
        );

        if (elapsed >= EXIT_DURATION_MS) {
          mode = 'idle';
          drawIdle();
        }
      }

      frameId = window.requestAnimationFrame(tick);
    };

    drawIdle();
    setFill(false);
    setIcon(true);
    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [size, shape, symmetryDegrees, color, loadingColor]);

  return (
    <span
      className={className}
      role={loading ? 'progressbar' : undefined}
      aria-label={loading ? ariaLabel : undefined}
      aria-busy={loading || undefined}
      style={{
        position: 'relative',
        display: 'inline-grid',
        placeItems: 'center',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <path ref={pathRef} style={{ transition: 'fill 300ms ease' }} />
      </svg>
      <span
        ref={iconRef}
        style={{
          position: 'relative',
          display: 'inline-flex',
          transition:
            'opacity 200ms ease, transform 350ms cubic-bezier(0.42, 1.67, 0.21, 0.9)',
        }}
      >
        {children}
      </span>
    </span>
  );
}
