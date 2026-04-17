"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark" || (theme === "system" && mounted && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-border bg-background/50 px-3 py-1.5 backdrop-blur-sm shadow-sm transition-all hover:border-primary/30">
        <Sun className="size-3.5 text-muted-foreground" />
        <Switch disabled size="sm" />
        <Moon className="size-3.5 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
          Theme
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-background/50 px-3 py-1.5 backdrop-blur-sm shadow-sm transition-all hover:border-primary/30">
      <Sun className={`size-3.5 transition-colors ${isDark ? "text-muted-foreground" : "text-rating fill-rating"}`} />
      <Switch checked={isDark} onCheckedChange={toggleTheme} size="sm" />
      <Moon className={`size-3.5 transition-colors ${isDark ? "text-primary fill-primary" : "text-muted-foreground"}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
        {isDark ? "Dark" : "Light"}
      </span>
    </div>
  )
}
