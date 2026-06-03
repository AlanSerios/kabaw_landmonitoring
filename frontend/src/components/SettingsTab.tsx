import { useAppStore } from "@/store";
import { Gear } from "@phosphor-icons/react";

export default function SettingsTab() {
  const { scanRadius, setScanRadius } = useAppStore();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[60vh] flex flex-col">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
          <Gear weight="duotone" className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold uppercase tracking-widest text-xs text-slate-400">System Preferences</h2>
          <h1 className="text-xl font-black text-slate-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-xl flex flex-col gap-8">
        <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Default Scan Radius</h3>
              <p className="text-xs text-slate-500 mt-1">The area (in meters) to scan around the central target coordinates.</p>
            </div>
            <div className="text-lg font-black text-emerald-600">{scanRadius}m</div>
          </div>
          <input 
            type="range" 
            min="10" 
            max="250" 
            step="5"
            value={scanRadius} 
            onChange={(e) => setScanRadius(parseInt(e.target.value))} 
            className="w-full accent-emerald-500 cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
}
