module.exports = (router, app) => {
  router.route("/").get((req, res) => {
    let model = require("models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";
    model = require("models/homepage")(model);
    model.content.pageTitle = "Homepage";
    res.render("homepage", model);
  });
};
