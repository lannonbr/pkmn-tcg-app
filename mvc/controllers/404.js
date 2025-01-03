module.exports = (router, app) => {
  router.route("*").all((req, res) => {
    const model = require("models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";
    model.content.pageTitle = "Not Found";
    model.server = require("models/server")(req, res);
    model.server.host = req.hostname;
    model.server.url = req.url;
    model.server.appVersion = app.get("package").version;
    res.status(404);
    res.render("404", model);
  });
};
