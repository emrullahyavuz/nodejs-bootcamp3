function hello(name) {
  console.log(`Hello, ${name}`);
}

function helloName(helloFn) {
  const name = "Emin";
  helloFn(name);
}

helloName(hello);

console.log([1, 2, 3, 4].filter((item) => item > 2));

