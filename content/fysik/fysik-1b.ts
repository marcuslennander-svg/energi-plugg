import { buildChapter } from '../helpers';
import type { CourseSeed, SubjectSeed } from '../types';

const COURSE_ID = 'course-fysik-1b';

const SVG_POTENTIAL_HEIGHT = `<svg viewBox="0 0 360 130" width="100%" aria-label="Lägesenergi över vald nollnivå">
  <line x1="24" y1="108" x2="336" y2="108" stroke="currentColor" stroke-width="1.5" />
  <text x="28" y="123" font-size="11" fill="currentColor">Nollnivå h = 0 m (Ep = 0 J)</text>
  <line x1="120" y1="26" x2="210" y2="26" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
  <circle cx="165" cy="26" r="7" fill="var(--accent)" />
  <line x1="230" y1="26" x2="230" y2="108" stroke="var(--accent)" stroke-width="1.5" />
  <text x="238" y="70" font-size="12" fill="var(--accent)">h</text>
  <text x="158" y="16" font-size="11" fill="currentColor">m</text>
</svg>`;

const SVG_NO_FRICTION_SLOPE = `<svg viewBox="0 0 380 140" width="100%" aria-label="Friktionsfri bana med höjden h1 och farten v2 i dalen">
  <line x1="24" y1="118" x2="356" y2="118" stroke="currentColor" stroke-width="1.5" />
  <path d="M 40 28 C 145 28, 175 118, 336 118" fill="none" stroke="currentColor" stroke-width="1.5" />
  <rect x="36" y="18" width="14" height="10" fill="var(--accent)" />
  <line x1="43" y1="28" x2="43" y2="118" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 3" />
  <text x="50" y="76" font-size="11" fill="var(--accent)">h1</text>
  <rect x="304" y="108" width="14" height="10" fill="currentColor" />
  <line x1="322" y1="113" x2="348" y2="113" stroke="var(--accent)" stroke-width="1.5" />
  <text x="322" y="102" font-size="11" fill="var(--accent)">v2</text>
  <text x="26" y="133" font-size="11" fill="currentColor">Nollnivå h = 0 m</text>
</svg>`;

const SVG_FRICTION_BALANCE = `<svg viewBox="0 0 380 120" width="100%" aria-label="Glidande föremål med bromsande friktionskraft Ff">
  <line x1="24" y1="92" x2="356" y2="92" stroke="currentColor" stroke-width="1.5" />
  <rect x="148" y="64" width="44" height="28" fill="none" stroke="currentColor" stroke-width="1.5" />
  <line x1="196" y1="78" x2="256" y2="78" stroke="var(--accent)" stroke-width="1.5" />
  <text x="206" y="71" font-size="11" fill="var(--accent)">Rörelse (v)</text>
  <line x1="144" y1="86" x2="88" y2="86" stroke="currentColor" stroke-width="1.5" />
  <text x="92" y="79" font-size="11" fill="currentColor">Ff</text>
  <line x1="90" y1="104" x2="290" y2="104" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" />
  <text x="166" y="117" font-size="11" fill="var(--accent)">Sträcka s</text>
</svg>`;

const SVG_FORCE_DIAGRAM = `<svg viewBox="0 0 320 140" width="100%" aria-label="Krafter på en låda som dras över ett plant underlag">
  <line x1="24" y1="90" x2="296" y2="90" stroke="currentColor" stroke-width="1.5" />
  <rect x="132" y="54" width="56" height="36" fill="none" stroke="currentColor" stroke-width="1.5" />
  <line x1="160" y1="54" x2="160" y2="18" stroke="var(--accent)" stroke-width="1.5" />
  <text x="168" y="28" font-size="11" fill="var(--accent)">FN</text>
  <line x1="160" y1="90" x2="160" y2="128" stroke="currentColor" stroke-width="1.5" />
  <text x="168" y="124" font-size="11" fill="currentColor">Fg = m · g</text>
  <line x1="188" y1="72" x2="254" y2="72" stroke="var(--accent)" stroke-width="1.5" />
  <text x="204" y="65" font-size="11" fill="var(--accent)">Fdrag</text>
  <line x1="132" y1="72" x2="78" y2="72" stroke="currentColor" stroke-width="1.5" />
  <text x="86" y="65" font-size="11" fill="currentColor">Ff</text>
</svg>`;

const SVG_CIRCUIT_SIMPLE = `<svg viewBox="0 0 340 130" width="100%" aria-label="Enkel sluten strömkrets med spänningskälla och resistor">
  <rect x="60" y="24" width="220" height="82" fill="none" stroke="currentColor" stroke-width="1.5" />
  <line x1="50" y1="58" x2="70" y2="58" stroke="var(--accent)" stroke-width="2" />
  <line x1="54" y1="68" x2="66" y2="68" stroke="var(--accent)" stroke-width="1.5" />
  <text x="28" y="66" font-size="11" fill="var(--accent)">U</text>
  <rect x="142" y="14" width="56" height="20" fill="var(--gray-1)" stroke="var(--accent)" stroke-width="1.5" />
  <text x="164" y="28" font-size="11" fill="var(--accent)">R</text>
  <line x1="220" y1="106" x2="196" y2="106" stroke="var(--accent)" stroke-width="2" />
  <text x="166" y="122" font-size="11" fill="currentColor">Ström I</text>
</svg>`;

