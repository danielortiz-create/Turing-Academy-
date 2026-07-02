import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

// Crea una sesión de Stripe Checkout para comprar un curso
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { courseId } = await req.json().catch(() => ({}));
  if (!courseId) {
    return NextResponse.json({ error: "Falta courseId" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }
  if (course.priceCents === 0) {
    return NextResponse.json({ error: "Este curso es gratuito" }, { status: 400 });
  }

  const existing = await prisma.purchase.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing?.status === "PAID") {
    return NextResponse.json({ error: "Ya compraste este curso" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Los pagos aún no están configurados. Contacta al administrador." },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: course.priceCents,
          product_data: {
            name: course.title,
            description: course.subtitle ?? undefined,
          },
        },
      },
    ],
    metadata: { userId: session.user.id, courseId: course.id },
    success_url: `${baseUrl}/cursos/${course.slug}?compra=exitosa`,
    cancel_url: `${baseUrl}/cursos/${course.slug}?compra=cancelada`,
  });

  await prisma.purchase.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    update: { stripeSessionId: checkout.id, status: "PENDING" },
    create: {
      userId: session.user.id,
      courseId,
      stripeSessionId: checkout.id,
      amountCents: course.priceCents,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: checkout.url });
}
