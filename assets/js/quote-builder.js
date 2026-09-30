(function() {
  "use strict";

  const quoteBuilder = document.querySelector('.quote-builder');
  const selectedServices = new Map();
  const quoteItems = quoteBuilder?.querySelector('[data-quote-items]');
  const quoteCount = quoteBuilder?.querySelector('[data-quote-count]');
  const quoteEmpty = quoteBuilder?.querySelector('[data-quote-empty]');
  const quoteTotalRow = quoteBuilder?.querySelector('[data-quote-total-row]');
  const quoteTotal = quoteBuilder?.querySelector('[data-quote-total]');
  const quoteSend = quoteBuilder?.querySelector('[data-quote-send]');
  const quoteClear = quoteBuilder?.querySelector('[data-quote-clear]');

  function formatRand(amount) {
    return `R${amount.toLocaleString('en-ZA')}`;
  }

  function renderQuote() {
    if (!quoteBuilder || !quoteItems || !quoteCount || !quoteEmpty || !quoteTotalRow || !quoteTotal || !quoteSend || !quoteClear) return;

    const services = Array.from(selectedServices.values());
    const total = services.reduce((sum, service) => sum + service.price, 0);
    quoteCount.textContent = String(services.length);
    quoteEmpty.hidden = services.length > 0;
    quoteTotalRow.hidden = services.length === 0;
    quoteClear.hidden = services.length === 0;
    quoteItems.replaceChildren();

    services.forEach((service) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      const price = document.createElement('strong');
      name.textContent = service.name;
      price.textContent = `${service.priceType === 'from' ? 'From ' : ''}${formatRand(service.price)}`;
      item.append(name, price);
      quoteItems.append(item);
    });

    const hasStartingPrice = services.some((service) => service.priceType === 'from');
    quoteTotal.textContent = `${hasStartingPrice ? 'From ' : ''}${formatRand(total)}`;
    quoteSend.setAttribute('aria-disabled', String(services.length === 0));

    const message = [
      'Hi SergeantX, I would like a quote for:',
      ...services.map((service) => `- ${service.name} (${service.priceType === 'from' ? 'from ' : ''}${formatRand(service.price)})`),
      `Estimated total: ${hasStartingPrice ? 'from ' : ''}${formatRand(total)}`,
      '',
      'Please confirm the final price and availability.'
    ].join('\n');
    quoteSend.href = services.length > 0
      ? `https://wa.me/27637055394?${new URLSearchParams({ text: message })}`
      : '#quote-builder';
  }

  document.querySelectorAll('[data-quote-service]').forEach((card) => {
    const price = Number(card.dataset.price);
    const priceType = card.dataset.priceType === 'from' ? 'from' : 'fixed';
    const serviceName = card.querySelector('.portfolio-info h4')?.textContent?.trim();
    const priceLabel = card.querySelector('.service-price');
    if (!Number.isSafeInteger(price) || price <= 0 || !serviceName || !priceLabel) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quote-service-toggle';
    button.setAttribute('aria-pressed', 'false');
    button.textContent = 'Add to quote';
    priceLabel.insertAdjacentElement('afterend', button);

    button.addEventListener('click', () => {
      const isAddingService = !selectedServices.has(card);
      if (selectedServices.has(card)) {
        selectedServices.delete(card);
        button.setAttribute('aria-pressed', 'false');
        button.textContent = 'Add to quote';
      } else {
        selectedServices.set(card, { name: serviceName, price, priceType });
        button.setAttribute('aria-pressed', 'true');
        button.textContent = 'Remove from quote';
      }
      renderQuote();
      if (isAddingService) {
        quoteBuilder?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  quoteClear?.addEventListener('click', () => {
    selectedServices.clear();
    document.querySelectorAll('.quote-service-toggle[aria-pressed="true"]').forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
      button.textContent = 'Add to quote';
    });
    renderQuote();
  });

  quoteSend?.addEventListener('click', (event) => {
    if (selectedServices.size === 0) event.preventDefault();
  });

  renderQuote();

  const contactForm = document.querySelector('.contact-whatsapp-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const message = [
      'Hi SergeantX, I have an enquiry.',
      `Name: ${formData.get('name')}`,
      `Email: ${formData.get('email')}`,
      formData.get('phone') ? `Phone: ${formData.get('phone')}` : '',
      `Subject: ${formData.get('subject')}`,
      '',
      String(formData.get('message'))
    ].filter(Boolean).join('\n');
    const whatsappUrl = `https://wa.me/27637055394?${new URLSearchParams({ text: message })}`;
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    if (whatsappWindow) {
      whatsappWindow.opener = null;
    } else {
      window.location.assign(whatsappUrl);
    }
  });
})();
