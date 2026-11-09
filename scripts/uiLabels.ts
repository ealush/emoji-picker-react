// Translated UI strings written into each localized dataset as `labels`
// (src/config/config.ts `PickerLabels`). The picker applies them beneath
// the `labels` prop, so `emojiData={es}` localizes the whole interface.
//
// Skin-tone names come from CLDR (emojibase messages.json); only the
// neutral tone, which CLDR does not name, is written here. English needs
// no entry: the picker's defaults are English. `loading`, `loadingError`
// and `retryLoading` are absent on purpose: they show before (or instead
// of) the dataset, so a dataset can never supply them.
//
// `%n` in searchResultsMany is the result count. Languages with several
// plural forms use a count-last phrasing ("Найдено результатов: %n") so
// one string agrees with every number.

export type DatasetLabels = {
  searchPlaceholder: string;
  searchLabel: string;
  searchClear: string;
  searchResultsNone: string;
  searchResultsOne: string;
  searchResultsMany: string;
  categoryNavigation: string;
  reactions: string;
  expandReactions: string;
  skinToneNeutral: string;
};

const spanish: DatasetLabels = {
  searchPlaceholder: 'Buscar',
  searchLabel: 'Escribe para buscar un emoji',
  searchClear: 'Borrar',
  searchResultsNone: 'No se encontraron resultados',
  searchResultsOne:
    '1 resultado encontrado. Usa las flechas arriba y abajo para navegar.',
  searchResultsMany:
    '%n resultados encontrados. Usa las flechas arriba y abajo para navegar.',
  categoryNavigation: 'Navegación por categorías',
  reactions: 'Reacciones',
  expandReactions: 'Mostrar todos los emojis',
  skinToneNeutral: 'Tono de piel predeterminado',
};

