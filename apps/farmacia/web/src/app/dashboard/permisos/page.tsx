'use client';

import { Shield, ArrowRight, Users } from 'lucide-react';
import { Button } from '@red-salud/design-system';
import {
  Card,
  CardContent,
} from '@red-salud/design-system';
import Link from 'next/link';

export default function PermisosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Permisos</h1>
          <p className="text-muted-foreground">
            Control de acceso del personal
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/30">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2">
                Los permisos se gestionan desde Personal
              </h2>
              <p className="text-muted-foreground mb-6">
                Cada rol tiene permisos predefinidos. Puedes asignar roles desde
                la seccion de Gestion de Personal.
              </p>

              <Link href="/dashboard/personal">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Ir a Personal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
