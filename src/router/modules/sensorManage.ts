export default {
  path: "/sensor-manage",
  redirect: "/sensor-manage/sensor-list",
  meta: {
    icon: "ri:sensor-line",
    title: "传感器管理",
    rank: 10
  },
  children: [
    {
      path: "/sensor-manage/sensor-list",
      name: "SensorManage",
      component: () => import("@/views/SensorManage/SensorListPage/index.vue"),
      meta: {
        title: "传感器列表"
      }
    }
    // 未来可以添加更多子菜单，例如：
    // {
    //   path: "/sensor-manage/sensor-monitor",
    //   name: "SensorMonitor",
    //   component: () => import("@/views/SensorManage/SensorMonitor/index.vue"),
    //   meta: {
    //     title: "传感器监控"
    //   }
    // }
  ]
} satisfies RouteConfigsTable;
