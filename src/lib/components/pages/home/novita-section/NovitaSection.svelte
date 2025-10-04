<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { ProductType } from '../../../../types';
	import Card from './Card.svelte';

	const products: ProductType[] = [
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
	];
</script>

<section class=" py-20">
	<div class="container_custom">
		<h2 class=" mb-10 text-center text-5xl uppercase">NOVITÀ</h2>
		<div class=" list">
			{#each products as product (product.id)}
				<Card {...product} />
			{/each}
		</div>
		<a type="button" href={localizeHref('/cartsearch')}> TUTTI I PRODOTTI DEL NOSTRO CATALOGO</a>
	</div>
</section>

<style>
	.list {
		display: grid;
		gap: 3rem;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
</style>
