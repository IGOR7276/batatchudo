/* P3 configuration for all 38 plant pages. */

export const GALLERY = {
  ayote: 'тыквы Айоте',
  yams: 'ямса',
  chufa: 'чуфы',
  stahis: 'стахиса',
  yakon: 'якона',
  kolokaziya: 'колоказии',
  kislica: 'кислицы клубневой',
  'vodnyy-kashtan': 'водного каштана',
  imbir: 'имбиря',
  maniok: 'маниока',
  dzhikama: 'джикамы',
  topinambur: 'топинамбура',
  'anguriya-siriyskaya': 'ангурии сирийской',
  bamiya: 'бамии',
  momordika: 'момордики',
  lyuffa: 'люффы',
  chayot: 'чайота',
  'yavanskiy-redis': 'яванского редиса',
  sikana: 'сиканы',
  spilantes: 'спилантеса',
  tladianta: 'тладианты',
  trihozant: 'трихозанта',
  kokciniya: 'кокцинии',
  kivano: 'кивано',
  'bazilik-kiprskiy': 'кипрского базилика',
  lippiya: 'липпии',
  naranhilla: 'наранхиллы',
  dzhinura: 'джинуры',
  lemongrass: 'лемонграсса',
  banany: 'бананов',
  'beninkaza-voskovaya-tykva': 'тыквы Бенинказа',
  'melotriya-shershavaya': 'мелотрии шершавой',
  karipenze: 'карипензе',
  'lichi-tomat': 'личи-томата',
  'vigna-kustovaya': 'вигны',
  'saharnyy-trostnik': 'сахарного тростника',
  cifomandra: 'цифомандры',
  ciklantera: 'циклантеры',
};

export const GRAMMAR = {
  kislica: { nom: 'кислица клубневая', acc: 'кислицу клубневую' },
  dzhikama: { nom: 'джикама', acc: 'джикаму' },
  'anguriya-siriyskaya': { nom: 'ангурия сирийская', acc: 'ангурию сирийскую' },
  bamiya: { nom: 'бамия', acc: 'бамию' },
  momordika: { nom: 'момордика', acc: 'момордику' },
  lyuffa: { nom: 'люффа', acc: 'люффу' },
  sikana: { nom: 'сикана', acc: 'сикану' },
  kokciniya: { nom: 'кокциния', acc: 'кокцинию' },
  lippiya: { nom: 'липпия', acc: 'липпию' },
  naranhilla: { nom: 'наранхилла', acc: 'наранхиллу' },
  'beninkaza-voskovaya-tykva': { nom: 'тыква бенинказа', acc: 'тыкву бенинказа' },
  'melotriya-shershavaya': { nom: 'мелотрия шершавая', acc: 'мелотрию шершавую' },
};

