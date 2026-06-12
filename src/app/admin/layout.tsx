import { validateAdminAccess } from "./lib";
import AdminLayoutClient from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // strict admin session and role validation on server side (very fast with cache)
  await validateAdminAccess();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
