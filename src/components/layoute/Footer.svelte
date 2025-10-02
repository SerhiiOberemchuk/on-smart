<script lang="ts">
	import clsx from 'clsx';
	import { sendEmail } from '../../routes/email.remote';
	import Logo from '../common/Logo.svelte';

	let showMessage = $state<boolean>();
	$effect(() => {
		showMessage = sendEmail.result?.status;
	});
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
		<form {...sendEmail} class=" flex flex-col gap-2">
			<input
				required
				type="text"
				name="name"
				placeholder="nome*"
				class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
			/>
			<input
				required
				type="email"
				name="email"
				id="email_id"
				placeholder="e-mail*"
				class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
			/>
			<textarea
				required
				name="text"
				id="messagio_id"
				placeholder="Messagio*"
				class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
			></textarea>
			<button
				disabled={sendEmail.pending ? true : false}
				class={clsx(
					'mx-auto rounded-xl px-10 py-2 font-bold text-white uppercase',
					sendEmail.pending ? 'bg-green-300' : 'bg-green-700'
				)}
				>{#if sendEmail.pending}
					<span class="">...load</span>
				{:else}
					<span>Inviare</span>
				{/if}</button
			>
		</form>
	{/if}
</footer>

<style>
	.grid_container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
</style>
