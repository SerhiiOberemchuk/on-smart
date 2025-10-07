import type { ProductType } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// const ddd= 'https://obriym.salesdrive.me/export/yml/export.yml?publicKey=$-$-$_$_$'
	// const dataMySalesDriveCRM = await fetch('ddd', { method: 'get' });
	return {
		products: [
			{
				id: 'pr1',
				title: 'Telecamera 1 Uniview UV-IPC2314LE-ADF28KM-WP notturna a colori con audio',
				slug: 'tele',
				price: 150,
				variants: [
					{ price: 100, option: 'con Hard Disc 500GB' },
					{ price: 150, option: 'con Hard Disc 1TB' },
					{ price: 200, option: 'con Hard Disc 2TB' }
				]
			},
			{
				id: 'pr2',
				title: 'Telecamera 2',
				slug: 'tele',
				price: 150,
				variants: [
					{ price: 70, option: 'senza Hard Disc' },
					{ price: 100, option: 'con Hard Disc 500GB' },
					{ price: 150, option: 'con Hard Disc 1TB' },
					{ price: 200, option: 'con Hard Disc 2TB' }
				]
			},
			{
				id: 'pr3',
				title: 'Telecamera 3',
				slug: 'tele',
				price: 150
				// variants: [{ price: 75, option: 'Camera' }]
			}
		]
	} satisfies { products: ProductType[] };
};
