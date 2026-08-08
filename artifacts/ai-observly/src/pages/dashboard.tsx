import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { 
  useDashboardSummary, 
  useCustomers, 
  useFeatureBreakdown,
  useTechnicalDetails
} from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

// Helper for formatting currency
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mock data generator for trend charts
const generateMockTrendData = (baseCost: number) => {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  return months.map((month, i) => {
    // Generate a trend line that generally goes up but has some randomness
    const variance = (Math.random() * 0.4) - 0.2; // +/- 20%
    const trendFactor = 0.5 + (i * 0.1); // 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
    const value = Math.max(0, Math.round(baseCost * trendFactor * (1 + variance)));
    return { month, cost: value === 0 ? baseCost * 0.1 : value };
  });
};

function TechnicalDetailsCell({ id, type, isEnabled }: { id: string, type: 'customer' | 'feature', isEnabled: boolean }) {
  const { data, isLoading } = useTechnicalDetails(id, isEnabled);

  if (!isEnabled) return null;
  if (isLoading) return <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>;
  if (!data) return <td className="py-4 px-4 text-muted-foreground">-</td>;

  return (
    <>
      <td className="py-4 px-4 text-sm font-mono text-muted-foreground whitespace-nowrap">
        {(data.tokens / 1000).toFixed(1)}k
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-1 flex-wrap">
          {data.models.map(m => (
            <span key={m} className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">
              {m.replace('gpt-', '')}
            </span>
          ))}
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-right text-muted-foreground">
        {data.requestCount}
      </td>
    </>
  );
}

