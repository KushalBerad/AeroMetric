import { motion } from "motion/react";

interface WeatherBackgroundProps {
  condition: string;
}

export default function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const cond = condition.toLowerCase();

  // Determine dynamic background core theme
  let gradientClass = "from-slate-950 via-zinc-900 to-slate-900"; // Default Dark SaaS Slate
  if (cond.includes("clear") || cond.includes("sun")) {
    gradientClass = "from-slate-950 via-amber-950/15 to-stone-900"; // Warm Sunset Amber Tone
  } else if (cond.includes("rain") || cond.includes("drizzle")) {
    gradientClass = "from-slate-950 via-cyan-950/20 to-slate-900"; // Cold Storm Cyan Tone
  } else if (cond.includes("snow")) {
    gradientClass = "from-slate-950 via-neutral-200/5 to-zinc-900"; // Cool Frosted Snow
  } else if (cond.includes("thunder")) {
    gradientClass = "from-slate-950 via-indigo-950/25 to-slate-950"; // Electric Indigo Dark
  }

  return (
    <div className={`fixed inset-0 -z-20 w-screen h-screen overflow-hidden bg-gradient-to-b ${gradientClass} transition-all duration-1000`}>
      {/* Absolute Ambient Fluid Blur Orbs */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 blur-[130px] animate-pulseGlow1" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] animate-pulseGlow2" />
      </div>

      {/* Conditionally Render Animated Weather Objects */}
      {/* 1. SUNNY/CLEAR STATE ANIMATIONS */}
      {(cond.includes("clear") || cond.includes("sunny")) && (
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[90px] pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-gradient-to-br from-amber-400/15 to-orange-500/5"
          />
        </div>
      )}

      {/* 2. CLOUDY STATE ANIMATIONS */}
      {cond.includes("cloud") && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100vw" }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-[15%] w-[450px] h-[180px] bg-gradient-to-r from-transparent via-slate-400/10 to-transparent blur-md rounded-full"
          />
          <motion.div
            initial={{ x: "-80%" }}
            animate={{ x: "100vw" }}
            transition={{ duration: 95, repeat: Infinity, ease: "linear", delay: 10 }}
            className="absolute top-[30%] w-[350px] h-[140px] bg-gradient-to-r from-transparent via-zinc-300/8 to-transparent blur-lg rounded-full"
          />
          <motion.div
            initial={{ x: "100vw" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute top-[8%] w-[500px] h-[200px] bg-gradient-to-r from-transparent via-slate-500/12 to-transparent blur-xl rounded-full"
          />
        </div>
      )}

      {/* 3. RAIN STATE ANIMATIONS */}
      {(cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          {Array.from({ length: 28 }).map((_, i) => {
            const left = Math.random() * 100;
            const duration = 0.8 + Math.random() * 0.7;
            const delay = Math.random() * 1.5;
            const height = 40 + Math.random() * 60;
            return (
              <motion.div
                key={i}
                initial={{ y: -100, x: left + "%" }}
                animate={{ y: "110vh" }}
                transition={{
                  duration,
                  delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-[1.5px] bg-gradient-to-b from-cyan-400/40 via-blue-200/60 to-transparent shadow-sm"
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
      )}

      {/* 4. SNOW STATE ANIMATIONS */}
      {cond.includes("snow") && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          {Array.from({ length: 35 }).map((_, i) => {
            const left = Math.random() * 100;
            const duration = 3.5 + Math.random() * 4;
            const size = 3 + Math.random() * 5;
            const delay = Math.random() * 5;
            return (
              <motion.div
                key={i}
                initial={{ y: -20, x: left + "%", opacity: 0 }}
                animate={{
                  y: "110vh",
                  x: [left + "%", `${left + (Math.random() * 10 - 5)}%`, `${left + (Math.random() * 6 - 3)}%`],
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{
                  duration,
                  delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                className="absolute rounded-full bg-white blur-[0.5px] shadow-inner"
              />
            );
          })}
        </div>
      )}

      {/* 5. INDIGO THUNDERSTORM FLICKER ANIMATIONS */}
      {cond.includes("thunder") && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Thundercloud Shadows */}
          <div className="absolute inset-0 bg-slate-950/20 mix-blend-overlay" />
          
          {/* Lightning Flash Overlay */}
          <motion.div
            animate={{
              opacity: [0, 0.05, 0, 0.9, 0, 0, 0.4, 0, 0, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            className="absolute inset-0 bg-purple-100 mix-blend-soft-light filter saturate-150"
          />

          {/* Random Rain Streak Intersections */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 15 }).map((_, i) => {
              const left = Math.random() * 100;
              const duration = 0.5 + Math.random() * 0.4;
              return (
                <motion.div
                  key={i}
                  initial={{ y: -100, x: left + "%" }}
                  animate={{ y: "110vh" }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute w-[2px] h-[80px] bg-gradient-to-b from-indigo-300 via-white to-transparent"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
