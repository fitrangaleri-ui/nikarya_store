"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertOctagon } from "lucide-react";
import { useState } from "react";

export function DownloadButton({
  orderId,
  downloadCount,
}: {
  orderId: string;
  downloadCount: number;
}) {
  const [loading, setLoading] = useState(false);
  const isMaxed = downloadCount >= 5;

  const handleDownload = async () => {
    if (isMaxed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/download/${orderId}`);

      if (res.redirected) {
        // The API redirects to the Google Drive URL
        window.open(res.url, "_blank");
        // Reload page to update download count
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal mendownload file");
      }
    } catch {
      alert("Terjadi kesalahan saat download.");
    } finally {
      setLoading(false);
    }
  };

  if (isMaxed) {
    return (
      <Button
        disabled
        variant="outline"
        size="sm"
        className="w-full bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
      >
        <AlertOctagon className="mr-2 h-4 w-4" />
        Limit Tercapai
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      size="sm"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download File
        </>
      )}
    </Button>
  );
}
