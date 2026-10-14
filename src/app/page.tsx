"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const slug = uuidv4().slice(0, 8);
      const adminToken = uuidv4();

      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          name: eventName.trim(),
          slug,
          admin_token: adminToken,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Save admin token to localStorage for this browser
      localStorage.setItem(`admin_${slug}`, adminToken);

      router.push(`/event/${slug}/admin`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "建立活動失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">拍貼秀</h1>
          <p className="text-gray-500">自己用的活動照片即時分享工具</p>
        </div>

        <form onSubmit={createEvent} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              活動名稱
            </label>
            <input
              id="name"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例如：我們的婚禮、公司尾牙..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
              required
              maxLength={50}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !eventName.trim()}
            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition duration-200"
          >
            {loading ? "建立中..." : "建立活動"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          建立後會得到 QR Code，賓客掃碼即可上傳照片
        </p>
      </div>
    </main>
  );
}
