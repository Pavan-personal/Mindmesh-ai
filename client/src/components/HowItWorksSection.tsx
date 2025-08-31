
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const steps = [
    {
      number: "01",
      title: "Connect Wallet & Authenticate",
      description: "Connect your Web3 wallet (MetaMask/Rainbow) to access the platform and authenticate securely.",
      delay: "0s",
      icon: "🔐"
    },
    {
      number: "02",
      title: "AI Generates Quiz Content",
      description: "Upload PDFs or select topics. Our AI creates intelligent questions with multiple difficulty levels and question sets (A-G).",
      delay: "0.2s",
      icon: "🧠"
    },
    {
      number: "03",
      title: "Blockchain VRF Selection",
      description: "Verifiable Random Functions on Base Sepolia select fair question sets. Users pay gas fees for true randomness.",
      delay: "0.4s",
      icon: "⛓️"
    },
    {
      number: "04",
      title: "IPFS Storage & Results",
      description: "Quiz attempts stored on IPFS via Pinata. Get scores, analytics, and permanent decentralized records.",
      delay: "0.6s",
      icon: "🌐"
    }
  ];

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1]
      }
    }),
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)",
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const randomGridPosition = () => {
    const positions = [
      "col-start-1 row-start-1",
      "col-start-2 row-start-1",
      "col-start-3 row-start-1",
      "col-start-1 row-start-2",
      "col-start-2 row-start-2",
      "col-start-3 row-start-2"
    ];
    return positions[Math.floor(Math.random() * positions.length)];
  };

  return (
    <motion.section 
      id="how-it-works" 
      className="py-24 bg-black relative overflow-hidden"
      ref={sectionRef}
      style={{ opacity }}
    >
      <div className="absolute inset-0 noise-bg animate-noise"></div>
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-1/3 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          style={{ y: y1 }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          style={{ y: y2 }}
        ></motion.div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white font-space relative inline-block"
            whileHover={{ scale: 1.05 }}
          >
            Web3 <span className="text-stroke animate-glitch-slow">Quiz</span> Workflow
            <motion.div 
              className="absolute w-full h-1 bg-white bottom-0 left-0" 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            ></motion.div>
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Experience the complete blockchain-powered quiz creation and attempt process.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden group"
              variants={cardVariants}
              custom={index}
              whileHover="hover"
            >
              <motion.div 
                className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full opacity-0 group-hover:opacity-20 transform scale-0 group-hover:scale-100 transition-all duration-700"
                animate={isVisible ? { scale: [0, 1.2, 1], opacity: [0, 0.2, 0.1] } : {}}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              ></motion.div>
              
              <motion.div 
                className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative border border-white/20"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white font-mono font-bold">{step.number}</span>
                <motion.span 
                  className="absolute text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >{step.icon}</motion.span>
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-stroke transition-all duration-300">{step.title}</h3>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-300">{step.description}</p>
              
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 w-8"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="h-8 w-8 text-white" />
                </motion.div>
              )}
              
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-white w-0 group-hover:w-full transition-all duration-700 ease-in-out"
                whileInView={{ width: "100%" }}
                transition={{ delay: 0.2 + index * 0.1, duration: 1 }}
              />
              
              <motion.div 
                className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/5 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  delay: index * 0.5,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-white overflow-hidden relative"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          whileHover={{ boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            {[...Array(10)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white/5 backdrop-blur-sm"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ 
                  x: [0, Math.random() * 50 - 25, 0],
                  y: [0, Math.random() * 50 - 25, 0],
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: Math.random() * 10 + 10,
                  delay: Math.random() * 5
                }}
              ></motion.div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row items-center relative z-10">
            <div className="mb-6 md:mb-0 md:mr-8 flex-1">
              <div className="flex items-center mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3
                  }}
                >
                  <Sparkles className="h-6 w-6 mr-2 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold">Experience the AI Difference</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Our advanced AI doesn't just extract questions from text—it understands context, 
                creates thought-provoking questions, and ensures learning objectives are met.
              </p>
              <Button 
                variant="secondary" 
                className="bg-white text-black hover:bg-white/90 relative overflow-hidden group neo-brutalism"
              >
                <span className="relative z-10 group-hover:animate-glitch">Learn About Our Technology</span>
                <span className="absolute inset-0 w-full h-full bg-black/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
              </Button>
            </div>
            
            <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors duration-500 relative overflow-hidden group">
              <div className="text-sm text-gray-400 mb-2">Sample AI-Generated Question:</div>
              <motion.div 
                className="text-lg font-medium mb-4 relative"
                animate={{ 
                  x: [0, 0.5, -0.5, 0],
                  y: [0, 0.5, -0.5, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 5,
                  ease: "linear"
                }}
              >
                "Based on Einstein's Theory of Relativity, explain how time dilation affects space travel near the speed of light."
                <motion.div 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                  animate={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </motion.div>
              <div className="flex items-center text-gray-400 text-sm">
                <div className="mr-4">
                  <span className="font-semibold">Difficulty:</span> Advanced
                </div>
                <div>
                  <span className="font-semibold">Type:</span> Open-ended
                </div>
              </div>
              
              <motion.div 
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "linear"
                }}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/20 opacity-75"></span>
                <span className="text-xs">AI</span>
              </motion.div>
              
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="absolute w-full h-full"
                  animate={{ opacity: [0.02, 0.05, 0.02] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23FFFFFF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: "cover"
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorksSection;
