const mongoose = require("mongoose");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const secret = process.env.APP_SECRET

/**
 * TODO: add support unique user created names
 * to allow for easy linking
 * TODO: add support for user images to be included within a user profile object
 */
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: [true, 'This username is already taken.'],
      index: true,
      required: [true, "is required"],
      default: () => (`user${crypto.randomBytes(4).toString("hex")}`),
      match: [/^(?=[a-zA-Z0-9._]{4,30}$)(?!.*[_.]{2})[^_.].*[^_.]$/, "is invalid, it must be atleast four characters long with no special characters, only numbers and letters."],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
      required: [true, "is required"],
      match: [/\S+@\S+\.\S+/, "is invalid."]
    },
    lastLoginAt: Date,
    isEmailConfirmed: {
      type: Boolean,
      default: false
    },
    firstName: {
      type: String,
      lowercase: true,
    },
    lastName: {
      type: String,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    billingAddress: {
      type: Map,
      of: String
    },
    imageFile: {
      type: Map,
      of: String,
    },
    salt: String,
    hash: String,
    suspended: { type: Boolean, default: false },
    stripeExpressUserId: String,
    randomKey: { type: String, index: true },
    suspendedCreator: Boolean,
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { type: "mongoose-unique-validator", message: 'The {PATH} belongs to an existing account.' });

UserSchema.methods.setPassword = function(password) {
  // create a salt for the user
  this.salt = crypto.randomBytes(16).toString("hex");
  // create hash value
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.createRandomKey = function() {
  crypto.randomBytes(48, (err, buffer) => {
    this.randomKey = buffer.toString("hex");
  });
  return this.save().then(() => {
    return this.randomKey;
  });
};

UserSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.authSerialize = function() {
  return {
    id: this.id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    isEmailConfirmed: this.isEmailConfirmed,
    lastLoginAt: new Date(this.lastLoginAt).toUTCString(),
    username: this.username,
    imageFile: this.imageFile,
    hasConnectedToStripe: (this.stripeExpressUserId ? true : false),
  };
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);