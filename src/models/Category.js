const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
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
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Slug oluşturma middleware
categorySchema.pre("save", async function (next) {
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
      
      while (await mongoose.model("Category").findOne({ slug, _id: { $ne: this._id } })) {
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

// URL-friendly slug kullanarak kategori bulma için static method
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug });
};

module.exports = mongoose.model("Category", categorySchema);
