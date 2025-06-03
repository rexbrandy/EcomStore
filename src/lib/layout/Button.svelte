<script lang="ts">
	import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { twClassMerge } from '$lib/common';

  const {
    class: className = '',
    style = 'default',
    type = 'button',
    onClick,
    disabled = false,
    children
  }: {
    class?: string;
    style?: 'default' | 'submit' | 'warning' | 'error';
    type?: HTMLButtonAttributes['type'];
    onClick?: () => void;
    disabled?: boolean;
    children: Snippet;
  } = $props();

  const baseClasses =
    'font-medium rounded-lg text-sm px-3 py-2.5 text-center focus:outline-none focus:ring-4 transition-colors duration-150 ease-in-out';

  const styleClasses = $derived.by(() => {
    switch (style) {
      case 'submit':
        return 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800';
      case 'warning':
        return 'text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 dark:focus:ring-yellow-900';
      case 'error':
        return 'text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900';
      case 'default':
      default:
        return 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';
    }
  });

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const finalClasses = $derived(
    twClassMerge(`${baseClasses} ${styleClasses} ${disabled ? disabledClasses : ''} ${className}`.trim())
  );

</script>

<button
  {type}
  class={finalClasses}
  onclick={onClick}
  {disabled}
>
  {@render children()}
</button>
