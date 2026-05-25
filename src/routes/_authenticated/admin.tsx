import { createFileRoute, Link, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useAdminNewOrders } from "@/hooks/use-admin-new-orders";
import { AdminOrdersBadge } from "@/components/AdminOrdersBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const { newCount } = useAdminNewOrders();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="label-eyebrow text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-32 text-center">
        <h1 className="font-display text-4xl">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You don't have permission to view the admin area.
        </p>
        <Navigate to="/" />
      </div>
    );
  }

  const navLinkClass =
    "label-eyebrow relative inline-flex items-center gap-2 text-muted-foreground transition-colors duration-300 hover:text-foreground";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-10 flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-eyebrow text-gold">Slistyle Atelier</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">Admin</h1>
        </div>
        <nav className="flex flex-wrap gap-4 sm:gap-6">
          <Link
            to="/admin/products"
            className={navLinkClass}
            activeProps={{ className: cn(navLinkClass, "text-foreground underline underline-offset-8") }}
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className={navLinkClass}
            activeProps={{ className: cn(navLinkClass, "text-foreground underline underline-offset-8") }}
          >
            Orders
            <AdminOrdersBadge count={newCount} />
          </Link>
          <Link
            to="/admin/settings"
            className={navLinkClass}
            activeProps={{ className: cn(navLinkClass, "text-foreground underline underline-offset-8") }}
          >
            Settings
          </Link>
        </nav>
      </div>
      <Outlet />
    </section>
  );
}
