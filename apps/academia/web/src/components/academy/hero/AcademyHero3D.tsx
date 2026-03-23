"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function DNAHelix(props: React.ComponentProps<'group'>) {
    const ref = useRef<THREE.Points>(null);

    // Generate DNA Helix points
    const points = useMemo(() => {
        const count = 300; // Number of base pairs
        const radius = 2;
        const height = 12;
        const turns = 3;

        // Arrays for positions and colors
        const positions = new Float32Array(count * 2 * 3); // 2 strands
        const colors = new Float32Array(count * 2 * 3);

        const color1 = new THREE.Color("#06b6d4"); // Cyan
        const color2 = new THREE.Color("#3b82f6"); // Blue

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * height; // Center vertically

            // Strand 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;

            // Strand 2 (Offset by PI)
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;

            // Set Strand 1
            const i3 = i * 3;
            positions[i3] = x1;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z1;

            // Set Strand 2 (stored after first strand)
            const j3 = (count + i) * 3;
            positions[j3] = x2;
            positions[j3 + 1] = y;
            positions[j3 + 2] = z2;

            // Colors
            color1.toArray(colors, i3);
            color2.toArray(colors, j3);
        }

        return { positions, colors };
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.1; // Slow rotation
            // Slight floating wobble
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
        }
    });

    return (
        <group {...props}>
            <Points ref={ref} positions={points.positions} colors={points.colors} stride={3}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}



export default function AcademyHero3D() {
    return (
        <div className="absolute inset-0 z-0 opacity-60">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <fog attach="fog" args={["#020617", 5, 20]} /> {/* Fade into background */}

                <ambientLight intensity={0.5} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <DNAHelix position={[3, 0, 0]} rotation={[0, 0, Math.PI / 6]} />
                </Float>

                {/* Ambient floating particles (Knowledge/Synapses) */}
                <Sparkles
                    count={100}
                    scale={12}
                    size={4}
                    speed={0.4}
                    opacity={0.4}
                    color="#22d3ee"
                />
            </Canvas>
        </div>
    );
}
