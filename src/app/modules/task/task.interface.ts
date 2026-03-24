import { Types } from "mongoose";
import { TASK_STATUS, TASK_PRIORITY } from "../../../enums/task";

export interface ITask  {
title: string,
description?: string,
status: TASK_STATUS,
priority: TASK_PRIORITY,
tags?: string[],
category?: Types.ObjectId,
createdBy:Types.ObjectId,
scheduledAt?:Date,
completedAt?:Date,
dueDate?:Date,
viewCount:number,
isDeleted: boolean
assignedTo?:Types.ObjectId

}