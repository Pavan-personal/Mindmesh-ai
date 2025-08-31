import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GoogleLoginButton } from "./GoogleLoginButton";

const TryNowSection = () => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Text glitch effect when in view
  const glitchVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1],
      },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.section
      id="try-now"
      className="py-24 bg-black relative overflow-hidden"
      ref={sectionRef}
      style={{ opacity, scale }}
    >
      <div className="absolute inset-0 noise-bg animate-noise-slow"></div>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          variants={staggerChildren}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.span
            className="inline-block px-4 py-1 rounded-full border border-white/20 text-white text-sm font-medium mb-4 backdrop-blur-sm"
            variants={glitchVariants}
          >
            Try It Now
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4 font-space relative inline-block"
            variants={glitchVariants}
          >
            <span className="animate-glitch-slow">
              Experience the Power of AI Quiz Generation
            </span>
          </motion.h2>
          <motion.p className="text-xl text-gray-400" variants={glitchVariants}>
            Create a sample quiz and see how MindMesh can transform your
            assessment process.
          </motion.p>
        </motion.div>

        <motion.div
          className="glass-effect rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.1)] p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select a Topic
              </label>
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a topic..." />
                </SelectTrigger>
                <SelectContent className="bg-black border border-white/10 text-white">
                  <SelectItem value="science" className="focus:bg-white/10">
                    Science
                  </SelectItem>
                  <SelectItem value="history" className="focus:bg-white/10">
                    History
                  </SelectItem>
                  <SelectItem value="math" className="focus:bg-white/10">
                    Mathematics
                  </SelectItem>
                  <SelectItem value="literature" className="focus:bg-white/10">
                    Literature
                  </SelectItem>
                  <SelectItem value="technology" className="focus:bg-white/10">
                    Technology
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Or Enter Your Own Topic
              </label>
              <Input
                type="text"
                placeholder="E.g., Quantum Physics, World War II..."
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                className="flex-1 bg-white text-black hover:bg-white/90 py-6 neo-brutalism"
                size="lg"
              >
                Generate Sample Quiz
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400 mt-4">
              No sign-up required for sample quiz generation.
              <br />
              Limited to 5 questions in trial mode.
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4 animate-pulse-light">
            Ready to Create Full-Featured Quizzes?
          </h3>
          <p className="text-gray-400 mb-8">
            Sign up now to unlock unlimited questions, PDF uploads, and detailed
            analytics.
          </p>
          <GoogleLoginButton
            Element={({ onClick }) => (
              <Button
                onClick={onClick}
                className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg neo-brutalism group"
              >
                <span className="group-hover:animate-glitch">
                  Get Started Now
                </span>
                <ChevronRight className="ml-2 h-5 w-5 group-hover:animate-split" />
              </Button>
            )}
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TryNowSection;
