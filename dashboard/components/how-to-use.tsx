"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function HowToUse() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Read Me</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">
            Helang: Malaysian National Market Sentinel
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Causal Inference & Price Anomaly Detection System
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4 sm:px-6 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 text-sm pr-2 sm:pr-4 pb-4 sm:pb-6">
            {/* Project Overview */}
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Project Overview</h3>
              <p className="text-muted-foreground leading-relaxed">
                Project Helang is a GovTech solution designed to protect Malaysian consumers from <span className="font-semibold text-foreground">Price Stickiness</span> (The "Feather" Effect). While traditional dashboards only show price trends, this system uses <span className="font-semibold text-foreground">Causal AI</span> to determine what a price <span className="italic">should be</span> based on global and local economic cost drivers.
              </p>
            </section>

            {/* The Problem */}
            <section>
              <h4 className="text-base font-semibold mb-2 text-primary">The Problem: Rockets & Feathers</h4>
              <p className="text-muted-foreground leading-relaxed">
                In the Malaysian market, retail prices often behave like <span className="font-semibold text-red-500">Rockets</span> (rising instantly when costs like Diesel or USD go up) but fall like <span className="font-semibold text-orange-500">Feathers</span> (dropping very slowly or not at all when costs go down). This "stickiness" allows middlemen to pocket government subsidies and currency gains.
              </p>
            </section>

            {/* The Solution */}
            <section>
              <h4 className="text-base font-semibold mb-2 text-primary">The Solution: Causal Intelligence</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                This tool uses a stratified XGBoost machine learning model trained on 3.5 years of pricecatcher data (2022–2025). It accounts for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li><span className="font-semibold text-foreground">Biological Lags:</span> Uses the 60-day USD rate (matching the broiler chicken growth cycle and feed import duration).</li>
                <li><span className="font-semibold text-foreground">Logistical Lags:</span> Uses the 30-day Diesel price (matching the standard Net-30 billing cycle for Malaysian transport companies).</li>
                <li><span className="font-semibold text-foreground">Institutional Constraints:</span> Automatically enforces the RM 2.50 hard-cap on subsidized cooking oil.</li>
              </ul>
            </section>

            {/* How to Use */}
            <section>
              <h3 className="text-lg font-semibold mb-3">2. How to Use the Hub</h3>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-foreground mb-1">Step 1: Configuration</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li><span className="font-semibold text-foreground">Select Item:</span> Choose between import-dependent items (Chicken) or locally-sourced produce (Papaya).</li>
                    <li><span className="font-semibold text-foreground">Select State:</span> Choose the region. The model automatically adjusts for regional logistics (e.g., Sarawak Sea Freight costs).</li>
                    <li><span className="font-semibold text-foreground">Select Premise Type:</span> Choose the type of shop (e.g., Hypermarket vs. Mini-Mart). The AI will adjust its "Fairness Tolerance" based on that shop's specific business model overhead.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-foreground mb-1">Step 2: Date Lookup & Audit</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li><span className="font-semibold text-foreground">Historical Lookup:</span> Select a date to pull actual historical USD and Diesel data from the database.</li>
                    <li><span className="font-semibold text-foreground">Actual Market Price (The Audit):</span> Enter the price you found at the shop. This triggers the Enforcement Engine.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-foreground mb-1">Step 3: View Intelligence</h5>
                  <p className="text-muted-foreground ml-2">
                    Click "Execute Causal Inference" to generate:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><span className="font-semibold text-foreground">Fair Price:</span> The mathematical price based on actual costs.</li>
                    <li><span className="font-semibold text-foreground">Risk Alert:</span> A traffic-light signal indicating if the retailer is overcharging.</li>
                    <li><span className="font-semibold text-foreground">Gemini Reasoning:</span> A human-readable explanation of the market state generated by AI.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Risk Alerts */}
            <section>
              <h3 className="text-lg font-semibold mb-3">3. Interpreting the "Risk Alerts"</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The system uses the Model's Mean Absolute Error (MAE) to ensure we are fair to retailers before flagging them.
              </p>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 font-semibold">Alert Level</th>
                      <th className="text-left p-2 font-semibold">Meaning</th>
                      <th className="text-left p-2 font-semibold">Mathematical Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-2">🟢 Stabilized</td>
                      <td className="p-2 text-muted-foreground">The market is behaving fairly.</td>
                      <td className="p-2 text-muted-foreground">Gap is within 1x MAE.</td>
                    </tr>
                    <tr>
                      <td className="p-2">🟡 Caution</td>
                      <td className="p-2 text-muted-foreground">Slight asymmetry detected.</td>
                      <td className="p-2 text-muted-foreground">Gap is between 1x and 2x MAE.</td>
                    </tr>
                    <tr>
                      <td className="p-2">🔴 High Risk</td>
                      <td className="p-2 text-muted-foreground">Profiteering Suspected.</td>
                      <td className="p-2 text-muted-foreground">Gap exceeds 2x the Adjusted MAE.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Premise Type Reference */}
            <section>
              <h3 className="text-lg font-semibold mb-3">4. Premise Type Reference Guide</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To ensure accuracy, the Hub applies a Tolerance Multiplier based on the premise type:
              </p>
              
              <ul className="space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Hypermarket</span> (e.g., Lotus's, Mydin): Most efficient. Strict 1.0x tolerance.</li>
                <li><span className="font-semibold text-foreground">Supermarket</span> (e.g., AEON, Jaya Grocer): Efficient central logistics. 1.03x - 1.05x tolerance.</li>
                <li><span className="font-semibold text-foreground">Wet Market</span> (e.g., Pasar Besar): Traditional stalls. Higher tolerance for meat (1.11x) but stricter for local fruit (0.98x).</li>
                <li><span className="font-semibold text-foreground">Mini-Mart</span> (e.g., 99 Speedmart, KK Mart): Convenience overhead. 1.09x - 1.15x tolerance.</li>
              </ul>
            </section>

            {/* Technical Specifications */}
            <section>
              <h3 className="text-lg font-semibold mb-3">5. Technical Specifications</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Model:</span> Stratified XGBoost Regressor.</li>
                <li><span className="font-semibold text-foreground">Training Period:</span> Jan 2022 – July 2025.</li>
                <li><span className="font-semibold text-foreground">Accuracy:</span> Mean Absolute Error (MAE) of RM 0.14 (Selangor Chicken).</li>
                <li><span className="font-semibold text-foreground">Explainability:</span> Integrated SHAP Values and Gemini 2.0 Flash for automated economic reasoning.</li>
              </ul>
            </section>

            {/* Developer Info */}
            <section className="border-t pt-6 mt-6 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Developed by Afzal Bin Zainol Ariffin</span>
                <br />
                Email: <a href="mailto:afzal.ariffin04@gmail.com" className="text-primary hover:underline break-all">afzal.ariffin04@gmail.com</a>
                <br />
                LinkedIn: <a href="https://www.linkedin.com/in/afzal-ariffin-764bb9277/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">linkedin.com/in/afzal-ariffin-764bb9277/</a>
                <br />
                Data Science Project 2025/2026 - Universiti Malaya
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
