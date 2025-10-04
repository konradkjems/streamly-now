<template>
  <div :class="$style.callbackContainer">
    <div :class="$style.loadingContent">
      <div :class="$style.spinner"></div>
      <h2 :class="$style.title">Completing sign in...</h2>
      <p :class="$style.subtitle">Please wait while we finish setting up your account.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthCallbackPage',
  
  layout: 'auth',
  
  async mounted() {
    try {
      // Handle the OAuth callback
      const { data, error } = await this.$supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        this.$router.push('/auth/signin?error=callback_failed')
        return
      }
      
      if (data.session) {
        // Successfully authenticated, redirect to home
        this.$router.push('/')
      } else {
        // No session found, redirect to sign in
        this.$router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      this.$router.push('/auth/signin?error=callback_failed')
    }
  }
}
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.callbackContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #111 100%);
  padding: 2rem;
}

.loadingContent {
  text-align: center;
  max-width: 40rem;
}

.spinner {
  width: 4rem;
  height: 4rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.title {
  font-size: 2.4rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1rem;
}

.subtitle {
  font-size: 1.6rem;
  color: #b3b3b3;
  margin: 0;
}

@media (max-width: $breakpoint-small) {
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.4rem;
  }
}
</style>
