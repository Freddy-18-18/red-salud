"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";

/**
 * Componente de demostración de la API ICD-11
 * Muestra las capacidades de búsqueda y validación
 */
export function ICD11Demo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [validateCode, setValidateCode] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/icd11/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleValidate = async () => {
    if (!validateCode) return;
    
    setIsValidating(true);
    try {
      const response = await fetch(
        `/api/icd11/validate?code=${encodeURIComponent(validateCode)}`
      );
      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error("Error validating:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Info className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Demo ICD-11 API</h2>
          <p className="text-sm text-gray-600">
            Prueba la integración con la API oficial de la OMS
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de Códigos</CardTitle>
          <CardDescription>
            Busca códigos ICD-11 por término médico en español o inglés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ej: diabetes, hipertensión, asma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Resultados ({searchResults.length}):
              </p>
              {searchResults.map((result) => (
                <Card key={result.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {result.code}
                        </Badge>
                        {result.score && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(result.score * 100)}% relevancia
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 font-medium">{result.title}</p>
                      {result.chapter && (
                        <p className="text-xs text-gray-500 mt-1">
                          {result.chapter}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validación */}
      <Card>
        <CardHeader>
          <CardTitle>Validación de Código</CardTitle>
          <CardDescription>
            Verifica si un código ICD-11 existe y obtén sus detalles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ej: 5A11, BA00, 1A00..."
              value={validateCode}
              onChange={(e) => setValidateCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              className="font-mono"
            />
            <Button onClick={handleValidate} disabled={isValidating || !validateCode}>
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Validar
            </Button>
          </div>

          {validationResult && (
            <Card className={validationResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${validationResult.valid ? "text-green-900" : "text-red-900"}`}>
                      {validationResult.valid ? "Código válido" : "Código no encontrado"}
                    </p>
                    {validationResult.data && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-mono font-semibold">
                            {validationResult.data.code}
                          </span>
                        </p>
                        <p className="text-sm">{validationResult.data.title}</p>
                        {validationResult.data.chapter && (
                          <p className="text-xs text-gray-600">
                            {validationResult.data.chapter}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Ejemplos */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplos de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["diabetes", "hipertensión", "asma", "covid", "neumonía", "gripe", "anemia", "migraña"].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(term);
                  setTimeout(() => handleSearch(), 100);
                }}
              >
                {term}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
