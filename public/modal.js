(() => {
  const cards = Array.from(document.querySelectorAll("[data-product-card]"));
  const modal = document.querySelector("[data-modal]");
  const backdrop = document.querySelector("[data-modal-backdrop]");
  const closeButton = document.querySelector("[data-modal-close]");
  const titleEl = document.querySelector("[data-modal-title]");
  const priceEl = document.querySelector("[data-modal-price]");
  const materialsEl = document.querySelector("[data-modal-materials]");
  const descEl = document.querySelector("[data-modal-description]");
  const imageEl = document.querySelector("[data-modal-image]");
  const whatsappEl = document.querySelector("[data-modal-whatsapp]");

  if (!modal || !backdrop || !closeButton) {
    return;
  }

  const openModal = (card) => {
    const title = card.dataset.title || "";
    const price = card.dataset.price || "";
    const materials = card.dataset.materials || "";
    const description = card.dataset.description || "";
    const image = card.dataset.image || "";

    if (titleEl) titleEl.textContent = title;
    if (priceEl) priceEl.textContent = price;
    if (materialsEl) materialsEl.textContent = materials;
    if (descEl) descEl.textContent = description;
    if (imageEl) {
      imageEl.src = image;
      imageEl.alt = title;
    }
    if (whatsappEl) {
      const message = encodeURIComponent(`Hi! I'd like to order: ${title}`);
      whatsappEl.href = `https://wa.me/393245643379?text=${message}`;
    }

    modal.classList.add("is-open");
    backdrop.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    backdrop.setAttribute("aria-hidden", "false");
    closeButton.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    backdrop.setAttribute("aria-hidden", "true");
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  closeButton.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
})();
