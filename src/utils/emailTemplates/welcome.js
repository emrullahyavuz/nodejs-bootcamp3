const welcomeEmailTemplate = (name) => {
  return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoş Geldiniz</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            border: 1px solid #e1e1e1;
            border-radius: 5px;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #4c7bf3;
            color: white;
            padding: 10px 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
            color: #666;
          }
          .button {
            display: inline-block;
            background-color: #4c7bf3;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hoş Geldiniz!</h1>
          </div>
          
          <p>Merhaba ${name},</p>
          
          <p>Platformumuza kayıt olduğunuz için teşekkür ederiz. Hesabınız başarıyla oluşturuldu ve artık tüm hizmetlerimizden yararlanabilirsiniz.</p>
          
          <p>Herhangi bir sorunuz veya öneriniz varsa, lütfen bizimle iletişime geçmekten çekinmeyin.</p>
          
          <p>Saygılarımızla,<br>Uygulama Ekibi</p>
          
          <a href="#" class="button">Hesabınızı Görüntüleyin</a>
          
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
            <p>&copy; ${new Date().getFullYear()} Uygulama Adı. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};

module.exports = welcomeEmailTemplate;
