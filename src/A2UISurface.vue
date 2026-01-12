<script setup>
import { computed } from 'vue';

const props = defineProps(['surfaceId', 'componentId', 'components', 'data']);
const emit = defineEmits(['action']);

const comp = computed(() => props.components[props.componentId]);
const type = computed(() => Object.keys(comp.value || {})[0]);
const args = computed(() => comp.value[type.value]);

const getValue = (val, local = props.data) => {
    if (val?.literalString) return val.literalString;
    if (val?.path) {
        const parts = val.path.split('/').filter(p => p);
        return parts.reduce((acc, p) => acc?.[p], local);
    }
    return val;
};
</script>

<template>
    <div v-if="type === 'Column'" class="flex flex-col gap-5">
        <A2UISurface v-for="id in args.children.explicitList" :key="id" v-bind="props" :componentId="id" />
    </div>

    <div v-else-if="type === 'Row'" class="flex flex-row items-center gap-4 flex-wrap">
        <A2UISurface v-for="id in args.children.explicitList" :key="id" v-bind="props" :componentId="id" />
    </div>

    <div v-else-if="type === 'Card'"
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <A2UISurface v-bind="props" :componentId="args.child" />
    </div>

    <div v-else-if="type === 'Text'" :class="[
        args.usageHint === 'h1' ? 'text-2xl font-extrabold text-slate-900 tracking-tight' :
            args.usageHint === 'caption' ? 'text-xs uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-600'
    ]">
        {{ getValue(args.text) }}
    </div>

    <div v-else-if="type === 'Icon'"
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
        <span class="material-icons-outlined text-lg">{{ args.name }}</span>
    </div>

    <div v-else-if="type === 'Metric'"
        class="flex-1 min-w-[140px] p-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
        <div class="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1">{{ args.label }}</div>
        <div class="text-2xl font-bold text-slate-900">{{ getValue(args.value) }}</div>
        <div v-if="args.trend" :class="[
            'text-xs font-medium mt-2 flex items-center gap-1',
            args.trend === 'up' ? 'text-emerald-600' : 'text-slate-400'
        ]">
            <span v-if="args.trend === 'up'">▲ +12%</span>
            <span v-else>▬ Steady</span>
        </div>
    </div>

    <div v-else-if="type === 'Chart'" class="w-full pt-4">
        <div class="flex items-end gap-2 h-32 w-full px-2 border-b border-slate-100">
            <div v-for="item in getValue(args.dataBinding)" :key="item.item"
                class="flex-1 bg-blue-500 rounded-t-lg transition-all duration-700 hover:bg-blue-600 relative group"
                :style="{ height: `${item.val}%` }">
                <div
                    class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ item.val }}%
                </div>
            </div>
        </div>
        <div class="flex justify-between mt-2 px-1">
            <span v-for="item in getValue(args.dataBinding)" :key="item.item"
                class="text-[10px] text-slate-400 font-medium">
                {{ item.item }}
            </span>
        </div>
    </div>

    <div v-else-if="type === 'Tabs'" class="inline-flex p-1 bg-slate-100 rounded-xl mb-4">
        <button v-for="(tab, i) in args.options" :key="tab" :class="['px-4 py-1.5 text-sm font-medium rounded-lg transition-all',
            args.active === i ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
            {{ tab }}
        </button>
    </div>
</template>