export const BENEFITS = {
  yakon: [
    { icon: '🍐', title: 'Сладкие корнеплоды', text: 'Вкус груши, яблока и арбуза. Едят сырыми, как фрукт.' },
    { icon: '💚', title: 'Инулин и пребиотики', text: 'Поддерживают микрофлору кишечника, подходят при диабете.' },
    { icon: '🌱', title: 'Неприхотлив', text: 'Растёт в разных климатических условиях при регулярном поливе.' },
    { icon: '📈', title: 'Высокий урожай', text: 'До 10 кг корнеплодов с одного растения.' },
  ],
  kislica: [
    { icon: '🥔', title: 'Съедобные клубни', text: 'Продолговатые клубни бывают белыми, жёлтыми, розовыми и фиолетовыми.' },
    { icon: '🏔️', title: 'Культура Анд', text: 'В странах Анд конкурирует с картофелем по популярности.' },
    { icon: '🌤️', title: 'Солнце и дренаж', text: 'Любит солнечные участки, в жарком климате нужно притенение.' },
    { icon: '🌱', title: 'Редкая новинка', text: 'Многолетник с вегетацией 150–180 дней и урожаем до 3 кг с куста.' },
  ],
  imbir: [
    { icon: '🌿', title: 'Ароматное корневище', text: 'Пряность для кулинарии, чая и народной медицины.' },
    { icon: '💚', title: 'Полезные свойства', text: 'Корневище традиционно используют для иммунитета и пищеварения.' },
    { icon: '☀️', title: 'Теплолюбивый', text: 'Оптимально 20–30 °C, в холодном климате — теплица.' },
    { icon: '🥔', title: 'Урожай до 2 кг', text: 'С одного куста при вегетации 200–270 дней.' },
  ],
  dzhikama: [
    { icon: '🍐', title: 'Хрустящий корнеплод', text: 'Сладковатый вкус яблока и груши, мякоть на 90% из воды.' },
    { icon: '⚠️', title: 'Только корнеплод', text: 'Побеги, семена и бобы содержат ротенон и в пищу не идут.' },
    { icon: '☀️', title: 'Теплолюбивая лиана', text: 'Нужно 20–30 °C, в умеренном климате — теплица.' },
    { icon: '🥗', title: 'Низкая калорийность', text: 'Всего 38 ккал на 100 г — диетический овощ.' },
  ],
  topinambur: [
    { icon: '🥔', title: 'Клубни с инулином', text: 'Полисахарид, полезный при диабете.' },
    { icon: '❄️', title: 'Не боится заморозков', text: 'Клубни зимуют в грунте, растение многолетнее.' },
    { icon: '🌱', title: 'Растёт на одном месте', text: 'Не требует ежегодной посадки и легко размножается клубнями.' },
    { icon: '📈', title: 'До 5 кг с куста', text: 'Используется как овощ и кормовая культура.' },
  ],
  'anguriya-siriyskaya': [
    { icon: '🍉', title: 'Вкус зреющего арбуза', text: 'Сочные сладковатые плоды с тонкой кожицей.' },
    { icon: '🥒', title: 'Стебли стелются', text: 'Не вьётся, как огурец, поэтому нужна площадь или опора.' },
    { icon: '🫙', title: 'Для заготовок', text: 'Плоды можно мариновать и солить.' },
    { icon: '⚡', title: 'Быстрый урожай', text: '45–60 дней до сбора, до 20 кг с куста.' },
  ],
  bamiya: [
    { icon: '🌿', title: 'Нежные стручки', text: 'Собирают молодые завязи в возрасте 3–5 дней.' },
    { icon: '💚', title: 'Витамины и клетчатка', text: 'Богата фолиевой кислотой и клетчаткой.' },
    { icon: '🔥', title: 'Теплолюбива', text: 'В средней полосе выращивают через 30–45-дневную рассаду.' },
    { icon: '🥗', title: 'Всего 40 ккал', text: 'Диетический овощ с нежным вкусом.' },
  ],
  lyuffa: [
    { icon: '🧽', title: 'Природная мочалка', text: 'Из спелых плодов получают натуральные мочалки.' },
    { icon: '🥒', title: 'Съедобна в молочной спелости', text: 'Люффа остроребристая идёт в консервацию.' },
    { icon: '🌱', title: 'Лиана до 5 м', text: 'Требует опоры и тепла, растёт через рассаду.' },
    { icon: '☀️', title: 'Тепло и плодородие', text: 'Нужны плодородная почва и солнечное место.' },
  ],
};

export const PRODUCTS = {
  ayote: { price: 750, name: 'Зеленая тыква Айоте (3 шт)' },
  kislica: { price: 750, name: 'Кислица (1 шт)' },
  'vodnyy-kashtan': { price: 650, name: 'Водный каштан (1 шт)' },
  maniok: { price: 2000, name: 'Маниок' },
  dzhikama: { price: 100, name: 'Джикама, ямсовая фасоль (1 шт)' },
  topinambur: { price: 650, name: 'Топинамбур круглый (5 шт)' },
  'anguriya-siriyskaya': { price: 150, name: 'Ангурия Сирийская (10 шт)' },
  bamiya: { price: 150, name: 'Бамия (10 шт)' },
  'yavanskiy-redis': { price: 150, name: 'Яванский редис стручковый (15 шт)' },
  sikana: { price: 750, name: 'Сикана (Кассабанана) (10 шт)' },
  spilantes: { price: 150, name: 'Спилантес Пикабу (порция)' },
  trihozant: { price: 150, name: 'Трихозант (10 шт)' },
  'bazilik-kiprskiy': { price: 500, name: 'Базилик Кипрский' },
  lippiya: { price: 500, name: 'Липпия Сладкая' },
  naranhilla: { price: 200, name: 'Наранхилла (Луло) (10 шт)' },
  dzhinura: { price: 500, name: 'Джинура' },
  lemongrass: { price: 500, name: 'Лемонграсс' },
  'beninkaza-voskovaya-tykva': { price: 150, name: 'Тыква Бенинказа (10 шт)' },
  'melotriya-shershavaya': { price: 150, name: 'Мелотрия шершавая (10 шт)' },
  'vigna-kustovaya': { price: 150, name: 'Вигна кустовая фасоль (10 шт)' },
  'saharnyy-trostnik': { price: 150, name: 'Сахарный тростник (15 шт)' },
};

