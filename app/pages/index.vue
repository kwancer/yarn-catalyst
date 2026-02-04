<template>
  <div class="space-y-8">
    <!-- Active Meeting / Dashboard -->
    <div v-if="!activeMeeting" class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </div>
      <h2 class="text-xl font-semibold mb-2">No Active Meeting</h2>
      <p class="text-slate-500 mb-6">Start a new session to gather team insights and build today's agenda.</p>
      <button @click="startMeeting" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95">
        Start Meeting Catalyst
      </button>
    </div>

    <!-- Meeting Flow -->
    <div v-else class="space-y-6">
      <!-- Meeting Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">{{ activeMeeting.title }}</h2>
        <div class="flex items-center gap-2">
          <span class="text-xs uppercase tracking-wider font-bold" :class="statusColor">
            {{ activeMeeting.status }}
          </span>
        </div>
      </div>

      <!-- Phase 1: Brainstorming -->
      <section v-if="activeMeeting.status === 'brainstorming'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Phase 1: Team Brain Dump
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">What's worrying you?</label>
            <textarea v-model="response.worrying" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" rows="2" placeholder="e.g. Frontend CI failure, demo deadlines..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">What's going well?</label>
            <textarea v-model="response.going_well" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" rows="2" placeholder="e.g. Symptom logic is robust, user test went well..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">What could we do better?</label>
            <textarea v-model="response.could_do_better" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" rows="2" placeholder="e.g. More clear sub-tasks, faster reviews..."></textarea>
          </div>
          <button @click="submitResponse" class="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors shadow-lg active:scale-[0.98]">
            Submit My Thoughts
          </button>
        </div>
      </section>

      <!-- Phase 2: Voting -->
      <section v-if="activeMeeting.status === 'voting'" class="space-y-4">
        <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
          <p class="text-sm text-indigo-700 font-medium">The AI has analyzed everyone's inputs. Vote for the items we MUST discuss today.</p>
        </div>
        <div class="grid gap-4">
          <div v-for="item in agendaItems" :key="item.id" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4">
            <div class="flex-1">
              <h4 class="font-bold text-slate-800">{{ item.theme }}</h4>
              <p class="text-sm text-slate-500 mt-1">{{ item.description }}</p>
              <ul class="mt-3 space-y-1">
                <li v-for="point in item.action_points" :key="point" class="text-xs text-slate-600 flex items-center gap-2 italic">
                  <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                  {{ point }}
                </li>
              </ul>
            </div>
            <button @click="vote(item.id)" class="flex flex-col items-center justify-center w-12 h-12 rounded-lg border-2 transition-all" :class="item.hasVoted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              <span class="text-xs font-black">{{ item.votes }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Lead Controls -->
      <div v-if="isLead" class="pt-6 flex justify-center border-t border-slate-100">
        <button v-if="activeMeeting.status === 'brainstorming'" @click="transitionToVoting" class="text-indigo-600 font-bold flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-lg">
          Transition to Voting
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button v-if="activeMeeting.status === 'voting'" @click="transitionToActive" class="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
          Generate Final Agenda
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Mock data for initial scaffold
const activeMeeting = ref(null)
const response = reactive({
  worrying: '',
  going_well: '',
  could_do_better: ''
})
const agendaItems = ref([])
const isLead = ref(true)

const statusColor = computed(() => {
  if (!activeMeeting.value) return ''
  switch (activeMeeting.value.status) {
    case 'brainstorming': return 'text-orange-500'
    case 'voting': return 'text-indigo-500'
    case 'active': return 'text-green-500'
    default: return 'text-slate-500'
  }
})

const startMeeting = () => {
  activeMeeting.value = {
    id: 1,
    title: `Yarn Team Sync - ${new Date().toLocaleDateString()}`,
    status: 'brainstorming'
  }
}

const submitResponse = () => {
  console.log('Submitted:', response)
  alert('Thoughts submitted! Waiting for the rest of the team.')
}

const transitionToVoting = () => {
  activeMeeting.value.status = 'voting'
  // Mock items after AI extraction
  agendaItems.value = [
    { id: 1, theme: 'Frontend Dependencies', description: 'Address the recent CI failures on feature branches.', action_points: ['Review Anne\'s test branch', 'Update config.ts'], votes: 3, hasVoted: false },
    { id: 2, theme: 'Demo Readiness', description: 'Ensure the symptom tracker flow is smooth for the portal.', action_points: ['Mock patient data', 'Verify auth redirects'], votes: 1, hasVoted: false }
  ]
}

const vote = (id) => {
  const item = agendaItems.value.find(i => i.id === id)
  if (item.hasVoted) {
    item.votes--
    item.hasVoted = false
  } else {
    item.votes++
    item.hasVoted = true
  }
}
</script>
