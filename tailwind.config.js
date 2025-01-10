/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./*.html",
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        switch: {
          bg: 'hsl(var(--switch-bg))',
          checked: 'hsl(var(--switch-checked-bg))',
          thumb: 'hsl(var(--switch-thumb))',
        }        
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scan": "scan 2s ease-in-out infinite",
        "glitch-1": "glitch-1 0.5s ease-in-out infinite",
        "glitch-2": "glitch-2 0.5s ease-in-out infinite",
        "piece-placed": "piece-placed 0.5s ease-out forwards",
        "piece-glow": "piece-glow 2s ease-in-out infinite",
        "piece-capture": "piece-capture 0.7s ease-in-out forwards",
        "piece-timer": "piece-timer var(--timer-duration) linear forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "content-appear": "content-appear 0.7s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "winner-glow": "winner-glow 2s ease-in-out infinite",
        "gradient-x": "gradient-x 4s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "scan": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "0% 100%" },
        },
        "glitch-1": {
          "0%, 100%": { transform: "translate(0)" },
          "33%": { transform: "translate(-5px, 2px)" },
          "66%": { transform: "translate(5px, -2px)" },
        },
        "glitch-2": {
          "0%, 100%": { transform: "translate(0)" },
          "33%": { transform: "translate(5px, -2px)" },
          "66%": { transform: "translate(-5px, 2px)" },
        },
        "piece-placed": {
          "0%": { 
            transform: "scale(1.2)",
            opacity: 0
          },
          "100%": { 
            transform: "scale(1)",
            opacity: 1
          }
        },
        "piece-glow": {
          "0%, 100%": { 
            filter: "brightness(1) drop-shadow(0 0 8px currentColor)"
          },
          "50%": { 
            filter: "brightness(1.2) drop-shadow(0 0 12px currentColor)"
          }
        },
        "piece-capture": {
          "0%": { 
            transform: "scale(1)",
            opacity: "1"
          },
          "50%": {
            transform: "scale(1.3) rotate(180deg)",
            opacity: "0.5"
          },
          "100%": {
            transform: "scale(1) rotate(360deg)",
            opacity: "1"
          }
        },
        "piece-timer": {
          "0%": {
            strokeDashoffset: "0"
          },
          "100%": {
            strokeDashoffset: "100"
          }
        },
        "fade-in": {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          }
        },
        "content-appear": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg) scale(1)"
          },
          "33%": {
            transform: "translateY(-10px) rotate(120deg) scale(1.1)"
          },
          "66%": {
            transform: "translateY(10px) rotate(240deg) scale(0.9)"
          }
        },
        "winner-glow": {
          "0%, 100%": {
            filter: "brightness(1) blur(0)",
            transform: "scale(1)"
          },
          "50%": {
            filter: "brightness(1.3) blur(3px)",
            transform: "scale(1.1)"
          }
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          }
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}