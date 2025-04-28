// polyfills.ts
// This file contains polyfills to support older browsers

// Import core-js polyfills
import "core-js/features/array/find";
import "core-js/features/array/from";
import "core-js/features/array/includes";
import "core-js/features/object/assign";
import "core-js/features/promise";
import "core-js/features/string/ends-with";
import "core-js/features/string/includes";
import "core-js/features/string/pad-end";
import "core-js/features/string/pad-start";
import "core-js/features/string/starts-with";

// Fetch API polyfill
import "whatwg-fetch";

// MediaDevices API polyfill for camera functionality
if (typeof window !== "undefined") {
  // Ensure navigator exists
  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {} as Partial<MediaDevices>,
      writable: false,
      configurable: true,
    });
  }

  // getUserMedia polyfill for older browsers
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      // First try to get legacy getUserMedia if it exists
      const oldGetUserMedia =
        (
          navigator as Navigator & {
            webkitGetUserMedia?: (
              constraints: MediaStreamConstraints,
              successCallback: (stream: MediaStream) => void,
              errorCallback: (error: DOMException) => void
            ) => void;
          }
        ).webkitGetUserMedia ||
        (
          navigator as Navigator & {
            mozGetUserMedia?: (
              constraints: MediaStreamConstraints,
              successCallback: (stream: MediaStream) => void,
              errorCallback: (error: DOMException) => void
            ) => void;
          }
        ).mozGetUserMedia ||
        (
          navigator as Navigator & {
            msGetUserMedia?: (
              constraints: MediaStreamConstraints,
              successCallback: (stream: MediaStream) => void,
              errorCallback: (error: DOMException) => void
            ) => void;
          }
        ).msGetUserMedia;

      // No getUserMedia support at all
      if (!oldGetUserMedia) {
        return Promise.reject(
          new Error("getUserMedia is not implemented in this browser")
        );
      }

      // Wrap the old getUserMedia with a Promise
      return new Promise((resolve, reject) => {
        oldGetUserMedia.call(navigator, constraints || {}, resolve, reject);
      });
    };
  }

  // Element.prototype.closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s: string): Element | null {
      let el: Element | null = this as Element;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || (el.parentNode as Element);
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  // Element.prototype.matches polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      (
        Element.prototype as Element & {
          msMatchesSelector?: (selectors: string) => boolean;
        }
      ).msMatchesSelector || Element.prototype.matches;
  }

  // URL and URL.createObjectURL polyfill
  if (typeof URL !== "undefined" && URL.createObjectURL === undefined) {
    URL.createObjectURL = function (blob: Blob): string {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      if (reader.result === null) {
        throw new Error("Failed to create object URL");
      }
      return reader.result as string;
    };
  }

  // requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      return window.setTimeout(function () {
        callback(Date.now());
      }, 1000 / 60);
    };
  }

  // cancelAnimationFrame polyfill
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  // Console fallback
  if (!window.console) {
    window.console = {} as Console;
  }
  if (!window.console.log) {
    window.console.log = function () {};
  }
  if (!window.console.error) {
    window.console.error = window.console.log;
  }
  if (!window.console.warn) {
    window.console.warn = window.console.log;
  }
  if (!window.console.info) {
    window.console.info = window.console.log;
  }

  // Object.entries polyfill
  if (!Object.entries) {
    Object.entries = function (obj: Record<string, unknown>) {
      const ownProps = Object.keys(obj);
      let i = ownProps.length;
      const resArray = new Array(i);
      while (i--) {
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
      }
      return resArray;
    };
  }

  // Object.fromEntries polyfill
  if (!Object.fromEntries) {
    Object.fromEntries = function (entries: Iterable<[string, unknown]>) {
      if (!entries || !entries[Symbol.iterator]) {
        throw new Error(
          "Object.fromEntries requires a single iterable argument"
        );
      }
      const obj: Record<string, unknown> = {};
      for (const [key, value] of entries) {
        obj[key] = value;
      }
      return obj;
    };
  }

  // Array.prototype.flat polyfill
  if (!Array.prototype.flat) {
    // @ts-expect-error - adding this method for older browsers
    Array.prototype.flat = function (depth = 1) {
      const flattened: unknown[] = [];
      (function flat(array: unknown[], depth: number) {
        for (const item of array as unknown[]) {
          if (Array.isArray(item) && depth > 0) {
            flat(item as unknown[], depth - 1);
          } else {
            flattened.push(item);
          }
        }
      })(this as unknown[], depth);
      return flattened;
    };
  }

  // IntersectionObserver polyfill for lazy loading
  if (!("IntersectionObserver" in window)) {
    // Basic stub for IntersectionObserver that immediately calls the callback
    // This is a simplified version - consider importing a full polyfill for production
    // @ts-expect-error - we're defining this for older browsers
    window.IntersectionObserver = class IntersectionObserver {
      private callback: IntersectionObserverCallback;
      public root: Element | null = null;
      public rootMargin: string = "0px";
      public thresholds: number[] = [0];

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element): void {
        // Simply call the callback with a mocked entry
        setTimeout(() => {
          this.callback(
            [
              {
                isIntersecting: true,
                intersectionRatio: 1,
                target,
                time: Date.now(),
                boundingClientRect: target.getBoundingClientRect(),
                intersectionRect: target.getBoundingClientRect(),
                rootBounds: null,
              } as IntersectionObserverEntry,
            ],
            this
          );
        }, 100);
      }

      unobserve(): void {
        // No-op
      }

      disconnect(): void {
        // No-op
      }

      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    };
  }
}

// Add additional polyfills as needed

export default {};
