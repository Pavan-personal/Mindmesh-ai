import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Brain, 
  Shield, 
  Database, 
  Globe, 
  Zap, 
  Lock,
  Network,
  Cpu,
  Cloud,
  Key
} from "lucide-react";

const TechStackSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

  const technologies = [
    {
      icon: <Brain className="h-12 w-12 text-purple-400" />,
      title: "AI-Powered Generation",
      description: "Advanced language models (Gemini) create intelligent, context-aware quiz questions from any content source.",
      category: "AI/ML"
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-400" />,
      title: "Blockchain VRF",
      description: "Verifiable Random Functions on Base Sepolia ensure cryptographically secure and fair quiz set selection.",
      category: "Blockchain"
    },
    {
      icon: <Database className="h-12 w-12 text-green-400" />,
      title: "IPFS Storage",
      description: "Decentralized storage via Pinata IPFS for permanent, censorship-resistant quiz attempt records.",
      category: "Storage"
    },
    {
      icon: <Lock className="h-12 w-12 text-red-400" />,
      title: "Advanced Encryption",
      description: "Blocklock + AES-256-GCM encryption ensures data security and prevents answer exposure.",
      category: "Security"
    },
    {
      icon: <Network className="h-12 w-12 text-yellow-400" />,
      title: "Web3 Integration",
      description: "Seamless wallet connection, transaction management, and blockchain-based authentication.",
      category: "Web3"
    },
    {
      icon: <Zap className="h-12 w-12 text-orange-400" />,
      title: "Smart Fallbacks",
      description: "Robust fallback systems ensure quiz availability even if blockchain systems fail.",
      category: "Reliability"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.section 
      id="tech-stack" 
      className="py-24 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden"
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6 font-space"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Cutting-Edge <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Technology Stack</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Built with the latest Web3 technologies, AI advancements, and decentralized infrastructure
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-hidden group hover:border-white/20 transition-all duration-300"
              variants={itemVariants}
              whileHover="hover"
            >
              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-medium bg-white/10 text-white/70 rounded-full border border-white/20">
                  {tech.category}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {tech.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                {tech.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {tech.description}
              </p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div
            className="inline-block p-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl border border-white/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-8 py-4 bg-black/50 rounded-xl backdrop-blur-sm">
              <p className="text-white text-lg font-medium">
                Ready to experience the future of education?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold">
                  Connect your wallet and start creating!
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TechStackSection;
