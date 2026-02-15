"use client";

import { useState, useRef, useMemo, useCallback, Suspense } from "react";
import { cn } from "@red-salud/core/utils";
import {
  ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff, Box,
  Tag, Palette, Maximize2, Minimize2, Layers, Info, Move3d
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge
} from "@red-salud/ui";
import Link from "next/link";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Center, Text, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { Dental3DModel, Model3DAnnotation } from "@/types/dental";

// ─── FDI Tooth Positions (approximate 3D coordinates) ────────────────────────
interface ToothMeshData {
  fdi: number;
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  condition?: "healthy" | "caries" | "filling" | "crown" | "missing" | "implant";
}

// Upper arch teeth positions (right to left when facing patient)
const UPPER_TEETH: ToothMeshData[] = [
  { fdi: 18, name: "3er Molar Sup Der", position: [-3.2, 0.8, -1.2], scale: [0.45, 0.5, 0.45], color: "#f0f0e8", condition: "missing" },
  { fdi: 17, name: "2do Molar Sup Der", position: [-2.7, 0.8, -0.6], scale: [0.45, 0.55, 0.45], color: "#f0f0e8", condition: "filling" },
  { fdi: 16, name: "1er Molar Sup Der", position: [-2.2, 0.8, -0.1], scale: [0.5, 0.55, 0.5], color: "#f0f0e8" },
  { fdi: 15, name: "2do Premolar Sup Der", position: [-1.8, 0.8, 0.3], scale: [0.35, 0.55, 0.35], color: "#f0f0e8" },
  { fdi: 14, name: "1er Premolar Sup Der", position: [-1.4, 0.8, 0.6], scale: [0.35, 0.55, 0.35], color: "#f0f0e8" },
  { fdi: 13, name: "Canino Sup Der", position: [-1.0, 0.8, 0.9], scale: [0.3, 0.65, 0.3], color: "#f0f0e8" },
  { fdi: 12, name: "Incisivo Lat Sup Der", position: [-0.6, 0.8, 1.1], scale: [0.25, 0.55, 0.2], color: "#f0f0e8" },
  { fdi: 11, name: "Incisivo Cent Sup Der", position: [-0.25, 0.8, 1.2], scale: [0.3, 0.6, 0.2], color: "#f0f0e8", condition: "crown" },
  { fdi: 21, name: "Incisivo Cent Sup Izq", position: [0.25, 0.8, 1.2], scale: [0.3, 0.6, 0.2], color: "#f0f0e8" },
  { fdi: 22, name: "Incisivo Lat Sup Izq", position: [0.6, 0.8, 1.1], scale: [0.25, 0.55, 0.2], color: "#f0f0e8" },
  { fdi: 23, name: "Canino Sup Izq", position: [1.0, 0.8, 0.9], scale: [0.3, 0.65, 0.3], color: "#f0f0e8" },
  { fdi: 24, name: "1er Premolar Sup Izq", position: [1.4, 0.8, 0.6], scale: [0.35, 0.55, 0.35], color: "#f0f0e8" },
  { fdi: 25, name: "2do Premolar Sup Izq", position: [1.8, 0.8, 0.3], scale: [0.35, 0.55, 0.35], color: "#f0f0e8", condition: "caries" },
  { fdi: 26, name: "1er Molar Sup Izq", position: [2.2, 0.8, -0.1], scale: [0.5, 0.55, 0.5], color: "#f0f0e8" },
  { fdi: 27, name: "2do Molar Sup Izq", position: [2.7, 0.8, -0.6], scale: [0.45, 0.55, 0.45], color: "#f0f0e8" },
  { fdi: 28, name: "3er Molar Sup Izq", position: [3.2, 0.8, -1.2], scale: [0.45, 0.5, 0.45], color: "#f0f0e8" },
];

