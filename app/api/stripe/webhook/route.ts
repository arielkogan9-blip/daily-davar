import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function setTier(customerId: string, tier: string) {
  await prisma.user.updateMany({ where: { stripeCustomerId: customerId }, data: { tier } });
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-05-27.dahlia" });
  const TIER_MAP: Record<string, string> = {
    [process.env.STRIPE_PLUS_MONTHLY_PRICE_ID ?? ""]:    "plus",
    [process.env.STRIPE_PLUS_YEARLY_PRICE_ID ?? ""]:     "plus",
    [process.env.STRIPE_SCHOLAR_MONTHLY_PRICE_ID ?? ""]: "scholar",
    [process.env.STRIPE_SCHOLAR_YEARLY_PRICE_ID ?? ""]:  "scholar",
  };
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.customer) break;
        // tier is resolved on invoice.payment_succeeded below
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const lines = invoice.lines?.data ?? [];
        const lineItem = lines[0] as { pricing?: { price_details?: { price?: string } } } | undefined;
        const priceId = lineItem?.pricing?.price_details?.price ?? "";
        const tier = TIER_MAP[priceId] ?? "free";
        if (tier !== "free") await setTier(customerId, tier);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setTier(customerId, "free");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        if (sub.status === "canceled" || sub.status === "unpaid") {
          await setTier(customerId, "free");
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
