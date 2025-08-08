import { useEffect, useState, useRef } from "react";
import cloud from "d3-cloud";
import { sentimentColor, getFontSize } from "../../utils/scale";
import type { WordCloudProps, Topic } from "../../utils/types";
import styles from "./WordCloud.module.css";

interface Word {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
  topic: Topic;
}

// Helpers
function getDistance(t1: React.Touch, t2: React.Touch) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}
function getCenter(t1: React.Touch, t2: React.Touch) {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
}

export default function WordCloud({ topics, onSelect }: WordCloudProps) {
  const [layoutWords, setLayoutWords] = useState<Word[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef<number | null>(null);
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const [textWidths, setTextWidths] = useState<number[]>([]);
  const lastTap = useRef<number>(0);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;

    if (!topics.length) return;

    const volumes = topics.map((t) => t.volume);
    const minVol = Math.min(...volumes);
    const maxVol = Math.max(...volumes);

    const words: Word[] = topics.map((t) => ({
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
    if (!layoutWords.length) return;
    const widths = layoutWords.map(
      (_, i) => textRefs.current[i]?.getBBox().width ?? 0
    );
    setTextWidths(widths);
  }, [layoutWords]);

  // Mouse events (desktop)
  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isTouchDevice.current) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isTouchDevice.current || !dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onMouseUp = () => {
    if (isTouchDevice.current) return;
    dragging.current = false;
  };
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (isTouchDevice.current) return;
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(0.2, z + (e.deltaY < 0 ? 0.1 : -0.1))));
  };

  // Touch events (mobile)
  const onTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isTouchDevice.current) return;

    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setZoom((z) => Math.min(z * 1.2, 5));
      }
      lastTap.current = now;
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      dragging.current = false;
      initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastPinchCenter.current = getCenter(e.touches[0], e.touches[1]);
    }
  };
  const onTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isTouchDevice.current) return;

    if (e.touches.length === 1 && dragging.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      if (initialPinchDistance.current && lastPinchCenter.current) {
        const scaleChange = dist / initialPinchDistance.current;
        setZoom((z) => Math.min(5, Math.max(0.2, z * scaleChange)));
        setOffset((o) => ({
          x: o.x + (center.x - lastPinchCenter.current!.x),
          y: o.y + (center.y - lastPinchCenter.current!.y),
        }));
        initialPinchDistance.current = dist;
        lastPinchCenter.current = center;
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

  return (
    <div className={styles.wordCloud}>
      <div className={styles.wordCloud__controls}>
        <button
          className={styles.wordCloud__zoomBtn}
          onClick={() => setZoom((z) => Math.min(z + 0.1, 5))}
        >
          +
        </button>
        <button
          className={styles.wordCloud__zoomBtn}
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.2))}
        >
          −
        </button>
        <span className={styles.wordCloud__zoomLabel}>
          Zoom: {(zoom * 100).toFixed(0)}%
        </span>
      </div>

      <div className={styles.wordCloud__holder}>
        <svg
          viewBox="0 0 800 600"
          className={styles.wordCloud__svg}
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
            touchAction: "none",
          }}
        >
          <g
            transform={`translate(${800 / 2 + offset.x}, ${
              600 / 2 + offset.y
            }) scale(${zoom}) translate(-50, -50)`}
          >
            {layoutWords.map((w, i) => {
              const lineLength = textWidths[i] || w.size * (w.text.length / 2);
              const color = sentimentColor(w.topic.sentimentScore);

              return (
                <g
                  key={i}
                  transform={`translate(${w.x}, ${w.y}) rotate(${
                    w.rotate || 0
                  })`}
                  className={styles.wordCloud__wordGroup}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <text
                    ref={(el) => {
                      textRefs.current[i] = el;
                    }}
                    textAnchor="middle"
                    fontSize={w.size}
                    fill={color}
                    className={styles.wordCloud__word}
                    onClick={() => onSelect(w.topic)}
                  >
                    {w.text.trim()}
                  </text>
                  <line
                    x1={-lineLength / 2}
                    y1={w.size * 0.1}
                    x2={lineLength / 2}
                    y2={w.size * 0.1}
                    stroke={color}
                    strokeWidth={2}
                    className={styles.wordCloud__line}
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
