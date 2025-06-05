<script lang="ts">
  let { data } = $props(); // 'data' will contain { user: ... } from +layout.server.ts

</script>

<div class="p-6 bg-white rounded-lg shadow-md">
  <h1 class="text-3xl font-bold mb-4">Admin Dashboard</h1>
  <p class="text-gray-700">Welcome, {data.user?.name}!</p>
  <p class="mt-4 text-gray-600">This is your central hub for managing the Ecom Store.</p>

  <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="bg-indigo-100 p-4 rounded-lg shadow">
      <h3 class="font-semibold text-lg text-indigo-800">Total Products</h3>
      <p class="text-3xl font-bold text-indigo-700">120</p>
    </div>
    <div class="bg-green-100 p-4 rounded-lg shadow">
      <h3 class="font-semibold text-lg text-green-800">Pending Orders</h3>
      <p class="text-3xl font-bold text-green-700">5</p>
    </div>
    <div class="bg-yellow-100 p-4 rounded-lg shadow">
      <h3 class="font-semibold text-lg text-yellow-800">New Users (Last 7 Days)</h3>
      <p class="text-3xl font-bold text-yellow-700">15</p>
    </div>
  </div>
</div>