<template>
  <div class="space-y-8">
    <!-- Active Meeting / Dashboard -->
    <div v-if="!activeMeeting" class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </div>
      <h2 class="text-xl font-semibold mb-2">Ready for a Team Sync?</h2>
      <p class="text-slate-500 mb-6">Initialize a new session to distill today's priorities.</p>
      <button @click="startMeeting" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95">
        Initialize Catalyst
      </button>
    </div>

    <!-- Meeting Flow -->
    <div v-else class="space-y-6">
      <!-- Meeting Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">{{ activeMeeting.title }}</h2>
          <p class="text-xs text-slate-400">ID: {{ activeMeeting.id }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-slate-100" :class="statusColor">
            {{ activeMeeting.status }}
          </span>
        </div>
      </div>

      <!-- Phase 1: Brainstorming -->
      <section v-if="activeMeeting.status === 'brainstorming'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Step 1: Individual Reflection
        </h3>
        <div class="space-y-4">
          <div v-if="hasSubmitted">
            <div class="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <p class="text-sm text-green-700 font-medium">Your thoughts are in. Waiting for the rest of the team to finish.</p>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">What's worrying you?</label>
              <textarea v-model="form.worrying" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" rows="2" placeholder="e.g. CI failures, technical debt..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">What's going well?</label>
              <textarea v-model="form.going_well" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" rows="2" placeholder="e.g. Robust model logic, good sprint velocity..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">What could we do better?</label>
              <textarea v-model="form.could_do_better" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" rows="2" placeholder="e.g. Better documentation, more frequent syncs..."></textarea>
            </div>
            <button @click="submitResponse" :disabled="isSubmitting" class="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors shadow-lg active:scale-[0.98] disabled:opacity-50">
              {{ isSubmitting ? 'Syncing...' : 'Submit to Catalyst' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Phase 2: Voting -->
      <section v-if="activeMeeting.status === 'voting'" class="space-y-4">
        <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
          <p class="text-sm text-indigo-700 font-medium italic">Gemini has synthesized team input into these core themes. Vote on what we tackle today.</p>
        </div>
        <div class="grid gap-4">
          <div v-for="item in agendaItems" :key="item.id" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4 hover:border-indigo-200 transition-colors">
            <div class="flex-1">
              <h4 class="font-bold text-slate-800">{{ item.theme }}</h4>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">{{ item.description }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span v-for="point in item.action_points" :key="point" class="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200">
                  {{ point }}
                </span>
              </div>
            </div>
            <button @click="castVote(item)" class="flex flex-col items-center justify-center w-12 h-14 rounded-xl border-2 transition-all" :class="userVotes.includes(item.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-300 hover:border-indigo-100 hover:text-indigo-400'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              <span class="text-sm font-black">{{ item.votes }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Phase 3: Active Agenda -->
      <section v-if="activeMeeting.status === 'active'" class="space-y-4">
        <div v-if="activeMeeting.meeting_summary" class="bg-indigo-600 p-6 rounded-xl shadow-lg border border-indigo-500 mb-8 transform -rotate-1">
          <h3 class="text-white/80 uppercase text-[10px] font-black tracking-widest mb-1">Today's Focus</h3>
          <p class="text-white text-lg font-medium italic leading-relaxed">
            "{{ activeMeeting.meeting_summary }}"
          </p>
        </div>
        <div v-else class="bg-green-600 p-4 rounded-xl shadow-inner mb-6">
          <p class="text-white text-sm font-bold text-center">Focus Mode Engaged</p>
        </div>
        <div class="grid gap-4">
          <div v-for="item in sortedAgenda" :key="item.id" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" :class="item.is_completed ? 'opacity-50 grayscale' : ''">
            <div class="p-5 flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">
                {{ item.votes }}
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-800 flex items-center gap-2">
                  {{ item.theme }}
                  <span v-if="item.is_completed" class="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase">Complete</span>
                </h4>
                <p class="text-sm text-slate-500 mt-1">{{ item.description }}</p>
              </div>
              <button @click="toggleComplete(item)" class="text-slate-300 hover:text-green-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
              </button>
            </div>
            <div class="bg-slate-50 px-5 py-3 border-t border-slate-100">
               <ul class="space-y-2">
                <li v-for="point in item.action_points" :key="point" class="text-sm text-slate-600 flex items-center gap-3">
                  <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                  {{ point }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Admin Controls -->
      <div v-if="isAdmin" class="pt-10 flex justify-center border-t border-slate-100">
        <button v-if="activeMeeting.status === 'brainstorming'" @click="analyzeAndTransition" :disabled="isAnalyzing" class="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          {{ isAnalyzing ? 'Distilling with Gemini...' : 'Analyze & Start Voting' }}
        </button>
        <button v-if="activeMeeting.status === 'voting'" @click="finalizeAgenda" class="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
          Finalize Live Agenda
        </button>
        <button v-if="activeMeeting.status === 'active'" @click="closeMeeting" class="text-red-500 font-bold hover:bg-red-50 px-6 py-2 rounded-lg transition-colors">
          End Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

interface Meeting {
  id: string
  title: string
  status: 'brainstorming' | 'voting' | 'active' | 'finished'
  created_at: string
  meeting_summary?: string
}

interface AgendaItem {
  id: string
  theme: string
  description: string
  votes: number
  action_points: string[]
  is_completed: boolean
}

const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()

// State
const activeMeeting = ref<Meeting | null>(null)
const agendaItems = ref<AgendaItem[]>([])
const hasSubmitted = ref(false)
const isSubmitting = ref(false)
const isAnalyzing = ref(false)
const userVotes = ref<string[]>([]) // Track items this user voted for in local session

const form = reactive({
  worrying: '',
  going_well: '',
  could_do_better: ''
})

// Fix for voting UI not appearing: Watch status and fetch items
watch(() => activeMeeting.value?.status, async (newStatus) => {
  if (newStatus === 'voting' || newStatus === 'active') {
    await fetchAgendaItems()
  }
})

// Auth Guard
onMounted(async () => {
  if (!user.value) {
    return navigateTo('/login')
  }
  await fetchActiveMeeting()
  setupSubscriptions()
})

const isAdmin = computed(() => {
  if (!user.value) return false
  const adminEmails = ['kwancer@gmail.com', 'krzysztofwancerski@gmail.com', 'josh.reynolds@yarn.health']
  return adminEmails.includes(user.value.email || '')
})

const statusColor = computed(() => {
  if (!activeMeeting.value) return ''
  switch (activeMeeting.value.status) {
    case 'brainstorming': return 'text-orange-500'
    case 'voting': return 'text-indigo-500'
    case 'active': return 'text-green-600'
    default: return 'text-slate-500'
  }
})

const sortedAgenda = computed(() => {
  return [...agendaItems.value].sort((a, b) => b.votes - a.votes)
})

// Logic
const fetchActiveMeeting = async () => {
  const { data: meetings } = await supabase
    .from('catalyst_meetings')
    .select('*')
    .neq('status', 'finished')
    .order('created_at', { ascending: false })
    .limit(1)

  if (meetings?.length) {
    activeMeeting.value = meetings[0]
    await fetchAgendaItems()
    
    // Check if user already submitted for this meeting
    const { data: resp } = await supabase
      .from('catalyst_responses')
      .select('id')
      .eq('meeting_id', activeMeeting.value!.id)
    .eq('user_id', user.value!.id)
      .single()
    
    if (resp) hasSubmitted.value = true
  }
}

const fetchAgendaItems = async () => {
  if (!activeMeeting.value) return
  const { data } = await supabase
    .from('catalyst_agenda_items')
    .select('*')
    .eq('meeting_id', activeMeeting.value.id)
  
  agendaItems.value = data || []
}

const startMeeting = async () => {
  const { data, error } = await supabase
    .from('catalyst_meetings')
    .insert({
      title: `Team Sync: ${new Date().toLocaleDateString('en-GB')}`,
      created_by: user.value!.id,
      status: 'brainstorming' // Explicit status since DB default might not be inferred
    })
    .select()
    .single()
  
  if (data) activeMeeting.value = data
}

const submitResponse = async () => {
  if (!activeMeeting.value) return
  isSubmitting.value = true
  
  const { error } = await supabase
    .from('catalyst_responses')
    .insert({
      meeting_id: activeMeeting.value!.id,
      user_id: user.value!.id,
      ...form
    })
  
  if (!error) {
    hasSubmitted.value = true
  }
  isSubmitting.value = false
}

const analyzeAndTransition = async () => {
  if (!activeMeeting.value) return
  isAnalyzing.value = true
  
  // 1. Fetch all responses
  const { data: responses } = await supabase
    .from('catalyst_responses')
    .select('*')
    .eq('meeting_id', activeMeeting.value.id)
  
  // 2. Call Gemini
  try {
    const response = await $fetch<{ agendaItems: any[] }>('/api/catalyst/analyze', {
      method: 'POST',
      body: { meeting_id: activeMeeting.value!.id, responses }
    })
    const extracted = response.agendaItems
    
    // 3. Save agenda items to Supabase
    if (extracted && extracted.length > 0) {
      const toInsert = extracted.map((item: any) => ({
        ...item,
        meeting_id: activeMeeting.value!.id
      }))
      
      await supabase.from('catalyst_agenda_items').insert(toInsert)
    }
    
    // 4. Transition status
    await supabase
      .from('catalyst_meetings')
      .update({ status: 'voting' })
      .eq('id', activeMeeting.value!.id)
      
    activeMeeting.value!.status = 'voting'
    await fetchAgendaItems()
  } catch (err: any) {
    console.error('Catalyst Error:', err)
    const msg = err?.data?.statusMessage || err?.message || 'Unknown error'
    window.alert(`Catalyst distillation failed: ${msg}`)
  } finally {
    isAnalyzing.value = false
  }
}

const castVote = async (item: any) => {
  if (userVotes.value.includes(item.id)) return // Basic 1-vote limit
  
  const { error } = await supabase
    .from('catalyst_agenda_items')
    .update({ votes: (item.votes || 0) + 1 })
    .eq('id', item.id)
  
  if (!error) {
    userVotes.value.push(item.id)
  }
}

const finalizeAgenda = async () => {
  if (!activeMeeting.value) return
  
  // Generate summary
  try {
    const { summary } = await $fetch<{ summary: string }>('/api/catalyst/summarize', {
      method: 'POST',
      body: { agendaItems: sortedAgenda.value }
    })
    
    await supabase
      .from('catalyst_meetings')
      .update({ 
        status: 'active',
        meeting_summary: summary
      })
      .eq('id', activeMeeting.value!.id)
    
    activeMeeting.value!.status = 'active'
    activeMeeting.value!.meeting_summary = summary
  } catch (err) {
    console.error('Summarization failed:', err)
    // Fallback to transition without summary
    await supabase
      .from('catalyst_meetings')
      .update({ status: 'active' })
      .eq('id', activeMeeting.value!.id)
    activeMeeting.value!.status = 'active'
  }
}

const toggleComplete = async (item: any) => {
  await supabase
    .from('catalyst_agenda_items')
    .update({ is_completed: !item.is_completed })
    .eq('id', item.id)
}

const closeMeeting = async () => {
  await supabase
    .from('catalyst_meetings')
    .update({ status: 'finished' })
    .eq('id', activeMeeting.value!.id)
  activeMeeting.value = null
  agendaItems.value = []
  hasSubmitted.value = false
}

// Realtime
const setupSubscriptions = () => {
  supabase
    .channel('catalyst-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'catalyst_meetings' }, (payload: any) => {
      if (activeMeeting.value && (payload.new?.id === activeMeeting.value.id || payload.old?.id === activeMeeting.value.id)) {
        if (payload.eventType === 'DELETE') {
          activeMeeting.value = null
          agendaItems.value = []
        } else {
          activeMeeting.value = { ...activeMeeting.value, ...payload.new }
        }
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'catalyst_agenda_items' }, (payload: any) => {
       const item = payload.new || payload.old
       if (!activeMeeting.value || item.meeting_id !== activeMeeting.value.id) return
       
       const index = agendaItems.value.findIndex(i => i.id === item.id)
       if (index !== -1) {
         if (payload.eventType === 'DELETE') {
           agendaItems.value.splice(index, 1)
         } else {
           agendaItems.value[index] = payload.new as any
         }
       } else if (payload.eventType === 'INSERT') {
         agendaItems.value.push(payload.new as any)
       }
    })
    .subscribe()
}
</script>
