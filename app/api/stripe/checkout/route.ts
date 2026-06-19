import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-05-27.dahlia" });
  const PRICE_IDS: Record<string, string | undefined> = {
    "plus-monthly":    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID,
    "plus-yearly":     process.env.STRIPE_PLUS_YEARLY_PRICE_ID,
    "scholar-monthly": process.env.STRIPE_SCHOLAR_MONTHLY_PRICE_ID,
    "scholar-yearly":  process.env.STRIPE_SCHOLAR_YEARLY_PRICE_ID,
  };
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to subscribe." }, { status: 401 });
  }

  const { plan } = await req.json() as { plan?: string };
  const priceId = plan ? PRICE_IDS[plan] : undefined;

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://daily-davar.vercel.app";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
