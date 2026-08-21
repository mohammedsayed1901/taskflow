import type { Types } from 'mongoose';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface UserIdentity {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

export function toPublicUser(user: UserIdentity): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