export const EXTRA_FAQ = {
  dzhinura: [
    {
      q: 'Какие болезни лечит джинура?',
      a: 'В народной медицине джинуру применяют при диабете, повышенном давлении и высоком холестерине. Клинических исследований, подтверждающих лечение этих заболеваний у человека, недостаточно, поэтому растение не заменяет терапию и консультацию врача.',
    },
    {
      q: 'Как посадить джинуру и ухаживать за ней?',
      a: 'Черенок укореняют в воде или влажном грунте, затем высаживают в горшок или в открытый грунт после заморозков. Нужны полутень, регулярный полив и лёгкая плодородная почва с дренажом.',
    },
  ],
  yakon: [
    {
      q: 'Где купить клубни якона?',
      a: 'В коллекции Batatchudo якон представлен сортом «Якон Снежный Лотос». Посадочный материал — корневища; актуальное наличие и цену смотрите в прайсе или уточняйте у нас.',
    },
  ],
  dzhikama: [
    {
      q: 'Джикама — это что?',
      a: 'Джикама (хикама, мексиканский картофель) — лиана семейства Бобовых родом из Мексики. В пищу используют только корнеплод: сочный, хрустящий, со сладковатым вкусом яблока и груши.',
    },
  ],
  'bazilik-kiprskiy': [
    {
      q: 'Можно ли вырастить кипрский базилик из семян?',
      a: 'Нет. Кипрский базилик практически не цветёт и семян не даёт, поэтому размножают его только черенками. Срежьте веточку, уберите нижние листья и поставьте в воду — корешки появляются за 1–2 недели.',
    },
  ],
};

