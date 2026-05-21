import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['New Lead', 'Interested', 'Payment Pending', 'Closed'],
    default: 'New Lead'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  followUpDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lead must belong to a user']
  }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
