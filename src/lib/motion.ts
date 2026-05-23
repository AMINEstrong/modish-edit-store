/** Shared easing — smooth streetwear / editorial motion */
export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeInOut = [0.45, 0, 0.15, 1] as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const defaultTransition = {
  duration: 0.65,
  ease: easeOut,
};

export const heroTransition = {
  duration: 1,
  ease: easeOut,
};
