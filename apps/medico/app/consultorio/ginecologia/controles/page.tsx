"use client";

import { useMedicoSdk } from "@/hooks/use-medico-sdk";
import { SpecialtyDataTable } from "@/components/specialty-modules/specialty-data-table";
import { SpecialtyRecordForm } from "@/components/specialty-modules/specialty-record-form";
import { SpecialtyRecordDetail } from "@/components/specialty-modules/specialty-record-detail";
import { gynecologyControlsSchema } from "@/lib/specialties/modules/module-schema";
import { useSpecialtyModulePage } from "@/hooks/use-specialty-module-page";

export default function GinecologiaControlesPage() {
  const sdk = useMedicoSdk();
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
    service: sdk.clinical.gynecology.controls,
    schema: gynecologyControlsSchema,
  });

  if (view === "form") {
    return (
      <SpecialtyRecordForm
        schema={gynecologyControlsSchema}
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
        schema={gynecologyControlsSchema}
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
      schema={gynecologyControlsSchema}
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
