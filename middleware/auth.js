export default function ({ store, redirect }) {
  // If the user is not authenticated, redirect to sign in page
  if (!store.getters['auth/isAuthenticated']) {
    return redirect('/auth/signin')
  }
}
