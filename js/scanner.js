'use strict';

/**
 * scanner.js
 * ------------------------------------------------------------------
 * Owns the camera stream and QR detection. Everything else in the
 * app only sees startScan()/stopScan() — main.js doesn't know or
 * care whether detection happens via the native BarcodeDetector API
 * or a third-party decoder.
 *
 * DETECTION ENGINE:
 * This uses the browser-native BarcodeDetector API (supported in
 * Chrome/Edge/Android WebView, and Safari 17+ on iOS/macOS). It is
 * NOT supported in desktop Firefox or older Safari.
 *
 * To add a fallback for unsupported browsers, drop in a library like
 * jsQR (https://github.com/cozmo/jsQR) and only change detectFrame()
 * below — grab a canvas 2D context, draw the current video frame to
 * it with ctx.drawImage(videoEl, 0, 0), read back the ImageData, and
 * pass it to jsQR(imageData.data, imageData.width, imageData.height).
 * Nothing else in this file, or in main.js, needs to change.
 * ------------------------------------------------------------------
 */

let stream = null;
let rafId = null;
let detector = null;

/**
 * Validates the decoded QR payload against your physical starter card.
 * TODO: replace this with your real rule — e.g. an exact match against
 * a code printed on the card ("QAADA-START-01"), or a signed/hashed
 * value if you want to prevent people faking the card with any QR
 * image. Right now it accepts any non-empty decode so you can wire
 * the rest of the flow before your final card art/codes are ready.
 * @param {string} value
 */
function isValidStarterCode(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {{
 *   videoEl: HTMLVideoElement,
 *   onSuccess: (value: string) => void,
 *   onError: (reason: 'camera-unsupported' | 'camera-denied' | 'detector-unsupported') => void
 * }} params
 */
async function startScan({ videoEl, onSuccess, onError }) {
  if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
    onError?.('camera-unsupported');
    return;
  }

  if (!('BarcodeDetector' in window)) {
    onError?.('detector-unsupported');
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
  } catch (err) {
    onError?.('camera-denied');
    return;
  }

  videoEl.srcObject = stream;
  await videoEl.play();

  detector = new BarcodeDetector({ formats: ['qr_code'] });

  const tick = async () => {
    if (!stream) return; // stopScan() was called mid-flight

    try {
      const codes = await detector.detect(videoEl);
      if (codes.length > 0 && isValidStarterCode(codes[0].rawValue)) {
        const value = codes[0].rawValue;
        stopScan();
        onSuccess?.(value);
        return;
      }
    } catch (err) {
      // A single failed detection frame isn't fatal — keep scanning.
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
}

function stopScan() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  detector = null;
}

export { startScan, stopScan };
