import { ImageSourcePropType } from "react-native";

export const mockImages: ImageSourcePropType[] = [
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
  require("@/app/assets/images/png/test_image2.png"),
];

export interface GroupCardItem {
  id: string;
  title: string;
  status: "live" | "missed" | "none";
  timestamp: string;
  unreadCount?: number;
  isActive: boolean;
  participants: ImageSourcePropType[];
}

export const groupCardsData: GroupCardItem[] = [
  {
    id: "xoxo",
    title: "XOXO",
    status: "live",
    timestamp: "1s ago",
    isActive: true,
    participants: mockImages.slice(0, 4),
  },
  {
    id: "duo-chat",
    title: "Duo Chat",
    status: "missed",
    timestamp: "1h ago",
    unreadCount: 2,
    isActive: false,
    participants: mockImages.slice(0, 2),
  },
  {
    id: "akarsh",
    title: "Akarsh",
    status: "none",
    timestamp: "8h ago",
    unreadCount: 2,
    isActive: false,
    participants: [mockImages[0]],
  },
  {
    id: "squad",
    title: "Squad",
    status: "none",
    timestamp: "2h ago",
    isActive: false,
    participants: mockImages.slice(0, 4),
  },
  {
    id: "big-group",
    title: "Big Group",
    status: "missed",
    timestamp: "3h ago",
    unreadCount: 5,
    isActive: false,
    participants: mockImages,
  },
  {
    id: "trio",
    title: "Trio",
    status: "none",
    timestamp: "5h ago",
    isActive: false,
    participants: mockImages.slice(0, 3),
  },
  {
    id: "quad-squad",
    title: "Quad Squad",
    status: "none",
    timestamp: "6h ago",
    isActive: false,
    participants: mockImages.slice(0, 4),
  },
];
