export default function Logo({ showText = true, className = "" }: { showText?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-auto">
        <img 
          src="/assets/images/logo.png"
          alt="DezignPool Logo - Premium Architecture & Interior Design"
          className="h-20 md:h-28 w-auto object-contain"
          width="224"
          height="224"
          loading="eager"
          decoding="async"
          style={{
            imageRendering: 'crisp-edges',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0) scale(1.0, 1.0)'
          }}
        />
      </div>
      {showText && (
        <span className="hidden lg:block text-base logo-text mt-2">
          DEZIGNPOOL
        </span>
      )}
    </div>
  );
}