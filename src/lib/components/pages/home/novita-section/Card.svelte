<script lang="ts">
	import clsx from 'clsx';
	import { stateBascet } from '../../../../states/bascetState.svelte';
	import type { ProductType } from '../../../../types';
	import cardImage from '$lib/assets/images/cardimage.png';

	let qnt = $state<number>(1);
	let price = $state(1);
	$inspect(price);
	const { id, title, variants, price: pr }: ProductType = $props();
	$effect(() => {
		if (variants) price = variants[0].price;
		else price = pr;
	});
</script>

<article {id} class="flex flex-col justify-between rounded-xl bg-amber-50 p-2 text-black">
	<figure class=" mb-5">
		<img src={cardImage} alt="product" class=" mx-auto" />
		<figcaption>{title}</figcaption>
	</figure>
	<span class=" font-bold text-green-700">{price.toFixed(2)} € (IVA incl.)</span>
	{#if variants}
		<select class=" font-bold text-green-700" name="variants" bind:value={price} {id}>
			{#each variants as { price, option }, i (option)}
				<option class=" font-bold text-green-700" value={price}>{option}</option>
			{/each}
		</select>
	{/if}

	<div class=" mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
		<input
			bind:value={qnt}
			defaultValue={1}
			type="number"
			min="1"
			required
			name="prod quantity"
			class=" font-bold text-green-700"
		/>
		<button
			disabled={qnt < 1}
			onclick={() => stateBascet.setProduct({ id, qnt })}
			type="button"
			class={clsx(
				'rounded-xl px-4 py-4 font-bold text-white ',
				qnt < 1 ? 'bg-green-200' : ' bg-green-700 hover:bg-green-500'
			)}
			aria-label="add to basket">Aggiungi</button
		>
	</div>
</article>

<style>
</style>
