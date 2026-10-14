"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase, type Event, type Photo } from "@/lib/supabase";
import { Upload, CheckCircle, Loader2 } from "lucide-react";

export default function GuestUploadPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setError("找不到此活動");
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    loadEvent();
  }, [slug]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !event) return;

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        // Compress a bit if too large (simple client-side)
        const path = `${event.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("photos")
          .getPublicUrl(path);

        const { error: dbError } = await supabase.from("photos").insert({
          event_id: event.id,
          url: urlData.publicUrl,
          storage_path: path,
        });

        if (dbError) throw dbError;
      }

      setSuccess(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "上傳失敗，請再試一次");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event?.name}</h1>
          <p className="text-gray-500 mt-1">分享你拍到的精彩瞬間</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-6 px-4 border-2 border-dashed border-sky-300 rounded-2xl hover:border-sky-500 hover:bg-sky-50 transition flex flex-col items-center gap-3 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
                <span className="text-sky-600 font-medium">上傳中...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-500" />
                <span className="text-green-600 font-medium">上傳成功！</span>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-sky-500" />
                <span className="text-sky-700 font-medium">點擊上傳照片</span>
                <span className="text-sm text-gray-400">可一次選擇多張</span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleUpload}
            className="hidden"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <p className="text-xs text-gray-400">
          上傳後會即時顯示在活動照片牆上
        </p>
      </div>
    </main>
  );
}
