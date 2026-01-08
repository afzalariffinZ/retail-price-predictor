import { HowToUse } from "@/components/how-to-use"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export function Header({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="flex justify-between items-center py-4">
      <Button
        onClick={onToggle}
        variant="outline"
        className="h-9 px-4 rounded-md border whitespace-nowrap"
      >
        Make an Analysis
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
      <HowToUse />
    </div>
  )
}
