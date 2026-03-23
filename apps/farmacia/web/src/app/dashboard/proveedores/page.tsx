"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Filter,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@red-salud/design-system";

interface Proveedor {
  id: string;
  nombre: string;
  razon_social: string;
  rif: string;
  telefono: string;
  email: string;
  direccion: string;
  contacto_principal: string;
  telefono_contacto: string;
  email_contacto: string;
  plazo_pago: number;
  estado: string;
}

export default function ProveedoresPage() {
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  const loadProveedores = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_proveedores")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProveedores = useCallback(() => {
    let filtered = proveedores;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.rif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.contacto_principal?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter((p) => p.estado === selectedEstado);
    }

    setFilteredProveedores(filtered);
  }, [proveedores, searchTerm, selectedEstado]);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  useEffect(() => {
    filterProveedores();
  }, [filterProveedores]);



  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Proveedores</h1>
              <p className="text-muted-foreground">Gestión de proveedores</p>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Proveedor
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, RIF o contacto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredProveedores.length} proveedor{filteredProveedores.length !== 1 ? "es" : ""}
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProveedores.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedEstado
                    ? "No se encontraron proveedores con los filtros aplicados"
                    : "No hay proveedores registrados"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Plazo Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProveedores.map((proveedor) => (
                      <TableRow key={proveedor.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{proveedor.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              RIF: {proveedor.rif}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{proveedor.contacto_principal}</p>
                            <p className="text-xs text-muted-foreground">
                              {proveedor.email_contacto}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {proveedor.telefono_contacto}
                          </div>
                        </TableCell>
                        <TableCell>
                          {proveedor.plazo_pago} días
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              proveedor.estado
                            )}`}
                          >
                            {proveedor.estado}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}