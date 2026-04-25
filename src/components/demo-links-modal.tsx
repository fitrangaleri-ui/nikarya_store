"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { DevicePhoneMobileIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
                <DialogContent showCloseButton={false} className="max-w-[400px] overflow-hidden border-border/40 bg-card p-0 gap-0 animate-in fade-in zoom-in-95 duration-500 rounded-xl">
                    {/* ── Premium Header ── */}
                    <div className="relative bg-primary px-7 pt-10 pb-9">


                        {/* Glass Close Button */}
                        <DialogClose asChild>
                            <button className="absolute right-5 top-5 z-20 rounded-full border border-white/20 bg-white/10 p-2 text-white transition-all hover:bg-white/20 focus:outline-none">
                                <XMarkIcon className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </button>
                        </DialogClose>

                        <div className="relative z-10 space-y-1">
                            <DialogHeader className="p-0 text-left">
                                <DialogTitle asChild>
                                    <Typography variant="h4" className="leading-tight text-white">
                                        Pilih Versi Demo
                                    </Typography>
                                </DialogTitle>
                            </DialogHeader>
                            <Typography variant="body-sm" className="font-normal text-white/80">
                                Produk ini memiliki beberapa variasi desain. Pilih untuk melihat preview:
                            </Typography>
                        </div>
                    </div>

                    {/* ── Demo List ── */}
                    <div className="bg-grid-pattern relative px-6 pt-8 pb-10">
                        {/* White overlay to soften grid and make demo bars pop */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80 dark:from-card/60 dark:via-card/40 dark:to-card/80" />
                        <div className="relative z-10 space-y-3.5">
                            {demoLinks.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-card px-2 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
                                    onClick={() => {
                                        setOpen(false);
                                        openPreview({
                                            label: link.label || `Demo ${index + 1}`,
                                            url: link.url,
                                        });
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Image/Index Icon */}
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-border/40 bg-muted/20 group-hover:border-primary/20">
                                            {link.image_url ? (
                                                <img
                                                    src={link.image_url}
                                                    alt={link.label}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-115"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                                    <Typography variant="h5" className="font-black text-primary/40 group-hover:text-primary transition-colors">
                                                        {index + 1}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>

                                        {/* Labels */}
                                        <div className="text-left">
                                            <Typography variant="body-base" className="block font-semibold leading-tight group-hover:text-primary transition-colors">
                                                {link.label || `Demo ${index + 1}`}
                                            </Typography>
                                            <div className="mt-1 flex items-center gap-1.5 opacity-50">
                                                <DevicePhoneMobileIcon className="h-3 w-3" />
                                                <Typography variant="caption" className="text-[10px] font-semibold">
                                                    Mobile View
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Icon */}
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
