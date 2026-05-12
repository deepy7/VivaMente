import { Outlet } from "react-router";

/**
 * Layout para páginas de autenticación (sin navbar/footer)
 */
export default function AuthLayout() {
  return (
    <div className="min-h-dvh bg-gray-50 overflow-x-hidden">
      <Outlet />
    </div>
  );
}
