<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
    <div class="max-w-4xl mx-auto">
      <header class="flex justify-between items-center mb-8 border-b pb-4 border-slate-200">
        <div>
          <h1 class="text-2xl font-bold text-indigo-700">Yarn Meeting Catalyst</h1>
          <p class="text-slate-500 text-sm">Convert friction into focused agendas.</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Live Connection</span>
          <button @click="logout" class="text-slate-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main>
        <NuxtPage />
      </main>

      <footer class="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
        &copy; 2026 Yarn Team | Built by Kdog 👨‍💻✊
      </footer>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
