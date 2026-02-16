"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, Landmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type DonationMethod, type DonationMethodConfig } from "@/lib/donations"

type MethodsResponse = {
  mode: "hosted" | "api"
  methods: DonationMethodConfig[]
  bank: {
    bankName: string
    accountName: string
    accountNumber: string
    swiftCode: string
    referenceNote: string
  }
}

const amountOptions = [5, 10, 25]

export function SupportClient() {
  const [data, setData] = useState<MethodsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [workingMethod, setWorkingMethod] = useState<DonationMethod | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState(10)
  const [currency, setCurrency] = useState("USD")
  const [bankRef, setBankRef] = useState("")
  const [transferReference, setTransferReference] = useState("")
  const [proofUrl, setProofUrl] = useState("")
  const [proofNotes, setProofNotes] = useState("")
  const [proofSaved, setProofSaved] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const res = await fetch("/api/payments/methods", { cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!active) return
      if (!res.ok || !body) {
        setError("Unable to load payment methods.")
      } else {
        setData(body as MethodsResponse)
      }
      setLoading(false)
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const sortedMethods = useMemo(() => data?.methods ?? [], [data])

  const trackClick = async (method: DonationMethod) => {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "support_click",
        payload: { method, amount, currency },
      }),
      keepalive: true,
    }).catch(() => undefined)
  }

  const startCheckout = async (method: DonationMethod) => {
    setError(null)
    setProofSaved(false)
    setWorkingMethod(method)
    await trackClick(method)

    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: method, amount, currency }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body) {
        setError("Could not initialize this payment method.")
        return
      }

      if (method === "bank" && typeof body.providerRef === "string") {
        setBankRef(body.providerRef)
      }

      if (typeof body.checkoutUrl === "string" && body.checkoutUrl.length > 0) {
        window.open(body.checkoutUrl, "_blank", "noopener,noreferrer")
      } else if (typeof body.message === "string" && body.message.length > 0) {
        setError(body.message)
      }
    } finally {
      setWorkingMethod(null)
    }
  }

  const submitBankProof = async () => {
    if (!bankRef || !transferReference.trim()) {
      setError("Provide the transfer reference before submitting proof.")
      return
    }
    setError(null)
    const res = await fetch("/api/payments/bank/submit-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerRef: bankRef,
        transferReference: transferReference.trim(),
        amount,
        currency,
        proofUrl: proofUrl.trim() || undefined,
        notes: proofNotes.trim() || undefined,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ?? "Failed to submit bank transfer proof.")
      return
    }
    setProofSaved(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          {data?.mode ? (
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
              {data.mode} mode
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Support GoalPilot</h1>
          <p className="text-slate-400">
            Choose a payment method, then continue on the provider checkout page.
          </p>
        </div>

        <Card className="border-slate-700/70 bg-slate-900/70">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Amount</p>
              <div className="flex flex-wrap gap-2">
                {amountOptions.map((value) => (
                  <Button
                    key={value}
                    variant={amount === value ? "primary" : "outline"}
                    size="sm"
                    className={amount === value ? "bg-violet-600 border-violet-600" : "border-slate-700"}
                    onClick={() => setAmount(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Currency</p>
              <div className="flex gap-2">
                {["USD", "KES"].map((value) => (
                  <Button
                    key={value}
                    variant={currency === value ? "primary" : "outline"}
                    size="sm"
                    className={currency === value ? "bg-violet-600 border-violet-600" : "border-slate-700"}
                    onClick={() => setCurrency(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        ) : null}

        {loading ? (
          <div className="text-slate-400">Loading payment methods...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedMethods.map((method) => {
              const isWorking = workingMethod === method.method
              const disabled = !method.enabled && method.method !== "bank"
              const buttonLabel = disabled ? "Coming soon" : method.method === "bank" ? "Use bank transfer" : "Continue"

              return (
                <Card key={method.method} className="border-slate-700/70 bg-slate-900/70">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold text-lg">{method.label}</h2>
                        <p className="text-sm text-slate-400 mt-1">{method.description}</p>
                      </div>
                      {method.enabled ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock3 className="h-5 w-5 text-amber-400 shrink-0" />
                      )}
                    </div>

                    <Button
                      variant={disabled ? "outline" : "primary"}
                      className={disabled ? "w-full border-slate-700 text-slate-500" : "w-full bg-violet-600 hover:bg-violet-500"}
                      onClick={() => void startCheckout(method.method)}
                      disabled={disabled || isWorking}
                    >
                      {isWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                      {buttonLabel}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Card className="border-slate-700/70 bg-slate-900/70">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-slate-300" />
              <h2 className="font-semibold">Local bank transfer</h2>
            </div>

            <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
              <p><span className="text-slate-500">Bank:</span> {data?.bank.bankName || "Set NEXT_PUBLIC_BANK_NAME"}</p>
              <p><span className="text-slate-500">Account Name:</span> {data?.bank.accountName || "Set NEXT_PUBLIC_BANK_ACCOUNT_NAME"}</p>
              <p><span className="text-slate-500">Account Number:</span> {data?.bank.accountNumber || "Set NEXT_PUBLIC_BANK_ACCOUNT_NUMBER"}</p>
              <p><span className="text-slate-500">SWIFT:</span> {data?.bank.swiftCode || "Optional"}</p>
            </div>
            <p className="text-xs text-slate-500">{data?.bank.referenceNote}</p>

            {bankRef ? (
              <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4 space-y-3">
                <p className="text-xs text-slate-400">
                  Bank reference ID: <span className="font-mono text-slate-200">{bankRef}</span>
                </p>
                <input
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="Your transfer reference code"
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm"
                />
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Proof URL (optional)"
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm"
                />
                <textarea
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                />
                <Button className="bg-violet-600 hover:bg-violet-500" onClick={() => void submitBankProof()}>
                  Submit bank transfer proof
                </Button>
                {proofSaved ? <p className="text-xs text-emerald-300">Proof received. Status is pending verification.</p> : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

