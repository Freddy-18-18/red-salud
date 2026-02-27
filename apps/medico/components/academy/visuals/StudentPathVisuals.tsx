"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sphere, Torus, MeshDistortMaterial, Box } from "@react-three/drei";
import * as THREE from "three";


// Common Canvas Wrapper
const VisualWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full h-[300px] md:h-[400px] relative pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            {children}
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_70%)] opacity-80" />
    </div>
);

function ImmersionScene() {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                <group ref={ref}>
                    <Torus args={[1.5, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
                    </Torus>
                    <Torus args={[2, 0.02, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
                    </Torus>
                    <Torus args={[1, 0.05, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
                        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
                    </Torus>
                </group>
                <Sphere args={[0.5, 32, 32]}>
                    <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
                </Sphere>
            </Float>
        </group>
    );
}

function PracticeScene() {
    return (
        <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh>
                <icosahedronGeometry args={[1.2, 0]} />
                <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
            </mesh>
            <mesh>
                <icosahedronGeometry args={[1, 1]} />
                <MeshDistortMaterial
                    color="#60a5fa"
                    distort={0.3}
                    speed={2}
                />
            </mesh>
            <Torus args={[1.6, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </Torus>
        </Float>
    );
}



const MENTORSHIP_PARTICLES = Array.from({ length: 15 }, () => ({
    position: [(Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3] as [number, number, number]
}));

function MentorshipScene() {
    const group = useRef<THREE.Group>(null);
    const mentorshipParticles = MENTORSHIP_PARTICLES;

    useFrame((state, delta) => {
        if (group.current) { group.current.rotation.y += delta * 0.2; }
    });

    return (
        <group ref={group}>
            {mentorshipParticles.map((p, i) => (
                <group key={i} position={p.position}>
                    <Sphere args={[0.08, 16, 16]}>
                        <meshBasicMaterial color="#a855f7" />
                    </Sphere>
                </group>
            ))}
            <Sphere args={[0.4, 32, 32]}>
                <meshStandardMaterial color="#d8b4fe" emissive="#a855f7" emissiveIntensity={1} />
            </Sphere>
            <Torus args={[2.5, 0.01, 16, 100]} rotation={[Math.PI / 2.3, 0, 0]}>
                <meshBasicMaterial color="#a855f7" transparent opacity={0.1} />
            </Torus>
        </group>
    );
}

function CertificationScene() {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Box args={[1.5, 1.5, 1.5]}>
                <meshPhysicalMaterial
                    color="#10b981"
                    transmission={0.9}
                    roughness={0}
                    thickness={1}
                />
            </Box>
            <Box args={[0.8, 0.8, 0.8]}>
                <meshStandardMaterial color="#34d399" wireframe />
            </Box>
        </Float>
    );
}

export const StudentPathVisuals = {
    Inmersion: () => <VisualWrapper><ImmersionScene /></VisualWrapper>,
    Practica: () => <VisualWrapper><PracticeScene /></VisualWrapper>,
    Mentoria: () => <VisualWrapper><MentorshipScene /></VisualWrapper>,
    Certificacion: () => <VisualWrapper><CertificationScene /></VisualWrapper>,
};
