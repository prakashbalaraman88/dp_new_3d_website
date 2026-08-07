import RotatingBrandMark from './RotatingBrandMark';

export default function Logo({
  showText = true,
  className = '',
  rotateOnScroll = false,
}: {
  showText?: boolean;
  className?: string;
  rotateOnScroll?: boolean;
}) {
  const imageClassName = 'h-20 md:h-28 w-auto object-contain';
  const imageStyle = {
    imageRendering: 'crisp-edges' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    backfaceVisibility: 'hidden' as const,
    willChange: 'transform' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-auto">
        {rotateOnScroll ? (
          <RotatingBrandMark
            alt="DezignPool Logo - Premium Architecture & Interior Design"
            className={imageClassName}
            style={imageStyle}
          />
        ) : (
          <img
            src="/assets/images/dezignpool-split-ribbon.png"
            alt="DezignPool Logo - Premium Architecture & Interior Design"
            className={imageClassName}
            width="2048"
            height="2048"
            loading="eager"
            decoding="async"
            style={imageStyle}
          />
        )}
      </div>
      {showText && (
        <span className="hidden lg:block text-base logo-text mt-2">
          DEZIGNPOOL
        </span>
      )}
    </div>
  );
}
