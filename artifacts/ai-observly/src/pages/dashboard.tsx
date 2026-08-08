import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { 
  useDashboardSummary, 
  useCustomers, 
  useFeatureBreakdown,
  useTechnicalDetails
} from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ArrowUpRight, ArrowDownRight, Layers, Fingerprint, Activity } from "lucide-react";
import { Link } from "wouter";

// Helper for formatting currency
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Component for Technical Details cell
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
            <span key={m} className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
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

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary, error: errorSummary } = useDashboardSummary();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: features, isLoading: loadingFeatures } = useFeatureBreakdown();
  
  const [showTechnical, setShowTechnical] = useState(false);

  // Determine if it's an empty state (no data returned at all, or all zeros)
  const isEmptyState = summary && summary.totalRevenue === 0 && summary.totalCost === 0;

  if (isEmptyState) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-outfit mb-3">No data yet</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Connect your AI provider and Stripe to see your real numbers here.
          </p>
          <Link 
            href="/onboarding" 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="btn-start-setup"
          >
            Start setup
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-outfit">Overview</h1>
        
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
          <Switch 
            id="technical-toggle"
            checked={showTechnical}
            onCheckedChange={setShowTechnical}
            data-testid="toggle-technical"
          />
          <label htmlFor="technical-toggle" className="text-sm font-medium cursor-pointer text-muted-foreground">
            Show technical details
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue (this month)</p>
          {loadingSummary ? (
            <Skeleton className="h-10 w-32 mt-2" />
          ) : (
            <div className="text-3xl md:text-4xl font-bold font-outfit">
              {formatMoney(summary?.totalRevenue || 0)}
            </div>
          )}
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total AI Cost (this month)</p>
          {loadingSummary ? (
            <Skeleton className="h-10 w-32 mt-2" />
          ) : (
            <div className="text-3xl md:text-4xl font-bold font-outfit">
              {formatMoney(summary?.totalCost || 0)}
            </div>
          )}
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Profit</p>
          {loadingSummary ? (
            <Skeleton className="h-10 w-32 mt-2" />
          ) : (
            <div className={`text-3xl md:text-4xl font-bold font-outfit flex items-center gap-2 ${(summary?.totalProfit || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatMoney(summary?.totalProfit || 0)}
              {(summary?.totalProfit || 0) >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Customers Table */}
        <div>
          <h2 className="text-xl font-bold font-outfit mb-4">Your Customers</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Cost</th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Revenue</th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Margin</th>
                    {showTechnical && (
                      <>
                        <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tokens</th>
                        <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Models</th>
                        <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Reqs</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingCustomers ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-32" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                        {showTechnical && <TechnicalDetailsCell id={`skel-${i}`} type="customer" isEnabled={showTechnical} />}
                      </tr>
                    ))
                  ) : (
                    customers?.map(customer => (
                      <tr key={customer.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-customer-${customer.id}`}>
                        <td className="py-4 px-4 font-medium flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            customer.status === 'green' ? 'bg-green-500' : 
                            customer.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {customer.name}
                        </td>
                        <td className="py-4 px-4 text-right text-muted-foreground">{formatMoney(customer.cost)}</td>
                        <td className="py-4 px-4 text-right">{formatMoney(customer.revenue)}</td>
                        <td className={`py-4 px-4 text-right font-medium ${customer.margin >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {customer.margin > 0 ? "+" : ""}{formatMoney(customer.margin)}
                        </td>
                        <TechnicalDetailsCell id={customer.id} type="customer" isEnabled={showTechnical} />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Features Table */}
        <div>
          <h2 className="text-xl font-bold font-outfit mb-4">Cost & ROI by Feature</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Feature</th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right group">
                      Cost <span className="block text-[10px] text-muted-foreground/70 font-normal normal-case">Actual</span>
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Revenue <span className="block text-[10px] text-muted-foreground/70 font-normal normal-case">Estimate</span>
                    </th>
                    <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">ROI</th>
                    {showTechnical && (
                      <>
                        <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tokens</th>
                        <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Models</th>
                        <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Reqs</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingFeatures ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-32" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-5 w-16 ml-auto" /></td>
                        {showTechnical && <TechnicalDetailsCell id={`skel-f-${i}`} type="feature" isEnabled={showTechnical} />}
                      </tr>
                    ))
                  ) : (
                    features?.map(feature => (
                      <tr key={feature.name} className="hover:bg-muted/30 transition-colors" data-testid={`row-feature-${feature.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <td className="py-4 px-4 font-medium">{feature.name}</td>
                        <td className="py-4 px-4 text-right text-muted-foreground">{formatMoney(feature.cost)}</td>
                        <td className="py-4 px-4 text-right">{formatMoney(feature.revenueEstimate)}</td>
                        <td className={`py-4 px-4 text-right font-medium ${feature.roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {feature.roi > 0 ? "+" : ""}{formatMoney(feature.roi)}
                        </td>
                        <TechnicalDetailsCell id={feature.name} type="feature" isEnabled={showTechnical} />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-muted/20 p-4 border-t border-border">
              <p className="text-sm font-medium mb-1">Estimated revenue allocation</p>
              <p className="text-xs text-muted-foreground">Revenue is currently split evenly across features included in the customer's plan.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
