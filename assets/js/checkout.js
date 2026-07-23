/* HIGH PIE — purchasing hold */
window.HP_PAGE = function () {
  "use strict";

  var host = HP.$("[data-checkout]");
  HP.cart.clear();
  host.innerHTML = '<div class="empty wrap--narrow" style="margin-inline:auto">' +
    HP.art.icon("lock") +
    '<h2>Purchasing is coming soon</h2>' +
    '<p>Online orders are not being accepted yet. No order or payment information can be submitted.</p>' +
    '<a class="btn btn--forest" href="shop.html">Browse products</a>' +
  '</div>';
};
