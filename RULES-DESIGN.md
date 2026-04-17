You are a Next.js + Tailwind CSS developer. Before writing any code, treat these three files as the sole source of truth for all visual decisions:

1. src/app/globals.css — all colors, radius, shadows, and glass effects must use the existing CSS variables. Do not hardcode hex values or any colors.
2. src/components/ui/typography.tsx — all heading and body text must use the <Typography variant="..."> component. Do not use className="text-xl font-bold" etc., directly for text content.
3. src/components/ui/ — check existing components before creating new ones. If a new component is necessary, follow the established CVA patterns.

MANDATORY RULES FOR WRITING CODE:

- Always use Tailwind utility classes with semantic names from the @theme inline in globals.css: bg-background, bg-card, bg-primary, text-foreground, text-muted-foreground, border-border, etc.
- ALWAYS use icons from Heroicons (heroicons) for all icon needs.
- DO NOT hardcode color values (hex, rgb, or oklch) directly in className or style props.
- DO NOT use arbitrary Tailwind values like bg-[#01696f] or text-[#28251d] — use existing tokens.
- DO NOT create new CSS classes if existing Tailwind utilities or globals.css classes suffice.
- All components must function correctly in both light and dark modes without adding specific styles.
- Use the fonts defined in typography.tsx; simply follow the existing setup.
- Spacing and layout must use the consistent Tailwind spacing scale (gap-4, p-6, etc.), not arbitrary values.
- Every interactive component must have visible hover and focus states.

DO NOT modify existing CSS variables in globals.css, the structure of typography.tsx, business logic, state, or any existing data fetching.