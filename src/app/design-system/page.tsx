"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { useTheme } from "next-themes"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Info,
  Percent,
  Star,
  Wallet,
  MoreHorizontal,
  Settings,
  User,
  Sun,
  Moon,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { PrimaryButton } from "@/components/ui/primary-button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

const palette = [
  { name: "Background", token: "bg-background", text: "text-foreground", border: true },
  { name: "Card", token: "bg-card", text: "text-card-foreground", border: true },
  { name: "Surface 2", token: "bg-surface-2", text: "text-foreground", border: true },
  { name: "Primary", token: "bg-primary", text: "text-primary-foreground" },
  { name: "Primary Hover", token: "bg-primary-hover", text: "text-primary-foreground" },
  { name: "Primary Bg", token: "bg-primary-bg", text: "text-foreground", border: true },
  { name: "Secondary", token: "bg-secondary", text: "text-secondary-foreground", border: true },
  { name: "Accent", token: "bg-accent", text: "text-accent-foreground", border: true },
  { name: "Muted", token: "bg-muted", text: "text-muted-foreground", border: true },
  { name: "Destructive", token: "bg-destructive", text: "text-destructive-foreground" },
]

const semanticTokens = [
  {
    name: "Success",
    tone: "Payment settled",
    bg: "bg-success",
    text: "text-success-foreground",
    muted: "bg-success-muted text-foreground",
    icon: CheckCircle2,
  },
  {
    name: "Warning",
    tone: "Awaiting payment",
    bg: "bg-warning",
    text: "text-warning-foreground",
    muted: "bg-warning-muted text-foreground",
    icon: Clock3,
  },
  {
    name: "Rating",
    tone: "Product rating",
    bg: "bg-rating",
    text: "text-black",
    muted: "bg-rating/15 text-foreground",
    icon: Star,
  },
  {
    name: "Sale",
    tone: "Promo badge",
    bg: "bg-sale",
    text: "text-white",
    muted: "bg-sale/12 text-foreground",
    icon: Percent,
  },
]

const chartTokens = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

const shadowTokens = [
  { name: "shadow-sm", className: "shadow-sm" },
  { name: "shadow-md", className: "shadow-md" },
  { name: "shadow-lg", className: "shadow-lg" },
]

