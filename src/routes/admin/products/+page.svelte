<script lang="ts">
  import { invalidate, goto } from '$app/navigation';
  import Button from '$lib/layout/Button.svelte';
  import type { AdminProduct } from '$lib/types'; // Make sure this is correctly imported
  import { page } from '$app/state'; // To get current URL for pagination/filtering

  let { data } = $props();

  // Reactive states initialized from data prop
  let products = $state<AdminProduct[]>(data.products);
  let categories = $state<Array<{ id: string; name: string; slug: string }>>(data.categories);
  let currentPage = $state(data.currentPage);
  let totalPages = $state(data.totalPages);
  let totalProducts = $state(data.totalProducts);
  let searchTerm = $state(data.searchTerm);
  let selectedCategorySlug = $state(data.selectedCategorySlug);
  let sortBy = $state(data.sortBy);
  let sortOrder = $state(data.sortOrder);

  let showAddEditModal = $state(false);
  let currentProduct: AdminProduct | null = $state(null);
  let modalTitle = $derived(currentProduct ? 'Edit Product' : 'Add New Product');

  // Form states
  let formName = $state('');
  let formDescription = $state('');
  let formPrice = $state(0.00);
  let formImageUrl = $state('');
  let formStockQuantity = $state(0);
  let formCategoryId = $state('');

  // Update reactive states when data changes (e.g. from invalidation)
  $effect(() => {
    products = data.products;
    categories = data.categories;
    currentPage = data.currentPage;
    totalPages = data.totalPages;
    totalProducts = data.totalProducts;
    searchTerm = data.searchTerm;
    selectedCategorySlug = data.selectedCategorySlug;
    sortBy = data.sortBy;
    sortOrder = data.sortOrder;
  });

  function openAddModal() {
    currentProduct = null;
    formName = '';
    formDescription = '';
    formPrice = 0.00;
    formImageUrl = '';
    formStockQuantity = 0;
    formCategoryId = categories[0]?.id || '';
    showAddEditModal = true;
  }

  function openEditModal(product: AdminProduct) {
    currentProduct = product;
    formName = product.name;
    formDescription = product.description || '';
    formPrice = product.price;
    formImageUrl = product.imageUrl || '';
    formStockQuantity = product.stockQuantity;
    formCategoryId = product.categoryId;
    showAddEditModal = true;
  }

  function closeAddEditModal() {
    showAddEditModal = false;
  }

  async function handleSubmitProduct(event: Event) {
    event.preventDefault();
    const method = currentProduct ? 'PUT' : 'POST';
    const url = currentProduct ? `/api/products/${currentProduct.id}` : '/api/products';

    const productData = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice.toString()),
      imageUrl: formImageUrl,
      stockQuantity: formStockQuantity,
      categoryId: formCategoryId,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${currentProduct ? 'update' : 'create'} product.`);
      }

      alert(`Product ${currentProduct ? 'updated' : 'created'} successfully!`);
      closeAddEditModal();
      // Invalidate based on a broader pattern to ensure search/filter/sort context is maintained
      await invalidate((url) => url.pathname === '/api/products'); 
    } catch (error: any) {
      console.error('Error submitting product:', error);
      alert(`Error: ${error.message}`);
    }
  }

  async function handleDeleteProduct(productId: string, productName: string) {
    if (!confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product.');
      }

      alert(`Product "${productName}" deleted successfully.`);
      await invalidate((url) => url.pathname === '/api/products'); // Invalidate with pattern
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`Error: ${error.message}`);
    }
  }

  function applyFiltersAndSort(pageToLoad: number = 1) {
    const searchParams = new URLSearchParams(page.url.searchParams);
    searchParams.set('page', pageToLoad.toString());
    if (searchTerm) searchParams.set('search', searchTerm); else searchParams.delete('search');
    if (selectedCategorySlug) searchParams.set('categorySlug', selectedCategorySlug); else searchParams.delete('categorySlug');
    searchParams.set('sortBy', sortBy);
    searchParams.set('sortOrder', sortOrder);
    
    goto(`/admin/products?${searchParams.toString()}`);
  }

  function goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      applyFiltersAndSort(pageNumber);
    }
  }

  function handleSortChange(newSortBy: string) {
    if (sortBy === newSortBy) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
    } else {
      sortBy = newSortBy;
      sortOrder = 'asc'; // Default to asc when changing sort column
    }
    applyFiltersAndSort(); // Reset to page 1 on sort change
  }

  // Handle Enter key in search input
  function handleSearchKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      applyFiltersAndSort();
    }
  }

</script>

<div class="p-6 bg-white rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Manage Products ({totalProducts} total)</h1>
    <Button onClick={openAddModal}>Add New Product</Button>
  </div>

  <div class="mb-6 bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4 items-end">
    <div class="flex-1 min-w-[200px]">
      <label for="search" class="block text-sm font-medium text-gray-700">Search Products</label>
      <input
        type="text"
        id="search"
        bind:value={searchTerm}
        onkeydown={handleSearchKeyDown}
        placeholder="Name or description"
        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      />
    </div>
    <div class="flex-1 min-w-[150px]">
      <label for="categoryFilter" class="block text-sm font-medium text-gray-700">Filter by Category</label>
      <select id="categoryFilter" bind:value={selectedCategorySlug} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
        <option value="">All Categories</option>
        {#each categories as category}
          <option value={category.slug}>{category.name}</option>
        {/each}
      </select>
    </div>
    <div>
      <Button onClick={() => applyFiltersAndSort()}>Apply Filters</Button>
    </div>
    <div>
      <Button onClick={() => {
        searchTerm = '';
        selectedCategorySlug = '';
        sortBy = 'createdAt';
        sortOrder = 'desc';
        applyFiltersAndSort();
      }}>Reset Filters</Button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead>
        <tr class="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          <th class="py-3 px-4 border-b">ID</th>
          <th class="py-3 px-4 border-b cursor-pointer" onclick={() => handleSortChange('name')}>
            Name
            {#if sortBy === 'name'} {sortOrder === 'asc' ? '▲' : '▼'}{/if}
          </th>
          <th class="py-3 px-4 border-b cursor-pointer" onclick={() => handleSortChange('category')}>
            Category
            {#if sortBy === 'category'} {sortOrder === 'asc' ? '▲' : '▼'}{/if}
          </th>
          <th class="py-3 px-4 border-b cursor-pointer" onclick={() => handleSortChange('price')}>
            Price
            {#if sortBy === 'price'} {sortOrder === 'asc' ? '▲' : '▼'}{/if}
          </th>
          <th class="py-3 px-4 border-b cursor-pointer" onclick={() => handleSortChange('stockQuantity')}>
            Stock
            {#if sortBy === 'stockQuantity'} {sortOrder === 'asc' ? '▲' : '▼'}{/if}
          </th>
          <th class="py-3 px-4 border-b">Image</th>
          <th class="py-3 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if products.length === 0}
          <tr>
            <td colspan="7" class="py-4 text-center text-gray-500">No products found matching your criteria.</td>
          </tr>
        {:else}
          {#each products as product (product.id)}
            <tr class="hover:bg-gray-50 border-b last:border-b-0">
              <td class="py-3 px-4 text-sm text-gray-800 truncate" title={product.id}>{product.id.slice(0, 8)}...</td>
              <td class="py-3 px-4 text-sm text-gray-800 font-medium">{product.name}</td>
              <td class="py-3 px-4 text-sm text-gray-700">{product.category.name}</td>
              <td class="py-3 px-4 text-sm text-gray-800">${Number(product.price).toFixed(2)}</td>
              <td class="py-3 px-4 text-sm text-gray-800">{product.stockQuantity}</td>
              <td class="py-3 px-4">
                {#if product.imageUrl}
                  <img src={product.imageUrl} alt={product.name} class="w-10 h-10 object-cover rounded-md" />
                {:else}
                  <span class="text-gray-400">N/A</span>
                {/if}
              </td>
              <td class="py-3 px-4 space-x-2 flex">
                <Button onClick={() => openEditModal(product)}>Edit</Button>
                <Button onClick={() => handleDeleteProduct(product.id, product.name)}>Delete</Button>
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

{#if showAddEditModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">{modalTitle}</h2>
      <form onsubmit={handleSubmitProduct} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" id="name" bind:value={formName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" bind:value={formDescription} rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" step="0.01" id="price" bind:value={formPrice} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required min="0">
        </div>
        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
          <input type="url" id="imageUrl" bind:value={formImageUrl} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
        </div>
        <div>
          <label for="stockQuantity" class="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input type="number" id="stockQuantity" bind:value={formStockQuantity} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required min="0" step="1">
        </div>
        <div>
          <label for="categoryId" class="block text-sm font-medium text-gray-700">Category</label>
          <select id="categoryId" bind:value={formCategoryId} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            {#if categories.length === 0}
                <option value="" disabled>No categories available</option>
            {/if}
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <Button type="button" onClick={closeAddEditModal}>Cancel</Button>
          <Button type="submit" >{currentProduct ? 'Update Product' : 'Add Product'}</Button>
        </div>
      </form>
    </div>
  </div>
{/if}