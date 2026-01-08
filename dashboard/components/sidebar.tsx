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
      "border-r bg-card/50 h-screen transition-all duration-300 ease-in-out relative",
      isOpen ? "w-80" : "w-0"
    )}>
      <div className={cn(
        "w-80 p-6 space-y-8 h-full overflow-y-auto transition-opacity duration-300",
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-primary/20",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:hover:bg-primary/30",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-lg leading-tight">
            KPDN<br />
            <span className="text-sm font-normal text-muted-foreground">Intelligence Hub v2.0</span>
          </h1>
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

        

        <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
          <div className="space-y-0.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Historical Lookup Mode
            </label>
            <p className="text-xs text-muted-foreground">Use actual economic data from date</p>
          </div>
          <Switch
            checked={useHistoricalMode}
            onCheckedChange={setUseHistoricalMode}
          />
        </div>

        {useHistoricalMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Target Date
            </label>
            <div className="relative ">
              <Input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full pl-10  "
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">Backend will fetch USD/Diesel from database</p>
          </div>
        )}

        <div className="space-y-4">
          <div className={cn(
            "space-y-2 rounded-lg p-3 transition-all",
            useHistoricalMode && "opacity-50 bg-black/20"
          )}>
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
              disabled={useHistoricalMode}
            />
            <p className="text-xs text-muted-foreground">
              {useHistoricalMode ? "Disabled in date lookup mode" : "Today's USD/MYR rate"}
            </p>
          </div>

          <div className={cn(
            "space-y-2 rounded-lg p-3 transition-all",
            useHistoricalMode && "opacity-50 bg-black/20"
          )}>
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
              disabled={useHistoricalMode}
            />
            <p className="text-xs text-muted-foreground">
              {useHistoricalMode ? "Disabled in date lookup mode" : "Biological lag for imported feed costs"}
            </p>
          </div>

          <div className={cn(
            "space-y-2 rounded-lg p-3 transition-all",
            useHistoricalMode && "opacity-50 bg-black/20"
          )}>
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
              disabled={useHistoricalMode}
            />
            <p className="text-xs text-muted-foreground">
              {useHistoricalMode ? "Disabled in date lookup mode" : "Today's diesel price"}
            </p>
          </div>

          <div className={cn(
            "space-y-2 rounded-lg p-3 transition-all",
            useHistoricalMode && "opacity-50 bg-black/20"
          )}>
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
              disabled={useHistoricalMode}
            />
            <p className="text-xs text-muted-foreground">
              {useHistoricalMode ? "Disabled in date lookup mode" : "Logistics contract lag for transport costs"}
            </p>
          </div>
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
      </div>
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-4 top-6 z-50 h-9 w-9 rounded-full bg-primary text-primary-foreground",
          "flex items-center justify-center shadow-xl hover:scale-110 transition-all",
          "border-2 border-muted",
          !isOpen && "hidden"
        )}
        aria-label="Close sidebar"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {/* Open Button (when closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-6 z-50 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-all border-2 border-muted"
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
