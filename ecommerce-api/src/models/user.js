import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'customer', 'guest'],
  },
  avatar: {
    type: String,
    required: true,
    default: 'https://placehold.co/100x100.png',
  },
  phone: {
    type: String,
    required: true,
    maxlength: 10,
  },
   address: {  
    type: String,
    trim: true
  },
  city: {  
    type: String,
    trim: true
  },
  state: {  
    type: String,
    trim: true
  },
  postalCode: {  
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;