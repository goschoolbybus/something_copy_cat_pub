"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, type Event, type Photo } from "@/lib/supabase";
import { Download, Loader2, Images } from "lucide-react";

export default function AlbumPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }
      setEvent(eventData);

      const { data: photosData } = await supabase
        .from("photos")
        .select("*")
        .eq("event_id", eventData.id)
        .order("created_at", { ascending: false });

      setPhotos(photosData || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  const downloadAll = async () => {
    // Simple way: open each in new tab or use a zip library.
    // For personal use, we provide individual downloads + a note.
    // Full zip needs a server-side function or client-side jszip.
    // Keep simple: download one by one or tell user to right-click.
    for (const photo of photos) {
      const a = document.createElement("a");
      a.href = photo.url;
      a.download = `photo-${photo.id}.jpg`;
      a.target = "_blank";
      a.click();
      // Small delay to avoid browser blocking
      await new Promise((r) => setTimeout(r, 300));
    }
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <p className="text-gray-500">共 {photos.length} 張照片</p>
          </div>

          {photos.length > 0 && (
            <button
              onClick={downloadAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition"
            >
              <Download className="w-5 h-5" />
              下載全部（逐張）
            </button>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
            <Images className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暫時未有照片</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow"
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <a
                  href={photo.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <Download className="w-8 h-8 text-white" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
