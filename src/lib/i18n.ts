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
      title: "Handcrafted resin creations\ninspired by nature",
      collectionsLabel: "Collections",
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
      buyNow: "Buy now",
      buyLoading: "Redirecting to checkout...",
      buyError: "Could not start checkout. Please try again.",
      priceCurrencyNote:
        "Prices are shown in EUR. At checkout you can pay in your local currency.",
      jewelryCare: {
        link: "Jewelry care",
        title: "Epoxy resin jewelry care",
        tips: [
          "Try not to drop the jewelry.",
          "Avoid getting perfume or eau de toilette on the jewelry.",
          "Remove before showering or swimming.",
          "Store the jewelry away from direct sunlight.",
        ],
      },
    },
    order: {
      title: "Order & Delivery",
      deliveryItaly: "Italy — delivery by Poste Italiane",
      deliveryItalyDays: "2–4 working days",
      deliveryEurope: "Europe — international delivery",
      deliveryEuropeDays: "3–7 working days",
      deliveryWorldwideStandard: "Worldwide shipping — Standard",
      deliveryWorldwideStandardDays: "5–12 working days",
      deliveryWorldwideExpress: "Worldwide shipping — Express",
      deliveryWorldwideExpressDays: "2–5 working days",
      orderCta: "If you need additional information, write to me:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "About me",
      paragraphs: [
        "Hello! My name is Olga.",
        "My workshop is called Pod Lopuhom, which gently translates to Under a Forest Leaf.",
        "This name was inspired by a sweet fairy tale about a tiny forest gnome who lives happily beneath a giant leaf. For me, that image is pure magic - a quiet, secret corner of the woods where little miracles are born.",
        "I craft my jewelry by hand and in every piece I try to preserve tiny fragments of nature - those gifts the world offers for just a moment before they quietly fade away.",
        "Real flowers, tiny twigs, and minuscule leaves, carefully gathered and dried, I preserve them in epoxy resin, as if they were nature's little secrets.",
        "Flowers fade, moments dissolve into time… yet emotions and memories can remain, if we learn to hold them gently.",
        "My jewelry is made for dreamers, for those who are enchanted by the quiet beauty of nature and can see poetry in the smallest details.",
      ],
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
      sets: "Комплекты",
    },
    collections: {
      herbarium: "Herbarium",
      folia: "Folia",
    },
    home: {
      title: "Украшения ручной работы,\nвдохновленные природой",
      collectionsLabel: "Коллекции",
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
      buyNow: "Купить",
      buyLoading: "Переходим к оплате...",
      buyError: "Не удалось открыть оплату. Попробуйте ещё раз.",
      priceCurrencyNote:
        "Цены указаны в евро. При оплате можно выбрать вашу локальную валюту.",
      jewelryCare: {
        link: "Уход за украшениями",
        title: "Уход за украшениями из эпоксидной смолы",
        tips: [
          "Старайтесь не ронять украшение.",
          "Следите, чтобы на украшение не попадали духи или туалетная вода.",
          "Снимайте перед душем или плаванием.",
          "Храните украшение в месте, недоступном для прямых солнечных лучей.",
        ],
      },
    },
    order: {
      title: "Заказ и доставка",
      deliveryItaly: "Италия — доставка Poste Italiane",
      deliveryItalyDays: "2–4 рабочих дня",
      deliveryEurope: "Европа — международная доставка",
      deliveryEuropeDays: "3–7 рабочих дней",
      deliveryWorldwideStandard: "Мир — стандартная доставка",
      deliveryWorldwideStandardDays: "5–12 рабочих дней",
      deliveryWorldwideExpress: "Мир — экспресс-доставка",
      deliveryWorldwideExpressDays: "2–5 рабочих дней",
      orderCta: "Если вам нужна дополнительная информация, пишите мне:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "Обо мне",
      paragraphs: [
        "Привет! Меня зовут Ольга.",
        "Название моей мастерской Pod Lopuhom вдохновлено детской сказкой о маленьком лесном гноме, живущем в лесу под большим листом. Для меня этот образ символизирует тихий уголок природы, где рождаются маленькие чудеса.",
        "Свои украшения я создаю вручную и стараюсь сохранить то, что природа дарит нам лишь на короткое время.",
        "Настоящие цветы, веточки и листья, собранные и аккуратно высушенные, я бережно сохраняю в ювелирной эпоксидной смоле, словно маленькие секреты природы.",
        "Цветы увядают, моменты проходят, а чувства и воспоминания иногда хочется удержать чуть дольше, нести с собой и бережно хранить.",
        "Мои украшения для всех романтиков, тех, кого притягивает красота природы и кто любит замечать детали.",
      ],
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
      rights: "Все права защищены.",
      madeIn: "Сделано вручную в Италии",
    },
  },
  it: {
    nav: {
      gallery: "Galleria",
      about: "Chi sono",
      orderDelivery: "Ordine e Spedizione",
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
      title: "Gioielli che custodiscono\nla bellezza della natura",
      collectionsLabel: "Collezioni",
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
      buyNow: "Acquista",
      buyLoading: "Reindirizzamento al pagamento...",
      buyError: "Impossibile avviare il pagamento. Riprova.",
      priceCurrencyNote:
        "I prezzi sono in EUR. Al pagamento puoi usare la tua valuta locale.",
      jewelryCare: {
        link: "Cura dei gioielli",
        title: "Cura dei gioielli in resina epossidica",
        tips: [
          "Cercate di non far cadere il gioiello.",
          "Assicuratevi che profumi o acqua di colonia non finiscano sul gioiello.",
          "Toglietelo prima della doccia o del nuoto.",
          "Conservatelo in un luogo lontano dalla luce diretta del sole.",
        ],
      },
    },
    order: {
      title: "Ordine e Spedizione",
      deliveryItaly: "Italia — consegna con Poste Italiane",
      deliveryItalyDays: "2–4 giorni lavorativi",
      deliveryEurope: "Europa — spedizione internazionale",
      deliveryEuropeDays: "3–7 giorni lavorativi",
      deliveryWorldwideStandard: "Mondo — spedizione standard",
      deliveryWorldwideStandardDays: "5–12 giorni lavorativi",
      deliveryWorldwideExpress: "Mondo — spedizione express",
      deliveryWorldwideExpressDays: "2–5 giorni lavorativi",
      orderCta: "Se avete bisogno di ulteriori informazioni, scrivetemi:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "Chi sono",
      paragraphs: [
        "Ciao! Mi chiamo Olga.",
        "Il nome del mio laboratorio “Pod Lopuhom” trae ispirazione da una fiaba per bambini che racconta di un piccolo gnomo che vive nel bosco, sotto una grande foglia. Per me questa immagine simboleggia un angolo tranquillo della natura, dove nascono piccoli miracoli.",
        "Realizzo i miei gioielli a mano e in ogni creazione cerco di custodire piccoli frammenti di natura: quei doni che il mondo ci offre per un breve momento e che il tempo poi porta via.",
        "Fiori veri, rametti e foglioline minuscoli, raccolti e essiccati con cura, li conservo nella resina epossidica, come se fossero piccoli segreti della natura.",
        "I fiori appassiscono, i momenti svaniscono nel tempo… ma emozioni e ricordi possono restare, se impariamo a custodirli con dolcezza.",
        "I miei gioielli nascono per i sognatori, per chi si lascia incantare dalla bellezza silenziosa della natura e sa vedere la poesia nei dettagli più piccoli.",
      ],
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
      tagline: "Creazioni artigianali in resina ispirate alla natura",
      exploreTitle: "Esplora",
      shopTitle: "Categorie",
      contactTitle: "Contatti",
      rights: "Tutti i diritti riservati.",
      madeIn: "Fatto a mano in Italia",
    },
  },
} as const;

export const getTranslations = (locale: Locale) => translations[locale];
