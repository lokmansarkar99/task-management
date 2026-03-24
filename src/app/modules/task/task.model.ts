import mongoose, { model } from "mongoose";
import { Model , Schema} from "mongoose";
import { ITask } from "./task.interface";
import { TASK_PRIORITY, TASK_STATUS } from "../../../enums/task";

export const taskSchema = new Schema<ITask>({
    title: { type: String, required: true},
    description: {type: String},
    status: {type: String, enum: Object.values(TASK_STATUS), default: TASK_STATUS.IN_PROGRESS},
    priority: {type: String, enum: Object.values(TASK_PRIORITY), default: TASK_PRIORITY.MEDIUM},
    tags: {type: [String], default: [""]}, 
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    createdBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    scheduledAt: {type: Date, default: Date.now},
    dueDate: {type: Date, default: Date.now},
    completedAt: {type: Date, default: null },
    viewCount: {type: Number, default: 0},
    isDeleted: {type: Boolean, default: false}

},

{timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
},
)

// Virtuals Fields

taskSchema.virtual("isOverdue").get(function() {
    if(!this.dueDate || this.status === TASK_STATUS.DONE) return false
    return this.dueDate < new Date ()
})

taskSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "task",
    count: true
})


// Pre Hooks

taskSchema.pre(("save"), function() {
    if(this.isModified("status") && this.status === TASK_STATUS.DONE) {
        this.completedAt = new Date()
        
    }
})


// Indexes

taskSchema.index({ createdBy: 1, status: 1})

taskSchema.index({ status: 1, priority: 1}, { partialFilterExpression: {isDeleted: false}})

taskSchema.index({title: "text", description: "text"})

taskSchema.index({tags: 1})



export const Task = model<ITask>("Task", taskSchema)