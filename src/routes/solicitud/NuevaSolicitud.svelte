<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated } from '../../lib/stores/auth.js'
  onMount(() => { if (!get(isAuthenticated)) navigate('/login', { replace: true }) })
</script>
<p style="padding: 80px 24px; text-align:center; font-family: var(--font)">Formulario de nueva solicitud — próximamente</p>
