import DetalleRegistroMedicoPage from "./client";

export async function generateStaticParams() {
    return [{ id: "1" }];
}

export default function Page() {
    return <DetalleRegistroMedicoPage />;
}
