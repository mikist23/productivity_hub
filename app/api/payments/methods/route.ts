import { NextRequest } from "next/server"
import { getDonationMethodConfigs, getDonationMode, getLocalBankInstructions } from "@/lib/donations"
import { jsonNoStore } from "@/lib/payments/http"

export async function GET(req: NextRequest) {
  void req
  const mode = getDonationMode()
  const methods = getDonationMethodConfigs()

  return jsonNoStore({
    mode,
    methods,
    bank: getLocalBankInstructions(),
  })
}
