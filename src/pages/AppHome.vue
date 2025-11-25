<script setup>
import AppCardList from '@/components/AppCardList.vue'
import axios from 'axios'
import { onMounted, inject, reactive, watch, ref } from 'vue'

const { cart, addToCart, removeFromCart } = inject('cart')

const items = ref([])
const favorites = ref([])

const filters = reactive({
  sortBy: 'title',
  searchQuery: '',
})

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
      const favorite = favorites.value.find((fav) => fav.item_id === item.id)
      const inCart = cart.value.find((cartItem) => cartItem.id === item.id)
      return {
        ...item,
        isFavorite: favorite ? true : false, 
        favoriteId: favorite ? favorite.id : null, 
        isAdded: inCart ? true : false, 
      }
    })
  } catch (e) {
    console.log(e)
  }
}

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        item_id: item.id,
        item,
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
</script>

<template>
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
    <AppCardList :items="items" @add-to-favorite="addToFavorite" @add-to-cart="onClickAddPlus" />
  </div>
</template>
