import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, X, Move, Camera, Loader2 } from "lucide-react";

export interface ImageCropModalProps {
  imageSrc: string;
  onCrop: (croppedBlob: Blob, croppedDataUrl: string) => void | Promise<void>;
  onCancel: () => void;
  title?: string;
}

const CROP_BOX_SIZE = 280; // Diameter of the crop circle in px
const OUTPUT_SIZE = 512;   // High resolution output canvas

export default function ImageCropModal({
  imageSrc,
  onCrop,
  onCancel,
  title = "Crop & Position Photo",
}: ImageCropModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dragStartRef = useRef<{ clientX: number; clientY: number; offsetX: number; offsetY: number }>({
    clientX: 0,
    clientY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load natural dimensions of the image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
    if (img.complete && img.naturalWidth > 0) {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [imageSrc]);

  // Compute base dimensions to cover the crop box at 1x zoom
  const isRotated90 = rotation % 180 !== 0;
  const effectiveW = isRotated90 ? naturalSize.height : naturalSize.width;
  const effectiveH = isRotated90 ? naturalSize.width : naturalSize.height;

  const scaleToCover = effectiveW > 0 && effectiveH > 0
    ? Math.max(CROP_BOX_SIZE / effectiveW, CROP_BOX_SIZE / effectiveH)
    : 1;

  const baseW = naturalSize.width * scaleToCover;
  const baseH = naturalSize.height * scaleToCover;

  // Clamp offset to ensure crop box is never empty
  const clampOffset = useCallback((x: number, y: number, currentZ: number, rot: number) => {
    const rotated = rot % 180 !== 0;
    const effectiveBaseW = rotated ? baseH : baseW;
    const effectiveBaseH = rotated ? baseW : baseH;
    if (effectiveBaseW === 0 || effectiveBaseH === 0) return { x: 0, y: 0 };

    const renderedW = effectiveBaseW * currentZ;
    const renderedH = effectiveBaseH * currentZ;

    const maxX = Math.max(0, (renderedW - CROP_BOX_SIZE) / 2);
    const maxY = Math.max(0, (renderedH - CROP_BOX_SIZE) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [baseW, baseH]);

  // Handle pointer drag (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageLoaded) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    const targetX = dragStartRef.current.offsetX + dx;
    const targetY = dragStartRef.current.offsetY + dy;
    const clamped = clampOffset(targetX, targetY, zoom, rotation);
    setOffset(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  // Zoom control
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, clampedZoom, rotation));
  };

  // Rotate control
  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    setOffset((prev) => clampOffset(prev.x, prev.y, zoom, nextRotation));
  };

  // Reset
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    handleZoomChange(zoom + delta);
  };

  // Apply and generate crop
  const handleSaveCrop = async () => {
    if (!imageLoaded || isProcessing) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageSrc;
        if (img.complete && img.naturalWidth > 0) resolve();
      });

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create canvas context");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio from on-screen crop box to final high-res output
      const ratio = OUTPUT_SIZE / CROP_BOX_SIZE;

      // Center the canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

      // Translate by pan offset
      ctx.translate(offset.x * ratio, offset.y * ratio);

      // Rotate around center
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw image scaled to match on-screen view exactly
      const canvasW = baseW * ratio * zoom;
      const canvasH = baseH * ratio * zoom;
      ctx.drawImage(img, -canvasW / 2, -canvasH / 2, canvasW, canvasH);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      const blob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), "image/jpeg", 0.92);
      });

      if (!blob) {
        throw new Error("Canvas export failed");
      }

      await onCrop(blob, dataUrl);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-line/60 bg-[#12151b] text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/20 text-brand">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Drag to position, use the slider to zoom</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop Viewport Area */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#0a0c10]">
          <div
            className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none shadow-inner"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* The Image */}
            {imageLoaded ? (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                className="absolute pointer-events-none select-none max-w-none transition-transform duration-75 ease-out"
                style={{
                  width: `${baseW}px`,
                  height: `${baseH}px`,
                  maxWidth: "none",
                  maxHeight: "none",
                  left: "50%",
                  top: "50%",
                  transformOrigin: "center center",
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                }}
                draggable={false}
              />
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="h-5 w-5 animate-spin text-brand" /> Loading photo...
              </div>
            )}

            {/* Circular Crop Overlay with dark mask */}
            <div
              className="absolute pointer-events-none rounded-full border-2 border-dashed border-white/85 shadow-[0_0_0_9999px_rgba(10,12,16,0.78)] z-10 flex items-center justify-center"
              style={{ width: `${CROP_BOX_SIZE}px`, height: `${CROP_BOX_SIZE}px` }}
            >
              {/* Subtle crosshair */}
              <div className="relative w-6 h-6 pointer-events-none opacity-40">
                <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white" />
                <span className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-white" />
              </div>
            </div>

            {/* Hint Badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-sm pointer-events-none">
              <Move className="h-3 w-3 text-brand" /> Drag to adjust
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mt-5 w-full max-w-[320px] space-y-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.2)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.2)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Secondary Controls: Rotate & Reset */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 hover:text-white transition"
              >
                <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
              </button>

              <span className="text-[11px] text-slate-500 font-mono">
                {Math.round(zoom * 100)}% zoom
              </span>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="border-t border-white/10 bg-[#12151b] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular preview */}
            <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-brand/50 bg-neutral-900 shadow-sm flex items-center justify-center">
              {imageLoaded && (
                <img
                  src={imageSrc}
                  alt="Round preview"
                  className="absolute pointer-events-none select-none"
                  style={{
                    width: `${baseW * (44 / CROP_BOX_SIZE)}px`,
                    height: `${baseH * (44 / CROP_BOX_SIZE)}px`,
                    maxWidth: "none",
                    maxHeight: "none",
                    left: "50%",
                    top: "50%",
                    transformOrigin: "center center",
                    transform: `translate(-50%, -50%) translate(${offset.x * (44 / CROP_BOX_SIZE)}px, ${offset.y * (44 / CROP_BOX_SIZE)}px) rotate(${rotation}deg) scale(${zoom})`,
                  }}
                />
              )}
            </div>

            {/* Rounded square preview */}
            <div className="relative h-11 w-11 overflow-hidden rounded-xl ring-2 ring-brand/50 bg-neutral-900 shadow-sm flex items-center justify-center">
              {imageLoaded && (
                <img
                  src={imageSrc}
                  alt="Card preview"
                  className="absolute pointer-events-none select-none"
                  style={{
                    width: `${baseW * (44 / CROP_BOX_SIZE)}px`,
                    height: `${baseH * (44 / CROP_BOX_SIZE)}px`,
                    maxWidth: "none",
                    maxHeight: "none",
                    left: "50%",
                    top: "50%",
                    transformOrigin: "center center",
                    transform: `translate(-50%, -50%) translate(${offset.x * (44 / CROP_BOX_SIZE)}px, ${offset.y * (44 / CROP_BOX_SIZE)}px) rotate(${rotation}deg) scale(${zoom})`,
                  }}
                />
              )}
            </div>

            <div className="text-left">
              <p className="text-xs font-semibold text-white">Live Preview</p>
              <p className="text-[11px] text-slate-400">Circle & card avatars</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {OUTPUT_SIZE} × {OUTPUT_SIZE} HD
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#0c0e12] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveCrop}
            disabled={!imageLoaded || isProcessing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/25 hover:brightness-110 active:brightness-95 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Photo...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
