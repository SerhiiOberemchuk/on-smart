<script>
	import { localizeHref } from '$lib/paraglide/runtime';
	import carello from '$lib/assets/images/carello.png';
	import camion from '$lib/assets/images/camion.png';
	import { stateBascet } from '../../states/bascetState.svelte';
	import Logo from '../common/Logo.svelte';
	let search = $state('');
</script>

<header class="container_custom flex flex-wrap items-center justify-between gap-4 p-4 lg:flex-row">
	<Logo />
	{@render nav()}
	{@render ricerca()}
	{@render spedizione()}
</header>

{#snippet nav()}
	<nav class="flex gap-4 text-2xl">
		<a href={localizeHref('/')} class=" hover:text-yellow-300">Home</a>
		<a href={localizeHref('/catalogo')} class=" hover:text-yellow-300">Catalogo</a>
	</nav>
{/snippet}

{#snippet ricerca()}
	<div>
		<input
			bind:value={search}
			name="search"
			aria-label="Ricerca"
			type="text"
			placeholder="Ricerca..."
			class="rounded-md border-2 border-gray-500 px-3 py-2 text-black"
		/>
		<button
			type="button"
			onclick={() => console.log('Search request>>', search)}
			class=" mx-auto rounded-lg bg-gray-500 px-2 py-1 text-2xl font-medium uppercase"
			>Ricerca</button
		>
		<a
			href={localizeHref('/carello')}
			class=" mx-auto mt-2 flex w-max items-center gap-2 hover:scale-110"
		>
			<span class=" text-lg font-medium uppercase">Carello</span>
			<span class=" relative">
				<img src={carello} alt="carello" />
				<span
					class=" absolute right-0 bottom-0 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-center"
				>
					<span>{stateBascet.bascet?.length || 0}</span>
				</span>
			</span>
		</a>
	</div>
{/snippet}
{#snippet spedizione()}
	<div class="pulse_scale">
		<img src={camion} width={90} height="60" alt="cammion spedizione " class=" mx-auto" />
		<p class=" max-w-32 text-center text-2xl text-yellow-200 uppercase">SPEDIZIONE GRATUITA</p>
	</div>
{/snippet}

<style>
	/* header {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	} */
</style>
