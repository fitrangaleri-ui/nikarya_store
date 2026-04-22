"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    TicketIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowTrendingUpIcon,
    HashtagIcon,
    BanknotesIcon,
    ChartBarIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { StickyHeader } from "../sticky-header";
import PromoFormDialog, {
    type PromoFormData,
} from "./promo-form-dialog";

interface PromoStats {
    usage_count: number;
    total_discount: number;
    total_revenue: number;
}

interface Promo {
    id: string;
    code: string;
    name: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    max_discount_cap: number | null;
    min_order_amount: number | null;
    start_date: string | null;
    end_date: string | null;
    global_usage_limit: number | null;
    per_user_usage_limit: number | null;
    scope_type: "all" | "category" | "product";
    scope_ref_id: string | null;
    is_active: boolean;
    created_at: string;
    stats: PromoStats;
}

interface Category {
    id: string;
    name: string;
}
interface Product {
    id: string;
    title: string;
}

export default function AdminPromosPage() {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoFormData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchPromos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/promos");
            if (res.ok) {
                const data = await res.json();
                setPromos(data);
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMeta = useCallback(async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                fetch("/api/admin/promos/meta?type=categories"),
                fetch("/api/admin/promos/meta?type=products"),
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());
        } catch {
            /* silent */
        }
    }, []);

    useEffect(() => {
        fetchPromos();
        fetchMeta();
    }, [fetchPromos, fetchMeta]);

    const handleSave = async (data: PromoFormData) => {
        const isEdit = !!data.id;
        const res = await fetch("/api/admin/promos", {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Gagal menyimpan");
        }

        fetchPromos();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus promo ini? Tindakan ini tidak dapat dibatalkan."))
            return;
        setDeleting(id);
        try {
            await fetch(`/api/admin/promos?id=${id}`, { method: "DELETE" });
            fetchPromos();
        } finally {
            setDeleting(null);
        }
    };

    const handleToggle = async (promo: Promo) => {
        await fetch("/api/admin/promos", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: promo.id, is_active: !promo.is_active }),
        });
        fetchPromos();
    };

    const openEdit = (promo: Promo) => {
        setEditingPromo({
            id: promo.id,
            code: promo.code,
            name: promo.name,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            max_discount_cap: promo.max_discount_cap ?? "",
            min_order_amount: promo.min_order_amount ?? "",
            start_date: promo.start_date ?? "",
            end_date: promo.end_date ?? "",
            global_usage_limit: promo.global_usage_limit ?? "",
            per_user_usage_limit: promo.per_user_usage_limit ?? "",
            scope_type: promo.scope_type,
            scope_ref_id: promo.scope_ref_id ?? "",
            is_active: promo.is_active,
        });
        setDialogOpen(true);
    };

    const openCreate = () => {
        setEditingPromo(null);
        setDialogOpen(true);
    };

    // Aggregate stats
    const totalPromos = promos.length;
    const activePromos = promos.filter((p) => p.is_active).length;
    const totalDiscountGiven = promos.reduce(
        (s, p) => s + p.stats.total_discount,
        0,
    );
    const totalRevenue = promos.reduce((s, p) => s + p.stats.total_revenue, 0);

    const fmt = (n: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(n);

    const fmtDate = (d: string | null) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden pb-10">
            {/* ── Sticky Header ── */}
            <StickyHeader
                title="Promo"
                description="Kelola kode promo dan lihat analitik."
            />

            <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
                {/* ── Stats Cards ── */}
                <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
                    {/* Total Promo */}
                    <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase tracking-widest">
                                Total Promo
                            </Typography>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TicketIcon className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <Typography variant="h3" as="p" className="tracking-tight">
                            {totalPromos}
                        </Typography>
                        <Typography variant="caption" color="muted" className="mt-1">
                            {activePromos} aktif
                        </Typography>
                    </div>

                    {/* Penggunaan */}
                    <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase tracking-widest">
                                Penggunaan
                            </Typography>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <HashtagIcon className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <Typography variant="h3" as="p" className="tracking-tight">
                            {promos.reduce((s, p) => s + p.stats.usage_count, 0)}
                        </Typography>
                        <Typography variant="caption" color="muted" className="mt-1">
                            Total kali digunakan
                        </Typography>
                    </div>

                    {/* Diskon */}
                    <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase tracking-widest">
                                Diskon
                            </Typography>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BanknotesIcon className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <Typography variant="h4" as="p" className="tracking-tight">
                            {fmt(totalDiscountGiven)}
                        </Typography>
                        <Typography variant="caption" color="muted" className="mt-1">
                            Total diskon diberikan
                        </Typography>
                    </div>

                    {/* Revenue */}
                    <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase tracking-widest">
                                Revenue
                            </Typography>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ArrowTrendingUpIcon className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <Typography variant="h4" as="p" className="tracking-tight">
                            {fmt(totalRevenue)}
                        </Typography>
                        <Typography variant="caption" color="primary" className="font-bold mt-1 flex items-center gap-1.5">
                            <ChartBarIcon className="h-3.5 w-3.5" />
                            Dari orderan promo
                        </Typography>
                    </div>
                </div>

                {/* ── Promos Table ── */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center justify-between">
                        <div>
                            <Typography variant="h6" as="h2" className="text-white font-bold">
                                Manajemen Promo
                            </Typography>
                            <Typography variant="caption" className="text-white/70 font-medium mt-0.5">
                                {totalPromos} promo terdaftar
                            </Typography>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-full h-10 px-5 bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary transition-all font-bold text-sm"
                            onClick={openCreate}
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Buat Promo
                        </Button>
                    </div>

                    <div className="px-0 sm:px-2 pt-4 pb-2">
                        {loading ? (
                            <div className="py-16 text-center">
                                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                <Typography variant="body-sm" color="muted" className="font-medium text-center">
                                    Memuat data...
                                </Typography>
                            </div>
                        ) : promos.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                    <TicketIcon className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <Typography variant="body-sm" color="muted" className="font-semibold mb-4">
                                    Belum ada promo.
                                </Typography>
                                <Button
                                    variant="brand"
                                    className="rounded-full"
                                    onClick={openCreate}
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Buat Promo Pertama
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full px-4 sm:px-4">
                                <Table className="min-w-[800px]">
                                    <TableHeader className="bg-background/95 border-b border-border/40">
                                        <TableRow className="hover:bg-transparent border-transparent">
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Kode
                                            </TableHead>
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Nama
                                            </TableHead>
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Diskon
                                            </TableHead>
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Penggunaan
                                            </TableHead>
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Periode
                                            </TableHead>
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right pr-4">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {promos.map((promo) => (
                                            <TableRow
                                                key={promo.id}
                                                className="hover:bg-muted/30 border-border/40 transition-colors"
                                            >
                                                <TableCell className="py-4">
                                                    <Typography variant="body-sm" as="span" color="primary" className="font-black bg-primary/10 px-2.5 py-1 rounded-sm">
                                                        {promo.code}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Typography variant="body-sm" className="font-semibold">
                                                        {promo.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="py-4 whitespace-nowrap">
                                                    <Typography variant="body-sm" className="font-bold">
                                                        {promo.discount_type === "percentage"
                                                            ? `${promo.discount_value}%`
                                                            : fmt(promo.discount_value)}
                                                    </Typography>
                                                    {promo.max_discount_cap && (
                                                        <Typography variant="caption" color="muted" as="span" className="ml-1">
                                                            (maks {fmt(promo.max_discount_cap)})
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Typography variant="body-sm" className="font-bold">
                                                        <span className="text-primary">
                                                            {promo.stats.usage_count}
                                                        </span>
                                                        {promo.global_usage_limit && (
                                                            <span className="text-muted-foreground">
                                                                /{promo.global_usage_limit}
                                                            </span>
                                                        )}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="py-4 whitespace-nowrap">
                                                    <Typography variant="caption" color="muted" className="font-medium">
                                                        {fmtDate(promo.start_date)} — {fmtDate(promo.end_date)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <button onClick={() => handleToggle(promo)}>
                                                        <Badge
                                                            className={
                                                                promo.is_active
                                                                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3 py-1 cursor-pointer"
                                                                    : "bg-muted text-muted-foreground border border-border/50 hover:bg-muted/80 rounded-full shadow-none font-bold px-3 py-1 cursor-pointer"
                                                            }
                                                        >
                                                            {promo.is_active ? "Aktif" : "Nonaktif"}
                                                        </Badge>
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-right pr-4 py-4">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => openEdit(promo)}
                                                        >
                                                            <PencilIcon className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleDelete(promo.id)}
                                                            disabled={deleting === promo.id}
                                                        >
                                                            {deleting === promo.id ? (
                                                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <TrashIcon className="h-3.5 w-3.5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialog */}
                <PromoFormDialog
                    open={dialogOpen}
                    onClose={() => {
                        setDialogOpen(false);
                        setEditingPromo(null);
                    }}
                    onSave={handleSave}
                    initialData={editingPromo}
                    categories={categories}
                    products={products}
                />
            </div>
        </div>
    );
}
