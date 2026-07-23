/* HIGH PIE — checkout and local order submission */
window.HP_PAGE = function () {
  "use strict";

  var A = HP.art;
  var host = HP.$("[data-checkout]");
  var STATES = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
    ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
    ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
    ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
    ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
    ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
    ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
    ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
    ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
    ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
    ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
    ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
    ["WI", "Wisconsin"], ["WY", "Wyoming"], ["DC", "District of Columbia"]
  ];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function summaryLines() {
    return HP.cart.lines().map(function (line) {
      return '<div class="totals__row">' +
        '<span>' + esc(line.product.name) + ' × ' + line.qty + '</span>' +
        '<span>' + HP.money(line.variant.price * line.qty) + '</span>' +
      '</div>';
    }).join("");
  }

  function emptyState() {
    host.innerHTML = '<div class="empty wrap--narrow" style="margin-inline:auto">' +
      A.icon("cart") +
      '<h2>Your cart is empty</h2>' +
      '<p>Add a product before continuing to checkout.</p>' +
      '<a class="btn btn--forest" href="shop.html">Shop all products</a>' +
    '</div>';
  }

  function render() {
    if (!HP.cart.lines().length) return emptyState();

    var stateOptions = '<option value="">Select a state</option>' + STATES.map(function (state) {
      return '<option value="' + state[0] + '">' + state[1] + '</option>';
    }).join("");

    host.innerHTML = '<div class="checkout">' +
      '<form data-order-form novalidate>' +
        '<div class="panel">' +
          '<div class="panel__title"><span class="num">1</span>Contact</div>' +
          '<div class="field--half">' +
            '<div class="field"><label for="first-name">First name</label>' +
              '<input id="first-name" name="firstName" autocomplete="given-name" maxlength="60" required></div>' +
            '<div class="field"><label for="last-name">Last name</label>' +
              '<input id="last-name" name="lastName" autocomplete="family-name" maxlength="60" required></div>' +
          '</div>' +
          '<div class="field--half">' +
            '<div class="field"><label for="checkout-email">Email</label>' +
              '<input id="checkout-email" name="email" type="email" autocomplete="email" maxlength="120" required></div>' +
            '<div class="field"><label for="checkout-phone">Phone</label>' +
              '<input id="checkout-phone" name="phone" type="tel" autocomplete="tel" maxlength="30" required></div>' +
          '</div>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel__title"><span class="num">2</span>Delivery</div>' +
          '<div class="field"><label for="address">Street address</label>' +
            '<input id="address" name="address" autocomplete="street-address" maxlength="140" required></div>' +
          '<div class="field"><label for="address-2">Apartment, suite, etc. <span class="muted">(optional)</span></label>' +
            '<input id="address-2" name="address2" autocomplete="address-line2" maxlength="80"></div>' +
          '<div class="field--half">' +
            '<div class="field"><label for="city">City</label>' +
              '<input id="city" name="city" autocomplete="address-level2" maxlength="80" required></div>' +
            '<div class="field"><label for="state">State</label>' +
              '<select id="state" name="state" autocomplete="address-level1" required>' + stateOptions + '</select></div>' +
          '</div>' +
          '<div class="field--half">' +
            '<div class="field"><label for="zip">ZIP code</label>' +
              '<input id="zip" name="zip" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}(?:-[0-9]{4})?" maxlength="10" required></div>' +
            '<div class="field"><label for="notes">Delivery notes <span class="muted">(optional)</span></label>' +
              '<input id="notes" name="notes" maxlength="200"></div>' +
          '</div>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel__title"><span class="num">3</span>Payment & confirmation</div>' +
          '<p class="lede">After reviewing the order, High Pie follows up by email to confirm payment and delivery details.</p>' +
          '<label class="check mt-2"><input type="checkbox" name="ageConfirmed" required>' +
            '<span>I confirm that I am 21 or older.</span></label>' +
          '<label class="check mt-1"><input type="checkbox" name="termsAccepted" required>' +
            '<span>I agree to the <a class="link" href="policies.html">terms and policies</a>.</span></label>' +
          '<div class="note note--warn mt-2" data-order-error hidden></div>' +
          '<button class="btn btn--forest btn--lg btn--block mt-2" type="submit" data-submit-order>' +
            'Place order · ' + HP.money(HP.cart.total()) + '</button>' +
          '<p class="totals__note">No card information is entered on this page.</p>' +
        '</div>' +
      '</form>' +
      '<aside class="summary">' +
        '<div class="panel">' +
          '<div class="panel__title">Order summary</div>' +
          '<div class="totals">' +
            summaryLines() +
            '<div class="totals__row"><span>Subtotal</span><span>' + HP.money(HP.cart.subtotal()) + '</span></div>' +
            '<div class="totals__row"><span>Shipping</span><span>' +
              (HP.cart.shipping() === 0 ? "Free" : HP.money(HP.cart.shipping())) + '</span></div>' +
            '<div class="totals__row"><span>Estimated tax</span><span>' + HP.money(HP.cart.tax()) + '</span></div>' +
            '<div class="totals__row totals__row--grand"><span>Total</span><span>' +
              HP.money(HP.cart.total()) + '</span></div>' +
          '</div>' +
          HP.trustStrip(true) +
        '</div>' +
      '</aside>' +
    '</div>';

    HP.$("[data-order-form]", host).addEventListener("submit", submitOrder);
  }

  function value(form, name) {
    return String(form.elements[name].value || "").trim();
  }

  async function submitOrder(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var error = HP.$("[data-order-error]", host);
    var submit = HP.$("[data-submit-order]", host);

    if (!form.reportValidity()) return;

    var payload = {
      customer: {
        firstName: value(form, "firstName"),
        lastName: value(form, "lastName"),
        email: value(form, "email"),
        phone: value(form, "phone")
      },
      delivery: {
        address: value(form, "address"),
        address2: value(form, "address2"),
        city: value(form, "city"),
        state: value(form, "state"),
        zip: value(form, "zip"),
        notes: value(form, "notes")
      },
      ageConfirmed: form.elements.ageConfirmed.checked,
      termsAccepted: form.elements.termsAccepted.checked,
      items: HP.cart.items.map(function (line) {
        return { key: line.key, qty: line.qty };
      })
    };

    error.hidden = true;
    submit.disabled = true;
    submit.textContent = "Placing order…";

    try {
      var response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      var result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not place the order.");

      HP.cart.clear();
      document.querySelector("h1").textContent = "Thank you";
      host.innerHTML = '<div class="panel wrap--narrow" style="margin-inline:auto;text-align:center">' +
        '<div class="intent__mark" style="margin-inline:auto">' + A.icon("check") + '</div>' +
        '<span class="eyebrow">Order received</span>' +
        '<h2 style="margin-top:.65rem">We have your order</h2>' +
        '<p class="lede mt-1">Your order number is <strong>' + esc(result.orderId) + '</strong>. ' +
          'High Pie will use <strong>' + esc(payload.customer.email) +
          '</strong> to confirm payment and delivery details.</p>' +
        '<div class="totals mt-2">' +
          '<div class="totals__row totals__row--grand"><span>Order total</span><span>' +
          HP.money(result.total) + '</span></div>' +
        '</div>' +
        '<a class="btn btn--forest mt-2" href="shop.html">Continue shopping</a>' +
      '</div>';
    } catch (failure) {
      error.textContent = failure.message || "We could not place the order. Please try again.";
      error.hidden = false;
      submit.disabled = false;
      submit.textContent = "Place order · " + HP.money(HP.cart.total());
    }
  }

  render();
};