const LOWER_TEETH: ToothMeshData[] = [
  { fdi: 48, name: "3er Molar Inf Der", position: [-3.0, -0.8, -1.0], scale: [0.45, 0.45, 0.45], color: "#f0f0e8" },
  { fdi: 47, name: "2do Molar Inf Der", position: [-2.5, -0.8, -0.5], scale: [0.45, 0.5, 0.45], color: "#f0f0e8" },
  { fdi: 46, name: "1er Molar Inf Der", position: [-2.0, -0.8, 0.0], scale: [0.5, 0.5, 0.5], color: "#f0f0e8", condition: "caries" },
  { fdi: 45, name: "2do Premolar Inf Der", position: [-1.6, -0.8, 0.3], scale: [0.35, 0.5, 0.35], color: "#f0f0e8" },
  { fdi: 44, name: "1er Premolar Inf Der", position: [-1.2, -0.8, 0.5], scale: [0.35, 0.5, 0.35], color: "#f0f0e8" },
  { fdi: 43, name: "Canino Inf Der", position: [-0.85, -0.8, 0.7], scale: [0.28, 0.55, 0.28], color: "#f0f0e8" },
  { fdi: 42, name: "Incisivo Lat Inf Der", position: [-0.5, -0.8, 0.9], scale: [0.22, 0.45, 0.18], color: "#f0f0e8" },
  { fdi: 41, name: "Incisivo Cent Inf Der", position: [-0.2, -0.8, 1.0], scale: [0.2, 0.45, 0.15], color: "#f0f0e8" },
  { fdi: 31, name: "Incisivo Cent Inf Izq", position: [0.2, -0.8, 1.0], scale: [0.2, 0.45, 0.15], color: "#f0f0e8" },
  { fdi: 32, name: "Incisivo Lat Inf Izq", position: [0.5, -0.8, 0.9], scale: [0.22, 0.45, 0.18], color: "#f0f0e8" },
  { fdi: 33, name: "Canino Inf Izq", position: [0.85, -0.8, 0.7], scale: [0.28, 0.55, 0.28], color: "#f0f0e8" },
  { fdi: 34, name: "1er Premolar Inf Izq", position: [1.2, -0.8, 0.5], scale: [0.35, 0.5, 0.35], color: "#f0f0e8" },
  { fdi: 35, name: "2do Premolar Inf Izq", position: [1.6, -0.8, 0.3], scale: [0.35, 0.5, 0.35], color: "#f0f0e8", condition: "filling" },
  { fdi: 36, name: "1er Molar Inf Izq", position: [2.0, -0.8, 0.0], scale: [0.5, 0.5, 0.5], color: "#f0f0e8", condition: "implant" },
  { fdi: 37, name: "2do Molar Inf Izq", position: [2.5, -0.8, -0.5], scale: [0.45, 0.5, 0.45], color: "#f0f0e8" },
  { fdi: 38, name: "3er Molar Inf Izq", position: [3.0, -0.8, -1.0], scale: [0.45, 0.45, 0.45], color: "#f0f0e8", condition: "missing" },
];

const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH];

const CONDITION_COLORS: Record<string, string> = {
  healthy: "#f0f0e8",
  caries: "#8B4513",
  filling: "#C0C0C0",
  crown: "#FFD700",
  missing: "transparent",
  implant: "#4A9BD9",
};

const CONDITION_LABELS: Record<string, string> = {
  healthy: "Sano",
  caries: "Caries",
  filling: "Obturación",
  crown: "Corona",
  missing: "Ausente",
  implant: "Implante",
};

