import { model, Schema } from "mongoose";
import { ICategory } from "./category.interface";
import mongoose from "mongoose";

export const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    color: { type: String, default: "#6366f1" },

    icon: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre("validate", async function () {
  if (this.name) {
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // exclude current doc (important for update)
    while (
      await mongoose.models.Category.findOne({
        slug,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});


categorySchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as any;

  
  const newName = update.name || (update.$set && update.$set.name);

  if (newName) {
    const baseSlug = newName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

  
    const currentId = this.getQuery()._id;

  
    while (
      await mongoose.models.Category.findOne({
        slug,
        _id: { $ne: currentId } 
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

   
    if (update.$set) {
      update.$set.slug = slug;
    } else {
      update.slug = slug;
    }
    
    this.setUpdate(update);
  }
});
//  POST HOOK
categorySchema.post("save", function (doc) {
  console.log(`Category cache invalidated: ${doc.slug}`);
});


//  INDEXES
categorySchema.index({ slug: 1 }, { unique: true });


categorySchema.index({ name: 1 }, { unique: true });

categorySchema.index({ isActive: 1 });


//  CREATE MODEL AFTER EVERYTHING
export const Category = model<ICategory>("Category", categorySchema);