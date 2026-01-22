import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders'; // Not available with legacy API
import { z } from 'astro/zod';

const taps = defineCollection({
	loader: file('./src/data/taps.json', { parser: (text) => JSON.parse(text) }),
	schema: z.object({
		tap: z.number(),
		name: z.string(),
		style: z.string(),
		brewery: z.string(),
		country: z.string()
		//abv: z.number(),
		//ibu: z.number(),
		//updatedAt: z.date(),
		//type: z.enum(['Space Probe', 'Mars Rover', 'Comet Lander']),
		//status: z.enum(['Active', 'Inactive', 'Decommissioned']),
		//comments: z.array(z.string()),
	})
});

export const collections = { taps };
