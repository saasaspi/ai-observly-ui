import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// ── Brand colours ─────────────────────────────────────────────────────────────
const BLUE    = '#2563eb'
const DARK    = '#0f172a'
const MUTED   = '#64748b'
const LIGHT   = '#f8fafc'
const BORDER  = '#e2e8f0'
const WHITE   = '#ffffff'
const RED     = '#ef4444'
const GREEN   = '#16a34a'
const AMBER   = '#d97706'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDollar(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function fmtDate(iso: string) {
  const [, m, d] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:        { backgroundColor: WHITE, padding: 40, fontSize: 10, color: DARK },
  // header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  logo:        { height: 22 },
  headerRight: { alignItems: 'flex-end' },
  reportTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BLUE, marginBottom: 2 },
  reportMeta:  { fontSize: 8, color: MUTED },
  // health
  healthCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 14, marginBottom: 14 },
  healthScore: { fontSize: 40, fontFamily: 'Helvetica-Bold', marginRight: 16 },
  healthLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  healthDesc:  { fontSize: 8, color: MUTED, maxWidth: 340 },
  // stat cards
  statsRow:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard:    { flex: 1, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 10 },
  statLabel:   { fontSize: 7, color: MUTED, textTransform: 'uppercase', marginBottom: 3 },
  statValue:   { fontSize: 17, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  statSub:     { fontSize: 7, color: MUTED },
  // section
  section:     { marginBottom: 14 },
  sectionTitle:{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: BORDER },
  // table
  tableHeader: { flexDirection: 'row', backgroundColor: LIGHT, padding: 6, borderRadius: 4, marginBottom: 3 },
  tableRow:    { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  colModel:    { flex: 3, fontSize: 9 },
  colCost:     { flex: 1, fontSize: 9, textAlign: 'right' },
  colShare:    { flex: 1, fontSize: 9, textAlign: 'right' },
  colModelH:   { flex: 3, fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED },
  colCostH:    { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textAlign: 'right' },
  colShareH:   { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED, textAlign: 'right' },
  // metric row
  metricRow:   { flexDirection: 'row', gap: 8, marginBottom: 14 },
  metricCard:  { flex: 1, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12 },
  metricLabel: { fontSize: 8, color: MUTED, marginBottom: 4 },
  metricValue: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  metricNote:  { fontSize: 7, color: MUTED },
  // spikes
  spikeRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 4, padding: 6, marginBottom: 4 },
  spikeDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginRight: 6 },
  spikeText:   { fontSize: 8 },
  // CTA banner
  ctaBanner:   { backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 14, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ctaText:     { fontSize: 9, color: MUTED, flex: 1, marginRight: 12 },
  ctaLink:     { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BLUE },
  // footer
  footer:      { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  footerLeft:  { fontSize: 7, color: MUTED },
  footerRight: { fontSize: 7, color: BLUE },
})

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
}

// ── PDF Document ──────────────────────────────────────────────────────────────
export function ReportPDF({ report, logoDataUrl, generatedAt }: {
  report: ReportPayload
  logoDataUrl: string
  generatedAt: string
}) {
  const scoreColor = report.healthScore >= 75 ? GREEN : report.healthScore >= 55 ? AMBER : RED

  return (
    <Document title="LLM Spend Analyzer Report" author="AI Observly">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Image src={logoDataUrl} style={s.logo} />
          <View style={s.headerRight}>
            <Text style={s.reportTitle}>LLM Spend Analyzer Report</Text>
            <Text style={s.reportMeta}>
              {fmtDate(report.startDate)} – {fmtDate(report.endDate)} · {report.dayCount} day{report.dayCount !== 1 ? 's' : ''}
            </Text>
            <Text style={s.reportMeta}>Generated {generatedAt}</Text>
          </View>
        </View>

        {/* ── Health Score ── */}
        <View style={s.healthCard}>
          <Text style={[s.healthScore, { color: scoreColor }]}>{report.healthScore}</Text>
          <View>
            <Text style={s.healthLabel}>{report.grade}</Text>
            <Text style={s.healthDesc}>
              Cost Health Score based on cache efficiency, model mix, spend spikes, and cost concentration.
            </Text>
          </View>
        </View>

        {/* ── Key stats ── */}
        <View style={s.statsRow}>
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

        {/* ── Model Breakdown ── */}
        {report.byModel.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Model Breakdown</Text>
            <View style={s.tableHeader}>
              <Text style={s.colModelH}>Model</Text>
              <Text style={s.colCostH}>Cost</Text>
              <Text style={s.colShareH}>Share</Text>
            </View>
            {report.byModel.slice(0, 8).map((m) => (
              <View key={m.model} style={s.tableRow}>
                <Text style={s.colModel}>{m.model.length > 42 ? m.model.slice(0, 40) + '…' : m.model}</Text>
                <Text style={s.colCost}>{fmtDollar(m.cost)}</Text>
                <Text style={s.colShare}>{Math.round(m.share * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Cache + Premium ── */}
        {(report.cacheEfficiency !== null || report.premiumShare !== null) && (
          <View style={s.metricRow}>
            {report.cacheEfficiency !== null && (
              <View style={s.metricCard}>
                <Text style={s.metricLabel}>Cache Efficiency</Text>
                <Text style={[s.metricValue, { color: report.cacheEfficiency < 0.25 ? RED : report.cacheEfficiency < 0.5 ? AMBER : GREEN }]}>
                  {Math.round(report.cacheEfficiency * 100)}%
                </Text>
                <Text style={s.metricNote}>
                  {report.cacheEfficiency < 0.25 ? 'Too low — enable prompt caching to cut costs' : 'Reasonable cache reuse'}
                </Text>
              </View>
            )}
            {report.premiumShare !== null && (
              <View style={s.metricCard}>
                <Text style={s.metricLabel}>Premium Model Share</Text>
                <Text style={[s.metricValue, { color: report.premiumShare > 0.6 ? RED : report.premiumShare > 0.4 ? AMBER : GREEN }]}>
                  {Math.round(report.premiumShare * 100)}%
                </Text>
                <Text style={s.metricNote}>
                  {report.premiumShare > 0.6 ? 'High — consider routing some calls to cheaper models' : 'Premium usage is in a reasonable range'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Spend Spikes ── */}
        {report.spikes.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Spend Spikes Detected ({report.spikes.length})</Text>
            {report.spikes.slice(0, 5).map((spike) => (
              <View key={spike.date} style={s.spikeRow}>
                <View style={s.spikeDot} />
                <Text style={s.spikeText}>{spike.label} — {fmtDollar(spike.cost)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── CTA Banner ── */}
        <View style={s.ctaBanner}>
          <Text style={s.ctaText}>
            This is a one-time snapshot. AI Observly shows these numbers live, broken down by customer, feature, and pricing plan — updating automatically as your product runs.
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