function TrendChart({ data }: { data: any[] }) {
  return (
    <div className="h-[200px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(val) => '$' + val}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            formatter={(value: number) => [`$${value}`, 'Cost']}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="cost" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCost)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: features, isLoading: loadingFeatures } = useFeatureBreakdown();
  
  const [showTechnical, setShowTechnical] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Determine if it's an empty state
  const isEmptyState = summary && summary.totalRevenue === 0 && summary.totalCost === 0;

  if (isEmptyState) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-outfit mb-3">Start tracking your AI costs</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Connect your app and add your first customers and features in Settings to see your real numbers here.
          </p>
          <Link 
            href="/settings" 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
            data-testid="btn-start-setup"
          >
            Go to Settings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Pre-sort snapshots
  const topRiskCustomers = [...(customers || [])].sort((a, b) => a.margin - b.margin).slice(0, 3);
  const topFeatures = [...(features || [])].sort((a, b) => a.roi - b.roi).slice(0, 3);
  
  // Sort full tables
  const sortedCustomers = [...(customers || [])].sort((a, b) => a.margin - b.margin);
  const sortedFeatures = [...(features || [])].sort((a, b) => a.roi - b.roi);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-outfit">Dashboard</h1>
        
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-full shadow-sm">
          <Switch 
            id="technical-toggle"
            checked={showTechnical}
            onCheckedChange={setShowTechnical}
            data-testid="toggle-technical"
          />
          <label htmlFor="technical-toggle" className="text-sm font-medium cursor-pointer text-foreground">
            Show technical details
          </label>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 p-1 bg-muted/50 w-full sm:w-auto overflow-x-auto justify-start h-12">
          <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2 font-medium">Overview</TabsTrigger>
          <TabsTrigger value="customers" className="px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2 font-medium">Customers</TabsTrigger>
          <TabsTrigger value="features" className="px-6 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2 font-medium">Features</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total AI Cost</p>
              {loadingSummary ? (
                <Skeleton className="h-10 w-32 mt-2" />
              ) : (
                <div className="text-3xl md:text-4xl font-bold font-outfit text-foreground mt-2">
                  {formatMoney(summary?.totalCost || 0)}
                </div>
              )}
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total Revenue</p>
              {loadingSummary ? (
                <Skeleton className="h-10 w-32 mt-2" />
              ) : (
                <div className="text-3xl md:text-4xl font-bold font-outfit text-foreground mt-2">
                  {formatMoney(summary?.totalRevenue || 0)}
                </div>
              )}
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Net Profit</p>
              {loadingSummary ? (
                <Skeleton className="h-10 w-32 mt-2" />
              ) : (
                <div className={`text-3xl md:text-4xl font-bold font-outfit flex items-center gap-2 mt-2 ${(summary?.totalProfit || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {formatMoney(summary?.totalProfit || 0)}
                  {(summary?.totalProfit || 0) >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Snapshot: Customers */}
            <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-bold font-outfit text-lg">Top Customers at Risk</h2>
                <button onClick={() => setActiveTab("customers")} className="text-sm text-primary font-medium hover:underline" data-testid="link-view-all-customers">
                  View all →
                </button>
              </div>
              <div className="p-0 overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Cost</th>
                      <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingCustomers ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={3} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>
                      ))
                    ) : (
                      topRiskCustomers.map(customer => (
                        <tr key={customer.id}>
                          <td className="py-4 px-6 font-medium flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              customer.status === 'green' ? 'bg-green-500' : 
                              customer.status === 'yellow' ? 'bg-yellow-500' : 'bg-destructive'
                            }`} />
                            {customer.name}
                          </td>
                          <td className="py-4 px-6 text-right text-muted-foreground font-medium">{formatMoney(customer.cost)}</td>
                          <td className={`py-4 px-6 text-right font-bold ${customer.margin >= 0 ? "text-green-600" : "text-destructive"}`}>
                            {customer.margin > 0 ? "+" : ""}{formatMoney(customer.margin)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Snapshot: Features */}
            <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-bold font-outfit text-lg">Feature ROI Summary</h2>
                <button onClick={() => setActiveTab("features")} className="text-sm text-primary font-medium hover:underline" data-testid="link-view-all-features">
                  View all →
                </button>
              </div>
              <div className="p-0 overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
                      <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Cost</th>
                      <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingFeatures ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={3} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>
                      ))
                    ) : (
                      topFeatures.map(feature => (
                        <tr key={feature.name}>
                          <td className="py-4 px-6 font-medium">{feature.name}</td>
                          <td className="py-4 px-6 text-right text-muted-foreground font-medium">{formatMoney(feature.cost)}</td>
                          <td className={`py-4 px-6 text-right font-bold ${feature.roi >= 0 ? "text-green-600" : "text-destructive"}`}>
                            {feature.roi > 0 ? "+" : ""}{formatMoney(feature.roi)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="animate-in fade-in duration-500">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
              <h2 className="font-bold font-outfit text-xl">Your Customers</h2>
              <button 
                onClick={() => alert("Customer management coming soon")}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Add Customer
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Cost</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Revenue</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Margin</th>
                    {showTechnical && (
                      <>
                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens</th>
                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Models</th>
                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Reqs</th>
                      </>
                    )}
                    <th className="py-4 px-6 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingCustomers ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan={showTechnical ? 8 : 5} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : (
                    sortedCustomers.map(customer => {
                      const isExpanded = expandedCustomer === customer.id;
                      return (
                        <React.Fragment key={customer.id}>
                          <tr 
                            className="hover:bg-muted/20 transition-colors cursor-pointer" 
                            onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                          >
                            <td className="py-4 px-6 font-medium flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                customer.status === 'green' ? 'bg-green-500' : 
                                customer.status === 'yellow' ? 'bg-yellow-500' : 'bg-destructive'
                              }`} />
                              {customer.name}
                            </td>
                            <td className="py-4 px-6 text-right text-muted-foreground font-medium">{formatMoney(customer.cost)}</td>
                            <td className="py-4 px-6 text-right font-medium">{formatMoney(customer.revenue)}</td>
                            <td className={`py-4 px-6 text-right font-bold ${customer.margin >= 0 ? "text-green-600" : "text-destructive"}`}>
                              {customer.margin > 0 ? "+" : ""}{formatMoney(customer.margin)}
                            </td>
                            <TechnicalDetailsCell id={customer.id} type="customer" isEnabled={showTechnical} />
                            <td className="py-4 px-6 text-muted-foreground">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-muted/10 border-b-2 border-border/50">
                              <td colSpan={showTechnical ? 8 : 5} className="px-6 py-8">
                                <div className="max-w-4xl mx-auto">
                                  <h4 className="text-sm font-semibold mb-4 text-foreground">Cost Trend (6 months)</h4>
                                  <TrendChart data={generateMockTrendData(customer.cost)} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* FEATURES TAB */}
        <TabsContent value="features" className="animate-in fade-in duration-500">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b border-border bg-muted/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="font-bold font-outfit text-xl">Feature Breakdown</h2>
              <span className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                Revenue allocation is estimated
              </span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Cost <span className="block text-[10px] text-muted-foreground/70 normal-case mt-0.5">Actual</span>
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Revenue <span className="block text-[10px] text-muted-foreground/70 normal-case mt-0.5">Estimate</span>
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">ROI</th>
                    {showTechnical && (
                      <>
                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Tokens</th>
                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Models</th>
                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right mt-0.5">Reqs</th>
                      </>
                    )}
                    <th className="py-4 px-6 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingFeatures ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan={showTechnical ? 8 : 5} className="p-4"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : (
                    sortedFeatures.map(feature => {
                      const isExpanded = expandedFeature === feature.name;
                      return (
                        <React.Fragment key={feature.name}>
                          <tr 
                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setExpandedFeature(isExpanded ? null : feature.name)}
                          >
                            <td className="py-4 px-6 font-medium text-foreground">{feature.name}</td>
                            <td className="py-4 px-6 text-right text-muted-foreground font-medium">{formatMoney(feature.cost)}</td>
                            <td className="py-4 px-6 text-right font-medium">{formatMoney(feature.revenueEstimate)}</td>
                            <td className={`py-4 px-6 text-right font-bold ${feature.roi >= 0 ? "text-green-600" : "text-destructive"}`}>
                              {feature.roi > 0 ? "+" : ""}{formatMoney(feature.roi)}
                            </td>
                            <TechnicalDetailsCell id={feature.name} type="feature" isEnabled={showTechnical} />
                            <td className="py-4 px-6 text-muted-foreground">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-muted/10 border-b-2 border-border/50">
                              <td colSpan={showTechnical ? 8 : 5} className="px-6 py-8">
                                <div className="max-w-4xl mx-auto">
                                  <h4 className="text-sm font-semibold mb-4 text-foreground">Cost Trend (6 months)</h4>
                                  <TrendChart data={generateMockTrendData(feature.cost)} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-muted/20 p-5 border-t border-border mt-auto">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Estimated revenue allocation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Revenue is currently split evenly across features included in the customer's plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}