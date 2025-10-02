<template>
  <div class="buy-credits-view">
    <div class="page-header">
      <h1 class="page-title">Buy Credits</h1>
      <p class="page-description">Purchase environmental credits to support sustainable projects</p>
    </div>

    <div class="buy-credits-content">
      <!-- Available Credits -->
      <div class="credits-section">
        <h3 class="section-title">Available Credits</h3>
        <div class="credits-grid">
          <div v-for="credit in availableCredits" :key="credit.id" class="credit-card">
            <div class="credit-header">
              <h4 class="credit-title">{{ credit.title }}</h4>
              <span class="credit-price">₱{{ credit.pricePerCredit }}/credit</span>
            </div>
            <div class="credit-body">
              <p class="credit-description">{{ credit.description }}</p>
              <div class="credit-meta">
                <span class="credit-project">{{ credit.project }}</span>
                <span class="credit-type">{{ credit.type }}</span>
              </div>
              <div class="credit-availability">
                <span class="available-credits">{{ credit.available }} credits available</span>
              </div>
            </div>
            <div class="credit-actions">
              <div class="quantity-selector">
                <label for="quantity">Quantity:</label>
                <input
                  id="quantity"
                  v-model="credit.quantity"
                  type="number"
                  min="1"
                  :max="credit.available"
                  class="quantity-input"
                />
              </div>
              <button
                class="btn btn-primary"
                @click="addToCart(credit)"
                :disabled="credit.quantity < 1 || credit.quantity > credit.available"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Shopping Cart -->
      <div class="cart-section" v-if="cartItems.length > 0">
        <h3 class="section-title">Shopping Cart</h3>
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-info">
              <h4 class="item-title">{{ item.title }}</h4>
              <p class="item-project">{{ item.project }}</p>
            </div>
            <div class="item-details">
              <span class="item-quantity">{{ item.quantity }} credits</span>
              <span class="item-price"
                >₱{{ (item.pricePerCredit * item.quantity).toLocaleString() }}</span
              >
            </div>
            <button class="btn btn-danger" @click="removeFromCart(item.id)">Remove</button>
          </div>
        </div>
        <div class="cart-summary">
          <div class="total-credits">
            <span>Total Credits:</span>
            <span>{{ totalCredits }}</span>
          </div>
          <div class="total-amount">
            <span>Total Amount:</span>
            <span>₱{{ totalAmount.toLocaleString() }}</span>
          </div>
          <button class="btn btn-success btn-large" @click="proceedToCheckout">
            Proceed to Checkout
          </button>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="payment-section" v-if="showPayment">
        <h3 class="section-title">Payment Method</h3>
        <div class="payment-methods">
          <div class="payment-option">
            <input id="gcash" v-model="selectedPayment" type="radio" value="gcash" name="payment" />
            <label for="gcash" class="payment-label">
              <div class="payment-icon">📱</div>
              <div class="payment-info">
                <h4>GCash</h4>
                <p>Pay using your GCash wallet</p>
              </div>
            </label>
          </div>
          <div class="payment-option">
            <input id="maya" v-model="selectedPayment" type="radio" value="maya" name="payment" />
            <label for="maya" class="payment-label">
              <div class="payment-icon">💳</div>
              <div class="payment-info">
                <h4>Maya</h4>
                <p>Pay using your Maya account</p>
              </div>
            </label>
          </div>
        </div>
        <div class="payment-actions">
          <button class="btn btn-secondary" @click="showPayment = false">Back to Cart</button>
          <button class="btn btn-primary" @click="processPayment" :disabled="!selectedPayment">
            Complete Purchase
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BuyCreditsView',
  setup() {
    const showPayment = ref(false)
    const selectedPayment = ref('')
    const cartItems = ref([])

    const availableCredits = ref([
      {
        id: 1,
        title: 'Solar Energy Credits',
        description: 'Support solar energy projects and reduce carbon footprint',
        project: 'Solar Farm Initiative',
        type: 'Renewable Energy',
        pricePerCredit: 50,
        available: 1000,
        quantity: 1,
      },
      {
        id: 2,
        title: 'Wind Energy Credits',
        description: 'Contribute to wind energy development',
        project: 'Wind Power Program',
        type: 'Renewable Energy',
        pricePerCredit: 45,
        available: 750,
        quantity: 1,
      },
      {
        id: 3,
        title: 'Reforestation Credits',
        description: 'Support tree planting and forest conservation',
        project: 'Green Forest Project',
        type: 'Carbon Offset',
        pricePerCredit: 30,
        available: 2000,
        quantity: 1,
      },
      {
        id: 4,
        title: 'Ocean Cleanup Credits',
        description: 'Help clean up ocean plastic and marine debris',
        project: 'Blue Ocean Initiative',
        type: 'Environmental Cleanup',
        pricePerCredit: 25,
        available: 1500,
        quantity: 1,
      },
    ])

    const totalCredits = computed(() => {
      return cartItems.value.reduce((total, item) => total + item.quantity, 0)
    })

    const totalAmount = computed(() => {
      return cartItems.value.reduce((total, item) => total + item.pricePerCredit * item.quantity, 0)
    })

    const addToCart = (credit) => {
      const existingItem = cartItems.value.find((item) => item.id === credit.id)
      if (existingItem) {
        existingItem.quantity += credit.quantity
      } else {
        cartItems.value.push({
          ...credit,
          quantity: credit.quantity,
        })
      }
      // Reset quantity
      credit.quantity = 1
    }

    const removeFromCart = (id) => {
      const index = cartItems.value.findIndex((item) => item.id === id)
      if (index > -1) {
        cartItems.value.splice(index, 1)
      }
    }

    const proceedToCheckout = () => {
      showPayment.value = true
    }

    const processPayment = () => {
      console.log('Processing payment with', selectedPayment.value)
      console.log('Cart items:', cartItems.value)
      // Implement payment processing
      alert('Payment processed successfully!')
      cartItems.value = []
      showPayment.value = false
      selectedPayment.value = ''
    }

    return {
      showPayment,
      selectedPayment,
      cartItems,
      availableCredits,
      totalCredits,
      totalAmount,
      addToCart,
      removeFromCart,
      proceedToCheckout,
      processPayment,
    }
  },
}
</script>

