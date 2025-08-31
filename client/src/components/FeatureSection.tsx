
import { Award, BookOpen, CheckCircle, FileText, GraduationCap, Settings, Share2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const FeatureSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const [randomOffsets] = useState(() => 
    Array.from({ length: 6 }, () => ({
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10
    }))
  );

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-white" />,
      title: "PDF Upload",
      description: "Upload any PDF document and let AI extract the most important information to create relevant quiz questions."
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-white" />,
      title: "Topic Selection",
      description: "Choose from a wide range of topics and subtopics to create targeted quizzes for any subject area."
    },
    {
      icon: <Settings className="h-10 w-10 text-white" />,
      title: "Customizable",
      description: "Set difficulty levels, number of questions, question types, and create multiple quiz sets."
    },
    {
      icon: <Share2 className="h-10 w-10 text-white" />,
      title: "Easy Sharing",
      description: "Schedule exams and share a unique link with participants to take the quiz from anywhere."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-white" />,
      title: "AI Accuracy",
      description: "Our AI ensures questions are relevant, clear, and aligned with the learning objectives."
    },
    {
      icon: <Users className="h-10 w-10 text-white" />,
      title: "Admin Analytics",
      description: "Get detailed insights on participant performance, question difficulty, and engagement metrics."
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
      scale: 1.03,
      boxShadow: "0 4px 20px rgba(255, 255, 255, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const textReveal = {
    initial: { width: "0%" },
    animate: { width: "100%", transition: { duration: 1, ease: [0.77, 0, 0.18, 1] } }
  };

  return (
    <motion.section 
      id="features" 
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
            className="text-3xl md:text-4xl font-bold text-white font-space inline-block"
            whileHover={{ scale: 1.05 }}
          >
            Powerful Features for 
            <span className="relative ml-2">
              <span className="relative z-10 animate-pulse-light">Quiz Creation</span>
              <motion.span 
                className="absolute bottom-0 left-0 w-full h-1 bg-white"
                variants={textReveal}
                initial="initial"
                animate={isInView ? "animate" : "initial"}
              />
            </span>
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Everything you need to create, customize, and share professional quizzes without any technical skills.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover="hover"
              custom={index}
              initial={{ 
                x: randomOffsets[index % randomOffsets.length].x,
                y: randomOffsets[index % randomOffsets.length].y
              }}
              animate={{ x: 0, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all duration-300 h-full overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full">
                  <motion.div 
                    className="mb-4 relative"
                    whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                  >
                    <div className="absolute -inset-2 bg-white/5 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:animate-glitch-slow">{feature.title}</h3>
                  <p className="text-gray-400 flex-grow group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                  
                  <motion.div 
                    className="h-0.5 bg-white/20 w-0 mt-4 group-hover:w-full transition-all duration-700"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          whileHover={{ boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <Award className="h-12 w-12 mb-4 mx-auto md:mx-0 animate-pulse-light" />
              <h3 className="text-2xl font-bold mb-2 text-center md:text-left text-stroke-thin animate-glitch-slow">Premium AI Technology</h3>
              <p className="text-gray-400 max-w-xl text-center md:text-left">
                Powered by Gemini AI, our platform ensures high-quality questions that test knowledge and critical thinking skills.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div 
                className="bg-white/5 backdrop-blur rounded-lg px-6 py-4 border border-white/10 group"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <div className="text-2xl font-bold group-hover:animate-glitch">98%</div>
                <div className="text-gray-400 text-sm">Accuracy Rate</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 backdrop-blur rounded-lg px-6 py-4 border border-white/10 group"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <div className="text-2xl font-bold group-hover:animate-glitch">5x</div>
                <div className="text-gray-400 text-sm">Faster Creation</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 backdrop-blur rounded-lg px-6 py-4 border border-white/10 group"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <div className="text-2xl font-bold group-hover:animate-glitch">24/7</div>
                <div className="text-gray-400 text-sm">Availability</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeatureSection;
