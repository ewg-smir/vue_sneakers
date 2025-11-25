<script setup>
import { ref, watch, provide, computed } from 'vue'
import axios from 'axios'
import AppHeader from './components/AppHeader.vue'
import AppDrawer from './components/AppDrawer.vue'

const cart = ref([])
const drawerOpen = ref(false)
const isCreatingOrder = ref(false)
const orderId = ref(null)
const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0))
const vatPrice = computed(() => Math.round(totalPrice.value * 0.05))
const cartIsEmpty = computed(() => cart.value.length === 0)
const cartButtonDisabled = computed(() => isCreatingOrder.value || cartIsEmpty.value)

const closeDrawer = () => {
  drawerOpen.value = false
}

const openDrawer = () => {
  drawerOpen.value = true
}

const addToCart = (item) => {
  cart.value.push(item)
  item.isAdded = true
  orderId.value = null
}

const removeFromCart = (item) => {
  cart.value.splice(cart.value.indexOf(item), 1)
  item.isAdded = false
}

const createOrder = async () => {
  try {
    isCreatingOrder.value = true
    const { data } = await axios.post(`https://070bacfceaf32a7c.mokky.dev/orders`, {
      items: cart.value,
      totalPrice: totalPrice.value,
    })

    cart.value = []
    orderId.value = data.id
    return data
  } catch (e) {
    console.log(e)
  } finally {
    isCreatingOrder.value = false
  }
}

watch(
  cart,
  () => {
    localStorage.setItem('cart', JSON.stringify(cart.value))
  },
  { deep: true },
)

provide('cart', {
  closeDrawer,
  openDrawer,
  removeFromCart,
  addToCart,
  cart,
})
</script>

<template>
  <AppDrawer
    v-if="drawerOpen"
    :total-price="totalPrice"
    :vat-price="vatPrice"
    @create-order="createOrder"
    :cart-button-disabled="cartButtonDisabled"
    :is-creating-order="isCreatingOrder"
    :order-id="orderId"
  />

  <div class="min-h-screen p-5">
    <div class="w-4/5 m-auto bg-white rounded-xl shadow-xl mt-14">
      <AppHeader :total-price="totalPrice" @open-drawer="openDrawer" />
      <div class="p-10">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
