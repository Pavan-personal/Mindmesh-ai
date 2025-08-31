
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CompletionRatesChart from "./stats/CompletionRatesChart";
import DifficultyDistributionChart from "./stats/DifficultyDistributionChart";
import PerformanceChart from "./stats/PerformanceChart";
import StatCard from "./stats/StatCard";

const StatsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  
  const staggerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  return (
    <motion.section 
      id="statistics" 
      className="py-24 bg-black relative overflow-hidden"
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 noise-bg animate-noise"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white font-space"
            whileHover={{ scale: 1.05 }}
          >
            Web3 <span className="animate-glitch-slow">Platform</span> Metrics
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Track blockchain transactions, IPFS storage, and AI-generated content performance.
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={staggerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <CompletionRatesChart variants={itemVariants} />
          <DifficultyDistributionChart variants={itemVariants} />
        </motion.div>
        
        <PerformanceChart variants={itemVariants} />
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8"
          variants={staggerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <StatCard 
            title="VRF Transactions" 
            value={2847} 
            increase="↑ 156% from last month" 
            variants={itemVariants} 
            isInView={isInView} 
          />
          
          <StatCard 
            title="IPFS Storage (GB)" 
            value={156} 
            increase="↑ 89% from last month" 
            variants={itemVariants} 
            isInView={isInView} 
          />
          
          <StatCard 
            title="Active Wallets" 
            value={892} 
            increase="↑ 34% from last month" 
            variants={itemVariants} 
            isInView={isInView} 
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default StatsSection;
