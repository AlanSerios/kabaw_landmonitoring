import { Globe, Leaf, Drop } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Image from "next/image";
import { t } from "@/lib/i18n";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const INTRO_MESSAGES = [
  "Welcome sa KABAW Space! Ako si Kuya Kabaw, ang digital na kalabaw na nagbabantay sa kalusugan ng sakahan mo gamit ang satellites.",
  "Uy, kumusta! Ako nga pala si Kuya Kabaw. Pindot ka lang sa map para ma-check natin 'yung sitwasyon ng sakahan mo.",
  "Hello boss! Kuya Kabaw reporting for duty. Ano, silipin na ba natin 'yung mga pananim mo? Pindot ka lang diyan sa mapa.",
  "Kumusta po! Ako si Kuya Kabaw. Tara, tignan natin ang lagay ng sakahan niyo ngayon gamit itong mapa."
];

const OPTIMAL_MESSAGES = [
  "Lupit! Ang ganda ng tubo ng mga tanim mo ngayon. Sakto lang 'yung tubig, chill ka muna.",
  "Aba, mukhang walang problema dito ah! Napaka-healthy ng mga pananim natin ngayon. Keep it up boss!",
  "Ang lusog ng mga tanim! Hindi mo na kailangan masyadong mag-alala sa patubig ngayon. Nice work!"
];

const WARNING_MESSAGES = [
  "Boss, medyo uhaw 'yung mga tanim natin ah. Kailangan na siguro natin magpadaloy ng tubig bago pa matuyo nang tuluyan.",
  "Medyo dry na 'yung lupa natin dito. Ingat tayo, baka magkulang sa tubig 'yung mga halaman. Paandarin na ba ang patubig?",
  "Naku, umiinit yata. Pansin ko medyo natutuyo ang lupa. Siguro oras na para diligin nang kaunti ang mga pananim natin."
];

const ERROR_MESSAGES = [
  "Naku po, parang walang masyadong tumutubo dito o kaya sobrang tuyo na ng lupa. Check natin mabuti baka kailangan na ng matinding aksyon.",
  "Hala, medyo critical tayo dito boss. Parang sobrang nipis ng mga tanim at tuyong-tuyo ang lupa. Baka kailangan nating ayusin 'yung irrigation natin.",
  "Teka lang, parang hindi maganda ang lagay ng mga tanim dito. Kailangan natin tutukan ito, baka kailangan na agad ng tubig at pataba."
];

const LOADING_MESSAGES = [
  "Wait lang boss, kinakausap ko pa yung satellite. Loading...",
  "Teka lang ha, sinisilip ko pa ng mabuti 'yang area na 'yan...",
  "Processing... konting tiis lang at malalaman din natin ang sagot."
];

const RANDOM_THOUGHTS = [
  "Hmm, magandang panahon para magtanim kung hindi masyadong mainit ngayon...",
  "Alam mo ba na ang kalabaw ay pawisan din? Pero kailangan pa rin namin ng putik pampalamig!",
  "Sana sapat ang ulan mamaya, para hindi na tayo maghirap sa patubig.",
  "Kung may problema sa tanim, wag mahihiyang pindutin ang mapa ha?",
  "Naisip ko lang, ang sarap siguro humiga sa damuhan ngayon.",
  "Check lang natin lagi yung kalusugan ng tanim para masaganang ani natin boss!"
];

const INTERACTIVE_MESSAGES = [
  "Aray! Nakikiliti ako d'yan!",
  "Moo! Laging handang tumulong si Kuya Kabaw.",
  "Kailangan mo ba ng payo tungkol sa ani?",
  "Basta agrikultura, sagot kita!",
  "Pindot ka lang sa mapa kung may gusto kang suriin."
];

const TypewriterText = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
      }}
      className="text-[10px] md:text-xs font-bold text-[#446e31] leading-snug tracking-tight text-center flex flex-wrap justify-center h-full items-center overflow-hidden"
    >
      <div>
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={{
              hidden: { opacity: 0, y: 5 },
              visible: { opacity: 1, y: 0 }
            }}
            className="inline-block mr-1"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

