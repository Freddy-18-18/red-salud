import { ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex items-center text-sm text-muted-foreground">
      <Link 
        href="/" 
        className="flex items-center hover:text-primary transition-colors duration-300"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        <span className="font-medium">Inicio</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-primary transition-colors duration-300"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
