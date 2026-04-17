"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Ticket,
    Plus,
    Pencil,
    Trash2,
    TrendingUp,
    Hash,
    DollarSign,
    BarChart3,
    Loader2,
} from "lucide-react";
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
        <div className="space-y-6 md:space-y-8 pb-10">
            {/* Header — Primary banner */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="relative flex-1 rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20">
                    <div aria-hidden className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div aria-hidden className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]" style={{ background: "rgba(255,255,255,0.05)" }} />
                    <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" }} />
                    <div aria-hidden className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3">
                                <Ticket className="w-3 h-3" />
                                Manajemen Promo
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                                Promo
                            </h1>
                            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
                                Kelola kode promo dan lihat analitik.
                            </p>
                        </div>

                        <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
                            <Ticket className="w-6 h-6 text-primary-foreground" />
                        </div>
                    </div>
                </div>
                <Button
                    variant="brand"
                    className="rounded-full h-11 px-6"
                    onClick={openCreate}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Promo
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
                <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                            Total Promo
                        </p>
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-foreground tracking-tight">
                        {totalPromos}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {activePromos} aktif
                    </p>
                </div>

                <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                            Penggunaan
                        </p>
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Hash className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-foreground tracking-tight">
                        {promos.reduce((s, p) => s + p.stats.usage_count, 0)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Total kali digunakan
                    </p>
                </div>

                <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/8 blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                            Diskon
                        </p>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-foreground tracking-tight">
                        {fmt(totalDiscountGiven)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Total diskon diberikan
                    </p>
                </div>

                <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/8 blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                            Revenue
                        </p>
                        <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-foreground tracking-tight">
                        {fmt(totalRevenue)}
                    </p>
                    <p className="text-[11px] text-primary font-bold mt-1 flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Dari orderan promo
                    </p>
                </div>
            </div>

            {/* Promos Table */}
            <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 border-b border-border/40">
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-primary" />
                        </div>
                        Daftar Promo
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 sm:px-2 pt-4 pb-2">
                    {loading ? (
                        <div className="py-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Memuat data...
                            </p>
                        </div>
                    ) : promos.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Ticket className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground font-semibold text-sm mb-4">
                                Belum ada promo.
                            </p>
                            <Button
                                variant="brand"
                                className="rounded-full"
                                onClick={openCreate}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Promo Pertama
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full px-4 sm:px-4">
                            <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/40">
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Kode
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Nama
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Diskon
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Penggunaan
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Periode
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-right pr-4">
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
                                                <span className="text-sm font-black text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                                                    {promo.code}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-foreground py-4">
                                                {promo.name}
                                            </TableCell>
                                            <TableCell className="text-sm font-bold text-foreground py-4 whitespace-nowrap">
                                                {promo.discount_type === "percentage"
                                                    ? `${promo.discount_value}%`
                                                    : fmt(promo.discount_value)}
                                                {promo.max_discount_cap && (
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        (maks {fmt(promo.max_discount_cap)})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm font-bold text-foreground py-4">
                                                <span className="text-primary">
                                                    {promo.stats.usage_count}
                                                </span>
                                                {promo.global_usage_limit && (
                                                    <span className="text-muted-foreground">
                                                        /{promo.global_usage_limit}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-muted-foreground py-4 whitespace-nowrap">
                                                {fmtDate(promo.start_date)} — {fmtDate(promo.end_date)}
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
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleDelete(promo.id)}
                                                        disabled={deleting === promo.id}
                                                    >
                                                        {deleting === promo.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
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
                </CardContent>
            </Card>

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
    );
}
