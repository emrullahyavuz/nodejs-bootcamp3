const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }],
  },
  { timestamps: true }
);

// Kupon geçerli mi kontrol eden metot
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  // Tarih kontrolü
  if (now < this.startDate || now > this.endDate) {
    return { valid: false, message: "Kupon süresi dolmuş veya henüz başlamamış" };
  }
  
  // Aktif mi kontrolü
  if (!this.isActive) {
    return { valid: false, message: "Kupon aktif değil" };
  }
  
  // Kullanım limiti kontrolü
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { valid: false, message: "Kupon kullanım limiti dolmuş" };
  }
  
  return { valid: true, message: "Kupon geçerli" };
};

// İndirim hesaplama metodu
couponSchema.methods.calculateDiscount = function(totalAmount) {
  // Minimum alışveriş tutarı kontrolü
  if (totalAmount < this.minPurchase) {
    return { 
      valid: false, 
      discount: 0, 
      message: `Kupon için minimum ${this.minPurchase} TL alışveriş gerekli` 
    };
  }
  
  let discount = 0;
  
  // İndirim tipi kontrolü
  if (this.type === "percentage") {
    discount = (totalAmount * this.value) / 100;
    
    // Maksimum indirim kontrolü
    if (this.maxDiscount !== null && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else { // fixed
    discount = this.value;
    
    // İndirim tutarı toplam tutardan büyük olamaz
    if (discount > totalAmount) {
      discount = totalAmount;
    }
  }
  
  return { 
    valid: true, 
    discount, 
    message: "İndirim uygulandı" 
  };
};

module.exports = mongoose.model("Coupon", couponSchema); 