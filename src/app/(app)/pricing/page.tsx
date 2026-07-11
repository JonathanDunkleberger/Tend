"use client";

import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleCheckout(plan: "monthly" | "annual") {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "3 habit eggs",
        "Random dragon egg",
        "All wellness tools",
        "Grace tokens at milestones",
        "Daily check-ins & 30-day history",
      ],
      cta: "Current Plan",
      disabled: true,
    },
    {
      name: "Tend+",
      price: annual ? "$39.99" : "$4.99",
      period: annual ? "/year" : "/month",
      savings: annual ? "Save $20/year" : null,
      features: [
        "Unlimited habit eggs",
        "Choose your dragon egg & species",
        "Full deep insights + Tend Wrapped",
        "All garden décor & themes",
        "Extra grace tokens",
        "Priority support",
      ],
      cta: "Start Growing",
      plan: (annual ? "annual" : "monthly") as "monthly" | "annual",
      isPro: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Grow Without Limits</h1>
        <p className="text-sm text-slate-500 mt-1">Upgrade to Tend+ to unlock your full potential.</p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={cn("text-sm font-medium", !annual ? "text-slate-800" : "text-slate-500")}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={cn("w-12 h-7 rounded-full p-1 transition-colors",
            annual ? "bg-green-500" : "bg-slate-300"
          )}
        >
          <div className={cn("w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
            annual ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
        <span className={cn("text-sm font-medium", annual ? "text-slate-800" : "text-slate-500")}>
          Annual <span className="text-green-700 text-xs font-bold">Save 33%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid gap-4">
        {plans.map((plan) => (
          <div key={plan.name}
            className={cn("bg-white rounded-3xl border p-6",
              plan.isPro ? "border-green-300 shadow-lg shadow-green-500/10" : "border-slate-200"
            )}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {plan.isPro && <Crown className="w-5 h-5 text-amber-500" />}
                  <h3 className="font-bold text-lg text-slate-800">{plan.name}</h3>
                </div>
                {plan.savings && (
                  <span className="text-xs text-green-700 font-medium">{plan.savings}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className={cn("w-4 h-4 shrink-0", plan.isPro ? "text-green-500" : "text-slate-400")} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => plan.plan && handleCheckout(plan.plan)}
              disabled={plan.disabled || loading}
              className={cn("w-full py-3 rounded-2xl font-semibold text-sm transition-colors tap-bounce",
                plan.isPro
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/25"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {loading && plan.isPro ? "Loading..." : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
