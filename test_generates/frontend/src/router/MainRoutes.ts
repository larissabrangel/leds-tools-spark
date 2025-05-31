const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
    {
    name: 'Index',
    path: '/',
    component: () => import('@/views/index.vue'),
    },

    {

        name: 'Entidade1',
        path: '/Entidade1/IndexEntidade1',
        component: () => import('@/views/Test/Entidade1/IndexEntidade1.vue'),
    },
    {
        name: 'DetalhesEntidade1',
        path: '/Entidade1/DetailsEntidade1/:id?',
        component: () => import('@/views/Test/Entidade1/DetailsEntidade1.vue'),
        props: true
    },
    {
        name: 'CadastroEntidade1',
        path: '/Entidade1/formEntidade1/:id?/:Entidade1?',
        component: () => import('@/views/Test/Entidade1/FormEntidade1.vue'),
    },
    {

        name: 'Entidade2',
        path: '/Entidade2/IndexEntidade2',
        component: () => import('@/views/Test/Entidade2/IndexEntidade2.vue'),
    },
    {
        name: 'DetalhesEntidade2',
        path: '/Entidade2/DetailsEntidade2/:id?',
        component: () => import('@/views/Test/Entidade2/DetailsEntidade2.vue'),
        props: true
    },
    {
        name: 'CadastroEntidade2',
        path: '/Entidade2/formEntidade2/:id?/:Entidade2?',
        component: () => import('@/views/Test/Entidade2/FormEntidade2.vue'),
    },
    ]
};

export default MainRoutes;