export const EXTRA_SECTIONS = {
  yams: `
<section class="pl-section" style="position:relative;">
  <div class="container" style="max-width:860px;">
    <h2 class="pl-section-title">Что такое ямс и чем он отличается от батата</h2>
    <p>Ямс — это клубни растений рода Dioscorea. В пищу используют подземные клубни, а воздушные клубеньки (бульбы) идут на размножение. По вкусу ямс ближе к картофелю: мякоть более крахмалистая и менее сладкая, чем у батата.</p>
    <p>Батат относится к семейству вьюнковых (Ipomoea batatas), ямс — к семейству диоскорейных. У батата клубни образуются боковыми корнями, у ямса — настоящими клубнями с грубой кожицей, поэтому различаются агротехника и условия хранения.</p>
    <div style="overflow-x:auto;margin:18px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:.92rem;">
        <thead><tr><th style="text-align:left;padding:10px 12px;border-bottom:2px solid #cfe3d6;color:#1a3c2e;">Параметр</th><th style="text-align:left;padding:10px 12px;border-bottom:2px solid #cfe3d6;color:#1a3c2e;">Ямс</th><th style="text-align:left;padding:10px 12px;border-bottom:2px solid #cfe3d6;color:#1a3c2e;">Батат</th></tr></thead>
        <tbody>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">Вкус</td><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">нейтральный, крахмалистый</td><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">сладкий, десертный</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">Вегетация</td><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">150–180 дней</td><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">90–140 дней</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">Размножение</td><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">воздушные клубеньки, деление клубня</td><td style="padding:10px 12px;border-bottom:1px solid #e3ece6;">черенки</td></tr>
          <tr><td style="padding:10px 12px;">Хранение</td><td style="padding:10px 12px;">хуже, нужно прохладное сухое место</td><td style="padding:10px 12px;">после кюринга, в прохладном месте</td></tr>
        </tbody>
      </table>
    </div>
    <p>В средней полосе ямс выращивают через рассаду и как однолетнюю культуру: ему нужно не менее 150 тёплых дней.</p>
  </div>
</section>`.trim(),
  maniok: `
<section class="pl-section" style="position:relative;">
  <div class="container" style="max-width:860px;">
    <h2 class="pl-section-title">Что такое маниок (кассава)</h2>
    <p>Маниок, или кассава (Manihot esculenta), — кустарник семейства молочайных. В пищу используют крупные крахмалистые клубни: из них делают муку, крахмал (тапиоку) и крупу. Это одна из главных продовольственных культур тропиков.</p>
    <p>Сырые клубни содержат цианогенные гликозиды и считаются токсичными, поэтому маниок обязательно варят, жарят или сушат. В пищу годится только термически обработанный корнеплод.</p>
    <p>В отличие от батата и картофеля, маниоку нужен длинный вегетационный период — 240–360 дней без холодов. В России его реально выращивать в теплице или как декоративное растение в контейнере.</p>
  </div>
</section>`.trim(),
  yakon: `
<section class="pl-section" style="position:relative;">
  <div class="container" style="max-width:860px;">
    <h2 class="pl-section-title">Якон и батат: в чём разница</h2>
    <p>Якон (Smallanthus sonchifolius) — растение семейства Астровых родом из Анд. В пищу идут сочные запасающие корни, а не клубни, как у батата. Надземная часть якона — прямостоячие стебли высотой 1–2 м, а батат — стелющаяся лиана.</p>
    <p>По вкусу якон сладкий и хрустящий, с нотками груши и яблока. Его едят сырым, как фрукт. Батат чаще варят, запекают и используют в десертах: его мякоть более крахмалистая.</p>
    <p>Агротехника тоже различается. Якону нужно 180–220 дней и размножение корневищами, батату — 90–140 дней и черенкование. Оба растения теплолюбивы, но якон лучше переносит прохладные ночи.</p>
  </div>
</section>`.trim(),
  dzhikama: `
<section class="pl-section" style="position:relative;">
  <div class="container" style="max-width:860px;">
    <h2 class="pl-section-title">Что такое джикама (хикама)</h2>
    <p>Джикама, или хикама (Pachyrhizus erosus), — травянистая лиана семейства Бобовых родом из Мексики. В пищу используют только корнеплод: он сочный, хрустящий и сладковатый, напоминает яблоко и грушу. Мякоть примерно на 90% состоит из воды, калорийность — около 38 ккал на 100 г.</p>
    <p>Побеги, семена и бобы содержат токсин ротенон, поэтому их не едят. Для кулинарии срезают корнеплод, очищают от кожицы и нарезают в салаты, жарят или запекают.</p>
    <p>Джикаме нужно 180–240 дней тепла. В умеренном климате её выращивают через рассаду и в теплице, в южных регионах — в открытом грунте.</p>
  </div>
</section>`.trim(),
  'bazilik-kiprskiy': `
<section class="pl-section" style="position:relative;">
  <div class="container" style="max-width:860px;">
    <h2 class="pl-section-title">Чем кипрский базилик отличается от обычного</h2>
    <p>Обычный базилик — однолетник, который выращивают из семян. Кипрский базилик — многолетник с одревесневшим стволом: он живёт несколько лет и зимует в доме на южном подоконнике при +22 °C.</p>
    <p>Семян кипрский базилик практически не даёт, поэтому размножают его только черенками. Веточку срезают, убирают нижние листья и ставят в воду — корешки появляются за 1–2 недели.</p>
    <p>Аромат у него богаче обычного: кроме базилика, в букете есть нотки гвоздики, перца, мяты и аниса. Свежую зелень добавляют в салаты, супы, соусы и маринады, сушат на зиму и заваривают как чай.</p>
  </div>
</section>`.trim(),
};

