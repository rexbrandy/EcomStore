<script lang="ts">
  import '../app.css'; // Your global CSS
  import Nav from '$lib/layout/Nav.svelte'; // Assuming your Nav component is here

  // `data` here contains { user: ... } from +layout.server.ts
  let { data, children } = $props(); 

</script>

<Nav user={data.user} cartItems={data.cartItems} /> 

<div class="mx-auto max-w-7xl py-6">
  {@render children()} 
</div>