const serverless = require("serverless-http");
const express = require("express");

const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const errorHandler = require("errorhandler");
const morgan = require("morgan");

const http = require("http");
const path = require("path");
const os = require("os");
const helmet = require("helmet");
const nocache = require("nocache");
// atlassian-connect-express also provides a middleware
const ace = require("atlassian-connect-express");

const hbs = require("express-hbs");

const routes = require("./routes");
const addServerSideRendering = require("./addServerSideRendering");

// Bootstrap Express and atlassian-connect-express
console.log("1");
const app = express();
console.log("2");
console.log(app.get("env"));
const addon = ace(app);

console.log("3");
// See config.json
const port = addon.config.port();
app.set("port", port);
console.log("4");

// Log requests, using an appropriate formatter by env
const devEnv = app.get("env") === "development";
console.log("5");
console.log("devEnv", devEnv);
console.log("6");
app.use(morgan(devEnv ? "dev" : "combined"));
console.log("7");

// Configure Handlebars
const viewsDir = path.join(__dirname, "views");
const handlebarsEngine = hbs.express4({ partialsDir: viewsDir });
app.engine("hbs", handlebarsEngine);
app.set("view engine", "hbs");
app.set("views", viewsDir);

// Configure jsx (jsx files should go in views/ and export the root component as the default export)
console.log("8");
addServerSideRendering(app, handlebarsEngine);

// Atlassian security policy requirements
// http://go.atlassian.com/security-requirements-for-cloud-apps
// HSTS must be enabled with a minimum age of at least one year
console.log("9");
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: false,
  })
);
app.use(
  helmet.referrerPolicy({
    policy: ["origin"],
  })
);
console.log("10");

// Include request parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Gzip responses when appropriate
app.use(compression());

console.log("11");
// Include atlassian-connect-express middleware
app.use(addon.middleware());

// Mount the static files directory
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

// Atlassian security policy requirements
// http://go.atlassian.com/security-requirements-for-cloud-apps
console.log("12");
app.use(nocache());

// Show nicer errors in dev mode
if (devEnv) app.use(errorHandler());

console.log("12");
// Wire up routes
routes(app, addon);

// Boot the HTTP server
console.log("12");
// http.createServer(app).listen(port, () => {
//   console.log("App server running at http://" + os.hostname() + ":" + port);

//   // Enables auto registration/de-registration of app into a host in dev mode
//   // if (devEnv) addon.register();
// });
module.exports.handler = serverless(app);
