let production = require("./production");
let price = require("./price");
let consumption = require("./consumption");
import StickyNavigation from './nav';

production.render();
price.render();
consumption.render();
new StickyNavigation();
