import OfflinePatientDetailPage from "./client";

export async function generateStaticParams() {
    return [{ id: "1" }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <OfflinePatientDetailPage />;
}
