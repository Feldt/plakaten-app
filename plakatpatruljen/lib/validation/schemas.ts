import { z } from 'zod';

export const emailSchema = z.string().email('Ugyldig email-adresse');

export const passwordSchema = z
  .string()
  .min(8, 'Adgangskoden skal være mindst 8 tegn')
  .regex(/[A-Z]/, 'Adgangskoden skal indeholde mindst ét stort bogstav')
  .regex(/[0-9]/, 'Adgangskoden skal indeholde mindst ét tal');

export const phoneSchema = z
  .string()
  .regex(/^(\+45)?[2-9]\d{7}$/, 'Ugyldigt dansk telefonnummer');

export const cvrSchema = z
  .string()
  .regex(/^\d{8}$/, 'CVR-nummer skal være 8 cifre');

// Registration-specific schemas
export const workerRegistrationSchema = z.object({
  name: z.string().min(2, 'Navn skal være mindst 2 tegn').max(100, 'Navn må højst være 100 tegn'),
  email: emailSchema.optional().or(z.literal('')),
  phone: z.string().regex(/^[2-9]\d{7}$/, 'Ugyldigt dansk telefonnummer (8 cifre)'),
});

export const partyRegistrationSchema = z.object({
  orgName: z.string().min(2, 'Organisationsnavn er påkrævet'),
  cvrNumber: cvrSchema,
  contactName: z.string().min(2, 'Kontaktperson er påkrævet'),
  email: emailSchema,
  phone: z.string().refine(
    (val) => /^[2-9]\d{7}$/.test(val.replace(/[\s\-]/g, '').replace(/^\+?45/, '')),
    { message: 'Ugyldigt dansk telefonnummer (8 cifre)' },
  ),
  streetAddress: z.string().min(2, 'Vejnavn er påkrævet'),
  zipCode: z.string().regex(/^\d{4}$/, 'Postnummer skal være 4 cifre'),
  city: z.string().min(1, 'By er påkrævet'),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, { message: 'Du skal acceptere vilkårene' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Adgangskoderne stemmer ikke overens',
  path: ['confirmPassword'],
});

export const phoneLoginSchema = z.object({
  phone: z.string().regex(/^[2-9]\d{7}$/, 'Ugyldigt dansk telefonnummer (8 cifre)'),
});

// Campaign creation step schemas
export const campaignBasicSchema = z.object({
  title: z.string().min(3, 'Titel skal være mindst 3 tegn'),
  electionType: z.enum(['kommunal', 'regional', 'folketings', 'europa']),
  electionDate: z.string().min(1, 'Valgdato er påkrævet'),
  electionCalledDate: z.string().optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (data.electionType === 'folketings') {
      return !!data.electionCalledDate;
    }
    return true;
  },
  { message: 'Udskrivelsesdato er påkrævet for folketingsvalg', path: ['electionCalledDate'] },
);

export const campaignBudgetSchema = z.object({
  posterCount: z.number().min(1, 'Mindst 1 plakat'),
  pricePerPosterHang: z.number().min(0, 'Pris skal være positiv'),
  pricePerPosterRemove: z.number().min(0, 'Pris skal være positiv'),
});

export const campaignPickupSchema = z.object({
  pickupLocations: z.array(z.object({
    name: z.string().min(1, 'Navn er påkrævet'),
    address: z.string().min(1, 'Adresse er påkrævet'),
    latitude: z.number(),
    longitude: z.number(),
    availablePosters: z.number().min(0),
    openHours: z.string().min(1, 'Åbningstider er påkrævet'),
  })).min(1, 'Mindst ét afhentningssted er påkrævet'),
});

export const campaignContactSchema = z.object({
  name: z.string().min(2, 'Kontaktperson er påkrævet'),
  phone: phoneSchema,
  email: emailSchema,
});

export type CampaignBasicFormData = z.infer<typeof campaignBasicSchema>;
export type CampaignBudgetFormData = z.infer<typeof campaignBudgetSchema>;
export type CampaignPickupFormData = z.infer<typeof campaignPickupSchema>;
export type CampaignContactFormData = z.infer<typeof campaignContactSchema>;

export type WorkerRegistrationFormData = z.infer<typeof workerRegistrationSchema>;
export type PartyRegistrationFormData = z.infer<typeof partyRegistrationSchema>;
export type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;
