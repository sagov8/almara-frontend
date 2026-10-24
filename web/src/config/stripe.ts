import { loadStripe } from '@stripe/stripe-js';

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    '[Stripe Config] Advertencia: VITE_STRIPE_PUBLISHABLE_KEY no está configurada en el archivo .env.'
  );
}

/**
 * Instancia singleton de la promesa de carga de Stripe.
 * Permite inicializar el SDK de Stripe en el navegador de manera lazy y segura.
 */
export const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;
