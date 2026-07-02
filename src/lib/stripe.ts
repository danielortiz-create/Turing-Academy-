import Stripe from "stripe";

// Instancia perezosa: no falla en build si la clave aún no está configurada
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY no está configurada en las variables de entorno");
  }
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
