import {
  Document, Page, Text, View, Image, StyleSheet,
  Svg, Rect, Path, Line, Circle, G,
} from '@react-pdf/renderer'

// ── Brand colours (same as web) ───────────────────────────────────────────────
const BLUE    = '#2563eb'
const PURPLE  = '#7c3aed'
const CYAN    = '#0891b2'
const EMERALD = '#059669'
const AMBER_C = '#d97706'
const RED     = '#ef4444'
const DARK    = '#0f172a'
const MUTED   = '#64748b'
const LIGHT   = '#f8fafc'
const BORDER  = '#e2e8f0'
const WHITE   = '#ffffff'
const GREEN   = '#16a34a'
const AMBER   = '#d97706'

const MODEL_COLORS = [BLUE, PURPLE, CYAN, EMERALD, AMBER_C, RED, '#db2777']

// SVG Text — rendered as text inside Svg context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ST = Text as any

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ReportPayload {
  totalSpend: number
  dayCount: number
  projectedMonth: number | null
  projectedYear: number | null
  healthScore: number
  grade: string
  startDate: string
  endDate: string
  byModel: { model: string; cost: number; share: number }[]
  topModel: { model: string; share: number } | null
  cacheEfficiency: number | null
  premiumShare: number | null
  spikes: { date: string; label: string; cost: number }[]
  keyConc: { topKey: string; share: number } | null
  byDay: { date: string; label: string; cost: number }[]
  chartData: { label: string; cost: number; isSpike: boolean }[]
  isWeekly: boolean
  hasKeyCol: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDollar(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function fmtDate(iso: string) {
  const [, m, d] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number) {
  const o1 = polar(cx, cy, outerR, startDeg)
  const o2 = polar(cx, cy, outerR, endDeg)
  const i1 = polar(cx, cy, innerR, endDeg)
  const i2 = polar(cx, cy, innerR, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function getSpikeDetail(spikes: ReportPayload['spikes'], byDay: ReportPayload['byDay']) {
  return spikes.map(s => {
    const idx = byDay.findIndex(d => d.date === s.date)
    const prev = idx > 0 ? byDay[idx - 1].cost : 0
    const pct = prev > 0 ? Math.round((s.cost / prev - 1) * 100) : 0
    return { ...s, prevCost: prev, pctIncrease: pct }
  })
}

// ── Global styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:         { backgroundColor: WHITE, padding: 40, fontSize: 10, color: DARK, fontFamily: 'Helvetica' },
  // header
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  logo:         { height: 22 },
  reportTitle:  { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BLUE, marginBottom: 2 },
  reportMeta:   { fontSize: 8, color: MUTED },
  // health card
  healthCard:   { flexDirection: 'row', backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 14, marginBottom: 14, alignItems: 'center' },
  healthScore:  { fontSize: 40, fontFamily: 'Helvetica-Bold', marginRight: 16 },
  healthGrade:  { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  healthDesc:   { fontSize: 8, color: MUTED, maxWidth: 380 },
  // stats
  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard:     { flex: 1, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 10 },
  statLabel:    { fontSize: 7, color: MUTED, textTransform: 'uppercase', marginBottom: 3 },
  statValue:    { fontSize: 17, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  statSub:      { fontSize: 7, color: MUTED },
  // section
  section:      { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  sectionSub:   { fontSize: 8, color: MUTED, marginBottom: 8 },
  card:         { backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12, marginBottom: 14 },
  // model table
  tableHeader:  { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: '5 6', borderRadius: 4, marginBottom: 3 },
  tableRow:     { flexDirection: 'row', padding: '5 6', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  colModel:     { flex: 3, fontSize: 9 },
  colCost:      { flex: 1, fontSize: 9, textAlign: 'right' },
  colShare:     { flex: 1, fontSize: 9, textAlign: 'right' },
  colH:         { fontFamily: 'Helvetica-Bold', fontSize: 8, color: MUTED },
  // metric pair
  metricRow:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
  metricCard:   { flex: 1, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12 },
  metricLabel:  { fontSize: 7, color: MUTED, textTransform: 'uppercase', marginBottom: 3 },
  metricValue:  { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  metricStatus: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  metricNote:   { fontSize: 7, color: MUTED, lineHeight: 1.4 },
  // spike
  spikeBadge:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 4, padding: '5 8', marginBottom: 4 },
  spikeDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginRight: 6 },
  spikeText:    { fontSize: 8, flex: 1 },
  spikePct:     { fontSize: 8, fontFamily: 'Helvetica-Bold', color: RED },
  // concentration bar
  barTrack:     { height: 8, borderRadius: 4, backgroundColor: '#e2e8f0', overflow: 'hidden', marginBottom: 4 },
  barFill:      { height: 8, borderRadius: 4 },
  // CTA
  ctaBanner:    { backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 14, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ctaText:      { fontSize: 9, color: MUTED, flex: 1, marginRight: 12 },
  ctaLink:      { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BLUE },
  // footer
  footer:       { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  footerLeft:   { fontSize: 7, color: MUTED },
  footerRight:  { fontSize: 7, color: BLUE },
})

// ── Chart: Spend over time (bar chart) ────────────────────────────────────────
function SpendBarChart({ data }: { data: { label: string; cost: number; isSpike: boolean }[] }) {
  const W = 515, H = 160
  const padL = 48, padR = 8, padT = 8, padB = 24
  const cW = W - padL - padR
  const cH = H - padT - padB
  const max = Math.max(...data.map(d => d.cost), 0.01)
  const n = data.length
  const spacing = cW / n
  const barW = Math.max(4, spacing * 0.7)

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ frac: t, y: padT + cH * (1 - t) }))

  // Label indices: show at most 7 evenly spaced
  const labelStep = n <= 7 ? 1 : Math.ceil(n / 7)
  const labelIndices = data.map((_, i) => i).filter(i => i % labelStep === 0 || i === n - 1)

  return (
    <Svg width={W} height={H}>
      {/* grid lines */}
      {yTicks.map((t, i) => (
        <G key={i}>
          <Line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="#f1f5f9" strokeWidth={1} />
          <ST x={padL - 4} y={t.y + 3} fontSize={7} fill={MUTED} textAnchor="end">
            ${(t.frac * max).toFixed(0)}
          </ST>
        </G>
      ))}
      {/* bars */}
      {data.map((d, i) => {
        const barH = (d.cost / max) * cH
        const x = padL + i * spacing + (spacing - barW) / 2
        const y = padT + cH - barH
        return <Rect key={i} x={x} y={y} width={barW} height={barH} fill={d.isSpike ? RED : BLUE} rx={2} />
      })}
      {/* x-axis labels */}
      {labelIndices.map(i => {
        const x = padL + i * spacing + spacing / 2
        return (
          <ST key={i} x={x} y={H - 4} fontSize={7} fill={MUTED} textAnchor="middle">
            {data[i].label}
          </ST>
        )
      })}
    </Svg>
  )
}

// ── Chart: Daily cost rhythm (line + area) ────────────────────────────────────
function DailyLineChart({ byDay, spikeDates }: {
  byDay: { date: string; label: string; cost: number }[]
  spikeDates: Set<string>
}) {
  const W = 515, H = 150
  const padL = 48, padR = 8, padT = 8, padB = 24
  const cW = W - padL - padR
  const cH = H - padT - padB
  const max = Math.max(...byDay.map(d => d.cost), 0.01)
  const baseY = padT + cH

  const pts = byDay.map((d, i) => ({
    x: padL + (byDay.length > 1 ? (i / (byDay.length - 1)) * cW : cW / 2),
    y: padT + cH - (d.cost / max) * cH,
    date: d.date,
    label: d.label,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath2 = [
    ...pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)} ${baseY.toFixed(1)}`,
    `L ${pts[0].x.toFixed(1)} ${baseY.toFixed(1)}`,
    'Z',
  ].join(' ')

  const yTicks = [0, 0.5, 1].map(t => ({ frac: t, y: padT + cH * (1 - t) }))
  const labelStep = byDay.length <= 7 ? 1 : Math.ceil(byDay.length / 7)
  const labelIndices = pts.map((_, i) => i).filter(i => i % labelStep === 0 || i === pts.length - 1)

  return (
    <Svg width={W} height={H}>
      {yTicks.map((t, i) => (
        <G key={i}>
          <Line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="#f1f5f9" strokeWidth={1} />
          <ST x={padL - 4} y={t.y + 3} fontSize={7} fill={MUTED} textAnchor="end">
            ${(t.frac * max).toFixed(0)}
          </ST>
        </G>
      ))}
      {/* area fill */}
      <Path d={areaPath2} fill={BLUE} fillOpacity={0.08} />
      {/* line */}
      <Path d={linePath} stroke={BLUE} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* spike dots */}
      {pts.filter(p => spikeDates.has(p.date)).map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={5} fill={RED} stroke={WHITE} strokeWidth={1.5} />
      ))}
      {/* x-axis labels */}
      {labelIndices.map(i => (
        <ST key={i} x={pts[i].x} y={H - 4} fontSize={7} fill={MUTED} textAnchor="middle">
          {byDay[i].label}
        </ST>
      ))}
    </Svg>
  )
}

// ── Chart: Model donut ─────────────────────────────────────────────────────────
function ModelDonut({ byModel }: { byModel: { model: string; cost: number; share: number }[] }) {
  const cx = 60, cy = 60, outerR = 52, innerR = 30
  const segments = byModel.slice(0, 7)
  let angle = 0

  return (
    <Svg width={120} height={120}>
      {segments.map((m, i) => {
        const deg = m.share * 360
        const start = angle
        const end = angle + deg - (deg > 5 ? 2 : 0)
        angle += deg
        return (
          <Path
            key={i}
            d={arcPath(cx, cy, outerR, innerR, start, end)}
            fill={MODEL_COLORS[i % MODEL_COLORS.length]}
          />
        )
      })}
    </Svg>
  )
}

// ── Chart: Mini donut (for premium share) ────────────────────────────────────
function MiniDonut({ pct, color }: { pct: number; color: string }) {
  const cx = 30, cy = 30, outerR = 25, innerR = 15
  const end = pct * 3.59  // 0-359 to avoid full circle bug
  return (
    <Svg width={60} height={60}>
      <Path d={arcPath(cx, cy, outerR, innerR, 0, 359)} fill="#f1f5f9" />
      {pct > 0 && <Path d={arcPath(cx, cy, outerR, innerR, 0, end)} fill={color} />}
    </Svg>
  )
}

// ── Chart: Horizontal mini bar ────────────────────────────────────────────────
function HBar({ pct, color, w = 220 }: { pct: number; color: string; w?: number }) {
  return (
    <Svg width={w} height={10}>
      <Rect x={0} y={1} width={w} height={8} fill="#e2e8f0" rx={4} />
      <Rect x={0} y={1} width={Math.max(4, (pct / 100) * w)} height={8} fill={color} rx={4} />
    </Svg>
  )
}

// ── PDF Document ──────────────────────────────────────────────────────────────
export function ReportPDF({ report, logoDataUrl, generatedAt }: {
  report: ReportPayload
  logoDataUrl: string
  generatedAt: string
}) {
  const scoreColor = report.healthScore >= 75 ? GREEN : report.healthScore >= 55 ? AMBER : RED
  const spikeDates = new Set(report.spikes.map(s => s.date))
  const spikeDetail = getSpikeDetail(report.spikes, report.byDay)

  return (
    <Document title="LLM Spend Analyzer Report" author="AI Observly">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          {logoDataUrl ? <Image src={logoDataUrl} style={s.logo} /> : <Text style={s.reportTitle}>AI Observly</Text>}
          <View>
            <Text style={s.reportTitle}>LLM Spend Analyzer Report</Text>
            <Text style={s.reportMeta}>
              {fmtDate(report.startDate)} – {fmtDate(report.endDate)} · {report.dayCount} day{report.dayCount !== 1 ? 's' : ''}
            </Text>
            <Text style={s.reportMeta}>Generated {generatedAt}</Text>
          </View>
        </View>

        {/* ── 1. Health Score ── */}
        <View style={s.healthCard} wrap={false}>
          <Text style={[s.healthScore, { color: scoreColor }]}>{report.healthScore}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.healthGrade}>{report.grade}</Text>
            <Text style={s.healthDesc}>
              Cost Health Score based on cache efficiency, model mix, spend spikes, and cost concentration.
              Each factor contributes to how well your AI spend is under control.
            </Text>
          </View>
        </View>

        {/* ── 2. Top stat row ── */}
        <View style={s.statsRow} wrap={false}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Total Spend</Text>
            <Text style={s.statValue}>{fmtDollar(report.totalSpend)}</Text>
            <Text style={s.statSub}>across {report.dayCount} days</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Projected Monthly</Text>
            <Text style={s.statValue}>{report.projectedMonth ? fmtDollar(report.projectedMonth) : '—'}</Text>
            <Text style={s.statSub}>{report.projectedMonth ? 'at current daily pace' : 'need ≥3 days'}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Projected Annual</Text>
            <Text style={s.statValue}>{report.projectedYear ? fmtDollar(report.projectedYear) : '—'}</Text>
            <Text style={s.statSub}>{report.projectedYear ? 'if nothing changes' : 'need ≥3 days'}</Text>
          </View>
        </View>

        {/* ── 3. Spend over time ── */}
        {report.chartData.length > 0 && (
          <View style={[s.card, { paddingBottom: 8 }]} wrap={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <View>
                <Text style={s.sectionTitle}>Spend over time</Text>
                <Text style={s.sectionSub}>{report.isWeekly ? 'Grouped by week — 30+ days of data' : 'Daily spend across your data range'}</Text>
              </View>
              {report.spikes.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 4, padding: '3 6' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginRight: 4 }} />
                  <Text style={{ fontSize: 7, color: RED, fontFamily: 'Helvetica-Bold' }}>
                    {report.spikes.length} spike{report.spikes.length > 1 ? 's' : ''} detected
                  </Text>
                </View>
              )}
            </View>
            <SpendBarChart data={report.chartData} />
            {report.spikes.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginRight: 4 }} />
                <Text style={{ fontSize: 7, color: MUTED }}>
                  Red bars mark {report.isWeekly ? 'weeks' : 'days'} where spend jumped more than 50% over the previous day
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── 4. Daily cost rhythm (only if ≥7 days) ── */}
        {report.byDay.length >= 7 && (
          <View style={[s.card, { paddingBottom: 8 }]} wrap={false}>
            <Text style={s.sectionTitle}>Daily cost rhythm</Text>
            <Text style={s.sectionSub}>How your spend flows day-by-day — flat lines mean predictable costs, sharp peaks mean surprises.</Text>
            <DailyLineChart byDay={report.byDay} spikeDates={spikeDates} />
            {report.spikes.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginRight: 4 }} />
                <Text style={{ fontSize: 7, color: MUTED }}>Red dots mark spend spike days</Text>
              </View>
            )}
          </View>
        )}

        {/* ── 5. Model breakdown ── */}
        {report.byModel.length > 0 && (
          <View style={s.card} wrap={false}>
            <Text style={s.sectionTitle}>Where your money&apos;s going</Text>
            <Text style={s.sectionSub}>Cost breakdown by model — which AI is driving your bill.</Text>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              {/* Donut */}
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <ModelDonut byModel={report.byModel} />
              </View>
              {/* Table */}
              <View style={{ flex: 1 }}>
                <View style={s.tableHeader}>
                  <Text style={[s.colH, { flex: 3 }]}>Model</Text>
                  <Text style={[s.colH, { flex: 1, textAlign: 'right' }]}>Cost</Text>
                  <Text style={[s.colH, { flex: 1, textAlign: 'right' }]}>Share</Text>
                </View>
                {report.byModel.slice(0, 8).map((m, i) => (
                  <View key={m.model} style={s.tableRow}>
                    <View style={{ flex: 3 }}>
                      <Text style={{ fontSize: 8 }}>{m.model.length > 28 ? m.model.slice(0, 26) + '…' : m.model}</Text>
                      {/* mini progress bar */}
                      <View style={{ marginTop: 2, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', overflow: 'hidden', width: '90%' }}>
                        <View style={{ height: 4, borderRadius: 2, width: `${Math.round(m.share * 100)}%`, backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }} />
                      </View>
                    </View>
                    <Text style={[s.colCost, { fontSize: 8 }]}>{fmtDollar(m.cost)}</Text>
                    <Text style={[s.colShare, { fontSize: 8, fontFamily: 'Helvetica-Bold' }]}>{Math.round(m.share * 100)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── 5b. Biggest cost driver ── */}
        {report.topModel && (
          <View style={s.card} wrap={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path d="M2 12 L6 7 L10 9 L14 3" stroke={BLUE} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M11 3 L14 3 L14 6" stroke={BLUE} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>Biggest cost driver</Text>
                <Text style={{ fontSize: 8, color: MUTED }}>Top model by spend share</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold' }}>{Math.round(report.topModel.share * 100)}%</Text>
              <Text style={{ fontSize: 9, color: MUTED }}>{report.topModel.model}</Text>
            </View>
            <Text style={{ fontSize: 8, color: MUTED, lineHeight: 1.4 }}>
              {report.topModel.model} accounts for {Math.round(report.topModel.share * 100)}% of your total AI spend. If you can reduce calls to this model, route eligible requests to a cheaper alternative, or cache frequent responses, the savings will be proportional to its share.
            </Text>
          </View>
        )}

        {/* ── 6. Cache efficiency + Premium model share ── */}
        {(report.cacheEfficiency !== null || report.premiumShare !== null) && (
          <View style={s.metricRow} wrap={false}>
            {report.cacheEfficiency !== null && (() => {
              const pct = Math.round(report.cacheEfficiency! * 100)
              const color = report.cacheEfficiency! < 0.25 ? RED : report.cacheEfficiency! < 0.5 ? AMBER : GREEN
              const status = report.cacheEfficiency! < 0.25 ? 'Too low' : report.cacheEfficiency! < 0.5 ? 'Fair' : 'Good'
              return (
                <View style={s.metricCard}>
                  <Text style={s.metricLabel}>Cache Efficiency</Text>
                  <Text style={[s.metricValue, { color }]}>{pct}%</Text>
                  <Text style={[s.metricStatus, { color }]}>{status}</Text>
                  {/* cached vs fresh bar */}
                  <View style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 7, color: MUTED }}>Cached</Text>
                      <Text style={{ fontSize: 7, color: MUTED }}>Fresh</Text>
                    </View>
                    <HBar pct={pct} color={BLUE} w={200} />
                  </View>
                  <Text style={s.metricNote}>
                    {report.cacheEfficiency! < 0.25
                      ? 'Low cache reuse — enabling prompt caching could cut input costs by 50–90%.'
                      : 'Reasonable cache reuse — you\'re not rebuilding context from scratch every time.'}
                  </Text>
                </View>
              )
            })()}
            {report.premiumShare !== null && (() => {
              const pct = Math.round(report.premiumShare! * 100)
              const color = report.premiumShare! > 0.6 ? RED : report.premiumShare! > 0.4 ? AMBER : GREEN
              const status = report.premiumShare! > 0.6 ? 'High' : report.premiumShare! > 0.4 ? 'Moderate' : 'Controlled'
              return (
                <View style={s.metricCard}>
                  <Text style={s.metricLabel}>Premium Model Share</Text>
                  <Text style={[s.metricValue, { color }]}>{pct}%</Text>
                  <Text style={[s.metricStatus, { color }]}>{status}</Text>
                  <View style={{ alignItems: 'center', marginBottom: 4 }}>
                    <MiniDonut pct={pct} color={color} />
                  </View>
                  <Text style={s.metricNote}>
                    {report.premiumShare! > 0.6
                      ? 'Over half your cost is from top-tier models. Some of these calls might work with a cheaper alternative.'
                      : 'Premium model usage is in a reasonable range — most spend is on cost-effective models.'}
                  </Text>
                </View>
              )
            })()}
          </View>
        )}

        {/* ── 7. Spend spike detail ── */}
        {report.byDay.length >= 3 && (
          <View style={s.card} wrap={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: spikeDetail.length > 0 ? RED : GREEN, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>
                  {spikeDetail.length > 0
                    ? `${spikeDetail.length} spend spike${spikeDetail.length > 1 ? 's' : ''} detected`
                    : 'No spend spikes'}
                </Text>
                <Text style={{ fontSize: 8, color: MUTED }}>Days where cost jumped more than 50% over the previous day</Text>
              </View>
            </View>
            {spikeDetail.length > 0 ? (
              spikeDetail.map(s2 => (
                <View key={s2.date} style={s.spikeBadge}>
                  <View style={s.spikeDot} />
                  <Text style={[s.spikeText, { fontFamily: 'Helvetica-Bold' }]}>{s2.label}</Text>
                  <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: RED, flexShrink: 0 }}>
                    +{s2.pctIncrease}% ({fmtDollar(s2.cost)} vs {fmtDollar(s2.prevCost)})
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 4, padding: '6 10' }}>
                <Text style={{ fontSize: 8, color: '#15803d' }}>
                  Your spend was consistent — no day jumped more than 50% above the previous one.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── 8. API key / project concentration ── */}
        {report.hasKeyCol && (
          <View style={s.card} wrap={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#eab308', marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>API key concentration</Text>
                <Text style={{ fontSize: 8, color: MUTED }}>How spend is distributed across keys / projects</Text>
              </View>
            </View>
            {report.keyConc ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold' }}>{Math.round(report.keyConc.share * 100)}%</Text>
                  <Text style={{ fontSize: 9, color: MUTED }}>from &quot;{report.keyConc.topKey}&quot;</Text>
                </View>
                {/* concentration bar */}
                <HBar pct={Math.round(report.keyConc.share * 100)} color="#eab308" w={435} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 6 }}>
                  <Text style={{ fontSize: 7, color: MUTED }}>&quot;{report.keyConc.topKey}&quot; — {Math.round(report.keyConc.share * 100)}%</Text>
                  <Text style={{ fontSize: 7, color: MUTED }}>Other keys — {Math.round((1 - report.keyConc.share) * 100)}%</Text>
                </View>
                <Text style={{ fontSize: 8, color: MUTED, lineHeight: 1.4 }}>
                  {report.keyConc.share > 0.80
                    ? `Almost all your spend flows through a single key. You can't tell which customer, feature, or workflow the remaining ${Math.round((1 - report.keyConc.share) * 100)}% belongs to.`
                    : `Most spend is concentrated in one key. This limits visibility into which parts of your product are actually driving cost.`}
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: 8, color: MUTED, lineHeight: 1.4 }}>
                Your billing export has a single API key — there&apos;s no way to tell which customer, feature, or workflow is driving cost from this file alone.
              </Text>
            )}
          </View>
        )}

        {/* ── CTA Banner ── */}
        <View style={s.ctaBanner}>
          <Text style={s.ctaText}>
            This is a one-time snapshot. AI Observly shows these numbers live — broken down by customer, feature, and pricing plan — updating automatically as your product runs.
          </Text>
          <Text style={s.ctaLink}>aiobservly.com/pricing</Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>Generated by AI Observly — aiobservly.com</Text>
          <Text style={s.footerRight}>Want to track this automatically? Visit aiobservly.com</Text>
        </View>

      </Page>
    </Document>
  )
}
