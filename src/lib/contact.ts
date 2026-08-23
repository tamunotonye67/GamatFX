/** Single source of truth for GAMAT Fx Academy contact details. */
export const CONTACT = {
  phone: "+234 806 194 9891",
  phoneHref: "tel:+2348061949891",
  whatsapp: "+234 806 194 9891",
  whatsappHref: "https://wa.me/2348061949891",
  /** Deep-link that opens WhatsApp with a prefilled AI-agent prompt. */
  whatsappAiHref:
    "https://wa.me/2348061949891?text=" +
    encodeURIComponent("Hi GAMAT AI Agent — I'd like help with forex education / my account."),
  email: "hello@gamatfxacademy.com",
  telegram: "https://t.me/gamatfxacademy",
  city: "Port Harcourt, Nigeria",
  addressShort: "Rumuologu, Choba-Ozouba Road, Port Harcourt",
  address:
    "Skillerville Gleetech, Conoil Filling Station, Rumuologu (By Car Wash Junction), Choba-Ozouba Road, Port Harcourt",
  hours: "Mon – Fri, 9:00 AM – 5:00 PM WAT",
} as const;
