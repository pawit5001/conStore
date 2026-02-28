export default defineNuxtRouteMiddleware((to, from) => {
  // Allow access to login page (/) only
  if (to.path === '/' || to.path === '/login') return;

  // Use localStorage for session/role
  const user = process.client ? localStorage.getItem('user') : null;
  const role = process.client ? localStorage.getItem('role') : null;

  if (!user) {
    return navigateTo('/');
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