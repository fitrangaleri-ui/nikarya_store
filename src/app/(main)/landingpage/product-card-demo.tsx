"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EyeIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { Typography } from "@/components/ui/typography";
import { resolveImageSrc } from "@/lib/resolve-image";
import { useDemoPreview } from "@/components/demo-preview-provider";
import { Badge } from "@/components/ui/badge";

export function ProductCardDemo({ demoLink }: { demoLink: any }) {
  const { openPreview } = useDemoPreview();
  const imageSrc = resolveImageSrc(demoLink.image_url);

  return (
    <div className="group flex flex-col glass rounded-2xl overflow-hidden transition-all duration-500 h-full relative hover:shadow-elevation-lg hover:-translate-y-1 hover:border-primary/40">
      <div
        className="relative aspect-[4/3] bg-muted/30 overflow-hidden border-b border-border/40 w-full cursor-pointer"
        onClick={() => openPreview({ label: demoLink.label || "Demo", url: demoLink.url })}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={demoLink.label || "Demo Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={100}
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30">
            <PhotoIcon className="size-10 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors duration-300" />
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="glass" className="backdrop-blur-md tracking-tight">
            Premium Desain
          </Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <Typography
          variant="h6"
          as="h3"
          className="font-bold text-center line-clamp-1 group-hover:text-primary transition-colors"
        >
          {demoLink.label || "Demo Preview"}
        </Typography>

        <div className="mt-auto pt-2 w-full">
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            onClick={() => openPreview({ label: demoLink.label || "Demo", url: demoLink.url })}
          >
            <EyeIcon className="size-5" />
            Preview Tema
          </Button>
        </div>
      </div>
    </div>
  );
}
