<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { AdminUser, AdminUserDetail } from '$lib/types';
  import { page } from '$app/state';
	import { formatDate } from '$lib/common.js';

  let { data } = $props();

  let users = $state<AdminUser[]>(data.users);
  let currentPage = $state(data.currentPage);
  let totalPages = $state(data.totalPages);
  let totalUsers = $state(data.totalUsers);
  let searchTerm = $state(data.searchTerm);

  let showUserDetailModal = $state(false);
  let currentUserDetail: AdminUserDetail | null = $state(null);
  let isUpdatingUser = $state(false);

  let formName = $state('');
  let formEmail = $state('');
  let formIsAdmin = $state(false);

  $effect(() => {
    users = data.users;
    currentPage = data.currentPage;
    totalPages = data.totalPages;
    totalUsers = data.totalUsers;
    searchTerm = data.searchTerm;
  });

  function applyFiltersAndPagination(pageToLoad: number = 1) {
    const searchParams = new URLSearchParams(page.url.searchParams);
    searchParams.set('page', pageToLoad.toString());
    if (searchTerm) searchParams.set('search', searchTerm); else searchParams.delete('search');
    
    goto(`/admin/users?${searchParams.toString()}`);
  }

  function goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      applyFiltersAndPagination(pageNumber);
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      applyFiltersAndPagination();
    }
  }

  async function openUserDetailModal(userId: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user details.');
      }
      currentUserDetail = await response.json();

      formName = currentUserDetail?.name || '';
      formEmail = currentUserDetail?.email || '';
      formIsAdmin = currentUserDetail?.isAdmin || false;

      showUserDetailModal = true;
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      alert(`Error: ${error.message}`);
    }
  }

  function closeUserDetailModal() {
    showUserDetailModal = false;
    currentUserDetail = null;
  }

  async function handleSubmitUserUpdate(event: Event) {
    event.preventDefault();
    if (!currentUserDetail || isUpdatingUser) return;

    isUpdatingUser = true;
    try {
      const response = await fetch(`/api/admin/users/${currentUserDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          isAdmin: formIsAdmin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user.');
      }

      alert('User updated successfully!');
      closeUserDetailModal();
      await invalidateAll(); 
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(`Error: ${error.message}`);
    } finally {
      isUpdatingUser = false;
    }
  }

</script>

<div class="p-6 bg-white rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Manage Users ({totalUsers} total)</h1>
    </div>

  <div class="mb-6 bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4 items-end">
    <div class="flex-1 min-w-[200px]">
      <label for="search" class="block text-sm font-medium text-gray-700">Search Users</label>
      <input
        type="text"
        id="search"
        bind:value={searchTerm}
        onkeydown={handleSearchKeyDown}
        placeholder="Email or Name"
        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      />
    </div>
    <div>
      <Button style="submit" onClick={() => applyFiltersAndPagination()}>Apply Filters</Button>
    </div>
    <div>
      <Button style="secondary" onClick={() => {
        searchTerm = '';
        applyFiltersAndPagination();
      }}>Reset Filters</Button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead>
        <tr class="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          <th class="py-3 px-4 border-b">ID</th>
          <th class="py-3 px-4 border-b">Name</th>
          <th class="py-3 px-4 border-b">Email</th>
          <th class="py-3 px-4 border-b">Admin</th>
          <th class="py-3 px-4 border-b">Orders</th>
          <th class="py-3 px-4 border-b">Sessions</th>
          <th class="py-3 px-4 border-b">Joined</th>
          <th class="py-3 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if users.length === 0}
          <tr>
            <td colspan="8" class="py-4 text-center text-gray-500">No users found matching your criteria.</td>
          </tr>
        {:else}
          {#each users as user (user.id)}
            <tr class="hover:bg-gray-50 border-b last:border-b-0">
              <td class="py-3 px-4 text-sm text-gray-800 truncate" title={user.id}>{user.id.slice(0, 8)}...</td>
              <td class="py-3 px-4 text-sm text-gray-800 font-medium">{user.name || 'N/A'}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{user.email}</td>
              <td class="py-3 px-4 text-sm">
                {#if user.isAdmin}
                  <span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Yes</span>
                {:else}
                  <span class="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">No</span>
                {/if}
              </td>
              <td class="py-3 px-4 text-sm text-gray-700">{user._count.orders}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{user._count.sessions}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td class="py-3 px-4 space-x-2 flex">
                <Button style="submit" onClick={() => openUserDetailModal(user.id)}>View/Edit</Button>
                </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="mt-6 flex justify-between items-center">
      <Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
      <span class="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
      <Button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
    </div>
  {/if}
</div>

{#if showUserDetailModal && currentUserDetail}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">User Details: {currentUserDetail.name || currentUserDetail.email}</h2>
      <form onsubmit={handleSubmitUserUpdate} class="space-y-4">
        <div class="w-1/2">
          <div>
            <label for="userName" class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="userName" bind:value={formName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          </div>
          <div>
            <label for="userEmail" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="userEmail" disabled={true} bind:value={formEmail} class="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm p-2" required>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="isAdmin" bind:checked={formIsAdmin} class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
            <label for="isAdmin" class="ml-2 block text-sm text-gray-900">Is Admin</label>  
          </div>
        </div>

        <h3 class="text-xl font-semibold mt-6 mb-3">Recent Orders</h3>
        {#if currentUserDetail.orders && currentUserDetail.orders.length > 0}
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            {#each currentUserDetail.orders as order}
              <li>Order ID: {order.id.slice(-8)}, Total: ${Number(order.totalAmount).toFixed(2)}, Status: {order.status}</li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-600 text-sm">No recent orders.</p>
        {/if}

        <h3 class="text-xl font-semibold mt-6 mb-3">Recent Sessions</h3>
        {#if currentUserDetail.sessions && currentUserDetail.sessions.length > 0}
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            {#each currentUserDetail.sessions as session}
              <li>Session ID: {session.id.slice(-8)}, Created: {formatDate(session.createdAt.toString())}, Expires: {formatDate(session.expiresAt.toString())}</li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-600 text-sm">No recent sessions.</p>
        {/if}


        <div class="flex justify-end space-x-3 mt-6">
          <Button style="secondary" type="button" onClick={closeUserDetailModal} disabled={isUpdatingUser}>Cancel</Button>
          <Button style="submit" type="submit" disabled={isUpdatingUser}>
            {#if isUpdatingUser}
              Saving...
            {:else}
              Save Changes
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}