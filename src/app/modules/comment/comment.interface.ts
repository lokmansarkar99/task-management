import { Types } from "mongoose";

export interface IComment {
  content: string;
  task: Types.ObjectId;            
  author: Types.ObjectId;          
  parentComment: Types.ObjectId | null;
  likes: Types.ObjectId[];       
  isDeleted: boolean;
  editedAt?: Date | null;
}