import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Button,
    Textarea,
} from "@red-salud/design-system";
import { Loader2, Save } from "lucide-react";
import { PatientDetails } from "@/hooks/paciente/useConfiguracion";

interface MedicalInfoCardProps {
    details: PatientDetails | null;
    setDetails: (details: PatientDetails) => void;
    saving: boolean;
    onSave: () => void;
}

export function MedicalInfoCard({
    details,
    setDetails,
    saving,
    onSave,
}: MedicalInfoCardProps) {
    if (!details) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información Médica</CardTitle>
                <CardDescription>
                    Tu información médica básica para emergencias
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="blood-type">Grupo Sanguíneo</Label>
                        <Input
                            id="blood-type"
                            value={details.grupo_sanguineo || ""}
                            onChange={(e) =>
                                setDetails({ ...details, grupo_sanguineo: e.target.value })
                            }
                            placeholder="O+"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Altura (cm)</Label>
                        <Input
                            id="height"
                            type="number"
                            value={details.altura_cm || ""}
                            onChange={(e) =>
                                setDetails({ ...details, altura_cm: Number(e.target.value) })
                            }
                            placeholder="175"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            value={details.peso_kg || ""}
                            onChange={(e) =>
                                setDetails({ ...details, peso_kg: Number(e.target.value) })
                            }
                            placeholder="70"
                        />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="allergies">Alergias</Label>
                        <Textarea
                            id="allergies"
                            value={details.alergias?.join(", ") || ""}
                            onChange={(e) =>
                                setDetails({
                                    ...details,
                                    alergias: e.target.value.split(",").map((s) => s.trim()),
                                })
                            }
                            placeholder="Penicilina, Mani..."
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={onSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
