export type PresetAvatar = {
  id: string;
  label: string;
  url: string;
};

function makeAvatarSvg(bg1: string, bg2: string, skin: string, hair: string, shirt: string, style: "classic" | "glasses" | "hoodie" | "bob" | "cap" | "bun" | "beard" | "headset" | "wave" | "minimal" | "crown" | "visor"): string {
  const accessory =
    style === "glasses"
      ? `<rect x="33" y="42" width="13" height="9" rx="3" fill="none" stroke="#16181c" stroke-width="2.2"/><rect x="54" y="42" width="13" height="9" rx="3" fill="none" stroke="#16181c" stroke-width="2.2"/><line x1="46" y1="46" x2="54" y2="46" stroke="#16181c" stroke-width="2.2"/>`
      : style === "visor"
      ? `<rect x="31" y="41" width="38" height="10" rx="5" fill="#16181c" opacity="0.88"/><line x1="36" y1="46" x2="46" y2="46" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>`
      : style === "cap"
      ? `<path d="M27 36 C27 21 73 21 73 36 Z" fill="${shirt}"/><rect x="25" y="33" width="54" height="5" rx="2.5" fill="#16181c"/>`
      : style === "headset"
      ? `<path d="M27 45 C27 25 73 25 73 45" fill="none" stroke="#16181c" stroke-width="3.5" stroke-linecap="round"/><rect x="23" y="41" width="6" height="13" rx="3" fill="#dc3545"/><rect x="71" y="41" width="6" height="13" rx="3" fill="#dc3545"/>`
      : style === "crown"
      ? `<path d="M35 24 L40 15 L50 21 L60 15 L65 24 Z" fill="#f59e0b"/>`
      : "";

  const hairShape =
    style === "bob"
      ? `<path d="M27 44 C27 22 73 22 73 44 L75 62 C70 60 67 56 67 48 L67 38 C60 33 40 33 33 38 L33 48 C33 56 30 60 25 62 Z" fill="${hair}"/>`
      : style === "bun"
      ? `<circle cx="50" cy="19" r="9" fill="${hair}"/><path d="M29 44 C29 24 71 24 71 44 C64 34 36 34 29 44 Z" fill="${hair}"/>`
      : style === "wave"
      ? `<path d="M28 43 C27 22 72 20 72 43 C66 34 55 31 46 35 C38 38 33 36 28 43 Z" fill="${hair}"/>`
      : style === "minimal"
      ? `<path d="M30 41 C31 24 69 24 70 41 C63 35 37 35 30 41 Z" fill="${hair}"/>`
      : `<path d="M29 43 C29 23 71 23 71 43 C64 33 36 33 29 43 Z" fill="${hair}"/>`;

  const beard =
    style === "beard"
      ? `<path d="M34 52 C34 64 41 69 50 69 C59 69 66 64 66 52 C63 58 58 61 50 61 C42 61 37 58 34 52 Z" fill="${hair}"/>`
      : "";

  const hoodieCollar =
    style === "hoodie"
      ? `<path d="M22 96 C24 74 37 68 50 68 C63 68 76 74 78 96 Z" fill="${shirt}"/><path d="M36 70 Q50 82 64 70" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.45"/>`
      : `<path d="M22 96 C24 74 37 68 50 68 C63 68 76 74 78 96 Z" fill="${shirt}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/>${hoodieCollar}<rect x="43" y="61" width="14" height="12" rx="6" fill="${skin}"/><circle cx="50" cy="46" r="19" fill="${skin}"/>${hairShape}${beard}<circle cx="42" cy="46" r="2.2" fill="#16181c"/><circle cx="58" cy="46" r="2.2" fill="#16181c"/><path d="M44 54 Q50 58 56 54" fill="none" stroke="#16181c" stroke-width="2.1" stroke-linecap="round"/>${accessory}</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: "av-desk-1",
    label: "Desk Pro",
    url: makeAvatarSvg("#16181c", "#343a46", "#f2c6a0", "#1f2430", "#dc3545", "glasses"),
  },
  {
    id: "av-bull-2",
    label: "Market Analyst",
    url: makeAvatarSvg("#0f172a", "#1e293b", "#8d5524", "#111827", "#10b981", "classic"),
  },
  {
    id: "av-chart-3",
    label: "Chart Strategist",
    url: makeAvatarSvg("#7f1d1d", "#dc3545", "#e0ac69", "#291d18", "#16181c", "bob"),
  },
  {
    id: "av-quant-4",
    label: "Quant Trader",
    url: makeAvatarSvg("#1e1b4b", "#4338ca", "#f1c27d", "#18181b", "#f8fafc", "visor"),
  },
  {
    id: "av-fx-5",
    label: "Session Lead",
    url: makeAvatarSvg("#064e3b", "#059669", "#c68642", "#1c1917", "#16181c", "headset"),
  },
  {
    id: "av-crown-6",
    label: "Apex Trader",
    url: makeAvatarSvg("#18181b", "#3f3f46", "#6b4226", "#09090b", "#dc3545", "crown"),
  },
  {
    id: "av-london-7",
    label: "London Open",
    url: makeAvatarSvg("#881337", "#e11d48", "#ffdbac", "#3b2f2f", "#1e293b", "bun"),
  },
  {
    id: "av-ny-8",
    label: "NY Momentum",
    url: makeAvatarSvg("#0c4a6e", "#0284c7", "#c68642", "#1e1b18", "#0f172a", "hoodie"),
  },
  {
    id: "av-swing-9",
    label: "Swing Mentor",
    url: makeAvatarSvg("#78350f", "#d97706", "#8d5524", "#18181b", "#16181c", "beard"),
  },
  {
    id: "av-scalp-10",
    label: "Scalper",
    url: makeAvatarSvg("#312e81", "#6366f1", "#f1c27d", "#451a03", "#dc3545", "cap"),
  },
  {
    id: "av-price-11",
    label: "Price Action",
    url: makeAvatarSvg("#134e4a", "#0d9488", "#e0ac69", "#1c1917", "#f8fafc", "wave"),
  },
  {
    id: "av-macro-12",
    label: "Macro Desk",
    url: makeAvatarSvg("#27272a", "#52525b", "#6b4226", "#09090b", "#f59e0b", "minimal"),
  },
];
