"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Phone,
  Mail,
  Eye,
  MessageSquare,
  UserPlus,
  Users,
  CalendarClock,
  Filter,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { format, isToday, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { VerificationGuard } from "@/components/dashboard/medico/verification-guard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Patient {
  id: string;
  patient_id: string;
  first_consultation_date: string | null;
  last_consultation_date: string | null;
  total_consultations: number;
  status: string;
  patient: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    telefono: string | null;
  };
}

interface OfflinePatient {
  id: string;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  status: string;
  created_at: string;
  total_consultations?: number;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [offlinePatients, setOfflinePatients] = useState<OfflinePatient[]>([]);
  const [allPatients, setAllPatients] = useState<(Patient | OfflinePatient)[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<(Patient | OfflinePatient)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [userId, setUserId] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Combine all patients
    const combined = [
      ...patients.map(p => ({ ...p, type: 'registered' as const })),
      ...offlinePatients.map(p => ({ ...p, type: 'offline' as const }))
    ];
    setAllPatients(combined);
  }, [patients, offlinePatients]);

  useEffect(() => {
    filterAndSortPatients();
  }, [searchQuery, filterGender, filterType, sortBy, allPatients]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      setUserId(user.id);

      await Promise.all([
        loadPatients(user.id),
        loadOfflinePatients(user.id),
        loadTodayAppointments(user.id)
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAppointments = async (doctorId: string) => {
    const today = startOfDay(new Date()).toISOString();
    const { data, error } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctorId)
      .gte("appointment_date", today)
      .lt("appointment_date", new Date(new Date().setDate(new Date().getDate() + 1)).toISOString())
      .in("status", ["scheduled", "confirmed"]);

    if (!error && data) {
      setTodayAppointments(data.length);
    }
  };

  const loadPatients = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("doctor_patients")
      .select(`
        *,
        patient:profiles!doctor_patients_patient_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url,
          fecha_nacimiento,
          genero,
          telefono
        )
      `)
      .eq("doctor_id", doctorId)
      .eq("status", "active")
      .order("last_consultation_date", { ascending: false, nullsFirst: false });

    if (!error && data) {
      setPatients(data as any);
    }
  };

  const loadOfflinePatients = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("offline_patients")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "offline")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOfflinePatients(data as any);
    }
  };

  const filterAndSortPatients = () => {
    let filtered = allPatients.filter((p) => {
      const isRegistered = 'patient' in p;
      const name = isRegistered ? p.patient.nombre_completo : p.nombre_completo;
      const email = isRegistered ? p.patient.email : p.email || '';
      const phone = isRegistered ? p.patient.telefono : p.telefono;
      const cedula = !isRegistered ? p.cedula : '';
      const gender = isRegistered ? p.patient.genero : p.genero;

      const matchesSearch = !searchQuery.trim() || 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cedula.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGender = filterGender === "all" || gender === filterGender;
      const matchesType = filterType === "all" || 
        (filterType === "registered" && isRegistered) ||
        (filterType === "offline" && !isRegistered);
      
      return matchesSearch && matchesGender && matchesType;
    });

    // Sort patients
    if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const isARegistered = 'patient' in a;
        const isBRegistered = 'patient' in b;
        const dateA = isARegistered && a.last_consultation_date 
          ? new Date(a.last_consultation_date).getTime() 
          : !isARegistered ? new Date(a.created_at).getTime() : 0;
        const dateB = isBRegistered && b.last_consultation_date 
          ? new Date(b.last_consultation_date).getTime() 
          : !isBRegistered ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = 'patient' in a ? a.patient.nombre_completo : a.nombre_completo;
        const nameB = 'patient' in b ? b.patient.nombre_completo : b.nombre_completo;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "consultations") {
      filtered.sort((a, b) => {
        const consultA = 'patient' in a ? a.total_consultations : 0;
        const consultB = 'patient' in b ? b.total_consultations : 0;
        return consultB - consultA;
      });
    }

    setFilteredPatients(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {patients.length + offlinePatients.length} paciente{(patients.length + offlinePatients.length) !== 1 ? "s" : ""} total{(patients.length + offlinePatients.length) !== 1 ? "es" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/medico/pacientes/nuevo")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Registrar Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {patients.length + offlinePatients.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {patients.length} registrados • {offlinePatients.length} sin registrar
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes de Hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{todayAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Citas programadas para hoy
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CalendarClock className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, cédula, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="registered">Registrados</SelectItem>
                  <SelectItem value="offline">Sin registrar</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                  <SelectItem value="consultations">Más consultas</SelectItem>
                </SelectContent>
              </Select>
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value: string) => {
                  if (value === "table" || value === "grid") {
                    setViewMode(value);
                  }
                }}
              >
                <ToggleGroupItem value="table" aria-label="Vista de tabla">
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Vista de tarjetas">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.length > 0 ? (
          <>
            {viewMode === "table" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Mis Pacientes</CardTitle>
                  <CardDescription>
                    {filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""} encontrado{filteredPatients.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Edad/Género</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Última Actividad</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => {
                          const isRegistered = 'patient' in patient;
                          const patientData = isRegistered ? patient.patient : patient;
                          const age = calculateAge(patientData.fecha_nacimiento);
                          
                          return (
                            <TableRow key={patient.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    {isRegistered && 'avatar_url' in patientData && (
                                      <AvatarImage src={patientData.avatar_url || undefined} />
                                    )}
                                    <AvatarFallback>
                                      {getInitials(patientData.nombre_completo)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {patientData.nombre_completo}
                                    </p>
                                    {!isRegistered && (
                                      <p className="text-xs text-gray-500 font-mono">
                                        {patient.cedula}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {patientData.telefono && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="h-3 w-3" />
                                      {patientData.telefono}
                                    </div>
                                  )}
                                  {patientData.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Mail className="h-3 w-3" />
                                      {patientData.email}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {age && (
                                    <p className="text-sm text-gray-900">{age} años</p>
                                  )}
                                  {patientData.genero && (
                                    <Badge variant="outline" className="text-xs">
                                      {patientData.genero === "M" ? "M" : "F"}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {isRegistered ? (
                                  <div className="space-y-1">
                                    <Badge variant="default" className="text-xs">
                                      Registrado
                                    </Badge>
                                    {patient.total_consultations > 0 && (
                                      <p className="text-xs text-gray-500">
                                        {patient.total_consultations} consulta{patient.total_consultations !== 1 ? "s" : ""}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Sin cuenta
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {isRegistered && patient.last_consultation_date ? (
                                  <div className="text-sm">
                                    <p className="text-gray-900">
                                      {format(new Date(patient.last_consultation_date), "dd/MM/yyyy")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(patient.last_consultation_date), "HH:mm")}
                                    </p>
                                  </div>
                                ) : !isRegistered ? (
                                  <div className="text-sm">
                                    <p className="text-gray-900">
                                      {format(new Date(patient.created_at), "dd/MM/yyyy")}
                                    </p>
                                    <p className="text-xs text-gray-500">Registrado</p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Sin consultas</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (isRegistered) {
                                        router.push(`/dashboard/medico/pacientes/${patient.patient_id}`);
                                      } else {
                                        router.push(`/dashboard/medico/pacientes/offline/${patient.id}`);
                                      }
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {isRegistered && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/dashboard/medico/mensajeria?patient=${patient.patient_id}`)}
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => {
                  const isRegistered = 'patient' in patient;
                  const patientData = isRegistered ? patient.patient : patient;
                  const age = calculateAge(patientData.fecha_nacimiento);
                  
                  return (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="h-12 w-12">
                            {isRegistered && 'avatar_url' in patientData && (
                              <AvatarImage src={patientData.avatar_url || undefined} />
                            )}
                            <AvatarFallback className="text-sm">
                              {getInitials(patientData.nombre_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {patientData.nombre_completo}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {isRegistered ? (
                                <Badge variant="default" className="text-xs">
                                  Registrado
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Sin cuenta
                                </Badge>
                              )}
                              {age && (
                                <span className="text-xs text-gray-500">{age} años</span>
                              )}
                              {patientData.genero && (
                                <Badge variant="outline" className="text-xs">
                                  {patientData.genero === "M" ? "M" : "F"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {!isRegistered && patient.cedula && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-mono text-xs">{patient.cedula}</span>
                            </div>
                          )}
                          {patientData.telefono && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{patientData.telefono}</span>
                            </div>
                          )}
                          {patientData.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{patientData.email}</span>
                            </div>
                          )}
                        </div>

                        {isRegistered && patient.total_consultations > 0 && (
                          <div className="mb-4 pb-4 border-b">
                            <p className="text-xs text-gray-500">
                              {patient.total_consultations} consulta{patient.total_consultations !== 1 ? "s" : ""} realizadas
                            </p>
                            {patient.last_consultation_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Última: {format(new Date(patient.last_consultation_date), "dd/MM/yyyy")}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              if (isRegistered) {
                                router.push(`/dashboard/medico/pacientes/${patient.patient_id}`);
                              } else {
                                router.push(`/dashboard/medico/pacientes/offline/${patient.id}`);
                              }
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          {isRegistered && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/dashboard/medico/mensajeria?patient=${patient.patient_id}`)}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Mensaje
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No se encontraron pacientes" : "Aún no tienes pacientes"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? "Intenta con otro término de búsqueda o ajusta los filtros"
                    : "Los pacientes aparecerán aquí cuando agenden su primera consulta o los registres manualmente"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push("/dashboard/medico/pacientes/nuevo")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar Paciente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </VerificationGuard>
  );
}
