/**
 * API özellikleri sınıfı - Arama, filtreleme ve sayfalama işlemleri için yardımcı sınıf
 * @class ApiFeatures
 */
class ApiFeatures {
  /**
   * ApiFeatures sınıfı constructor'ı
   * @param {Object} query - MongoDB sorgu nesnesi
   * @param {Object} queryString - Express isteğinden gelen sorgu parametreleri
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Arama işlemi
   * @param {String} field - Arama yapılacak alan adı (varsayılan: name)
   * @returns {ApiFeatures} this - Zincirleme method kullanımı için
   */
  search(field = 'name') {
    const keyword = this.queryString.search
      ? {
          [field]: {
            $regex: this.queryString.search,
            $options: 'i', // Case-insensitive
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  /**
   * Filtreleme işlemi
   * @returns {ApiFeatures} this - Zincirleme method kullanımı için
   */
  filter() {
    // Filtrelenecek alanlar için sorgudan kopyalama yap
    const queryCopy = { ...this.queryString };
    
    // Sayfalama ve sıralama alanlarını filtreleme işleminden çıkar
    const excludedFields = ['page', 'sort', 'limit', 'search'];
    excludedFields.forEach((el) => delete queryCopy[el]);

    // Fiyat filtresi için özel işlem (minPrice, maxPrice)
    if (queryCopy.minPrice || queryCopy.maxPrice) {
      queryCopy.price = {};
      if (queryCopy.minPrice) queryCopy.price.$gte = parseFloat(queryCopy.minPrice);
      if (queryCopy.maxPrice) queryCopy.price.$lte = parseFloat(queryCopy.maxPrice);
      
      // Artık bunlara ihtiyacımız yok
      delete queryCopy.minPrice;
      delete queryCopy.maxPrice;
    }

    // Gelişmiş filtreleme özellikleri için MongoDB operatörlerini ekle
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sıralama işlemi
   * @returns {ApiFeatures} this - Zincirleme method kullanımı için
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Varsayılan sıralama
    }
    return this;
  }

  /**
   * Sayfalama işlemi
   * @returns {ApiFeatures} this - Zincirleme method kullanımı için
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Sayfalama için meta bilgileri oluşturur
   * @async
   * @param {Object} model - MongoDB model nesnesi
   * @returns {Object} Sayfalama meta bilgileri
   */
  async paginationInfo(model) {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    
    // Filtrelenmiş toplam kayıt sayısını bul
    // Önce arama ve filtreleme kriterlerini uygulayalım ama sayfalamayı uygulamayalım
    const tempQuery = this.query.model.find().merge(this.query);
    const countQuery = new this.query.model.Query().merge(tempQuery);
    // Skip ve limit'i temizle
    countQuery.options.skip = null;
    countQuery.options.limit = null;
    
    const total = await countQuery.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      page,
      limit,
      totalPages,
      total,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };
  }
}

module.exports = ApiFeatures; 