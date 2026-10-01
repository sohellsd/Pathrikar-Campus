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
 * STRICT RULE:
 * - AD AVAILABLE → SHOW AD
 * - NO AD AVAILABLE → SHOW NOTHING
 *
 * Zero Height / Margin / Padding Reservation:
 * 1. While pending: Container has strict 0px height, 0px margin, 0px padding, 0px border,
 *    and opacity: 0. Surrounding content touches and occupies full natural space from millisecond 0.
 * 2. If ad is filled: Transitions smoothly to visible with standard spacing (opacity-100 my-3.5).
 * 3. If ad is unfilled, rejected, or blocked: Completely unmounts (returns null).
 * 4. Zero placeholders, zero loading skeletons, zero blank boxes.
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  placement,
  format = 'auto',
  className = ''
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const [isFilled, setIsFilled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasRequestedRef = useRef(false);

  const effectiveSlotId = slotId || (placement ? ADSENSE_CONFIG.slots[placement] : undefined);

  useEffect(() => {
    const el = insRef.current;
    if (!el || isDismissed) return;

    // Checks real AdSense rendering signals
    const checkRenderStatus = (): boolean => {
      if (!el) return false;

      const adStatus = el.getAttribute('data-ad-status');
      const adsbygoogleStatus = el.getAttribute('data-adsbygoogle-status');

      // 1. Explicitly filled by Google AdSense
      if (adStatus === 'filled') {
        setIsFilled(true);
        return true;
      }

      // 2. Explicitly unfilled or hidden by Google AdSense
      if (adStatus === 'unfilled' || el.style.display === 'none') {
        setIsDismissed(true);
        return false;
      }

      // 3. Rendered iframe check with actual visible height
      const iframe = el.querySelector('iframe');
      if (iframe && (iframe.offsetHeight > 10 || el.offsetHeight > 10)) {
        setIsFilled(true);
        return true;
      }

      // 4. If AdSense processed the tag ("done") without filling or injecting an iframe
      if (adsbygoogleStatus === 'done' && adStatus !== 'filled' && !iframe) {
        setIsDismissed(true);
        return false;
      }

      return false;
    };

    // Reactively watch for AdSense DOM and attribute changes
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        checkRenderStatus();
      });

      mutationObserver.observe(el, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'data-adsbygoogle-status', 'style', 'class'],
        childList: true,
        subtree: true
      });
    }

    // Reactively watch for actual dimension changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (el.offsetHeight > 10) {
          setIsFilled(true);
        }
      });
      resizeObserver.observe(el);
    }

    // Safety timeout: If no ad is filled within 2.5s (ad-blocker, no inventory, or error),
    // cleanly dismiss the component so it is removed from the DOM.
    const safetyTimer = setTimeout(() => {
      const filled = checkRenderStatus();
      if (!filled) {
        setIsDismissed(true);
      }
    }, 2500);

    // Initial request to Google AdSense
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      try {
        if (typeof window !== 'undefined') {
          const win = window as unknown as { adsbygoogle?: Array<Record<string, unknown>> };
          win.adsbygoogle = win.adsbygoogle || [];
          win.adsbygoogle.push({});
        }
      } catch (err) {
        setIsDismissed(true);
      }
    } else {
      checkRenderStatus();
    }

    return () => {
      if (mutationObserver) mutationObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(safetyTimer);
    };
  }, [isDismissed]);

  // If confirmed empty, unfilled, or blocked: render absolutely nothing (0px space, 0px margins)
  if (isDismissed) {
    return null;
  }

  // When filled: natural responsive container with balanced spacing
  // While pending: strictly 0px height, 0px margin, 0px padding, 0px border, invisible to user
  return (
    <div
      className={
        isFilled
          ? `w-full max-w-full overflow-hidden text-center my-3.5 transition-all duration-300 opacity-100 ${className}`
          : 'w-full max-w-full h-0 min-h-0 max-h-0 m-0 p-0 border-0 overflow-hidden opacity-0 pointer-events-none'
      }
      aria-hidden={!isFilled}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: isFilled ? 'block' : 'inline-block',
          width: '100%',
          margin: '0 auto',
          ...(isFilled ? {} : { height: '0px', overflow: 'hidden' })
        }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        {...(effectiveSlotId ? { 'data-ad-slot': effectiveSlotId } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
