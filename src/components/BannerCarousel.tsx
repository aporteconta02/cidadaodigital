import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Banner = {
  id: string;
  titulo: string | null;
  imagem_url: string;
  link_destino: string | null;
  ativo: boolean;
  posicao: number | null;
};

async function resolveImageUrl(value: string): Promise<string> {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.replace(/^banners\//, "");
  const { data } = await supabase.storage.from("banners").createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? "";
}

export function BannerCarousel({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<(Banner & { resolvedUrl: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("ativo", true)
        .order("posicao", { ascending: true });
      const rows = (data || []) as Banner[];
      const resolved = await Promise.all(
        rows.map(async (b) => ({ ...b, resolvedUrl: await resolveImageUrl(b.imagem_url) }))
      );
      if (!cancelled) {
        setBanners(resolved.filter((b) => !!b.resolvedUrl));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-[180px] w-full rounded-2xl" />
      </div>
    );
  }
  if (banners.length === 0) return null;

  const handleClick = (link: string | null) => {
    if (!link) return;
    if (/^https?:\/\//i.test(link)) window.open(link, "_blank", "noopener,noreferrer");
    else navigate({ to: link as any });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="min-w-0 flex-[0_0_100%]">
              <div
                onClick={() => handleClick(b.link_destino)}
                className="h-[180px] w-full overflow-hidden relative cursor-pointer"
              >
                <img src={b.resolvedUrl} alt={b.titulo ?? ""} className="w-full h-full object-cover" />
                {b.titulo && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white leading-tight">{b.titulo}</h3>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-5 bg-white" : "w-1.5 bg-white/50"
              )}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
