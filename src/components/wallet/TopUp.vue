<script setup>
import { ref } from 'vue'
import { initiateTopUp } from '@/services/walletService'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

const emit = defineEmits(['success', 'cancel'])

const formData = ref({
  amount: '',
  paymentMethod: 'gcash',
})

const errors = ref({})
const loading = ref(false)

const paymentMethods = [
  { value: 'gcash', label: 'GCash', icon: '📱' },
  { value: 'maya', label: 'Maya', icon: '💳' },
  { value: 'bpi', label: 'BPI', icon: '🏦' },
  { value: 'bdo', label: 'BDO', icon: '🏦' },
]

const quickAmounts = [100, 500, 1000, 2000, 5000]

function validateForm() {
  errors.value = {}

  const amount = parseFloat(formData.value.amount)

  if (!formData.value.amount || isNaN(amount)) {
    errors.value.amount = 'Please enter a valid amount'
  } else if (amount < 10) {
    errors.value.amount = 'Minimum top-up amount is ₱10'
  } else if (amount > 50000) {
    errors.value.amount = 'Maximum top-up amount is ₱50,000'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  try {
    const amount = parseFloat(formData.value.amount)
    await initiateTopUp(amount, formData.value.paymentMethod) // userId will be set in service
    emit('success', { amount, paymentMethod: formData.value.paymentMethod })

    // Reset form
    formData.value = {
      amount: '',
      paymentMethod: 'gcash',
    }
  } catch (error) {
    console.error('Top-up error:', error)
    errors.value.general = error.message || 'Failed to initiate top-up'
  } finally {
    loading.value = false
  }
}

function setQuickAmount(amount) {
  formData.value.amount = amount.toString()
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="topup-form">
    <div class="form-header">
      <h2 class="form-title">Top Up Wallet</h2>
      <p class="form-description">Add funds to your EcoLink wallet</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid">
      <!-- Quick Amount Buttons -->
      <div class="quick-amounts">
        <label class="input-label">Quick Amount</label>
        <div class="amount-buttons">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            class="amount-btn"
            @click="setQuickAmount(amount)"
            :class="{ active: formData.amount === amount.toString() }"
          >
            ₱{{ amount.toLocaleString() }}
          </button>
        </div>
      </div>

      <!-- Amount Input -->
      <UiInput
        id="amount"
        label="Amount *"
        type="number"
        placeholder="0.00"
        v-model="formData.amount"
        :error="errors.amount"
        step="0.01"
        min="10"
        max="50000"
        required
      />

      <!-- Payment Method -->
      <div class="input">
        <label class="input-label">Payment Method *</label>
        <div class="payment-methods">
          <label
            v-for="method in paymentMethods"
            :key="method.value"
            class="payment-method"
            :class="{ active: formData.paymentMethod === method.value }"
          >
            <input
              type="radio"
              :value="method.value"
              v-model="formData.paymentMethod"
              class="payment-radio"
            />
            <span class="method-icon">{{ method.icon }}</span>
            <span class="method-name">{{ method.label }}</span>
          </label>
        </div>
      </div>

      <!-- General Error -->
      <div v-if="errors.general" class="error-message general-error">
        {{ errors.general }}
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <UiButton type="button" variant="ghost" @click="handleCancel" :disabled="loading">
          Cancel
        </UiButton>
        <UiButton type="submit" variant="primary" :disabled="loading">
          <span v-if="!loading">Top Up ₱{{ formData.amount || '0' }}</span>
          <span v-else>Processing...</span>
        </UiButton>
      </div>
    </form>

    <!-- Payment Info -->
    <div class="payment-info">
      <h4>Payment Information</h4>
      <ul>
        <li>Minimum top-up: ₱10</li>
        <li>Maximum top-up: ₱50,000</li>
        <li>Processing time: 1-3 minutes</li>
        <li>No fees for top-ups</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.topup-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-primary-700);
}

.form-description {
  margin: 0;
  color: var(--ecolink-muted);
  font-size: 14px;
}

.form-grid {
  display: grid;
  gap: 20px;
}

.quick-amounts {
  display: grid;
  gap: 8px;
}

.input-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--ecolink-text);
}

.amount-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.amount-btn {
  padding: 12px 8px;
  border: 1px solid var(--ecolink-border);
  border-radius: 8px;
  background: var(--ecolink-surface);
  color: var(--ecolink-text);
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease;
}

.amount-btn:hover {
  border-color: var(--ecolink-primary-500);
  background: var(--ecolink-primary-50);
}

.amount-btn.active {
  border-color: var(--ecolink-primary-500);
  background: var(--ecolink-primary-500);
  color: white;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--ecolink-border);
  border-radius: 8px;
  background: var(--ecolink-surface);
  cursor: pointer;
  transition: all 120ms ease;
}

.payment-method:hover {
  border-color: var(--ecolink-primary-500);
}

.payment-method.active {
  border-color: var(--ecolink-primary-500);
  background: var(--ecolink-primary-50);
}

.payment-radio {
  margin: 0;
}

.method-icon {
  font-size: 18px;
}

.method-name {
  font-weight: 600;
  font-size: 14px;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

.general-error {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.payment-info {
  margin-top: 24px;
  padding: 16px;
  background: var(--ecolink-primary-50);
  border-radius: 8px;
  border: 1px solid var(--ecolink-primary-200);
}

.payment-info h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ecolink-primary-700);
}

.payment-info ul {
  margin: 0;
  padding-left: 20px;
  color: var(--ecolink-primary-600);
  font-size: 14px;
}

.payment-info li {
  margin-bottom: 4px;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .amount-buttons {
    grid-template-columns: repeat(3, 1fr);
  }

  .payment-methods {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
