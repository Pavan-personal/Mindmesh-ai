
import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  isInView: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 2, 
  isInView 
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration });
      return () => controls.stop();
    }
  }, [isInView, count, value, duration]);

  return (
    <motion.span className="animate-glitch-slow">
      {rounded}
    </motion.span>
  );
};

export default AnimatedCounter;
