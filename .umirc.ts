import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/group-view/index.tsx' },
    { path: '/group-view', component: '@/pages/group-view/index.tsx' },
  ],
  fastRefresh: {},
});
