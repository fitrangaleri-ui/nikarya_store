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
import { Loader2 } from "lucide-react";

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

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                start_date: initialData.start_date
                    ? new Date(initialData.start_date).toISOString().slice(0, 16)
                    : "",
                end_date: initialData.end_date
                    ? new Date(initialData.end_date).toISOString().slice(0, 16)
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
            await onSave(form);
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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border-border/40 bg-card backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {isEdit ? "Edit Promo" : "Buat Promo Baru"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Kode Promo <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.code}
                                onChange={(e) =>
                                    set("code", e.target.value.toUpperCase().replace(/\s/g, ""))
                                }
                                placeholder="DISKON20"
                                className="h-10 rounded-xl uppercase"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Nama Internal <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="Diskon Hari Raya"
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Tipe Diskon
                            </Label>
                            <Select
                                value={form.discount_type}
                                onValueChange={(v) =>
                                    set("discount_type", v as "percentage" | "fixed")
                                }
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                                    <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Nilai Diskon <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={form.discount_value}
                                onChange={(e) => set("discount_value", e.target.value)}
                                placeholder={
                                    form.discount_type === "percentage" ? "20" : "50000"
                                }
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Max Cap (only for percentage) */}
                    {form.discount_type === "percentage" && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Maks. Potongan (Rp){" "}
                                <span className="font-normal text-muted-foreground/70">
                                    Opsional
                                </span>
                            </Label>
                            <Input
                                type="number"
                                value={form.max_discount_cap}
                                onChange={(e) => set("max_discount_cap", e.target.value)}
                                placeholder="100000"
                                className="h-10 rounded-xl"
                            />
                        </div>
                    )}

                    {/* Min Order */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1">
                            Min. Belanja (Rp){" "}
                            <span className="font-normal text-muted-foreground/70">
                                Opsional
                            </span>
                        </Label>
                        <Input
                            type="number"
                            value={form.min_order_amount}
                            onChange={(e) => set("min_order_amount", e.target.value)}
                            placeholder="100000"
                            className="h-10 rounded-xl"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Mulai
                            </Label>
                            <Input
                                type="datetime-local"
                                value={form.start_date}
                                onChange={(e) => set("start_date", e.target.value)}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Berakhir
                            </Label>
                            <Input
                                type="datetime-local"
                                value={form.end_date}
                                onChange={(e) => set("end_date", e.target.value)}
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Batas Global
                            </Label>
                            <Input
                                type="number"
                                value={form.global_usage_limit}
                                onChange={(e) => set("global_usage_limit", e.target.value)}
                                placeholder="100"
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Batas Per User
                            </Label>
                            <Input
                                type="number"
                                value={form.per_user_usage_limit}
                                onChange={(e) => set("per_user_usage_limit", e.target.value)}
                                placeholder="1"
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground ml-1">
                            Berlaku Untuk
                        </Label>
                        <Select
                            value={form.scope_type}
                            onValueChange={(v) => {
                                set("scope_type", v);
                                if (v === "all") set("scope_ref_id", "");
                            }}
                        >
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Produk</SelectItem>
                                <SelectItem value="category">Kategori Tertentu</SelectItem>
                                <SelectItem value="product">Produk Tertentu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {form.scope_type === "category" && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Pilih Kategori
                            </Label>
                            <Select
                                value={form.scope_ref_id || ""}
                                onValueChange={(v) => set("scope_ref_id", v)}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Pilih kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {form.scope_type === "product" && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-1">
                                Pilih Produk
                            </Label>
                            <Select
                                value={form.scope_ref_id || ""}
                                onValueChange={(v) => set("scope_ref_id", v)}
                            >
                                <SelectTrigger className="h-10 rounded-xl">
                                    <SelectValue placeholder="Pilih produk..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((prod) => (
                                        <SelectItem key={prod.id} value={prod.id}>
                                            {prod.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                        <div>
                            <p className="text-sm font-bold text-foreground">Status Aktif</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Promo dapat digunakan pelanggan
                            </p>
                        </div>
                        <Switch
                            checked={form.is_active}
                            onCheckedChange={(v) => set("is_active", v)}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm font-semibold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-center">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl"
                            disabled={saving}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="brand"
                            onClick={handleSubmit}
                            className="flex-1 h-11 rounded-xl"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
