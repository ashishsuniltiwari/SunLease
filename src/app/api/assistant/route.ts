import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const RWA_SOLAR_EDUCATION_SYSTEM_PROMPT = `You are the SunLease RWA Solar Copilot, an expert advisor dedicated strictly to educating Housing Societies (Resident Welfare Associations - RWAs) in India about rooftop solar leasing, RESCO/OPEX models, and renewable energy adoption.

STRICT DOMAIN RESTRICTION & GUARDRAILS:
1. You must ONLY answer questions regarding:
   - Residential housing society rooftop solar feasibility, terrace structural load bearing (180 kg/m² standard), and wind zone compliance.
   - RESCO (Renewable Energy Service Company) / OPEX zero-capex solar leasing models vs self-funded CAPEX models.
   - Indian DISCOM net-metering regulations (e.g. MSEDCL, Adani Electricity, Tata Power, BESCOM) and the latest MNRE RTS Phase-II / PM Surya Ghar policies.
   - Tripartite Power Purchase Agreements (PPAs), tariff savings, annual inflation escalation indices, and automated escrow monthly payouts.
   - Solar equipment specifications (Tier-1 mono-PERC bifacial panels, string vs microinverters, generation ratios of ~4.0 to 4.5 kWh/kWp/day) and maintenance/cleaning SLAs.
   - Carbon offsets, green building ratings, and common-area power bill reductions.

2. REFUSAL POLICY:
   If the user asks about anything unrelated to residential rooftop solar, RWA governance of solar assets, or renewable energy leasing (e.g. general coding, creative writing, unrelated finance, personal advice, politics, general trivia), politely and firmly refuse:
   "I am the SunLease RWA Solar Copilot, specialized strictly in advising Resident Welfare Associations on rooftop solar feasibility, RESCO contracts, and DISCOM net-metering. Please feel free to ask any question regarding housing society solar adoption!"

3. TONE & APPROACH:
   Provide clear, practical, authoritative guidance tailored for RWA committee members and apartment residents looking to achieve zero-cost common power bills.`;

/**
 * Generate educational response fallback when OpenAI API key is missing or calls fail
 */
function generateEducationalFallbackStream(userQuery: string): ReadableStream<Uint8Array> {
  const q = userQuery.toLowerCase();
  let text = "";

  if (q.includes("esco") || q.includes("share") || q.includes("revenue") || q.includes("model")) {
    text = `Under the SunLease RESCO (Renewable Energy Service Company) Zero-Capex Model:

1. Zero Capital Outlay: The housing society invests ₹0 upfront. The empanelled EPC developer finances 100% of equipment, installation, and DISCOM grid-tie synchronization.
2. Guaranteed Lease Payouts: The society receives guaranteed monthly lease revenue for terrace utilization (or substantial common-area electricity bill tariff discounts of 35%–45% vs DISCOM grid rates).
3. Risk Absorption: Inverter replacements, panel degradation, and robotic cleaning obligations are 100% borne by the EPC contractor for the entire 25-year PPA tenure.
4. Tripartite Escrow: Payments are auto-settled through a scheduled tripartite escrow account directly into the society bank account on the 5th of each month.`;
  } else if (q.includes("audit") || q.includes("load") || q.includes("structure")) {
    text = `Rooftop Structural & Shadow Feasibility Guidelines for RWAs:

1. Structural Load Bearing: A standard residential solar array requires approx 15–20 kg/m² for ballasted non-penetrating mounts. Typical concrete RCC terraces in MMR are certified for 150–180 kg/m² (Wind Zone III compliant).
2. Waterproofing & Roof Membrane: Non-penetrating chemical anchoring or pre-cast concrete ballast blocks are used, ensuring the building's terrace waterproofing warranty remains 100% intact.
3. Shadow Assessment: A minimum 4.5 peak sun hours per day with less than 5% parapet obstruction between 09:00 and 16:00 is required for optimal generation yield (~4.2 kWh per kWp installed).`;
  } else if (q.includes("tariff") || q.includes("discom") || q.includes("rate") || q.includes("cost")) {
    text = `DISCOM Net-Metering & Tariff Comparison:

1. Standard DISCOM Commercial Grid Tariff: ₹7.50 to ₹9.20 per kWh for common amenities (elevators, water pumps, clubhouse lighting).
2. Competitive Solar PPA Tariff: ₹3.20 to ₹3.50 per kWh, locked for 25 years with a nominal 2% annual escalation index.
3. Net Metering Approval: Under MSEDCL / Adani regulations, housing societies can interconnect up to 100% of their sanctioned common meter load (kVA) to feed surplus units into the grid via bidirectional net meters.`;
  } else if (q.includes("code") || q.includes("python") || q.includes("president") || q.includes("movie") || q.includes("recipe")) {
    text = `I am the SunLease RWA Solar Copilot, specialized strictly in advising Resident Welfare Associations on rooftop solar feasibility, RESCO contracts, and DISCOM net-metering. Please feel free to ask any question regarding housing society solar adoption!`;
  } else {
    text = `Hello from the SunLease RWA Solar Copilot!

I am specialized strictly in guiding Resident Welfare Associations (RWAs) through the complete solar adoption journey:
• Evaluating rooftop usable area and solar capacity potential (~1 kWp per 100 sq ft).
• Structuring zero-capex RESCO contracts with verified Tier-1 EPC developers.
• Navigating DISCOM bidirectional net-metering compliance and MNRE Phase-II incentives.
• Managing automated escrow lease payouts and structural load-bearing audits.

How can I help your housing society today? Feel free to ask about RESCO models, tariff savings, or rooftop feasibility!`;
  }

  const encoder = new TextEncoder();
  const words = text.split(" ");
  let i = 0;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function pushWord() {
        if (i < words.length) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(chunk));
          i++;
          setTimeout(pushWord, 15);
        } else {
          controller.close();
        }
      }
      pushWord();
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawMessages = body.messages || [];

    // Extract user messages
    const formattedMessages = rawMessages.map((m: any) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: String(m.content || m.text || ""),
    }));

    const lastUserMessage =
      formattedMessages.filter((m: any) => m.role === "user").pop()?.content ||
      body.prompt ||
      "";

    // If no OpenAI API Key or fallback is preferred, use the educational stream
    if (!process.env.OPENAI_API_KEY) {
      const stream = generateEducationalFallbackStream(lastUserMessage);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    try {
      // Use AI SDK streamText with OpenAI
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: RWA_SOLAR_EDUCATION_SYSTEM_PROMPT,
        messages: formattedMessages.length > 0 ? formattedMessages : [{ role: "user", content: lastUserMessage }],
      });

      return result.toTextStreamResponse();
    } catch (openAiError: any) {
      console.warn("OpenAI API call failed, using educational fallback stream:", openAiError?.message);
      const stream = generateEducationalFallbackStream(lastUserMessage);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (error: any) {
    console.error("POST /api/assistant error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI assistant stream" },
      { status: 500 }
    );
  }
}
