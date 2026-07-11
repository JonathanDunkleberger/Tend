"use client";

import { useMemo } from "react";
import { daysAgo, today } from "@/lib/utils";
import type { HabitWithStats } from "@/types";
import type { ThemeColors } from "@/lib/constants";

interface MultiHabitHeatmapProps {
  habits: HabitWithStats[];
  isDone: (id: string, date: string) => boolean;
  getCleanDays?: (id: string) => number;
  th: ThemeColors;
}

export function MultiHabitHeatmap({ habits, isDone, getCleanDays, th }: MultiHabitHeatmapProps) {
  const weeks = 12;
  const cellSize = 8;
  const cellGap = 2;
  const totalDays = weeks * 7;

  const rows = useMemo(() => {
    return habits.map((h) => {
      const isQuit = h.category === "quit";
      const cleanDays = isQuit && getCleanDays ? getCleanDays(h.id) : 0;
      const days: { date: string; done: boolean; isToday: boolean; isFuture: boolean }[] = [];

      const todayStr = today();
      for (let i = totalDays - 1; i >= 0; i--) {
        const date = daysAgo(i);
        // Compare LOCAL date strings, not a noon-anchored timestamp vs the clock —
        // the old `new Date(date+"T12:00:00") > new Date()` marked today's cell
        // "future" (rendered transparent) whenever the app was opened before noon.
        const isFuture = date > todayStr;
        const isToday = i === 0;
        let done = false;

        if (isQuit) {
          done = cleanDays > i;
        } else {
          done = isDone(h.id, date);
        }

        days.push({ date, done, isToday, isFuture });
      }

      const abbr = h.name.length > 5 ? h.name.slice(0, 5) : h.name;
      return { habit: h, days, abbr };
    });
  }, [habits, isDone, getCleanDays, totalDays]);

  if (habits.length === 0) return null;

  const cr = (hex: string) => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return { r: 76, g: 175, b: 80 };
    return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
  };

  return (
    <div className="cd" style={{
      padding: "14px 12px", marginBottom: 10,
      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
        textTransform: "uppercase" as const, color: "rgba(255,255,255,0.25)",
        marginBottom: 10, paddingLeft: 2,
      }}>
        All Habits
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(({ habit, days, abbr }) => {
          const { r, g, b } = cr(habit.color);
          return (
            <div key={habit.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Label */}
              <div style={{
                width: 40, flexShrink: 0, display: "flex", alignItems: "center", gap: 4,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: habit.color, flexShrink: 0,
                }} />
                <div style={{
                  fontSize: 9, fontWeight: 600, color: habit.color,
                  lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {abbr}
                </div>
              </div>
              {/* Horizontal grid: oldest → today (left → right) */}
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${totalDays}, ${cellSize}px)`,
                gridTemplateRows: `${cellSize}px`,
                gap: cellGap,
                overflowX: "hidden",
                flex: 1,
                direction: "rtl",
              }}>
                {/* Render reversed so RTL direction shows today on right */}
                {[...days].reverse().map((d, i) => (
                  <div
                    key={i}
                    style={{
                      width: cellSize, height: cellSize, borderRadius: 2,
                      background: d.isFuture
                        ? "transparent"
                        : d.done
                          ? `rgba(${r},${g},${b},1)`
                          : `rgba(${r},${g},${b},0.08)`,
                      border: d.isToday ? `1px solid ${habit.color}` : "none",
                      boxSizing: "border-box" as const,
                    }}
                    title={`${d.date}: ${d.done ? "✓" : "—"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
