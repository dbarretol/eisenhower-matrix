import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const currentTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light")

// Follows the `dark` class that the app sets on <html>.
export const Toaster = (props: ToasterProps) => {
    const [theme, setTheme] = useState<"light" | "dark">(currentTheme)

    useEffect(() => {
        const observer = new MutationObserver(() => setTheme(currentTheme()))
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
        return () => observer.disconnect()
    }, [])

    return (
        <Sonner
            theme={theme}
            position="bottom-right"
            toastOptions={{
                classNames: {
                    toast: "!bg-card !text-ink !border-line !shadow-lift !font-sans !rounded-card",
                    description: "!text-muted",
                    actionButton: "!bg-ink !text-bg !font-bold",
                },
            }}
            {...props}
        />
    )
}
