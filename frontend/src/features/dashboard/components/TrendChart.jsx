import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ISSUE_TYPES } from "../../../config/domain";

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="flex items-center gap-2 text-slate-600">
          <span className="size-2 rounded-sm" style={{ background: item.color }} />
          {ISSUE_TYPES[item.dataKey].plural}
          <span className="ml-auto pl-4 font-semibold text-ink tabular-nums">{item.value}</span>
        </p>
      ))}
      <p className="mt-1 border-t border-line pt-1 text-mute">
        Total <span className="float-right font-semibold text-ink">{total}</span>
      </p>
    </div>
  );
}

export default function TrendChart({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="#eef2f6" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} interval="preserveStartEnd" minTickGap={16} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Legend
            iconType="square"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "#475569", paddingTop: 8 }}
            formatter={(key) => <span className="text-slate-600">{ISSUE_TYPES[key].plural}</span>}
          />
          <Bar dataKey="POTHOLE" stackId="type" fill={ISSUE_TYPES.POTHOLE.color} stroke="#fff" strokeWidth={1} maxBarSize={28} />
          <Bar dataKey="GARBAGE" stackId="type" fill={ISSUE_TYPES.GARBAGE.color} stroke="#fff" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
