<script setup>
import axios from 'axios'
import { onMounted, ref, inject } from 'vue'
import AppCardList from '../components/AppCardList.vue'
import AppInfoBlock from '../components/AppInfoBlock.vue' 

const favorites = ref([])
const { cart, addToCart, removeFromCart } = inject('cart')

const fetchFavorites = async () => {
  try {
    const { data } = await axios.get(`https://070bacfceaf32a7c.mokky.dev/favorites?_relations=item`)

    favorites.value = data.map((obj) => {
      const item = obj.item
      const inCart = cart.value.some((cartItem) => cartItem.id === item.id)
      return {
        ...item,
        isFavorite: true,
        favoriteId: obj.id,
        isAdded: inCart,
      }
    })
  } catch (e) {
    console.log(e)
  }
}

const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item)
  } else {
    removeFromCart(item)
  }
}

const onRemoveFavorite = async (item) => {
  try {
    await axios.delete(`https://070bacfceaf32a7c.mokky.dev/favorites/${item.favoriteId}`)
    item.isFavorite = false
    favorites.value = favorites.value.filter((fav) => fav.id !== item.id)
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  await fetchFavorites()
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Мои закладки</h1>

    <div v-if="favorites.length > 0">
      <AppCardList
        :items="favorites"
        @add-to-favorite="onRemoveFavorite"
        @add-to-cart="onClickAddPlus"
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center mt-20">
      <AppInfoBlock
        title="Закладок нет :("
        description="Вы ничего не добавляли в закладки"
        image-url="/emoji-2.png"
      />
    </div>
  </div>
</template>