/* Four related plants per page. Every target must exist in js/plants-data.js. */
export const RELATED = {
  ayote: ['beninkaza-voskovaya-tykva', 'melotriya-shershavaya', 'lichi-tomat', 'karipenze'],
  yams: ['yakon', 'maniok', 'dzhikama', 'topinambur'],
  chufa: ['stahis', 'topinambur', 'yams', 'yakon'],
  stahis: ['chufa', 'topinambur', 'yakon', 'yams'],
  yakon: ['yams', 'topinambur', 'dzhikama', 'stahis'],
  kolokaziya: ['vodnyy-kashtan', 'chufa', 'topinambur', 'yams'],
  kislica: ['topinambur', 'stahis', 'chufa', 'yams'],
  'vodnyy-kashtan': ['kolokaziya', 'chufa', 'saharnyy-trostnik', 'lemongrass'],
  imbir: ['lemongrass', 'cifomandra', 'bazilik-kiprskiy', 'lippiya'],
  maniok: ['yams', 'yakon', 'topinambur', 'dzhikama'],
  dzhikama: ['yams', 'maniok', 'yakon', 'topinambur'],
  topinambur: ['yams', 'yakon', 'stahis', 'chufa'],
  'anguriya-siriyskaya': ['momordika', 'kivano', 'trihozant', 'melotriya-shershavaya'],
  bamiya: ['trihozant', 'kivano', 'momordika', 'lyuffa'],
  momordika: ['kivano', 'trihozant', 'anguriya-siriyskaya', 'lichi-tomat'],
  lyuffa: ['trihozant', 'kivano', 'momordika', 'anguriya-siriyskaya'],
  chayot: ['tladianta', 'kivano', 'trihozant', 'momordika'],
  'yavanskiy-redis': ['vigna-kustovaya', 'bamiya', 'sikana', 'karipenze'],
  sikana: ['chayot', 'tladianta', 'naranhilla', 'banany'],
  spilantes: ['dzhinura', 'lippiya', 'lemongrass', 'bazilik-kiprskiy'],
  tladianta: ['chayot', 'kivano', 'trihozant', 'momordika'],
  trihozant: ['chayot', 'kivano', 'momordika', 'bamiya'],
  kokciniya: ['momordika', 'lichi-tomat', 'anguriya-siriyskaya', 'melotriya-shershavaya'],
  kivano: ['chayot', 'trihozant', 'momordika', 'anguriya-siriyskaya'],
  'bazilik-kiprskiy': ['lippiya', 'lemongrass', 'imbir', 'cifomandra'],
  lippiya: ['lemongrass', 'bazilik-kiprskiy', 'dzhinura', 'spilantes'],
  naranhilla: ['sikana', 'banany', 'chayot', 'tladianta'],
  dzhinura: ['spilantes', 'lippiya', 'lemongrass', 'kislica'],
  lemongrass: ['lippiya', 'bazilik-kiprskiy', 'imbir', 'dzhinura'],
  banany: ['sikana', 'naranhilla', 'cifomandra', 'chayot'],
  'beninkaza-voskovaya-tykva': ['ayote', 'melotriya-shershavaya', 'lichi-tomat', 'karipenze'],
  'melotriya-shershavaya': ['beninkaza-voskovaya-tykva', 'ayote', 'anguriya-siriyskaya', 'kivano'],
  karipenze: ['lichi-tomat', 'beninkaza-voskovaya-tykva', 'ayote', 'melotriya-shershavaya'],
  'lichi-tomat': ['karipenze', 'beninkaza-voskovaya-tykva', 'melotriya-shershavaya', 'ayote'],
  'vigna-kustovaya': ['yavanskiy-redis', 'bamiya', 'sikana', 'lichi-tomat'],
  'saharnyy-trostnik': ['lemongrass', 'vodnyy-kashtan', 'kolokaziya', 'banany'],
  cifomandra: ['banany', 'naranhilla', 'chayot', 'sikana'],
  ciklantera: ['momordika', 'trihozant', 'kivano', 'anguriya-siriyskaya'],
};

export const TEMPLATES = {
  chufa: 'chufa',
};
