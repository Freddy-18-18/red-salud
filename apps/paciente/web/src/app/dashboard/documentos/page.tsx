"use client";

import {
  FolderOpen,
  Search,
  Upload,
  LayoutGrid,
  List,
  Syringe,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";

import { CategoryGrid } from "@/components/documents/category-grid";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { ShareDialog } from "@/components/documents/share-dialog";
import { UploadModal } from "@/components/documents/upload-modal";
import { VaccinationRecord } from "@/components/documents/vaccination-record";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useDocuments, useVaccinations } from "@/hooks/use-documents";
import { type DocumentCategory, type PatientDocument } from "@/lib/services/documents-service";

type ViewMode = "grid" | "list";
type Tab = "documentos" | "vacunas";

export default function DocumentosPage() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showUpload, setShowUpload] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<PatientDocument | null>(null);
  const [sharingDoc, setSharingDoc] = useState<PatientDocument | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("documentos");
  const [confirmDelete, setConfirmDelete] = useState<PatientDocument | null>(null);

  const {
    documents,
    categoryCounts,
    recentDocuments,
    totalDocuments,
    loading,
    uploading,
    error,
    searchQuery,
    search,
    uploadDocument,
    deleteDocument,
    shareWithDoctor,
  } = useDocuments(selectedCategory);

  const vaccHook = useVaccinations();

  const handleView = useCallback((doc: PatientDocument) => {
    setViewingDoc(doc);
  }, []);

  const handleDownload = useCallback((doc: PatientDocument) => {
    window.open(doc.file_url, "_blank");
  }, []);

  const handleShare = useCallback((doc: PatientDocument) => {
    setSharingDoc(doc);
  }, []);

  const handleDelete = useCallback((doc: PatientDocument) => {
    setConfirmDelete(doc);
  }, []);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    await deleteDocument(confirmDelete.id, confirmDelete.file_url);
    setConfirmDelete(null);
    if (viewingDoc?.id === confirmDelete.id) setViewingDoc(null);
  };

  // If viewing a document, show the viewer
  if (viewingDoc) {
    return (
      <div className="space-y-4">
        <DocumentViewer
          document={viewingDoc}
          onBack={() => setViewingDoc(null)}
          onDownload={() => handleDownload(viewingDoc)}
          onShare={() => setSharingDoc(viewingDoc)}
          onDelete={() => handleDelete(viewingDoc)}
        />

        {/* Share dialog */}
        {sharingDoc && (
          <ShareDialog
            open={!!sharingDoc}
            onClose={() => setSharingDoc(null)}
            onShare={(doctorId) => shareWithDoctor(sharingDoc.id, doctorId)}
            documentTitle={sharingDoc.title}
          />
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <DeleteConfirmation
            title={confirmDelete.title}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalDocuments} documento{totalDocuments !== 1 ? "s" : ""} guardado
            {totalDocuments !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition shadow-sm"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Subir</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("documentos")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "documentos"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Documentos
          </div>
        </button>
        <button
          onClick={() => setActiveTab("vacunas")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "vacunas"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Vacunas
          </div>
        </button>
      </div>

      {activeTab === "documentos" ? (
        <>
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Categorias
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Ver todas
                </button>
              )}
            </div>
            <CategoryGrid
              categoryCounts={categoryCounts}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Search + View toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => search(e.target.value)}
                placeholder="Buscar documentos..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
              {searchQuery && (
                <button
                  onClick={() => search("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Recent documents (only when no filter/search) */}
          {!selectedCategory && !searchQuery && recentDocuments.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Recientes
              </h2>
              <div className="space-y-2">
                {recentDocuments.slice(0, 3).map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={handleView}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All documents */}
          <div>
            {(selectedCategory || searchQuery) && (
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : `Documentos`}
                {documents.length > 0 && (
                  <span className="text-gray-400 font-normal ml-2">
                    ({documents.length})
                  </span>
                )}
              </h2>
            )}

            {!selectedCategory && !searchQuery && documents.length > 0 && (
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Todos los documentos
                <span className="text-gray-400 font-normal ml-2">
                  ({documents.length})
                </span>
              </h2>
            )}

            {documents.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title={
                  searchQuery
                    ? "Sin resultados"
                    : selectedCategory
                      ? "Sin documentos en esta categoria"
                      : "Aun no tienes documentos"
                }
                description={
                  searchQuery
                    ? "Intenta con otros terminos de busqueda"
                    : "Sube tus documentos medicos para tenerlos siempre a mano"
                }
              />
            ) : viewMode === "list" ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={handleView}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={handleView}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Vaccinations tab */
        <VaccinationRecord
          vaccinations={vaccHook.vaccinations}
          upcomingVaccines={vaccHook.upcomingVaccines}
          loading={vaccHook.loading}
          saving={vaccHook.saving}
          onAdd={vaccHook.addVaccination}
          onDelete={vaccHook.deleteVaccination}
        />
      )}

      {/* Upload modal */}
      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={uploadDocument}
        uploading={uploading}
      />

      {/* Share dialog */}
      {sharingDoc && (
        <ShareDialog
          open={!!sharingDoc}
          onClose={() => setSharingDoc(null)}
          onShare={(doctorId) => shareWithDoctor(sharingDoc.id, doctorId)}
          documentTitle={sharingDoc.title}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <DeleteConfirmation
          title={confirmDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// Delete confirmation dialog
function DeleteConfirmation({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-900">
          Eliminar documento
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Estas seguro de que deseas eliminar &ldquo;{title}&rdquo;? Esta accion
          no se puede deshacer.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
