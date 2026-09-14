import { Schema, model, Types, type InferSchemaType } from "mongoose";

const evaluationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resumeFileName: { type: String, required: true },
  resumeText: { type: String, required: true },
  resumeStorageKey: { type: String, required: true },
  resumeMimeType: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  matchScore: { type: Number, required: true, min: 0, max: 100 },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  recommendations: { type: String, required: true },
  shareId: { type: String, index: true, unique: true, sparse: true },
  isShared: { type: Boolean, default: false },
  sharedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: -1 },
});

export type EvaluationDoc = InferSchemaType<typeof evaluationSchema> & {
  _id: Types.ObjectId;
};

export const Evaluation = model("Evaluation", evaluationSchema);