// ─── Demo Annotations ────────────────────────────────────────────────────────
const DEMO_ANNOTATIONS: Model3DAnnotation[] = [
  { id: "a1", position: { x: -2.2, y: 0.8, z: -0.1 }, label: "16 — 1er Molar", description: "Raíces bien definidas, sin patología", color: "#22c55e" },
  { id: "a2", position: { x: 1.8, y: 0.8, z: 0.3 }, label: "25 — Caries oclusal", description: "Caries en superficie oclusal, requiere restauración clase I", color: "#ef4444" },
  { id: "a3", position: { x: -2.0, y: -0.8, z: 0.0 }, label: "46 — Caries proximal", description: "Caries mesial detectada en radiografía, considerar incrustación", color: "#ef4444" },
  { id: "a4", position: { x: 2.0, y: -0.8, z: 0.0 }, label: "36 — Implante", description: "Implante oseointegrado, corona atornillada en buen estado", color: "#3b82f6" },
  { id: "a5", position: { x: -0.25, y: 0.8, z: 1.2 }, label: "11 — Corona cerámica", description: "Corona E-max, instalada hace 2 años, sin desgaste visible", color: "#eab308" },
];

// ─── 3D Tooth Component ──────────────────────────────────────────────────────
function ToothMesh({
  tooth,
  isSelected,
  isHovered,
  onClick,
  onHover,
  showGingiva,
}: {
  tooth: ToothMeshData;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
  showGingiva: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const condition = tooth.condition || "healthy";
  const isMissing = condition === "missing";
  const isImplant = condition === "implant";
  const toothColor = CONDITION_COLORS[condition] || CONDITION_COLORS.healthy;

  if (isMissing) {
    return (
      <group position={tooth.position}>
        {/* Empty space marker for missing tooth */}
        <mesh>
          <ringGeometry args={[0.12, 0.15, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={tooth.position}>
      {/* Main tooth body */}
      <mesh
        ref={ref}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(true); }}
        onPointerOut={() => onHover(false)}
        scale={tooth.scale}
      >
        <capsuleGeometry args={[0.4, 0.4, 8, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#3b82f6" : isHovered ? "#93c5fd" : toothColor}
          roughness={0.3}
          metalness={isImplant ? 0.8 : 0.1}
          emissive={isSelected ? "#1d4ed8" : isHovered ? "#60a5fa" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : isHovered ? 0.1 : 0}
        />
      </mesh>

      {/* Implant screw indicator */}
      {isImplant && (
        <mesh position={[0, tooth.position[1] > 0 ? -0.3 : 0.3, 0]} scale={[0.08, 0.35, 0.08]}>
          <cylinderGeometry args={[1, 0.7, 1, 6]} />
          <meshStandardMaterial color="#607D8B" metalness={0.9} roughness={0.2} />
        </mesh>
      )}

      {/* Gingiva */}
      {showGingiva && (
        <mesh position={[0, tooth.position[1] > 0 ? -0.15 : 0.15, 0]} scale={[tooth.scale[0] * 1.3, 0.15, tooth.scale[2] * 1.3]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#e88a9a" transparent opacity={0.5} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ─── Annotation Pin ──────────────────────────────────────────────────────────
function AnnotationPin({
  annotation,
  visible,
  onClick,
}: {
  annotation: Model3DAnnotation;
  visible: boolean;
  onClick: () => void;
}) {
  if (!visible) return null;
  return (
    <group position={[annotation.position.x, annotation.position.y + 0.6, annotation.position.z]}>
      <mesh onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={annotation.color} />
      </mesh>
      {/* Line from pin to tooth */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0, -0.55, 0]), 3]}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={annotation.color} />
      </line>
      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div className="bg-background/90 border rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-sm">
          {annotation.label}
        </div>
      </Html>
    </group>
  );
}

// ─── Gum (Arch shape) ────────────────────────────────────────────────────────
function GumArch({ upper }: { upper: boolean }) {
  const y = upper ? 0.75 : -0.75;
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.0, 0.35, 8, 32, Math.PI]} />
      <meshStandardMaterial color="#d4757c" transparent opacity={0.25} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
function DentalScene({
  selectedTooth,
  hoveredTooth,
  onSelectTooth,
  onHoverTooth,
  showAnnotations,
  showGingiva,
  viewMode,
  annotations,
  onSelectAnnotation,
}: {
  selectedTooth: number | null;
  hoveredTooth: number | null;
  onSelectTooth: (fdi: number | null) => void;
  onHoverTooth: (fdi: number | null) => void;
  showAnnotations: boolean;
  showGingiva: boolean;
  viewMode: "both" | "upper" | "lower";
  annotations: Model3DAnnotation[];
  onSelectAnnotation: (id: string) => void;
}) {
  const teeth = viewMode === "upper" ? UPPER_TEETH : viewMode === "lower" ? LOWER_TEETH : ALL_TEETH;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 5]} fov={45} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 3, -3]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.4} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={15}
        autoRotate={false}
      />

      <Environment preset="studio" />

      <Center>
        <group>
          {teeth.map((t) => (
            <ToothMesh
              key={t.fdi}
              tooth={t}
              isSelected={selectedTooth === t.fdi}
              isHovered={hoveredTooth === t.fdi}
              onClick={() => onSelectTooth(selectedTooth === t.fdi ? null : t.fdi)}
              onHover={(h) => onHoverTooth(h ? t.fdi : null)}
              showGingiva={showGingiva}
            />
          ))}

          {/* Arch guides */}
          {showGingiva && (viewMode === "both" || viewMode === "upper") && <GumArch upper />}
          {showGingiva && (viewMode === "both" || viewMode === "lower") && <GumArch upper={false} />}

          {/* Annotations */}
          {annotations.map((a) => (
            <AnnotationPin
              key={a.id}
              annotation={a}
              visible={showAnnotations}
              onClick={() => onSelectAnnotation(a.id)}
            />
          ))}
        </group>
      </Center>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Dental3DPage() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showGingiva, setShowGingiva] = useState(true);
  const [viewMode, setViewMode] = useState<"both" | "upper" | "lower">("both");
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedToothData = useMemo(() =>
    ALL_TEETH.find((t) => t.fdi === selectedTooth),
    [selectedTooth]
  );

  const selectedAnnotationData = useMemo(() =>
    DEMO_ANNOTATIONS.find((a) => a.id === selectedAnnotation),
    [selectedAnnotation]
  );

  const conditionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_TEETH.forEach((t) => {
      const c = t.condition || "healthy";
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!fullscreen && canvasRef.current) {
      canvasRef.current.requestFullscreen?.();
    } else if (fullscreen) {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  }, [fullscreen]);

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/medico/odontologia">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Move3d className="w-6 h-6 text-primary" />
            Visualización 3D Dental
          </h1>
          <p className="text-sm text-muted-foreground">Modelo interactivo 3D — click para seleccionar dientes, arrastrar para rotar</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <Button size="sm" variant={viewMode === "both" ? "default" : "outline"} onClick={() => setViewMode("both")} className="h-7 text-xs">
                <Layers className="w-3 h-3 mr-1" />Ambas
              </Button>
              <Button size="sm" variant={viewMode === "upper" ? "default" : "outline"} onClick={() => setViewMode("upper")} className="h-7 text-xs">Superior</Button>
              <Button size="sm" variant={viewMode === "lower" ? "default" : "outline"} onClick={() => setViewMode("lower")} className="h-7 text-xs">Inferior</Button>
            </div>

            <div className="h-5 w-px bg-border mx-1" />

            <Button size="sm" variant={showAnnotations ? "default" : "outline"} onClick={() => setShowAnnotations(!showAnnotations)} className="h-7 text-xs">
              <Tag className="w-3 h-3 mr-1" />{showAnnotations ? "Anotaciones ON" : "Anotaciones OFF"}
            </Button>

            <Button size="sm" variant={showGingiva ? "default" : "outline"} onClick={() => setShowGingiva(!showGingiva)} className="h-7 text-xs">
              {showGingiva ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              Encía
            </Button>

            <div className="flex-1" />

            <Button size="sm" variant="outline" onClick={toggleFullscreen} className="h-7 text-xs">
              {fullscreen ? <Minimize2 className="w-3 h-3 mr-1" /> : <Maximize2 className="w-3 h-3 mr-1" />}
              {fullscreen ? "Salir" : "Pantalla completa"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent ref={canvasRef} className="p-0 relative overflow-hidden" style={{ height: 520 }}>
              <Canvas
                shadows
                gl={{ antialias: true, alpha: true }}
                style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
              >
                <Suspense fallback={null}>
                  <DentalScene
                    selectedTooth={selectedTooth}
                    hoveredTooth={hoveredTooth}
                    onSelectTooth={setSelectedTooth}
                    onHoverTooth={setHoveredTooth}
                    showAnnotations={showAnnotations}
                    showGingiva={showGingiva}
                    viewMode={viewMode}
                    annotations={DEMO_ANNOTATIONS}
                    onSelectAnnotation={setSelectedAnnotation}
                  />
                </Suspense>
              </Canvas>

              {/* Hovered tooth tooltip */}
              {hoveredTooth && !selectedTooth && (
                <div className="absolute bottom-3 left-3 bg-background/90 border rounded px-2 py-1 text-xs shadow-lg pointer-events-none">
                  <span className="font-semibold">#{hoveredTooth}</span>
                  {" — "}
                  {ALL_TEETH.find((t) => t.fdi === hoveredTooth)?.name}
                </div>
              )}

              {/* Controls hint */}
              <div className="absolute bottom-3 right-3 text-[10px] text-white/50 pointer-events-none">
                Click: seleccionar · Arrastrar: rotar · Scroll: zoom · Shift+drag: pan
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          {/* Condition Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1"><Palette className="w-4 h-4" />Condiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div
                    className={cn("w-3 h-3 rounded-sm border", key === "missing" && "border-dashed border-red-400")}
                    style={{ backgroundColor: key === "missing" ? "transparent" : CONDITION_COLORS[key] }}
                  />
                  <span className="flex-1">{label}</span>
                  <Badge variant="outline" className="text-[10px] h-4">{conditionCounts[key] || 0}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Tooth Info */}
          {selectedToothData && (
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Diente #{selectedToothData.fdi}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p className="font-medium">{selectedToothData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Condición</p>
                  <Badge variant="outline" className="text-[10px]">
                    {CONDITION_LABELS[selectedToothData.condition || "healthy"]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Posición 3D</p>
                  <p className="font-mono text-[10px]">
                    X:{selectedToothData.position[0].toFixed(1)}{" "}
                    Y:{selectedToothData.position[1].toFixed(1)}{" "}
                    Z:{selectedToothData.position[2].toFixed(1)}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="w-full h-6 text-[10px]" onClick={() => setSelectedTooth(null)}>
                  Deseleccionar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Selected Annotation */}
          {selectedAnnotationData && (
            <Card className="border-amber-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Tag className="w-4 h-4" />Anotación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedAnnotationData.color }} />
                  <span className="font-medium">{selectedAnnotationData.label}</span>
                </div>
                <p className="text-muted-foreground">{selectedAnnotationData.description}</p>
                <Button size="sm" variant="ghost" className="h-5 text-[10px] p-0" onClick={() => setSelectedAnnotation(null)}>
                  Cerrar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Annotations List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <Tag className="w-4 h-4" />Anotaciones ({DEMO_ANNOTATIONS.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {DEMO_ANNOTATIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAnnotation(a.id === selectedAnnotation ? null : a.id)}
                  className={cn(
                    "w-full text-left flex items-start gap-1.5 p-1 rounded text-[11px] hover:bg-muted/50 transition",
                    selectedAnnotation === a.id && "bg-primary/10"
                  )}
                >
                  <div className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: a.color }} />
                  <div>
                    <p className="font-medium leading-tight">{a.label}</p>
                    <p className="text-muted-foreground leading-tight">{a.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
