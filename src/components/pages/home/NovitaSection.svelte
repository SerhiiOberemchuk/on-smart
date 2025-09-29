<script lang="ts">
	import cardImage from '$lib/assets/images/cardimage.png';
	import { stateBascet } from '../../../states/bascetState.svelte';
	let qnt = $state<number>(1);

	const setToBascet = ({}: Partial<ProductType> & { qnt: number }) => {
		console.log(qnt);
		stateBascet.setQnt(qnt);
	};
	let id = 'dfdfdf';

	type ProductType = {
		id: string;
	};
</script>

<section class=" py-20">
	<div class="mx-auto px-4 md:px-8 xl:px-10">
		<h2 class=" mb-10 text-center text-5xl uppercase">NOVITÀ</h2>
		{@render card({ id })}
	</div>
</section>
{#snippet card({ id }: ProductType)}
	<article {id} class=" max-w-96 rounded-xl bg-amber-50 p-2 text-black">
		<figure class=" mb-5">
			<img src={cardImage} alt="product" class=" mx-auto" />
			<figcaption>Description products</figcaption>
		</figure>
		<span class=" font-bold text-green-700">130.70 € (IVA incl.)</span>
		<div class=" mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
			<input
				bind:value={qnt}
				defaultValue={1}
				type="number"
				min="1"
				required
				name="prod quantity"
				class=" font-bold text-green-700"
				id="id from cms!"
			/>
			<button
				onclick={() => setToBascet({ qnt })}
				type="button"
				class=" rounded-xl bg-green-700 px-4 py-4 font-bold text-white hover:bg-green-500"
				aria-label="add to basket">Aggiungi</button
			>
			<span>{stateBascet.qnt}</span>
		</div>
	</article>
{/snippet}
