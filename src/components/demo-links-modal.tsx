"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EyeIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { useDemoPreview } from "@/components/demo-preview-provider";

interface DemoLink {
    label: string;
    url: string;
    image_url?: string;
}

interface DemoLinksModalProps {
    demoLinks: DemoLink[];
    children: React.ReactNode;
}

export function DemoLinksModal({ demoLinks, children }: DemoLinksModalProps) {
    const [open, setOpen] = useState(false);
    const { openPreview } = useDemoPreview();

    // No demo links → render children as-is (disabled state handled by parent)
    if (!demoLinks || demoLinks.length === 0) {
        return <>{children}</>;
    }

    // Single demo link → open preview directly, no modal
    if (demoLinks.length === 1) {
        return (
            <div
                className="w-full cursor-pointer"
                onClick={() =>
                    openPreview({
                        label: demoLinks[0].label || "Demo",
                        url: demoLinks[0].url,
                    })
                }
            >
                {children}
            </div>
        );
    }

    // Multiple demo links → show picker modal, then open preview
    return (
        <>
            <div
                className="w-full cursor-pointer"
                onClick={() => setOpen(true)}
            >
                {children}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-3xl border-border/40 bg-card/95 backdrop-blur-xl p-0 sm:max-w-md overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle asChild>
                            <Typography variant="h4" className="flex items-center gap-2">
                                Pilih Demo
                            </Typography>
                        </DialogTitle>
                        <Typography variant="body-sm" color="muted" className="mt-1">
                            Produk ini memiliki beberapa versi demo. Pilih salah satu untuk preview:
                        </Typography>
                    </DialogHeader>
                    <div className="px-6 pb-6 space-y-2">
                        {demoLinks.map((link, index) => (
                            <button
                                key={index}
                                type="button"
                                className="flex items-center justify-between w-full rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 px-4 py-3.5 transition-all duration-200 group"
                                onClick={() => {
                                    setOpen(false);
                                    openPreview({
                                        label: link.label || `Demo ${index + 1}`,
                                        url: link.url,
                                    });
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    {link.image_url ? (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 relative shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={link.image_url} alt={link.label} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors shrink-0">
                                            <Typography variant="caption" className="font-bold text-primary text-lg">
                                                {index + 1}
                                            </Typography>
                                        </div>
                                    )}
                                    <Typography variant="body-sm" className="font-semibold group-hover:text-primary transition-colors text-left">
                                        {link.label || `Demo ${index + 1}`}
                                    </Typography>
                                </div>
                                <DevicePhoneMobileIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
