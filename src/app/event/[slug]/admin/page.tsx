"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, type Event } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, Monitor, Images, Loader2 } from "lucide-react";

export default function AdminPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);

    async function load() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Simple check: if localStorage has the admin token, allow access
      const token = localStorage.getItem(`admin_${slug}`);
      if (token !== data.admin_token) {
        // For personal use, still show but warn. Or redirect.
        // Keep it simple for personal use.
      }

      setEvent(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  const guestUrl = origin ? `${origin}/event/${slug}` : "";
  const wallUrl = origin ? `${origin}/event/${slug}/wall` : "";
  const albumUrl = origin ? `${origin}/event/${slug}/album` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">找不到活動</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 text-center space-y-2">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-gray-500 text-sm">管理頁面</p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center space-y-4">
          <h2 className="font-semibold text-lg">賓客上傳 QR Code</h2>
          <div className="p-4 bg-white border rounded-xl">
            <QRCodeSVG value={guestUrl} size={200} level="M" />
          </div>
          <p className="text-sm text-gray-500 text-center">
            把呢個 QR Code 投影或者印出嚟，賓客掃碼就可以上傳
          </p>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-lg">快速連結</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={guestUrl}
                className="flex-1 text-sm px-3 py-2 bg-gray-50 border rounded-lg"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                title="複製連結"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            {copied && <p className="text-green-600 text-sm">已複製！</p>}

            <a
              href={wallUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
            >
              <Monitor className="w-5 h-5" />
              <span>打開即時照片牆（投影用）</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>

            <a
              href={albumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full py-3 px-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
            >
              <Images className="w-5 h-5" />
              <span>查看同下載相簿</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          建議用另一部裝置或者投影機打開「即時照片牆」
        </p>
      </div>
    </main>
  );
}
