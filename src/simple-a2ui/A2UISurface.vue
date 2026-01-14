<script>
export default { name: 'A2UISurface' }
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps(['componentId', 'components', 'data']);
const emit = defineEmits(['action']);

const compDef = computed(() => props.components[props.componentId]);
const type = computed(() => compDef.value ? Object.keys(compDef.value)[0] : null);
const args = computed(() => compDef.value ? compDef.value[type.value] : {});

const resolve = (valObj, localData = props.data) => {
    if (valObj?.literalString) return valObj.literalString;
    if (valObj?.literalNumber) return valObj.literalNumber;
    if (valObj?.literalBool !== undefined) return valObj.literalBool;
    if (valObj?.path) {
        const parts = valObj.path.split('/').filter(p => p);
        return parts.reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : undefined, localData);
    }
    return valObj;
};

// HELPER: Safely extract chart values regardless of data shape
const getChartValue = (pt) => {
    if (typeof pt === 'number') return pt;
    if (pt && typeof pt === 'object' && pt.val !== undefined) return pt.val;
    return 0;
};
</script>

<template>
    <div v-if="!type" class="text-[10px] text-rose-400 border border-rose-500/20 bg-rose-500/5 p-2 rounded">
        ERR: {{ componentId }}
    </div>

    <div v-else-if="type === 'Column'" class="flex flex-col gap-4 w-full h-full">
        <A2UISurface v-for="id in args.children.explicitList" :key="id" :componentId="id" :components="components"
            :data="data" @action="$emit('action', $event)" />
    </div>

    <div v-else-if="type === 'Row'" class="flex flex-row flex-wrap gap-4 items-center w-full">
        <A2UISurface v-for="id in args.children.explicitList" :key="id" :componentId="id" :components="components"
            :data="data" @action="$emit('action', $event)" />
    </div>

    <div v-else-if="type === 'Card'"
        class="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col h-full relative overflow-hidden group hover:border-zinc-700 transition-colors duration-300">
        <div class="relative z-10 flex flex-col h-full">
            <A2UISurface :componentId="args.child" :components="components" :data="data"
                @action="$emit('action', $event)" />
        </div>
    </div>

    <h2 v-else-if="type === 'Text' && args.usageHint === 'h1'"
        class="text-base font-medium text-zinc-200 tracking-tight">
        {{ resolve(args.text) }}
    </h2>

    <div v-else-if="type === 'Text' && args.usageHint === 'caption'"
        class="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
        {{ resolve(args.text) }}
    </div>

    <p v-else-if="type === 'Text'" class="text-zinc-400 text-sm leading-relaxed">
        {{ resolve(args.text) }}
    </p>

    <div v-else-if="type === 'Icon'"
        class="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 shrink-0">
        <span class="material-icons notranslate text-[18px]">{{ args.name }}</span>
    </div>

    <div v-else-if="type === 'ProgressBar'" class="w-full mt-3">
        <div class="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-800">
            <div class="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-700 ease-out"
                :style="{ width: `${Math.min(100, Math.max(0, resolve(args.value) || 0))}%` }">
            </div>
        </div>
    </div>

    <div v-else-if="type === 'Metric'"
        class="flex-1 min-w-[120px] bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50">
        <div class="flex justify-between items-start">
            <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{{ args.label }}</div>
            <span v-if="args.trend" class="material-icons text-[14px]"
                :class="args.trend === 'up' ? 'text-emerald-500/80' : 'text-rose-500/80'">
                {{ args.trend === 'up' ? 'north_east' : 'south_east' }}
            </span>
        </div>
        <div class="text-xl font-mono text-zinc-300 mt-1 tracking-tight">{{ resolve(args.value) || '--' }}</div>
    </div>

    <div v-else-if="type === 'Chart'" class="w-full pt-6 mt-auto">
        <div class="flex items-end gap-1 h-20 w-full">
            <div v-for="(pt, i) in (resolve(args.dataBinding) || [])" :key="i"
                class="flex-1 bg-indigo-500/60 rounded-t-[1px] relative group hover:bg-indigo-500/90 transition-all duration-300 min-h-[2px]"
                :style="{ height: `${getChartValue(pt)}%` }">

                <div
                    class="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    {{ getChartValue(pt) }}
                </div>
            </div>
        </div>
        <div class="w-full h-px bg-zinc-800 mt-px"></div>
    </div>

    <button v-else-if="type === 'Button'" @click="$emit('action', args.action)"
        class="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold py-2.5 px-4 rounded-lg transition-all flex justify-center items-center mt-auto border border-zinc-700 uppercase tracking-wide cursor-pointer hover:border-zinc-500">
        <A2UISurface :componentId="args.child" :components="components" :data="data" />
    </button>
</template>