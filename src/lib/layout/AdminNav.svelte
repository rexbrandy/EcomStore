<script lang="ts">
  import { goto } from '$app/navigation';

  let { user, currentPath } = $props();

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125h18m-18 0a2.25 2.25 0 0 0 0 4.5h18a2.25 2.25 0 0 0 0-4.5m-18 0V6.75c0-1.036.84-1.875 1.875-1.875h14.25c1.035 0 1.875.84 1.875 1.875v6.375m-18 0h.008v.008H3v-.008Zm0 3.75h.008v.008H3v-.008Zm0 3.75h.008v.008H3v-.008Zm3.75-3.75h.008v.008H6.75v-.008Zm0 3.75h.008v.008H6.75v-.008Zm0 3.75h.008v.008H6.75v-.008Z" /></svg>' },
    { name: 'Products', href: '/admin/products', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0h.008v.008H21V5.25ZM9 12.75h.008v.008H9v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.5-4.5h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>' },
    { name: 'Categories', href: '/admin/categories', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 0a3.75 3.75 0 1 1 0-7.5h16.5a3.75 3.75 0 1 1 0 7.5m-16.5 0a3.75 3.75 0 1 0 0 7.5h16.5a3.75 3.75 0 1 0 0-7.5" /></svg>' },
    { name: 'Orders', href: '/admin/orders', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.264 1.263c.27.27.27.708 0 .978l-.39 1.18a3 3 0 0 1-1.638 1.834L18 19.75c-1.396 0-2.5-1.104-2.5-2.5V14.25a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v3.5c0 1.396-1.104 2.5-2.5 2.5L5 21a2.25 2.25 0 0 1-2.25-2.25V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v4.5" /></svg>' },
    { name: 'Users', href: '/admin/users', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>' }
  ];

  function handleLogout() {
    fetch('/auth/logout', { method: 'POST' })
      .then(() => {
        goto('/auth/login');
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  }
</script>

<aside class="w-64 bg-gray-800 text-gray-100 flex flex-col md:flex">
  <div class="px-6 py-4 border-b border-gray-700">
    <h1 class="text-2xl font-bold text-white">Admin Panel</h1>
  </div>
  <nav class="flex-1 px-6 py-4 space-y-2">
    {#each adminLinks as link}
      <a
        href={link.href}
        class="flex items-center space-x-3 px-4 py-2 rounded-md transition duration-200
          {currentPath === link.href ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 hover:text-white'}"
      >
        {@html link.icon}
        <span>{link.name}</span>
      </a>
    {/each}
  </nav>
  <div class="px-6 py-4 border-t border-gray-700">
    <p class="text-sm">Logged in as {user?.name} (Admin)</p>
    <button onclick={handleLogout} class="mt-2 text-sm text-red-400 hover:underline">
      Logout
    </button>
  </div>
</aside>