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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="w-1.5 h-8 bg-primary rounded-full block" />
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                            Promo
                        </h1>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground ml-4.5">
                        Kelola kode promo dan lihat analitik.
                    </p>
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
                <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            Total Promo
                        </CardTitle>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                            {totalPromos}
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-2">
                            {activePromos} aktif
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            Penggunaan
                        </CardTitle>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                            {promos.reduce((s, p) => s + p.stats.usage_count, 0)}
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-2">
                            Total kali digunakan
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            Diskon
                        </CardTitle>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                            {fmt(totalDiscountGiven)}
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-2">
                            Total diskon diberikan
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            Revenue
                        </CardTitle>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                            {fmt(totalRevenue)}
                        </div>
                        <p className="text-[10px] sm:text-xs text-primary font-bold mt-2 flex items-center gap-1.5">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Dari orderan promo
                        </p>
                    </CardContent>
                </Card>
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
