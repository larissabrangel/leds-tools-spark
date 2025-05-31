import { createRouter, createWebHistory } from 'vue-router';
import AuthRoutes from './AuthRoutes';
import MainRoutes from './MainRoutes';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/authentication/Error.vue')
        },
        MainRoutes,
        AuthRoutes
    ]
});

// router.beforeEach(async (to, from, next) => {
//     // Verificação de login
//     const publicPages = ['/auth/login'];
//     const authRequired = !publicPages.includes(to.path);
//     const auth: any = useAuthStore();

//     if (to.matched.some((record) => record.meta.requiresAuth)) {
//         if (authRequired && !auth.user) {
//             auth.returnUrl = to.fullPath;
//             return next('/auth/login');
//         } else next();
//     } else {
//         next();
//     }
// });