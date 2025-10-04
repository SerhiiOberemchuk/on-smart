<script lang="ts">
	import clsx from 'clsx';
	import Logo from '../common/Logo.svelte';

	let name = $state();
	let email = $state();
	let text = $state();
	$inspect({ name });
	async function submit(e: SubmitEvent) {
		e.preventDefault();

		try {
			const result = await fetch('/api/email', {
				method: 'POST',
				body: JSON.stringify({
					name,
					email,
					text
				}),
				headers: {
					'content-type': 'application/json'
				}
			});

			console.log({ resultjson: await result.json() });
		} catch (error) {
			console.log(error);
		}
	}
	let showMessage = $state<boolean>();
</script>

<footer class="container_custom grid_container py-10">
	<Logo />
	<address>
		<h2>OLENA NUDZHEVSKA</h2>
		<p>83100 Avellino</p>
		<a href="tel:+393516930878">+393516930878</a>
		<a href="mailto:info@on-smart.it">info@on-smart.it</a>
	</address>
	{#if showMessage}
		<div>
			<h2>Grazzie!!!!!</h2>
			<button
				type="button"
				class=" rounded-xl bg-green-700 p-2 font-bold"
				onclick={() => (showMessage = false)}>Invia nuovo message</button
			>
		</div>
	{:else}
		<form onsubmit={submit} class=" flex flex-col gap-2">
			<input
				bind:value={name}
				required
				type="text"
				name="name"
				placeholder="nome*"
				class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
			/>
			<input
				required
				type="email"
				bind:value={email}
				name="email"
				id="email_id"
				placeholder="e-mail*"
				class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
			/>
			<textarea
				required
				bind:value={text}
				name="text"
				id="messagio_id"
				placeholder="Messagio*"
				class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
			></textarea>
			<button
				class={clsx('mx-auto rounded-xl px-10 py-2 font-bold text-white uppercase', 'bg-green-700')}
			>
				<span>Inviare</span>
			</button>
		</form>
	{/if}
</footer>

<style>
	.grid_container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
</style>
