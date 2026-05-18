import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  medicalReferralService,
  type PatientDocumentSummary,
} from "@/lib/services/medical-referral-service";

const DOCS_KEY = "patient-documents";

export function usePatientDocuments() {
  return useQuery<PatientDocumentSummary[]>({
    queryKey: [DOCS_KEY],
    queryFn: () => medicalReferralService.listAttachableDocuments(),
  });
}

export function useAttachReferralDocuments(referralId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentIds: string[]) =>
      medicalReferralService.attachDocuments(referralId, documentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical-referrals"] });
      qc.invalidateQueries({ queryKey: ["medical-referral-detail", referralId] });
    },
  });
}

export function useUploadPatientDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => medicalReferralService.uploadDocument(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DOCS_KEY] });
    },
  });
}
