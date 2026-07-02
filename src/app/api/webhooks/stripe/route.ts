import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Stripe llama a este endpoint cuando un pago se completa.
// Configura el webhook en https://dashboard.stripe.com/webhooks
// apuntando a https://tu-dominio.com/api/webhooks/stripe
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });
  }

  const payload = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object;
    const { userId, courseId } = checkout.metadata ?? {};
    if (userId && courseId) {
      await prisma.purchase.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { status: "PAID", amountCents: checkout.amount_total ?? 0 },
        create: {
          userId,
          courseId,
          status: "PAID",
          stripeSessionId: checkout.id,
          amountCents: checkout.amount_total ?? 0,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
