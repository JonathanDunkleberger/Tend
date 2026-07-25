"use client";

import { useMemo } from "react";
import { daysAgo, fmtDate, today } from "@/lib/utils";

/**
 * Calendar activity grid, standardized across the app.
 *
 * Two honest modes:
 * - "binary"    — a single habit is a yes/no story: a day was tended or it
 *                 wasn't. Solid dot vs. faint square, NO intensity legend
 *                 (a "Less → More" key for a checkbox is nonsense).
 * - "intensity" — the all-habits garden log, where a day genuinely has depth
 *                 ("3 of 4 tended"). Four alpha steps + the Less/More key.
 *
 * Both modes get real calendar anchoring: all seven weekday initials down the
 * side and month labels across the top, so the grid reads like a calendar
 * instead of an abstract mosaic. Today is ringed in the accent color.
 */
interface HeatmapProps {
  getData: (date: string) => number;
  weeks?: number;
  color?: string;
  mode?: "binary" | "intensity";
  heatEmpty?: string;
  labelColor?: string;
  legendColor?: string;
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function Heatmap({
  getData,
  weeks = 16,
  color = "#2E9E5B",
  mode = "intensity",
  heatEmpty = "rgba(23,48,31,0.05)",
  labelColor = "rgba(23,48,31,0.35)",
  legendColor = "rgba(23,48,31,0.3)",
}: HeatmapProps) {
  const cs = 12;      // cell size
  const gap = 3;      // cell gap
  const lw = 16;      // weekday label gutter width
  const mh = 14;      // month label row height

  const cr = parseInt(color.slice(1, 3), 16) || 46;
  const cg = parseInt(color.slice(3, 5), 16) || 158;
  const cb = parseInt(color.slice(5, 7), 16) || 91;

  const hc = (v: number): string => {
    if (!v || v === 0) return heatEmpty;
    if (mode === "binary") return `rgba(${cr},${cg},${cb},0.92)`;
    if (v <= 0.25) return `rgba(${cr},${cg},${cb},0.28)`;
    if (v <= 0.5) return `rgba(${cr},${cg},${cb},0.5)`;
    if (v <= 0.75) return `rgba(${cr},${cg},${cb},0.72)`;
    return `rgba(${cr},${cg},${cb},0.95)`;
  };

  const { cells, months, maxWeek } = useMemo(() => {
    const result: Array<{ weekIdx: number; dow: number; date: string; val: number; isToday: boolean }> = [];
    const todayStr = today();
    const totalDays = weeks * 7;
    const start = new Date();
    start.setDate(start.getDate() - totalDays + 1);
    const startDow = start.getDay();
    for (let i = 0; i < totalDays; i++) {
      const date = daysAgo(totalDays - 1 - i);
      // Skip only genuinely-future dates (LOCAL string compare — a noon-anchored
      // Date comparison used to hide today's cell before local noon).
      if (date > todayStr) continue;
      const d = new Date(date + "T12:00:00");
      const dow = d.getDay();
      const weekIdx = Math.floor((i + startDow) / 7);
      result.push({ weekIdx, dow, date, val: getData(date), isToday: date === todayStr });
    }

    // Month labels: mark the column where a new month begins (first cell of a
    // month in that column). Skip a label if it would crowd the previous one.
    const monthMarks: { weekIdx: number; label: string }[] = [];
    let lastMonth = -1;
    let lastLabelWeek = -10;
    for (const c of result) {
      const m = new Date(c.date + "T12:00:00").getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        if (c.weekIdx - lastLabelWeek >= 3) {
          monthMarks.push({
            weekIdx: c.weekIdx,
            label: new Date(c.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" }),
          });
          lastLabelWeek = c.weekIdx;
        }
      }
    }

    const mw = result.length > 0 ? Math.max(...result.map((c) => c.weekIdx)) : 0;
    return { cells: result, months: monthMarks, maxWeek: mw };
  }, [getData, weeks]);

  const svgW = (maxWeek + 1) * (cs + gap) + lw + 4;
  const svgH = mh + 7 * (cs + gap) + 4;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={svgH} style={{ display: "block", minWidth: svgW }}>
        {/* Month labels across the top */}
        {months.map((m) => (
          <text
            key={`${m.label}-${m.weekIdx}`}
            x={m.weekIdx * (cs + gap) + lw}
            y={9}
            fontSize="8.5"
            fontWeight={600}
            fill={labelColor}
            fontFamily="inherit"
          >
            {m.label}
          </text>
        ))}
        {/* All seven weekday initials down the side */}
        {DOW_LABELS.map((d, i) => (
          <text
            key={i}
            x={0}
            y={mh + i * (cs + gap) + cs - 2.5}
            fontSize="7.5"
            fontWeight={600}
            fill={labelColor}
            fontFamily="inherit"
          >
            {d}
          </text>
        ))}
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.weekIdx * (cs + gap) + lw}
            y={mh + c.dow * (cs + gap)}
            width={cs}
            height={cs}
            rx={mode === "binary" ? cs / 2.6 : 3.5}
            fill={hc(c.val)}
            stroke={c.isToday ? `rgba(${cr},${cg},${cb},0.9)` : "none"}
            strokeWidth={c.isToday ? 1.5 : 0}
            style={{ transition: "fill 0.3s ease" }}
          >
            <title>
              {mode === "binary"
                ? `${fmtDate(c.date)} — ${c.val > 0 ? "tended ✓" : "not tended"}`
                : `${fmtDate(c.date)} — ${Math.round(c.val * 100)}% tended`}
            </title>
          </rect>
        ))}
      </svg>
      {/* Legend only where intensity actually means something */}
      {mode === "intensity" && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 4 }}>
          <span style={{ fontSize: 8.5, color: legendColor, marginRight: 2 }}>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: hc(v) }} />
          ))}
          <span style={{ fontSize: 8.5, color: legendColor, marginLeft: 2 }}>More</span>
        </div>
      )}
    </div>
  );
}
