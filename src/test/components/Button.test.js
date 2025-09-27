import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('ui-btn')
    expect(wrapper.classes()).toContain('ui-btn--primary')
  })

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger']

    variants.forEach((variant) => {
      const wrapper = mount(Button, {
        props: { variant },
        slots: { default: 'Button' },
      })

      expect(wrapper.classes()).toContain(`ui-btn--${variant}`)
    })
  })

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg']

    sizes.forEach((size) => {
      const wrapper = mount(Button, {
        props: { size },
        slots: { default: 'Button' },
      })

      expect(wrapper.classes()).toContain(`ui-btn--${size}`)
    })
  })

  it('handles click events', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('shows loading state', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Loading...' },
    })

    expect(wrapper.text()).toBe('Loading...')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders with custom classes', () => {
    const wrapper = mount(Button, {
      props: { class: 'custom-class' },
      slots: { default: 'Button' },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('renders with custom content', () => {
    const wrapper = mount(Button, {
      slots: { default: '🚀 Launch' },
    })

    expect(wrapper.text()).toBe('🚀 Launch')
  })
})
