function routes(app, addon) {
  app.get("/", (req, res, next) => {
    return res.redirect("/atlassian-connect.json");
  });

  app.get("/audio", (req, res, next) => {
    return res.render("index.hbs", { title: "helo" });
  });

  app.use((req, res, next) => {
    return res.status(404).json({
      error: "Not Found",
    });
  });
}

module.exports = routes;
