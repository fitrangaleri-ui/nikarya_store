"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";

export interface PromoFormData {
    id?: string;
    code: string;
    name: string;
    discount_type: "percentage" | "fixed";
    discount_value: number | string;
    max_discount_cap?: number | string;
    min_order_amount?: number | string;
    start_date?: string;
    end_date?: string;
    global_usage_limit?: number | string;
    per_user_usage_limit?: number | string;
    scope_type: "all" | "category" | "product";
    scope_ref_id?: string;
    is_active: boolean;
}

interface Category {
    id: string;
    name: string;
}
interface Product {
    id: string;
    title: string;
}

interface PromoFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: PromoFormData) => Promise<void>;
    initialData?: PromoFormData | null;
    categories: Category[];
    products: Product[];
}

const emptyForm: PromoFormData = {
    code: "",
    name: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount_cap: "",
    min_order_amount: "",
    start_date: "",
    end_date: "",
    global_usage_limit: "",
    per_user_usage_limit: "",
    scope_type: "all",
    scope_ref_id: "",
    is_active: true,
};

// Common input class consistent with product-form
const inputClass =
    "w-full rounded-sm border border-border/70 bg-background/50 px-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all";

export default function PromoFormDialog({
    open,
    onClose,
    onSave,
    initialData,
    categories,
    products,
}: PromoFormDialogProps) {
    const [form, setForm] = useState<PromoFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Convert a UTC Date to a local datetime-local string (YYYY-MM-DDTHH:mm)
    const toLocalDatetimeString = (isoDate: string): string => {
        const d = new Date(isoDate);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Convert a datetime-local string to a full ISO string with timezone offset
    const localToISO = (dtLocal: string): string => {
        if (!dtLocal) return "";
        // dtLocal is "YYYY-MM-DDTHH:mm" in the user's local time
        const d = new Date(dtLocal);
        return d.toISOString();
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                start_date: initialData.start_date
                    ? toLocalDatetimeString(initialData.start_date)
                    : "",
                end_date: initialData.end_date
                    ? toLocalDatetimeString(initialData.end_date)
                    : "",
            });
        } else {
            setForm(emptyForm);
        }
        setError("");
    }, [initialData, open]);

    const isEdit = !!initialData?.id;

    const handleSubmit = async () => {
        setError("");
        if (!form.code.trim()) {
            setError("Kode promo wajib diisi");
            return;
        }
        if (!form.name.trim()) {
            setError("Nama promo wajib diisi");
            return;
        }
        if (!form.discount_value || Number(form.discount_value) <= 0) {
            setError("Nilai diskon harus lebih dari 0");
            return;
        }
        if (
            form.discount_type === "percentage" &&
            Number(form.discount_value) > 100
        ) {
            setError("Persentase diskon tidak boleh lebih dari 100%");
            return;
        }

        setSaving(true);
        try {
            // Convert local dates to UTC ISO strings before saving
            const dataToSave = {
                ...form,
                start_date: form.start_date ? localToISO(form.start_date) : undefined,
                end_date: form.end_date ? localToISO(form.end_date) : undefined,
            };
            await onSave(dataToSave);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal menyimpan promo");
        } finally {
            setSaving(false);
        }
    };

    const set = (key: keyof PromoFormData, value: unknown) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border-border bg-card/95 backdrop-blur-xl p-0">
                {/* Dialog Header with primary background */}
                <DialogHeader className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 rounded-t-xl">
                    <DialogTitle className="text-white font-bold text-lg tracking-tight">
                        {isEdit ? "Edit Promo" : "Buat Promo Baru"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-5 md:p-7 space-y-5">
                    {/* Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Kode Promo <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.code}
                                onChange={(e) =>
                                    set("code", e.target.value.toUpperCase().replace(/\s/g, ""))
                                }
                                placeholder="DISKON20"
                                className={`h-11 uppercase ${inputClass}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Nama Internal <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="Diskon Hari Raya"
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Tipe Diskon
                            </Label>
                            <Select
                                value={form.discount_type}
                                onValueChange={(v) =>
                                    set("discount_type", v as "percentage" | "fixed")
                                }
                            >
                                <SelectTrigger className={`h-11 ${inputClass} shadow-none`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                                    <SelectItem value="percentage" className="rounded-xl cursor-pointer">
                                        Persentase (%)
                                    </SelectItem>
                                    <SelectItem value="fixed" className="rounded-xl cursor-pointer">
                                        Nominal Tetap (Rp)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Nilai Diskon <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={form.discount_value}
                                onChange={(e) => set("discount_value", e.target.value)}
                                placeholder={
                                    form.discount_type === "percentage" ? "20" : "50000"
                                }
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                    </div>

                    {/* Max Cap (only for percentage) */}
                    {form.discount_type === "percentage" && (
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Maks. Potongan (Rp){" "}
                                <span className="font-medium text-muted-foreground text-xs ml-1">
                                    (Opsional)
                                </span>
                            </Label>
                            <Input
                                type="number"
                                value={form.max_discount_cap}
                                onChange={(e) => set("max_discount_cap", e.target.value)}
                                placeholder="100000"
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                    )}

                    {/* Min Order */}
                    <div className="space-y-2">
                        <Label className="text-foreground font-bold">
                            Min. Belanja (Rp){" "}
                            <span className="font-medium text-muted-foreground text-xs ml-1">
                                (Opsional)
                            </span>
                        </Label>
                        <Input
                            type="number"
                            value={form.min_order_amount}
                            onChange={(e) => set("min_order_amount", e.target.value)}
                            placeholder="100000"
                            className={`h-11 ${inputClass}`}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Mulai
                            </Label>
                            <Input
                                type="datetime-local"
                                value={form.start_date}
                                onChange={(e) => set("start_date", e.target.value)}
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Berakhir
                            </Label>
                            <Input
                                type="datetime-local"
                                value={form.end_date}
                                onChange={(e) => set("end_date", e.target.value)}
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Batas Global
                            </Label>
                            <Input
                                type="number"
                                value={form.global_usage_limit}
                                onChange={(e) => set("global_usage_limit", e.target.value)}
                                placeholder="100"
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Batas Per User
                            </Label>
                            <Input
                                type="number"
                                value={form.per_user_usage_limit}
                                onChange={(e) => set("per_user_usage_limit", e.target.value)}
                                placeholder="1"
                                className={`h-11 ${inputClass}`}
                            />
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="space-y-2">
                        <Label className="text-foreground font-bold">
                            Berlaku Untuk
                        </Label>
                        <Select
                            value={form.scope_type}
                            onValueChange={(v) => {
                                set("scope_type", v);
                                if (v === "all") set("scope_ref_id", "");
                            }}
                        >
                            <SelectTrigger className={`h-11 ${inputClass} shadow-none`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                                <SelectItem value="all" className="rounded-xl cursor-pointer">Semua Produk</SelectItem>
                                <SelectItem value="category" className="rounded-xl cursor-pointer">Kategori Tertentu</SelectItem>
                                <SelectItem value="product" className="rounded-xl cursor-pointer">Produk Tertentu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {form.scope_type === "category" && (
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Pilih Kategori
                            </Label>
                            <Select
                                value={form.scope_ref_id || ""}
                                onValueChange={(v) => set("scope_ref_id", v)}
                            >
                                <SelectTrigger className={`h-11 ${inputClass} shadow-none`}>
                                    <SelectValue placeholder="Pilih kategori..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id} className="rounded-xl cursor-pointer">
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {form.scope_type === "product" && (
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold">
                                Pilih Produk
                            </Label>
                            <Select
                                value={form.scope_ref_id || ""}
                                onValueChange={(v) => set("scope_ref_id", v)}
                            >
                                <SelectTrigger className={`h-11 ${inputClass} shadow-none`}>
                                    <SelectValue placeholder="Pilih produk..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                                    {products.map((prod) => (
                                        <SelectItem key={prod.id} value={prod.id} className="rounded-xl cursor-pointer">
                                            {prod.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between rounded-sm border border-border/50 bg-background/50 px-4 py-3">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-foreground cursor-pointer">
                                Status Aktif
                            </Label>
                            <Typography variant="caption" color="muted" className="font-medium">
                                Promo dapat digunakan pelanggan
                            </Typography>
                        </div>
                        <Switch
                            checked={form.is_active}
                            onCheckedChange={(v) => set("is_active", v)}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-3">
                            <Typography variant="body-sm" color="destructive" className="font-semibold text-center">
                                {error}
                            </Typography>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-full border-border bg-surface-2"
                            disabled={saving}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="brand"
                            onClick={handleSubmit}
                            className="flex-1 h-11 rounded-full"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : isEdit ? (
                                "Simpan Perubahan"
                            ) : (
                                "Buat Promo"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
