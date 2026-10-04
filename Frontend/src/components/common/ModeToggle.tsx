
import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/store/themeStore"

export function ModeToggle() {
    const { theme, setTheme } = useThemeStore()

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
            root.classList.add(systemTheme)
            return
        }
        root.classList.add(theme)
    }, [theme])

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )
}
