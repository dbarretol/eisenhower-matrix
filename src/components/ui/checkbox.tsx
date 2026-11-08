import type { ComponentProps } from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = ({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
    <CheckboxPrimitive.Root
        className={cn(
            "peer grid size-[18px] shrink-0 place-items-center rounded-full border-[1.5px] border-muted transition-colors duration-150",
            "hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:border-muted data-[state=checked]:bg-muted data-[state=checked]:text-card",
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            <Check className="size-3" strokeWidth={3.5} />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
)

export { Checkbox }
