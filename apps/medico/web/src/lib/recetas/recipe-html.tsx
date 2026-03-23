import { VisualRecipePreview, VisualRecipePreviewProps } from "@/components/dashboard/recetas/visual-recipe-preview";
import ReactDOMServer from "react-dom/server";
import React from "react";

export async function generateRecipeHtml(
    data: VisualRecipePreviewProps["data"],
    settings: VisualRecipePreviewProps["settings"]
): Promise<string> {
    const printElement = (
        <div style={{ width: "216mm", height: "auto", minHeight: "279mm", margin: "0 auto" }}>
            <VisualRecipePreview
                data={data}
                settings={settings}
            />
        </div>
    );

    return ReactDOMServer.renderToStaticMarkup(printElement);
}
