'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /**
   * Threshold at which to trigger (0-1)
   * @default 0.1
   */
  threshold?: number | number[];

  /**
   * Root margin for intersection observer
   * @default '0px'
   */
  rootMargin?: string;

  /**
   * Whether to trigger only once when element enters view
   * @default true
   */
  triggerOnce?: boolean;

  /**
   * Root element for intersection observer
   * @default null (viewport)
   */
  root?: Element | null;
}

interface UseInViewReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the element you want to observe
   */
  ref: React.RefObject<T | null>;

  /**
   * Whether the element is currently in view
   */
  isInView: boolean;

  /**
   * Whether the element has ever been in view
   */
  hasBeenInView: boolean;
}

/**
 * Custom hook to detect when an element enters the viewport
 * Uses Intersection Observer API for performance
 *
 * @example
 * ```tsx
 * const { ref, isInView } = useInView({ threshold: 0.3 });
 *
 * return (
 *   <div
 *     ref={ref}
 *     className={`transition-opacity ${isInView ? 'opacity-100' : 'opacity-0'}`}
 *   >
 *     Animated content
 *   </div>
 * );
 * ```
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    root = null
  } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    // Early return if no element or already triggered once
    if (!element || (triggerOnce && hasBeenInView)) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: assume element is in view if API not supported
      setIsInView(true);
      setHasBeenInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting;

          setIsInView(inView);

          // Track if element has ever been in view
          if (inView && !hasBeenInView) {
            setHasBeenInView(true);

            // If triggerOnce is true, stop observing after first intersection
            if (triggerOnce) {
              observer.unobserve(element);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce, root, hasBeenInView]);

  return {
    ref,
    isInView: triggerOnce ? hasBeenInView : isInView,
    hasBeenInView
  };
}

/**
 * Preset hook for fade-in animations
 * Triggers once when element enters viewport with 20% threshold
 */
export function useInViewFadeIn() {
  return useInView({
    threshold: 0.2,
    triggerOnce: true
  });
}

/**
 * Preset hook for slide-up animations
 * Triggers once with slight bottom margin for early triggering
 */
export function useInViewSlideUp() {
  return useInView({
    threshold: 0.15,
    rootMargin: '-50px 0px',
    triggerOnce: true
  });
}

/**
 * Preset hook for continuous animations
 * Triggers every time element enters/exits viewport
 */
export function useInViewContinuous(threshold: number = 0.5) {
  return useInView({
    threshold,
    triggerOnce: false
  });
}
