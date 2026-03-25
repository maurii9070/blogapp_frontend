<script setup lang="ts">
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="linear-gradient(to right, rgb(var(--ui-primary)) 0%, rgb(var(--ui-info)) 100%)"
      :height="3"
      :duration="1500"
      :throttle="80"
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
