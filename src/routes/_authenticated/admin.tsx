import { createFileRoute, Link, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useAuth();

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
        <h1 className="font-serif text-4xl">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You don't have permission to view the admin area.
        </p>
        <Navigate to="/" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex items-baseline justify-between border-b border-border pb-6">
        <div>
          <p className="label-eyebrow text-muted-foreground">Slistyle Atelier</p>
          <h1 className="mt-1 font-serif text-4xl">Admin</h1>
        </div>
        <nav className="flex gap-6">
          <Link
            to="/admin/products"
            className="label-eyebrow text-muted-foreground hover:text-foreground"
            activeProps={{ className: "label-eyebrow text-foreground underline underline-offset-8" }}
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="label-eyebrow text-muted-foreground hover:text-foreground"
            activeProps={{ className: "label-eyebrow text-foreground underline underline-offset-8" }}
          >
            Orders
          </Link>
        </nav>
      </div>
      <Outlet />
    </section>
  );
}
