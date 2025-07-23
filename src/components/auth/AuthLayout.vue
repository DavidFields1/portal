<template>
  <div class="flex min-h-screen items-center justify-center bg-violet-200">
    <div class="mx-auto flex w-full max-w-4xl overflow-hidden
             rounded-2xl bg-white shadow-lg">
      <!-- Columna Izquierda: exacto padding y flex de tu original -->
      <div class="flex w-full flex-col justify-center px-8 py-12 md:w-1/2">
        <slot name="left" />
      </div>
      <!-- Columna Derecha: bg-muted + hidden en móvil -->
      <div class="hidden bg-muted md:flex md:w-1/2
               items-center justify-center">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
