<template>
  <div :class="$style.authPage">
    <div :class="$style.authContainer">
      <div :class="$style.authHeader">
        <nuxt-link :to="{ name: 'index' }" :class="$style.logo">
          <span :class="$style.logoText">Streamly</span>
        </nuxt-link>
        <h1 :class="$style.title">Sign In</h1>
        <p :class="$style.subtitle">Welcome back to Streamly</p>
      </div>

      <form :class="$style.authForm" @submit.prevent="handleSignIn">
        <div v-if="error" :class="$style.errorMessage">
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
            required>
        </div>

        <div :class="$style.formGroup">
          <label for="password" :class="$style.label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :class="$style.input"
            placeholder="Enter your password"
            required>
        </div>

        <button
          type="submit"
          :class="$style.submitBtn"
          :disabled="loading">
          <span v-if="loading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

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
    ...mapActions('auth', ['signIn']),

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
  max-width: 40rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4rem;
}

.authHeader {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  display: inline-block;
  text-decoration: none;
  outline: 0;
  margin-bottom: 2rem;
}

.logoText {
  font-size: 3.2rem;
  font-weight: 700;
  color: $primary-color;
  text-transform: uppercase;
  letter-spacing: -0.05em;
}

.title {
  font-size: 2.8rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.8rem;
}

.subtitle {
  font-size: 1.6rem;
  color: #b3b3b3;
  margin: 0;
}

.authForm {
  margin-bottom: 3rem;
}

.errorMessage {
  padding: 1.2rem;
  margin-bottom: 2rem;
  background: rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.3);
  border-radius: 4px;
  color: $primary-color;
  font-size: 1.4rem;
}

.formGroup {
  margin-bottom: 2rem;
}

.label {
  display: block;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.8rem;
}

.input {
  width: 100%;
  padding: 1.2rem 1.6rem;
  font-size: 1.6rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  outline: 0;
  transition: all 0.3s ease;

  &:focus {
    border-color: $primary-color;
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: #999;
  }
}

.submitBtn {
  width: 100%;
  padding: 1.4rem 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, $primary-color 0%, #B81D13 100%);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: 0;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #B81D13 0%, #8B1538 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(229, 9, 20, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.authFooter {
  text-align: center;
}

.authFooter p {
  font-size: 1.4rem;
  color: #b3b3b3;
  margin: 0;
}

.link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #fff;
  }
}

@media (max-width: $breakpoint-small) {
  .authContainer {
    padding: 3rem 2rem;
  }
  
  .logoText {
    font-size: 2.8rem;
  }
  
  .title {
    font-size: 2.4rem;
  }
}
</style>
