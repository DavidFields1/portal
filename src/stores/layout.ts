// src/stores/layout.ts

import { defineStore } from 'pinia'
import { ref, shallowRef, type Component } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
	// Usamos shallowRef para el componente por rendimiento, ya que no necesita ser reactivo en profundidad.
	const rightSidebarComponent = shallowRef<Component | null>(null)
	const rightSidebarProps = ref<object>({})
	const isRightSidebarVisible = ref(false)

	function showRightSidebar(component: Component, props: object = {}) {
		rightSidebarComponent.value = component
		rightSidebarProps.value = props
		isRightSidebarVisible.value = true
	}

	function hideRightSidebar() {
		isRightSidebarVisible.value = false
		// Es buena práctica limpiar los valores al ocultar
		rightSidebarComponent.value = null
		rightSidebarProps.value = {}
	}

	// También podemos actualizar las props sin tener que volver a mostrar todo
	function updateRightSidebarProps(props: object) {
		rightSidebarProps.value = props
	}

	return {
		isRightSidebarVisible,
		rightSidebarComponent,
		rightSidebarProps,
		showRightSidebar,
		hideRightSidebar,
		updateRightSidebarProps,
	}
})
