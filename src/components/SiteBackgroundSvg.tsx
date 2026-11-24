import React from 'react';

interface SiteBackgroundSvgProps {
  className?: string;
  isDark?: boolean;
}

/**
 * Hardware-accelerated Deep Blue (#0B192C) corporate background layer.
 * Uses pure CSS gradients & subtle grid patterns instead of full-screen SVG DOM
 * to eliminate continuous repaint overhead during 60fps mobile scrolling.
 */
export const SiteBackgroundSvg: React.FC<SiteBackgroundSvgProps> = React.memo(({
  className = 'fixed inset-0 w-full h-full pointer-events-none -z-10',
  isDark = false,
}) => {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        contain: 'strict',
        transform: 'translateZ(0)',
        backgroundColor: isDark ? '#03182b' : '#f4f7fb',
        backgroundImage: isDark
          ? [
              'radial-gradient(60% 45% at 20% 15%, rgba(13, 71, 117, 0.42), transparent 70%)',
              'radial-gradient(55% 45% at 85% 28%, rgba(2, 132, 199, 0.22), transparent 70%)',
              'linear-gradient(to right, rgba(56, 189, 248, 0.04) 1px, transparent 1px)',
              'linear-gradient(to bottom, rgba(56, 189, 248, 0.04) 1px, transparent 1px)',
              'linear-gradient(135deg, #03182b 0%, #0B192C 45%, #072642 82%, #020e1a 100%)',
            ].join(', ')
          : [
              'radial-gradient(52% 40% at 12% 8%, rgba(186, 230, 253, 0.52), transparent 68%)',
              'radial-gradient(48% 38% at 88% 18%, rgba(199, 210, 254, 0.4), transparent 68%)',
              'radial-gradient(44% 34% at 50% 92%, rgba(224, 242, 254, 0.45), transparent 70%)',
              'linear-gradient(to right, rgba(15, 23, 42, 0.028) 1px, transparent 1px)',
              'linear-gradient(to bottom, rgba(15, 23, 42, 0.028) 1px, transparent 1px)',
              'linear-gradient(180deg, #f8fbff 0%, #f3f7fc 52%, #edf3fa 100%)',
            ].join(', '),
        backgroundSize: isDark
          ? '100% 100%, 100% 100%, 48px 48px, 48px 48px, 100% 100%'
          : '100% 100%, 100% 100%, 100% 100%, 56px 56px, 56px 56px, 100% 100%',
      }}
    />
  );
});

SiteBackgroundSvg.displayName = 'SiteBackgroundSvg';
