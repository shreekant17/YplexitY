import { SVGProps } from "react";
import User from "@/models/userSchema";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type User = {
  avatar: string;
  email: string;
  fname: string;
};

export type Post = {
  user: User;
  media: string;
  content: string;
  _id: string;
  likes: string[];
};

export type ChatType = {
  userId: string;
  fname: string;
  lname: string;
  avatar: string;
  email: string;
  latestMessage: { text: string; createdAt: string };
};

export interface SessionUser {
  id: string;
  fname?: string; // Other properties, if applicable
  lname?: string; // Other properties, if applicable
  email?: string; // Other properties, if applicable
  username?: string; // Other properties, if applicable
  avatar?: string;
  country?: string;
  jwtToken?: string; // Other properties, if applicable
}
export type UserSession = {
  id: string;
  fname?: string; // Other properties, if applicable
  lname?: string; // Other properties, if applicable
  email?: string; // Other properties, if applicable
  username?: string;
  avatar?: string;
  country?: string;
  jwtToken?: string; // Other properties, if applicable
};
