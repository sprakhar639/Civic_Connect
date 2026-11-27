const VARIANTS = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-2",
  secondary: "border border-line bg-white text-ink shadow-sm hover:bg-slate-50",
  ghost: "text-mute hover:bg-slate-100 hover:text-ink",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  dangerOutline: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export function buttonClass(variant = "primary", size = "md", className = "") {
  return `inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}
