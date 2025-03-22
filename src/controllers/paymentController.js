const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Iyzipay = require('iyzipay');
const Product = require('../models/Product');

// İyzipay yapılandırması
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY || '',
  secretKey: process.env.IYZIPAY_SECRET_KEY || '',
  uri: process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com'
});

/**
 * Stripe ödeme oturumu oluşturan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { productId } = req.body;

    // Ürünü veritabanından al
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı"
      });
    }

    // Stripe checkout session oluştur
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image ? [product.image] : [],
            },
            unit_amount: Math.round(product.price * 100), // Stripe kuruş cinsinden istiyor
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/products?canceled=true`,
      locale: 'tr', // Türkçe dil desteği
      metadata: {
        productId: product._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error("Stripe session oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ödeme oturumu oluşturulurken bir hata oluştu",
      error: error.message
    });
  }
};

/**
 * Stripe webhook işleyici fonksiyonu
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook hata:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Ödeme başarılı olduğunda
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Ürün ID'sini metadata'dan al
      const productId = session.metadata.productId;

      // Burada ödeme başarılı olduktan sonra yapılacak işlemleri ekleyebilirsiniz
      // Örneğin:
      // - Sipariş oluşturma
      // - Stok güncelleme
      // - Kullanıcıya bildirim gönderme
      // - Fatura oluşturma
      
      console.log('Ödeme başarılı:', session);
    } catch (error) {
      console.error('Ödeme sonrası işlem hatası:', error);
      return res.status(500).json({ success: false, message: 'Ödeme sonrası işlem hatası' });
    }
  }

  res.status(200).json({ success: true, message: 'Webhook alındı' });
};

/**
 * İyzico ödeme formu başlatan fonksiyon
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi
 */
const createIyzicoPayment = async (req, res) => {
  try {
    const { productId } = req.body;

    // Ürünü veritabanından al
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı"
      });
    }

    // Benzersiz bir ödeme referans kodu oluştur
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // İyzico ödeme isteği oluştur
    const request = {
      locale: 'tr',
      conversationId: conversationId,
      price: product.price.toString(),
      paidPrice: product.price.toString(),
      currency: 'TRY',
      basketId: `basket_${Date.now()}`,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${req.protocol}://${req.get('host')}/api/payments/iyzico-callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: 'BY789',
        name: 'John',
        surname: 'Doe',
        gsmNumber: '+905350000000',
        email: 'email@email.com',
        identityNumber: '74300864791',
        lastLoginDate: '2015-10-05 12:43:35',
        registrationDate: '2013-04-21 15:12:09',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: req.ip,
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34742'
      },
      billingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34742'
      },
      basketItems: [
        {
          id: product._id.toString(),
          name: product.name,
          category1: 'Ürünler',
          itemType: 'PHYSICAL',
          price: product.price.toString()
        }
      ]
    };

    // İyzico ödeme formu oluştur
    iyzipay.checkoutFormInitialize.create(request, function (err, result) {
      if (err) {
        console.error('İyzico form oluşturma hatası:', err);
        return res.status(500).json({
          success: false,
          message: "Ödeme formu oluşturulurken bir hata oluştu",
          error: err.message
        });
      }

      // Başarılı ise form içeriğini ve paymentPageUrl'i gönder
      if (result.status === 'success') {
        res.status(200).json({
          success: true,
          paymentPageUrl: result.paymentPageUrl,
          token: result.token
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Ödeme formu oluşturulamadı",
          error: result.errorMessage
        });
      }
    });
  } catch (error) {
    console.error("İyzico ödeme başlatma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ödeme başlatılırken bir hata oluştu",
      error: error.message
    });
  }
};

/**
 * İyzico ödeme sonucu callback fonksiyonu
 * @param {Object} req - Express istek nesnesi
 * @param {Object} res - Express yanıt nesnesi
 */
const handleIyzicoCallback = async (req, res) => {
  try {
    const token = req.body.token;

    iyzipay.checkoutForm.retrieve({
      locale: 'tr',
      conversationId: `conv_${Date.now()}`,
      token: token
    }, function (err, result) {
      if (err) {
        console.error('İyzico callback hatası:', err);
        return res.redirect('/products?error=payment_failed');
      }

      // Ödeme durumunu kontrol et
      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        // Başarılı ödeme
        return res.redirect(`/success?payment_method=iyzico&conversation_id=${result.conversationId}`);
      } else {
        // Başarısız ödeme
        return res.redirect('/products?error=payment_failed');
      }
    });
  } catch (error) {
    console.error("İyzico callback hatası:", error);
    res.redirect('/products?error=payment_failed');
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  createIyzicoPayment,
  handleIyzicoCallback
}; 