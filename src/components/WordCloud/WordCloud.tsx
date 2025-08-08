import { useEffect, useState, useRef } from "react";
import cloud from "d3-cloud";
import { sentimentColor, getFontSize } from "../../utils/scale";
import type { WordCloudProps } from "../../utils/types";
import styles from "./WordCloud.module.css";

interface Word {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
  topic: any;
}

export default function WordCloud({ topics, onSelect }: WordCloudProps) {
  const [layoutWords, setLayoutWords] = useState<Word[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Za pinch zoom
  const initialPinchDistance = useRef<number | null>(null);
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null);

  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const [textWidths, setTextWidths] = useState<number[]>([]);

  // mobilni double tap
  const lastTap = useRef<number>(0);

  // Da li je touch uređaj
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;

    if (!topics.length) return;

    const volumes = topics.map((t) => t.volume);
    const minVol = Math.min(...volumes);
    const maxVol = Math.max(...volumes);

    const words = topics.map((t) => ({
      text: t.label,
      size: getFontSize(t.volume, minVol, maxVol),
      topic: t,
    }));

    cloud<Word>()
      .size([800, 600])
      .words(words)
      .padding(5)
      .rotate(() => (Math.random() > 0.8 ? 90 : 0))
      .font("Urbanist")
      .fontSize((d) => d.size)
      .on("end", setLayoutWords)
      .start();
  }, [topics]);

  useEffect(() => {
    if (layoutWords.length === 0) return;
    const widths = layoutWords.map(
      (_, i) => textRefs.current[i]?.getBBox().width ?? 0
    );
    setTextWidths(widths);
  }, [layoutWords]);

  // Desktop drag handlers
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isTouchDevice.current) return; // ignorisemo na touch uređajima
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isTouchDevice.current) return;
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((off) => ({ x: off.x + dx, y: off.y + dy }));
  };
  const onMouseUp = () => {
    if (isTouchDevice.current) return;
    dragging.current = false;
  };

  // Scroll zoom (desktop)
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (isTouchDevice.current) return;
    e.preventDefault();
    const zoomStep = 0.1;
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + zoomStep, 5));
    } else {
      setZoom((z) => Math.max(z - zoomStep, 0.2));
    }
  };

  // Touch handlers za pan i pinch-zoom
  const onTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isTouchDevice.current) return;

    if (e.touches.length === 1) {
      // Double tap zum
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setZoom((z) => Math.min(z * 1.2, 5));
      }
      lastTap.current = now;

      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      dragging.current = false; // prestani sa jednostrukim drag
      // Inicijalna udaljenost i centar za pinch
      const dist = getDistance(e.touches[0], e.touches[1]);
      initialPinchDistance.current = dist;
      lastPinchCenter.current = getCenter(e.touches[0], e.touches[1]);
    }
  };
  const onTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isTouchDevice.current) return;

    if (e.touches.length === 1 && dragging.current) {
      e.preventDefault(); // SPREČI scroll stranice pri pan
      // Jedan prst - pan
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset((off) => ({ x: off.x + dx, y: off.y + dy }));
      initialPinchDistance.current = null; // reset zoom gesture
      lastPinchCenter.current = null;
    } else if (e.touches.length === 2) {
      e.preventDefault(); // SPREČI zoom cele stranice

      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);

      if (initialPinchDistance.current && lastPinchCenter.current) {
        const scaleChange = dist / initialPinchDistance.current;

        setZoom((z) => {
          let newZoom = Math.min(5, Math.max(0.2, z * scaleChange));

          // Offset pomeraj da centriramo na pinch centru
          setOffset((off) => ({
            x: off.x + (center.x - lastPinchCenter.current!.x),
            y: off.y + (center.y - lastPinchCenter.current!.y),
          }));

          // Update za sledeći pokret pinch gestom
          initialPinchDistance.current = dist;
          lastPinchCenter.current = center;

          return newZoom;
        });
      }
    }
  };
  const onTouchEnd = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isTouchDevice.current) return;

    if (e.touches.length < 2) {
      initialPinchDistance.current = null;
      lastPinchCenter.current = null;
    }
    if (e.touches.length === 0) {
      dragging.current = false;
    }
  };

  // Helpers
  function getDistance(touch1: React.Touch, touch2: React.Touch) {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }
  function getCenter(touch1: React.Touch, touch2: React.Touch) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  return (
    <div className={styles.wordCloud}>
      <div className={styles.buttons}>
        <button onClick={() => setZoom((z) => Math.min(z + 0.1, 5))}>+</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.2))}>
          −
        </button>
        <span style={{ marginLeft: 12 }}>Zoom: {(zoom * 100).toFixed(0)}%</span>
      </div>
      <div className={styles.cloudHooder}>
        <svg
          viewBox="0 0 800 600"
          className={styles.cloud}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={() => setZoom((z) => Math.min(z * 1.2, 5))}
          style={{
            cursor: dragging.current ? "grabbing" : "grab",
            touchAction: "none", // ključno da browser ne pravi svoj pinch/scroll
          }}
        >
          <g
            transform={`translate(${800 / 2 + offset.x}, ${
              600 / 2 + offset.y
            }) scale(${zoom}) translate(-50, -50)`}
          >
            {layoutWords.map((w, i) => {
              const lineLength = textWidths[i] || w.size * (w.text.length / 2);

              return (
                <g
                  key={i}
                  transform={`translate(${w.x}, ${w.y}) rotate(${
                    w.rotate || 0
                  })`}
                  className={styles.wordGroup}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <text
                    ref={(el) => {
                      textRefs.current[i] = el;
                    }}
                    textAnchor="middle"
                    fontSize={w.size}
                    fill={sentimentColor(w.topic.sentimentScore)}
                    className={styles.word}
                    onClick={() => onSelect(w.topic)}
                    style={{ pointerEvents: "auto" }}
                  >
                    {w.text.trim()}
                  </text>
                  <line
                    x1={-lineLength / 2}
                    y1={w.size * 0.1}
                    x2={lineLength / 2}
                    y2={w.size * 0.1}
                    stroke={sentimentColor(w.topic.sentimentScore)}
                    strokeWidth={2}
                    className={styles.line}
                    style={{
                      strokeDasharray: lineLength,
                      strokeDashoffset: hoveredIndex === i ? 0 : lineLength,
                      transition: "stroke-dashoffset 0.3s ease",
                    }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
