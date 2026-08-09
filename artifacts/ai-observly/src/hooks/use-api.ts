import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

// Query keys
export const keys = {
  dashboardSummary: ["dashboardSummary"],
  customers: ["customers"],
  customerDetail: (id: string) => ["customerDetail", id],
  featureBreakdown: ["featureBreakdown"],
  featureDetail: (id: string) => ["featureDetail", id],
  technicalDetails: (id: string) => ["technicalDetails", id],
  history: (section: string, range: string) => ["history", section, range],
  customFeatures: ["customFeatures"],
  customPlans: ["customPlans"],
  addonCosts: ["addonCosts"],
};

// Queries
export function useDashboardSummary() {
  return useQuery({
    queryKey: keys.dashboardSummary,
    queryFn: api.getDashboardSummary,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: keys.customers,
    queryFn: api.getCustomers,
  });
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: keys.customerDetail(id),
    queryFn: () => api.getCustomerDetail(id),
    enabled: !!id,
  });
}

export function useFeatureBreakdown() {
  return useQuery({
    queryKey: keys.featureBreakdown,
    queryFn: api.getFeatureBreakdown,
  });
}

export function useFeatureDetail(id: string) {
  return useQuery({
    queryKey: keys.featureDetail(id),
    queryFn: () => api.getFeatureDetail(id),
    enabled: !!id,
  });
}

export function useTechnicalDetails(id: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.technicalDetails(id),
    queryFn: () => api.getTechnicalDetails(id),
    enabled,
  });
}

export function useHistory(section: string, range: string) {
  return useQuery({
    queryKey: keys.history(section, range),
    queryFn: () => api.getHistory(section, range),
  });
}

export function useCustomFeatures() {
  return useQuery({ queryKey: keys.customFeatures, queryFn: api.getCustomFeatures });
}

export function useCustomPlans() {
  return useQuery({ queryKey: keys.customPlans, queryFn: api.getCustomPlans });
}

export function useAddonCosts() {
  return useQuery({ queryKey: keys.addonCosts, queryFn: api.getAddonCosts });
}

// Mutations
export function useGenerateKey() {
  return useMutation({ mutationFn: api.generateKey });
}

export function useRegenerateKey() {
  return useMutation({ mutationFn: api.regenerateKey });
}

export function useRevokeKey() {
  return useMutation({ mutationFn: api.revokeKey });
}

export function useSaveCustomFeatures() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: api.saveCustomFeatures,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.customFeatures })
  });
}

export function useSaveCustomPlans() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: api.saveCustomPlans,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.customPlans })
  });
}

export function useSaveAddonCosts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveAddonCosts,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.addonCosts }),
  });
}

export function useSendTestEvent() {
  return useMutation({ mutationFn: api.sendTestEvent });
}

export function useRecalculateNow() {
  return useMutation({ mutationFn: api.recalculateNow });
}

export function useSubmitWaitlist() {
  return useMutation({ mutationFn: api.submitWaitlist });
}

export function useSignup() {
  return useMutation({ 
    mutationFn: ({ email, password }: { email: string; password: string }) => api.signup(email, password) 
  });
}

export function useLogin() {
  return useMutation({ 
    mutationFn: ({ email, password }: { email: string; password: string }) => api.login(email, password) 
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: api.requestPasswordReset });
}
