// app/page.tsx

import ProtectPage from "./components/protect/DashboardLogin";

export default function Home() {
  return (
    <div>
      <ProtectPage />
    </div>
  );
}
