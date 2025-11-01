
interface ResultItem {
    playerName: string
    type: "wrote" | "guessed"
    content: string
    imageUrl?: string
}

interface ResultBookProps {
    results: ResultItem[]
}

export function ResultBook({ results }: ResultBookProps) {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 p-6">
            <h2 className="text-3xl font-bold text-center text-primary mb-8">Round Results</h2>

            <div className="space-y-6">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                                <span className="text-lg font-bold text-primary">{index + 1}</span>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div>
                                    <span className="font-semibold text-foreground">{result.playerName}</span>
                                    <span className="text-muted-foreground mx-2">{result.type === "wrote" ? "wrote:" : "guessed:"}</span>
                                </div>

                                {result.imageUrl ? (
                                    <div className="rounded-xl overflow-hidden border-2 border-border">
                                        <img
                                            src={result.imageUrl || "/placeholder.svg"}
                                            alt={`${result.playerName}'s drawing`}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-lg text-foreground bg-secondary px-4 py-3 rounded-xl italic">"{result.content}"</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
