<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { Category } from '@prisma/client';

  let { data } = $props();

  let categories = $state<Category[]>(data.categories);

  let showAddEditModal = $state(false);
  let currentCategory: Category | null = $state(null);
  let modalTitle = $derived(currentCategory ? 'Edit Category' : 'Add New Category');

  let formName = $state('');
  let formDescription = $state('');

  $effect(() => {
    categories = data.categories;
  });

  function openAddModal() {
    currentCategory = null;
    formName = '';
    formDescription = '';
    showAddEditModal = true;
  }

  function openEditModal(category: Category) {
    currentCategory = category;
    formName = category.name;
    formDescription = category.description || '';
    showAddEditModal = true;
  }

  function closeAddEditModal() {
    showAddEditModal = false;
  }

  async function handleSubmitCategory(event: Event) {
    event.preventDefault();
    const method = currentCategory ? 'PUT' : 'POST'; // Update || Create
    const url = currentCategory ? `/api/categories/id/${currentCategory.id}` : '/api/categories';

    const categoryData = {
      name: formName,
      description: formDescription,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${currentCategory ? 'update' : 'create'} category.`);
      }

      alert(`Category ${currentCategory ? 'updated' : 'created'} successfully!`);
      closeAddEditModal();
      await invalidateAll();
    } catch (error: any) {
      console.error('Error submitting category:', error);
      alert(`Error: ${error.message}`);
    }
  }

  async function handleDeleteCategory(categoryId: string, categoryName: string) {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/id/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category.');
      }

      alert(`Category "${categoryName}" deleted successfully.`);
      await invalidateAll();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(`Error: ${error.message}`);
    }
  }
</script>

<div class="p-6 bg-white rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Manage Categories</h1>
    <Button style="submit" onClick={openAddModal}>Add New Category</Button>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead>
        <tr class="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          <th class="py-3 px-4 border-b">ID</th>
          <th class="py-3 px-4 border-b">Name</th>
          <th class="py-3 px-4 border-b">Slug</th>
          <th class="py-3 px-4 border-b">Description</th>
          <th class="py-3 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if categories.length === 0}
          <tr>
            <td colspan="5" class="py-4 text-center text-gray-500">No categories found.</td>
          </tr>
        {:else}
          {#each categories as category (category.id)}
            <tr class="hover:bg-gray-50 border-b last:border-b-0">
              <td class="py-3 px-4 text-sm text-gray-800 truncate" title={category.id}>{category.id.slice(0, 8)}...</td>
              <td class="py-3 px-4 text-sm text-gray-800 font-medium">{category.name}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{category.slug}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{category.description || 'N/A'}</td>
              <td class="py-3 px-4 space-x-2 flex">
                <Button style="submit" onClick={() => openEditModal(category)}>Edit</Button>
                <Button style="secondary" onClick={() => handleDeleteCategory(category.id, category.name)}>Delete</Button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

{#if showAddEditModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">{modalTitle}</h2>
      <form onsubmit={handleSubmitCategory} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Category Name</label>
          <input type="text" id="name" bind:value={formName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea id="description" bind:value={formDescription} rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <Button style="secondary" type="button" onClick={closeAddEditModal}>Cancel</Button>
          <Button style="submit" type="submit" >{currentCategory ? 'Update Category' : 'Add Category'}</Button>
        </div>
      </form>
    </div>
  </div>
{/if}