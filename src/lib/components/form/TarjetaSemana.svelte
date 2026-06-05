<script>
  // src/lib/components/form/TarjetaSemana.svelte
  // Tarjeta de semana para ReportesDual — extraída como componente reutilizable
  import { formatFecha, estadoBadgeClass } from '../../utils.js'

  export let reporte = {}
  export let empresaNombre = ''
</script>

<div class="tarjeta">
  <div class="tarjeta-icono icono-activo">
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016 4.5h4.5m9.75 9.75v-4.5m0 4.5h-4.5m4.5 0l-9-9M15 3h6m0 0v6m0-6L9.75 14.25" />
    </svg>
  </div>
  <div class="tarjeta-info">
    <div class="tarjeta-titulo">Reporte dual — Semana {reporte.semana}</div>
    <div class="tarjeta-sub">
      Enviado el {formatFecha(reporte.created_at)}{empresaNombre ? ` · ${empresaNombre}` : ''}
    </div>
  </div>
  {#if reporte.nota_agente}
    <div class="tarjeta-feedback">
      <span class="nota-truncada"><strong>Nota:</strong> {reporte.nota_agente}</span>
      <div class="tooltip-box">{reporte.nota_agente}</div>
    </div>
  {/if}
  <span class={estadoBadgeClass(reporte.estado)}>{reporte.estado}</span>
</div>

<style>
  .tarjeta { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: var(--bg-card); border-bottom: 1px solid var(--border); position: relative; }
  .tarjeta:last-child { border-bottom: none; }
  .tarjeta-icono { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .icono-activo { background: rgba(249, 115, 22, 0.1); color: var(--orange); }
  .tarjeta-info { flex: 1; min-width: 0; }
  .tarjeta-titulo { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .tarjeta-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
  .tarjeta-feedback { position: absolute; left: 50%; transform: translateX(-50%); font-size: 12px; color: var(--text-secondary); background: var(--bg-page); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tarjeta-feedback strong { color: var(--text-primary); font-weight: 600; }
  .nota-truncada { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
  @media (max-width: 768px) {
    .tarjeta-feedback { position: static; transform: none; margin-left: auto; }
  }
</style>
