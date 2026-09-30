import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('Claquete'),
  VITE_IBGE_API_URL: z.url().default('https://servicodados.ibge.gov.br/api/v1/localidades'),
  VITE_MUNICIPALITIES_COORDS_URL: z
    .url()
    .default(
      'https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/json/municipios.json',
    ),
  VITE_ROUTING_API_URL: z.url().default('https://router.project-osrm.org'),
  VITE_DEFAULT_LOCALE: z.string().default('pt-BR'),
  VITE_DEFAULT_CURRENCY: z.string().length(3).default('BRL'),
  VITE_STORAGE_KEY: z.string().min(1).default('calc-precificacao:v1'),
});

/** Variáveis de ambiente validadas na inicialização — falha cedo se algo estiver errado. */
export const env = envSchema.parse(import.meta.env);
