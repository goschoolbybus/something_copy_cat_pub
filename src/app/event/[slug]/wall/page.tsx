"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase, type Event, type Photo } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function WallPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"grid" | "slideshow">("slideshow");

  useEffect(() => {
    async function init() {
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

      // Realtime subscription
      const channel = supabase
        .channel(`photos-${eventData.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "photos",
            filter: `event_id=eq.${eventData.id}`,
          },
          (payload) => {
            const newPhoto = payload.new as Photo;
            setPhotos((prev) => [newPhoto, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    init();
  }, [slug]);

  // Slideshow auto advance
  useEffect(() => {
    if (mode !== "slideshow" || photos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [mode, photos.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        找不到活動
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <h1 className="text-xl font-semibold truncate">{event.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("slideshow")}
            className={`px-3 py-1 rounded-full text-sm ${
              mode === "slideshow" ? "bg-white text-black" : "bg-white/20"
            }`}
          >
            輪播
          </button>
          <button
            onClick={() => setMode("grid")}
            className={`px-3 py-1 rounded-full text-sm ${
              mode === "grid" ? "bg-white text-black" : "bg-white/20"
            }`}
          >
            網格
          </button>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-2xl text-white/70">等待賓客上傳照片...</p>
          <p className="text-white/40">掃碼上傳後會即時出現喺呢度</p>
        </div>
      ) : mode === "slideshow" ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <img
            key={photos[currentIndex]?.id}
            src={photos[currentIndex]?.url}
            alt=""
            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl photo-enter"
          />
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/60 text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      ) : (
        <div className="pt-16 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square overflow-hidden rounded-lg photo-enter"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
