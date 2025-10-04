<script lang="ts">
	import clsx from 'clsx';
	import Logo from '../common/Logo.svelte';

	let name = $state<string | null>(null);
	let email = $state<string | null>(null);
	let text = $state<string | null>(null);
	let showMessage = $state<boolean>(false);
	let loading = $state<boolean>(false);
	let errorMsg = $state<string | null>(null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		try {
			const result = await fetch('/api/email', {
				method: 'POST',
				body: JSON.stringify({
					name,
					email,
					text
				})
			});

			showMessage = true;
			name = null;
			email = null;
			text = null;
		} catch (error) {
			console.error(error);
			errorMsg = 'Si è verificato un errore. Riprova più tardi.';
		} finally {
			loading = false;
		}
	}
</script>

<footer class="container_custom grid_container py-10">
	<Logo />

	{#if showMessage}
		<div class="lg:max-w-2/3">
			<h2>
				Grazie per averci contattato! <br /> Il team On-Smart ha ricevuto il tuo messaggio e ti
				risponderà al più presto. <br />Apprezziamo la tua fiducia e siamo sempre a disposizione per
				offrirti assistenza e le migliori soluzioni tecnologiche.
			</h2>
			<button
				type="button"
				class=" mx-auto rounded-xl bg-green-700 p-2 font-bold hover:bg-green-500"
				onclick={() => (showMessage = false)}>Invia un nuovo message</button
			>
		</div>
	{:else}
		<form onsubmit={submit} class=" mx-auto flex w-2/3 flex-col gap-2">
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
			{#if errorMsg}
				<p class="font-medium text-red-700">{errorMsg}</p>
			{/if}
			<button
				disabled={loading}
				class={clsx(
					'mx-auto mt-5 rounded-xl px-10 py-2 font-bold text-white uppercase',
					loading ? 'cursor-not-allowed bg-green-500' : 'bg-green-700 hover:bg-green-300'
				)}
			>
				{loading ? 'Invio...' : 'Inviare'}
			</button>
		</form>
	{/if}
	<address class=" flex flex-col justify-start not-italic">
		<h2>OLENA NUDZHEVSKA</h2>
		<p>83100 Avellino</p>
		<a class=" max-w-fit hover:text-green-300" href="tel:+393516930878">+393516930878</a>
		<a class=" max-w-fit hover:text-green-300" href="mailto:info@on-smart.it">info@on-smart.it</a>
	</address>
</footer>

<style>
	.grid_container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		row-gap: 6rem;
	}
	@media (width >=768px) {
		.grid_container {
			grid-template-columns: repeat(auto-fit, minmax(40vw, 1fr));
		}
		.grid_container :nth-child(2) {
			grid-column: 2;
			justify-self: end;
		}
	}
</style>
