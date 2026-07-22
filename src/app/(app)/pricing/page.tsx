"use client";

import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FREE_TIER_FEATURES,
  PRICE_LIFETIME_DISPLAY,
  PRICE_MONTHLY_DISPLAY,
  PRICE_YEARLY_DISPLAY,
  PRICE_YEARLY_PER_MONTH_DISPLAY,
  TEND_PLUS_FEATURES,
  YEARLY_SAVE_PERCENT,
  type CheckoutPlan,
} from "@/lib/pricing";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(plan: CheckoutPlan) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.devMode) {
        setError("Stripe isn’t configured in this environment (dev mode).");
        return;
      }
      setError(data.error || "Couldn’t start checkout. Please try again.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Grow without limits</h1>
        <p className="text-sm text-slate-500 mt-1">
          Built for the 12–18 month life change — warm, simple, and yours.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={cn("text-sm font-medium", !annual ? "text-slate-800" : "text-slate-500")}>Monthly</span>
        <button
          type="button"
          onClick={() => setAnnual(!annual)}
          className={cn("w-12 h-7 rounded-full p-1 transition-colors",
            annual ? "bg-green-500" : "bg-slate-300"
          )}
          aria-label="Toggle annual pricing"
        >
          <div className={cn("w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
            annual ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
        <span className={cn("text-sm font-medium", annual ? "text-slate-800" : "text-slate-500")}>
          Annual <span className="text-green-700 text-xs font-bold">Save {YEARLY_SAVE_PERCENT}%</span>
        </span>
      </div>

      <div className="grid gap-4">
        {/* Free */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">Free</h3>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-800">$0</span>
              <span className="text-sm text-slate-500"> forever</span>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {FREE_TIER_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 shrink-0 text-slate-400" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-2xl font-semibold text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            Current plan
          </button>
        </div>

        {/* Tend+ */}
        <div className="bg-white rounded-3xl border border-green-300 shadow-lg shadow-green-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-lg text-slate-800">Tend+</h3>
              </div>
              {annual && (
                <span className="text-xs text-green-700 font-medium">
                  Just {PRICE_YEARLY_PER_MONTH_DISPLAY}/mo, billed yearly
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-800">
                {annual ? PRICE_YEARLY_DISPLAY : PRICE_MONTHLY_DISPLAY}
              </span>
              <span className="text-sm text-slate-500">{annual ? "/year" : "/month"}</span>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {TEND_PLUS_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 shrink-0 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => handleCheckout(annual ? "annual" : "monthly")}
            disabled={!!loading}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors tap-bounce bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/25 disabled:opacity-60"
          >
            {loading === "annual" || loading === "monthly" ? "Loading..." : "Start growing"}
          </button>
        </div>

        {/* Forever */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-800">Tend Forever</h3>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-800">{PRICE_LIFETIME_DISPLAY}</span>
              <span className="text-sm text-slate-500"> once</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Same Tend+ perks, one payment, no subscription. Perfect if you hate recurring bills.
          </p>
          <button
            type="button"
            onClick={() => handleCheckout("lifetime")}
            disabled={!!loading}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading === "lifetime" ? "Loading..." : "Buy Forever"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-center text-sm text-red-500 mt-6" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
