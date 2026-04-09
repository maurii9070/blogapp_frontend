<template>
  <div class="min-h-screen flex flex-col bg-linear-to-b from-elevated/40 via-default to-default text-toned transition-colors">
    <!-- Header -->
    <BlogHeader />

    <!-- Main Content with Sidebar -->
    <main class="flex-1">
      <UContainer class="py-8 md:py-10 lg:py-12">
        <div class="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <!-- Main Content Area -->
          <div class="flex-1 min-w-0">
            <slot />
          </div>

          <!-- Sidebar -->
          <aside class="w-full shrink-0 lg:w-80">
            <RecentPostsSidebar />
          </aside>
        </div>
      </UContainer>
    </main>

    <!-- Footer -->
    <BlogFooter />
  </div>
</template>
