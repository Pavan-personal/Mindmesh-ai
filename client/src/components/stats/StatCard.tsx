
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  title: string;
  value: number;
  increase: string;
  variants: any;
  isInView: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, increase, variants, isInView }) => {
  return (
    <motion.div 
      variants={variants}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-l-4 border-white shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-white/5 backdrop-blur">
        <CardContent className="p-6">
          <div className="text-gray-400 mb-2">{title}</div>
          <div className="text-3xl font-bold text-white animate-glitch-slow">
            <AnimatedCounter value={value} isInView={isInView} />
            {title === "Average Completion Rate" ? "%" : ""}
          </div>
          <div className="text-white text-sm mt-2">{increase}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