export default function DesignSystemPage() {
  const progress = 72
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark" || (theme === "system" && mounted && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  // Prevent hydration mismatch visualization issues
  if (!mounted) return null

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-background px-6 py-10 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-8 shadow-sm md:px-10 md:py-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top right, color-mix(in srgb, var(--primary) 16%, transparent), transparent 36%), radial-gradient(circle at bottom left, color-mix(in srgb, var(--warning) 12%, transparent), transparent 28%)",
            }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="min-w-0 space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="rounded-full bg-primary-bg px-4 py-1.5 text-primary shadow-sm">
                  Theme Tokens Refreshed
                </Badge>

                <div className="flex items-center gap-3 rounded-full border border-border bg-background/50 px-3 py-1.5 backdrop-blur-sm shadow-sm transition-all hover:border-primary/30">
                  <Sun className={`size-3.5 transition-colors ${isDark ? "text-muted-foreground" : "text-rating fill-rating"}`} />
                  <Switch checked={isDark} onCheckedChange={toggleTheme} size="sm" />
                  <Moon className={`size-3.5 transition-colors ${isDark ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.32em] text-primary font-bold">
                  Nikarya Store Design System
                </p>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                  Visual tokens that are ready for catalog, checkout, and dashboard flows.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                  Halaman ini dipakai untuk memvalidasi pembaruan token kritis:
                  chart palette, status colors, primary variations, nested surfaces,
                  shadow tiers, dan skeleton shimmer.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="brand">
                  Launch storefront
                </Button>
                <Button variant="outline" className="border-border/70 bg-background/80">
                  Review checkout states
                </Button>
              </div>
            </div>

            <Card className="min-w-0 border-border/70 bg-background/70 shadow-md backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Commerce status snapshot</CardTitle>
                <CardDescription>
                  Status palette sekarang punya token khusus untuk alur transaksi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusPill className="bg-success-muted text-foreground" icon={<CheckCircle2 className="size-4 text-success" />} label="Order confirmed" />
                  <StatusPill className="bg-warning-muted text-foreground" icon={<Clock3 className="size-4 text-warning" />} label="Payment pending" />
                  <StatusPill className="bg-rating/15 text-foreground" icon={<Star className="size-4 text-rating" />} label="4.9 top rated" />
                  <StatusPill className="bg-sale/12 text-foreground" icon={<Percent className="size-4 text-sale" />} label="Flash sale active" />
                </div>
                <div className="rounded-2xl border border-border bg-surface-2 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">Download fulfillment</span>
                    <span className="text-muted-foreground">72%</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid w-full gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="min-w-0 overflow-hidden border-border/70">
            <CardHeader>
              <CardTitle>Core palette</CardTitle>
              <CardDescription>
                Accent sekarang dibedakan dari muted, dan primary punya turunan yang siap dipakai.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {palette.map((item) => (
                <ColorSwatch
                  key={item.name}
                  name={item.name}
                  token={item.token}
                  text={item.text}
                  border={item.border}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Semantic tokens</CardTitle>
              <CardDescription>
                Token baru untuk success, warning, rating, dan sale supaya tidak perlu hardcode warna.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {semanticTokens.map((token) => {
                const Icon = token.icon

                return (
                  <div key={token.name} className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-2xl ${token.bg} ${token.text}`}>
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{token.name}</p>
                          <p className="text-sm text-muted-foreground">{token.tone}</p>
                        </div>
                      </div>
                      <Badge className={`${token.bg} ${token.text} rounded-full px-3 shadow-sm`}>
                        Active
                      </Badge>
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-sm ${token.muted}`}>
                      Muted companion token untuk banner, inline notice, dan state container.
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>

        <section className="grid w-full gap-6 lg:grid-cols-2">
          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Chart palette</CardTitle>
              <CardDescription>
                `--chart-1` sampai `--chart-5` sekarang terdefinisi penuh untuk light dan dark mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                {chartTokens.map((token, index) => (
                  <div key={token} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`${token} w-full rounded-t-2xl`}
                      style={{ height: `${72 + index * 20}px` }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      chart-{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Surface and shadow tiers</CardTitle>
              <CardDescription>
                Nested card dan elevation sekarang punya token yang lebih konsisten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <div className="rounded-2xl border border-border bg-surface-2 p-4 shadow-sm">
                  <p className="font-semibold">Nested surface</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cocok untuk isi modal, order summary, atau panel filter di dalam card utama.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                {shadowTokens.map((shadow) => (
                  <div
                    key={shadow.name}
                    className={`rounded-2xl border border-border bg-background p-4 ${shadow.className}`}
                  >
                    <p className="font-semibold">{shadow.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Theme shadow token yang bisa berubah global dari satu tempat.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </section>

        <section className="grid w-full gap-6">
          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Typography System</CardTitle>
              <CardDescription>
                Reusable Type-safe typography component using CVA and global CSS variables. Supports responsive scaling and polymorphic routing tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden h-full">
                    <div className="absolute right-0 top-0 h-full w-1 bg-primary/20" />
                    <Typography as="span" variant="caption" className="mb-4 text-primary font-bold uppercase tracking-wider block">Headings</Typography>

                    <div className="space-y-6">
                      <div className="space-y-1 border-b border-border/50 pb-4">
                        <Typography variant="h1">Heading H1</Typography>
                        <div className="flex justify-between items-center text-muted-foreground mt-2">
                          <Typography variant="caption">Tag: h1</Typography>
                          <Typography variant="caption">clamp(2.5rem, 5vw, 3.5rem)</Typography>
                        </div>
                      </div>

                      <div className="space-y-1 border-b border-border/50 pb-4">
                        <Typography variant="h2">Heading H2</Typography>
                        <div className="flex justify-between items-center text-muted-foreground mt-2">
                          <Typography variant="caption">Tag: h2</Typography>
                          <Typography variant="caption">clamp(2rem, 4vw, 2.75rem)</Typography>
                        </div>
                      </div>

                      <div className="space-y-1 border-b border-border/50 pb-4">
                        <Typography variant="h3">Heading H3</Typography>
                        <div className="flex justify-between items-center text-muted-foreground mt-2">
                          <Typography variant="caption">Tag: h3</Typography>
                          <Typography variant="caption">clamp(1.75rem, 3vw, 2.25rem)</Typography>
                        </div>
                      </div>

                      <div className="space-y-1 pb-2">
                        <Typography variant="h4">Heading H4</Typography>
                        <div className="flex justify-between items-center text-muted-foreground mt-2">
                          <Typography variant="caption">Tag: h4 | clamp(1.5rem, 2.5vw, 1.75rem)</Typography>
                        </div>
                      </div>

                      <div className="space-y-1 pb-2">
                        <Typography variant="h5">Heading H5</Typography>
                        <div className="flex justify-between items-center text-muted-foreground mt-2">
                          <Typography variant="caption">Tag: h5 | clamp(1.25rem, 2vw, 1.5rem)</Typography>
                        </div>
                      </div>

                      <div className="space-y-1 pb-2">
                        <Typography variant="h6">Heading H6</Typography>
                        <div className="flex justify-between items-center text-muted-foreground mt-2">
                          <Typography variant="caption">Tag: h6 | 1.125rem (18px)</Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden h-full">
                    <div className="absolute right-0 top-0 h-full w-1 bg-secondary" />
                    <Typography as="span" variant="caption" className="mb-4 text-primary font-bold uppercase tracking-wider block">Body & Utilities</Typography>

                    <div className="space-y-8">
                      <div className="space-y-2">
                        <Typography variant="body-lg" className="line-clamp-2">
                          Body Large: The quick brown fox jumps over the lazy dog. Menggunakan font sekunder atau sans yang mudah dibaca.
                        </Typography>
                        <div className="flex justify-between items-center border-b border-border/50 pb-3 mt-2 text-muted-foreground">
                          <Typography variant="caption">Tag: p</Typography>
                          <Typography variant="caption">1.125rem (18px) | lh: 1.6</Typography>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Typography variant="body-base" className="line-clamp-4">
                          Body Base: The default text size for paragraphs and general reading content. It's legible, well-spaced, and scales smoothly. CVA component ini juga mendukung properti `as` untuk custom tag seperti `span` atau `div`.
                        </Typography>
                        <div className="flex justify-between items-center border-b border-border/50 pb-3 mt-2 text-muted-foreground">
                          <Typography variant="caption">Tag: p</Typography>
                          <Typography variant="caption">1rem (16px) | lh: 1.6</Typography>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Typography variant="body-sm" className="line-clamp-2">
                          Body Small: Used for secondary descriptions, timestamps, or helper text below inputs.
                        </Typography>
                        <div className="flex justify-between items-center border-b border-border/50 pb-3 mt-2 text-muted-foreground">
                          <Typography variant="caption">Tag: p</Typography>
                          <Typography variant="caption">0.875rem (14px) | lh: 1.5</Typography>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Typography variant="caption">
                          Caption: Very small text usually applied for disclaimers, badges, or tiny meta info.
                        </Typography>
                        <div className="flex justify-between items-center mt-2 text-muted-foreground">
                          <Typography variant="caption">Tag: p</Typography>
                          <Typography variant="caption">0.75rem (12px) | lh: 1.5</Typography>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-primary-bg/50 p-4 mt-6">
                        <Typography variant="caption" color="muted" align="center" className="block">
                          Coba block teks ini untuk melihat `::selection` yang kini adaptif terhadap token primary.
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid w-full gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Form and filter controls</CardTitle>
              <CardDescription>
                Variasi token baru dipakai untuk input, filter, sorting, dan range harga.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email toko</Label>
                  <Input id="store-email" type="email" placeholder="support@nikarya.id" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-note">Catatan promo</Label>
                  <Textarea id="campaign-note" placeholder="Promo bundling berlaku untuk template premium." />
                </div>
                <div className="space-y-2">
                  <Label>Sorting</Label>
                  <Select defaultValue="popular">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Paling populer</SelectItem>
                      <SelectItem value="latest">Terbaru</SelectItem>
                      <SelectItem value="cheap">Termurah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-border bg-surface-2 p-5">
                <div className="space-y-3">
                  <Label>Filter kategori</Label>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox id="ui-kit" defaultChecked />
                      <Label htmlFor="ui-kit">UI Kit</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="figma-file" />
                      <Label htmlFor="figma-file">Figma File</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Metode distribusi</Label>
                  <RadioGroup defaultValue="instant">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="instant" id="instant" />
                      <Label htmlFor="instant">Instant download</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual approval</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Rentang harga</Label>
                    <span className="text-sm text-muted-foreground">Rp49k - Rp399k</span>
                  </div>
                  <Slider defaultValue={[25, 85]} max={100} step={1} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                  <div>
                    <p className="font-semibold">Tampilkan produk stok rendah</p>
                    <p className="text-sm text-muted-foreground">Gunakan token warning untuk indikator.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Feedback and micro states</CardTitle>
              <CardDescription>
                Skeleton, alert, hover, tooltip, dan popover ikut memanfaatkan token yang sudah dibenahi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Accent state sudah terlihat</AlertTitle>
                <AlertDescription>
                  Perbedaan `accent` dan `muted` sekarang cukup jelas untuk dropdown, select, dan hover state shadcn.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Checkout failed</AlertTitle>
                <AlertDescription>
                  Token destructive tetap dipakai untuk error, sedangkan success dan warning sekarang punya jalur sendiri.
                </AlertDescription>
              </Alert>

              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="mb-4 font-semibold">Skeleton shimmer utility</p>
                <div className="flex items-start gap-4">
                  <Skeleton className="size-16 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Info className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tooltip icon-only action</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Promo note</Button>
                  </PopoverTrigger>
                  <PopoverContent className="space-y-2">
                    <p className="font-semibold">Promo stack rule</p>
                    <p className="text-sm text-muted-foreground">
                      Sale badge dan warning note sekarang bisa ambil token tanpa hardcode warna.
                    </p>
                  </PopoverContent>
                </Popover>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">Hover product card</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="space-y-2">
                    <p className="font-semibold">Pro Dashboard Kit</p>
                    <p className="text-sm text-muted-foreground">
                      Preview hover untuk metadata produk, lisensi, dan rating.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid w-full gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Navigation patterns</CardTitle>
              <CardDescription>
                Komponen navigasi memanfaatkan border, muted, accent, dan shadow token yang kini lebih konsisten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Breadcrumb</p>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Template</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Admin Dashboard Kit</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Pagination</p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">FAQ accordion</p>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Kenapa token `accent` dibedakan dari `muted`?</AccordionTrigger>
                    <AccordionContent>
                      Agar hover dan selected states pada komponen shadcn terlihat jelas, terutama di dropdown dan select.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Kenapa perlu `surface-2`?</AccordionTrigger>
                    <AccordionContent>
                      Karena nested card di order summary, modal, dan side panel butuh lapisan visual yang berbeda dari card utama.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Commerce data preview</CardTitle>
              <CardDescription>
                Scroll area dan table ini dipakai untuk mengecek token dalam skenario katalog dan order list.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[340px] rounded-3xl border border-border bg-card">
                <div className="min-w-[640px] p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <CommerceRow
                        product="Admin Dashboard Kit"
                        statusClass="bg-success-muted text-success"
                        statusLabel="Ready"
                        rating="4.9"
                        price="Rp299.000"
                      />
                      <CommerceRow
                        product="Checkout Flow Pack"
                        statusClass="bg-warning-muted text-warning"
                        statusLabel="Pending review"
                        rating="4.8"
                        price="Rp189.000"
                      />
                      <CommerceRow
                        product="Bundle UI Commerce"
                        statusClass="bg-sale/12 text-sale"
                        statusLabel="Promo"
                        rating="5.0"
                        price="Rp399.000"
                      />
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="rounded-2xl border border-border bg-surface-2 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold">Order summary slot</p>
                        <p className="text-sm text-muted-foreground">
                          Area ini mewakili nested panel yang biasanya muncul di checkout atau drawer cart.
                        </p>
                      </div>
                      <Button className="shrink-0">
                        Continue
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Border dark mode kini memakai alpha, sehingga tabel dan panel tidak terasa terlalu keras.
            </CardFooter>
          </Card>
        </section>

        <section className="grid w-full gap-6">
          <Card className="min-w-0 border-border/70">
            <CardHeader>
              <CardTitle>Overlays & Additional Components</CardTitle>
              <CardDescription>
                Kumpulan komponen UI lain seperti dialogs, sheets, modals, dan avatars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 p-6 bg-card border border-border rounded-xl">
                <div className="flex flex-wrap gap-4">
                  <Dialog>
                    <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">Dialog Content Space</div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline" className="text-destructive">Open Alert Dialog</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete your account.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Sheet>
                    <SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Side Sheet</SheetTitle>
                        <SheetDescription>Kumpulan filter resolusi, kategori dsb biasanya dimuat di dalam side sheet ini.</SheetDescription>
                      </SheetHeader>
                      <div className="py-4">Sheet Content Space</div>
                    </SheetContent>
                  </Sheet>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline">Dropdown <MoreHorizontal className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><User className="mr-2 w-4 h-4" /> Profile</DropdownMenuItem>
                      <DropdownMenuItem><Settings className="mr-2 w-4 h-4" /> Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <PrimaryButton loading={false} className="w-auto px-6">
                    Primary Button Effect
                  </PrimaryButton>

                  <div className="flex items-center gap-2 border rounded-full p-2 bg-surface-2 ml-auto">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">User</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">CG</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">Badge variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="ghost">Ghost Badge</Badge>
                    <Badge variant="link">Link Badge</Badge>
                    <Badge className="rounded-full bg-success text-success-foreground border-transparent">
                      Success
                    </Badge>
                    <Badge className="rounded-full bg-warning text-warning-foreground border-transparent">
                      Warning
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-[#01696f] to-[#0c4e54] px-6 py-12 text-white shadow-xl md:px-12 md:py-20">
          {/* Decorative Circles from Reference */}
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] backdrop-blur-md">
              <div className="size-1.5 rounded-full bg-white animate-pulse" />
              Teal Branding Experience
            </div>

            <div className="max-w-3xl space-y-6">
              <h2 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Immersive Teal Visuals.
              </h2>
              <p className="text-lg text-white/80 md:text-xl leading-relaxed">
                Menggunakan palet warna teal legasi dari CustomGaleri yang dikombinasikan
                dengan elemen dekoratif sirkular. Section ini memvalidasi kontras teks putih
                di atas gradien gelap dan penggunaan transparansi untuk elemen UI overlay.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" variant="secondary">
                Mulai Sekarang
              </Button>
              <Button size="lg" variant="glass">
                Pelajari Filosofi Warna
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ColorSwatch({
  name,
  token,
  text,
  border = false,
}: {
  name: string
  token: string
  text: string
  border?: boolean
}) {
  return (
    <div className="group flex flex-col gap-2">
      <div
        className={`${token} ${text} ${border ? "border border-border" : ""} relative h-28 overflow-hidden rounded-2xl p-4 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]`}
      >
        <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/6" />
        <div className="relative flex h-full flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
            {token.replace("bg-", "")}
          </span>
          <span className="text-sm font-bold">{name}</span>
        </div>
      </div>
    </div>
  )
}

function StatusPill({
  icon,
  label,
  className,
}: {
  icon: ReactNode
  label: string
  className: string
}) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

function CommerceRow({
  product,
  statusClass,
  statusLabel,
  rating,
  price,
}: {
  product: string
  statusClass: string
  statusLabel: string
  rating: string
  price: string
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{product}</TableCell>
      <TableCell>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass}`}>
          {statusLabel}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-rating">
          <Star className="size-3.5 fill-current" />
          {rating}
        </span>
      </TableCell>
      <TableCell>{price}</TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm">
          <Wallet className="size-4" />
          Detail
        </Button>
      </TableCell>
    </TableRow>
  )
}
