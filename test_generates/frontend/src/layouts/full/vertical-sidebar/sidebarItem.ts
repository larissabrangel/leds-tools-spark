import {
  AlertCircleIcon,
  ApertureIcon,
  AppsIcon,
  BasketIcon,
  BorderAllIcon,
  BorderHorizontalIcon,
  BorderInnerIcon,
  BorderStyle2Icon,
  BorderTopIcon,
  BorderVerticalIcon,
  BoxAlignBottomIcon,
  BoxAlignLeftIcon,
  BoxIcon,
  BoxModelIcon,
  BrandCodesandboxIcon,
  BrandTablerIcon,
  CalendarIcon,
  CardboardsIcon,
  ChartArcsIcon,
  ChartAreaIcon,
  ChartBarIcon,
  ChartCandleIcon,
  ChartDonut3Icon,
  ChartDotsIcon,
  ChartLineIcon,
  ChartPieIcon,
  ChartRadarIcon,
  CircleDotIcon,
  ColumnsIcon,
  EditCircleIcon,
  EyeTableIcon,
  FileDotsIcon,
  FilesIcon,
  FileTextIcon,
  FilterIcon,
  JumpRopeIcon,
  LayoutGridIcon,
  LayoutKanbanIcon,
  LoginIcon,
  Message2Icon,
  PageBreakIcon,
  PhotoIcon,
  RotateIcon,
  RowInsertBottomIcon,
  ServerIcon,
  SettingsIcon,
  ShoppingCartIcon,
  SortAscendingIcon,
  UserCircleIcon,
  UserPlusIcon,
  ZoomCodeIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'SideBar' },

  {
    title: "Entidade1",
    icon: JumpRopeIcon,
    to: "/Entidade1/IndexEntidade1",
  },
  {
    title: "Entidade2",
    icon: JumpRopeIcon,
    to: "/Entidade2/IndexEntidade2",
  }
];

export default sidebarItem;