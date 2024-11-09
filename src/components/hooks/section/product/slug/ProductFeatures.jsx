import { Timer, RefreshCcw, Users } from "lucide-react";

export default function ProductFeatures() {
  return (
    <div className="component">
      <div className="box">
        <Timer />
        <span>Pengerjaan Tergantung Kerumitan</span>
      </div>

      <div className="box">
        <RefreshCcw />
        <span>Gratis Revisi Selama 3 Kali</span>
      </div>

      <div className="box">
        <Users />
        <span>Dikerjakan oleh Tim Ahli</span>
      </div>
    </div>
  );
}
