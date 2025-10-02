<template>
  <div class="mobile-test-page">
    <div class="container">
      <header class="test-header">
        <h1 class="title-responsive">📱 Mobile Test Page</h1>
        <p class="text-responsive">Testing mobile responsiveness across different screen sizes</p>
      </header>

      <section class="test-section">
        <h2>Responsive Components</h2>

        <!-- Button Tests -->
        <div class="component-test">
          <h3>Touch-Friendly Buttons</h3>
          <div class="button-grid">
            <button
              class="btn-touch"
              style="
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
              "
            >
              Primary Button
            </button>
            <button
              class="btn-touch"
              style="
                background: transparent;
                color: var(--primary-color);
                border: 2px solid var(--primary-color);
                border-radius: 8px;
              "
            >
              Secondary Button
            </button>
          </div>
        </div>

        <!-- Form Tests -->
        <div class="component-test">
          <h3>Mobile-Optimized Forms</h3>
          <form class="test-form">
            <div class="form-group">
              <label for="test-email">Email Address</label>
              <input
                id="test-email"
                type="email"
                placeholder="Enter your email"
                style="
                  width: 100%;
                  padding: 0.875rem;
                  font-size: 16px;
                  border: 2px solid var(--border-color);
                  border-radius: 8px;
                "
              />
            </div>
            <div class="form-group">
              <label for="test-phone">Phone Number</label>
              <input
                id="test-phone"
                type="tel"
                placeholder="+63 XXX XXX XXXX"
                style="
                  width: 100%;
                  padding: 0.875rem;
                  font-size: 16px;
                  border: 2px solid var(--border-color);
                  border-radius: 8px;
                "
              />
            </div>
            <button
              type="submit"
              class="btn-touch"
              style="
                width: 100%;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
              "
            >
              Submit Form
            </button>
          </form>
        </div>

        <!-- Card Tests -->
        <div class="component-test">
          <h3>Responsive Cards</h3>
          <div class="card-grid">
            <div class="test-card">
              <h4>Card 1</h4>
              <p>This card should stack on mobile and display in a grid on desktop.</p>
            </div>
            <div class="test-card">
              <h4>Card 2</h4>
              <p>Testing responsive behavior with different content lengths.</p>
            </div>
            <div class="test-card">
              <h4>Card 3</h4>
              <p>Mobile-first design ensures good touch targets and readability.</p>
            </div>
          </div>
        </div>

        <!-- Visibility Tests -->
        <div class="component-test">
          <h3>Responsive Visibility</h3>
          <div
            class="hide-mobile"
            style="padding: 1rem; background: #e3f2fd; border-radius: 8px; margin-bottom: 1rem"
          >
            <strong>Desktop Only:</strong> This content is hidden on mobile devices (≤768px)
          </div>
          <div class="show-mobile" style="padding: 1rem; background: #f3e5f5; border-radius: 8px">
            <strong>Mobile Only:</strong> This content only shows on mobile devices (≤768px)
          </div>
        </div>

        <!-- Navigation Test -->
        <div class="component-test">
          <h3>Mobile Navigation</h3>
          <p>Check the header navigation - it should show a hamburger menu on mobile devices.</p>
        </div>
      </section>

      <footer class="test-footer">
        <p class="text-responsive">
          Resize your browser window or test on different devices to see responsive behavior.
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mobile-test-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 2rem 0;
}

.test-header {
  text-align: center;
  margin-bottom: 3rem;
}

.test-section {
  margin-bottom: 3rem;
}

.component-test {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
}

.component-test h3 {
  margin: 0 0 1.5rem 0;
  color: var(--primary-color);
}

.button-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.test-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.test-card {
  background: var(--bg-muted);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.test-card h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.test-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.test-footer {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid var(--border-color);
  margin-top: 3rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .mobile-test-page {
    padding: 1rem 0;
  }

  .component-test {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .button-grid {
    flex-direction: column;
  }

  .card-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .component-test {
    padding: 1rem;
  }

  .test-card {
    padding: 1rem;
  }
}
</style>
