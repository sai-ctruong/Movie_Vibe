import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook để lazy load images và components
 * Tối ưu hóa performance bằng cách chỉ load khi element vào viewport
 */
export function useIntersectionObserver(
  {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  }: UseIntersectionObserverProps = {},
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isVisible };
}

/**
 * Hook để preload images
 * Load images trong background để tăng speed
 */
export function useImagePreload(imageUrl: string | null | undefined) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoaded(false);
      return;
    }

    const img = new Image();
    img.src = imageUrl;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setError('Failed to load image');

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageUrl]);

  return { isLoaded, error };
}

/**
 * Hook để batch load multiple images
 */
export function useImagesPreload(imageUrls: (string | null | undefined)[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const validUrls = imageUrls.filter((url) => !!url) as string[];
    
    if (validUrls.length === 0) {
      setLoadedCount(0);
      return;
    }

    let loadedImages = 0;
    const imageErrors: string[] = [];

    const handleLoad = () => {
      loadedImages++;
      setLoadedCount(loadedImages);
    };

    const handleError = (url: string) => {
      imageErrors.push(url);
      setErrors([...imageErrors]);
    };

    const images = validUrls.map((url) => {
      const img = new Image();
      img.src = url;
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', () => handleError(url));
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleLoad);
      });
    };
  }, [imageUrls]);

  return {
    loadedCount,
    totalCount: imageUrls.filter((url) => !!url).length,
    isComplete: loadedCount === imageUrls.filter((url) => !!url).length,
    errors,
  };
}

/**
 * Hook để debounce values (optimization cho search, filters, etc)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook để request video prefetch
 */
export function usePrefetchLink(href: string) {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [href]);
}
