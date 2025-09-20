<script setup>
import { ref, computed } from 'vue'
import { initiateWithdrawal, getWalletBalance } from '@/services/walletService'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

const emit = defineEmits(['success', 'cancel'])

const formData = ref({
  amount: '',
  paymentMethod: 'gcash',
})

const errors = ref({})
const loading = ref(false)
const currentBalance = ref(0)

const paymentMethods = [
  { value: 'gcash', label: 'GCash', icon: '📱' },
  { value: 'maya', label: 'Maya', icon: '💳' },
  { value: 'bpi', label: 'BPI', icon: '🏦' },
  { value: 'bdo', label: 'BDO', icon: '🏦' },
]

const quickAmounts = computed(() => {
  const balance = currentBalance.value
  return [
    Math.min(500, balance),
    Math.min(1000, balance),
    Math.min(2000, balance),
    Math.min(5000, balance),
    balance,
  ]
    .filter((amount) => amount > 0)
    .slice(0, 5)
})

function validateForm() {
  errors.value = {}

  const amount = parseFloat(formData.value.amount)

  if (!formData.value.amount || isNaN(amount)) {
    errors.value.amount = 'Please enter a valid amount'
  } else if (amount < 100) {
    errors.value.amount = 'Minimum withdrawal amount is ₱100'
  } else if (amount > currentBalance.value) {
    errors.value.amount = 'Insufficient balance'
  } else if (amount > 25000) {
    errors.value.amount = 'Maximum withdrawal amount is ₱25,000'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  try {
    const amount = parseFloat(formData.value.amount)
    await initiateWithdrawal(amount, formData.value.paymentMethod) // userId will be set in service
    emit('success', { amount, paymentMethod: formData.value.paymentMethod })

    // Reset form
    formData.value = {
      amount: '',
      paymentMethod: 'gcash',
    }
  } catch (error) {
    console.error('Withdrawal error:', error)
    errors.value.general = error.message || 'Failed to initiate withdrawal'
  } finally {
    loading.value = false
  }
}

function setQuickAmount(amount) {
  formData.value.amount = amount.toString()
}

function setMaxAmount() {
  formData.value.amount = currentBalance.value.toString()
}

async function loadBalance() {
  try {
    const wallet = await getWalletBalance() // userId will be set in service
    currentBalance.value = wallet.current_balance || 0
  } catch (error) {
    console.error('Error loading balance:', error)
  }
}

function handleCancel() {
  emit('cancel')
}

// Load balance on component mount
loadBalance()
</script>

<template>
  <div class="withdraw-form">
    <div class="form-header">
      <h2 class="form-title">Withdraw Funds</h2>
      <p class="form-description">Transfer funds from your EcoLink wallet</p>
    </div>

    <!-- Current Balance -->
    <div class="balance-display">
      <div class="balance-label">Available Balance</div>
      <div class="balance-amount">₱{{ currentBalance.toLocaleString() }}</div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid">
      <!-- Quick Amount Buttons -->
      <div v-if="quickAmounts.length > 0" class="quick-amounts">
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
          <button
            type="button"
            class="amount-btn max-btn"
            @click="setMaxAmount"
            :class="{ active: formData.amount === currentBalance.toString() }"
          >
            All
          </button>
        </div>
      </div>

      <!-- Amount Input -->
      <UiInput
        id="amount"
        label="Withdrawal Amount *"
        type="number"
        placeholder="0.00"
        v-model="formData.amount"
        :error="errors.amount"
        step="0.01"
        :max="currentBalance"
        required
      />

      <!-- Payment Method -->
      <div class="input">
        <label class="input-label">Withdraw To *</label>
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
        <UiButton type="submit" variant="primary" :disabled="loading || currentBalance === 0">
          <span v-if="!loading">Withdraw ₱{{ formData.amount || '0' }}</span>
          <span v-else>Processing...</span>
        </UiButton>
      </div>
    </form>

    <!-- Withdrawal Info -->
    <div class="withdrawal-info">
      <h4>Withdrawal Information</h4>
      <ul>
        <li>Minimum withdrawal: ₱100</li>
        <li>Maximum withdrawal: ₱25,000</li>
        <li>Processing time: 1-2 business days</li>
        <li>Withdrawal fee: ₱25 (deducted from amount)</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.withdraw-form {
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

.balance-display {
  text-align: center;
  padding: 20px;
  background: var(--ecolink-primary-50);
  border: 1px solid var(--ecolink-primary-200);
  border-radius: 12px;
  margin-bottom: 24px;
}

.balance-label {
  font-size: 14px;
  color: var(--ecolink-primary-600);
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 32px;
  font-weight: 800;
  color: var(--ecolink-primary-700);
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

.max-btn {
  background: var(--ecolink-primary-100);
  border-color: var(--ecolink-primary-300);
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

.withdrawal-info {
  margin-top: 24px;
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fcd34d;
}

.withdrawal-info h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
}

.withdrawal-info ul {
  margin: 0;
  padding-left: 20px;
  color: #b45309;
  font-size: 14px;
}

.withdrawal-info li {
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