// Kuya Kabaw Mascot Component
function KuyaKabaw({ status, type, message, loading }: { status?: 'optimal' | 'warning' | 'error' | 'standby'; type?: 'intro' | 'result'; message?: string; loading?: boolean }) {
  const [displayedMessage, setDisplayedMessage] = useState("Welcome sa KABAW Space! Ako si Kuya Kabaw, ang digital na kalabaw na nagbabantay sa kalusugan ng sakahan mo gamit ang satellites.");

  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      return;
    }

    if (loading) {
      setDisplayedMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      return;
    }

    if (status && status !== 'standby') {
      let pool = INTRO_MESSAGES;
      if (status === 'optimal') pool = OPTIMAL_MESSAGES;
      else if (status === 'warning') pool = WARNING_MESSAGES;
      else if (status === 'error') pool = ERROR_MESSAGES;
      
      setDisplayedMessage(pool[Math.floor(Math.random() * pool.length)]);
      return;
    }

    // Default intro message on load
    if (type === 'intro' || status === 'standby') {
      setDisplayedMessage(INTRO_MESSAGES[Math.floor(Math.random() * INTRO_MESSAGES.length)]);
    }

    // Random thoughts interval when idle
    const timer = setInterval(() => {
      if (!loading && (!status || status === 'standby')) {
        if (Math.random() > 0.3) {
          setDisplayedMessage(RANDOM_THOUGHTS[Math.floor(Math.random() * RANDOM_THOUGHTS.length)]);
        }
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [status, type, message, loading]);

  const handleMascotClick = () => {
    setDisplayedMessage(INTERACTIVE_MESSAGES[Math.floor(Math.random() * INTERACTIVE_MESSAGES.length)]);
  };

  return (
    <div className="flex flex-row-reverse items-end justify-end gap-0 pb-0 w-full px-5 md:px-8">
      {/* Mascot Graphic */}
      <motion.div 
        initial={{ y: "40%", x: "0%", opacity: 0 }}
        animate={{ y: "25%", x: "-5%", opacity: 1 }}
        transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.8 }}
        className="w-32 h-32 md:w-64 md:h-64 shrink-0 relative z-[-1] drop-shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300 mb-[-2rem]"
        onClick={handleMascotClick}
      >
        <Image src="/uni_kuyawkabaw_mascot.svg" alt="Kuya Kabaw" fill className="object-contain object-bottom" />
      </motion.div>
      
      {/* SVG Bubble with Typewriter Text */}
      <motion.div 
        key={displayedMessage}
        initial={{ opacity: 0, scale: 0.95, x: 20, y: "10%" }}
        animate={{ opacity: 1, scale: 1, x: 10, y: "0%" }}
        transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.7 }}
        className="relative z-10 w-full flex justify-end"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-2xl border border-gray-100/50 relative w-full">
          <TypewriterText text={displayedMessage} />
          {/* Chat bubble tail pointing right */}
          <div className="absolute top-1/2 -right-[8px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[10px] border-l-white/95 border-b-[8px] border-b-transparent drop-shadow-md"></div>
        </div>
      </motion.div>
    </div>
  );
}

