/* HIGH PIE — full cart page */
window.HP_PAGE = function () {
  "use strict";

  var A = HP.art;
  var host = HP.$("[data-cart-page]");

  if (!HP.BRAND.commerceEnabled) {
    HP.cart.clear();
    host.innerHTML = '<div class="empty wrap--narrow" style="margin-inline:auto">' +
      A.icon("lock") +
      '<h2>Purchasing is coming soon</h2>' +
      '<p>You can browse the complete High Pie collection, but online orders are not being accepted yet.</p>' +
      '<a class="btn btn--forest" href="shop.html">Browse products</a>' +
    '</div>';
    return;
  }

  function render() {
    var lines = HP.cart.lines();
    if (!lines.length) {
      host.innerHTML = '<div class="empty wrap--narrow" style="margin-inline:auto">' +
        A.icon("cart") +
        '<h2>Your cart is empty</h2>' +
        '<p>Find your High Pie favorites and they will show up here.</p>' +
        '<a class="btn btn--forest" href="shop.html">Shop all products</a>' +
      '</div>';
      return;
    }

    host.innerHTML = '<div class="checkout">' +
      '<div class="panel">' +
        '<div class="panel__title">Your items</div>' +
        '<div data-cart-lines>' + lines.map(HP.lineMarkup).join("") + '</div>' +
        '<button class="line__remove mt-2" type="button" data-clear-cart>Clear cart</button>' +
      '</div>' +
      '<aside class="summary">' +
        '<div class="panel">' +
          '<div class="panel__title">Order summary</div>' +
          HP.shipMeter() +
          '<div class="totals mt-2">' +
            '<div class="totals__row"><span>Subtotal</span><span>' + HP.money(HP.cart.subtotal()) + '</span></div>' +
            '<div class="totals__row"><span>Shipping</span><span>' +
              (HP.cart.shipping() === 0 ? "Free" : HP.money(HP.cart.shipping())) + '</span></div>' +
            '<div class="totals__row"><span>Estimated tax</span><span>' + HP.money(HP.cart.tax()) + '</span></div>' +
            '<div class="totals__row totals__row--grand"><span>Total</span><span>' +
              HP.money(HP.cart.total()) + '</span></div>' +
          '</div>' +
          '<a class="btn btn--block btn--lg mt-2" href="checkout.html">Proceed to checkout</a>' +
          '<a class="btn btn--block btn--ghost btn--sm mt-1" href="shop.html">Continue shopping</a>' +
          '<p class="totals__note">Shipping and tax are confirmed during checkout.</p>' +
        '</div>' +
      '</aside>' +
    '</div>';
  }

  HP.bindLines(host, render);
  HP.cart.onChange(render);
  host.addEventListener("click", function (event) {
    if (!event.target.closest("[data-clear-cart]")) return;
    HP.cart.clear();
    HP.toast("Your cart is now empty.");
  });
  render();
};
