import mongoose from 'mongoose';

const DraftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  store: {
    type: String,
    required: true,
  },
  vender: {
    type: String,
    default: '',
  },
  orderNo: {
    type: String,
    default: '',
  },
  engineer: {
    type: String,
    default: '',
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  userId: {
    type: String,
    default: 'default-user', // For simple single-user setup
  }
});

// Update the updatedAt timestamp before saving
DraftSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

export default mongoose.models.Draft || mongoose.model('Draft', DraftSchema);