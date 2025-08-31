import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				mindmesh: {
					white: '#FFFFFF',
					'off-white': '#F5F5F5',
					'light-gray': '#AFAFAF',
					gray: '#555555',
					'dark-gray': '#222222',
					black: '#000000'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'pulse-light': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.8'
					}
				},
				'glitch': {
					'0%': {
						transform: 'translate(0)'
					},
					'20%': {
						transform: 'translate(-2px, 2px)'
					},
					'40%': {
						transform: 'translate(-2px, -2px)'
					},
					'60%': {
						transform: 'translate(2px, 2px)'
					},
					'80%': {
						transform: 'translate(2px, -2px)'
					},
					'100%': {
						transform: 'translate(0)'
					}
				},
				'distort': {
					'0%': {
						'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
					},
					'25%': {
						'clip-path': 'polygon(0% 5%, 100% 0%, 100% 95%, 0% 100%)'
					},
					'50%': {
						'clip-path': 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)'
					},
					'75%': {
						'clip-path': 'polygon(0% 0%, 100% 5%, 95% 100%, 5% 95%)'
					},
					'100%': {
						'clip-path': 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
					}
				},
				'text-reveal': {
					'0%': {
						width: '0%'
					},
					'100%': {
						width: '100%'
					}
				},
				'noise': {
					'0%, 100%': {
						transform: 'translate(0, 0)'
					},
					'10%': {
						transform: 'translate(-5%, -5%)'
					},
					'20%': {
						transform: 'translate(-10%, 5%)'
					},
					'30%': {
						transform: 'translate(5%, -10%)'
					},
					'40%': {
						transform: 'translate(-5%, 15%)'
					},
					'50%': {
						transform: 'translate(-10%, 5%)'
					},
					'60%': {
						transform: 'translate(15%, 0%)'
					},
					'70%': {
						transform: 'translate(0%, 10%)'
					},
					'80%': {
						transform: 'translate(-15%, 0%)'
					},
					'90%': {
						transform: 'translate(10%, 5%)'
					}
				},
				'split': {
					'0%': {
						transform: 'translateX(0)'
					},
					'30%': {
						transform: 'translateX(-10px)'
					},
					'60%': {
						transform: 'translateX(10px)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'scroll-down': {
					'0%': {
						transform: 'translateY(0)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(6px)',
						opacity: '0'
					}
				},
				'expand-underline': {
					'0%': {
						transform: 'scaleX(0)',
						opacity: '0'
					},
					'100%': {
						transform: 'scaleX(1)',
						opacity: '1'
					}
				},
				'spin-once': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'spin-slow': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'countUp': {
					'0%': {
						'counter-increment': 'count 0',
						content: 'counter(count)'
					},
					'100%': {
						'counter-increment': 'count var(--end-value)',
						content: 'counter(count)'
					}
				},
				'progress': {
					'0%': {
						width: '0%'
					},
					'100%': {
						width: 'var(--end-width)'
					}
				},
				'pulse-dot': {
					'0%': {
						transform: 'scale(0.95)',
						boxShadow: '0 0 0 0 rgba(52, 211, 153, 0.7)'
					},
					'70%': {
						transform: 'scale(1)',
						boxShadow: '0 0 0 10px rgba(52, 211, 153, 0)'
					},
					'100%': {
						transform: 'scale(0.95)',
						boxShadow: '0 0 0 0 rgba(52, 211, 153, 0)'
					}
				},
				'floating': {
					'0%, 100%': {
						transform: 'translate(0, 0) rotate(0deg)'
					},
					'25%': {
						transform: 'translate(10px, 10px) rotate(2deg)'
					},
					'50%': {
						transform: 'translate(-5px, 15px) rotate(-1deg)'
					},
					'75%': {
						transform: 'translate(-15px, 5px) rotate(-3deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'float': 'float 3s ease-in-out infinite',
				'glitch': 'glitch 0.5s cubic-bezier(.25,.46,.45,.94) both infinite',
				'glitch-slow': 'glitch 4s ease-in-out infinite',
				'glitch-hover': 'glitch 0.3s linear forwards',
				'text-reveal': 'text-reveal 1s cubic-bezier(0.77, 0, 0.18, 1) forwards',
				'distort': 'distort 5s ease-in-out infinite',
				'distort-slow': 'distort 8s ease-in-out infinite',
				'noise': 'noise 20s linear infinite',
				'noise-slow': 'noise 30s linear infinite',
				'split': 'split 1.5s ease-in-out infinite',
				'split-slow': 'split 3s ease-in-out infinite',
				'scroll-down': 'scroll-down 1.5s ease-in-out infinite',
				'expand-underline': 'expand-underline 1.5s ease-out forwards',
				'spin-once': 'spin-once 0.5s ease-out forwards',
				'spin-slow': 'spin-slow 10s linear infinite',
				'progress': 'progress 1.5s ease-out forwards',
				'pulse-dot': 'pulse-dot 2s infinite',
				'floating': 'floating 5s ease-in-out infinite',
			},
			fontFamily: {
				'space': ['Space Mono', 'monospace'],
				'mono': ['JetBrains Mono', 'monospace'],
				'sans': ['Inter', 'sans-serif']
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
