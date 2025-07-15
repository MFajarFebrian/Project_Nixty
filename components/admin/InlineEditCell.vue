<template>
  <div class="inline-edit-cell">
    <!-- Editing mode -->
    <template v-if="editing">
      <!-- Relation dropdown -->
      <select
        v-if="isRelation"
        v-model="localValue"
        ref="editElement"
        @change="save"
        @blur="cancel"
        class="inline-select"
      >
        <option v-for="opt in relationOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- Default text input -->
      <input
        v-else
        type="text"
        v-model="localValue"
        ref="editElement"
        @keyup.enter="save"
        @blur="cancel"
        class="inline-input"
      />
    </template>

    <!-- Read-only mode -->
      <div @dblclick="startEdit" class="inline-display">
        <img v-if="isImageColumn && displayValue" :src="displayValue" alt="Image" class="table-image"/>
        <span v-else-if="displayValue">{{ displayValue }}</span>
        <span v-else class="empty-value">-</span>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useToast } from '~/composables/useToast';

/**
 * Inline editable table cell component
 * Props:
 *  - tableName:   name of current table
 *  - record:      full record object (must contain id)
 *  - column:      column meta { name, ... }
 *  - updateRecord: function(tableName,id,data) from useAdminTables
 *  - relations:   optional relations meta for dropdown options
 */

const props = defineProps({
  tableName: { type: String, required: true },
  record: { type: Object, required: true },
  column: { type: Object, required: true },
  updateRecord: { type: Function, required: true },
  relations: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['open-image-upload', 'request-delete-image']);

const { success, error: showError } = useToast();

const editing = ref(false);
const localValue = ref(props.record[props.column.name]);
const editElement = ref(null);

watch(
  () => props.record[props.column.name],
  val => {
    if (!editing.value) localValue.value = val;
  }
);

const isRelation = computed(() => {
  return Boolean(props.relations?.[props.column.name]);
});

const isImageColumn = computed(() => {
    const name = props.column.name.toLowerCase();
    return name.includes('image_url') || name.includes('image');
});

const relationOptions = computed(() => {
  if (!isRelation.value) return [];
  return props.relations[props.column.name].map(r => ({
    value: r.value ?? r.id ?? r.key,
    label: r.label ?? r.name ?? r.value ?? r.id,
  }));
});

const displayValue = computed(() => {
  if (isRelation.value) {
    const opt = relationOptions.value.find(o => o.value === props.record[props.column.name]);
    return opt ? opt.label : props.record[props.column.name];
  }
  return props.record[props.column.name];
});

async function startEdit() {
  if (isImageColumn.value) {
    if (props.record[props.column.name]) { // If an image exists
      // Emit an event to the parent to handle deletion confirmation
      emit('request-delete-image', { record: props.record, column: props.column });
    } else {
      // If no image, open the upload modal
      emit('open-image-upload', props.record);
    }
    return;
  }
  editing.value = true;
  localValue.value = props.record[props.column.name];
  await nextTick();
  if (editElement.value) {
    editElement.value.focus();
    if (editElement.value.select) editElement.value.select();
  }
}

async function save() {
  try {
    if (localValue.value !== props.record[props.column.name]) {
      await props.updateRecord(props.tableName, props.record.id, { [props.column.name]: localValue.value });
      success('Saved');
    }
  } catch (err) {
    showError(err.message || 'Failed to save');
  } finally {
    editing.value = false;
  }
}

function cancel() {
  editing.value = false;
}
</script>

<style scoped>
.inline-edit-cell {
  cursor: pointer;
}
.inline-display {
  display: inline-block;
  min-width: 60px;
}
.inline-input,
.inline-select {
  width: 100%;
  box-sizing: border-box;
  font-size: inherit;
  padding: 2px 4px;
}

.table-image {
  max-width: 100px;
  max-height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-image:hover {
  transform: scale(1.05);
  border-color: var(--galaxy-aurora-cyan);
}
</style>

