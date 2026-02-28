export default defineNuxtRouteMiddleware((to, from) => {
  // Always allow access to /login
  if (to.path === '/login') return;

  const user = process.client ? localStorage.getItem('user') : null;
  const role = process.client ? localStorage.getItem('role') : null;

  // If not logged in, redirect to /login
  if (!user) {
    return navigateTo('/login');
  }

  // Prevent logged-in users from accessing / or /login
  if (user && (to.path === '/' || to.path === '/login')) {
    if (role === 'admin') return navigateTo('/admin-manager');
    if (role === 'staff') return navigateTo('/staff-manager');
  }

  // Staff cannot access admin pages
  if (role === 'staff' && to.path.startsWith('/admin')) {
    return navigateTo('/staff-manager');
  }
  // Admin cannot access staff pages
  if (role === 'admin' && to.path.startsWith('/staff')) {
    return navigateTo('/admin-manager');
  }
});