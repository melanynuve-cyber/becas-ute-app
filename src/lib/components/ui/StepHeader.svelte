<script>
  export let num = '';
  export let title = '';
</script>

<div class="section-header">
  <span class="section-num">{num}.</span>
  <h2 class="section-title">{title}</h2>
</div>
<div class="divider-orange"></div>

<style>
  .section-header { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
  }
  .section-num { 
    font-size: 18px; 
    font-weight: 700; 
    color: var(--orange); 
  }
  .section-title { 
    font-size: 17px; 
    font-weight: 600; 
    color: var(--text-primary); 
  }
  .divider-orange { 
    height: 2px; 
    background: var(--orange); 
    border-radius: 2px; 
    opacity: 0.3; 
    margin-bottom: 16px; 
  }
</style>