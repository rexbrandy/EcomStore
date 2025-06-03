<script lang="ts">
	import '../app.css';
  import Nav from '$lib/layout/Nav.svelte';

	let { children } = $props();
</script>

<Nav />
<div class="mx-auto max-w-7xl py-6">
  {@render children()}
</div>
