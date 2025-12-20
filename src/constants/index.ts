// App States
export enum AppState {
    LOGIN,
    LOADING,
    WRAPPED,
}

// Slide duration for auto-advance (optional usage)
export const SLIDE_DURATION = 10000;
export const TOTAL_SLIDES = 8;

// Map colorType to Tailwind gradients (Use DARKER tones for white text readability)
export const COLOR_MAP: Record<string, string> = {
    energetic: "bg-gradient-to-br from-orange-700 via-red-800 to-purple-900",
    calm: "bg-gradient-to-br from-blue-800 via-cyan-900 to-slate-950",
    melancholy: "bg-gradient-to-br from-slate-700 via-gray-800 to-black",
    romantic: "bg-gradient-to-br from-pink-700 via-rose-800 to-indigo-950",
    dark: "bg-gradient-to-br from-gray-900 via-violet-950 to-black",
    nature: "bg-gradient-to-br from-emerald-800 via-green-900 to-slate-950",
    dreamy: "bg-gradient-to-br from-indigo-600 via-purple-800 to-slate-900",
    fiery: "bg-gradient-to-br from-red-800 via-orange-900 to-stone-950",
    royal: "bg-gradient-to-br from-yellow-700 via-purple-900 to-slate-950",
    electric: "bg-gradient-to-br from-cyan-800 via-violet-900 to-fuchsia-950",
    cozy: "bg-gradient-to-br from-orange-900 via-stone-800 to-slate-950",
    mystic: "bg-gradient-to-br from-teal-800 via-sky-900 to-slate-950",
    cool: "bg-gradient-to-br from-sky-700 via-blue-900 to-slate-950"
};

export const DEFAULT_COLOR = COLOR_MAP['dreamy'];

// Fallback gradients - softer, more designed
export const FALLBACK_GRADIENTS = [
    "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900",
    "bg-gradient-to-br from-slate-800 via-rose-950 to-slate-900",
    "bg-gradient-to-bl from-emerald-900 via-slate-900 to-teal-900",
    "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950",
    "bg-gradient-to-t from-orange-950 via-slate-900 to-red-950",
];
