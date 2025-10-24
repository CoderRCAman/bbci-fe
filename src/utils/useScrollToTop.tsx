import { useState, useEffect, RefObject } from 'react';

/**
 * A custom React hook that tracks scroll position *on a specific element*
 * and provides a function to scroll that element to the top.
 *
 * @param scrollableElementRef - A React ref to the DOM element that has the scrollbar.
 * @returns An object with `isVisible` state and a `scrollToTop` function.
 */
export const useScrollToTop = (
  scrollableElementRef: RefObject<HTMLElement | null>,
) => {
  const [isVisible, setIsVisible] = useState(false);

  // This effect adds a scroll event listener to the *specific element*
  useEffect(() => {
    const element = scrollableElementRef.current;

    // Do nothing if the element ref is not set yet
    if (!element) {
      return;
    }

    const toggleVisibility = () => {
      // Use the element's properties, not the window's
      if (element.scrollTop > element.clientHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    element.addEventListener('scroll', toggleVisibility);

    // Clean up the listener when the component unmounts
    return () => {
      element.removeEventListener('scroll', toggleVisibility);
    };
  }, [scrollableElementRef]); // Re-run effect if the ref changes

  // This function scrolls the *element* to the top smoothly
  const scrollToTop = () => {
    scrollableElementRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return { isVisible, scrollToTop };
};