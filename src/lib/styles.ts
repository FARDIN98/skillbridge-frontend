/**
 * Reusable Tailwind class strings for consistent styling
 */

export const styles = {
  // Glass card effect
  glassCard:
    'bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30',

  // Primary CTA button
  ctaPrimary:
    'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold px-8 py-4 rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px] relative overflow-hidden group',

  // Secondary CTA button
  ctaSecondary:
    'bg-white/5 backdrop-blur-xl border-2 border-amber-400/30 text-amber-400 font-semibold px-8 py-4 rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-amber-400/10 hover:border-amber-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px]',

  // Button shimmer effect
  buttonShimmer:
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700',

  // Section title
  sectionTitle:
    'text-3xl sm:text-4xl md:text-5xl font-bold text-white',

  // Section subtitle
  sectionSubtitle:
    'text-base sm:text-lg text-slate-400',

  // Avatar placeholder
  avatarPlaceholder:
    'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 font-bold rounded-full flex items-center justify-center flex-shrink-0',

  // Badge
  badge:
    'bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs px-3 py-1 rounded-full',

  // Step number (How It Works)
  stepNumber:
    'h-20 w-20 rounded-full flex items-center justify-center text-3xl backdrop-blur-xl bg-gradient-to-br from-amber-400/20 to-amber-400/10 border-2 border-amber-400/30 text-amber-400 font-bold',

  // Stat number
  statNumber:
    'text-4xl sm:text-5xl font-black bg-gradient-to-br from-amber-400 to-amber-500 bg-clip-text text-transparent',

  // Testimonial card
  testimonialCard:
    'bg-white/2 border border-white/8 rounded-2xl p-6 sm:p-8 backdrop-blur-xl',

  // Loading shimmer
  loadingShimmer:
    'bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl animate-shimmer',
};