<style scoped>
.buy-credits-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.credits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.credit-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.credit-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.credit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.credit-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.credit-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #069e2d;
}

.credit-body {
  margin-bottom: 1.5rem;
}

.credit-description {
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.credit-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.credit-project {
  font-size: 0.875rem;
  color: #718096;
}

.credit-type {
  font-size: 0.875rem;
  color: #069e2d;
  font-weight: 500;
}

.credit-availability {
  font-size: 0.875rem;
  color: #38a169;
  font-weight: 500;
}

.credit-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-selector label {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.quantity-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
}

.cart-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.item-project {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.item-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.item-quantity {
  font-size: 0.875rem;
  color: #4a5568;
}

.item-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.cart-summary {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.total-credits,
.total-amount {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.total-amount {
  font-size: 1.25rem;
  color: #069e2d;
}

.payment-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.payment-methods {
  margin-bottom: 2rem;
}

.payment-option {
  margin-bottom: 1rem;
}

.payment-option input[type='radio'] {
  display: none;
}

.payment-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option input[type='radio']:checked + .payment-label {
  border-color: #069e2d;
  background: #f0fdf4;
}

.payment-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 8px;
}

.payment-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.payment-info p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #069e2d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #058e3f;
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-danger {
  background: #fc8181;
  color: white;
}

.btn-danger:hover {
  background: #f56565;
}

.btn-success {
  background: #38a169;
  color: white;
}

.btn-success:hover {
  background: #2f855a;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}
</style>
