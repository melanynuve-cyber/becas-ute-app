<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin } from '../../../lib/stores/auth.js'
  onMount(() => {
    if (!get(isAuthenticated)) { navigate('/login', { replace: true }); return }
    if (!get(isAdmin)) navigate('/dashboard', { replace: true })
  })
</script>
<p style="padding: 80px 24px; text-align:center; font-family: var(--font)">Panel admin — próximamente</p>
