import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GoogleLoginButton } from "./GoogleLoginButton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
    };

    // Initial animation on component mount
    setTimeout(() => setVisible(true), 100);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const navItems = ["Features", "How It Works", "Tech Stack", "Statistics"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out bg-black/80 backdrop-blur-md translate-y-0 opacity-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center"
            initial="hidden"
            animate="visible"
            variants={logoVariants}
          >
            <div className="relative overflow-hidden group">
              <GraduationCap className="h-8 w-8 text-white animate-glitch-slow" />
              <div className="absolute inset-0 bg-white/20 scale-0 rounded-full group-hover:scale-150 transition-all duration-500 ease-in-out"></div>
            </div>
            <span className="ml-2 text-xl font-bold text-white">
              <span className="text-stroke animation-distort-slow">Mind</span>
              <span
                className="relative overflow-hidden 
                before:content-[''] before:absolute before:w-full before:h-[2px] before:bg-white before:-bottom-0 
                before:left-0 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 
                hover:before:scale-x-100"
              >
                Mesh
              </span>
              <span className="text-white animate-pulse-light">QuizCraft</span>
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors relative overflow-hidden group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => {}}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <GoogleLoginButton
                Element={({ onClick }) => (
                  <Button
                    onClick={onClick}
                    variant="default"
                    className="bg-white text-black hover:bg-white/90 relative overflow-hidden group neo-brutalism"
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 w-full h-full bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                    <span className="absolute inset-0 w-full h-full bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                  </Button>
                )}
              />
            </motion.div>
          </div>

          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white transition-colors duration-300"
              whileTap={{ scale: 0.9 }}
              whileHover={{ rotate: 5 }}
            >
              {isMenuOpen ? (
                <X size={24} className="animate-split" />
              ) : (
                <Menu size={24} className="hover:animate-split" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-black/90 backdrop-blur-md border-t border-white/10 overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transform transition-all duration-300"
              custom={index}
              variants={menuItemVariants}
              initial="closed"
              animate={isMenuOpen ? "open" : "closed"}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </motion.a>
          ))}
          <motion.div
            className="pt-2"
            variants={menuItemVariants}
            custom={4}
            initial="closed"
            animate={isMenuOpen ? "open" : "closed"}
          >
            <GoogleLoginButton
              Element={({ onClick }) => (
                <Button
                  variant="default"
                  className="w-full bg-white text-black hover:bg-white/90 neo-brutalism"
                  onClick={() => {
                    onClick();
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              )}
            />
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
