import { MedicoLayoutClient } from "./layout.client";

export default function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MedicoLayoutClient>{children}</MedicoLayoutClient>;
}
