import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { GoogleLoginButton } from "./GoogleLoginButton";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    // Setup the particle animation
    const createParticles = () => {
      const particleContainer = document.getElementById("particle-container");
      if (!particleContainer) return;

      particleContainer.innerHTML = "";

      const colors = ["#7E69AB", "#9b87f5", "#E5DEFF", "#D3E4FD"];

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        const size = Math.random() * 10 + 5;

        particle.className = "absolute rounded-full";
        particle.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = `${Math.random() * 0.5 + 0.1}`;
        particle.style.transform = `scale(${Math.random() * 0.8 + 0.2})`;

        // Add animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animation = `floating ${duration}s ease-in-out ${delay}s infinite, pulse ${Math.random() * 4 + 2
          }s ease-in-out ${delay}s infinite`;

        particleContainer.appendChild(particle);
      }
    };

    createParticles();
    window.addEventListener("resize", createParticles);

    return () => {
      window.removeEventListener("resize", createParticles);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-white pt-20 min-h-screen flex items-center">
      <div
        id="particle-container"
        className="absolute inset-0 z-0 overflow-hidden"
      ></div>

      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-0 right-0 w-1/2 h-1/2 bg-mindmesh-soft-purple rounded-bl-[100px] opacity-30 transition-all duration-1000 ease-out ${isLoaded ? "scale-100 rotate-0" : "scale-90 rotate-12"
            }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-1/3 h-1/3 bg-mindmesh-soft-blue rounded-tr-[70px] opacity-30 transition-all duration-1000 delay-300 ease-out ${isLoaded ? "scale-100 translate-x-0" : "scale-90 -translate-x-20"
            }`}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <span
                className={`inline-block px-4 py-1 rounded-full bg-mindmesh-soft-purple text-mindmesh-purple text-sm font-medium transform transition-all duration-1000 ease-out ${isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                  }`}
              >
                <span className="animate-pulse-light flex items-center">
                  <span className="h-2 w-2 rounded-full bg-mindmesh-purple mr-2 animate-ping opacity-75"></span>
                  AI + Blockchain + IPFS Quiz Platform
                </span>
              </span>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 font-poppins transition-all duration-1000 delay-200 ease-out ${isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                  }`}
              >
                Next-Gen{" "}
                <span className="text-mindmesh-purple relative inline-block">
                  Web3 Quizzes
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-mindmesh-purple transform origin-left scale-x-0 animate-expand-underline"></span>
                </span>{" "}
                with VRF & IPFS
              </h1>

              <p
                className={`text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 transition-all duration-1000 delay-400 ease-out ${isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                  }`}
              >
                AI-generated quizzes with blockchain-powered randomness (VRF), IPFS storage,
                and advanced encryption. Experience the future of decentralized education.
              </p>
            </div>

            <div
              className={`flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-1000 delay-600 ease-out ${isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }`}
            >
              <GoogleLoginButton
                Element={({ onClick }) => (
                  <Button
                    onClick={onClick}
                    className="bg-purple-300 hover:bg-purple-500 hover:text-white text-black px-8 py-6 text-lg rounded-lg group relative overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute bottom-0 left-0 w-full h-0 bg-mindmesh-dark-purple group-hover:h-full transition-all duration-300 ease-in-out"></span>
                    <ChevronRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                )}
              />

              <Button
                variant="outline"
                className="border-mindmesh-purple text-mindmesh-purple hover:bg-mindmesh-soft-purple px-8 py-6 text-lg rounded-lg relative overflow-hidden flex items-center gap-3 group"
                onClick={() => window.open('https://github.com/Pavan-personal/mindmesh-ai', '_blank')}
              >
                <span className="relative z-10">Star on</span>
                {/* <span className="absolute inset-0 w-full h-full bg-mindmesh-soft-purple transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span> */}
                <svg role="img" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              </Button>
            </div>

            <div
              className={`flex items-center justify-center lg:justify-start space-x-8 pt-4 transition-all duration-1000 delay-800 ease-out ${isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }`}
            >
              {[
                { number: "2.8K+", label: "VRF Transactions" },
                { number: "156GB", label: "IPFS Storage" },
                { number: "892+", label: "Active Wallets" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center lg:items-start"
                >
                  <span className="text-3xl font-bold text-mindmesh-purple relative">
                    <span
                      className="inline-block"
                      style={{
                        animationName: "countUp",
                        animationDuration: "2s",
                        animationTimingFunction: "ease-out",
                        animationFillMode: "forwards",
                        animationDelay: `${index * 0.2 + 1}s`,
                      }}
                    >
                      {stat.number}
                    </span>
                  </span>
                  <span className="text-sm text-gray-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`w-full lg:w-1/2 relative transition-all duration-1000 delay-500 ease-out ${isLoaded
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
              }`}
          >
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-mindmesh-soft-purple rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse-slow"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-mindmesh-soft-blue rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-mindmesh-light-purple rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob-delay"></div>
              <div className="relative animate-float">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-mindmesh-purple/40 to-transparent mix-blend-overlay z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=2670"
                    alt="AI Quiz Platform"
                    className="rounded-2xl w-full object-cover transform transition-transform hover:scale-105 duration-700 ease-in-out"
                  />
                </div>

                <div
                  className="absolute -right-10 -bottom-10 bg-white rounded-xl shadow-lg p-4 w-40 animate-fade-in"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="text-sm font-medium text-gray-800 flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2 pulse-dot"></span>
                    Quiz Success
                  </div>
                  <div className="text-xs text-gray-500">94% Completion</div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="w-0 h-full bg-green-500 rounded-full animate-progress"
                      style={{ "--end-width": "94%" } as React.CSSProperties}
                    ></div>
                  </div>
                </div>

                <div
                  className="absolute -left-10 top-1/2 bg-white rounded-xl shadow-lg p-4 animate-fade-in animate-float-card"
                  style={{ animationDelay: "0.7s" }}
                >
                  <div className="text-sm font-medium text-gray-800 flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-mindmesh-purple mr-2"></span>
                    AI Generated
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-mindmesh-purple"></div>
                    <div className="text-xs text-gray-500">20 questions</div>
                  </div>
                </div>

                <div
                  className="absolute -top-10 right-10 bg-white rounded-xl shadow-lg p-3 animate-fade-in animate-float-card-delay"
                  style={{ animationDelay: "0.9s" }}
                >
                  <div className="text-xs font-medium text-gray-800">
                    Time Saved
                  </div>
                  <div className="text-lg font-bold text-mindmesh-purple">
                    2.5 hrs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add a scroll down indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-gray-500 mb-2">Scroll Down</span>
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-scroll-down"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
