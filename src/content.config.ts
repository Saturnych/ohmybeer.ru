import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders'; // Not available with legacy API
import { z } from 'astro/zod';

const breweries = defineCollection({
	//loader: glob({ pattern: '**/[^_]*.md', base: './src/data/breweries' }),
	loader: glob({
		pattern: '**/*.json',
		base: './src/data/breweries',
		parser: (text) => JSON.parse(text),
	}),
	schema: z.object({
		brewery_id: z.number(),
		brewery_name: z.string(),
		brewery_slug: z.string(),
		brewery_page_url: z.string(),
		brewery_type: z.string(),
		brewery_label: z.string().url(),
		country_name: z.string(),
		//contact: z.object().optional(),
		//location: z.object().optional(),
		brewery_city: z.string().optional(),
		brewery_state: z.string().optional(),
		brewery_active: z.number(),
		//pubDate: z.coerce.date().optional(),
		//updatedDate: z.coerce.date().optional(),
		// Reference an array of related posts from the `beers` collection by `slug`
		//beers: z.array(reference('beers')),
	}),
});

const beers = defineCollection({
	loader: glob({
		pattern: '**/*.json',
		base: './src/data/beers',
		parser: (text) => JSON.parse(text),
	}),
	schema: z.object({
		bid: z.number(),
		beer_name: z.string(),
		beer_label: z.string(),
		beer_abv: z.number(),
		beer_slug: z.string(),
		beer_ibu: z.number(),
		beer_description: z.string(),
		beer_style: z.string(),
		created_at: z.string(),
		in_production: z.number(),
		checkin_count: z.number().optional(),
		// Reference a single brewery from the `breweries` collection by `id`
		brewery: reference('breweries'),
	}),
});

const taps = defineCollection({
	loader: file('./src/data/taps.json', { parser: (text) => JSON.parse(text) }),
	schema: z.object({
		tap: z.number(),
		brewery: z.string(),
		beer: z.string(),
		style: z.string(),
		format: z.string(),
		country: z.string(),
		updatedAt: z.string(),
		abv: z.number().optional(),
		ibu: z.number().optional(),
		//type: z.enum(['Space Probe', 'Mars Rover', 'Comet Lander']),
		//status: z.enum(['Active', 'Inactive', 'Decommissioned']),
		//comments: z.array(z.string()),
	}),
});

export const collections = { taps, breweries, beers };

/*
{
      "checkin_count": 1506,
      "have_had": false,
      "your_count": 0,
      "beer": {
        "bid": 819531,
        "beer_name": "Ледяное",
        "beer_label": "https://assets.untappd.com/site/beer_logos/beer-819531_4664f_sm.jpeg",
        "beer_abv": 4.7,
        "beer_slug": "augustine-avgustin-ledyanoe",
        "beer_ibu": 14,
        "beer_description": "",
        "created_at": "Sun, 21 Sep 2014 13:32:14 +0000",
        "beer_style": "Lager - Helles",
        "in_production": 1,
        "auth_rating": 0,
        "wish_list": false
      },
      "brewery": {
        "brewery_id": 158657,
        "brewery_name": "Augustine (Августин)",
        "brewery_slug": "augustine-avgustin",
        "brewery_page_url": "/AugustinebeerAdmin",
        "brewery_type": "Micro Brewery",
        "brewery_label": "https://assets.untappd.com/site/brewery_logos/brewery-158657_fb18a.jpeg",
        "country_name": "Russia",
        "contact": {
          "twitter": "",
          "facebook": "",
          "instagram": "",
          "url": "https://vk.com/augustine_tula"
        },
        "location": {
          "brewery_city": "Тула",
          "brewery_state": "Тульская Область",
          "lat": 54.1790009,
          "lng": 37.5984993
        },
        "brewery_active": 1
      }
}

*/