// FlipCard component for animated 3D Bento reveals (Pure CSS)
function FlipCard({ label, score, icon: Icon, color: statusColor, bg: statusBg, border: statusBorder, iconBg, actionable, science }: any) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-28 cursor-pointer group [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between group-hover:shadow-md transition-shadow [backface-visibility:hidden]"
        >
          <div className="flex justify-between items-start">
            <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md ${iconBg}`}>
              <Icon weight="duotone" className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">Tap to flip</div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{score}</div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className={`absolute inset-0 rounded-2xl border p-4 ${statusBg} ${statusBorder} flex flex-col justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]`}
        >
          <p className={`text-[11px] font-bold ${statusColor} mb-1 leading-tight line-clamp-2`}>{actionable}</p>
          <p className={`text-[10px] font-medium opacity-80 ${statusColor} leading-tight line-clamp-3`}>{science}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardTab({ 
  loading, 
  error, 
  handleLocationSelect 
}: { 
  loading: boolean; 
  error: string; 
  handleLocationSelect: (lat: number, lng: number) => void;
}) {
  const { scanResult, mapCenter, scanRadius, selectedLocation, language } = useAppStore();
  const currentStatus = scanResult ? (scanResult.ndvi_score > 0.6 ? 'optimal' : scanResult.ndvi_score >= 0.3 ? 'warning' : 'error') : (error ? 'error' : 'standby');
  
  // Live clock — client-only to avoid SSR hydration mismatch
  const [clockTime, setClockTime] = useState("");
  useEffect(() => {
    const tick = () => setClockTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const getVegetationStatus = (score: number) => {
    if (score > 0.5) return { 
      title: "Dense Vegetation", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-500", actionable: "Crops are in peak health.", science: "NDVI > 0.5" 
    };
    if (score >= 0.2) return { 
      title: "Moderate Vegetation", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-500", actionable: "Monitor soil moisture.", science: "NDVI 0.2-0.5" 
    };
    return { 
      title: "Bare Soil / Urban", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-500", actionable: "No significant agriculture.", science: "NDVI < 0.2" 
    };
  };

  const getWaterStatus = (score: number) => {
    if (score > 0.1) return { 
      title: "Surface Water", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-500", actionable: "High water content.", science: "NDWI > 0.1" 
    };
    return { 
      title: "Dry Land", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-500", actionable: "No surface water.", science: "NDWI < 0" 
    };
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 min-h-[80vh] flex-1 w-full relative">
      {/* Map Column */}
      <div className="xl:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all duration-500 min-h-[400px] md:min-h-[500px] xl:min-h-0 relative z-10">
        <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/50">
          <Map onLocationSelect={handleLocationSelect} radius={scanRadius} mapCenter={mapCenter} selectedLocation={selectedLocation} />
        </div>
      </div>

      {/* Control Panel Column */}
      <div className="xl:col-span-5 flex flex-col gap-4 md:gap-6 mt-44 md:mt-52 xl:mt-36 relative z-20">
        
        {/* Kuya Kabaw Peeking Mascot */}
        <div className="absolute bottom-full left-0 right-0 z-[-1] flex justify-end items-end mb-1 pointer-events-none">
           <div className="pointer-events-auto flex justify-end w-full">
             <KuyaKabaw status={currentStatus as 'optimal' | 'warning' | 'error' | 'standby'} loading={loading} message={error} />
           </div>
        </div>

        {/* Mission Control Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-8 hover:shadow-md transition-all duration-500 relative z-10">
          <h2 className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-slate-400 mb-4 md:mb-6">KABAW Command Center</h2>
          
          <div className="flex items-center gap-4 md:gap-8 mb-6 md:mb-8">
            <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0">
              <motion.div 
                animate={
                  currentStatus === 'standby' ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] } :
                  currentStatus === 'optimal' ? { scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] } :
                  { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 rounded-full blur-xl ${
                  currentStatus === 'optimal' ? 'bg-emerald-500' :
                  currentStatus === 'error' || currentStatus === 'warning' ? 'bg-rose-500' :
                  'bg-slate-400'
                }`}
              />
              <div className={`relative w-full h-full rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2)] border-4 ${
                currentStatus === 'optimal' ? 'bg-emerald-400 border-emerald-300' :
                currentStatus === 'error' || currentStatus === 'warning' ? 'bg-rose-400 border-rose-300' :
                'bg-slate-300 border-slate-200'
              }`} />
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">{t('status', language)}</div>
              <div className={`text-2xl font-bold uppercase tracking-tight mb-2 ${
                currentStatus === 'optimal' ? 'text-emerald-600 dark:text-emerald-400' :
                currentStatus === 'error' || currentStatus === 'warning' ? 'text-rose-600 dark:text-rose-400' :
                'text-slate-600 dark:text-slate-300'
              }`}>
                {loading ? t('analyzing', language) : currentStatus === 'standby' ? t('standby', language) : currentStatus === 'optimal' ? t('optimal', language) : t('warning', language)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 inline-block">
                SYS: <span className="text-emerald-500 dark:text-emerald-400 font-bold">ON</span> | {clockTime || '—'} UTC
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Sensor Card */}
            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all duration-300 cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1rem] bg-slate-800 text-white flex items-center justify-center shadow-md"><Globe weight="duotone" className="w-6 h-6" /></div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{t('primarySensor', language)}</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">SENTINEL-2 ORBITAL</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-700/50">{t('online', language)}</div>
            </div>
            
            {/* Vegetation Flip Card */}
            {(() => {
              const status = scanResult ? getVegetationStatus(scanResult.ndvi_score) : null;
              return status ? (
                <FlipCard 
                  {...status}
                  label={t('cropHealth', language)}
                  score={scanResult!.ndvi_score.toFixed(2)}
                  icon={Leaf}
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between h-28 cursor-default">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center"><Leaf weight="duotone" className="w-4 h-4" /></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{loading ? t('analyzing', language) : t('standby', language)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{t('cropHealth', language)}</div>
                    <div className="text-xl font-black text-slate-300">--</div>
                  </div>
                </div>
              );
            })()}

            {/* Moisture Flip Card */}
            {(() => {
              // Using the same logic block, just swapping text to Moisture for demonstration
              const status = scanResult ? getWaterStatus(scanResult.ndwi_score) : null;
              return status ? (
                <FlipCard 
                  {...status}
                  label={t('moistureLevel', language)}
                  score={scanResult!.ndwi_score.toFixed(2)}
                  icon={Drop}
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between h-28 cursor-default">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center"><Drop weight="duotone" className="w-4 h-4" /></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{loading ? t('analyzing', language) : t('standby', language)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{t('moistureLevel', language)}</div>
                    <div className="text-xl font-black text-slate-300">--</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Re-usable analysis logic */}
        <AnimatePresence mode="wait">
          {!scanResult && !loading && !error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-3xl border p-7 mb-2 mt-4 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700">
                <h2 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-3">
                  <Globe weight="bold" className="w-4 h-4" /> System Explanation
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Welcome to the KABAW Orbital Crop & Land Monitoring System. This dashboard connects directly to the <strong className="text-slate-900 dark:text-slate-200">Sentinel-2 Satellite</strong> API to provide real-time agricultural telemetry.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="font-bold">NDVI (Vegetation):</span> Measures plant health and crop density.
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="font-bold">NDWI (Moisture):</span> Detects surface water and irrigation levels.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
