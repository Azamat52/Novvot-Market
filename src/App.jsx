import { lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, Route, Routes } from "react-router-dom";
import AdminLayout from "@/admin/components/AdminLayout";
import { applySettings } from "@/admin/lib/settings";
const Categories = lazy(() => import("@/admin/pages/Categories"));
const Dashboard = lazy(() => import("@/admin/pages/Dashboard"));
const Login = lazy(() => import("@/admin/pages/Login"));
const NewSale = lazy(() => import("@/admin/pages/NewSale"));
const Products = lazy(() => import("@/admin/pages/Products"));
const Sales = lazy(() => import("@/admin/pages/Sales"));
const Settings = lazy(() => import("@/admin/pages/Settings"));
const Stats = lazy(() => import("@/admin/pages/Stats"));
import { Toaster } from "@/components/ui/sonner";
import { selectSettings } from "@/store/settingsSlice";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-3">Sahifa topilmadi</p>
        <Link className="mt-4 inline-block text-primary" to="/">
          Boshqaruvga qaytish
        </Link>
      </div>
    </div>
  );
}

/** Mavzu (dark/light) va zichlikni sozlamalarga qarab qo'llaydi. */
function useThemeSync() {
  const settings = useSelector(selectSettings);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applySettings(settings, media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings]);
}

export default function App() {
  useThemeSync();

  return (
    <>
      <Toaster />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Yuklanmoqda...
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<NewSale />} />
            <Route path="categories" element={<Categories />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
