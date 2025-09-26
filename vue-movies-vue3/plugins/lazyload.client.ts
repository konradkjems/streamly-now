import { Directive } from 'vue'

/**
 * Function called when image has loaded
 */
const imageLoaded = (e: Event) => {
  const target = e.target as HTMLImageElement
  const parent = target.parentElement
  if (parent) {
    parent.classList.remove('lazyerror', 'lazyloading')
    parent.classList.add('lazyloaded')
  }
}

/**
 * Function called when image has error
 */
const imageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const parent = target.parentElement
  if (parent) {
    parent.classList.remove('lazyloaded', 'lazyloading')
    parent.classList.add('lazyerror')
  }
}

/**
 * Function to load the image
 */
const loadImage = (el: HTMLImageElement, path: string) => {
  const parent = el.parentElement
  if (!parent) return

  // setup loading state
  parent.classList.remove('lazyerror', 'lazyloaded')
  parent.classList.add('lazyloading')

  // image successfully loaded
  el.addEventListener('load', imageLoaded)

  // image failed to load
  el.addEventListener('error', imageError)

  // set element src to the path
  el.src = path
}

/**
 * Lazy loading directive
 */
export const vLazy: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    function handleIntersect(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        } else {
          loadImage(el, binding.value)
          observer.unobserve(el)
        }
      })
    }

    // Detect that the element is in the viewport.
    function createObserver() {
      const options = {
        root: null, // defaults to the browser viewport if not specified or if null
        threshold: 0, // the degree of intersection between the target element and its root (0 - 1)
        // threshold of 1.0 means that when 100% of the target is visible within
        // the element specified by the root option, the callback is invoked
      }

      const observer = new IntersectionObserver(handleIntersect, options)
      observer.observe(el) // target element to watch
    }

    // If IntersectionObserver is not supported, fallback and just load the images
    if (!window.IntersectionObserver) {
      loadImage(el, binding.value)
    } else {
      createObserver()
    }
  },

  updated(el, binding) {
    // only run if the value is different
    if (binding.value !== el.src) {
      loadImage(el, binding.value)
    }
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy', vLazy)
})
