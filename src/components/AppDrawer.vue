<script setup>
import AppDrawerHead from './AppDrawerHead.vue'
import AppCartListItem from './AppCartListItem.vue'
import AppInfoBlock from './AppInfoBlock.vue'

const emit = defineEmits(['createOrder'])

defineProps({
  totalPrice: Number,
  vatPrice: Number,
  cartButtonDisabled: Boolean,
  isCreatingOrder: Boolean,
  orderId: Number,
})
</script>

<template>
  <div class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"></div>
  <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8">
    <AppDrawerHead />
    <div v-if="orderId" class="flex h-full items-center">
      <AppInfoBlock
        title="Заказ оформлен!"
        :description="`Ваш заказ #${orderId} скоро будет передан курьерской доставке`"
        image-url="/order-success-icon.png"
      />
    </div>
    <div v-else-if="!totalPrice" class="flex h-full items-center">
      <AppInfoBlock
        title="Корзина пустая"
        description="Добавьте хотя бы одну пару кроссовок, чтобы сделать заказ."
        image-url="/package-icon.png"
      />
    </div>
    <div v-else>
      <AppCartListItem />
      <div class="flex flex-col mt-7">
        <div class="flex gap-2">
          <span>Общая стоимость:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <b>{{ totalPrice }} руб.</b>
        </div>
        <div class="flex gap-2">
          <span>Налог 5%:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <b>{{ vatPrice }} руб.</b>
        </div>
        <button
          :disabled="cartButtonDisabled"
          @click="emit('createOrder')"
          class="mt-4 disabled:bg-slate-300 transition bg-lime-500 w-full rounded-xl py-3 text-white hover:bg-lime-700 cursor-pointer"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  </div>
</template>
