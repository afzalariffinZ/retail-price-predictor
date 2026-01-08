import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <div className="flex justify-end py-4">
      <Badge variant="outline" className="gap-2 border-green-500/50 text-green-500 bg-green-500/10">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Bank Negara API: Connected
      </Badge>
    </div>
  )
}
