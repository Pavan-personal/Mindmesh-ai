import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import StatsSection from "@/components/StatsSection";
import TechStackSection from "@/components/TechStackSection";

import { useEffect } from "react";

const Banner = () => {
  // Add dark mode class to body on mount
  useEffect(() => {
    document.body.classList.add("dark");
    return () => {
      document.body.classList.remove("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-black font-space">
      <Navbar  />
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <TechStackSection />
      <StatsSection />

    </div>
  );
};

export default Banner;
