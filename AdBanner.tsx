import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CONFIG } from './adsConfig';

interface AdBannerProps {
  slotId?: string;
  placement?: keyof typeof ADSENSE_CONFIG.slots;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

/**
 * Conditional Google AdSense Component
 *
 * RULE:
 * - AD AVAILABLE → SHOW AD
 * - NO AD AVAILABLE → SHOW NOTHING (0px height, 0px margin, 0px padding)
 *
 * Detects real AdSense rendering via:
 * 1. data-ad-status="filled" vs data-ad-status="unfilled"
 * 2. Presence of active rendered iframe with offsetHeight > 0
 * 3. Graceful timeout dismissal for blocked or failed ad calls
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  placement,
  format = 'auto',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [adState, setAdState] = useState<'pending' | 'filled' | 'unfilled'>('pending');
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasRequestedRef = useRef(false);

  const effectiveSlotId = slotId || (placement ? ADSENSE_CONFIG.slots[placement] : undefined);

  // 1. Lazy-load ad container when approaching viewport
  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 2. Request and observe AdSense ad lifecycle
  useEffect(() => {
    if (!isIntersecting || hasRequestedRef.current || adState === 'unfilled') return;

    const insElement = insRef.current;
    if (!insElement) return;

    const checkAdStatus = () => {
      if (!insElement) return false;

      const status = insElement.getAttribute('data-ad-status');
      if (status === 'filled') {
        setAdState('filled');
        return true;
      }
      if (status === 'unfilled') {
        setAdState('unfilled');
        return true;
      }

      // Check if AdSense injected an iframe with non-zero dimensions
      const iframe = insElement.querySelector('iframe');
      if (iframe && (insElement.offsetHeight > 10 || iframe.offsetHeight > 10)) {
        setAdState('filled');
        return true;
      }

      return false;
    };

    // Set up MutationObserver to watch for AdSense DOM updates and attribute changes
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        checkAdStatus();
      });

      observer.observe(insElement, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'class', 'style'],
        childList: true,
        subtree: true
      });
    }

    // Safety timeout: if after 3.5s no ad is filled (ad-blocker, no inventory, or error),
    // mark as unfilled so container is completely dismissed
    const timeoutId = setTimeout(() => {
      const isFilled = checkAdStatus();
      if (!isFilled) {
        setAdState('unfilled');
      }
    }, 3500);

    // Initial check in case it resolved synchronously
    if (!checkAdStatus()) {
      try {
        if (typeof window !== 'undefined') {
          const win = window as unknown as { adsbygoogle?: Array<Record<string, unknown>> };
          win.adsbygoogle = win.adsbygoogle || [];
          win.adsbygoogle.push({});
          hasRequestedRef.current = true;
        }
      } catch (err) {
        // In case adsbygoogle throws, mark as unfilled immediately
        setAdState('unfilled');
      }
    } else {
      hasRequestedRef.current = true;
    }

    return () => {
      if (observer) observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isIntersecting, adState]);

  // If confirmed unfilled or blocked, remove completely from DOM (0 space, 0 margins)
  if (adState === 'unfilled') {
    return null;
  }

  // When filled: display with natural responsive margins
  // When pending: keep width 100% (so AdSense can measure parent width) but ZERO height, ZERO margin, ZERO padding
  const isFilled = adState === 'filled';

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-full overflow-hidden text-center transition-opacity duration-300 ${
        isFilled
          ? `my-3 sm:my-4 opacity-100 ${className}`
          : 'h-0 min-h-0 m-0 p-0 border-0 opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isFilled}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          margin: '0 auto',
          minWidth: isFilled ? '250px' : undefined
        }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        {...(effectiveSlotId ? { 'data-ad-slot': effectiveSlotId } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
