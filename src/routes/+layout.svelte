<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '../components/layoute/Header.svelte';
	import Footer from '../components/layoute/Footer.svelte';
	import type { Config } from '@sveltejs/adapter-vercel';
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
