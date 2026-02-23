import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Smooth springs for cursor position
  const cursorX = useSpring(-100, { stiffness: 400, damping: 28 });
  const cursorY = useSpring(-100, { stiffness: 400, damping: 28 });

  useEffect(() => {
    // Determine if device has touch capability, if so, we probably don't want a custom cursor
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const mouseMove = (e) => {
      cursorX.set(e.clientX - 16); // Center the 32px cursor
      cursorY.set(e.clientY - 16);
    };

    const mouseDown = () => setClicked(true);
    const mouseUp = () => setClicked(false);

    // Check if hovering over interactive elements
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

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mousemove', checkHover);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
      document.body.style.cursor = 'auto'; // Restore on unmount
    };
  }, [cursorX, cursorY]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
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
        style={{
          x: cursorX,
          y: cursorY,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      />
      {/* Central dot */}
      <motion.div
        className="custom-cursor-dot"
        style={{
          x: useSpring(cursorX, { stiffness: 1000, damping: 40 }), // Dot follows faster
          y: useSpring(cursorY, { stiffness: 1000, damping: 40 }),
        }}
        animate={{
          opacity: hovered ? 0 : 1, // Hide dot when hovering to show just the ring
          scale: clicked ? 0 : 1
        }}
      />
    </>
  );
}
