export type Locale = "en" | "ru";

export const defaultLocale: Locale = "en";

export const getLocale = (value?: string | null): Locale =>
  value === "ru" ? "ru" : "en";

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
      about: "About",
      orderDelivery: "Order & Delivery",
    },
    language: {
      en: "EN",
      ru: "RU",
    },
    categories: {
      all: "All",
      rings: "Rings",
      necklaces: "Necklaces",
      earrings: "Earrings",
      sets: "Sets",
    },
    home: {
      title: "Welcome to my creation!",
      subtitle: "Choose the piece you like and feel free to message me.",
      newLabel: "New",
      newTitle: "Latest pieces",
      viewDetails: "View details",
    },
    gallery: {
      title: "Gallery",
      viewDetails: "View details",
    },
    product: {
      back: "← Back to gallery",
      materials: "Materials",
      price: "Price",
      requestWhatsapp: "Request via WhatsApp",
      requestInstagram: "Request via Instagram",
    },
    order: {
      title: "Order & Delivery",
      subtitle: "We send jewelry anywhere in the world.",
      deliveryIsrael: "Delivery within Israel by Israel Post",
      deliveryHaifa: "Self-pickup and delivery within Haifa directly to your door",
      deliveryWorldwide: "Worldwide delivery",
      free: "Free",
      orderCta: "To place an order, please message us:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "About",
      paragraph1:
        "Hello! I'm Olga. I am a handmade jewelry artist, working with jewelry epoxy resin.",
      paragraph2:
        "In each piece, I try to preserve what nature gives us only for a short while. Inside my work are real flowers, small branches, and leaves — carefully dried and thoughtfully saved.",
      paragraph3:
        "Flowers fade, moments pass, and yet sometimes we want to hold on to feelings and memories just a little longer, to carry them with us and keep them close.",
      paragraph4:
        "My jewelry is for those who notice the little details and would love to wear a small piece of nature with them.",
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
    common: {
      instagram: "Instagram",
      whatsapp: "WhatsApp",
      close: "Close",
    },
  },
  ru: {
    nav: {
      gallery: "Галерея",
      about: "О нас",
      orderDelivery: "Заказ и доставка",
    },
    language: {
      en: "EN",
      ru: "RU",
    },
    categories: {
      all: "Все",
      rings: "Кольца",
      necklaces: "Ожерелья",
      earrings: "Серьги",
      sets: "Наборы",
    },
    home: {
      title: "Добро пожаловать в мои творения!",
      subtitle: "Выберите понравившееся изделие и напишите мне.",
      newLabel: "Новинки",
      newTitle: "Новые изделия",
      viewDetails: "Подробнее",
    },
    gallery: {
      title: "Галерея",
      viewDetails: "Подробнее",
    },
    product: {
      back: "← Назад в галерею",
      materials: "Материалы",
      price: "Цена",
      requestWhatsapp: "Запросить через WhatsApp",
      requestInstagram: "Запросить через Instagram",
    },
    order: {
      title: "Заказ и доставка",
      subtitle: "Отправляем украшения по всему миру.",
      deliveryIsrael: "Доставка по Израилю через Israel Post",
      deliveryHaifa: "Самовывоз и доставка по Хайфе до двери",
      deliveryWorldwide: "Доставка по миру",
      free: "Бесплатно",
      orderCta: "Чтобы сделать заказ, напишите нам:",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    },
    about: {
      title: "О нас",
      paragraph1:
        "Привет! Я Ольга. Я создаю украшения вручную из эпоксидной смолы.",
      paragraph2:
        "В каждом изделии я стараюсь сохранить то, что природа дает нам лишь на короткое время. Внутри моих работ — настоящие цветы, маленькие веточки и листья, бережно высушенные и сохраненные.",
      paragraph3:
        "Цветы увядают, моменты проходят, и все же иногда хочется удержать чувства и воспоминания чуть дольше, носить их с собой и хранить рядом.",
      paragraph4:
        "Мои украшения для тех, кто замечает мелкие детали и хочет носить с собой кусочек природы.",
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
    common: {
      instagram: "Instagram",
      whatsapp: "WhatsApp",
      close: "Закрыть",
    },
  },
} as const;

export const getTranslations = (locale: Locale) => translations[locale];
