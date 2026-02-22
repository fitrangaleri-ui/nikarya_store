'use client'

import { useState, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Upload,
    Download,
    FileSpreadsheet,
    FileText,
    CheckCircle,
    AlertCircle,
    Eye,
} from 'lucide-react'
import { importProducts, exportProducts } from './import-export-actions'
import * as XLSX from 'xlsx'

type ParsedRow = Record<string, string>

const EXPECTED_HEADERS = [
    'title',
    'description',
    'price',
    'category',
    'product_code',
    'sku',
    'badge',
    'tags',
    'original_price',
    'discount_percent',
    'discount_price',
    'thumbnail_url',
    'drive_file_url',
    'demo_link',
    'is_active',
]

// ─── CSV Parser ─────────────────────────────────────────────────────────────

function parseCSV(text: string): ParsedRow[] {
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
    return lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''))
        const row: ParsedRow = {}
        headers.forEach((h, i) => {
            row[h] = values[i] || ''
        })
        return row
    })
}

// ─── XLSX Parser ────────────────────────────────────────────────────────────

function parseXLSX(buffer: ArrayBuffer): ParsedRow[] {
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: '' })
    return json.map((row) => {
        const normalized: ParsedRow = {}
        Object.keys(row).forEach((key) => {
            normalized[key.trim().toLowerCase().replace(/\s+/g, '_')] = String(row[key])
        })
        return normalized
    })
}

// ─── Import Section ─────────────────────────────────────────────────────────

function ImportDialog() {
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState<ParsedRow[]>([])
    const [fileName, setFileName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<{ success: boolean; count?: number } | null>(null)
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setResult(null)
        setFileName(file.name)

        try {
            if (file.name.endsWith('.csv')) {
                const text = await file.text()
                const parsed = parseCSV(text)
                if (parsed.length === 0) {
                    setError('File CSV kosong atau format tidak valid.')
                    return
                }
                setRows(parsed)
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const buffer = await file.arrayBuffer()
                const parsed = parseXLSX(buffer)
                if (parsed.length === 0) {
                    setError('File Excel kosong atau format tidak valid.')
                    return
                }
                setRows(parsed)
            } else {
                setError('Format file tidak didukung. Gunakan CSV atau XLSX.')
            }
        } catch {
            setError('Gagal membaca file. Pastikan format benar.')
        }
    }

    const handleImport = () => {
        setError(null)
        setResult(null)

        // Validate required field
        const missingTitle = rows.some((r) => !r.title?.trim())
        if (missingTitle) {
            setError('Kolom "title" wajib diisi untuk semua baris.')
            return
        }

        startTransition(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await importProducts(rows as any)
            if (res && 'error' in res) {
                setError(res.error as string)
            } else {
                setResult({ success: true, count: res.count })
                setRows([])
                setFileName('')
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        })
    }

    const resetForm = () => {
        setRows([])
        setFileName('')
        setError(null)
        setResult(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v)
                if (v) resetForm()
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200 bg-white sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        Import Produk
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {result?.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            Berhasil mengimpor {result.count} produk!
                        </div>
                    )}

                    {/* Upload Area */}
                    {rows.length === 0 && !result?.success && (
                        <div className="space-y-3">
                            <label
                                htmlFor="import-file"
                                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 cursor-pointer transition hover:bg-slate-100 hover:border-blue-400"
                            >
                                <Upload className="h-8 w-8 text-slate-400" />
                                <div className="text-center">
                                    <p className="font-medium text-slate-700">
                                        Pilih file CSV atau XLSX
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Kolom wajib: title, price
                                    </p>
                                </div>
                            </label>
                            <input
                                ref={fileInputRef}
                                id="import-file"
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFile}
                                className="hidden"
                            />

                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                                <p className="font-semibold mb-1">Kolom yang didukung:</p>
                                <p className="font-mono text-[10px] leading-relaxed">
                                    {EXPECTED_HEADERS.join(', ')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Preview Table */}
                    {rows.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">
                                        Preview: {fileName}
                                    </span>
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                        {rows.length} baris
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetForm}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    Ganti File
                                </Button>
                            </div>

                            <div className="overflow-auto max-h-60 rounded-lg border border-slate-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="text-xs font-semibold text-slate-600">#</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-600">Title</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-600">Price</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-600">Category</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-600">Code</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.slice(0, 20).map((row, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50">
                                                <TableCell className="text-xs text-slate-500">{i + 1}</TableCell>
                                                <TableCell className="text-xs font-medium text-slate-900 max-w-[200px] truncate">
                                                    {row.title || '—'}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-700">
                                                    {row.price || '—'}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">
                                                    {row.category || '—'}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">
                                                    {row.product_code || '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {rows.length > 20 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-xs text-slate-400 py-2">
                                                    ... dan {rows.length - 20} baris lainnya
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <Button
                                onClick={handleImport}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isPending}
                            >
                                {isPending ? 'Mengimpor...' : `Import ${rows.length} Produk`}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Export Handler ──────────────────────────────────────────────────────────

function ExportDropdown() {
    const [isPending, startTransition] = useTransition()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleExport = (format: 'csv' | 'xlsx') => {
        setMenuOpen(false)

        startTransition(async () => {
            const res = await exportProducts()
            if (res && 'error' in res) {
                alert(res.error)
                return
            }

            const data = res.data
            if (!data || data.length === 0) {
                alert('Tidak ada produk untuk diekspor.')
                return
            }

            if (format === 'csv') {
                const headers = Object.keys(data[0])
                const csvLines = [
                    headers.join(','),
                    ...data.map((row) =>
                        headers.map((h) => {
                            const val = String(row[h as keyof typeof row] ?? '')
                            return val.includes(',') ? `"${val}"` : val
                        }).join(',')
                    ),
                ]
                const csvText = csvLines.join('\n')
                downloadFile(csvText, 'products.csv', 'text/csv')
            } else {
                const ws = XLSX.utils.json_to_sheet(data)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, 'Products')
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
                downloadFile(
                    new Blob([wbout]),
                    'products.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            }
        })
    }

    return (
        <div className="relative">
            <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(!menuOpen)}
                disabled={isPending}
            >
                <Download className="mr-2 h-4 w-4" />
                {isPending ? 'Mengekspor...' : 'Export'}
            </Button>
            {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 w-40 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                    <button
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FileText className="h-4 w-4 text-emerald-600" />
                        CSV (.csv)
                    </button>
                    <button
                        onClick={() => handleExport('xlsx')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                        Excel (.xlsx)
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Download Helper ────────────────────────────────────────────────────────

function downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

// ─── Main Export ────────────────────────────────────────────────────────────

export function ImportExportSection() {
    return (
        <div className="flex items-center gap-2">
            <ImportDialog />
            <ExportDropdown />
        </div>
    )
}
