import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
},{ timestamps: true } );

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;