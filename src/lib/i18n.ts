export type Locale = "en" | "ru" | "it";

export const defaultLocale: Locale = "en";

export const getLocale = (value?: string | null): Locale =>
  value === "ru" ? "ru" : value === "it" ? "it" : "en";

export const getLocaleFromSearchParams = (
  searchParams?: { lang?: string | string[] | null }
): Locale => {
  if (!searchParams) return defaultLocale;
  const raw = Array.isArray(searchParams.lang)
    ? searchParams.lang[0]
    : searchParams.lang ?? null;
  return getLocale(raw);
};

export const getLocaleFromUrl = (url: URL): Locale =>
  getLocale(url.searchParams.get("lang"));

export const withLang = (href: string, locale: Locale) => {
  if (!href.startsWith("/")) return href;
  const url = new URL(href, "http://example.com");
  url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const translations = {
  en: {
    nav: {
      gallery: "Gallery",
      about: "About me",
      orderDelivery: "Order & Delivery",
    },
    language: {
      en: "EN",
      ru: "RU",
      it: "IT",
    },
    categories: {
      rings: "Rings",
      necklaces: "Necklaces",
      earrings: "Earrings",
      sets: "Sets",
    },
    collections: {
      herbarium: "Herbarium",
      folia: "Folia",
    },
    home: {
      title: "Handcrafted resin creations inspired by nature",
      newLabel: "New",
      newTitle: "Latest pieces",
      viewDetails: "View details",
    },
    gallery: {
      title: "Gallery",
      viewDetails: "View details",
    },
    product: {
      back: "← Back",
      materials: "Materials",
      price: "Price",
      requestWhatsapp: "Request via WhatsApp",
      requestInstagram: "Request via Instagram",
      buyNow: "Buy now — pay with card",
      buyLoading: "Redirecting to checkout...",
      buyError: "Could not start checkout. Please try again.",
    },
    order: {
      title: "Order & Delivery",
      subtitle: "We send jewelry anywhere in the world.",
      deliveryItaly: "Italy — delivery by Poste Italiane",
      deliveryItalyDays: "2–4 working days",
      deliveryEurope: "Europe — international delivery",
      deliveryEuropeDays: "3–7 working days",
      deliveryWorldwideStandard: "Worldwide shipping — Standard",
      deliveryWorldwideStandardDays: "5–12 working days",
      deliveryWorldwideExpress: "Worldwide shipping — Express",
      deliveryWorldwideExpressDays: "2–5 working days",
      orderCta: "To place an order, please message me:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "About me",
      paragraph1: "Hello! My name is Olga.",
      paragraph2:
        "I create my jewellery using epoxy resin. In every piece, I try to preserve tiny fragments of nature - those gifts the world offers for just a moment before they quietly fade away. Real flowers, delicate little branches and leaves, gathered at their most fragile moment, carefully dried and preserved like small secrets of nature.",
      paragraph3:
        "Flowers fade, moments dissolve into time… yet emotions and memories can remain, if we learn to hold them gently.",
      paragraph4:
        "My jewellery is made for dreamers, for those who are enchanted by the quiet beauty of nature and can see poetry in the smallest details.",
      paragraph5: "",
    },
    cta: {
      helperText: "To place an order, message me directly.",
      whatsapp: "Message on WhatsApp",
      telegram: "Message on Telegram",
      instagram: "Instagram",
    },
    messages: {
      order: "Hi! I want to order:",
    },
    orderSuccess: {
      title: "Thank you for your order!",
      subtitle: "Your payment was received. I will reach out shortly to confirm shipping details.",
      orderNumber: "Order reference",
      amount: "Amount paid",
      email: "Confirmation sent to",
      backHome: "Back to home",
      pendingTitle: "Payment is being processed",
      pendingSubtitle: "Your bank is still confirming the payment. You will receive an email as soon as it is complete.",
      notFoundTitle: "Order not found",
      notFoundSubtitle: "We could not find this checkout session. If you have already paid, please contact us.",
    },
    common: {
      instagram: "Instagram",
      whatsapp: "WhatsApp",
      close: "Close",
    },
    footer: {
      tagline: "Handcrafted resin creations inspired by nature",
      exploreTitle: "Explore",
      shopTitle: "Shop",
      contactTitle: "Get in touch",
      contactHint: "Write to me directly — usually I reply the same day.",
      rights: "All rights reserved.",
      madeIn: "Handmade in Italy",
    },
  },
  ru: {
    nav: {
      gallery: "Галерея",
      about: "Обо мне",
      orderDelivery: "Заказ и доставка",
    },
    language: {
      en: "EN",
      ru: "RU",
      it: "IT",
    },
    categories: {
      rings: "Кольца",
      necklaces: "Ожерелья",
      earrings: "Серьги",
      sets: "Наборы",
    },
    collections: {
      herbarium: "Herbarium",
      folia: "Folia",
    },
    home: {
      title: "Украшения ручной работы, вдохновленные природой",
      newLabel: "Новинки",
      newTitle: "Новые изделия",
      viewDetails: "Подробнее",
    },
    gallery: {
      title: "Галерея",
      viewDetails: "Подробнее",
    },
    product: {
      back: "← Назад",
      materials: "Материалы",
      price: "Цена",
      requestWhatsapp: "Запросить через WhatsApp",
      requestInstagram: "Запросить через Instagram",
      buyNow: "Купить — оплата картой",
      buyLoading: "Переходим к оплате...",
      buyError: "Не удалось открыть оплату. Попробуйте ещё раз.",
    },
    order: {
      title: "Заказ и доставка",
      subtitle: "Отправляем украшения по всему миру.",
      deliveryItaly: "Италия — доставка Poste Italiane",
      deliveryItalyDays: "2–4 рабочих дня",
      deliveryEurope: "Европа — международная доставка",
      deliveryEuropeDays: "3–7 рабочих дней",
      deliveryWorldwideStandard: "Мир — стандартная доставка",
      deliveryWorldwideStandardDays: "5–12 рабочих дней",
      deliveryWorldwideExpress: "Мир — экспресс-доставка",
      deliveryWorldwideExpressDays: "2–5 рабочих дней",
      orderCta: "Чтобы сделать заказ, напишите мне:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "Обо мне",
      paragraph1: "Привет! Меня зовут Ольга.",
      paragraph2:
        "Свои украшения я создаю вручную из ювелирной эпоксидной смолы.",
      paragraph3:
        "В каждом украшении я стараюсь сохранить то, что природа дарит нам лишь на короткое время. Внутри моих работ настоящие цветы, веточки и листья, высушенные и аккуратно сохраненные.",
      paragraph4:
        "Цветы увядают, моменты проходят, а чувства и воспоминания иногда хочется удержать чуть дольше, нести с собой и бережно хранить.",
      paragraph5:
        "Мои украшения — для всех романтиков, тех, кого притягивает красота природы и кто любит замечать детали в вещах.",
    },
    cta: {
      helperText: "Чтобы сделать заказ, напишите мне напрямую.",
      whatsapp: "Написать в WhatsApp",
      telegram: "Написать в Telegram",
      instagram: "Instagram",
    },
    messages: {
      order: "Здравствуйте! Хочу заказать:",
    },
    orderSuccess: {
      title: "Спасибо за заказ!",
      subtitle: "Оплата получена. Я свяжусь с вами в ближайшее время, чтобы уточнить детали доставки.",
      orderNumber: "Номер заказа",
      amount: "Оплачено",
      email: "Подтверждение отправлено на",
      backHome: "На главную",
      pendingTitle: "Платёж обрабатывается",
      pendingSubtitle: "Банк ещё подтверждает оплату. Вы получите письмо, как только всё пройдёт.",
      notFoundTitle: "Заказ не найден",
      notFoundSubtitle: "Не удалось найти эту сессию оплаты. Если вы уже оплатили — напишите нам.",
    },
    common: {
      instagram: "Instagram",
      whatsapp: "WhatsApp",
      close: "Закрыть",
    },
    footer: {
      tagline: "Украшения ручной работы, вдохновленные природой",
      exploreTitle: "Разделы",
      shopTitle: "Категории",
      contactTitle: "Связаться",
      contactHint: "Пишите напрямую — обычно отвечаю в тот же день.",
      rights: "Все права защищены.",
      madeIn: "Сделано вручную в Италии",
    },
  },
  it: {
    nav: {
      gallery: "Galleria",
      about: "Chi sono",
      orderDelivery: "Ordine e consegna",
    },
    language: {
      en: "EN",
      ru: "RU",
      it: "IT",
    },
    categories: {
      rings: "Anelli",
      necklaces: "Collane",
      earrings: "Orecchini",
      sets: "Set",
    },
    collections: {
      herbarium: "Herbarium",
      folia: "Folia",
    },
    home: {
      title: "Gioielli che racchiudono la bellezza della natura",
      newLabel: "Novita",
      newTitle: "Ultimi pezzi",
      viewDetails: "Vedi dettagli",
    },
    gallery: {
      title: "Galleria",
      viewDetails: "Vedi dettagli",
    },
    product: {
      back: "← Indietro",
      materials: "Materiali",
      price: "Prezzo",
      requestWhatsapp: "Richiedi su WhatsApp",
      requestInstagram: "Richiedi su Instagram",
      buyNow: "Acquista — paga con carta",
      buyLoading: "Reindirizzamento al pagamento...",
      buyError: "Impossibile avviare il pagamento. Riprova.",
    },
    order: {
      title: "Ordine e consegna",
      subtitle: "Spediamo gioielli in tutto il mondo.",
      deliveryItaly: "Italia — consegna con Poste Italiane",
      deliveryItalyDays: "2–4 giorni lavorativi",
      deliveryEurope: "Europa — spedizione internazionale",
      deliveryEuropeDays: "3–7 giorni lavorativi",
      deliveryWorldwideStandard: "Mondo — spedizione standard",
      deliveryWorldwideStandardDays: "5–12 giorni lavorativi",
      deliveryWorldwideExpress: "Mondo — spedizione express",
      deliveryWorldwideExpressDays: "2–5 giorni lavorativi",
      orderCta: "Per effettuare un ordine, scrivimi:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "Chi sono",
      paragraph1: "Ciao! Mi chiamo Olga.",
      paragraph2:
        "Creo gioielli fatti a mano in resina epossidica. In ogni creazione cerco di custodire piccoli frammenti di natura, quei doni che il mondo ci offre solo per un attimo e poi lascia svanire. Fiori veri, minuscoli rami e foglie raccolti nel loro momento più delicato, essiccati e conservati con cura, come piccoli segreti della natura.",
      paragraph3:
        "I fiori appassiscono, i momenti si dissolvono nel tempo… ma emozioni e ricordi possono restare, se impariamo a trattenerli con dolcezza.",
      paragraph4:
        "I miei gioielli nascono per i sognatori, per chi si lascia incantare dalla bellezza silenziosa della natura e sa vedere la poesia nei dettagli più piccoli.",
      paragraph5: "",
    },
    cta: {
      helperText: "Per effettuare un ordine, scrivimi direttamente.",
      whatsapp: "Scrivimi su WhatsApp",
      telegram: "Scrivimi su Telegram",
      instagram: "Instagram",
    },
    messages: {
      order: "Ciao! Vorrei ordinare:",
    },
    orderSuccess: {
      title: "Grazie per il tuo ordine!",
      subtitle: "Il pagamento è stato ricevuto. Ti contatterò a breve per confermare la spedizione.",
      orderNumber: "Riferimento ordine",
      amount: "Importo pagato",
      email: "Conferma inviata a",
      backHome: "Torna alla home",
      pendingTitle: "Pagamento in elaborazione",
      pendingSubtitle: "La tua banca sta confermando il pagamento. Riceverai un'email non appena sarà completo.",
      notFoundTitle: "Ordine non trovato",
      notFoundSubtitle: "Non abbiamo trovato questa sessione di pagamento. Se hai già pagato, contattaci.",
    },
    common: {
      instagram: "Instagram",
      whatsapp: "WhatsApp",
      close: "Chiudi",
    },
    footer: {
      tagline: "Creazioni artigianali in resina ispirate dalla natura",
      exploreTitle: "Esplora",
      shopTitle: "Categorie",
      contactTitle: "Contatti",
      contactHint: "Scrivimi direttamente — di solito rispondo in giornata.",
      rights: "Tutti i diritti riservati.",
      madeIn: "Fatto a mano in Italia",
    },
  },
} as const;

export const getTranslations = (locale: Locale) => translations[locale];
