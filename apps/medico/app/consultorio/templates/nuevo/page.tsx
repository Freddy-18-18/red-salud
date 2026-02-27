"use client";

import { useRouter } from "next/navigation";
import { CustomTemplateCreator } from "@/components/dashboard/medico/templates/custom-template-creator";
import { StructuredTemplate } from "@/lib/templates/structured-templates";

export default function NewTemplatePage() {
    const router = useRouter();

    const handleSave = (template: StructuredTemplate) => {
        const saved = localStorage.getItem('customTemplates');
        const customTemplates = saved ? JSON.parse(saved) : [];
        const updated = [...customTemplates, template];
        localStorage.setItem('customTemplates', JSON.stringify(updated));

        // Redirect to consultation to see the new template
        router.push('/consultorio/consulta');
    };

    return (
        <CustomTemplateCreator
            open={true}
            onClose={() => router.back()}
            onSave={handleSave}
            isPage={true}
        />
    );
}
