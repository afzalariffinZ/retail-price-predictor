"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BarChart3, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar({ 
  isOpen,
  onToggle,
  onExecute,
  selectedItem,
  setSelectedItem,
  selectedState,
  setSelectedState,
  premiseType,
  setPremiseType,
  actualMarketPrice,
  setActualMarketPrice,
  usdRate,
  setUsdRate,
  usdLag60,
  setUsdLag60,
  dieselPrice,
  setDieselPrice,
  dieselLag30,
  setDieselLag30,
  isFestive,
  setIsFestive,
  targetDate,
  setTargetDate,
  useHistoricalMode,
  setUseHistoricalMode
}: { 
  onExecute: () => void;
  selectedItem: string;
  setSelectedItem: (val: string) => void;
  selectedState: string;
  setSelectedState: (val: string) => void;
  premiseType: string;
  setPremiseType: (val: string) => void;
  actualMarketPrice: string;
  setActualMarketPrice: (val: string) => void;
  usdRate: number[];
  setUsdRate: (val: number[]) => void;
  usdLag60: number[];
  setUsdLag60: (val: number[]) => void;
  dieselPrice: number[];
  setDieselPrice: (val: number[]) => void;
  dieselLag30: number[];
  setDieselLag30: (val: number[]) => void;
  isFestive: boolean;
  setIsFestive: (val: boolean) => void;
  targetDate: string;
  setTargetDate: (val: string) => void;
  useHistoricalMode: boolean;
  setUseHistoricalMode: (val: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {

  return (
    <div className={cn(
      "border-r bg-card/95 backdrop-blur-sm h-screen transition-all duration-300 ease-in-out",
      "md:relative fixed top-0 left-0 z-40",
      isOpen ? "w-80" : "w-0",
      isOpen && "shadow-2xl md:shadow-none"
    )}>
      <div className={cn(
        "w-80 p-4 sm:p-6 space-y-4 sm:space-y-6 md:space-y-8 h-full overflow-y-auto transition-opacity duration-300 pb-20",
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-primary/20",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:hover:bg-primary/30",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg leading-tight">
              Helang<br />
              <span className="text-sm font-normal text-muted-foreground">Malaysian National Market Sentinel</span>
            </h1>
          </div>
        </div>

      <div className="space-y-6">

        <Button className="w-full" size="lg" onClick={onExecute}>
          Execute Causal Inference
        </Button>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select State</label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="selangor">Selangor</SelectItem>
              <SelectItem value="kelantan">Kelantan</SelectItem>
              <SelectItem value="sarawak">Sarawak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Premise Type</label>
          <Select value={premiseType} onValueChange={setPremiseType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Premise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hypermarket">Hypermarket</SelectItem>
              <SelectItem value="supermarket">Supermarket</SelectItem>
              <SelectItem value="wet_market">Wet Market</SelectItem>
              <SelectItem value="mini_mart">Mini Mart</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Item</label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger>
                <SelectValue placeholder="Select Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ayam bersih">Ayam Bersih (Standard Chicken)</SelectItem>
              <SelectItem value="betik biasa">Betik Biasa (Papaya)</SelectItem>
              <SelectItem value="minyak masak paket">Minyak Masak Paket (Cooking Oil 5kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Actual Market Price (Optional)</label>
          <Input 
            type="number" 
            step="0.01"
            placeholder="e.g., 9.50"
            value={actualMarketPrice}
            onChange={(e) => setActualMarketPrice(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Leave empty for prediction-only mode</p>
        </div>

        

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Target Date
          </label>
          <Input 
            type="date" 
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full [&::-webkit-calendar-picker-indicator]:invert"
          />
          <p className="text-xs text-muted-foreground">Backend will fetch USD/Diesel from database</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Festive Season</label>
            <p className="text-xs text-muted-foreground">Activate is_festive flag</p>
          </div>
          <Switch
            checked={isFestive}
            onCheckedChange={setIsFestive}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
          <div className="space-y-0.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Manual Simulation Mode
            </label>
            <p className="text-xs text-muted-foreground">Override with custom economic inputs</p>
          </div>
          <Switch
            checked={useHistoricalMode}
            onCheckedChange={setUseHistoricalMode}
          />
        </div>

        {useHistoricalMode && (
        <div className="space-y-4">
          <div className="space-y-2 rounded-lg p-3 transition-all">
            <div className="flex justify-between">
              <label className="text-sm font-medium">USD Rate (Current)</label>
              <span className="text-sm text-muted-foreground">{usdRate[0].toFixed(2)}</span>
            </div>
            <Slider
              value={usdRate}
              onValueChange={setUsdRate}
              min={3.0}
              max={5.5}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Today's USD/MYR rate
            </p>
          </div>

          <div className="space-y-2 rounded-lg p-3 transition-all">
            <div className="flex justify-between">
              <label className="text-sm font-medium">USD Rate (60 Days Ago)</label>
              <span className="text-sm text-muted-foreground">{usdLag60[0].toFixed(2)}</span>
            </div>
            <Slider
              value={usdLag60}
              onValueChange={setUsdLag60}
              min={3.0}
              max={5.5}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Biological lag for imported feed costs
            </p>
          </div>

          <div className="space-y-2 rounded-lg p-3 transition-all">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Diesel Price (Current)</label>
              <span className="text-sm text-muted-foreground">RM {dieselPrice[0].toFixed(2)}</span>
            </div>
            <Slider
              value={dieselPrice}
              onValueChange={setDieselPrice}
              min={1.5}
              max={4.0}
              step={0.05}
            />
            <p className="text-xs text-muted-foreground">
              Today's diesel price
            </p>
          </div>

          <div className="space-y-2 rounded-lg p-3 transition-all">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Diesel Price (30 Days Ago)</label>
              <span className="text-sm text-muted-foreground">RM {dieselLag30[0].toFixed(2)}</span>
            </div>
            <Slider
              value={dieselLag30}
              onValueChange={setDieselLag30}
              min={1.5}
              max={4.0}
              step={0.05}
            />
            <p className="text-xs text-muted-foreground">
              Logistics contract lag for transport costs
            </p>
          </div>
        </div>
        )}
      </div>
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 sm:-right-4 top-4 sm:top-6 z-50 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-primary-foreground",
          "flex items-center justify-center shadow-xl hover:scale-110 transition-all",
          "border-2 border-muted",
          !isOpen && "hidden"
        )}
        aria-label="Close sidebar"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  )
}
