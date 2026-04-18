"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EyeIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";

interface DemoLink {
    label: string;
    url: string;
}

interface DemoLinksModalProps {
    demoLinks: DemoLink[];
    children: React.ReactNode;
}

export function DemoLinksModal({ demoLinks, children }: DemoLinksModalProps) {
    const [open, setOpen] = useState(false);

    // No demo links → render children as-is (disabled state handled by parent)
    if (!demoLinks || demoLinks.length === 0) {
        return <>{children}</>;
    }

    // Single demo link → open directly, no modal
    if (demoLinks.length === 1) {
        return (
            <a
                href={demoLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
            >
                {children}
            </a>
        );
    }

    // Multiple demo links → show modal
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
                                <EyeIcon className="size-5 text-primary" />
                                Pilih Demo
                            </Typography>
                        </DialogTitle>
                        <Typography variant="body-sm" color="muted" className="mt-1">
                            Produk ini memiliki beberapa versi demo. Pilih salah satu:
                        </Typography>
                    </DialogHeader>
                    <div className="px-6 pb-6 space-y-2">
                        {demoLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 px-4 py-3.5 transition-all duration-200 group"
                                onClick={() => setOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                        <Typography variant="caption" className="font-bold text-primary">
                                            {index + 1}
                                        </Typography>
                                    </div>
                                    <Typography variant="body-sm" className="font-semibold group-hover:text-primary transition-colors">
                                        {link.label || `Demo ${index + 1}`}
                                    </Typography>
                                </div>
                                <ArrowTopRightOnSquareIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
