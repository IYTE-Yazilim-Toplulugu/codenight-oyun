import { Check, Pencil } from "lucide-react"

interface PlayerCardProps {
    name: string
    num: number
}

export function PlayerCard({ name, num }: PlayerCardProps) {
    const status = "done";
    return (
        <div
            className={` relative px-4 py-3 rounded-2xl border-2 transition-all 
            ${status === "done"
                    ? "bg-success/10 border-success/40"
                    : status === "active"
                        ? "bg-primary/10 border-primary/40 shadow-md"
                        : "bg-card border-border"}
`}
        >
            <div className="flex items-center justify-between gap-3">
                <span
                    className={`font-semibold text-sm ${status === "done" ? "text-success" : status === "active" ? "text-primary" : "text-muted-foreground"
                        }`}
                >
                    {name}
                </span>

                <div
                    className={`
                    flex items-center justify-center w-6 h-6 rounded-full
                    ${status === "done"
                            ? "bg-success text-white"
                            : status === "active"
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground"
                        }
          `}
                >
                    {status === "done" ? (
                        <Check className="w-4 h-4" />
                    ) : status === "active" ? (
                        <Pencil className="w-3.5 h-3.5" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    )}
                </div>
            </div>
        </div>
    )
}
