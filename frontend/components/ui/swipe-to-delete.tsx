'use client';

import { useRef, useState, ReactNode, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  threshold?: number;
}

export function SwipeToDelete({ children, onDelete, threshold = -100 }: SwipeToDeleteProps) {
  const [deleted, setDeleted] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [0, threshold], [0, 1]);
  const iconScale = useTransform(x, [0, threshold], [0.5, 1]);

  const handleDragEnd = useCallback(() => {
    if (x.get() <= threshold) {
      setDeleted(true);
      onDelete();
    }
  }, [x, threshold, onDelete]);

  if (deleted) return null;

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Red background revealed on swipe */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end bg-red-500 px-6"
        style={{ opacity: bgOpacity }}
      >
        <motion.div style={{ scale: iconScale }}>
          <Trash2 size={20} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: threshold * 1.5, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