const chapter1 = buildChapter(COURSE_ID, {
  slug: 'energi-arbete-och-effekt',
  chapterNumber: 1,
  titleSv: 'Energi, arbete och effekt',
  summarySv:
    'Grunderna i mekaniskt arbete, lägesenergi, rörelseenergi, mekanisk energi med och utan friktion samt verkningsgrad enligt energiprincipen.',
  isFree: true,
  estimatedMinutes: 45,
  lessons: [
    {
      sectionSlug: 'energibegreppet',
      titleSv: 'Energibegreppet',
      overviewConcepts: [
        {
          term: 'Energi (E)',
          definition: 'Förmågan att uträtta mekaniskt arbete eller avge värme.',
          unit: 'J (joule)',
        },
        {
          term: 'Arbete (W)',
          definition:
            'Energiöverföring när en kraft flyttar ett föremål längs en sträcka i kraftens riktning.',
          unit: 'J (1 J = 1 N·m)',
        },
        {
          term: 'Energiprincipen',
          definition:
            'Energi kan varken skapas eller förstöras, bara omvandlas mellan olika energiformer. Totalenergin i ett slutet system är konstant.',
        },
        {
          term: 'Effekt (P)',
          definition: 'Utfört arbete eller omvandlad energi per tidsenhet.',
          unit: 'W (1 W = 1 J/s)',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Energiformer och energiprincipen',
          bodySv:
            'I fysiken är energi ett mått på förmågan att utföra arbete eller åstadkomma en förändring, exempelvis uppvärmning. Energi förekommer i flera former såsom lägesenergi, rörelseenergi, kemisk energi, elektrisk energi och termisk energi (värme). Enligt energiprincipen förblir den totala energin i ett slutet system alltid densamma — när en form minskar har lika mycket övergått till en eller flera andra former.',
          deepDiveSv:
            'SI-enheten joule kan uttryckas i grundenheterna som 1 J = 1 N·m = 1 kg·m²/s². Prefixet kilo betyder tusen, så 1 kJ = 1 000 J och 1 MJ = 1 000 000 J. I formler måste energi alltid anges i rena joule när övriga storheter är i meter, kilogram och sekunder.',
        },
        {
          heading: 'Mekaniskt arbete och effekt',
          bodySv:
            'När du lyfter eller drar ett föremål med en konstant kraft F i rörelsens riktning längs sträckan s utför du det mekaniska arbetet W = F · s. Om tyngden redan är angiven i newton (N) är detta värde direkt kraften F och ska inte multipliceras med g = 9,82 N/kg. Divideras arbetet med den tid t som förloppet tar får man medeleffekten P.',
          deepDiveSv:
            'Allmänt gäller W = F · s · cos α, där α är vinkeln mellan kraftens riktning och förflyttningen. När kraften är vinkelrät mot rörelsen (α = 90°) är cos 90° = 0 och kraften utför inget mekaniskt arbete.',
        },
      ],
      formulas: [
        {
          nameSv: 'Mekaniskt arbete',
          latex: 'W = F \\cdot s',
          explanationSv:
            'Gäller när kraften F verkar parallellt med förflyttningen s. Enheten 1 N·m motsvarar exakt 1 J.',
          variables: [
            { symbol: 'W', meaningSv: 'Arbete', unit: 'J' },
            { symbol: 'F', meaningSv: 'Kraft i rörelseriktningen', unit: 'N' },
            { symbol: 's', meaningSv: 'Sträcka', unit: 'm' },
          ],
        },
        {
          nameSv: 'Medeleffekt',
          latex: 'P = \\frac{W}{t}',
          explanationSv:
            'Anger hur snabbt energi omvandlas. En watt motsvarar en joule per sekund.',
          variables: [
            { symbol: 'P', meaningSv: 'Effekt', unit: 'W' },
            { symbol: 'W', meaningSv: 'Arbete eller överförd energi', unit: 'J' },
            { symbol: 't', meaningSv: 'Tid', unit: 's' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Lyfta en skolväska med given tyngd',
          givenSv: 'F = 65 N, s = 0,85 m',
          findSv: 'Lyftarbetet W',
          methodSv: 'Eftersom tyngden redan är angiven i newton används W = F · s direkt.',
          stepsSv: [
            'Kontrollera enheterna: kraften är i N och sträckan i m.',
            'Sätt in värdena: W = 65 · 0,85 = 55,25 J.',
            'Avrunda till två gällande siffror: W ≈ 55 J.',
          ],
          answerSv: 'Arbetet är 55 J.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Effekt vid ett lådlyft i kJ',
          givenSv: 'W = 3,6 kJ, F = 150 N, t = 12 s',
          findSv: 'Lyfthöjden s och medeleffekten P',
          methodSv: 'Omvandla kJ till J och lös ut s = W / F samt P = W / t.',
          stepsSv: [
            'Omvandla energi till SI-enhet: W = 3,6 kJ = 3 600 J.',
            'Beräkna sträckan: s = 3 600 / 150 = 24 m.',
            'Beräkna effekten: P = 3 600 / 12 = 300 W.',
          ],
          answerSv: 'Lyfthöjden är 24 m och effekten är 300 W.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Dragkraft i vinkel mot underlaget',
          givenSv: 'F = 120 N i vinkeln α = 35° mot horisontalplanet, s = 8,0 m, t = 4,0 s',
          findSv: 'Utfört arbete W och nyttig drageffekt P',
          methodSv: 'Använd kraftkomposanten i rörelseriktningen F_x = F · cos α.',
          stepsSv: [
            'Beräkna komposanten längs golvet: F_x = 120 · cos 35° ≈ 98,30 N.',
            'Beräkna arbetet: W = 98,30 · 8,0 ≈ 786,4 J.',
            'Beräkna medeleffekten: P = 786,4 / 4,0 ≈ 196,6 W ≈ 0,20 kW.',
          ],
          answerSv: 'Arbetet är 0,79 kJ och medeleffekten är 0,20 kW.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Tyngden står redan i newton',
          wrongApproachSv: 'Att multiplicera en given tyngd i N med g = 9,82 en gång till.',
          rightApproachSv: 'Står tyngden i N är kraften redan F. Använd W = F · s direkt.',
        },
        {
          trapTitleSv: 'Glömt prefix mellan kJ och J',
          wrongApproachSv: 'Att sätta in 5,0 kJ som talet 5,0 i formler med N, m och s.',
          rightApproachSv: 'Omvandla alltid kilojoule till joule först: 1 kJ = 1 000 J.',
        },
        {
          trapTitleSv: 'Energiprincipen tolkas som att energi försvinner',
          wrongApproachSv: 'Att skriva att energi förstörs eller tar slut vid friktion.',
          rightApproachSv: 'Energi kan aldrig förstöras; totalenergin är alltid bevarad och omvandlas oftast till värme.',
        },
      ],
    },
    {
      sectionSlug: 'lagesenergi',
      titleSv: 'Lägesenergi',
      overviewConcepts: [
        {
          term: 'Lägesenergi (Ep)',
          definition: 'Potentiell energi lagrad på grund av ett föremåls höjd över en vald nollnivå.',
          unit: 'J (joule)',
        },
        {
          term: 'Tyngdfaktor (g)',
          definition: 'Jordens tyngdkraft per kilogram massa i Sverige.',
          unit: '9,82 N/kg',
        },
        {
          term: 'Nollnivå',
          definition: 'Den referenshöjd där h = 0 m och lägesenergin definieras som Ep = 0 J.',
          unit: 'm',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Lägesenergi och val av nollnivå',
          bodySv:
            'Ett föremål med massan m som befinner sig på höjden h över en vald nollnivå har lägesenergin Ep = m · g · h. Ju större massa och ju högre höjd över nollnivån, desto mer energi finns lagrad. Nollnivån väljs fritt utifrån uppgiften — oftast marken, golvet eller dalens lägsta punkt — så länge samma nollnivå behålls genom hela beräkningen.',
          deepDiveSv:
            'För att lyfta ett föremål med konstant fart rakt upp krävs en lyftkraft lika stor som tyngden F = m · g. Lyftarbetet upp till höjden h blir då W = F · s = m · g · h = Ep. På jordytan i Sverige används standardvärdet g = 9,82 N/kg.',
          svgDiagram: SVG_POTENTIAL_HEIGHT,
        },
      ],
      formulas: [
        {
          nameSv: 'Lägesenergi (potentiell energi)',
          latex: 'E_p = m \\cdot g \\cdot h',
          explanationSv:
            'Beror linjärt av massan m och höjden h över den valda nollnivån, med g = 9{,}82 N/kg.',
          variables: [
            { symbol: 'E_p', meaningSv: 'Lägesenergi', unit: 'J' },
            { symbol: 'm', meaningSv: 'Massa', unit: 'kg' },
            { symbol: 'g', meaningSv: 'Tyngdfaktor (9,82)', unit: 'N/kg' },
            { symbol: 'h', meaningSv: 'Höjd över nollnivån', unit: 'm' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Simhoppare på trampolin',
          givenSv: 'm = 62 kg, h = 10 m, g = 9,82 N/kg',
          findSv: 'Simhopparens lägesenergi Ep relativt vattenytan',
          methodSv: 'Sätt vattenytan som nollnivå (h = 0 m) och beräkna Ep = m · g · h.',
          stepsSv: [
            'Ställ upp formeln: Ep = m · g · h.',
            'Sätt in värdena: Ep = 62 · 9,82 · 10 = 6 088,4 J.',
            'Avrunda: Ep ≈ 6,1 kJ.',
          ],
          answerSv: 'Lägesenergin är 6,1 kJ (6 088 J).',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Okänd höjd utifrån lagrad lägesenergi',
          givenSv: 'm = 25 kg, Ep = 1,473 kJ, g = 9,82 N/kg',
          findSv: 'Höjden h över golvet',
          methodSv: 'Omvandla energi till joule och lös ut h ur Ep = m · g · h.',
          stepsSv: [
            'Omvandla enheten: Ep = 1,473 kJ = 1 473 J.',
            'Lös ut höjden: h = Ep / (m · g).',
            'Beräkna: h = 1 473 / (25 · 9,82) = 1 473 / 245,5 = 6,0 m.',
          ],
          answerSv: 'Höjden är 6,0 m.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Val av nollnivå ovanför en källare',
          givenSv: 'Ett föremål (4,0 kg) flyttas från 1,2 m under marknivån till 2,3 m ovanför marknivån.',
          findSv: 'Förändringen i lägesenergi ΔEp',
          methodSv: 'Beräkna Ep vid slutläget minus Ep vid startläget med marken som nollnivå.',
          stepsSv: [
            'Vid start är h₁ = −1,2 m, vilket ger Ep₁ = 4,0 · 9,82 · (−1,2) = −47,136 J.',
            'Vid slutet är h₂ = 2,3 m, vilket ger Ep₂ = 4,0 · 9,82 · 2,3 = 90,344 J.',
            'Skillnaden blir ΔEp = Ep₂ − Ep₁ = 90,344 − (−47,136) = 137,48 J ≈ 137 J.',
          ],
          answerSv: 'Lägesenergin ökar med 137 J, oberoende av vilken nollnivå som väljs.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömt tyngdfaktorn g = 9,82 N/kg',
          wrongApproachSv: 'Att räkna Ep = m · h utan g = 9,82 N/kg.',
          rightApproachSv: 'Multiplicera alltid massan i kg med g = 9,82 N/kg för att få tyngden i newton.',
        },
        {
          trapTitleSv: 'Otydlig eller bytt nollnivå mitt i uppgiften',
          wrongApproachSv: 'Att mäta h₁ från golvet och h₂ från bordsskivan i samma ekvation.',
          rightApproachSv: 'Bestäm en fast nollnivå (h = 0 m) från början och mät alla höjder från den.',
        },
      ],
    },
    {
      sectionSlug: 'rorelseenergi',
      titleSv: 'Rörelseenergi',
      overviewConcepts: [
        {
          term: 'Rörelseenergi (Ek)',
          definition: 'Kinetisk energi som ett föremål har på grund av sin massa och fart.',
          unit: 'J (joule)',
        },
        {
          term: 'Fartomvandling',
          definition: 'Omvandling mellan km/h och m/s via faktorn 3,6.',
          unit: 'm/s',
        },
        {
          term: 'Kvadratiskt fartberoende',
          definition:
            'Eftersom farten v är kvadrerad ger faktor k i fart hela k² gånger större rörelseenergi.',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Rörelseenergi och fartberoende',
          bodySv:
            'Ett föremål i rörelse med massan m och farten v har rörelseenergin Ek = (m · v²) / 2. Farten måste alltid anges i SI-enheten m/s innan den sätts in i formeln; står farten i km/h dividerar du med 3,6. Eftersom v är upphöjt till två växer rörelseenergin snabbt med farten — dubbel fart ger fyra gånger så stor rörelseenergi och därmed fyra gånger så lång bromssträcka vid samma bromskraft.',
          deepDiveSv:
            'Härledning: Vid konstant acceleration a från vila gäller F = m · a och v² = 2 · a · s, vilket ger s = v² / (2a). Arbetet blir då W = F · s = m · a · v² / (2a) = ½ · m · v². Omvandlingsfaktorn 3,6 kommer från att 1 km/h = 1 000 m / 3 600 s = 1 / 3,6 m/s.',
        },
      ],
      formulas: [
        {
          nameSv: 'Rörelseenergi (kinetisk energi)',
          latex: 'E_k = \\frac{m \\cdot v^2}{2}',
          explanationSv:
            'Farten v måste vara i m/s. Vid förändring av farten med faktorn k ändras Ek med faktorn k².',
          variables: [
            { symbol: 'E_k', meaningSv: 'Rörelseenergi', unit: 'J' },
            { symbol: 'm', meaningSv: 'Massa', unit: 'kg' },
            { symbol: 'v', meaningSv: 'Fart', unit: 'm/s' },
          ],
        },
        {
          nameSv: 'Fartomvandling',
          latex: 'v_{\\text{m/s}} = \\frac{v_{\\text{km/h}}}{3{,}6}',
          explanationSv:
            'Dividera km/h med 3,6 för att få m/s, och multiplicera m/s med 3,6 för att få km/h.',
          variables: [
            { symbol: 'v_{\\text{m/s}}', meaningSv: 'Fart i SI-enhet', unit: 'm/s' },
            { symbol: 'v_{\\text{km/h}}', meaningSv: 'Fart i kilometer per timme', unit: 'km/h' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Personbil i stadstrafik',
          givenSv: 'm = 1 400 kg, v = 72 km/h',
          findSv: 'Bilens rörelseenergi Ek',
          methodSv: 'Omvandla först farten till m/s och beräkna sedan Ek = (m · v²) / 2.',
          stepsSv: [
            'Omvandla farten: v = 72 / 3,6 = 20 m/s.',
            'Beräkna rörelseenergin: Ek = (1 400 · 20²) / 2 = (1 400 · 400) / 2 = 280 000 J.',
            'Skriv med prefix: Ek = 280 kJ.',
          ],
          answerSv: 'Bilens rörelseenergi är 280 kJ (280 000 J).',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Bestäm farten ur given rörelseenergi',
          givenSv: 'm = 80 kg, Ek = 14,4 kJ',
          findSv: 'Farten v i m/s och km/h',
          methodSv: 'Omvandla kJ till J och lös ut v = √(2 · Ek / m).',
          stepsSv: [
            'Omvandla energi: Ek = 14,4 kJ = 14 400 J.',
            'Lös ut v²: v² = (2 · 14 400) / 80 = 360.',
            'Ta kvadratroten: v = √360 ≈ 18,97 m/s ≈ 19 m/s.',
            'Omvandla till km/h: 18,97 · 3,6 ≈ 68 km/h.',
          ],
          answerSv: 'Farten är 19 m/s (cirka 68 km/h).',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Jämförelse av bromssträcka vid fartökning',
          givenSv: 'En cyklist ökar farten från 18 km/h till 54 km/h.',
          findSv: 'Med vilken faktor ökar rörelseenergin och den minimala bromssträckan?',
          methodSv: 'Jämför fartkvoten k = v₂ / v₁ och utnyttja att W_broms = F_broms · s = Ek.',
          stepsSv: [
            'Beräkna fartfaktorn: k = 54 / 18 = 3,0 (farten tredubblas).',
            'Eftersom Ek är proportionell mot v² blir Ek,2 / Ek,1 = k² = 3,0² = 9,0.',
            'Vid samma bromskraft F är bromssträckan s = Ek / F också 9 gånger längre.',
          ],
          answerSv: 'Rörelseenergin och bromssträckan blir 9 gånger så stora.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Fart i km/h insatt direkt eller multiplicerad med 3,6',
          wrongApproachSv: 'Att sätta v = 72 direkt i Ek eller räkna 72 · 3,6 = 259,2 m/s.',
          rightApproachSv: 'Dela alltid km/h med 3,6: 72 / 3,6 = 20 m/s. Farten i m/s ska alltid ha lägre siffervärde än i km/h.',
        },
        {
          trapTitleSv: 'Glömt kvadraten på farten v²',
          wrongApproachSv: 'Att anta att dubbel fart ger dubbel rörelseenergi.',
          rightApproachSv: 'Eftersom farten står i kvadrat ger dubbel fart 2² = 4 gånger så stor rörelseenergi.',
        },
      ],
      interactiveWidgetType: 'unit_converter',
      interactiveConfig: {
        defaultKmh: 72,
        defaultKj: 8.5,
        modes: ['speed', 'energy', 'formula'],
      },
    },
    {
      sectionSlug: 'mekanisk-energi',
      titleSv: 'Mekanisk energi',
      overviewConcepts: [
        {
          term: 'Mekanisk energi (Emek)',
          definition: 'Summan av ett föremåls lägesenergi och rörelseenergi i samma ögonblick.',
          unit: 'J (joule)',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Summan av läges- och rörelseenergi',
          bodySv:
            'Ett föremål som både befinner sig på en höjd över nollnivån och rör sig samtidigt har både lägesenergi och rörelseenergi. Den totala mekaniska energin i det läget är summan Emek = Ep + Ek. För att jämföra mekanisk energi mellan två tidpunkter måste båda termerna beräknas med samma nollnivå och i rena SI-enheter.',
          deepDiveSv:
            'Fullständigt skrivs den mekaniska energin som Emek = m · g · h + ½ · m · v². I många förlopp växlar energin kontinuerligt mellan Ep och Ek medan summan Emek hålls konstant (utan friktion) eller avtar (med friktion).',
        },
      ],
      formulas: [
        {
          nameSv: 'Total mekanisk energi',
          latex: 'E_{\\text{mek}} = E_p + E_k = m \\cdot g \\cdot h + \\frac{m \\cdot v^2}{2}',
          explanationSv:
            'Summerar kroppens höjdenergi och rörelseenergi vid samma tidpunkt och samma nollnivå.',
          variables: [
            { symbol: 'E_{\\text{mek}}', meaningSv: 'Mekanisk energi', unit: 'J' },
            { symbol: 'E_p', meaningSv: 'Lägesenergi', unit: 'J' },
            { symbol: 'E_k', meaningSv: 'Rörelseenergi', unit: 'J' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Drönare i rörelse på hög höjd',
          givenSv: 'm = 1,5 kg, h = 18 m, v = 6,0 m/s',
          findSv: 'Drönarens mekaniska energi Emek',
          methodSv: 'Beräkna Ep och Ek var för sig och addera dem.',
          stepsSv: [
            'Lägesenergi: Ep = 1,5 · 9,82 · 18 = 265,14 J.',
            'Rörelseenergi: Ek = (1,5 · 6,0²) / 2 = 27,0 J.',
            'Summa: Emek = 265,14 + 27,0 = 292,14 J ≈ 292 J.',
          ],
          answerSv: 'Den mekaniska energin är 292 J.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Räkna baklänges från känd mekanisk energi',
          givenSv: 'En fågel (0,40 kg) har Emek = 67,4 J på höjden 12 m.',
          findSv: 'Fågelns fart v',
          methodSv: 'Beräkna Ep, subtrahera från Emek för att få Ek, och lös ut v.',
          stepsSv: [
            'Ep = 0,40 · 9,82 · 12 = 47,136 J.',
            'Ek = Emek − Ep = 67,4 − 47,136 = 20,264 J.',
            'v = √((2 · 20,264) / 0,40) = √101,32 ≈ 10,1 m/s.',
          ],
          answerSv: 'Fågelns fart är cirka 10 m/s.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Andel lägesenergi i ett kast',
          givenSv: 'En boll har farten v₀ vid golvet (h = 0). Vid höjden h₁ är farten hälften så stor (v₁ = 0,5 · v₀).',
          findSv: 'Hur stor andel av den mekaniska energin består av lägesenergi vid höjden h₁ (utan luftmotstånd)?',
          methodSv: 'Utnyttja att Ek är proportionell mot v² och att Emek = Ek,0.',
          stepsSv: [
            'Vid golvet är hela energin Ek,0 = ½ · m · v₀².',
            'Vid höjden h₁ är farten 0,5 · v₀, så Ek,1 = ½ · m · (0,5 · v₀)² = 0,25 · Ek,0.',
            'Eftersom Emek bevaras måste resten vara lägesenergi: Ep,1 = Emek − 0,25 · Emek = 0,75 · Emek.',
          ],
          answerSv: '75 % av den mekaniska energin utgörs av lägesenergi.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Blanda ihop Ep och Ek vid avläsning',
          wrongApproachSv: 'Att bara ange Ep eller bara Ek när uppgiften frågar efter den mekaniska energin.',
          rightApproachSv: 'Mekanisk energi är alltid summan Emek = Ep + Ek.',
        },
      ],
    },
    {
      sectionSlug: 'utan-friktion',
      titleSv: 'Utan friktion',
      overviewConcepts: [
        {
          term: 'Bevarande av mekanisk energi',
          definition:
            'När ingen friktion eller luftmotstånd verkar är summan Ep + Ek konstant genom hela rörelsen.',
          unit: 'J',
        },
        {
          term: 'Massans förkortning',
          definition:
            'Eftersom både m·g·h och ½m·v² innehåller massan m kan m förkortas bort om ingen friktionskraft är given.',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Energiomvandling utan energiförluster',
          bodySv:
            'När ett föremål glider, faller eller pendlar utan friktion eller luftmotstånd är den mekaniska energin lika stor före som efter: Ep1 + Ek1 = Ep2 + Ek2. Lägesenergi kan omvandlas fullständigt till rörelseenergi på väg neråt, och rörelseenergi kan omvandlas tillbaka till lägesenergi på väg uppåt. Om föremålet startar från vila på höjden h₁ och når nollnivån h₂ = 0 m ger energibalansen direkt farten v₂ = √(2 · g · h₁).',
          deepDiveSv:
            'Ställ upp m · g · h₁ + 0 = 0 + ½ · m · v₂². Dividera båda led med massan m så försvinner m: g · h₁ = ½ · v₂², vilket ger v₂ = √(2 · g · h₁) och h₁ = v₂² / (2 · g). Farten i botten beror alltså inte på vagnens massa eller banans form, utan enbart på höjdskillnaden.',
          svgDiagram: SVG_NO_FRICTION_SLOPE,
        },
      ],
      formulas: [
        {
          nameSv: 'Mekanisk energibalans utan friktion',
          latex: 'E_{p1} + E_{k1} = E_{p2} + E_{k2}',
          explanationSv:
            'Total mekanisk energi i läge 1 är lika med total mekanisk energi i läge 2 när inga förluster förekommer.',
          variables: [
            { symbol: 'E_{p1}, E_{k1}', meaningSv: 'Läges- och rörelseenergi före', unit: 'J' },
            { symbol: 'E_{p2}, E_{k2}', meaningSv: 'Läges- och rörelseenergi efter', unit: 'J' },
          ],
        },
        {
          nameSv: 'Fart i dalen från vila',
          latex: 'v_2 = \\sqrt{2 \\cdot g \\cdot h_1}',
          explanationSv:
            'Specialfall då föremålet startar från vila (v₁ = 0) vid höjden h₁ och når nollnivån (h₂ = 0). Massan förkortas bort.',
          variables: [
            { symbol: 'v_2', meaningSv: 'Fart vid nollnivån', unit: 'm/s' },
            { symbol: 'g', meaningSv: 'Tyngdfaktor (9,82)', unit: 'N/kg' },
            { symbol: 'h_1', meaningSv: 'Starthöjd', unit: 'm' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Berg- och dalbana från vila',
          givenSv: 'h₁ = 24 m, v₁ = 0 m/s, h₂ = 0 m (utan friktion)',
          findSv: 'Vagnens fart v₂ i dalen',
          methodSv: 'Massan saknas och förkortas bort. Använd v₂ = √(2 · g · h₁).',
          stepsSv: [
            'Ställ upp energibevarelsen: m · g · h₁ = ½ · m · v₂².',
            'Förkorta bort m: v₂ = √(2 · 9,82 · 24) = √471,36.',
            'Beräkna roten: v₂ ≈ 21,7 m/s (cirka 78 km/h).',
          ],
          answerSv: 'Vagnens fart i dalen är 21,7 m/s.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Pendelkula som passerar ny höjd',
          givenSv: 'En skateboardåkare åker upp i en ramp med farten v₁ = 6,0 m/s i botten (h₁ = 0 m).',
          findSv: 'Högsta höjden h₂ utan friktion',
          methodSv: 'Vid vändpunkten längst upp är v₂ = 0 m/s så all Ek har blivit Ep.',
          stepsSv: [
            'Ställ upp ½ · m · v₁² = m · g · h₂ och förkorta bort m.',
            'Lös ut h₂: h₂ = v₁² / (2 · g).',
            'Sätt in talen: h₂ = 6,0² / (2 · 9,82) = 36 / 19,64 ≈ 1,83 m.',
          ],
          answerSv: 'Åkaren når höjden 1,8 m.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Kulle mellan två dalnivåer med startfart',
          givenSv: 'En vagn passerar en starttopp på h₁ = 18 m med farten v₁ = 4,0 m/s och rullar sedan upp på nästa kulle på h₂ = 8,0 m utan friktion.',
          findSv: 'Farten v₂ på den andra kullen',
          methodSv: 'Använd hela balansen m·g·h₁ + ½m·v₁² = m·g·h₂ + ½m·v₂² och förkorta m.',
          stepsSv: [
            'Förkorta bort m i samtliga fyra termer: g · h₁ + ½ · v₁² = g · h₂ + ½ · v₂².',
            'Lös ut ½ · v₂² = g · (h₁ − h₂) + ½ · v₁².',
            'Sätt in värdena: ½ · v₂² = 9,82 · (18 − 8,0) + ½ · 4,0² = 98,2 + 8,0 = 106,2.',
            'Multiplicera med 2 och ta roten: v₂ = √(212,4) ≈ 14,6 m/s.',
          ],
          answerSv: 'Farten på kullen är 14,6 m/s.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Tro att uppgiften saknar massa m och är olösbar',
          wrongApproachSv: 'Att ge upp eller gissa m = 1 kg utan att motivera varför massan inte påverkar svaret.',
          rightApproachSv: 'Skriv ut ekvationen med m på båda sidor och förkorta bort m algebraiskt.',
        },
      ],
      interactiveWidgetType: 'energy_sim',
      interactiveConfig: {
        defaultHeight: 24,
        defaultMass: 50,
        defaultFriction: false,
        presets: [
          { label: 'Berg- och dalbana (24 m)', heightM: 24, massKg: 80, frictionPct: 0 },
          { label: 'Pulka med friktion (45 kg, 8 m)', heightM: 8, massKg: 45, frictionPct: 42.6 },
        ],
      },
    },
    {
      sectionSlug: 'med-friktion',
      titleSv: 'Med friktion',
      overviewConcepts: [
        {
          term: 'Friktionsarbete (Wf)',
          definition:
            'Den mekaniska energi som omvandlas till termisk energi (värme) under en rörelse med friktion eller luftmotstånd.',
          unit: 'J (joule)',
        },
        {
          term: 'Friktionskraft (Ff)',
          definition: 'Bromsande kraft som verkar mot rörelsens riktning längs glidsträckan s.',
          unit: 'N (newton)',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Friktionsarbete och energiförlust till värme',
          bodySv:
            'I verkligheten finns nästan alltid friktion och luftmotstånd. Då är den mekaniska energin efteråt mindre än den mekaniska energin före. Skillnaden har inte förstörts utan omvandlats till värme (termisk energi) i kontaktytorna och omgivande luft. Värmeförlusten kallas friktionsarbete Wf och följer sambandet Emek,före = Emek,efter + Wf.',
          deepDiveSv:
            'Om friktionskraften Ff verkar längs glidsträckan s beräknas värmeförlusten även som Wf = Ff · s. Medelfriktionskraften längs en given sträcka kan därför bestämmas som Ff = (Emek,före − Emek,efter) / s.',
          svgDiagram: SVG_FRICTION_BALANCE,
        },
      ],
      formulas: [
        {
          nameSv: 'Energibalans med friktion',
          latex: 'E_{\\text{mek, före}} = E_{\\text{mek, efter}} + W_f',
          explanationSv:
            'Skillnaden mellan mekanisk energi före och efter förloppet motsvarar exakt den värmeenergi Wf som bildats.',
          variables: [
            { symbol: 'E_{\\text{mek, före}}', meaningSv: 'Mekanisk energi i startläget', unit: 'J' },
            { symbol: 'E_{\\text{mek, efter}}', meaningSv: 'Mekanisk energi i slutläget', unit: 'J' },
            { symbol: 'W_f', meaningSv: 'Friktionsarbete (värmeförlust)', unit: 'J' },
          ],
        },
        {
          nameSv: 'Friktionsarbete via kraft och sträcka',
          latex: 'W_f = F_f \\cdot s',
          explanationSv:
            'Ger sambandet mellan friktionskraft Ff, glidsträcka s och utvecklad värme Wf.',
          variables: [
            { symbol: 'W_f', meaningSv: 'Friktionsarbete', unit: 'J' },
            { symbol: 'F_f', meaningSv: 'Medelfriktionskraft', unit: 'N' },
            { symbol: 's', meaningSv: 'Glidsträcka', unit: 'm' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Värmeutveckling hos en bromsad kälke',
          givenSv: 'Ff = 80 N, s = 25 m',
          findSv: 'Friktionsarbetet Wf',
          methodSv: 'Beräkna produkten av friktionskraften och sträckan: Wf = Ff · s.',
          stepsSv: [
            'Ställ upp Wf = Ff · s.',
            'Beräkna: Wf = 80 · 25 = 2 000 J = 2,0 kJ.',
          ],
          answerSv: 'Friktionsarbetet är 2 000 J (2,0 kJ).',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Pulka i backe med energiförlust',
          givenSv: 'm = 45 kg, starthöjd h₁ = 8,0 m (v₁ = 0), slutfart v₂ = 9,5 m/s vid h₂ = 0 m',
          findSv: 'Hur stor energi Wf som blev värme',
          methodSv: 'Beräkna Ep1 och Ek2 och ta skillnaden Wf = Ep1 − Ek2.',
          stepsSv: [
            'Startenergi: Ep1 = 45 · 9,82 · 8,0 = 3 535,2 J.',
            'Slutenergi: Ek2 = (45 · 9,5²) / 2 = 2 030,6 J.',
            'Värmeförlust: Wf = 3 535,2 − 2 030,6 = 1 504,6 J ≈ 1,5 kJ.',
          ],
          answerSv: '1 505 J (cirka 1,5 kJ) har omvandlats till värme.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Medelfriktionskraft längs en skidbacke',
          givenSv: 'En skidåkare (70 kg) åker från vila på höjden 12 m längs en 50 m lång backe och når farten 11 m/s i dalen.',
          findSv: 'Medelfriktionskraften Ff längs backen',
          methodSv: 'Beräkna Wf = Ep1 − Ek2 och dividera sedan med backens längd s = 50 m.',
          stepsSv: [
            'Ep1 = 70 · 9,82 · 12 = 8 248,8 J.',
            'Ek2 = (70 · 11²) / 2 = 4 235,0 J.',
            'Wf = 8 248,8 − 4 235,0 = 4 013,8 J.',
            'Ff = Wf / s = 4 013,8 / 50 ≈ 80,3 N ≈ 80 N.',
          ],
          answerSv: 'Medelfriktionskraften är 80 N.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömt omvandla till värme eller subtraherat i fel ordning',
          wrongApproachSv: 'Att ta Ek2 − Ep1 och få ett negativt värde på friktionsvärmen utan att reflektera.',
          rightApproachSv: 'När friktion bromsar är energin före alltid större än energin efter: Wf = Emek,före − Emek,efter > 0.',
        },
      ],
    },
    {
      sectionSlug: 'verkningsgrad',
      titleSv: 'Verkningsgrad',
      overviewConcepts: [
        {
          term: 'Verkningsgrad (η)',
          definition: 'Andelen av den tillförda energin som omvandlas till önskad nyttig energi.',
          unit: 'Saknar enhet (0 till 1 eller 0–100 %)',
        },
        {
          term: 'Energiförlust',
          definition: 'Skillnaden E_tillförd − E_nyttig som inte utnyttjas till avsett ändamål.',
          unit: 'J (joule)',
        },
      ],
      theoryBlocks: [
        {
          heading: 'Andel nyttig energi',
          bodySv:
            'Ingen apparat eller motor kan omvandla all tillförd energi till nyttigt arbete; en del går alltid förlorad som värme. Verkningsgraden η (grekiska bokstaven eta) definieras som kvoten mellan nyttig energi och tillförd energi. Eftersom joule dividerat med joule tar ut varandra saknar verkningsgraden enhet och ligger alltid mellan 0 och 1 (motsvarande 0 % till 100 %).',
          deepDiveSv:
            'Eftersom energi = effekt · tid och tiden t är densamma för tillförsel och nyttig uttagning gäller även effektkvoten η = P_nyttig / P_tillförd. Ett värde över 100 % skulle strida mot energiprincipen.',
        },
      ],
      formulas: [
        {
          nameSv: 'Verkningsgrad via energi',
          latex: '\\eta = \\frac{E_{\\text{nyttig}}}{E_{\\text{tillförd}}}',
          explanationSv:
            'Nyttig energi divideras med totalt tillförd energi i samma enhet. Multiplicera med 100 för procent.',
          variables: [
            { symbol: '\\eta', meaningSv: 'Verkningsgrad', unit: 'Enhetslös (0–1)' },
            { symbol: 'E_{\\text{nyttig}}', meaningSv: 'Nyttig energi', unit: 'J' },
            { symbol: 'E_{\\text{tillförd}}', meaningSv: 'Totalt tillförd energi', unit: 'J' },
          ],
        },
        {
          nameSv: 'Verkningsgrad via effekt',
          latex: '\\eta = \\frac{P_{\\text{nyttig}}}{P_{\\text{tillförd}}}',
          explanationSv:
            'Likvärdigt samband när medeleffekten under samma tidsintervall är känd.',
          variables: [
            { symbol: 'P_{\\text{nyttig}}', meaningSv: 'Nyttig uteffekt', unit: 'W' },
            { symbol: 'P_{\\text{tillförd}}', meaningSv: 'Tillförd ineffekt', unit: 'W' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Vinsch som lyfter tung last',
          givenSv: 'm = 120 kg lyfts h = 5,0 m, E_tillförd = 8 500 J',
          findSv: 'Vinschens verkningsgrad η',
          methodSv: 'Den nyttiga energin är lyftets lägesenergi Ep = m · g · h.',
          stepsSv: [
            'Beräkna nyttig energi: E_nyttig = 120 · 9,82 · 5,0 = 5 892 J.',
            'Dividera med tillförd energi: η = 5 892 / 8 500 ≈ 0,693.',
            'Uttryck i procent: η ≈ 69 %.',
          ],
          answerSv: 'Verkningsgraden är 0,69 eller 69 %.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Nödvändig elektrisk energi för vattenkokare',
          givenSv: 'För att värma vatten krävs E_nyttig = 252 kJ. Vattenkokarens verkningsgrad är 84 %.',
          findSv: 'Tillförd elektrisk energi E_tillförd',
          methodSv: 'Lös ut E_tillförd = E_nyttig / η med η = 0,84.',
          stepsSv: [
            'Skriv η i decimalform: 84 % = 0,84.',
            'Beräkna E_tillförd = 252 / 0,84 = 300 kJ.',
          ],
          answerSv: 'Det krävs 300 kJ elektrisk energi.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Två seriekopplade energiomvandlingar',
          givenSv: 'Ett vattenkraftverk har turbinverkningsgraden 90 % och generatorverkningsgraden 95 %. Tillförd effekt är 40 MW.',
          findSv: 'Total verkningsgrad och levererad elektrisk effekt',
          methodSv: 'Den sammanlagda verkningsgraden är produkten η_tot = η₁ · η₂.',
          stepsSv: [
            'Beräkna total verkningsgrad: η_tot = 0,90 · 0,95 = 0,855 (85,5 %).',
            'Beräkna levererad effekt: P_nyttig = 0,855 · 40 = 34,2 MW.',
          ],
          answerSv: 'Totala verkningsgraden är 85,5 % och uteffekten är 34,2 MW.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Dela tillförd med nyttig energi',
          wrongApproachSv: 'Att ta E_tillförd / E_nyttig och få ett svar över 100 %, exempelvis 143 %.',
          rightApproachSv: 'Nyttig energi är alltid högst lika stor som tillförd energi, så η ≤ 100 % alltid.',
        },
        {
          trapTitleSv: 'Glömt göra om kJ till J i bara ena ledet',
          wrongApproachSv: 'Att räkna 3 500 J / 5,0 kJ = 700.',
          rightApproachSv: 'Skriv båda storheterna i samma enhet först: 3 500 J / 5 000 J = 0,70 = 70 %.',
        },
      ],
    },
  ],
  questions: [
    // Migrated 20 questions from legacy/prototype-fysik1b.html + 4 numeric questions
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Lägesenergi',
      promptSv: 'Vad avgör hur stor ett föremåls potentiella energi (Ep) är i jordens tyngdfält?',
      latexFormula: 'E_p = m \\cdot g \\cdot h',
      options: [
        'Föremålets massa och höjd över en vald nollnivå',
        'Föremålets massa och fart',
        'Endast föremålets höjd över havsytan',
        'Föremålets volym och friktion',
      ],
      correctAnswer: '0',
      hintSv: 'Titta på storheterna i Ep = m · g · h.',
      stepBySolutionSv:
        'Ep = m · g · h beror direkt på föremålets massa m och höjden h över den valda nollnivån.',
      deepDerivationSv:
        'Eftersom g = 9,82 N/kg är konstant nära jordytan avgörs Ep proportionellt av massan m och höjden h relativt vald nollnivå.',
      relatedSectionSlug: 'lagesenergi',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Rörelseenergi',
      promptSv: 'En cyklist ökar sin fart till det dubbla. Vad händer med den kinetiska energin?',
      latexFormula: 'E_k = \\frac{m \\cdot v^2}{2}',
      options: [
        'Den blir dubbelt så stor',
        'Den blir fyra gånger så stor',
        'Den blir hälften så stor',
        'Den ändras inte',
      ],
      correctAnswer: '1',
      hintSv: 'Farten v är upphöjt till 2 i formeln för rörelseenergi.',
      stepBySolutionSv:
        'Eftersom farten är kvadrerad ger dubbel fart 2² = 4 gånger så stor rörelseenergi.',
      deepDerivationSv: 'E_k,ny = ½ · m · (2v)² = 4 · (½ · m · v²).',
      relatedSectionSlug: 'rorelseenergi',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Rörelseenergi',
      promptSv:
        'Du ska räkna ut kinetisk energi för en bil som kör i 108 km/h. Vilket värde på v ska du sätta in?',
      options: ['108 m/s', '30 m/s', '388,8 m/s', '10,8 m/s'],
      correctAnswer: '1',
      hintSv: 'Dela farten i km/h med 3,6.',
      stepBySolutionSv: 'v = 108 / 3,6 = 30 m/s.',
      deepDerivationSv:
        '108 000 m / 3 600 s = 30 m/s. Multiplicerar man med 3,6 får man fällan 388,8 m/s.',
      relatedSectionSlug: 'rorelseenergi',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Mekanisk energi',
      promptSv: 'Vad är mekanisk energi (Emek)?',
      options: [
        'Skillnaden mellan lägesenergi och värme',
        'Summan av potentiell energi och kinetisk energi',
        'Endast energi som blir friktion',
        'Verkningsgrad gånger effekt',
      ],
      correctAnswer: '1',
      hintSv: 'Lägesenergi plus rörelseenergi i samma läge.',
      stepBySolutionSv: 'Mekanisk energi är summan av potentiell och kinetisk energi: Emek = Ep + Ek.',
      deepDerivationSv:
        'Storheten sammanfattar föremålets makroskopiska höjdenergi och rörelseenergi relativt samma nollnivå.',
      relatedSectionSlug: 'mekanisk-energi',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Utan friktion',
      promptSv:
        'En kula släpps från vila i en friktionsfri backe. Du vet höjden h₁ men inte massan m. Kan farten ändå räknas ut?',
      latexFormula: 'm \\cdot g \\cdot h_1 = \\frac{m \\cdot v_2^2}{2}',
      options: [
        'Nej, massan m behövs alltid',
        'Ja, för massan m finns på båda sidor och förkortas bort',
        'Ja, om man gissar m = 1 kg',
        'Nej, man behöver kulans radie',
      ],
      correctAnswer: '1',
      hintSv: 'Skriv upp energiekvationen m · g · h₁ = (m · v₂²) / 2.',
      stepBySolutionSv:
        'Massan m finns i båda leden och kan divideras bort, vilket ger v₂ = √(2 · g · h₁).',
      deepDerivationSv: 'm · g · h₁ = ½ · m · v₂² delas med m så att g · h₁ = ½ · v₂².',
      relatedSectionSlug: 'utan-friktion',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Med friktion',
      promptSv:
        'En låda glider nerför en ramp med friktion. Vart tar den saknade mekaniska energin vägen?',
      options: [
        'Den blir ny lägesenergi',
        'Den förblir oförändrad',
        'Den omvandlas till termisk energi (värme)',
        'Den försvinner helt',
      ],
      correctAnswer: '2',
      hintSv: 'Energiprincipen gäller alltid.',
      stepBySolutionSv:
        'Den saknade mekaniska energin omvandlas till termisk energi (värme) genom friktionsarbetet Wf.',
      deepDerivationSv:
        'Friktionsarbetet Wf = Ff · s överför mekanisk energi till molekylrörelse (värme) i glidytorna.',
      relatedSectionSlug: 'med-friktion',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Verkningsgrad',
      promptSv: 'Vilket påstående om verkningsgrad (η) är rätt?',
      latexFormula: '\\eta = \\frac{E_{\\text{nyttig}}}{E_{\\text{tillförd}}}',
      options: [
        'Mäts i joule och kan vara över 100 %',
        'Mäts i watt',
        'Saknar enhet och ligger mellan 0 och 1 (0 till 100 %)',
        'Beräknas som tillförd energi delat med nyttig energi',
      ],
      correctAnswer: '2',
      hintSv: 'Jämför enheterna i täljare och nämnare i formeln för η.',
      stepBySolutionSv:
        'Verkningsgraden saknar enhet eftersom joule delas med joule, och kan högst vara 1 (100 %).',
      deepDerivationSv: 'Värden över 100 % skulle innebära att energi skapas ur intet.',
      relatedSectionSlug: 'verkningsgrad',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Utan friktion',
      promptSv:
        'En vagn i en friktionsfri bana når botten (nollnivån h = 0 m). Hur fördelar sig energin där?',
      options: [
        'All energi är lägesenergi',
        'All mekanisk energi är rörelseenergi och Ep = 0 J',
        'Hälften är värme',
        'Både Ep och Ek är 0 J',
      ],
      correctAnswer: '1',
      hintSv: 'Vid nollnivån h = 0 m är Ep = 0 J.',
      stepBySolutionSv:
        'Vid h = 0 m är Ep = 0 J, så hela den mekaniska energin utgörs av rörelseenergi Ek.',
      deepDerivationSv:
        'All lägesenergi från toppen har omvandlats utan förlust till rörelseenergi.',
      relatedSectionSlug: 'utan-friktion',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Lägesenergi — beräkning',
      promptSv:
        'En ryggsäck (8,0 kg) lyfts 2,5 m upp från golvet. Hur stor är dess lägesenergi? (g = 9,82 N/kg)',
      options: ['196 J', '20 J', '78,6 J', '393 J'],
      correctAnswer: '0',
      hintSv: 'Använd Ep = m · g · h.',
      stepBySolutionSv: 'Ep = 8,0 · 9,82 · 2,5 = 196,4 J ≈ 196 J.',
      deepDerivationSv: 'Svarsalternativet 20 J fås om man glömmer att multiplicera med g = 9,82.',
      relatedSectionSlug: 'lagesenergi',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Rörelseenergi — beräkning',
      promptSv: 'En moped med förare (150 kg) kör i 36 km/h. Hur stor är rörelseenergin?',
      options: ['7,5 kJ', '15 kJ', '97,2 kJ', '750 J'],
      correctAnswer: '0',
      hintSv: 'Omvandla 36 km/h till m/s innan du sätter in i Ek.',
      stepBySolutionSv:
        'v = 36 / 3,6 = 10 m/s ger Ek = (150 · 10²) / 2 = 7 500 J = 7,5 kJ.',
      deepDerivationSv:
        '97,2 kJ är fällan utan division med 3,6 och 750 J fås utan kvadrat på farten.',
      relatedSectionSlug: 'rorelseenergi',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Mekanisk energi — beräkning',
      promptSv: 'En fågel (0,50 kg) flyger på höjden 10 m med farten 8,0 m/s. Vad är den mekaniska energin?',
      options: ['65 J', '49 J', '16 J', '81 J'],
      correctAnswer: '0',
      hintSv: 'Beräkna Ep och Ek var för sig och addera dem.',
      stepBySolutionSv: 'Ep = 0,50 · 9,82 · 10 = 49,1 J och Ek = (0,50 · 8,0²) / 2 = 16,0 J. Summan Emek = 65,1 J ≈ 65 J.',
      deepDerivationSv: 'Både höjdenergin och rörelseenergin måste räknas samman.',
      relatedSectionSlug: 'mekanisk-energi',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Utan friktion — beräkning',
      promptSv:
        'En sten släpps från vila 15 m över vattnet utan luftmotstånd. Vilken fart har den vid ytan?',
      options: ['17 m/s', '12 m/s', '295 m/s', '24 m/s'],
      correctAnswer: '0',
      hintSv: 'Använd v₂ = √(2 · g · h₁).',
      stepBySolutionSv: 'v₂ = √(2 · 9,82 · 15) = √294,6 ≈ 17,2 m/s (17 m/s).',
      deepDerivationSv:
        'm · g · h₁ = ½ · m · v₂² ger v₂ = √294,6 = 17,16 m/s. 295 m/s fås om man glömmer kvadratroten.',
      relatedSectionSlug: 'utan-friktion',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Utan friktion — beräkning',
      promptSv:
        'En skateboardåkare åker upp i en ramp med farten 6,0 m/s i botten utan friktion. Hur högt kommer hen?',
      options: ['1,8 m', '3,7 m', '0,31 m', '6,0 m'],
      correctAnswer: '0',
      hintSv: 'Lös ut höjden h₂ = v₁² / (2 · g).',
      stepBySolutionSv: 'h₂ = 6,0² / (2 · 9,82) = 36 / 19,64 ≈ 1,83 m (1,8 m).',
      deepDerivationSv: '½ · m · v₁² = m · g · h₂ ger h₂ = v₁² / (2 · g).',
      relatedSectionSlug: 'utan-friktion',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Med friktion — beräkning',
      promptSv:
        'Ett barn med kälke (40 kg) åker från vila nerför 5,0 m och når farten 6,0 m/s i dalen. Hur mycket blev värme?',
      options: ['1 244 J', '1 964 J', '720 J', '2 684 J'],
      correctAnswer: '0',
      hintSv: 'Beräkna Wf = Ep1 − Ek2.',
      stepBySolutionSv:
        'Ep1 = 40 · 9,82 · 5,0 = 1 964 J och Ek2 = (40 · 6,0²) / 2 = 720 J. Värmen blir Wf = 1 964 − 720 = 1 244 J.',
      deepDerivationSv:
        'Skillnaden mellan startens lägesenergi och bottens rörelseenergi är den energi som omvandlats till värme.',
      relatedSectionSlug: 'med-friktion',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Med friktion — beräkning',
      promptSv: 'En kälke bromsas av friktionskraften 80 N längs 25 m. Hur stort är friktionsarbetet Wf?',
      options: ['2 000 J', '3,2 J', '105 J', '200 J'],
      correctAnswer: '0',
      hintSv: 'Använd Wf = Ff · s.',
      stepBySolutionSv: 'Wf = 80 · 25 = 2 000 J.',
      deepDerivationSv: '80 N · 25 m = 2 000 N·m = 2 000 J.',
      relatedSectionSlug: 'med-friktion',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Verkningsgrad — beräkning',
      promptSv: 'En motor förbrukar 5,0 kJ och ger 3 500 J lägesenergi. Vad är verkningsgraden?',
      options: ['70 %', '30 %', '143 %', '1,5 kJ'],
      correctAnswer: '0',
      hintSv: 'Gör om 5,0 kJ till 5 000 J först.',
      stepBySolutionSv: '5,0 kJ = 5 000 J ger η = 3 500 / 5 000 = 0,70 = 70 %.',
      deepDerivationSv: '30 % är förlustandelen, medan verkningsgraden mäter den nyttiga andelen.',
      relatedSectionSlug: 'verkningsgrad',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Energibegreppet',
      promptSv: 'Vad säger energiprincipen?',
      options: [
        'Energi skapas när något faller',
        'Energi kan varken skapas eller förstöras, bara omvandlas',
        'Energi förstörs av friktion',
        'Lägesenergi är alltid störst',
      ],
      correctAnswer: '1',
      hintSv: 'Totalenergin i ett slutet system förändras aldrig.',
      stepBySolutionSv:
        'Energiprincipen innebär att energi aldrig kan skapas eller förstöras, bara omvandlas mellan olika former.',
      relatedSectionSlug: 'energibegreppet',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Energibegreppet',
      promptSv: 'Vilken är enheten för energi och vad motsvarar 1 J?',
      options: [
        'Watt (1 W = 1 N/m)',
        'Newton (1 N = 1 kg·m)',
        'Joule (1 J = 1 N·m)',
        'Kilojoule (1 kJ = 100 N·m)',
      ],
      correctAnswer: '2',
      hintSv: 'Titta på definitionen av arbete W = F · s.',
      stepBySolutionSv: 'Energi mäts i joule (J), där 1 J = 1 N·m.',
      deepDerivationSv: 'Watt är effekt (J/s), medan energi är kraft gånger sträcka.',
      relatedSectionSlug: 'energibegreppet',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Energibegreppet — beräkning',
      promptSv: 'Du drar en låda längs golvet med 40 N i 6,0 m. Hur stort arbete utför du?',
      options: ['240 J', '6,7 J', '46 J', '24 J'],
      correctAnswer: '0',
      hintSv: 'Använd W = F · s.',
      stepBySolutionSv: 'W = 40 · 6,0 = 240 J.',
      relatedSectionSlug: 'energibegreppet',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Energibegreppet — beräkning',
      promptSv: 'En matkasse med tyngden 50 N lyfts 0,90 m rakt upp. Hur mycket energi tillförs kassen?',
      options: ['45 J', '55,6 J', '442 J', '4,5 J'],
      correctAnswer: '0',
      hintSv: 'Tyngden står redan i newton.',
      stepBySolutionSv: 'W = 50 · 0,90 = 45 J. Man ska inte multiplicera med 9,82 eftersom tyngden redan är i N.',
      deepDerivationSv: '442 J är fällan som uppstår om man felaktigt multiplicerar 50 N med g = 9,82.',
      relatedSectionSlug: 'energibegreppet',
    },
    // 4 additional numeric calculation questions
    {
      gradeLevel: 'E',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'Beräkna lägesenergin för en låda med massan 10 kg som lyfts 5,0 m upp från golvet (g = 9,82 N/kg).',
      latexFormula: 'E_p = m \\cdot g \\cdot h',
      correctAnswer: '491',
      numericTolerance: 1,
      unitSv: 'J',
      hintSv: 'Multiplicera massa, tyngdfaktor och höjd.',
      stepBySolutionSv: 'Ep = 10 · 9,82 · 5,0 = 491 J.',
      relatedSectionSlug: 'lagesenergi',
    },
    {
      gradeLevel: 'C',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En cyklist inklusive cykel väger 80 kg och kör i 36 km/h. Beräkna rörelseenergin i joule.',
      latexFormula: 'E_k = \\frac{m \\cdot v^2}{2}',
      correctAnswer: '4000',
      numericTolerance: 10,
      unitSv: 'J',
      hintSv: 'Omvandla först 36 km/h till m/s genom att dela med 3,6.',
      stepBySolutionSv: 'v = 36 / 3,6 = 10 m/s. Ek = (80 · 10²) / 2 = 4 000 J.',
      relatedSectionSlug: 'rorelseenergi',
    },
    {
      gradeLevel: 'C',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En elvinsch tillförs 2,5 kJ energi och uträttar 1 750 J nyttigt lyftarbete. Ange verkningsgraden i procent.',
      latexFormula: '\\eta = \\frac{E_{\\text{nyttig}}}{E_{\\text{tillförd}}}',
      correctAnswer: '70',
      numericTolerance: 0.5,
      unitSv: '%',
      hintSv: 'Omvandla 2,5 kJ till 2 500 J innan du dividerar.',
      stepBySolutionSv: 'E_tillförd = 2 500 J. η = 1 750 / 2 500 = 0,70 = 70 %.',
      relatedSectionSlug: 'verkningsgrad',
    },
    {
      gradeLevel: 'A',
      questionType: 'numeric',
      categorySv: 'Härledning',
      promptSv:
        'En vagn startar från vila på höjden 18,0 m i en friktionsfri bana och passerar nästa kulle på höjden 8,0 m. Beräkna farten på kullen (g = 9,82 N/kg), avrundad till närmaste heltal.',
      latexFormula: 'g \\cdot h_1 = g \\cdot h_2 + \\frac{v_2^2}{2}',
      correctAnswer: '14',
      numericTolerance: 0.2,
      unitSv: 'm/s',
      hintSv: 'Förkorta bort massan och räkna på höjdskillnaden Δh = 18,0 − 8,0 m.',
      stepBySolutionSv:
        'm·g·h₁ = m·g·h₂ + ½m·v₂² ger v₂ = √(2 · g · (h₁ − h₂)) = √(2 · 9,82 · 10,0) = √196,4 ≈ 14,0 m/s.',
      deepDerivationSv:
        'Höjdminskningen 10,0 m ger samma rörelseenergi per kilogram som ett fritt fall på 10,0 m.',
      relatedSectionSlug: 'utan-friktion',
    },
  ],
});

const chapter2 = buildChapter(COURSE_ID, {
  slug: 'krafter-och-rorelse',
  chapterNumber: 2,
  titleSv: 'Krafter och rörelse',
  summarySv:
    'Krafter, jämnvikt, Newtons lagar, friktionskraft samt likformigt accelererad rörelse och rörelsemängd.',
  isFree: false,
  estimatedMinutes: 40,
  lessons: [
    {
      sectionSlug: 'krafter-och-jamvikt',
      titleSv: 'Krafter, tyngd och jämnvikt',
      overviewConcepts: [
        { term: 'Resultantkraft (F_res)', definition: 'Vektorsumman av alla krafter som verkar på ett föremål.', unit: 'N' },
        { term: 'Normalkraft (F_N)', definition: 'Stödkraft från ett underlag riktad vinkelrätt ut från ytan.', unit: 'N' },
        { term: 'Friktionstal (μ)', definition: 'Enhetslös faktor som beskriver ytornas strävhet i Ff = μ · FN.' },
      ],
      theoryBlocks: [
        {
          heading: 'Krafter och kraftjämvikt',
          bodySv:
            'En kraft beskriver växelverkan mellan två föremål och har både storlek och riktning. När alla krafter på ett föremål tar ut varandra är resultantkraften F_res = 0 N. Enligt Newtons första lag innebär det att föremålet fortsätter att vara i vila eller röra sig rätlinjigt med konstant fart.',
          deepDiveSv:
            'På ett lutande plan med vinkeln α delas tyngden Fg = m · g upp i komposanterna Fg,parallell = m · g · sin α längs planet och Fg,vinkelrät = m · g · cos α vinkelrätt mot planet.',
          svgDiagram: SVG_FORCE_DIAGRAM,
        },
      ],
      formulas: [
        {
          nameSv: 'Tyngdkraft',
          latex: 'F_g = m \\cdot g',
          explanationSv: 'Jordens dragningskraft på ett föremål med massan m.',
          variables: [
            { symbol: 'F_g', meaningSv: 'Tyngd', unit: 'N' },
            { symbol: 'm', meaningSv: 'Massa', unit: 'kg' },
            { symbol: 'g', meaningSv: 'Tyngdfaktor (9,82)', unit: 'N/kg' },
          ],
        },
        {
          nameSv: 'Glidfriktion',
          latex: 'F_f = \\mu \\cdot F_N',
          explanationSv: 'Friktionskraften vid glidning är proportionell mot normalkraften FN.',
          variables: [
            { symbol: 'F_f', meaningSv: 'Friktionskraft', unit: 'N' },
            { symbol: '\\mu', meaningSv: 'Friktionstal', unit: 'Enhetslös' },
            { symbol: 'F_N', meaningSv: 'Normalkraft', unit: 'N' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Friktion på plant golv',
          givenSv: 'm = 20 kg, μ = 0,25 på horisontellt golv',
          findSv: 'Glidfriktionskraften Ff',
          methodSv: 'På horisontellt golv balanserar FN tyngden Fg = m · g.',
          stepsSv: [
            'Beräkna FN = 20 · 9,82 = 196,4 N.',
            'Beräkna Ff = 0,25 · 196,4 = 49,1 N ≈ 49 N.',
          ],
          answerSv: 'Friktionskraften är 49 N.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Konstant fart med motverkande dragkraft',
          givenSv: 'En låda (15 kg) dras med konstant fart över ett golv med F_drag = 36 N.',
          findSv: 'Friktionstalet μ',
          methodSv: 'Vid konstant fart är F_res = 0 N, så Ff = F_drag = 36 N.',
          stepsSv: [
            'Beräkna normalkraften: FN = 15 · 9,82 = 147,3 N.',
            'Sätt Ff = 36 N och lös ut μ = 36 / 147,3 ≈ 0,24.',
          ],
          answerSv: 'Friktionstalet är 0,24.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Kraftjämvikt i lutande plan',
          givenSv: 'En låda vilar på ett plan som lutar 20° och är nära att börja glida.',
          findSv: 'Det minsta friktionstalet μ',
          methodSv: 'Sätt glidkomposanten Fg · sin α lika med maximal friktion μ · Fg · cos α.',
          stepsSv: [
            'm · g · sin 20° = μ · m · g · cos 20°.',
            'Förkorta m · g: μ = sin 20° / cos 20° = tan 20° ≈ 0,36.',
          ],
          answerSv: 'Det minsta friktionstalet är 0,36.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Anta att det måste verka en nettokraft vid rörelse',
          wrongApproachSv: 'Att tro att konstant fart kräver F_res > 0 N.',
          rightApproachSv: 'Konstant fart rakt fram innebär alltid F_res = 0 N; drivkraften balanserar motståndet.',
        },
      ],
    },
    {
      sectionSlug: 'newtons-lagar',
      titleSv: 'Newtons andra lag och rörelsemängd',
      overviewConcepts: [
        { term: 'Acceleration (a)', definition: 'Hastighetsändring per tidsenhet.', unit: 'm/s²' },
        { term: 'Rörelsemängd (p)', definition: 'Produkten av massa och hastighet.', unit: 'kg·m/s (eller N·s)' },
        { term: 'Impuls (I)', definition: 'Kraft gånger verkningstid; lika med förändringen i rörelsemängd.', unit: 'N·s' },
      ],
      theoryBlocks: [
        {
          heading: 'Kraft, acceleration och impuls',
          bodySv:
            'Newtons andra lag slår fast att ett föremåls acceleration är direkt proportionell mot resultantkraften och omvänt proportionell mot massan: F_res = m · a. Under en kollision eller spark förändras rörelsemängden Δp = m · v₂ − m · v₁ av impulsen F · Δt.',
          deepDiveSv:
            'Om kraft och verkningstid kopplas ihop fås F = Δp / Δt. Krockkuddar och deformationszoner ökar stöttiden Δt vid samma Δp, vilket minskar den maximala kraften F på passagerarna.',
        },
      ],
      formulas: [
        {
          nameSv: 'Newtons andra lag',
          latex: 'F_{\\text{res}} = m \\cdot a',
          explanationSv: 'Resultantkraften ger massan m accelerationen a.',
          variables: [
            { symbol: 'F_{\\text{res}}', meaningSv: 'Resultantkraft', unit: 'N' },
            { symbol: 'm', meaningSv: 'Massa', unit: 'kg' },
            { symbol: 'a', meaningSv: 'Acceleration', unit: 'm/s²' },
          ],
        },
        {
          nameSv: 'Impulslagen',
          latex: 'F \\cdot \\Delta t = m \\cdot v_2 - m \\cdot v_1',
          explanationSv: 'Impulsen motsvarar förändringen i rörelsemängd.',
          variables: [
            { symbol: 'F', meaningSv: 'Medelkraft', unit: 'N' },
            { symbol: '\\Delta t', meaningSv: 'Kontakttid', unit: 's' },
            { symbol: 'v_1, v_2', meaningSv: 'Hastighet före och efter', unit: 'm/s' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Acceleration hos en elbil',
          givenSv: 'm = 1 600 kg, F_res = 4 800 N',
          findSv: 'Bilens acceleration a',
          methodSv: 'Använd a = F_res / m.',
          stepsSv: ['a = 4 800 / 1 600 = 3,0 m/s².'],
          answerSv: 'Accelerationen är 3,0 m/s².',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Kraft och acceleration med friktion',
          givenSv: 'En låda (12 kg) dras med 54 N och bromsas av 18 N friktion.',
          findSv: 'Lådans acceleration a',
          methodSv: 'Bestäm först resultantkraften F_res = F_drag − Ff.',
          stepsSv: [
            'F_res = 54 − 18 = 36 N.',
            'a = 36 / 12 = 3,0 m/s².',
          ],
          answerSv: 'Accelerationen är 3,0 m/s².',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Studsande boll mot vägg',
          givenSv: 'En boll (0,20 kg) träffar en vägg vinkelrätt med 12 m/s och studsar rakt tillbaka med 10 m/s under 0,040 s.',
          findSv: 'Medelkraften från väggen',
          methodSv: 'Välj riktningen ut från väggen som positiv: v₁ = −12 m/s och v₂ = +10 m/s.',
          stepsSv: [
            'Δp = 0,20 · (10 − (−12)) = 0,20 · 22 = 4,4 N·s.',
            'F = Δp / Δt = 4,4 / 0,040 = 110 N.',
          ],
          answerSv: 'Medelkraften är 110 N.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömt teckenbyte vid studs i impulsuppgifter',
          wrongApproachSv: 'Att ta 10 − 12 = −2 vid beräkning av Δv när riktningen vänder.',
          rightApproachSv: 'Hastighet är en vektor: byt tecken på den inkommande hastigheten så att ändringen blir 10 − (−12) = 22 m/s.',
        },
      ],
    },
    {
      sectionSlug: 'likformigt-accelererad-rorelse',
      titleSv: 'Likformigt accelererad rörelse',
      overviewConcepts: [
        { term: 'Medelhastighet (v_m)', definition: 'Sträcka delat med tid.', unit: 'm/s' },
        { term: 'Fritt fall', definition: 'Rörelse där endast tyngdkraften verkar, med accelerationen a = g = 9,82 m/s².', unit: 'm/s²' },
      ],
      theoryBlocks: [
        {
          heading: 'Rörelseekvationerna och v-t-diagram',
          bodySv:
            'Vid konstant acceleration ökar hastigheten linjärt med tiden: v = v₀ + a · t. I ett v-t-diagram motsvaras accelerationen av linjens lutning och tillryggalagd sträcka av arean under grafen: s = v₀ · t + ½ · a · t².',
          deepDiveSv:
            'Genom att eliminera tiden t mellan v = v₀ + a·t och s = ½(v₀ + v)·t fås det tidlösa sambandet v² − v₀² = 2 · a · s.',
        },
      ],
      formulas: [
        {
          nameSv: 'Sträcka vid konstant acceleration',
          latex: 's = v_0 \\cdot t + \\frac{a \\cdot t^2}{2}',
          explanationSv: 'Ger förflyttningen efter tiden t från starthastigheten v₀.',
          variables: [
            { symbol: 's', meaningSv: 'Sträcka', unit: 'm' },
            { symbol: 'v_0', meaningSv: 'Starthastighet', unit: 'm/s' },
            { symbol: 'a', meaningSv: 'Acceleration', unit: 'm/s²' },
            { symbol: 't', meaningSv: 'Tid', unit: 's' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Accelerationssträcka från stillastående',
          givenSv: 'v₀ = 0 m/s, a = 2,5 m/s², t = 4,0 s',
          findSv: 'Tillryggalagd sträcka s',
          methodSv: 'Sätt v₀ = 0 i s = v₀·t + ½a·t².',
          stepsSv: ['s = (2,5 · 4,0²) / 2 = (2,5 · 16) / 2 = 20 m.'],
          answerSv: 'Sträckan är 20 m.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Inbromsning utan tid given',
          givenSv: 'v₀ = 20 m/s, v = 0 m/s, s = 50 m',
          findSv: 'Retardationen a',
          methodSv: 'Använd v² − v₀² = 2 · a · s.',
          stepsSv: [
            '0 − 20² = 2 · a · 50.',
            '−400 = 100 · a ger a = −4,0 m/s².',
          ],
          answerSv: 'Retardationen är 4,0 m/s² (a = −4,0 m/s²).',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Uppkastat föremål i tyngdfältet',
          givenSv: 'En boll kastas rakt upp med v₀ = 15 m/s utan luftmotstånd.',
          findSv: 'Tiden tills bollen når sin högsta punkt och stighöjden',
          methodSv: 'Välj uppåt som positiv riktning: a = −9,82 m/s² och v = 0 i vändpunkten.',
          stepsSv: [
            '0 = 15 − 9,82 · t ger t = 15 / 9,82 ≈ 1,53 s.',
            's = 15 · 1,53 − 0,5 · 9,82 · 1,53² ≈ 11,5 m.',
          ],
          answerSv: 'Det tar 1,5 s att nå högsta punkten på 11,5 m höjd.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömt minustecken på a vid retardation eller uppkast',
          wrongApproachSv: 'Att använda a = +9,82 m/s² fast rörelsen är riktad uppåt.',
          rightApproachSv: 'Bestäm positiv riktning och ge motriktade hastigheter och accelerationer minustecken.',
        },
      ],
    },
  ],
  questions: [
    {
      gradeLevel: 'E',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En bil med massan 1 200 kg accelererar med 2,5 m/s². Hur stor är resultantkraften i newton?',
      latexFormula: 'F_{\\text{res}} = m \\cdot a',
      correctAnswer: '3000',
      numericTolerance: 5,
      unitSv: 'N',
      hintSv: 'Multiplicera massan med accelerationen.',
      stepBySolutionSv: 'F_res = 1 200 · 2,5 = 3 000 N.',
      relatedSectionSlug: 'newtons-lagar',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'En cyklist cyklar rakt fram med konstant fart på en plan väg. Vad gäller för krafterna på cyklisten?',
      options: [
        'Framåtriktad kraft är större än motståndet',
        'Resultantkraften är noll',
        'Endast tyngdkraften verkar',
        'Accelerationen ökar stadigt',
      ],
      correctAnswer: '1',
      hintSv: 'Tillämpa Newtons första lag.',
      stepBySolutionSv: 'Konstant fart rakt fram innebär noll acceleration och därmed F_res = 0 N.',
      relatedSectionSlug: 'krafter-och-jamvikt',
    },
    {
      gradeLevel: 'C',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'Ett föremål startar från vila och accelererar likformigt med 3,0 m/s² i 6,0 s. Hur långt har det rört sig i meter?',
      latexFormula: 's = v_0 \\cdot t + \\frac{a \\cdot t^2}{2}',
      correctAnswer: '54',
      numericTolerance: 0.5,
      unitSv: 'm',
      hintSv: 'Sätt v₀ = 0 i sträckformeln.',
      stepBySolutionSv: 's = 0 + (3,0 · 6,0²) / 2 = (3,0 · 36) / 2 = 54 m.',
      relatedSectionSlug: 'likformigt-accelererad-rorelse',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Varför minskar en krockkudde skaderisken vid en kollision?',
      options: [
        'Den minskar bilens totala rörelsemängd före krocken',
        'Den förlänger stöttiden Δt så att medelkraften blir mindre',
        'Den eliminerar normalkraften helt',
        'Den ökar accelerationen under inbromsningen',
      ],
      correctAnswer: '1',
      hintSv: 'Utgå från impulssambandet F · Δt = Δp.',
      stepBySolutionSv: 'Förändringen i rörelsemängd Δp är densamma, så längre Δt ger mindre kraft F = Δp / Δt.',
      relatedSectionSlug: 'newtons-lagar',
    },
    {
      gradeLevel: 'A',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En boll (0,50 kg) som rör sig med 8,0 m/s träffar en vägg och studsar rakt tillbaka med 6,0 m/s på 0,20 s. Beräkna medelkraften i newton.',
      latexFormula: 'F = \\frac{\\Delta p}{\\Delta t}',
      correctAnswer: '35',
      numericTolerance: 0.5,
      unitSv: 'N',
      hintSv: 'Kom ihåg teckenbytet på hastigheten vid studsen.',
      stepBySolutionSv: 'Δp = 0,50 · (6,0 − (−8,0)) = 7,0 N·s. F = 7,0 / 0,20 = 35 N.',
      relatedSectionSlug: 'newtons-lagar',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Härledning',
      promptSv: 'En låda vilar på ett plan med lutningen α precis innan den börjar glida. Vilket uttryck ger det minimala friktionstalet μ?',
      options: ['μ = sin α', 'μ = cos α', 'μ = tan α', 'μ = 1 / tan α'],
      correctAnswer: '2',
      hintSv: 'Ställ upp kraftjämvikt längs planet: m·g·sin α = μ·m·g·cos α.',
      stepBySolutionSv: 'Förkortning av m·g ger μ = sin α / cos α = tan α.',
      relatedSectionSlug: 'krafter-och-jamvikt',
    },
  ],
});

const chapter3 = buildChapter(COURSE_ID, {
  slug: 'tryck-varme-och-klimat',
  chapterNumber: 3,
  titleSv: 'Tryck, värme och klimat',
  summarySv:
    'Tryck i vätskor och gaser, Arkimedes princip, specifik värmekapacitet, fasövergångar samt jordens strålningsbalans och klimat.',
  isFree: false,
  estimatedMinutes: 40,
  lessons: [
    {
      sectionSlug: 'tryck-och-arkimedes',
      titleSv: 'Tryck och Arkimedes princip',
      overviewConcepts: [
        { term: 'Tryck (p)', definition: 'Vinkelrät kraft per areaenhet.', unit: 'Pa (1 Pa = 1 N/m²)' },
        { term: 'Vätsketryck', definition: 'Trycket på djupet h i en vätska med densiteten ρ.', unit: 'Pa' },
        { term: 'Lyftkraft (F_lyft)', definition: 'Uppåtriktad kraft lika med tyngden av undanträngd vätska eller gas.', unit: 'N' },
      ],
      theoryBlocks: [
        {
          heading: 'Hydrostatiskt tryck och flytkraft',
          bodySv:
            'Tryck anger hur koncentrerad en kraft är mot en yta: p = F / A. I en vätska ökar trycket linjärt med djupet h enligt p = ρ · g · h. Eftersom trycket är större på undersidan än på ovansidan av ett nedsänkt föremål uppstår en lyftkraft. Enligt Arkimedes princip är lyftkraften alltid lika stor som tyngden av den undanträngda vätskevolymen.',
          deepDiveSv:
            'Totaltrycket på djupet h i öppet vatten är p_tot = p₀ + ρ · g · h, där lufttrycket vid ytan normalt är p₀ = 101,3 kPa.',
        },
      ],
      formulas: [
        {
          nameSv: 'Allmänt tryck',
          latex: 'p = \\frac{F}{A}',
          explanationSv: 'Kraft vinkelrätt mot arean A.',
          variables: [
            { symbol: 'p', meaningSv: 'Tryck', unit: 'Pa' },
            { symbol: 'F', meaningSv: 'Normalkraft', unit: 'N' },
            { symbol: 'A', meaningSv: 'Area', unit: 'm²' },
          ],
        },
        {
          nameSv: 'Arkimedes princip',
          latex: 'F_{\\text{lyft}} = \\rho \\cdot V \\cdot g',
          explanationSv: 'Lyftkraften ges av vätskans densitet ρ och den undanträngda volymen V.',
          variables: [
            { symbol: 'F_{\\text{lyft}}', meaningSv: 'Lyftkraft', unit: 'N' },
            { symbol: '\\rho', meaningSv: 'Vätskans densitet', unit: 'kg/m³' },
            { symbol: 'V', meaningSv: 'Undanträngd volym', unit: 'm³' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Vätsketryck i sötvatten',
          givenSv: 'ρ = 1 000 kg/m³, h = 4,0 m, g = 9,82 N/kg',
          findSv: 'Vätsketrycket på 4,0 m djup',
          methodSv: 'Beräkna p = ρ · g · h.',
          stepsSv: ['p = 1 000 · 9,82 · 4,0 = 39 280 Pa ≈ 39 kPa.'],
          answerSv: 'Vätsketrycket är 39 kPa.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Skidåkarens tryck mot snön',
          givenSv: 'm = 75 kg står på två skidor med total area 0,30 m²',
          findSv: 'Trycket p mot snön',
          methodSv: 'Beräkna tyngden Fg = m · g och dela med totala arean.',
          stepsSv: [
            'F = 75 · 9,82 = 736,5 N.',
            'p = 736,5 / 0,30 = 2 455 Pa ≈ 2,5 kPa.',
          ],
          answerSv: 'Trycket mot snön är 2,5 kPa.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Flytande isberg',
          givenSv: 'Is har densiteten 917 kg/m³ och havsvatten 1 025 kg/m³.',
          findSv: 'Hur stor andel av isbergets volym befinner sig under vattenytan?',
          methodSv: 'Vid flytande jämvikt är lyftkraften lika stor som isbergets tyngd.',
          stepsSv: [
            'ρ_vatten · V_under · g = ρ_is · V_tot · g.',
            'V_under / V_tot = 917 / 1 025 ≈ 0,895 (89,5 %).',
          ],
          answerSv: 'Cirka 89,5 % av isberget ligger under ytan.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Fel enhet på area (cm² i stället för m²)',
          wrongApproachSv: 'Att sätta in area i cm² direkt i p = F / A.',
          rightApproachSv: '1 m² = 10 000 cm². Dela alltid cm² med 10 000 för att få m².',
        },
      ],
    },
    {
      sectionSlug: 'varme-och-fasovergangar',
      titleSv: 'Värme, temperatur och fasövergångar',
      overviewConcepts: [
        { term: 'Specifik värmekapacitet (c)', definition: 'Energi som krävs för att värma 1 kg av ett ämne 1 K.', unit: 'J/(kg·K)' },
        { term: 'Smältentalpi (l_s)', definition: 'Energi per kilogram för att smälta ett ämne vid smältpunkten.', unit: 'J/kg' },
      ],
      theoryBlocks: [
        {
          heading: 'Temperaturhöjning och smältning',
          bodySv:
            'När ett ämne värms upp utan att byta aggregationstillstånd beräknas värmeenergin med Q = c · m · ΔT. Under själva smältningen eller kokningen hålls temperaturen konstant medan den tillförda energin Q = l · m går åt till att bryta bindningar mellan partiklarna.',
          deepDiveSv:
            'För vatten är c ≈ 4 180 J/(kg·K) och smältentalpin för is l_s ≈ 334 kJ/kg. Eftersom temperaturskillnaden ΔT är densamma i grader Celsius och Kelvin behöver man inte omvandla till Kelvin vid differenser.',
        },
      ],
      formulas: [
        {
          nameSv: 'Uppvärmningsenergi',
          latex: 'Q = c \\cdot m \\cdot \\Delta T',
          explanationSv: 'Energibehov vid temperaturändringen ΔT.',
          variables: [
            { symbol: 'Q', meaningSv: 'Värmeenergi', unit: 'J' },
            { symbol: 'c', meaningSv: 'Specifik värmekapacitet', unit: 'J/(kg·K)' },
            { symbol: 'm', meaningSv: 'Massa', unit: 'kg' },
            { symbol: '\\Delta T', meaningSv: 'Temperaturändring', unit: 'K' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Värma vatten till te',
          givenSv: 'm = 0,50 kg vatten värms från 20 °C till 100 °C, c = 4 180 J/(kg·K)',
          findSv: 'Värmeenergin Q',
          methodSv: 'Beräkna ΔT = 80 K och använd Q = c · m · ΔT.',
          stepsSv: ['Q = 4 180 · 0,50 · 80 = 167 200 J ≈ 167 kJ.'],
          answerSv: 'Det krävs 167 kJ.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Blandning av varmt och kallt vatten',
          givenSv: '0,20 kg vatten (80 °C) blandas med 0,40 kg vatten (20 °C).',
          findSv: 'Sluttemperaturen t',
          methodSv: 'Avgiven energi från varmt vatten är lika med upptagen energi i kallt vatten.',
          stepsSv: [
            'c · 0,20 · (80 − t) = c · 0,40 · (t − 20).',
            'Förkorta c: 16 − 0,20t = 0,40t − 8,0 ger 0,60t = 24 och t = 40 °C.',
          ],
          answerSv: 'Sluttemperaturen blir 40 °C.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Smälta is och värma smältvattnet',
          givenSv: '0,10 kg is vid 0 °C smälts och värms till 20 °C (l_s = 334 kJ/kg, c = 4 180 J/(kg·K)).',
          findSv: 'Total energiåtgång Q_tot',
          methodSv: 'Addera smältvärmen Q₁ = l_s · m och uppvärmningen Q₂ = c · m · ΔT.',
          stepsSv: [
            'Q₁ = 334 000 · 0,10 = 33 400 J.',
            'Q₂ = 4 180 · 0,10 · 20 = 8 360 J.',
            'Q_tot = 33 400 + 8 360 = 41 760 J ≈ 41,8 kJ.',
          ],
          answerSv: 'Total energiåtgång är 41,8 kJ.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömt fasövergången mellan 0 °C is och 0 °C vatten',
          wrongApproachSv: 'Att bara använda Q = c · m · ΔT över smältpunkten.',
          rightApproachSv: 'Dela upp förloppet i separata steg: temperaturändring före smältning, smältning (l_s · m) och temperaturändring efteråt.',
        },
      ],
    },
    {
      sectionSlug: 'stralningsbalans-och-klimat',
      titleSv: 'Strålningsbalans och klimat',
      overviewConcepts: [
        { term: 'Albedo', definition: 'Andel av inkommande solstrålning som reflekteras direkt tillbaka till rymden.', unit: 'Enhetslös (0–1)' },
        { term: 'Växthuseffekten', definition: 'Atmosfärens gaser släpper igenom kortvågig solstrålning men absorberar utgående långvågig värmestrålning.' },
      ],
      theoryBlocks: [
        {
          heading: 'Jordens energibalans',
          bodySv:
            'Jorden tar emot energi via kortvågig strålning från solen och avger energi genom långvågig värmestrålning ut i rymden. När inkommande absorberad strålningseffekt P_in är lika med utgående effekt P_ut råder strålningsjämvikt och medeltemperaturen är stabil. Ökar mängden växthusgaser minskar den utstrålade effekten tillfälligt, vilket höjer jordens temperatur tills ny balans uppnås.',
          deepDiveSv:
            'Jordens genomsnittliga albedo är cirka 0,30, vilket betyder att 30 % reflekteras och 70 % absorberas. När havsis smälter minskar albedot så att ännu mer energi absorberas — en förstärkande återkoppling.',
        },
      ],
      formulas: [
        {
          nameSv: 'Absorberad solstrålningseffekt',
          latex: 'P_{\\text{abs}} = (1 - a) \\cdot P_{\\text{in}}',
          explanationSv: 'Andelen som inte reflekteras (albedo a) absorberas av planeten.',
          variables: [
            { symbol: 'P_{\\text{abs}}', meaningSv: 'Absorberad effekt', unit: 'W' },
            { symbol: 'a', meaningSv: 'Albedo', unit: '0–1' },
            { symbol: 'P_{\\text{in}}', meaningSv: 'Inkommande effekt', unit: 'W' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Reflekterad effekt vid albedot 0,30',
          givenSv: 'En yta träffas av 1 000 W solstrålning och har albedot 0,30.',
          findSv: 'Absorberad effekt',
          methodSv: 'Beräkna (1 − 0,30) · P_in.',
          stepsSv: ['P_abs = (1 − 0,30) · 1 000 = 700 W.'],
          answerSv: '700 W absorberas.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Förändrat albedo när snö smälter',
          givenSv: 'En yta på 10 m² tar emot 400 W/m². Albedot sjunker från 0,80 (snö) till 0,15 (mörk mark).',
          findSv: 'Ökningen i absorberad effekt',
          methodSv: 'Beräkna P_abs före och efter.',
          stepsSv: [
            'P_in = 10 · 400 = 4 000 W.',
            'Före: 0,20 · 4 000 = 800 W. Efter: 0,85 · 4 000 = 3 400 W.',
            'Ökning: 3 400 − 800 = 2 600 W.',
          ],
          answerSv: 'Den absorberade effekten ökar med 2 600 W.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Positiv återkoppling i klimatsystemet',
          givenSv: 'Global uppvärmning ökar vattenångan i atmosfären.',
          findSv: 'Förklara fysikaliskt varför ökad vattenånga förstärker uppvärmningen.',
          methodSv: 'Koppla samman mättnadsångtryck, växthusabsorption och strålningsbalans.',
          stepsSv: [
            'Varmare luft kan hålla mer vattenånga genom ökad avdunstning.',
            'Vattenånga är en kraftig växthusgas som absorberar långvågig infraröd strålning från jordytan.',
            'Därmed sänds mer värmestrålning tillbaka mot ytan, vilket förstärker temperaturökningen.',
          ],
          answerSv: 'Ökad avdunstning ger mer vattenånga som fångar mer värmestrålning och höjer temperaturen ytterligare.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Förväxla kortvågig solstrålning med långvågig värmestrålning',
          wrongApproachSv: 'Att skriva att växthusgaser stoppar solens ljus på väg ner.',
          rightApproachSv: 'Växthusgaserna släpper igenom kortvågig solstrålning men absorberar utgående långvågig värmestrålning.',
        },
      ],
    },
  ],
  questions: [
    {
      gradeLevel: 'E',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'Hur stort är vätsketrycket i kPa på 5,0 m djup i sötvatten (ρ = 1 000 kg/m³, g = 9,82 N/kg), avrundat till närmaste heltal?',
      latexFormula: 'p = \\rho \\cdot g \\cdot h',
      correctAnswer: '49',
      numericTolerance: 0.5,
      unitSv: 'kPa',
      hintSv: 'Räkna i pascal och dela sedan med 1 000.',
      stepBySolutionSv: 'p = 1 000 · 9,82 · 5,0 = 49 100 Pa = 49,1 kPa ≈ 49 kPa.',
      relatedSectionSlug: 'tryck-och-arkimedes',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Vad händer med vattnets temperatur medan is smälter i en kastrull vid 0 °C?',
      options: [
        'Temperaturen stiger linjärt',
        'Temperaturen hålls konstant vid 0 °C tills all is har smält',
        'Temperaturen sjunker under smältningen',
        'Vattnet kokar omedelbart',
      ],
      correctAnswer: '1',
      hintSv: 'Tillförd energi används till att bryta bindningar.',
      stepBySolutionSv: 'Under fasövergången går all tillförd värme till smältentalpin så att temperaturen är konstant.',
      relatedSectionSlug: 'varme-och-fasovergangar',
    },
    {
      gradeLevel: 'C',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'Hur mycket energi i kilojoule krävs för att värma 2,0 kg vatten från 15 °C till 65 °C? (c = 4 180 J/(kg·K))',
      latexFormula: 'Q = c \\cdot m \\cdot \\Delta T',
      correctAnswer: '418',
      numericTolerance: 1,
      unitSv: 'kJ',
      hintSv: 'Beräkna ΔT = 50 K och omvandla joule till kJ.',
      stepBySolutionSv: 'Q = 4 180 · 2,0 · 50 = 418 000 J = 418 kJ.',
      relatedSectionSlug: 'varme-och-fasovergangar',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Varför ökar värmebalansen på jorden när ljus havsis smälter och ersätts av mörkt öppet hav?',
      options: [
        'Albedot ökar och mer solstrålning reflekteras',
        'Albedot minskar så att mer kortvågig solstrålning absorberas',
        'Vattnets specifika värmekapacitet blir noll',
        'Växthuseffekten upphör',
      ],
      correctAnswer: '1',
      hintSv: 'Mörka ytor har lägre albedo än ljus snö och is.',
      stepBySolutionSv: 'Lägre albedo innebär mindre reflektion och högre andel absorberad solenergi.',
      relatedSectionSlug: 'stralningsbalans-och-klimat',
    },
    {
      gradeLevel: 'A',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En sten med volymen 0,0020 m³ sänks helt ner i vatten (ρ = 1 000 kg/m³, g = 9,82 N/kg). Hur stor är lyftkraften på stenen i newton, avrundad till en decimal?',
      latexFormula: 'F_{\\text{lyft}} = \\rho \\cdot V \\cdot g',
      correctAnswer: '19.6',
      numericTolerance: 0.2,
      unitSv: 'N',
      hintSv: 'Multiplicera vattnets densitet med volymen och g.',
      stepBySolutionSv: 'F_lyft = 1 000 · 0,0020 · 9,82 = 19,64 N ≈ 19,6 N.',
      relatedSectionSlug: 'tryck-och-arkimedes',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Analys',
      promptSv: 'Ett isberg flyter i havsvatten med 89 % av volymen under ytan. Hur skulle andelen under ytan ändras om isberget flöt i sötvatten som har lägre densitet?',
      options: [
        'En mindre andel skulle ligga under ytan',
        'En större andel skulle ligga under ytan',
        'Andelen skulle vara exakt oförändrad',
        'Isberget skulle sjunka till botten',
      ],
      correctAnswer: '1',
      hintSv: 'Titta på kvoten V_under / V_tot = ρ_is / ρ_vätska.',
      stepBySolutionSv: 'När vätskans densitet ρ_vätska minskar måste en större volym trängas undan för samma lyftkraft.',
      relatedSectionSlug: 'tryck-och-arkimedes',
    },
  ],
});

const chapter4 = buildChapter(COURSE_ID, {
  slug: 'ellara-och-magnetism',
  chapterNumber: 4,
  titleSv: 'Ellära och magnetism',
  summarySv:
    'Elektrisk laddning, ström, spänning, resistans, effekt i serie- och parallellkoppling samt magnetfält och induktion.',
  isFree: false,
  estimatedMinutes: 40,
  lessons: [
    {
      sectionSlug: 'strom-spanning-och-resistans',
      titleSv: 'Ström, spänning och Ohms lag',
      overviewConcepts: [
        { term: 'Elektrisk ström (I)', definition: 'Laddning som passerar ett tvärsnitt per sekund.', unit: 'A (ampere)' },
        { term: 'Spänning (U)', definition: 'Energi som överförs per enhetsladdning mellan två punkter.', unit: 'V (volt)' },
        { term: 'Resistans (R)', definition: 'Komponentens elektriska motstånd.', unit: 'Ω (ohm)' },
      ],
      theoryBlocks: [
        {
          heading: 'Sambandet i en sluten strömkrets',
          bodySv:
            'För att elektrisk ström ska flyta krävs en sluten krets och en spänningskälla som skapar en potentialskillnad U. Strömmen I definieras som laddningen per tid: I = Q / t. I metaller är spänningen över ett motstånd ofta proportionell mot strömmen enligt Ohms lag: U = R · I.',
          deepDiveSv:
            'Elementarladdningen är e = 1,602 · 10⁻¹⁹ C. En ström på 1 A motsvarar alltså drygt 6,24 · 10¹⁸ elektroner per sekund genom ledarens tvärsnitt.',
          svgDiagram: SVG_CIRCUIT_SIMPLE,
        },
      ],
      formulas: [
        {
          nameSv: 'Ohms lag',
          latex: 'U = R \\cdot I',
          explanationSv: 'Spänningen över en resistor är resistansen gånger strömmen.',
          variables: [
            { symbol: 'U', meaningSv: 'Spänning', unit: 'V' },
            { symbol: 'R', meaningSv: 'Resistans', unit: 'Ω' },
            { symbol: 'I', meaningSv: 'Ström', unit: 'A' },
          ],
        },
        {
          nameSv: 'Elektrisk effekt',
          latex: 'P = U \\cdot I',
          explanationSv: 'Ger effekten som utvecklas i en komponent.',
          variables: [
            { symbol: 'P', meaningSv: 'Effekt', unit: 'W' },
            { symbol: 'U', meaningSv: 'Spänning', unit: 'V' },
            { symbol: 'I', meaningSv: 'Ström', unit: 'A' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Ström genom en värmeslinga',
          givenSv: 'U = 230 V, R = 46 Ω',
          findSv: 'Strömmen I',
          methodSv: 'Använd Ohms lag I = U / R.',
          stepsSv: ['I = 230 / 46 = 5,0 A.'],
          answerSv: 'Strömmen är 5,0 A.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Elkostnad i kilowattimmar',
          givenSv: 'En lampa på 60 W lyser i 5,0 timmar vid 230 V.',
          findSv: 'Energiåtgången i J och kWh',
          methodSv: 'Beräkna E = P · t i sekunder för J och i timmar med kW för kWh.',
          stepsSv: [
            'E = 0,060 kW · 5,0 h = 0,30 kWh.',
            'I joule: 0,30 · 3,6 MJ = 1,08 MJ.',
          ],
          answerSv: 'Energiåtgången är 0,30 kWh (1,08 MJ).',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Ersättningsresistans i blandad krets',
          givenSv: 'Två motstånd på 6,0 Ω och 12 Ω är parallellkopplade, och denna grupp är seriekopplad med 4,0 Ω till 24 V.',
          findSv: 'Totala strömmen från spänningskällan',
          methodSv: 'Beräkna först parallellgruppen R_p och lägg sedan till seriemotståndet.',
          stepsSv: [
            '1 / R_p = 1/6,0 + 1/12 = 3/12 ger R_p = 4,0 Ω.',
            'R_tot = 4,0 + 4,0 = 8,0 Ω.',
            'I_tot = 24 / 8,0 = 3,0 A.',
          ],
          answerSv: 'Totala strömmen är 3,0 A.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömma invertera i parallellkoppling',
          wrongApproachSv: 'Att ta 1 / R_p = 0,25 och svara att R_p = 0,25 Ω.',
          rightApproachSv: 'Du måste ta det inverterade värdet 1 / 0,25 = 4,0 Ω i sista steget.',
        },
      ],
    },
    {
      sectionSlug: 'magnetfalt-och-induktion',
      titleSv: 'Magnetfält och induktion',
      overviewConcepts: [
        { term: 'Elektromagnetisk induktion', definition: 'Spänning uppstår i en spole när det magnetiska flödet genom spolen förändras.' },
        { term: 'Transformator', definition: 'Ändrar växelspänning mellan primär- och sekundärspole enligt lindningskvoten.' },
      ],
      theoryBlocks: [
        {
          heading: 'Strömförande ledare och transformatorer',
          bodySv:
            'Varje elektrisk ström omges av ett magnetfält. När en ledare med strömmen I befinner sig vinkelrätt i ett magnetfält med flödestätheten B påverkas den av kraften F = B · I · l. Omvänt induceras en spänning i en sluten krets när magnetfältet genom den ändras, vilket används i generatorer och transformatorer.',
          deepDiveSv:
            'För en ideal transformator gäller U₁ / U₂ = N₁ / N₂ samt effektbalansen U₁ · I₁ = U₂ · I₂.',
        },
      ],
      formulas: [
        {
          nameSv: 'Ideala transformatorsambandet',
          latex: '\\frac{U_1}{U_2} = \\frac{N_1}{N_2}',
          explanationSv: 'Spänningskvoten följer förhållandet mellan antalet lindningsvarv.',
          variables: [
            { symbol: 'U_1, U_2', meaningSv: 'Primär- och sekundärspänning', unit: 'V' },
            { symbol: 'N_1, N_2', meaningSv: 'Varvtal i spolarna', unit: 'varv' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Spänning i en ideal transformator',
          givenSv: 'U₁ = 230 V, N₁ = 1 000 varv, N₂ = 50 varv',
          findSv: 'Sekundärspänningen U₂',
          methodSv: 'Lös ut U₂ = U₁ · (N₂ / N₁).',
          stepsSv: ['U₂ = 230 · (50 / 1 000) = 11,5 V.'],
          answerSv: 'Sekundärspänningen är 11,5 V.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Kraft på strömförande ledare',
          givenSv: 'B = 0,40 T, I = 5,0 A, ledarlängd i fältet l = 0,25 m',
          findSv: 'Den magnetiska kraften F',
          methodSv: 'Beräkna F = B · I · l.',
          stepsSv: ['F = 0,40 · 5,0 · 0,25 = 0,50 N.'],
          answerSv: 'Kraften på ledaren är 0,50 N.',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Högspänning i kraftledningar',
          givenSv: 'Effekten 10 MW överförs över en ledning med resistansen 4,0 Ω vid antingen 10 kV eller 100 kV.',
          findSv: 'Jämför effektförlusten P_förlust = R · I² i de två fallen.',
          methodSv: 'Beräkna strömmen I = P / U i båda fallen.',
          stepsSv: [
            'Vid 10 kV: I = 10 000 000 / 10 000 = 1 000 A ger P_förlust = 4,0 · 1 000² = 4,0 MW.',
            'Vid 100 kV: I = 100 A ger P_förlust = 4,0 · 100² = 40 kW (100 gånger mindre).',
          ],
          answerSv: 'Tio gånger högre spänning ger 100 gånger lägre effektförlust.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Tro att en transformator fungerar med likspänning',
          wrongApproachSv: 'Att använda U₁ / U₂ = N₁ / N₂ för ett konstant batteri.',
          rightApproachSv: 'Induktion kräver ett föränderligt magnetfält, så en transformator fungerar bara med växelspänning.',
        },
      ],
    },
  ],
  questions: [
    {
      gradeLevel: 'E',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En resistor på 24 Ω ansluts till spänningen 12 V. Hur stor blir strömmen i ampere?',
      latexFormula: 'U = R \\cdot I',
      correctAnswer: '0.5',
      numericTolerance: 0.02,
      unitSv: 'A',
      hintSv: 'Lös ut I = U / R.',
      stepBySolutionSv: 'I = 12 / 24 = 0,50 A.',
      relatedSectionSlug: 'strom-spanning-och-resistans',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Vilken enhet används för elektrisk energi på elräkningen när 1 kW används i 1 timme?',
      options: ['1 kW', '1 kWh (= 3,6 MJ)', '1 V/A', '1 J/s'],
      correctAnswer: '1',
      hintSv: 'Effekt gånger tid blir energi.',
      stepBySolutionSv: '1 kWh = 1 000 W · 3 600 s = 3,6 MJ.',
      relatedSectionSlug: 'strom-spanning-och-resistans',
    },
    {
      gradeLevel: 'C',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'Två motstånd på 10 Ω vardera är parallellkopplade. Vad är deras totala ersättningsresistans i ohm?',
      latexFormula: '\\frac{1}{R_{\\text{tot}}} = \\frac{1}{R_1} + \\frac{1}{R_2}',
      correctAnswer: '5',
      numericTolerance: 0.1,
      unitSv: 'Ω',
      hintSv: 'Två lika stora parallella motstånd halverar resistansen.',
      stepBySolutionSv: '1 / R_tot = 1/10 + 1/10 = 2/10 = 1/5 ger R_tot = 5,0 Ω.',
      relatedSectionSlug: 'strom-spanning-och-resistans',
    },
    {
      gradeLevel: 'C',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En ideal transformator har 400 varv på primärspolen (230 V) och 100 varv på sekundärspolen. Ange sekundärspänningen i volt.',
      latexFormula: '\\frac{U_1}{U_2} = \\frac{N_1}{N_2}',
      correctAnswer: '57.5',
      numericTolerance: 0.2,
      unitSv: 'V',
      hintSv: 'Spänningen skalas med kvoten 100 / 400.',
      stepBySolutionSv: 'U₂ = 230 · (100 / 400) = 57,5 V.',
      relatedSectionSlug: 'magnetfalt-och-induktion',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Analys',
      promptSv: 'Varför överförs elenergi i stamnätet med mycket hög spänning?',
      options: [
        'För att minska strömmen I = P / U och därmed effektförlusten R · I²',
        'För att öka resistansen i kopparledningarna',
        'För att kunna använda likspänning i transformatorer',
        'För att minska spänningen hos kunderna till noll',
      ],
      correctAnswer: '0',
      hintSv: 'Se på hur förlusteffekten P_förlust = R · I² beror av strömmen.',
      stepBySolutionSv: 'Hög spänning ger låg ström för samma överförda effekt, vilket minskar värmeförlusterna kvadratiskt.',
      relatedSectionSlug: 'magnetfalt-och-induktion',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Vad krävs för att en spänning ska induceras i en sluten spole?',
      options: [
        'Att en permanentmagnet hålls helt stilla inuti spolen',
        'Att det magnetiska flödet genom spolen förändras med tiden',
        'Att spolen ansluts till ett likströmsbatteri',
        'Att spolens resistans är noll',
      ],
      correctAnswer: '1',
      hintSv: 'Tänk på Faradays induktionslag.',
      stepBySolutionSv: 'Endast en förändring av magnetfältet eller arean genom spolen ger inducerad spänning.',
      relatedSectionSlug: 'magnetfalt-och-induktion',
    },
  ],
});

const chapter5 = buildChapter(COURSE_ID, {
  slug: 'atom-och-karnfysik',
  chapterNumber: 5,
  titleSv: 'Atom- och kärnfysik',
  summarySv:
    'Fotonenergi, atomers energinivåer, radioaktivt sönderfall, halveringstid samt kärnreaktioner och massenergi.',
  isFree: false,
  estimatedMinutes: 40,
  lessons: [
    {
      sectionSlug: 'atommodeller-och-fotoner',
      titleSv: 'Atommodeller och fotonenergi',
      overviewConcepts: [
        { term: 'Foton', definition: 'Ljuspartikel med energipaketet E = h · f.', unit: 'J eller eV' },
        { term: 'Elektronvolt (eV)', definition: 'Energienhet i atomfysiken där 1 eV = 1,602 · 10⁻¹⁹ J.', unit: 'eV' },
      ],
      theoryBlocks: [
        {
          heading: 'Energinivåer och spektrallinjer',
          bodySv:
            'Elektronerna i en atom kan bara befinna sig i bestämda tillåtna energinivåer. När en elektron hoppar från en högre nivå E₂ till en lägre nivå E₁ sänds en foton ut med energin ΔE = E₂ − E₁ = h · f. Eftersom nivåerna är unika för varje grundämne ger de karakteristiska linjespektra.',
          deepDiveSv:
            'Med vågsambandet c = f · λ fås fotonenergin direkt ur våglängden via E = (h · c) / λ, där Plancks konstant är h = 6,626 · 10⁻³⁴ J·s.',
        },
      ],
      formulas: [
        {
          nameSv: 'Fotonens energi',
          latex: 'E = h \\cdot f = \\frac{h \\cdot c}{\\lambda}',
          explanationSv: 'Sambandet mellan fotonenergi, frekvens f och våglängd λ.',
          variables: [
            { symbol: 'E', meaningSv: 'Fotonenergi', unit: 'J' },
            { symbol: 'h', meaningSv: 'Plancks konstant (6,626·10⁻³⁴)', unit: 'J·s' },
            { symbol: 'f', meaningSv: 'Frekvens', unit: 'Hz' },
            { symbol: '\\lambda', meaningSv: 'Våglängd', unit: 'm' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Omvandla elektronvolt till joule',
          givenSv: 'En foton har energin 2,5 eV (1 eV = 1,602 · 10⁻¹⁹ J).',
          findSv: 'Energin i joule',
          methodSv: 'Multiplicera med 1,602 · 10⁻¹⁹.',
          stepsSv: ['E = 2,5 · 1,602 · 10⁻¹⁹ ≈ 4,0 · 10⁻¹⁹ J.'],
          answerSv: 'Energin är 4,0 · 10⁻¹⁹ J.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Våglängd vid elektronhopp i väte',
          givenSv: 'ΔE = 1,89 eV, h = 6,626 · 10⁻³⁴ J·s, c = 3,00 · 10⁸ m/s',
          findSv: 'Den utsända fotonens våglängd λ',
          methodSv: 'Omvandla ΔE till joule och lös ut λ = h · c / ΔE.',
          stepsSv: [
            'ΔE = 1,89 · 1,602 · 10⁻¹⁹ = 3,028 · 10⁻¹⁹ J.',
            'λ = (6,626 · 10⁻³⁴ · 3,00 · 10⁸) / 3,028 · 10⁻¹⁹ ≈ 6,56 · 10⁻⁷ m = 656 nm.',
          ],
          answerSv: 'Våglängden är 656 nm (rött ljus).',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Jonisation av väteatom',
          givenSv: 'Grundtillståndet i väte har energin −13,6 eV.',
          findSv: 'Vilken kortaste frekvens krävs för att helt slå loss elektronen?',
          methodSv: 'Elektronen måste få minst ΔE = 13,6 eV för att nå n = ∞ (0 eV).',
          stepsSv: [
            'ΔE = 13,6 · 1,602 · 10⁻¹⁹ = 2,179 · 10⁻¹⁸ J.',
            'f = ΔE / h = 2,179 · 10⁻¹⁸ / 6,626 · 10⁻³⁴ ≈ 3,29 · 10¹⁵ Hz.',
          ],
          answerSv: 'Minsta frekvens är 3,29 · 10¹⁵ Hz (ultraviolett ljus).',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Sätta in eV direkt i E = h · f',
          wrongApproachSv: 'Att dividera eV direkt med h = 6,626 · 10⁻³⁴ J·s.',
          rightApproachSv: 'Omvandla alltid eV till joule genom att multiplicera med 1,602 · 10⁻¹⁹ först.',
        },
      ],
    },
    {
      sectionSlug: 'radioaktivt-sonderfall',
      titleSv: 'Radioaktivitet och halveringstid',
      overviewConcepts: [
        { term: 'Alfa-, beta- och gammastrålning', definition: 'Heliumkärnor (α), elektroner/positroner (β) och energirika fotoner (γ).' },
        { term: 'Halveringstid (T₁/₂)', definition: 'Tiden det tar för hälften av atomkärnorna i ett preparat att sönderfalla.', unit: 's, år m.fl.' },
        { term: 'Aktivitet (A)', definition: 'Antal sönderfall per sekund.', unit: 'Bq (becquerel)' },
      ],
      theoryBlocks: [
        {
          heading: 'Sönderfallslagen och kärnreaktioner',
          bodySv:
            'Instabila atomkärnor sänder ut joniserande strålning för att nå lägre energi. Vid alfa- och betasönderfall omvandlas kärnan till ett nytt grundämne, men summan av nukleontal A (masstal) och summan av laddningstal Z (atomnummer) bevaras alltid. Efter varje halveringstid halveras både antalet kvarvarande kärnor och aktiviteten.',
          deepDiveSv:
            'Massenergi-ekvivalensen E = Δm · c² förklarar den stora energifrigörelsen vid fission och fusion: massan av produkterna är något mindre än massan av reaktanterna, och massdefekten Δm blir energi.',
        },
      ],
      formulas: [
        {
          nameSv: 'Radioaktivt sönderfall',
          latex: 'A = A_0 \\cdot \\left(\\frac{1}{2}\\right)^{\\frac{t}{T_{1/2}}}',
          explanationSv: 'Aktiviteten A efter tiden t vid halveringstiden T₁/₂.',
          variables: [
            { symbol: 'A', meaningSv: 'Aktivitet efter tiden t', unit: 'Bq' },
            { symbol: 'A_0', meaningSv: 'Startaktivitet', unit: 'Bq' },
            { symbol: 't', meaningSv: 'Förfluten tid', unit: 'tidsenhet' },
            { symbol: 'T_{1/2}', meaningSv: 'Halveringstid', unit: 'samma tidsenhet' },
          ],
        },
        {
          nameSv: 'Massa-energiekvivalens',
          latex: '\\Delta E = \\Delta m \\cdot c^2',
          explanationSv: 'Massdefekt Δm vid en kärnreaktion motsvarar frigjord energi ΔE.',
          variables: [
            { symbol: '\\Delta E', meaningSv: 'Frigjord energi', unit: 'J' },
            { symbol: '\\Delta m', meaningSv: 'Massminskning', unit: 'kg' },
            { symbol: 'c', meaningSv: 'Ljusets fart (3,00·10⁸)', unit: 'm/s' },
          ],
        },
      ],
      workedExamplesEca: [
        {
          gradeLevel: 'E',
          titleSv: 'Kvarvarande aktivitet efter två halveringstider',
          givenSv: 'A₀ = 800 Bq, T₁/₂ = 6,0 timmar, t = 12 timmar',
          findSv: 'Aktiviteten efter 12 timmar',
          methodSv: '12 timmar motsvarar två halveringar.',
          stepsSv: ['A = 800 · (0,5)² = 800 · 0,25 = 200 Bq.'],
          answerSv: 'Aktiviteten är 200 Bq.',
        },
        {
          gradeLevel: 'C',
          titleSv: 'Balansera ett betasönderfall',
          givenSv: 'Kol-14 (A = 14, Z = 6) sönderfaller via β⁻-sönderfall (en elektron med A = 0, Z = −1).',
          findSv: 'Dotterkärnans nukleontal och atomnummer',
          methodSv: 'Bevara A och Z på båda sidor av reaktionspilen.',
          stepsSv: [
            'A_dotter = 14 − 0 = 14.',
            'Z_dotter = 6 − (−1) = 7, vilket är grundämnet kväve (N).',
          ],
          answerSv: 'Dotterkärnan är kväve-14 (A = 14, Z = 7).',
        },
        {
          gradeLevel: 'A',
          titleSv: 'Datering med kol-14 och logaritmer',
          givenSv: 'Aktiviteten i ett träprov har sjunkit till 30 % av startvärdet. Kol-14 har T₁/₂ = 5 730 år.',
          findSv: 'Provets ålder t',
          methodSv: 'Lös exponentialekvationen 0,30 = 0,5^(t / 5730) med logaritmer.',
          stepsSv: [
            'lg 0,30 = (t / 5 730) · lg 0,5.',
            't = 5 730 · (lg 0,30 / lg 0,5) ≈ 5 730 · 1,737 ≈ 9 950 år.',
          ],
          answerSv: 'Provet är cirka 9 950 år gammalt.',
        },
      ],
      examPitfalls: [
        {
          trapTitleSv: 'Glömt räkna med minustecknet på elektronens laddning i β⁻',
          wrongApproachSv: 'Att minska atomnumret Z vid β⁻-sönderfall.',
          rightApproachSv: 'Vid β⁻-sönderfall ökar atomnumret Z med +1 eftersom en neutron blir en proton plus en elektron.',
        },
      ],
    },
  ],
  questions: [
    {
      gradeLevel: 'E',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'Ett preparat har startaktiviteten 1 600 Bq och halveringstiden 4,0 dygn. Hur stor är aktiviteten i Bq efter 12 dygn?',
      latexFormula: 'A = A_0 \\cdot \\left(\\frac{1}{2}\\right)^{\\frac{t}{T_{1/2}}}',
      correctAnswer: '200',
      numericTolerance: 1,
      unitSv: 'Bq',
      hintSv: '12 dygn motsvarar 3 halveringstider.',
      stepBySolutionSv: 'A = 1 600 · (0,5)³ = 1 600 / 8 = 200 Bq.',
      relatedSectionSlug: 'radioaktivt-sonderfall',
    },
    {
      gradeLevel: 'E',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Vad består alfastrålning av?',
      options: ['Snabba elektroner', 'Heliumkärnor (2 protoner och 2 neutroner)', 'Elektromagnetisk strålning', 'Fria neutroner'],
      correctAnswer: '1',
      hintSv: 'Alfapartikeln har masstal 4 och laddning +2.',
      stepBySolutionSv: 'Alfastrålning består av tunga heliumkärnor med två protoner och två neutroner.',
      relatedSectionSlug: 'radioaktivt-sonderfall',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Kärnfysik',
      promptSv: 'Vad händer med en atomkärnas atomnummer Z när den sänder ut en β⁻-partikel (elektron)?',
      options: ['Det minskar med 2', 'Det ökar med 1', 'Det är oförändrat', 'Det minskar med 1'],
      correctAnswer: '1',
      hintSv: 'En neutron omvandlas till en proton och en elektron.',
      stepBySolutionSv: 'Antalet protoner (Z) ökar med 1 medan masstalet A är oförändrat.',
      relatedSectionSlug: 'radioaktivt-sonderfall',
    },
    {
      gradeLevel: 'C',
      questionType: 'multiple_choice',
      categorySv: 'Begrepp',
      promptSv: 'Hur bildas en emissionslinje i ett atomspektrum?',
      options: [
        'En elektron hoppar från en lägre till en högre energinivå utan foton',
        'En elektron faller från en högre till en lägre energinivå och sänder ut en foton med energin ΔE',
        'Atomkärnan klyvs i två delar',
        'Alla elektroner lämnar atomen samtidigt',
      ],
      correctAnswer: '1',
      hintSv: 'Energin bevaras när elektronen tappar energi.',
      stepBySolutionSv: 'Energiskillnaden ΔE = E₂ − E₁ sänds ut som en foton med frekvensen f = ΔE / h.',
      relatedSectionSlug: 'atommodeller-och-fotoner',
    },
    {
      gradeLevel: 'A',
      questionType: 'numeric',
      categorySv: 'Beräkning',
      promptSv: 'En foton har energin 3,313 · 10⁻¹⁹ J. Beräkna dess frekvens i enheten 10¹⁴ Hz (ange endast faktorn före 10¹⁴, t.ex. 5,0). (h = 6,626 · 10⁻³⁴ J·s)',
      latexFormula: 'f = \\frac{E}{h}',
      correctAnswer: '5',
      numericTolerance: 0.1,
      unitSv: '· 10¹⁴ Hz',
      hintSv: 'Dividera fotonenergin med Plancks konstant.',
      stepBySolutionSv: 'f = 3,313 · 10⁻¹⁹ / (6,626 · 10⁻³⁴) = 5,0 · 10¹⁴ Hz.',
      relatedSectionSlug: 'atommodeller-och-fotoner',
    },
    {
      gradeLevel: 'A',
      questionType: 'multiple_choice',
      categorySv: 'Härledning',
      promptSv: 'Varför frigörs enorma energimängder vid kärnfission och kärnfusion?',
      options: [
        'Reaktanterna har lägre massa än produkterna',
        'Produkternas sammanlagda massa är mindre än reaktanternas, och massdefekten blir energi enligt ΔE = Δm · c²',
        'Elektronerna i yttersta skalet brinner upp',
        'Halveringstiden blir oändlig',
      ],
      correctAnswer: '1',
      hintSv: 'Använd Einsteins massenergisamband.',
      stepBySolutionSv: 'En liten massminskning Δm ger stor energi ΔE eftersom c² = 9,0 · 10¹⁶ m²/s².',
      relatedSectionSlug: 'radioaktivt-sonderfall',
    },
  ],
});

export const fysik1bCourse: CourseSeed = {
  id: COURSE_ID,
  subjectId: 'subj-fysik',
  slug: 'fysik-1b',
  codeGy25: 'FYSI1000X',
  nameSv: 'Fysik 1b',
  levelLabelSv: 'Nivå 1b',
  centralContentSummarySv:
    'Rörelse och krafter, energi och energiresurser, tryck, värme och klimatmodeller, ellära och elektromagnetism samt atom- och kärnfysik.',
  sortOrder: 1,
  chapters: [chapter1, chapter2, chapter3, chapter4, chapter5],
};

export const fysikSubject: SubjectSeed = {
  id: 'subj-fysik',
  slug: 'fysik',
  nameSv: 'Fysik',
  descriptionSv:
    'Mekanik, energiomvandlingar, termodynamik, elektricitet, magnetism och modern fysik för gymnasieskolan.',
  sortOrder: 1,
  courses: [fysik1bCourse],
};
