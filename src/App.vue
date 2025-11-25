<script setup>
import { onMounted, ref, watch, reactive, provide, computed } from 'vue'
import axios from 'axios'
import AppHeader from './components/AppHeader.vue'
import AppCardList from './components/AppCardList.vue'
import AppDrawer from './components/AppDrawer.vue'

const items = ref([])
const cart = ref([])
const favorites = ref([])
const drawerOpen = ref(false)
const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0))
const vatPrice = computed(() => totalPrice.value * 0.05)
const isCreatingOrder = ref(false)

const cartIsEmpty = computed(() => cart.value.length === 0)

const cartButtonDisabled = computed(() => cartIsEmpty.value || isCreatingOrder.value)

const closeDrawer = () => {
  drawerOpen.value = false
}

const openDrawer = () => {
  drawerOpen.value = true
}

const filters = reactive({
  sortBy: 'title',
  searchQuery: '',
})

const addToCart = (item) => {
  cart.value.push(item)
  item.isAdded = true
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
    cart.value.forEach((item) => (item.isAdded = false))
    cart.value = []
    return data
  } catch (e) {
    console.log(e)
  } finally {
    isCreatingOrder.value = false
  }
}

const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item)
  } else {
    removeFromCart(item)
  }
}

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
}

const onChangeInput = (event) => {
  filters.searchQuery = event.target.value
}

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        parentId: item.id,
      }
      const { data } = await axios.post(`https://070bacfceaf32a7c.mokky.dev/favorites`, obj)
      item.isFavorite = true
      item.favoriteId = data.id
    } else {
      await axios.delete(`https://070bacfceaf32a7c.mokky.dev/favorites/${item.favoriteId}`)
      item.isFavorite = false
      item.favoriteId = null
    }
  } catch (e) {
    console.log(e)
  }
}

const fetchFavorites = async () => {
  try {
    const { data } = await axios.get(`https://070bacfceaf32a7c.mokky.dev/favorites`)
    favorites.value = data
  } catch (e) {
    console.log(e)
  }
}
const fetchItems = async () => {
  try {
    const params = {
      sortBy: filters.sortBy,
    }

    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`
    }

    const { data } = await axios.get(`https://070bacfceaf32a7c.mokky.dev/items`, {
      params,
    })

    items.value = data.map((item) => {
      const favorite = favorites.value.find((fav) => fav.parentId === item.id)
      const inCart = cart.value.find((cartItem) => cartItem.id === item.id)

      if (!favorite) {
        return {
          ...item,
          isFavorite: favorite ? true : false,
          favoriteId: favorite ? favorite.id : null,
          isAdded: inCart ? true : false,
        }
      }

      return {
        ...item,
        isFavorite: true,
        favoriteId: favorite.id,
        isAdded: false,
      }
    })
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const localCart = localStorage.getItem('cart')
  cart.value = localCart ? JSON.parse(localCart) : []

  await fetchFavorites()
  await fetchItems()

  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id),
  }))
})

watch(filters, fetchItems)

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
  />
  <div class="min-h-screen p-5">
    <div class="w-4/5 m-auto bg-white rounded-xl shadow-xl mt-14">
      <AppHeader :total-price="totalPrice" @open-drawer="openDrawer" />
      <div class="p-10">
        <div class="flex justify-between items-center">
          <h2 class="text-3xl font-bold mb-8">Все кроссовки</h2>
          <div class="flex gap-4">
            <select @change="onChangeSelect" class="py-2 px-3 border rounded-md outline-none">
              <option value="name">По названию</option>
              <option value="price">По цене (дешевые)</option>
              <option value="-price">По цене (дорогие)</option>
            </select>
            <div class="relative">
              <img class="absolute left-4 top-3" src="/search.svg" alt="Search" />
              <input
                @input="onChangeInput"
                class="border rounded-md py-2 pl-11 pr-4 outline-none focus:border-gray-400"
                type="text"
                placeholder="Поиск..."
              />
            </div>
          </div>
        </div>
        <div class="mt-10">
          <AppCardList
            :items="items"
            @add-to-favorite="addToFavorite"
            @add-to-cart="onClickAddPlus"
          />
        </div>
      </div>
    </div>
  </div>
</template>
