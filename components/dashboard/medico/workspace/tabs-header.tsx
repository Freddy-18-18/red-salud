"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Sparkles, Brain, Loader2 } from "lucide-react";
import { StructuredTemplate } from "@/lib/templates/structured-templates";

interface TabsHeaderProps {
  activeTab: string;
  selectedStructuredTemplate: StructuredTemplate | null;
  notasMedicas: string;
  isAnalyzing: boolean;
  onShowStructuredMarketplace: () => void;
  onAnalyzeWithAI: () => void;
}

export function TabsHeader({
  activeTab,
  selectedStructuredTemplate,
  notasMedicas,
  isAnalyzing,
  onShowStructuredMarketplace,
  onAnalyzeWithAI,
}: TabsHeaderProps) {
  return (
    <div className="flex-shrink-0 px-6 py-3 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="estructurado" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Editor Estructurado
          </TabsTrigger>
          <TabsTrigger value="notas" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Nota Libre
          </TabsTrigger>
          <TabsTrigger value="icd" className="text-sm">
            <Search className="h-4 w-4 mr-2" />
            ICD-11
          </TabsTrigger>
        </TabsList>

        {activeTab === "estructurado" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowStructuredMarketplace}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
            <Badge variant="secondary" className="text-xs h-5">
              <Sparkles className="h-3 w-3 mr-1" />
              {selectedStructuredTemplate ? selectedStructuredTemplate.fields.length : "4"} campos
            </Badge>
          </Button>
        )}
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={onAnalyzeWithAI}
        disabled={isAnalyzing || !notasMedicas.trim()}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            IA RED-SALUD
          </>
        )}
      </Button>
    </div>
  );
}
