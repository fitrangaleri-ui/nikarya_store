"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";

// ── Constants ──────────────────────────────────────────────────
const DEFAULT_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads";
const DEVICE_ASPECT_RATIO = "9 / 20";
const PREVIEW_WIDTH = 390;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * 20) / 9;

// ── Types ──────────────────────────────────────────────────────
interface DemoPreviewRequest {
  label: string;
  url: string;
}

interface DemoPreviewContextValue {
  closePreview: () => void;
  openPreview: (payload: DemoPreviewRequest) => void;
}

// ── Utility hooks ──────────────────────────────────────────────
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const original = {
      left: body.style.left,
      overflow: body.style.overflow,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
      width: body.style.width,
      overscroll: documentElement.style.overscrollBehavior,
    };

    documentElement.style.overscrollBehavior = "contain";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      documentElement.style.overscrollBehavior = original.overscroll;
      body.style.left = original.left;
      body.style.overflow = original.overflow;
      body.style.position = original.position;
      body.style.right = original.right;
      body.style.top = original.top;
      body.style.width = original.width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

function isValidPreviewUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function useViewportSize(active: boolean) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!active) return;
    const update = () =>
      setViewport({ height: window.innerHeight, width: window.innerWidth });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active]);

  return viewport;
}

// ── Preview Frame (phone mockup) ───────────────────────────────
function PreviewFrame({
  label,
  validUrl,
  url,
}: {
  label: string;
  validUrl: boolean;
  url: string;
}) {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className="relative mx-auto shrink-0 overflow-hidden rounded-[2.5rem] border-[3px] border-muted-foreground/15 bg-foreground"
      style={{
        aspectRatio: DEVICE_ASPECT_RATIO,
        width: `${PREVIEW_WIDTH}px`,
        height: `${PREVIEW_HEIGHT}px`,
      }}
    >
      {/* Notch */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="h-7 w-[120px] rounded-b-2xl bg-foreground" />
      </div>

      {/* Loading state */}
      {loading && validUrl && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-foreground/90">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
          <Typography variant="caption" as="span" className="text-background/60">
            Memuat preview...
          </Typography>
        </div>
      )}

      {/* Iframe or error */}
      {validUrl ? (
        <iframe
          src={url}
          title={`Preview: ${label}`}
          className="block w-full bg-background"
          style={{
            border: "none",
            display: "block",
            height: "calc(100% - 2rem)",
          }}
          onLoad={() => setLoading(false)}
          sandbox={DEFAULT_IFRAME_SANDBOX}
        />
      ) : (
        <div
          className="flex items-center justify-center px-6 text-center"
          style={{ height: "calc(100% - 2rem)" }}
        >
          <div className="flex max-w-xs flex-col items-center gap-3 text-background">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted-foreground/15 bg-muted-foreground/10">
              <ExclamationTriangleIcon className="h-5 w-5 text-background/80" />
            </div>
            <Typography variant="body-sm" as="p" className="font-semibold text-background">
              Preview tidak tersedia
            </Typography>
            <Typography variant="caption" as="p" className="text-background/60">
              Link demo tidak valid atau kosong. Buka di tab baru jika kamu masih
              ingin mencoba mengaksesnya.
            </Typography>
          </div>
        </div>
      )}

      {/* Home indicator */}
      <div className="flex items-center justify-center bg-foreground py-2">
        <div className="h-1 w-28 rounded-full bg-background/30" />
      </div>
    </div>
  );
}

// ── Preview Dialog ─────────────────────────────────────────────
function DemoPreviewDialog({
  onClose,
  payload,
}: {
  onClose: () => void;
  payload: (DemoPreviewRequest & { requestId: number }) | null;
}) {
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isOpen = payload !== null;
  const isValidUrl = payload ? isValidPreviewUrl(payload.url) : false;
  const viewport = useViewportSize(isOpen);
  const [headerHeight, setHeaderHeight] = useState(48);

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }, [isOpen]);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !headerRef.current) return;
    const el = headerRef.current;
    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  const previewScale = useMemo(() => {
    if (!isOpen || viewport.width === 0 || viewport.height === 0) return 1;
    const hPad = 32;
    const vPad = 32;
    const gap = 16;
    const availW = Math.max(240, viewport.width - hPad);
    const availH = Math.max(240, viewport.height - vPad - headerHeight - gap);
    return Math.min(1, availW / PREVIEW_WIDTH, availH / PREVIEW_HEIGHT);
  }, [headerHeight, isOpen, viewport.height, viewport.width]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onClose();
    },
    [onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] items-center justify-center overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-[calc(100vw-2rem)]"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          lastFocusedRef.current?.focus();
        }}
      >
        {payload ? (
          <>
            <DialogTitle className="sr-only">
              Preview demo {payload.label}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Modal preview demo produk dalam tampilan perangkat mobile.
            </DialogDescription>

            <div className="relative mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-center gap-4 px-4 py-4 animate-in fade-in zoom-in-95 duration-300">
              {/* Header bar */}
              <div
                ref={headerRef}
                className="flex w-full max-w-[390px] items-center justify-between"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <DevicePhoneMobileIcon className="h-4 w-4 text-primary" />
                  </div>
                  <Typography variant="body-sm" as="span" className="truncate font-semibold text-background">
                    {payload.label}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={payload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/10 text-background/70 transition-all hover:bg-background/20 hover:text-background active:scale-95"
                    aria-label="Buka di tab baru"
                    title="Buka di tab baru"
                    aria-disabled={!isValidUrl}
                    tabIndex={isValidUrl ? 0 : -1}
                    onClick={(event) => {
                      if (!isValidUrl) event.preventDefault();
                    }}
                  >
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/10 text-background/70 transition-all hover:bg-background/20 hover:text-background active:scale-95"
                    aria-label="Tutup preview"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scaled preview */}
              <div
                className="flex w-full items-start justify-center"
                style={{ height: `${PREVIEW_HEIGHT * previewScale}px` }}
              >
                <div
                  style={{
                    height: `${PREVIEW_HEIGHT}px`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top center",
                    width: `${PREVIEW_WIDTH}px`,
                  }}
                >
                  <PreviewFrame
                    key={payload.requestId}
                    label={payload.label}
                    validUrl={isValidUrl}
                    url={payload.url}
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ── Context & Provider ─────────────────────────────────────────
const DemoPreviewContext = createContext<DemoPreviewContextValue | null>(null);

export function DemoPreviewProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<
    (DemoPreviewRequest & { requestId: number }) | null
  >(null);
  const requestIdRef = useRef(0);

  const openPreview = useCallback((next: DemoPreviewRequest) => {
    requestIdRef.current += 1;
    setPayload({ ...next, requestId: requestIdRef.current });
  }, []);

  const closePreview = useCallback(() => setPayload(null), []);

  const value = useMemo(
    () => ({ closePreview, openPreview }),
    [closePreview, openPreview],
  );

  return (
    <DemoPreviewContext.Provider value={value}>
      {children}
      <DemoPreviewDialog payload={payload} onClose={closePreview} />
    </DemoPreviewContext.Provider>
  );
}

export function useDemoPreview() {
  const context = useContext(DemoPreviewContext);
  if (!context) {
    throw new Error("useDemoPreview must be used within a DemoPreviewProvider");
  }
  return context;
}
