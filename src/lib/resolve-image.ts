/**
 * Validates and resolves an image URL for use with next/image.
 * Returns the URL if valid, or null if it should show a placeholder icon instead.
 */
export function resolveImageSrc(url?: string | null): string | null {
    if (!url || typeof url !== 'string') return null
    const trimmed = url.trim()
    if (
        trimmed.startsWith('https://') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed
    }
    return null
}
