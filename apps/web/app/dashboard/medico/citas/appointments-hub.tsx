"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@red-salud/ui";
import { Calendar, Users, ClipboardList } from "lucide-react";
import { AgendaTab, OperationsTab, WaitlistTab } from "./components";
import { useCurrentOffice } from "@/hooks/use-current-office";
import { supabase } from "@/lib/supabase/client";

interface AppointmentsHubProps {
  specialtyName?: string;
  initialTab?: string;
}

/**
 * Hub central de Agenda & Operaciones
 * Layout sin scroll principal - solo scroll interno en tabs
 */
export function AppointmentsHub({ 
  specialtyName: propSpecialtyName,
  initialTab 
}: AppointmentsHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");
  
  const [selectedTab, setSelectedTab] = useState(initialTab || tabFromUrl || "agenda");
  const [specialtyName, setSpecialtyName] = useState<string | undefined>(propSpecialtyName);
  const { currentOffice } = useCurrentOffice();
  const selectedOfficeId = currentOffice?.id || null;

  // Obtener especialidad del usuario si no se proporciona
  useEffect(() => {
    if (propSpecialtyName) {
      setSpecialtyName(propSpecialtyName);
      return;
    }

    async function fetchSpecialty() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctorDetails } = await supabase
        .from("doctor_details")
        .select("especialidad:specialties(name)")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (doctorDetails?.especialidad) {
        const specialty = doctorDetails.especialidad as { name?: string };
        setSpecialtyName(specialty.name || undefined);
      }
    }

    fetchSpecialty();
  }, [propSpecialtyName]);

  // Sync with URL on mount
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== selectedTab) {
      setSelectedTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const isOdontology = specialtyName?.toLowerCase().includes("odontolog");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs - Altura flexible con contenido scrollable */}
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange}
        className="flex flex-col h-full overflow-hidden"
      >
        {/* Tabs List - Altura fija */}
        <div className="flex-none border-b bg-muted/30 px-6">
          <TabsList className="h-10 bg-transparent border-b-0">
            <TabsTrigger 
              value="agenda" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Calendar className="size-4 mr-2" />
              Agenda
            </TabsTrigger>

            {isOdontology && (
              <TabsTrigger 
                value="operations"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Users className="size-4 mr-2" />
                Operaciones
              </TabsTrigger>
            )}

            <TabsTrigger 
              value="waitlist"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <ClipboardList className="size-4 mr-2" />
              Lista de Espera
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Scrollable internamente */}
        <div className="flex-1 min-h-0">
          <TabsContent 
            value="agenda" 
            className="h-full m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <AgendaTab 
              selectedOfficeId={selectedOfficeId}
              specialtyName={specialtyName}
            />
          </TabsContent>

          {isOdontology && (
            <TabsContent 
              value="operations" 
              className="h-full m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
            >
              <OperationsTab 
                selectedOfficeId={selectedOfficeId}
                specialtyName={specialtyName}
              />
            </TabsContent>
          )}

          <TabsContent 
            value="waitlist" 
            className="h-full m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <WaitlistTab 
              selectedOfficeId={selectedOfficeId}
              specialtyName={specialtyName}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
