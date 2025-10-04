<template>
  <div :class="$style.authPage">
    <div :class="$style.authContainer">
      <div :class="$style.authHeader">
        <nuxt-link :to="{ name: 'index' }" :class="$style.logo">
          <span :class="$style.logoText">STREAMLY</span>
        </nuxt-link>
        <h1 :class="$style.title">Sign In</h1>
        <p :class="$style.subtitle">Welcome back to Streamly</p>
      </div>

      <form :class="$style.authForm" @submit.prevent="handleSignIn">
        <div v-if="error" :class="$style.errorMessage">
          <svg :class="$style.errorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </div>

        <div :class="$style.formGroup">
          <label for="email" :class="$style.label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="$style.input"
            placeholder="Enter your email"
            required
            autocomplete="email">
        </div>

        <div :class="$style.formGroup">
          <label for="password" :class="$style.label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :class="$style.input"
            placeholder="Enter your password"
            required
            autocomplete="current-password">
        </div>

        <button
          type="submit"
          :class="$style.submitBtn"
          :disabled="loading">
          <svg v-if="loading" :class="$style.spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
          </svg>
          <span v-if="loading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Social Sign-In Section -->
      <div :class="$style.socialSection">
        <div :class="$style.divider">
          <span :class="$style.dividerText">or</span>
        </div>

        <button
          :class="$style.googleBtn"
          :disabled="loading"
          @click="handleGoogleSignIn">
          <svg :class="$style.googleIcon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span v-if="loading">Signing In...</span>
          <span v-else>Continue with Google</span>
        </button>
      </div>

      <div :class="$style.authFooter">
        <p>
          Don't have an account?
          <nuxt-link :to="{ name: 'auth-signup' }" :class="$style.link">
            Sign up
          </nuxt-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SignInPage',
  
  layout: 'auth',
  
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isLoading', 'authError']),

    loading() {
      return this.isLoading
    },

    error() {
      return this.authError
    }
  },

  watch: {
    isAuthenticated(newVal) {
      if (newVal) {
        this.$router.push('/')
      }
    }
  },

  methods: {
    ...mapActions('auth', ['signIn', 'signInWithGoogle']),

    async handleSignIn() {
      try {
        await this.signIn({
          email: this.form.email,
          password: this.form.password
        })
        
        this.$router.push('/')
      } catch (error) {
        console.error('Sign in error:', error)
      }
    },

    async handleGoogleSignIn() {
      try {
        await this.signInWithGoogle()
        // The user will be redirected by Supabase OAuth flow
      } catch (error) {
        console.error('Google sign in error:', error)
      }
    }
  }
}
</script>

<style lang="scss" module>
@import '~/assets/css/utilities/_variables.scss';

.authPage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #000 0%, #111 100%);
  padding: 2rem;
}

.authContainer {
  width: 100%;
  max-width: 42rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 4.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.authHeader {
  text-align: center;
  margin-bottom: 3.5rem;
}

.logo {
  display: inline-block;
  text-decoration: none;
  outline: 0;
  margin-bottom: 2.5rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.logoText {
  font-size: 3.4rem;
  font-weight: 800;
  color: $primary-color;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  text-shadow: 0 2px 10px rgba(229, 9, 20, 0.3);
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.6rem;
  color: #b3b3b3;
  margin: 0;
  font-weight: 400;
}

.authForm {
  margin-bottom: 3.5rem;
}

.errorMessage {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.4rem 1.6rem;
  margin-bottom: 2rem;
  background: rgba(229, 9, 20, 0.08);
  border: 1px solid rgba(229, 9, 20, 0.2);
  border-radius: 8px;
  color: $primary-color;
  font-size: 1.4rem;
  font-weight: 500;
}

.errorIcon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.formGroup {
  margin-bottom: 2.2rem;
}

.label {
  display: block;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
  letter-spacing: 0.01em;
}

.input {
  width: 100%;
  padding: 1.4rem 1.8rem;
  font-size: 1.6rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  outline: 0;
  transition: all 0.3s ease;
  font-weight: 400;

  &:focus {
    border-color: $primary-color;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: #999;
    font-weight: 400;
  }
}

.submitBtn {
  width: 100%;
  padding: 1.6rem 2rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(229, 9, 20, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.socialSection {
  margin-top: 3rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2.5rem 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  }
}

.dividerText {
  background: rgba(255, 255, 255, 0.03);
  padding: 0 2rem;
  font-size: 1.4rem;
  color: #b3b3b3;
  position: relative;
  font-weight: 500;
}

.googleBtn {
  width: 100%;
  padding: 1.4rem 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #333;
  background: #fff;
  border: 1px solid rgba(218, 220, 224, 0.8);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: rgba(218, 220, 224, 1);
    box-shadow: 0 4px 15px rgba(60, 64, 67, 0.15);
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    background: #f1f3f4;
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.googleIcon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.authFooter {
  text-align: center;
  margin-top: 3rem;
}

.authFooter p {
  font-size: 1.5rem;
  color: #b3b3b3;
  margin: 0;
  font-weight: 400;
}

.link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: $primary-color;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #fff;

    &::after {
      width: 100%;
    }
  }
}

@media (max-width: $breakpoint-small) {
  .authPage {
    padding: 1.5rem;
  }

  .authContainer {
    padding: 3.5rem 2.5rem;
    max-width: 100%;
  }
  
  .logoText {
    font-size: 2.8rem;
  }
  
  .title {
    font-size: 2.4rem;
  }

  .subtitle {
    font-size: 1.4rem;
  }

  .input {
    padding: 1.2rem 1.6rem;
    font-size: 1.5rem;
  }

  .submitBtn, .googleBtn {
    padding: 1.4rem 1.8rem;
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .authContainer {
    padding: 3rem 2rem;
  }

  .logoText {
    font-size: 2.4rem;
  }
  
  .title {
    font-size: 2.2rem;
  }
}
</style>
