const Layout = () => import("@/layout/index.vue");

export default {
  path: "/sign",
  name: "SignForward",
  component: Layout,
  redirect: "/sign/forward",
  meta: {
    icon: "ri/send-plane-line",
    title: "传签管理",
    rank: 10
  },
  children: [
    {
      path: "/sign/forward",
      name: "SignForwardPage",
      component: () => import("@/views/SignForward/index.vue"),
      meta: {
        title: "待传签列表",
        showLink: true
      }
    }
  ]
} satisfies RouteConfigsTable;