export const uiLabels: Record<string, DatasetLabels> = {
  // Bengali
  bn: {
    searchPlaceholder: 'অনুসন্ধান',
    searchLabel: 'ইমোজি খুঁজতে টাইপ করুন',
    searchClear: 'মুছুন',
    searchResultsNone: 'কোনো ফলাফল পাওয়া যায়নি',
    searchResultsOne:
      '1টি ফলাফল পাওয়া গেছে। নেভিগেট করতে উপরের ও নিচের তীর কী ব্যবহার করুন।',
    searchResultsMany:
      '%nটি ফলাফল পাওয়া গেছে। নেভিগেট করতে উপরের ও নিচের তীর কী ব্যবহার করুন।',
    categoryNavigation: 'বিভাগ নেভিগেশন',
    reactions: 'প্রতিক্রিয়া',
    expandReactions: 'সব ইমোজি দেখুন',
    skinToneNeutral: 'ডিফল্ট ত্বকের রঙ',
  },
  // Danish
  da: {
    searchPlaceholder: 'Søg',
    searchLabel: 'Skriv for at søge efter en emoji',
    searchClear: 'Ryd',
    searchResultsNone: 'Ingen resultater fundet',
    searchResultsOne:
      '1 resultat fundet. Brug pil op og pil ned for at navigere.',
    searchResultsMany:
      '%n resultater fundet. Brug pil op og pil ned for at navigere.',
    categoryNavigation: 'Kategorinavigation',
    reactions: 'Reaktioner',
    expandReactions: 'Vis alle emojis',
    skinToneNeutral: 'Standardteint',
  },
  // German
  de: {
    searchPlaceholder: 'Suchen',
    searchLabel: 'Tippen, um nach einem Emoji zu suchen',
    searchClear: 'Löschen',
    searchResultsNone: 'Keine Ergebnisse gefunden',
    searchResultsOne:
      '1 Ergebnis gefunden. Mit den Pfeiltasten nach oben und unten navigieren.',
    searchResultsMany:
      '%n Ergebnisse gefunden. Mit den Pfeiltasten nach oben und unten navigieren.',
    categoryNavigation: 'Kategorienavigation',
    reactions: 'Reaktionen',
    expandReactions: 'Alle Emojis anzeigen',
    skinToneNeutral: 'Standard-Hautfarbe',
  },
  // Spanish
  es: spanish,
  'es-mx': spanish,
  // Estonian
  et: {
    searchPlaceholder: 'Otsi',
    searchLabel: 'Emoji otsimiseks hakka trükkima',
    searchClear: 'Tühjenda',
    searchResultsNone: 'Tulemusi ei leitud',
    searchResultsOne:
      'Leiti 1 tulemus. Liikumiseks kasuta üles- ja allanooleklahve.',
    searchResultsMany:
      'Leiti %n tulemust. Liikumiseks kasuta üles- ja allanooleklahve.',
    categoryNavigation: 'Kategooriate navigeerimine',
    reactions: 'Reaktsioonid',
    expandReactions: 'Näita kõiki emojisid',
    skinToneNeutral: 'Vaikimisi nahatoon',
  },
  // Finnish
  fi: {
    searchPlaceholder: 'Hae',
    searchLabel: 'Kirjoita hakeaksesi emojia',
    searchClear: 'Tyhjennä',
    searchResultsNone: 'Tuloksia ei löytynyt',
    searchResultsOne: '1 tulos löytyi. Siirry ylä- ja alanuolinäppäimillä.',
    searchResultsMany:
      '%n tulosta löytyi. Siirry ylä- ja alanuolinäppäimillä.',
    categoryNavigation: 'Luokkanavigointi',
    reactions: 'Reaktiot',
    expandReactions: 'Näytä kaikki emojit',
    skinToneNeutral: 'Oletusiho',
  },
  // French
  fr: {
    searchPlaceholder: 'Rechercher',
    searchLabel: 'Saisissez du texte pour rechercher un emoji',
    searchClear: 'Effacer',
    searchResultsNone: 'Aucun résultat trouvé',
    searchResultsOne:
      '1 résultat trouvé. Utilisez les flèches haut et bas pour naviguer.',
    searchResultsMany:
      '%n résultats trouvés. Utilisez les flèches haut et bas pour naviguer.',
    categoryNavigation: 'Navigation par catégorie',
    reactions: 'Réactions',
    expandReactions: 'Afficher tous les emojis',
    skinToneNeutral: 'Peau par défaut',
  },
  // Hindi
  hi: {
    searchPlaceholder: 'खोजें',
    searchLabel: 'इमोजी खोजने के लिए टाइप करें',
    searchClear: 'साफ़ करें',
    searchResultsNone: 'कोई परिणाम नहीं मिला',
    searchResultsOne:
      '1 परिणाम मिला। नेविगेट करने के लिए ऊपर और नीचे तीर कुंजियों का उपयोग करें।',
    searchResultsMany:
      '%n परिणाम मिले। नेविगेट करने के लिए ऊपर और नीचे तीर कुंजियों का उपयोग करें।',
    categoryNavigation: 'श्रेणी नेविगेशन',
    reactions: 'प्रतिक्रियाएँ',
    expandReactions: 'सभी इमोजी दिखाएँ',
    skinToneNeutral: 'डिफ़ॉल्ट त्वचा का रंग',
  },
  // Hungarian
  hu: {
    searchPlaceholder: 'Keresés',
    searchLabel: 'Gépeljen egy emoji kereséséhez',
    searchClear: 'Törlés',
    searchResultsNone: 'Nincs találat',
    searchResultsOne:
      '1 találat. A navigáláshoz használja a fel és le nyílbillentyűket.',
    searchResultsMany:
      '%n találat. A navigáláshoz használja a fel és le nyílbillentyűket.',
    categoryNavigation: 'Kategórianavigáció',
    reactions: 'Reakciók',
    expandReactions: 'Az összes emoji megjelenítése',
    skinToneNeutral: 'Alapértelmezett bőrtónus',
  },
  // Italian
  it: {
    searchPlaceholder: 'Cerca',
    searchLabel: "Digita per cercare un'emoji",
    searchClear: 'Cancella',
    searchResultsNone: 'Nessun risultato trovato',
    searchResultsOne:
      '1 risultato trovato. Usa i tasti freccia su e giù per spostarti.',
    searchResultsMany:
      '%n risultati trovati. Usa i tasti freccia su e giù per spostarti.',
    categoryNavigation: 'Navigazione per categorie',
    reactions: 'Reazioni',
    expandReactions: 'Mostra tutte le emoji',
    skinToneNeutral: 'Carnagione predefinita',
  },
  // Japanese
  ja: {
    searchPlaceholder: '検索',
    searchLabel: '入力して絵文字を検索',
    searchClear: 'クリア',
    searchResultsNone: '結果が見つかりません',
    searchResultsOne:
      '1件の結果が見つかりました。上下の矢印キーで移動できます。',
    searchResultsMany:
      '%n件の結果が見つかりました。上下の矢印キーで移動できます。',
    categoryNavigation: 'カテゴリナビゲーション',
    reactions: 'リアクション',
    expandReactions: 'すべての絵文字を表示',
    skinToneNeutral: '標準の肌色',
  },
  // Korean
  ko: {
    searchPlaceholder: '검색',
    searchLabel: '입력하여 이모지 검색',
    searchClear: '지우기',
    searchResultsNone: '검색 결과 없음',
    searchResultsOne:
      '결과 1개를 찾았습니다. 위아래 화살표 키로 이동하세요.',
    searchResultsMany:
      '결과 %n개를 찾았습니다. 위아래 화살표 키로 이동하세요.',
    categoryNavigation: '카테고리 탐색',
    reactions: '반응',
    expandReactions: '모든 이모지 보기',
    skinToneNeutral: '기본 피부 톤',
  },
  // Lithuanian
  lt: {
    searchPlaceholder: 'Ieškoti',
    searchLabel: 'Įveskite, kad ieškotumėte emodžio',
    searchClear: 'Išvalyti',
    searchResultsNone: 'Rezultatų nerasta',
    searchResultsOne:
      'Rastas 1 rezultatas. Naršykite rodyklių aukštyn ir žemyn klavišais.',
    searchResultsMany:
      'Rasta rezultatų: %n. Naršykite rodyklių aukštyn ir žemyn klavišais.',
    categoryNavigation: 'Kategorijų naršymas',
    reactions: 'Reakcijos',
    expandReactions: 'Rodyti visus emodžius',
    skinToneNeutral: 'Numatytoji odos spalva',
  },
  // Malay
  ms: {
    searchPlaceholder: 'Cari',
    searchLabel: 'Taip untuk mencari emoji',
    searchClear: 'Kosongkan',
    searchResultsNone: 'Tiada hasil ditemui',
    searchResultsOne:
      '1 hasil ditemui. Gunakan kekunci anak panah atas dan bawah untuk menavigasi.',
    searchResultsMany:
      '%n hasil ditemui. Gunakan kekunci anak panah atas dan bawah untuk menavigasi.',
    categoryNavigation: 'Navigasi kategori',
    reactions: 'Reaksi',
    expandReactions: 'Tunjukkan semua emoji',
    skinToneNeutral: 'Ton kulit lalai',
  },
  // Norwegian Bokmål
  nb: {
    searchPlaceholder: 'Søk',
    searchLabel: 'Skriv for å søke etter en emoji',
    searchClear: 'Tøm',
    searchResultsNone: 'Ingen resultater funnet',
    searchResultsOne:
      '1 resultat funnet. Bruk piltastene opp og ned for å navigere.',
    searchResultsMany:
      '%n resultater funnet. Bruk piltastene opp og ned for å navigere.',
    categoryNavigation: 'Kategorinavigasjon',
    reactions: 'Reaksjoner',
    expandReactions: 'Vis alle emojier',
    skinToneNeutral: 'Standard hudtype',
  },
  // Dutch
  nl: {
    searchPlaceholder: 'Zoeken',
    searchLabel: 'Typ om naar een emoji te zoeken',
    searchClear: 'Wissen',
    searchResultsNone: 'Geen resultaten gevonden',
    searchResultsOne:
      '1 resultaat gevonden. Gebruik de pijltoetsen omhoog en omlaag om te navigeren.',
    searchResultsMany:
      '%n resultaten gevonden. Gebruik de pijltoetsen omhoog en omlaag om te navigeren.',
    categoryNavigation: 'Categorienavigatie',
    reactions: 'Reacties',
    expandReactions: "Alle emoji's weergeven",
    skinToneNeutral: 'Standaardhuidskleur',
  },
  // Polish
  pl: {
    searchPlaceholder: 'Szukaj',
    searchLabel: 'Wpisz, aby wyszukać emoji',
    searchClear: 'Wyczyść',
    searchResultsNone: 'Nie znaleziono wyników',
    searchResultsOne:
      'Znaleziono 1 wynik. Użyj strzałek w górę i w dół, aby nawigować.',
    searchResultsMany:
      'Znalezione wyniki: %n. Użyj strzałek w górę i w dół, aby nawigować.',
    categoryNavigation: 'Nawigacja po kategoriach',
    reactions: 'Reakcje',
    expandReactions: 'Pokaż wszystkie emoji',
    skinToneNeutral: 'Karnacja domyślna',
  },
  // Portuguese
  pt: {
    searchPlaceholder: 'Pesquisar',
    searchLabel: 'Digite para pesquisar um emoji',
    searchClear: 'Limpar',
    searchResultsNone: 'Nenhum resultado encontrado',
    searchResultsOne:
      '1 resultado encontrado. Use as setas para cima e para baixo para navegar.',
    searchResultsMany:
      '%n resultados encontrados. Use as setas para cima e para baixo para navegar.',
    categoryNavigation: 'Navegação por categorias',
    reactions: 'Reações',
    expandReactions: 'Mostrar todos os emojis',
    skinToneNeutral: 'Pele padrão',
  },
  // Russian
  ru: {
    searchPlaceholder: 'Поиск',
    searchLabel: 'Введите текст для поиска эмодзи',
    searchClear: 'Очистить',
    searchResultsNone: 'Ничего не найдено',
    searchResultsOne:
      'Найден 1 результат. Для перемещения используйте клавиши со стрелками вверх и вниз.',
    searchResultsMany:
      'Найдено результатов: %n. Для перемещения используйте клавиши со стрелками вверх и вниз.',
    categoryNavigation: 'Навигация по категориям',
    reactions: 'Реакции',
    expandReactions: 'Показать все эмодзи',
    skinToneNeutral: 'Тон кожи по умолчанию',
  },
  // Swedish
  sv: {
    searchPlaceholder: 'Sök',
    searchLabel: 'Skriv för att söka efter en emoji',
    searchClear: 'Rensa',
    searchResultsNone: 'Inga resultat hittades',
    searchResultsOne:
      '1 resultat hittades. Använd uppåt- och nedåtpilarna för att navigera.',
    searchResultsMany:
      '%n resultat hittades. Använd uppåt- och nedåtpilarna för att navigera.',
    categoryNavigation: 'Kategorinavigering',
    reactions: 'Reaktioner',
    expandReactions: 'Visa alla emojier',
    skinToneNeutral: 'Standardhy',
  },
  // Thai
  th: {
    searchPlaceholder: 'ค้นหา',
    searchLabel: 'พิมพ์เพื่อค้นหาอีโมจิ',
    searchClear: 'ล้าง',
    searchResultsNone: 'ไม่พบผลลัพธ์',
    searchResultsOne: 'พบ 1 รายการ ใช้ปุ่มลูกศรขึ้นและลงเพื่อเลื่อนดู',
    searchResultsMany: 'พบ %n รายการ ใช้ปุ่มลูกศรขึ้นและลงเพื่อเลื่อนดู',
    categoryNavigation: 'การนำทางหมวดหมู่',
    reactions: 'รีแอคชัน',
    expandReactions: 'แสดงอีโมจิทั้งหมด',
    skinToneNeutral: 'โทนสีผิวเริ่มต้น',
  },
  // Ukrainian
  uk: {
    searchPlaceholder: 'Пошук',
    searchLabel: 'Введіть текст, щоб знайти емодзі',
    searchClear: 'Очистити',
    searchResultsNone: 'Нічого не знайдено',
    searchResultsOne:
      'Знайдено 1 результат. Для переміщення використовуйте клавіші зі стрілками вгору та вниз.',
    searchResultsMany:
      'Знайдено результатів: %n. Для переміщення використовуйте клавіші зі стрілками вгору та вниз.',
    categoryNavigation: 'Навігація за категоріями',
    reactions: 'Реакції',
    expandReactions: 'Показати всі емодзі',
    skinToneNeutral: 'Тон шкіри за замовчуванням',
  },
  // Vietnamese
  vi: {
    searchPlaceholder: 'Tìm kiếm',
    searchLabel: 'Nhập để tìm biểu tượng cảm xúc',
    searchClear: 'Xóa',
    searchResultsNone: 'Không tìm thấy kết quả',
    searchResultsOne:
      'Tìm thấy 1 kết quả. Dùng các phím mũi tên lên và xuống để di chuyển.',
    searchResultsMany:
      'Tìm thấy %n kết quả. Dùng các phím mũi tên lên và xuống để di chuyển.',
    categoryNavigation: 'Điều hướng danh mục',
    reactions: 'Biểu cảm',
    expandReactions: 'Hiện tất cả biểu tượng cảm xúc',
    skinToneNeutral: 'Màu da mặc định',
  },
  // Chinese (Simplified)
  zh: {
    searchPlaceholder: '搜索',
    searchLabel: '输入以搜索表情符号',
    searchClear: '清除',
    searchResultsNone: '未找到结果',
    searchResultsOne: '找到 1 个结果。使用上下方向键进行浏览。',
    searchResultsMany: '找到 %n 个结果。使用上下方向键进行浏览。',
    categoryNavigation: '类别导航',
    reactions: '表情回应',
    expandReactions: '显示所有表情符号',
    skinToneNeutral: '默认肤色',
  },
  // Chinese (Traditional)
  'zh-hant': {
    searchPlaceholder: '搜尋',
    searchLabel: '輸入以搜尋表情符號',
    searchClear: '清除',
    searchResultsNone: '找不到結果',
    searchResultsOne: '找到 1 個結果。使用上下方向鍵瀏覽。',
    searchResultsMany: '找到 %n 個結果。使用上下方向鍵瀏覽。',
    categoryNavigation: '類別導覽',
    reactions: '表情回應',
    expandReactions: '顯示所有表情符號',
    skinToneNeutral: '預設膚色',
  },
};
