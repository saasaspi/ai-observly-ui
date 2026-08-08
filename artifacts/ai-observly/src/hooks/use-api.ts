import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

// Query keys
export const keys = {
  dashboardSummary: ["dashboardSummary"],
  customers: ["customers"],
  featureBreakdown: ["featureBreakdown"],
  technicalDetails: (id: string) => ["technicalDetails", id],
  customFeatures: ["customFeatures"],
  customPlans: ["customPlans"],
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

export function useFeatureBreakdown() {
  return useQuery({
    queryKey: keys.featureBreakdown,
    queryFn: api.getFeatureBreakdown,
  });
}

export function useTechnicalDetails(id: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.technicalDetails(id),
    queryFn: () => api.getTechnicalDetails(id),
    enabled,
  });
}

export function useCustomFeatures() {
  return useQuery({ queryKey: keys.customFeatures, queryFn: api.getCustomFeatures });
}

export function useCustomPlans() {
  return useQuery({ queryKey: keys.customPlans, queryFn: api.getCustomPlans });
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
