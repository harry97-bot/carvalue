import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
