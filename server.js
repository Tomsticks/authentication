require("dotenv").config();
const mongooes = require("mongoose");
const app = require("./app");

if (process.env.NODE_ENV === "development") {
}

// console.log(process.env.NODE_ENV);
const PORT = process.env.PORT || 5000;
mongooes
  .connect("mongodb+srv://tscript:mira247a@tomzor.axomd8j.mongodb.net/authtest")
  .then(() => {
    console.log("database Connected");
  })
  .catch((err) => {
    console.log("Check Your Internet Connectivity ");
  });

app.listen(PORT, () => {
  console.log(`app lsitening on Port ${PORT}`);
});
