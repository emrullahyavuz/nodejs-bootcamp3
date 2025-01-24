const fs = require("node:fs");

// Senkron dosya okuma
// const txtFile = fs.readFileSync("./file.txt", "utf-8");
// console.log(txtFile);
// console.log("sync");

// Asenkron dosya okuma
// fs.readFile("./file.txt", (err, data) => {
//   if (err) {
//     console.log("Dosya okunurken bir hata oluştu:", err);
//   } else {
//     console.log(data.toString());
//   }
// });
// console.log("async");

// Dosya içindeki yazıyı senkron değiştir
// fs.writeFileSync("./file.txt", "Hello World!");

// Dosya içindeki yazıyı asenkron değiştir
// fs.writeFile("./file.txt", "Emin Başbayan", (err) => {
//   if (err) {
//     console.log("Dosya yazdırılırken bir hata oluştu:", err);
//   } else {
//     console.log("Dosya başarıyla yazıldı!");
//   }
// });
// console.log("async");

fs.writeFile("./file2.txt", " - BilGen Yazılım Akademi", { flag: "a" }, (err) => {
  if (err) {
    console.log("Dosya yazdırılırken bir hata oluştu:", err);
  } else {
    console.log("Dosya başarıyla yazıldı!");
  }
});
