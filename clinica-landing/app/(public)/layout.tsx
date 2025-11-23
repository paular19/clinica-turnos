import { ReactNode } from "react";
import PublicHeader from "./PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>

      <footer className="bg-slate-50 mt-16">
        <div className="container-max py-8 text-sm text-slate-600">
          © {new Date().getFullYear()} Clínica San Rafael — Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}
