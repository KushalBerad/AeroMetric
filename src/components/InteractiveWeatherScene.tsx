import { motion } from "motion/react";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  CloudDrizzle,
  Wind
} from "lucide-react";

interface InteractiveWeatherSceneProps {
  condition: string;
}

export default function InteractiveWeatherScene({ condition }: InteractiveWeatherSceneProps) {
  const cond = condition.toLowerCase();

  // Primary animation scenarios
  if (cond.includes("clear") || cond.includes("sun")) {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center select-none" id="scene-clear">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-500/10 rounded-full filter blur-xl animate-pulse" />
        
        {/* Outer solar ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full border border-dashed border-amber-400/25"
        />

        {/* Inner solar flare ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full border border-dotted border-amber-500/40"
        />

        {/* Core animated Sun icon */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            filter: ["drop-shadow(0 0 10px rgba(245,158,11,0.2))", "drop-shadow(0 0 25px rgba(245,158,11,0.5))", "drop-shadow(0 0 10px rgba(245,158,11,0.2))"]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 bg-amber-500/10 p-5 rounded-full border border-amber-400/30 text-amber-400"
        >
          <Sun className="h-12 w-12 stroke-[1.8]" />
        </motion.div>
      </div>
    );
  }

  if (cond.includes("thunder") || cond.includes("storm")) {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center select-none" id="scene-thunder">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full filter blur-xl animate-pulse" />
        
        {/* Distant lightning spark */}
        <motion.div
          animate={{
            opacity: [0, 0.1, 0, 0.8, 0, 0.2, 0, 0, 0],
            scale: [0.9, 1.1, 0.9, 1.15, 1, 1.05, 1, 1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full"
        />

        {/* Rain particles */}
        <div className="absolute inset-x-6 bottom-4 top-20 overflow-hidden opacity-40">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: i * 20 }}
              animate={{ y: 80, x: i * 20 - 10 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear",
              }}
              className="w-[1.5px] h-5 bg-gradient-to-b from-indigo-300 to-transparent absolute"
            />
          ))}
        </div>

        {/* Main cloud & bolt */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 bg-slate-800/40 p-5 rounded-3xl border border-indigo-500/20 text-indigo-400 shadow-xl backdrop-blur-md"
        >
          <CloudLightning className="h-12 w-12 stroke-[1.5]" />
        </motion.div>
      </div>
    );
  }

  if (cond.includes("snow") || cond.includes("ice")) {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center select-none" id="scene-snow">
        <div className="absolute inset-0 bg-sky-400/5 rounded-full filter blur-xl animate-pulse" />
        
        {/* Floating snow crystal nodes */}
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 20, x: i * 20 - 45, opacity: 0 }}
            animate={{ 
              y: [20, 90], 
              x: [i * 20 - 45, i * 20 - 45 + (i % 2 === 0 ? 10 : -10)],
              opacity: [0, 0.7, 0] 
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 rounded-full bg-white/60 font-mono text-[9px]"
          >
            ❄️
          </motion.div>
        ))}

        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 bg-slate-900/40 p-5 rounded-3xl border border-sky-300/20 text-sky-200 shadow-xl backdrop-blur-md"
        >
          <CloudSnow className="h-12 w-12 stroke-[1.5] animate-pulse" />
        </motion.div>
      </div>
    );
  }

  if (cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle")) {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center select-none" id="scene-rain">
        <div className="absolute inset-0 bg-cyan-400/5 rounded-full filter blur-xl" />

        {/* Falling rain streaks */}
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 20, x: i * 16 - 45, opacity: 0 }}
            animate={{ y: 88, opacity: [0, 0.8, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "linear",
            }}
            className="absolute w-[1.5px] h-6 bg-gradient-to-b from-cyan-400 to-transparent"
          />
        ))}

        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 bg-slate-900/40 p-5 rounded-3xl border border-cyan-400/20 text-cyan-400 shadow-xl backdrop-blur-md"
        >
          <CloudRain className="h-12 w-12 stroke-[1.5] animate-bounce" style={{ animationDuration: "3s" }} />
        </motion.div>
      </div>
    );
  }

  // DEFAULT/CLOUDY SCENE
  return (
    <div className="relative w-40 h-40 flex items-center justify-center select-none" id="scene-clouds">
      <div className="absolute inset-0 bg-slate-400/10 rounded-full filter blur-xl" />
      
      {/* Moving background clouds */}
      <motion.div
        animate={{ x: [-8, 8, -8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-12 h-8 bg-white/5 rounded-full filter blur-[1px] top-12 left-10"
      />

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 bg-slate-900/30 p-5 rounded-3xl border border-white/10 text-slate-300 shadow-xl backdrop-blur-md"
      >
        <Cloud className="h-12 w-12 stroke-[1.5]" />
      </motion.div>
    </div>
  );
}
