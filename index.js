const fs = require("node:fs").promises;

// async - await ile fs module
/* async function readFile() {
  try {
    const data = await fs.readFile("./file.txt", "utf-8");
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

readFile();
 */

// then - catch

fs.readFile("./file.txtt", "utf-8")
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
