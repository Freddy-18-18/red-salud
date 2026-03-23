"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDocument } from "@/hooks/use-documents";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { ShareDialog } from "@/components/documents/share-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FileX } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { documentsService } from "@/lib/services/documents-service";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const { document, loading, error } = useDocument(documentId);
  const [showShare, setShowShare] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/documentos");
  };

  const handleDownload = () => {
    if (document) {
      window.open(document.file_url, "_blank");
    }
  };

  const handleShare = async (doctorId: string) => {
    if (!document) return { success: false };
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    try {
      await documentsService.shareWithDoctor(document.id, doctorId, user.id);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      await documentsService.deleteDocument(document.id, document.file_url);
      router.push("/dashboard/documentos");
    } catch {
      // Error handled in service
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <EmptyState
        icon={FileX}
        title="Documento no encontrado"
        description="El documento que buscas no existe o fue eliminado"
        action={{ label: "Ver documentos", href: "/dashboard/documentos" }}
      />
    );
  }

  return (
    <>
      <DocumentViewer
        document={document}
        onBack={handleBack}
        onDownload={handleDownload}
        onShare={() => setShowShare(true)}
        onDelete={handleDelete}
      />

      <ShareDialog
        open={showShare}
        onClose={() => setShowShare(false)}
        onShare={handleShare}
        documentTitle={document.title}
      />
    </>
  );
}
