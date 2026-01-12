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
    if (valObj?.path) {
        const parts = valObj.path.split('/').filter(p => p);
        return parts.reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : '...', localData);
    }
    return valObj;
};
</script>

<template>
    <div v-if="!type" class="text-xs text-red-400 bg-red-50 p-2 rounded">Error: {{ componentId }}</div>

    <div v-else-if="type === 'Column'" class="flex flex-col gap-4 w-full">
        <A2UISurface v-for="id in args.children.explicitList" :key="id" :componentId="id" :components="components"
            :data="data" @action="$emit('action', $event)" />
    </div>

    <div v-else-if="type === 'Row'" class="flex flex-row flex-wrap gap-3 items-center w-full">
        <A2UISurface v-for="id in args.children.explicitList" :key="id" :componentId="id" :components="components"
            :data="data" @action="$emit('action', $event)" />
    </div>

    <div v-else-if="type === 'Card'"
        class="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
        <A2UISurface :componentId="args.child" :components="components" :data="data"
            @action="$emit('action', $event)" />
    </div>

    <div v-else-if="type === 'Tabs'" class="w-full">
        <div class="flex gap-2 mb-4 border-b border-gray-100 pb-1">
            <button v-for="(opt, i) in args.options" :key="opt" :class="['px-4 py-2 rounded-t-lg text-sm font-medium transition-all relative top-[1px]',
                args.active === i ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50']">
                {{ opt }}
            </button>
        </div>
        <A2UISurface :componentId="args.child" :components="components" :data="data"
            @action="$emit('action', $event)" />
    </div>

    <h2 v-else-if="type === 'Text' && args.usageHint === 'h1'" class="text-xl font-medium text-gray-900 tracking-tight">
        {{ resolve(args.text) }}
    </h2>

    <div v-else-if="type === 'Text' && args.usageHint === 'caption'"
        class="text-xs font-bold text-gray-500 uppercase tracking-widest">
        {{ resolve(args.text) }}
    </div>

    <p v-else-if="type === 'Text'" class="text-gray-700 leading-relaxed text-[15px]">
        {{ resolve(args.text) }}
    </p>

    <div v-else-if="type === 'Icon'"
        class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
        <span class="material-icons notranslate text-xl leading-none select-none">
            {{ args.name }}
        </span>
    </div>

    <div v-else-if="type === 'Metric'" class="flex-1 min-w-[120px] bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ args.label }}</div>
        <div class="text-3xl font-medium text-gray-900">{{ resolve(args.value) }}</div>
        <div v-if="args.trend"
            :class="['text-xs font-medium mt-2 flex items-center gap-1', args.trend === 'up' ? 'text-green-600' : 'text-orange-500']">
            <span class="material-icons text-[14px]">{{ args.trend === 'up' ? 'trending_up' : 'trending_flat' }}</span>
            <span>{{ args.trend === 'up' ? '+12.5%' : 'Stable' }}</span>
        </div>
    </div>

    <div v-else-if="type === 'Chart'" class="w-full pt-4">
        <div class="flex items-end gap-2 h-28 w-full">
            <div v-for="(pt, i) in resolve(args.dataBinding)" :key="i"
                class="flex-1 bg-blue-500 rounded-t-sm relative group hover:bg-blue-600 transition-all duration-500 cursor-pointer"
                :style="{ height: `${pt.val}%`, opacity: 0.7 + (pt.val / 300) }">
                <div
                    class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ pt.val }}
                </div>
            </div>
        </div>
        <div class="flex justify-between mt-2 border-t border-gray-100 pt-2">
            <span v-for="(pt, i) in resolve(args.dataBinding)" :key="i" class="text-[10px] text-gray-400 font-medium">{{
                pt.item }}</span>
        </div>
    </div>

    <div v-else-if="type === 'TextInput'" class="w-full">
        <input type="text" :placeholder="args.placeholder"
            class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all" />
    </div>

    <div v-else-if="type === 'Checkbox'"
        class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
        <input type="checkbox" :id="componentId"
            class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
        <label :for="componentId" class="text-sm text-gray-700 cursor-pointer select-none">{{ args.label }}</label>
    </div>

    <button v-else-if="type === 'Button'" @click="$emit('action', args.action)"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all flex justify-center items-center">
        <A2UISurface :componentId="args.child" :components="components" :data="data" />
    </button>
</template>