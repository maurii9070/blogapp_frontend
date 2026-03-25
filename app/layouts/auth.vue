<template>
  <div class="min-h-screen flex flex-col bg-linear-to-b from-elevated/70 via-default to-default">
    <BlogHeader />

    <main class="flex-1">
      <UContainer class="py-10 sm:py-16">
        <slot />
      </UContainer>
    </main>

    <BlogFooter />
  </div>
</template>
