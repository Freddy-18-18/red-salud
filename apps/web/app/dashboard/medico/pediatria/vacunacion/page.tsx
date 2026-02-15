"use client";

import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { SpecialtyDataTable } from "@/components/specialty-modules/specialty-data-table";
import { SpecialtyRecordForm } from "@/components/specialty-modules/specialty-record-form";
import { SpecialtyRecordDetail } from "@/components/specialty-modules/specialty-record-detail";
import { pediatricsVaccinesSchema } from "@/lib/specialties/modules/module-schema";
import { pediatricsVaccineService } from "@/lib/supabase/services/pediatrics-service";
import { useSpecialtyModulePage } from "@/hooks/use-specialty-module-page";

export default function PediatriaVacunacionPage() {
  const { user } = useSupabaseAuth();
  const {
    records,
    selectedRecord,
    isLoading,
    isSubmitting,
    isDeleting,
    totalCount,
    currentPage,
    pageSize,
    sortKey,
    sortDirection,
    searchQuery,
    view,
    setView,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSort,
    handleSearch,
    handlePageChange,
    handleRowClick,
    handleRefresh,
  } = useSpecialtyModulePage({
    service: pediatricsVaccineService,
    schema: pediatricsVaccinesSchema,
    doctorId: user?.id,
  });

  if (view === "form") {
    return (
      <SpecialtyRecordForm
        schema={pediatricsVaccinesSchema}
        initialData={selectedRecord ?? undefined}
        isEdit={!!selectedRecord}
        isSubmitting={isSubmitting}
        onSubmit={selectedRecord ? handleUpdate : handleCreate}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "detail" && selectedRecord) {
    return (
      <SpecialtyRecordDetail
        schema={pediatricsVaccinesSchema}
        record={selectedRecord}
        onEdit={() => setView("form")}
        onDelete={handleDelete}
        onBack={() => setView("list")}
        isDeleting={isDeleting}
      />
    );
  }

  return (
    <SpecialtyDataTable
      schema={pediatricsVaccinesSchema}
      data={records}
      isLoading={isLoading}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      sortKey={sortKey}
      sortDirection={sortDirection}
      searchQuery={searchQuery}
      onRowClick={handleRowClick}
      onCreateNew={() => { setView("form"); }}
      onRefresh={handleRefresh}
      onSort={handleSort}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
    />
  );
}
