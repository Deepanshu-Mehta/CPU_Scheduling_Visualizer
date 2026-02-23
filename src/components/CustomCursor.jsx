import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const cursorX = useSpring(-100, { stiffness: 400, damping: 28 });
  const cursorY = useSpring(-100, { stiffness: 400, damping: 28 });
  const dotX = useSpring(cursorX, { stiffness: 1000, damping: 40 });
  const dotY = useSpring(cursorY, { stiffness: 1000, damping: 40 });

  useEffect(() => {
    if (isTouch) {
      return;
    }

    const mouseMove = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const mouseDown = () => setClicked(true);
    const mouseUp = () => setClicked(false);

    const checkHover = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('hover-target')
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mousemove', checkHover);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mousemove', checkHover);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY, isTouch]);

  if (isTouch) {
    return null;
  }

  const variants = {
    default: {
      scale: 1,
      backgroundColor: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    hover: {
      scale: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
    },
    click: {
      scale: 0.8,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid transparent',
    }
  };

  return (
    <>
      <motion.div
        className="custom-cursor"
        variants={variants}
        animate={clicked ? 'click' : hovered ? 'hover' : 'default'}
        style={{ x: cursorX, y: cursorY }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      />
      <motion.div
        className="custom-cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: hovered ? 0 : 1,
          scale: clicked ? 0 : 1
        }}
      />
    </>
  );
}
