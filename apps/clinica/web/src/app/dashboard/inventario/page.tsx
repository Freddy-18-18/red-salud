'use client';

import { Package, Plus, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";

export default function InventarioPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Inventario
          </h1>
          <p className="text-sm text-muted-foreground">Control de insumos medicos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Insumo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Items en Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Stock Bajo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Por Vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catalogo de Insumos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Inventario vacio</p>
            <p className="text-sm mt-1">Registra tus insumos medicos para llevar control de stock</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Consumo Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Grafico de consumo mensual</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
