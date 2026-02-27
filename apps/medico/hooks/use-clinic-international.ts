/**
 * Hook para gestión de pacientes internacionales
 * 
 * Maneja registro, documentos y seguimiento de pacientes extranjeros
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInternationalPatients,
  getInternationalPatientById,
  getActiveInternationalPatients,
  getPendingArrivals,
  createInternationalPatient,
  updateInternationalPatient,
  updatePatientStatus,
  getTravelDocuments,
  uploadTravelDocument,
  verifyTravelDocument,
  deleteTravelDocument,
  getPendingDocumentVerifications,
  getInternationalPatientStats,
  getCountryRequirements,
} from '@/lib/supabase/services/clinic-international-service';
import type {
  InternationalPatient,
  TravelDocument,
} from '@red-salud/types';

export function useInternationalPatients(clinicId?: string) {
  const queryClient = useQueryClient();

  // Obtener todos los pacientes internacionales
  const {
    data: patients,
    isLoading: loadingPatients,
    refetch: refetchPatients,
  } = useQuery({
    queryKey: ['international-patients', clinicId],
    queryFn: () => (clinicId ? getInternationalPatients(clinicId) : []),
    enabled: !!clinicId,
  });

  // Obtener pacientes activos
  const {
    data: activePatients,
    isLoading: loadingActive,
  } = useQuery({
    queryKey: ['active-international-patients', clinicId],
    queryFn: () => (clinicId ? getActiveInternationalPatients(clinicId) : []),
    enabled: !!clinicId,
  });

  // Obtener próximas llegadas
  const {
    data: pendingArrivals,
    isLoading: loadingArrivals,
  } = useQuery({
    queryKey: ['pending-arrivals', clinicId],
    queryFn: () => (clinicId ? getPendingArrivals(clinicId, 30) : []),
    enabled: !!clinicId,
  });

  // Obtener documentos pendientes de verificación
  const {
    data: pendingDocs,
    isLoading: loadingPendingDocs,
    refetch: refetchPendingDocs,
  } = useQuery({
    queryKey: ['pending-document-verifications', clinicId],
    queryFn: () => (clinicId ? getPendingDocumentVerifications(clinicId) : []),
    enabled: !!clinicId,
  });

  // Obtener estadísticas
  const {
    data: stats,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ['international-patient-stats', clinicId],
    queryFn: () => (clinicId ? getInternationalPatientStats(clinicId) : null),
    enabled: !!clinicId,
  });

  // Mutation: Crear paciente internacional
  const createPatientMutation = useMutation({
    mutationFn: createInternationalPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['international-patients'] });
      queryClient.invalidateQueries({ queryKey: ['active-international-patients'] });
      queryClient.invalidateQueries({ queryKey: ['international-patient-stats'] });
    },
  });

  // Mutation: Actualizar paciente
  const updatePatientMutation = useMutation({
    mutationFn: ({
      patientId,
      updates,
    }: {
      patientId: string;
      updates: Partial<InternationalPatient>;
    }) => updateInternationalPatient(patientId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['international-patients'] });
      queryClient.invalidateQueries({ queryKey: ['international-patient'] });
    },
  });

  // Mutation: Actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({
      patientId,
      status,
    }: {
      patientId: string;
      status: InternationalPatient['status'];
    }) => updatePatientStatus(patientId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['international-patients'] });
      queryClient.invalidateQueries({ queryKey: ['active-international-patients'] });
      queryClient.invalidateQueries({ queryKey: ['pending-arrivals'] });
    },
  });

  return {
    // Data
    patients,
    activePatients,
    pendingArrivals,
    pendingDocs,
    stats,

    // Loading
    isLoading: loadingPatients || loadingActive || loadingArrivals,
    loadingPatients,
    loadingActive,
    loadingArrivals,
    loadingPendingDocs,
    loadingStats,

    // Actions
    createPatient: createPatientMutation.mutateAsync,
    updatePatient: updatePatientMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,

    // Refetch
    refetchPatients,
    refetchPendingDocs,

    // Mutation states
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
  };
}

export function useInternationalPatientDetails(patientId?: string) {
  const queryClient = useQueryClient();

  const {
    data: patient,
    isLoading: loadingPatient,
    error,
  } = useQuery({
    queryKey: ['international-patient', patientId],
    queryFn: () => (patientId ? getInternationalPatientById(patientId) : null),
    enabled: !!patientId,
  });

  const {
    data: documents,
    isLoading: loadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['travel-documents', patientId],
    queryFn: () => (patientId ? getTravelDocuments(patientId) : []),
    enabled: !!patientId,
  });

  const {
    data: countryReqs,
    isLoading: loadingCountryReqs,
  } = useQuery({
    queryKey: ['country-requirements', patient?.origin_country],
    queryFn: () =>
      patient?.origin_country ? getCountryRequirements(patient.origin_country) : null,
    enabled: !!patient?.origin_country,
  });

  // Mutation: Subir documento
  const uploadDocumentMutation = useMutation({
    mutationFn: ({
      documentType,
      documentName,
      file,
    }: {
      documentType: TravelDocument['document_type'];
      documentName: string;
      file: File;
    }) => {
      if (!patientId) throw new Error('No patient ID');
      return uploadTravelDocument(patientId, documentType, documentName, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-documents', patientId] });
      queryClient.invalidateQueries({ queryKey: ['pending-document-verifications'] });
    },
  });

  // Mutation: Verificar documento
  const verifyDocumentMutation = useMutation({
    mutationFn: ({ documentId, userId }: { documentId: string; userId: string }) =>
      verifyTravelDocument(documentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-documents', patientId] });
      queryClient.invalidateQueries({ queryKey: ['pending-document-verifications'] });
    },
  });

  // Mutation: Eliminar documento
  const deleteDocumentMutation = useMutation({
    mutationFn: deleteTravelDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-documents', patientId] });
    },
  });

  // Helpers
  const requiredDocs = countryReqs?.required_documents || [];
  const uploadedDocTypes = new Set<string>(documents?.map((d) => d.document_type) || []);
  const missingDocs = requiredDocs.filter((docType) => !uploadedDocTypes.has(docType as string));
  const verifiedDocs = documents?.filter((d) => d.verified) || [];
  const unverifiedDocs = documents?.filter((d) => !d.verified) || [];

  const isDocumentationComplete = missingDocs.length === 0;
  const isAllVerified = (documents?.length || 0) > 0 && unverifiedDocs.length === 0;

  return {
    // Data
    patient,
    documents,
    countryReqs,
    requiredDocs,
    missingDocs,
    verifiedDocs,
    unverifiedDocs,
    isDocumentationComplete,
    isAllVerified,

    // Loading
    isLoading: loadingPatient || loadingDocuments,
    loadingPatient,
    loadingDocuments,
    loadingCountryReqs,
    error,

    // Actions
    uploadDocument: uploadDocumentMutation.mutateAsync,
    verifyDocument: verifyDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,

    // Refetch
    refetchDocuments,

    // Mutation states
    isUploading: uploadDocumentMutation.isPending,
    isVerifying: verifyDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending,
  };
}

export function useCountryRequirements(countryCode?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['country-requirements', countryCode],
    queryFn: () => (countryCode ? getCountryRequirements(countryCode) : null),
    enabled: !!countryCode,
  });

  return {
    requirements: data,
    isLoading,
  };
}
