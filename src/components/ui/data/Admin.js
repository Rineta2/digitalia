import {
  FolderKanban,
  Users,
  ArrowRightLeft,
  Library,
  LayoutDashboard,
  Newspaper,
  Mail,
  Home,
  Settings,
} from "lucide-react";

export const navbar = [
  {
    id: 1,
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={32} />,
  },

  {
    id: 2,
    name: "News Product",
    icon: <FolderKanban size={32} />,
    submenu: [
      {
        id: 1,
        name: "News Product",
        path: "/admin/dashboard/news-product",
      },

      {
        id: 2,
        name: "Category",
        path: "/admin/dashboard/news-product/category",
      },

      {
        id: 3,
        name: "Type",
        path: "/admin/dashboard/news-product/type",
      },

      {
        id: 4,
        name: "Tags",
        path: "/admin/dashboard/news-product/tags",
      },
    ],
  },

  {
    id: 3,
    name: "User",
    icon: <Users size={32} />,
    submenu: [
      {
        id: 1,
        name: "User",
        path: "/admin/dashboard/user",
      },

      {
        id: 2,
        name: "Role",
        path: "/admin/dashboard/user/role",
      },

      {
        id: 3,
        name: "Permission",
        path: "/admin/dashboard/user/permission",
      },
    ],
  },

  {
    id: 4,
    name: "Transaction",
    icon: <ArrowRightLeft size={32} />,
    submenu: [
      {
        id: 1,
        name: "Transaksi",
        path: "/admin/dashboard/transaction/transaksi",
      },

      {
        id: 2,
        name: "Rating",
        path: "/admin/dashboard/transaction/rating",
      },

      {
        id: 3,
        name: "Transaction Detail",
        path: "/admin/dashboard/transaction/detail",
      },

      {
        id: 4,
        name: "Transaction History",
        path: "/admin/dashboard/transaction/history",
      },
    ],
  },

  {
    id: 5,
    name: "Rekapulasi",
    icon: <Library size={32} />,
    path: "/admin/dashboard/rekapulasi",
  },

  {
    id: 6,
    name: "Article",
    icon: <Newspaper size={32} />,
    submenu: [
      {
        id: 1,
        name: "Article",
        path: "/admin/dashboard/article",
      },

      {
        id: 2,
        name: "Category",
        path: "/admin/dashboard/article/category",
      },

      {
        id: 3,
        name: "Tag",
        path: "/admin/dashboard/article/tag",
      },

      {
        id: 4,
        name: "Author",
        path: "/admin/dashboard/article/author",
      },
    ],
  },

  {
    id: 7,
    name: "Contact",
    icon: <Mail size={32} />,
    path: "/admin/dashboard/contact",
  },

  {
    id: 8,
    name: "Settings",
    icon: <Settings size={32} />,
    path: "/admin/dashboard/settings",
  },

  {
    id: 9,
    name: "Homepage",
    icon: <Home size={32} />,
    path: "/",
  },
];
