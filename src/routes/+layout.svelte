<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import type { Config } from '@sveltejs/adapter-vercel';
	import Header from '$lib/components/layoute/Header.svelte';
	import Footer from '$lib/components/layoute/Footer.svelte';
	export const config: Config = {
		runtime: 'nodejs22.x'
	};
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />
<main>
	{@render children?.()}
</main>
<Footer />
