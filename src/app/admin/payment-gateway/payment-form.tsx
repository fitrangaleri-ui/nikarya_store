'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    saveGatewayConfig,
    setActiveGateway,
    setPaymentMode,
    saveManualMethod,
    deleteManualMethod,
    toggleManualMethod,
} from './actions'
import {
    CheckCircle,
    AlertCircle,
    Zap,
    HandCoins,
    Trash2,
    Plus,
    Pencil,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react'

type GatewayConfig = {
    id: string
    gateway_name: string
    display_name: string
    api_key: string
    secret_key: string
    merchant_id: string | null
    environment: string
    is_active: boolean
    payment_mode: string
    webhook_url: string | null
    updated_at: string
}

type ManualMethod = {
    id: string
    type: string
    provider_name: string
    account_name: string
    account_number: string
    logo_url: string | null
    is_active: boolean
    sort_order: number
}

interface PaymentFormProps {
    configs: GatewayConfig[]
    manualMethods: ManualMethod[]
    currentMode: string
}

export function PaymentForm({ configs, manualMethods, currentMode }: PaymentFormProps) {
    const [mode, setMode] = useState(currentMode)
    const [activeTab, setActiveTab] = useState<string>(
        configs.find((c) => c.is_active)?.gateway_name || configs[0]?.gateway_name || 'midtrans'
    )
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Manual method form state
    const [showManualForm, setShowManualForm] = useState(false)
    const [editingMethod, setEditingMethod] = useState<ManualMethod | null>(null)

    function showMessage(msg: string, isError = false) {
        if (isError) {
            setError(msg)
            setSuccess(null)
        } else {
            setSuccess(msg)
            setError(null)
        }
        setTimeout(() => { setError(null); setSuccess(null) }, 3000)
    }

    // ── Handle mode toggle ──
    function handleModeChange(newMode: string) {
        setMode(newMode)
        startTransition(async () => {
            const result = await setPaymentMode(newMode)
            if (result?.error) showMessage(result.error, true)
            else showMessage(`Mode pembayaran berhasil diubah ke ${newMode === 'gateway' ? 'Gateway' : 'Manual'}`)
        })
    }

    // ── Handle gateway save ──
    function handleSaveGateway(formData: FormData) {
        setError(null)
        setSuccess(null)
        startTransition(async () => {
            const result = await saveGatewayConfig(formData)
            if (result?.error) showMessage(result.error, true)
            else showMessage('Konfigurasi gateway berhasil disimpan!')
        })
    }

    // ── Handle set active gateway ──
    function handleSetActive(gatewayId: string) {
        startTransition(async () => {
            const result = await setActiveGateway(gatewayId)
            if (result?.error) showMessage(result.error, true)
            else showMessage('Gateway aktif berhasil diubah!')
        })
    }

    // ── Handle manual method save ──
    function handleSaveManualMethod(formData: FormData) {
        startTransition(async () => {
            const result = await saveManualMethod(formData)
            if (result?.error) showMessage(result.error, true)
            else {
                showMessage('Metode pembayaran manual berhasil disimpan!')
                setShowManualForm(false)
                setEditingMethod(null)
            }
        })
    }

    // ── Handle delete manual method ──
    function handleDeleteManualMethod(id: string) {
        if (!confirm('Hapus metode pembayaran ini?')) return
        startTransition(async () => {
            const result = await deleteManualMethod(id)
            if (result?.error) showMessage(result.error, true)
            else showMessage('Metode pembayaran berhasil dihapus!')
        })
    }

    // ── Handle toggle manual method ──
    function handleToggleManualMethod(id: string, currentActive: boolean) {
        startTransition(async () => {
            const result = await toggleManualMethod(id, !currentActive)
            if (result?.error) showMessage(result.error, true)
            else showMessage(`Metode ${!currentActive ? 'diaktifkan' : 'dinonaktifkan'}!`)
        })
    }

    const currentConfig = configs.find((c) => c.gateway_name === activeTab)

    return (
        <div className="space-y-6 max-w-3xl">
            {/* ── Status Messages ── */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {success}
                </div>
            )}

            {/* ══════════════════════════════════════
                SECTION 1: Payment Mode Toggle
               ══════════════════════════════════════ */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Mode Pembayaran</h2>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => handleModeChange('gateway')}
                        disabled={isPending}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${mode === 'gateway'
                                ? 'border-blue-300 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <Zap className="h-4 w-4" />
                        Gateway Mode
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('manual')}
                        disabled={isPending}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${mode === 'manual'
                                ? 'border-amber-300 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <HandCoins className="h-4 w-4" />
                        Manual Mode
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                    {mode === 'gateway'
                        ? '💳 Pembayaran diproses melalui payment gateway (Midtrans / Duitku).'
                        : '🏦 Pembayaran manual — pelanggan melakukan transfer dan konfirmasi sendiri.'}
                </p>
            </div>

            {/* ══════════════════════════════════════
                SECTION 2: Gateway Mode Panel
               ══════════════════════════════════════ */}
            {mode === 'gateway' && (
                <div className="space-y-4">
                    {/* Gateway Tabs */}
                    <div className="flex gap-2">
                        {configs.map((config) => (
                            <button
                                key={config.gateway_name}
                                type="button"
                                onClick={() => setActiveTab(config.gateway_name)}
                                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${activeTab === config.gateway_name
                                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {config.display_name}
                                {config.is_active && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs hover:bg-emerald-100">
                                        Aktif
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Gateway Config Form */}
                    {currentConfig && (
                        <form action={handleSaveGateway} className="space-y-4">
                            <input type="hidden" name="id" value={currentConfig.id} />
                            <input type="hidden" name="gateway_name" value={currentConfig.gateway_name} />

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Konfigurasi {currentConfig.display_name}
                                    </h2>
                                    {currentConfig.is_active ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                            ✅ Gateway Aktif
                                        </Badge>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetActive(currentConfig.id)}
                                            disabled={isPending}
                                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            Jadikan Aktif
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="display_name" className="text-slate-700 font-medium">
                                        Nama Tampilan
                                    </Label>
                                    <Input
                                        id="display_name"
                                        name="display_name"
                                        defaultValue={currentConfig.display_name}
                                        required
                                        placeholder="Contoh: Midtrans"
                                        className="border-slate-300 bg-white text-slate-900"
                                    />
                                </div>

                                {/* Environment Toggle */}
                                <EnvironmentToggle defaultValue={currentConfig.environment} />

                                {/* API Keys */}
                                <div className="pt-2 border-t border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-800">API Keys</h3>
                                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">
                                            🔒 Tersimpan di database
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="api_key" className="text-slate-700 font-medium">
                                            API Key / Client Key
                                        </Label>
                                        <Input
                                            id="api_key"
                                            name="api_key"
                                            type="password"
                                            defaultValue={currentConfig.api_key}
                                            placeholder="Client key..."
                                            className="border-slate-300 bg-white text-slate-900 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="secret_key" className="text-slate-700 font-medium">
                                            Secret Key / Server Key
                                        </Label>
                                        <Input
                                            id="secret_key"
                                            name="secret_key"
                                            type="password"
                                            defaultValue={currentConfig.secret_key}
                                            placeholder="Server key..."
                                            className="border-slate-300 bg-white text-slate-900 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="merchant_id" className="text-slate-700 font-medium">
                                            Merchant ID{' '}
                                            <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </Label>
                                        <Input
                                            id="merchant_id"
                                            name="merchant_id"
                                            defaultValue={currentConfig.merchant_id || ''}
                                            placeholder="Merchant ID..."
                                            className="border-slate-300 bg-white text-slate-900 font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Last Updated */}
                                {currentConfig.updated_at && (
                                    <p className="text-xs text-slate-500 text-right pt-2">
                                        Terakhir diperbarui:{' '}
                                        {new Date(currentConfig.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                disabled={isPending}
                            >
                                {isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                            </Button>
                        </form>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════
                SECTION 3: Manual Mode Panel
               ══════════════════════════════════════ */}
            {mode === 'manual' && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Metode Pembayaran Manual</h2>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => { setEditingMethod(null); setShowManualForm(true) }}
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Tambah
                            </Button>
                        </div>

                        {/* Methods List */}
                        {manualMethods.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">
                                Belum ada metode pembayaran manual. Klik &quot;Tambah&quot; untuk menambahkan.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {manualMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`flex items-center gap-4 rounded-lg border p-4 transition ${method.is_active
                                                ? 'border-slate-200 bg-white'
                                                : 'border-slate-100 bg-slate-50 opacity-60'
                                            }`}
                                    >
                                        {/* Icon */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                                            {method.type === 'bank_transfer' ? '🏦' : '📱'}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {method.provider_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {method.account_name} — {method.account_number}
                                            </p>
                                            <Badge className={`mt-1 text-xs ${method.type === 'bank_transfer'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                    : 'bg-purple-50 text-purple-600 border-purple-200'
                                                } hover:bg-transparent`}>
                                                {method.type === 'bank_transfer' ? 'Bank Transfer' : 'E-Wallet'}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleManualMethod(method.id, method.is_active)}
                                                disabled={isPending}
                                                className="p-1.5 rounded-md hover:bg-slate-100 transition"
                                                title={method.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            >
                                                {method.is_active ? (
                                                    <ToggleRight className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5 text-slate-400" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setEditingMethod(method); setShowManualForm(true) }}
                                                className="p-1.5 rounded-md hover:bg-slate-100 transition"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4 text-slate-500" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteManualMethod(method.id)}
                                                disabled={isPending}
                                                className="p-1.5 rounded-md hover:bg-red-50 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Add/Edit Manual Method Form ── */}
                    {showManualForm && (
                        <ManualMethodForm
                            method={editingMethod}
                            onSubmit={handleSaveManualMethod}
                            onCancel={() => { setShowManualForm(false); setEditingMethod(null) }}
                            isPending={isPending}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

// ── Environment Toggle Sub-Component ──
function EnvironmentToggle({ defaultValue }: { defaultValue: string }) {
    const [environment, setEnvironment] = useState(defaultValue)

    return (
        <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Environment</Label>
            <input type="hidden" name="environment" value={environment} />
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setEnvironment('sandbox')}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${environment === 'sandbox'
                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    🧪 Sandbox
                </button>
                <button
                    type="button"
                    onClick={() => setEnvironment('production')}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${environment === 'production'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    🚀 Production
                </button>
            </div>
            {environment === 'production' && (
                <p className="text-xs text-orange-600 font-medium">
                    ⚠️ Mode production akan memproses pembayaran nyata.
                </p>
            )}
        </div>
    )
}

// ── Manual Method Form Sub-Component ──
function ManualMethodForm({
    method,
    onSubmit,
    onCancel,
    isPending,
}: {
    method: ManualMethod | null
    onSubmit: (formData: FormData) => void
    onCancel: () => void
    isPending: boolean
}) {
    const [type, setType] = useState(method?.type || 'bank_transfer')

    return (
        <form action={onSubmit} className="rounded-xl border border-blue-200 bg-blue-50/30 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
                {method ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
            </h3>

            {method && <input type="hidden" name="id" value={method.id} />}

            {/* Type selector */}
            <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Tipe</Label>
                <input type="hidden" name="type" value={type} />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setType('bank_transfer')}
                        className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${type === 'bank_transfer'
                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        🏦 Bank Transfer
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('ewallet')}
                        className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${type === 'ewallet'
                                ? 'border-purple-300 bg-purple-50 text-purple-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        📱 E-Wallet
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="provider_name" className="text-slate-700 font-medium">
                    {type === 'bank_transfer' ? 'Nama Bank' : 'Nama Provider'}
                </Label>
                <Input
                    id="provider_name"
                    name="provider_name"
                    defaultValue={method?.provider_name || ''}
                    required
                    placeholder={type === 'bank_transfer' ? 'Contoh: BCA' : 'Contoh: GoPay'}
                    className="border-slate-300 bg-white text-slate-900"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="account_name" className="text-slate-700 font-medium">
                    {type === 'bank_transfer' ? 'Nama Pemilik Rekening' : 'Nama Akun'}
                </Label>
                <Input
                    id="account_name"
                    name="account_name"
                    defaultValue={method?.account_name || ''}
                    required
                    placeholder="Nama pemilik rekening / akun"
                    className="border-slate-300 bg-white text-slate-900"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="account_number" className="text-slate-700 font-medium">
                    {type === 'bank_transfer' ? 'Nomor Rekening' : 'Nomor HP / Email'}
                </Label>
                <Input
                    id="account_number"
                    name="account_number"
                    defaultValue={method?.account_number || ''}
                    required
                    placeholder={type === 'bank_transfer' ? '1234567890' : '08xxxxxxxxxx'}
                    className="border-slate-300 bg-white text-slate-900 font-mono"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-slate-700 font-medium">
                    URL Logo / QR Code{' '}
                    <span className="text-slate-400 font-normal">(Opsional)</span>
                </Label>
                <Input
                    id="logo_url"
                    name="logo_url"
                    defaultValue={method?.logo_url || ''}
                    placeholder="https://..."
                    className="border-slate-300 bg-white text-slate-900 text-sm"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="sort_order" className="text-slate-700 font-medium">
                    Urutan Tampilan
                </Label>
                <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    defaultValue={method?.sort_order || 0}
                    className="border-slate-300 bg-white text-slate-900 w-24"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    disabled={isPending}
                >
                    {isPending ? 'Menyimpan...' : method ? 'Perbarui' : 'Simpan'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-slate-300"
                >
                    Batal
                </Button>
            </div>
        </form>
    )
}
