const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

// Slug oluşturma middleware
productSchema.pre("save", async function (next) {
  try {
    if (this.isModified("name")) {
      // Slug options
      const slugOptions = {
        lower: true,        // Küçük harfe çevir
        strict: true,       // Özel karakterleri kaldır
        trim: true,         // Başındaki ve sonundaki boşlukları temizle
        locale: 'tr'        // Türkçe karakter desteği
      };

      // Base slug oluştur
      let baseSlug = slugify(this.name, slugOptions);
      
      // Eğer aynı slug'dan varsa, sonuna numara ekle
      let slug = baseSlug;
      let counter = 1;
      
      while (await mongoose.model("Product").findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = slug;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// URL-friendly slug kullanarak ürün bulma için static method
productSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug }).populate('category');
};

module.exports = mongoose.model("Product", productSchema);
