export interface Profile {
  id: string;
  uid: string;
  nickname: string;
  profile_image_url: string | null;
  background_image_url: string | null;
  bio: string | null;
  main_car_id: string | null;
  points: number;
  role: "user" | "moderator" | "admin";
  created_at: string;
}

export interface Vote {
  id: string;
  title: string;
  description: string | null;
  category: "brand" | "model" | "trim" | "option" | "design" | "lifestyle";
  option_a: string;
  option_b: string;
  option_a_image_url: string | null;
  option_b_image_url: string | null;
  brand: string | null;
  model: string | null;
  reward_points: number;
  votes_a: number;
  votes_b: number;
  is_active: boolean;
}

export interface UserCar {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  trim: string | null;
  year: number;
  mileage: number;
  fuel_type: string | null;
  purchase_price: number | null;
  accident_status: string;
  is_main: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  region: string | null;
  member_count: number;
}

export interface DriveCourse {
  id: string;
  title: string;
  region: string | null;
  theme: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  difficulty: string | null;
  rating: number;
}

export interface PartnerLink {
  id: string;
  name: string;
  partner_type: "nowcar" | "oilnice" | "ads" | "external";
  url: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  item_type: "profile_frame" | "profile_background" | "car_card_skin" | "nickname_effect" | "emote";
  image_url: string | null;
  price_points: number;
  rarity: string;
  is_limited: boolean;
}

export interface DriveCourseDetail extends DriveCourse {
  description: string | null;
  recommended_car_type: string | null;
  image_url: string | null;
  map_url: string | null;
}

export const ITEM_TYPE_LABEL: Record<ShopItem["item_type"], string> = {
  profile_frame: "프로필 프레임",
  profile_background: "프로필 배경",
  car_card_skin: "차량 카드",
  nickname_effect: "닉네임 효과",
  emote: "이모티콘",
};

export const RARITY_COLOR: Record<string, string> = {
  normal: "#8b95a1",
  rare: "#3182f6",
  epic: "#8b5cf6",
};

export const VOTE_CATEGORY_LABEL: Record<Vote["category"], string> = {
  brand: "제조사",
  model: "모델",
  trim: "트림",
  option: "옵션",
  design: "디자인",
  lifestyle: "라이프스타일",
};
