declare module "react-simple-maps" {
    import * as React from "react";

    export interface ComposableMapProps {
        projection?: string;
        projectionConfig?: {
            center?: [number, number];
            scale?: number;
            rotate?: [number, number, number];
        };
        width?: number;
        height?: number;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface ZoomableGroupProps {
        center?: [number, number];
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        translateExtent?: [[number, number], [number, number]];
        onMoveStart?: (event: unknown) => void;
        onMove?: (event: unknown) => void;
        onMoveEnd?: (event: unknown) => void;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface GeographiesProps {
        geography: string | object;
        parseGeographies?: (geographies: unknown) => unknown[];
        children: (args: { geographies: unknown[] }) => React.ReactNode;
    }

    export interface GeographyProps {
        geography: unknown;
        className?: string;
        style?: {
            default?: React.CSSProperties;
            hover?: React.CSSProperties;
            pressed?: React.CSSProperties;
        };
        onMouseEnter?: (event: React.MouseEvent) => void;
        onMouseLeave?: (event: React.MouseEvent) => void;
        onClick?: (event: React.MouseEvent) => void;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    }

    export const ComposableMap: React.FC<ComposableMapProps>;
    export const ZoomableGroup: React.FC<ZoomableGroupProps>;
    export const Geographies: React.FC<GeographiesProps>;
    export const Geography: React.FC<GeographyProps>;
}
