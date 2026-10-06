import React, { useEffect, useRef } from 'react';
import { ANGRY_FACE_FPS, ANGRY_FACE_FRAMES } from './angryFaceFrames';

// Animated angry face shown when the Mac can't see the phone: it squashes,
// snaps into a shout and shakes its head, then calms down (1.5s loop).
// Geometry is replayed from keyframes measured on the reference animation;
// colours come from `currentColor` so the caller applies the M3 role.

const OUTLINE = 5;
const EYE_STROKE = 4.4;
const MOUTH_STROKE = 5;
const BAR_WIDTH = 15;
const BAR_HEIGHT = 10;
const CHEVRON_HEIGHT = 14;
const CHEVRON_SQUASHED_HEIGHT = 11;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (edge0, edge1, v) => {
  const t = clamp01((v - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
};

// ">" for the left eye (direction 1) and "<" for the right one (-1).
const chevronPath = (cx, cy, width, height, direction) => {
  const halfW = width / 2 - EYE_STROKE / 2;
  const halfH = height / 2 - EYE_STROKE / 2;
  const back = cx - direction * halfW;
  const tip = cx + direction * halfW;

  return `M${back} ${cy - halfH}L${tip} ${cy}L${back} ${cy + halfH}`;
};

// Angry slanted bar: thick at the outer end, narrower and lower at the inner
// end (the one closer to the nose).
const barPath = (cx, cy, direction) => {
  const halfW = BAR_WIDTH / 2 - 1.6;
  const outer = cx - direction * halfW;
  const inner = cx + direction * halfW;
  const outerHalf = BAR_HEIGHT / 2 - 1.6;
  const innerHalf = BAR_HEIGHT * 0.17;
  const innerDrop = BAR_HEIGHT * 0.14;

  return `M${outer} ${cy - outerHalf}L${inner} ${
    cy - innerHalf + innerDrop
  }L${inner} ${cy + innerHalf + innerDrop}L${outer} ${cy + outerHalf}Z`;
};

// Dome-shaped open mouth; `frown` arches its flat base up into a pout.
const mouthPath = (cx, top, bottom, width, frown) => {
  const left = cx - width / 2 + MOUTH_STROKE / 2;
  const right = cx + width / 2 - MOUTH_STROKE / 2;
  const t = top + MOUTH_STROKE / 2;
  const b = bottom - MOUTH_STROKE / 2;
  const height = Math.max(0.5, b - t);
  const baseControl = b - frown * height * 0.8;

  return `M${left} ${b}A${
    (right - left) / 2
  } ${height} 0 0 1 ${right} ${b}Q${cx} ${baseControl} ${left} ${b}Z`;
};

const ANIMATION_MS = (ANGRY_FACE_FRAMES.length / ANGRY_FACE_FPS) * 1000;
// the face rests between two outbursts instead of looping back-to-back
const REST_BETWEEN_LOOPS_MS = 5000;

const frameAt = (elapsedMs) => {
  const inCycle = elapsedMs % (ANIMATION_MS + REST_BETWEEN_LOOPS_MS);

  if (inCycle >= ANIMATION_MS) {
    return ANGRY_FACE_FRAMES[0];
  }

  const position = (inCycle / 1000) * ANGRY_FACE_FPS;
  const index = Math.floor(position);
  const a = ANGRY_FACE_FRAMES[index];
  const b = ANGRY_FACE_FRAMES[(index + 1) % ANGRY_FACE_FRAMES.length];
  const t = position - index;

  return a.map((value, i) => lerp(value, b[i], t));
};

export default function AngryFaceAnimation({
  size = 48,
  className,
  style,
  'aria-label': ariaLabel,
}) {
  const refs = {
    face: useRef(null),
    leftChevron: useRef(null),
    rightChevron: useRef(null),
    leftBar: useRef(null),
    rightBar: useRef(null),
    mouth: useRef(null),
  };

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let frameId = null;

    const draw = (now) => {
      const [
        faceX,
        faceY,
        faceWidth,
        faceHeight,
        featuresX,
        eyeSpread,
        eyeY,
        eyeWidth,
        mouthTop,
        mouthBottom,
        mouthWidth,
        angryEyes,
        frown,
      ] = frameAt(reduceMotion ? 0 : Math.max(0, now - start));

      const face = refs.face.current;

      if (!face) {
        return;
      }

      face.setAttribute('cx', faceX);
      face.setAttribute('cy', faceY);
      face.setAttribute('rx', (faceWidth - OUTLINE) / 2);
      face.setAttribute('ry', (faceHeight - OUTLINE) / 2);

      const eyesX = faceX + featuresX;
      const eyesY = faceY + eyeY;
      const chevronHeight = lerp(
        CHEVRON_HEIGHT,
        CHEVRON_SQUASHED_HEIGHT,
        clamp01(angryEyes / 0.7)
      );
      const barOpacity = smoothstep(0.6, 0.85, angryEyes);

      refs.leftChevron.current.setAttribute(
        'd',
        chevronPath(eyesX - eyeSpread, eyesY, eyeWidth, chevronHeight, 1)
      );
      refs.rightChevron.current.setAttribute(
        'd',
        chevronPath(eyesX + eyeSpread, eyesY, eyeWidth, chevronHeight, -1)
      );
      refs.leftBar.current.setAttribute(
        'd',
        barPath(eyesX - eyeSpread, eyesY, 1)
      );
      refs.rightBar.current.setAttribute(
        'd',
        barPath(eyesX + eyeSpread, eyesY, -1)
      );
      [refs.leftChevron, refs.rightChevron].forEach((ref) =>
        ref.current.setAttribute('opacity', 1 - barOpacity)
      );
      [refs.leftBar, refs.rightBar].forEach((ref) =>
        ref.current.setAttribute('opacity', barOpacity)
      );

      refs.mouth.current.setAttribute(
        'd',
        mouthPath(
          eyesX,
          faceY + mouthTop,
          faceY + mouthBottom,
          mouthWidth,
          clamp01(frown)
        )
      );

      if (!reduceMotion) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    frameId = window.requestAnimationFrame(draw);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="-48 -49 96 96"
      className={className}
      style={{ display: 'block', flexShrink: 0, overflow: 'visible', ...style }}
    >
      <ellipse
        ref={refs.face}
        fill="none"
        stroke="currentColor"
        strokeWidth={OUTLINE}
      />
      {[refs.leftChevron, refs.rightChevron].map((ref, index) => (
        <path
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={ref}
          fill="none"
          stroke="currentColor"
          strokeWidth={EYE_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {[refs.leftBar, refs.rightBar].map((ref, index) => (
        <path
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={ref}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
      ))}
      <path
        ref={refs.mouth}
        fill="none"
        stroke="currentColor"
        strokeWidth={MOUTH_STROKE}
        strokeLinejoin="round"
      />
    </svg>
  );
}
