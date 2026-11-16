import { buildChapter } from '../helpers';
import type { CourseSeed } from '../types';

const SVG_SLOPE_FIELD = `<svg viewBox="0 0 320 150" width="100%" aria-label="Riktningsfält och lösningskurva för en differentialekvation">
  <line x1="25" y1="125" x2="295" y2="125" stroke="currentColor" stroke-width="1.5" />
  <line x1="45" y1="15" x2="45" y2="138" stroke="currentColor" stroke-width="1.5" />
  <line x1="70" y1="104" x2="88" y2="96" stroke="currentColor" stroke-width="1.5" />
  <line x1="130" y1="104" x2="148" y2="96" stroke="currentColor" stroke-width="1.5" />
  <line x1="190" y1="104" x2="208" y2="96" stroke="currentColor" stroke-width="1.5" />
  <line x1="70" y1="68" x2="88" y2="54" stroke="currentColor" stroke-width="1.5" />
  <line x1="130" y1="68" x2="148" y2="54" stroke="currentColor" stroke-width="1.5" />
  <line x1="190" y1="68" x2="208" y2="54" stroke="currentColor" stroke-width="1.5" />
  <path d="M 45 108 Q 160 95 270 30" fill="none" stroke="var(--accent)" stroke-width="2" />
  <circle cx="45" cy="108" r="3.5" fill="var(--accent)" />
  <text x="54" y="114" font-size="11" fill="var(--accent)">Begynnelsevillkor y(0)</text>
</svg>`;

export const matte4Course: CourseSeed = {
  id: 'course-matte-4',
  subjectId: 'subj-matematik',
  slug: 'matte-4',
  codeGy25: 'MATO2000X',
  nameSv: 'Matematik 4',
  levelLabelSv: 'Fortsättning nivå 2',
  centralContentSummarySv:
    'Trigonometriska funktioner, radianer och ekvationer, additionsformler, produkt-, kvot- och kedjeregeln för derivata, rotationsvolymer samt komplexa tal på polär form.',
  sortOrder: 9,
  chapters: [
    buildChapter('course-matte-4', {
      slug: 'trigonometriska-funktioner-och-ekvationer',
      chapterNumber: 1,
      titleSv: 'Trigonometriska funktioner och ekvationer',
      summarySv:
        'Radianmåttet, trigonometriska kurvor med amplitud och period, trigonometriska ekvationer samt trigonometriska ettan och additionsformler.',
      isFree: true,
      estimatedMinutes: 45,
      lessons: [
        {
          sectionSlug: 'radianer-och-enhetscirkeln',
          titleSv: 'Radianer, enhetscirkeln och trigonometriska ettan',
          overviewConcepts: [
            { term: 'Radian (rad)', definition: 'Vinkelmått där båglängden på enhetscirkeln är lika med vinkeln: 2π rad = 360°.' },
            { term: 'Trigonometriska ettan', definition: 'Identiteten sin²v + cos²v = 1 som följer ur Pythagoras sats i enhetscirkeln.' },
          ],
          theoryBlocks: [
            {
              heading: 'Varför radianer krävs inom analysen',
              bodySv:
                'I trigonometriska derivator och integraler används alltid radianer eftersom sambandet D(sin x) = cos x endast gäller när x mäts i radianer. Omvandlingen utgår från att ett halvt varv motsvarar π radianer = 180°, vilket ger standardvinklarna π/6 = 30°, π/4 = 45°, π/3 = 60° och π/2 = 90°.',
              deepDiveSv:
                'I enhetscirkeln bildar punkten (cos v, sin v) en rätvinklig triangel med hypotenusan 1, vilket omedelbart ger trigonometriska ettan cos²v + sin²v = 1.',
            },
          ],
          formulas: [
            {
              nameSv: 'Samband mellan grader och radianer',
              latex: '\\pi\\text{ rad} = 180^\\circ, \\quad b = r \\cdot v',
              explanationSv: 'Båglängden b blir direkt radien r gånger vinkeln v i radianer.',
              variables: [
                { symbol: 'b', meaningSv: 'Cirkelbågens längd', unit: 'l.e.' },
                { symbol: 'r', meaningSv: 'Radie', unit: 'l.e.' },
                { symbol: 'v', meaningSv: 'Medelpunktsvinkel', unit: 'rad' },
              ],
            },
            {
              nameSv: 'Trigonometriska ettan',
              latex: '\\sin^2 v + \\cos^2 v = 1',
              explanationSv: 'Gäller för alla vinklar v.',
              variables: [
                { symbol: 'v', meaningSv: 'Vinkel', unit: 'rad eller °' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Omvandla radianer till grader',
              givenSv: 'v = π / 3 rad',
              findSv: 'Vinkeln i grader',
              methodSv: 'Ersätt π med 180°.',
              stepsSv: ['180° / 3 = 60°.'],
              answerSv: '60°.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Bestäm cos v med trigonometriska ettan',
              givenSv: 'sin v = 0,6 och 0 < v < π / 2 (första kvadranten)',
              findSv: 'cos v',
              methodSv: 'Lös cos²v = 1 − sin²v och välj positivt tecken i första kvadranten.',
              stepsSv: ['cos²v = 1 − 0,36 = 0,64 ger cos v = +0,8.'],
              answerSv: 'cos v = 0,8.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Teckenval i andra kvadranten',
              givenSv: 'sin v = 5/13 och π/2 < v < π',
              findSv: 'Exakt värde på tan v',
              methodSv: 'Bestäm cos v < 0 i andra kvadranten och beräkna tan v = sin v / cos v.',
              stepsSv: [
                'cos²v = 1 − 25/169 = 144/169 ger cos v = −12/13.',
                'tan v = (5/13) / (−12/13) = −5/12.',
              ],
              answerSv: 'tan v = −5/12.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma kontrollera kvadranten vid roten ur (1 − sin²v)',
              wrongApproachSv: 'Att alltid välja den positiva roten för cos v.',
              rightApproachSv: 'I andra och tredje kvadranten är x-koordinaten negativ, alltså är cos v < 0.',
            },
          ],
        },
        {
          sectionSlug: 'trigonometriska-ekvationer',
          titleSv: 'Trigonometriska ekvationer och periodicitet',
          overviewConcepts: [
            { term: 'Periodisk lösning', definition: 'Varje helt varv ±n · 2π (eller ±n · 360°) ger nya vinklar med samma värde.' },
          ],
          theoryBlocks: [
            {
              heading: 'Fullständiga lösningsmängder',
              bodySv:
                'Eftersom sin x och cos x upprepar sina värden varje varv har ekvationer som sin x = a oändligt många lösningar. För sin x = sin v gäller dels x = v + n · 2π, dels x = (π − v) + n · 2π. För cos x = cos v gäller x = ±v + n · 2π. Står det sin(kx) måste man dividera hela uttrycket inklusive perioden med k i sista steget.',
              deepDiveSv:
                'Tangens har kortare period än sinus och cosinus: tan x = tan v har lösningen x = v + n · π (halvt varv).',
            },
          ],
          formulas: [
            {
              nameSv: 'Grundekvationer i radianer',
              latex: '\\sin x = \\sin v \\implies x = \\begin{cases} v + n\\cdot 2\\pi \\\\ \\pi - v + n\\cdot 2\\pi \\end{cases}',
              explanationSv: 'Där n ∈ ℤ anger godtyckligt antal hela varv.',
              variables: [
                { symbol: 'n', meaningSv: 'Heltalsvarv', unit: 'Heltal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Alla lösningar i ett varv',
              givenSv: '2 sin x = 1 för 0° ≤ x ≤ 360°',
              findSv: 'Samtliga vinklar x',
              methodSv: 'sin x = 0,5 ger huvudvinkeln 30° och supplementvinkeln 180° − 30°.',
              stepsSv: ['x₁ = 30° och x₂ = 150°.'],
              answerSv: 'x = 30° eller x = 150°.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Ekvation med multipel vinkel',
              givenSv: 'sin(3x) = 0,5 i intervallet 0 ≤ x < 2π',
              findSv: 'Antalet lösningar i intervallet',
              methodSv: '3x har perioden 2π / 3, så det ryms 3 fulla perioder med 2 lösningar per period.',
              stepsSv: [
                '3x = π/6 + n·2π eller 3x = 5π/6 + n·2π.',
                'x = π/18 + n·2π/3 eller x = 5π/18 + n·2π/3 ger n = 0, 1, 2 (6 lösningar).',
              ],
              answerSv: '6 lösningar i intervallet.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Andragradsekvation i cos x',
              givenSv: '2 cos²x − cos x − 1 = 0 i intervallet 0 ≤ x ≤ π',
              findSv: 'Exakta rötter',
              methodSv: 'Substituera t = cos x och lös 2t² − t − 1 = 0.',
              stepsSv: [
                't = (1 ± √9) / 4 ger t₁ = 1 och t₂ = −0,5.',
                'cos x = 1 ger x = 0; cos x = −0,5 ger x = 2π/3.',
              ],
              answerSv: 'x = 0 eller x = 2π / 3.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma dividera perioden 2π med k i sin(kx)',
              wrongApproachSv: 'Att skriva 3x = π/6 + n·2π och därefter x = π/18 + n·2π.',
              rightApproachSv: 'Dela både vinkeln och periodtermens +n·2π med 3 till +n·2π/3.',
            },
          ],
        },
        {
          sectionSlug: 'additionsformler-och-kurvor',
          titleSv: 'Sinuskurvor, additionsformler och omskrivning',
          overviewConcepts: [
            { term: 'Amplitud (A)', definition: 'Största utslaget från kurvans jämviktslinje (alltid ≥ 0).' },
            { term: 'Period (T)', definition: 'Längden för en hel svängning: T = 2π / k (eller 360° / k).' },
          ],
          theoryBlocks: [
            {
              heading: 'Harmonisk svängning och a sin x + b cos x',
              bodySv:
                'Funktionen y = A sin(k(x + φ)) + D beskriver svängningsrörelser med jämviktslinje y = D, maxvärde D + A och minvärde D − A. Med additionsformlerna kan summan a sin x + b cos x alltid slås ihop till en enda sinusfunktion A sin(x + v) där amplituden blir A = √(a² + b²).',
              deepDiveSv:
                'Additionsformlerna ger direkt formlerna för dubbla vinkeln: sin(2x) = 2 sin x cos x samt cos(2x) = cos²x − sin²x = 2 cos²x − 1 = 1 − 2 sin²x.',
            },
          ],
          formulas: [
            {
              nameSv: 'Sammanslagning av sinus och cosinus',
              latex: 'a\\sin x + b\\cos x = \\sqrt{a^2 + b^2} \\sin(x + v), \\quad \\tan v = \\frac{b}{a}',
              explanationSv: 'Gäller för a > 0; sammanslår två vågor med samma frekvens till en enda våg.',
              variables: [
                { symbol: 'a, b', meaningSv: 'Vågornas amplituder', unit: 'Tal' },
                { symbol: 'v', meaningSv: 'Fasförskjutning', unit: 'rad' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Period och maxvärde för cosinusfunktion',
              givenSv: 'y = 5 cos(3x) − 2',
              findSv: 'Största värdet',
              methodSv: 'cos(3x) är högst 1.',
              stepsSv: ['y_max = 5 · 1 − 2 = 3.'],
              answerSv: 'Största värdet är 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Skriva om 3 sin x + 4 cos x',
              givenSv: 'f(x) = 3 sin x + 4 cos x',
              findSv: 'Funktionens amplitud',
              methodSv: 'A = √(a² + b²).',
              stepsSv: ['A = √(3² + 4²) = √25 = 5.'],
              answerSv: 'Amplituden är 5.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Anpassa tidvattenmodell till mätvärden',
              givenSv: 'Högvatten 3,2 m kl 04:00 och lågvatten 1,2 m kl 10:00.',
              findSv: 'Jämviktslinje D, amplitud A och period T',
              methodSv: 'Tiden mellan topp och dal är en halv period.',
              stepsSv: [
                'D = (3,2 + 1,2) / 2 = 2,2 m och A = (3,2 − 1,2) / 2 = 1,0 m.',
                'Halv period = 10 − 4 = 6 h ger hel period T = 12 h och k = 2π / 12 = π / 6.',
              ],
              answerSv: 'D = 2,2 m, A = 1,0 m och perioden T = 12 h.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Förväxla konstanttermen k i sin(kx) med perioden',
              wrongApproachSv: 'Att svara att perioden för sin(2x) är 2.',
              rightApproachSv: 'Dela grundperioden med k: T = 2π / 2 = π (eller 360° / 2 = 180°).',
            },
          ],
          interactiveWidgetType: 'none',
          interactiveConfig: null,
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Radianer',
          promptSv: 'Hur många grader motsvarar vinkeln π / 3 radianer?',
          correctAnswer: '60',
          numericTolerance: 0.1,
          unitSv: '°',
          hintSv: 'π radianer motsvarar 180°.',
          stepBySolutionSv: '180° / 3 = 60°.',
          relatedSectionSlug: 'radianer-och-enhetscirkeln',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Trigonometriska kurvor',
          promptSv: 'Vad är perioden i grader för funktionen y = 4 sin(2x) + 3?',
          correctAnswer: '180',
          numericTolerance: 0.5,
          unitSv: '°',
          hintSv: 'Perioden är 360° / k.',
          stepBySolutionSv: '360° / 2 = 180°.',
          relatedSectionSlug: 'additionsformler-och-kurvor',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Trigonometriska kurvor',
          promptSv: 'Vad är det största värdet funktionen y = 5 cos(3x) − 2 kan anta?',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Det största värdet cosinus antar är +1.',
          stepBySolutionSv: 'y_max = 5 · 1 − 2 = 3.',
          relatedSectionSlug: 'additionsformler-och-kurvor',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Trigonometriska ettan',
          promptSv: 'Om sin v = 0,6 och 0 < v < π/2, vad är cos v?',
          options: ['0,4', '0,8', '−0,8', '0,64'],
          correctAnswer: '1',
          hintSv: 'Använd sin²v + cos²v = 1 i första kvadranten.',
          stepBySolutionSv: 'cos²v = 1 − 0,36 = 0,64 ger cos v = 0,8 eftersom v ligger i första kvadranten.',
          relatedSectionSlug: 'radianer-och-enhetscirkeln',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Ekvationer',
          promptSv: 'Lös ekvationen 2 sin x = 1 i intervallet 0° ≤ x ≤ 360°. Ange den största lösningen i grader.',
          correctAnswer: '150',
          numericTolerance: 0.5,
          unitSv: '°',
          hintSv: 'sin x = 0,5 har lösningarna 30° och 180° − 30°.',
          stepBySolutionSv: 'Lösningarna i intervallet är 30° och 150°. Den största är 150°.',
          relatedSectionSlug: 'trigonometriska-ekvationer',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Additionsformler',
          promptSv: 'Uttrycket 3 sin x + 4 cos x kan skrivas som A sin(x + v). Vad är amplituden A?',
          latexFormula: 'a\\sin x + b\\cos x = A\\sin(x + v)',
          correctAnswer: '5',
          numericTolerance: 0.05,
          hintSv: 'A = √(a² + b²).',
          stepBySolutionSv: 'A = √(3² + 4²) = √(9 + 16) = 5.',
          relatedSectionSlug: 'additionsformler-och-kurvor',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Ekvationer',
          promptSv: 'Hur många lösningar har ekvationen sin(3x) = 0,5 i intervallet 0 ≤ x < 2π?',
          correctAnswer: '6',
          numericTolerance: 0.01,
          hintSv: 'Varje period på 2π/3 rymmer 2 lösningar.',
          stepBySolutionSv: 'På [0, 2π) ryms 3 perioder av sin(3x), och varje period ger 2 skärningar med 0,5, alltså 3 · 2 = 6 lösningar.',
          relatedSectionSlug: 'trigonometriska-ekvationer',
        },
      ],
    }),
    buildChapter('course-matte-4', {
      slug: 'derivata-for-trig-exp-och-log',
      chapterNumber: 2,
      titleSv: 'Produkt-, kvot- och kedjeregeln samt trigonometrisk derivata',
      summarySv: 'Derivering av sammansatta funktioner, produkter, kvoter samt sin x, cos x och ln x.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'produkt-kvot-och-kedjeregeln',
          titleSv: 'Produkt-, kvot- och kedjeregeln',
          overviewConcepts: [
            { term: 'Kedjeregeln', definition: 'Yttre derivata gånger inre derivata: D(f(g(x))) = f\'(g(x)) · g\'(x).' },
            { term: 'Produktregeln', definition: 'D(f · g) = f\' · g + f · g\'.' },
          ],
          theoryBlocks: [
            {
              heading: 'Derivera sammansatta och trigonometriska uttryck',
              bodySv:
                'I radianer gäller D(sin x) = cos x, D(cos x) = −sin x och D(ln x) = 1/x. Kombineras detta med kedjeregeln får exempelvis sin(3x) derivatan 3 cos(3x) eftersom den inre funktionen 3x har derivatan 3.',
              deepDiveSv:
                'Kvotregeln lyder D(f/g) = (f\'g − fg\') / g².',
            },
          ],
          formulas: [
            {
              nameSv: 'Kedjeregeln och trigonometriska derivator',
              latex: '\\frac{d}{dx} f(g(x)) = f\'(g(x)) \\cdot g\'(x), \\quad D(\\sin x) = \\cos x, \\quad D(\\cos x) = -\\sin x',
              explanationSv: 'Gäller när vinkeln x mäts i radianer.',
              variables: [
                { symbol: 'g\'(x)', meaningSv: 'Inre derivata', unit: 'Derivata' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Kedjeregeln på cosinus',
              givenSv: 'f(x) = cos(4x)',
              findSv: 'f\'(x)',
              methodSv: 'Yttre derivata −sin(4x) gånger inre derivata 4.',
              stepsSv: ['f\'(x) = −4 sin(4x).'],
              answerSv: 'f\'(x) = −4 sin(4x).',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Produktregeln med e^x',
              givenSv: 'f(x) = x · e^x',
              findSv: 'f\'(0)',
              methodSv: 'f\'(x) = 1 · e^x + x · e^x = (1 + x)e^x.',
              stepsSv: ['f\'(0) = (1 + 0) · 1 = 1.'],
              answerSv: 'f\'(0) = 1.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Stationär punkt till x · ln x',
              givenSv: 'f(x) = x · ln x för x > 0',
              findSv: 'Var f\'(x) = 0',
              methodSv: 'Använd produktregeln: 1 · ln x + x · (1/x).',
              stepsSv: ['ln x + 1 = 0 ger ln x = −1 och x = e⁻¹ = 1/e.'],
              answerSv: 'Stationär punkt vid x = 1/e.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma minustecknet vid derivering av cos x',
              wrongApproachSv: 'Att skriva D(cos x) = sin x.',
              rightApproachSv: 'D(sin x) = +cos x, medan D(cos x) = −sin x.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'multiple_choice',
          categorySv: 'Derivata',
          promptSv: 'Vad är derivatan f\'(x) av f(x) = cos(4x)?',
          options: ['4 sin(4x)', '−4 sin(4x)', '−sin(4x)', '4 cos(4x)'],
          correctAnswer: '1',
          hintSv: 'Yttre derivatan av cos är −sin, gånger inre derivatan 4.',
          stepBySolutionSv: 'f\'(x) = −sin(4x) · 4 = −4 sin(4x).',
          relatedSectionSlug: 'produkt-kvot-och-kedjeregeln',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Derivata',
          promptSv: 'Givet f(x) = x · e^x. Beräkna f\'(0).',
          correctAnswer: '1',
          numericTolerance: 0.01,
          hintSv: 'Använd produktregeln: f\'(x) = e^x + x · e^x.',
          stepBySolutionSv: 'f\'(0) = e⁰ + 0 = 1.',
          relatedSectionSlug: 'produkt-kvot-och-kedjeregeln',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Derivata',
          promptSv: 'Beräkna derivatan f\'(2) för funktionen f(x) = 6 ln(x).',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'D(ln x) = 1/x.',
          stepBySolutionSv: 'f\'(x) = 6/x ger f\'(2) = 6/2 = 3.',
          relatedSectionSlug: 'produkt-kvot-och-kedjeregeln',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Kvotregeln',
          promptSv: 'Vad blir derivatan av f(x) = (x + 1) / (x − 1) för x ≠ 1?',
          options: ['−2 / (x − 1)²', '2 / (x − 1)²', '1', '(2x) / (x − 1)²'],
          correctAnswer: '0',
          hintSv: 'Tillämpa kvotregeln (f\'g − fg\') / g².',
          stepBySolutionSv: '(1(x − 1) − (x + 1)·1) / (x − 1)² = −2 / (x − 1)².',
          relatedSectionSlug: 'produkt-kvot-och-kedjeregeln',
        },
      ],
    }),
    buildChapter('course-matte-4', {
      slug: 'integraler-och-rotationsvolymer',
      chapterNumber: 3,
      titleSv: 'Integraler och rotationsvolymer',
      summarySv: 'Primitiva funktioner till sin x, cos x och 1/x samt skivmetoden för rotationsvolymer kring x-axeln.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'rotationsvolymer',
          titleSv: 'Integraler och rotationsvolym kring x-axeln',
          overviewConcepts: [
            { term: 'Rotationsvolym', definition: 'Volym som uppstår då en kurva roterar ett helt varv kring x-axeln: V = π ∫ y² dx.' },
          ],
          theoryBlocks: [
            {
              heading: 'Skivmetoden med cirkulära tvärsnitt',
              bodySv:
                'Varje tunt tvärsnitt vinkelrätt mot x-axeln bildar en cirkelskiva med radien r = y och arean πy². Summeras skivorna med en integral fås volymen V = π ∫[a till b] (f(x))² dx. För 1/x (x > 0) är primitiva funktionen ln x.',
              deepDiveSv:
                'Kom ihåg att alltid kvadrera hela funktionsuttrycket f(x) inuti integralen vid beräkning av rotationsvolym kring x-axeln.',
            },
          ],
          formulas: [
            {
              nameSv: 'Rotationsvolym kring x-axeln',
              latex: 'V = \\pi \\int_a^b \\left(f(x)\\right)^2\\,dx',
              explanationSv: 'Skivmetoden integrerar tvärsnittsarean πr² med r = f(x).',
              variables: [
                { symbol: 'V', meaningSv: 'Rotationsvolym', unit: 'v.e.' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Integral med 1/x',
              givenSv: '∫[1 till e] (2/x) dx',
              findSv: 'Exakt värde',
              methodSv: 'Primitiv funktion till 2/x är 2 ln x.',
              stepsSv: ['[2 ln x]₁ᵉ = 2 ln e − 2 ln 1 = 2 · 1 − 0 = 2.'],
              answerSv: '2.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Rotationsvolym av kon',
              givenSv: 'Linjen y = x roterar kring x-axeln för 0 ≤ x ≤ 3.',
              findSv: 'Volymen som multipel av π',
              methodSv: 'V = π ∫[0 till 3] x² dx.',
              stepsSv: ['V = π [x³/3]₀³ = π · (27 / 3) = 9π.'],
              answerSv: '9π v.e.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Rotationsvolym under rotfunktion',
              givenSv: 'y = √(x + 1) roterar kring x-axeln för 0 ≤ x ≤ 3.',
              findSv: 'Volymen',
              methodSv: '(√(x + 1))² = x + 1.',
              stepsSv: ['V = π ∫[0 till 3] (x + 1) dx = π [x²/2 + x]₀³ = π (4,5 + 3) = 7,5π.'],
              answerSv: '7,5π v.e.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma π eller kvadraten i volymintegralen',
              wrongApproachSv: 'Att skriva ∫ f(x) dx eller glömma multiplicera med π.',
              rightApproachSv: 'Tvärsnittsarean är π · y², så både π och kvadraten måste vara med.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Integraler',
          promptSv: 'Beräkna det exakta värdet av ∫[1 till e] (3/x) dx.',
          latexFormula: '\\int_1^e \\frac{3}{x}\\,dx',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Primitiv funktion är 3 ln x, och ln e = 1, ln 1 = 0.',
          stepBySolutionSv: '3(ln e − ln 1) = 3(1 − 0) = 3.',
          relatedSectionSlug: 'rotationsvolymer',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Integraler',
          promptSv: 'Beräkna det exakta värdet av ∫[0 till π] sin(x) dx.',
          latexFormula: '\\int_0^{\\pi} \\sin x\\,dx',
          correctAnswer: '2',
          numericTolerance: 0.01,
          hintSv: 'Primitiv funktion till sin x är −cos x.',
          stepBySolutionSv: '[−cos x]₀^π = −cos π − (−cos 0) = −(−1) + 1 = 2.',
          relatedSectionSlug: 'rotationsvolymer',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Rotationsvolym',
          promptSv: 'Området under y = x för 0 ≤ x ≤ 3 roterar ett helt varv kring x-axeln. Vad blir volymen?',
          options: ['3π', '4,5π', '9π', '27π'],
          correctAnswer: '2',
          hintSv: 'V = π ∫[0 till 3] x² dx.',
          stepBySolutionSv: 'π [x³/3]₀³ = 9π v.e.',
          relatedSectionSlug: 'rotationsvolymer',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Rotationsvolym',
          promptSv: 'Kurvan y = √x roterar kring x-axeln för 0 ≤ x ≤ 4. Vad blir volymen?',
          options: ['4π', '8π', '16π', '2π'],
          correctAnswer: '1',
          hintSv: '(√x)² = x.',
          stepBySolutionSv: 'π ∫[0 till 4] x dx = π [x²/2]₀⁴ = 8π v.e.',
          relatedSectionSlug: 'rotationsvolymer',
        },
      ],
    }),
    buildChapter('course-matte-4', {
      slug: 'komplexa-tal',
      chapterNumber: 4,
      titleSv: 'Komplexa tal, polär form och de Moivres formel',
      summarySv: 'Imaginära enheten i, räkning i rektangulär och polär form, komplexa planet samt de Moivres formel.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'komplexa-tal-och-polar-form',
          titleSv: 'Komplexa tal och polär form',
          overviewConcepts: [
            { term: 'Imaginära enheten (i)', definition: 'Definieras genom i² = −1.' },
            { term: 'Absolutbelopp (|z|)', definition: 'Avståndet till origo i det komplexa talplanet: r = √(a² + b²).' },
            { term: 'Argument (arg z)', definition: 'Vinkeln v från positiva realaxeln moturs till vektorn z.' },
          ],
          theoryBlocks: [
            {
              heading: 'Rektangulär form, polär form och de Moivres formel',
              bodySv:
                'Ett komplext tal z = a + bi har realdelen a och imaginärdelen b. På polär form skrivs det z = r(cos v + i sin v). Vid multiplikation multipliceras beloppen och argumenten adderas, vilket ger de Moivres formel för potenser: z^n = r^n(cos(nv) + i sin(nv)).',
              deepDiveSv:
                'Komplexa konjugatet till z = a + bi är z̄ = a − bi. Produkten z · z̄ = a² + b² = |z|² är alltid ett icke-negativt reellt tal och används vid division.',
            },
          ],
          formulas: [
            {
              nameSv: 'de Moivres formel',
              latex: '\\left(r(\\cos v + i\\sin v)\\right)^n = r^n(\\cos(nv) + i\\sin(nv))',
              explanationSv: 'Gör det snabbt att beräkna höga potenser av komplexa tal.',
              variables: [
                { symbol: 'r', meaningSv: 'Absolutbelopp |z|', unit: '≥ 0' },
                { symbol: 'v', meaningSv: 'Argument', unit: 'rad eller °' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Beräkna belopp',
              givenSv: 'z = 3 + 4i',
              findSv: '|z|',
              methodSv: '|z| = √(3² + 4²).',
              stepsSv: ['√(9 + 16) = 5.'],
              answerSv: '|z| = 5.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Division med komplext konjugat',
              givenSv: '(10) / (3 + i)',
              findSv: 'Uttryck på formen a + bi',
              methodSv: 'Förläng täljare och nämnare med konjugatet 3 − i.',
              stepsSv: ['(10(3 − i)) / (3² + 1²) = (30 − 10i) / 10 = 3 − i.'],
              answerSv: '3 − i.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Potens med de Moivres formel',
              givenSv: 'z = 2(cos 30° + i sin 30°)',
              findSv: 'z³ på formen a + bi',
              methodSv: 'Upphöj beloppet till 3 och multiplicera vinkeln med 3.',
              stepsSv: ['z³ = 2³(cos 90° + i sin 90°) = 8(0 + i) = 8i.'],
              answerSv: 'z³ = 8i.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Inkludera i i imaginärdelen',
              wrongApproachSv: 'Att skriva att imaginärdelen till 3 + 4i är 4i.',
              rightApproachSv: 'Imaginärdelen Im(3 + 4i) är det reella talet 4 (utan i).',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Komplexa tal',
          promptSv: 'Beräkna absolutbeloppet |z| för det komplexa talet z = 6 − 8i.',
          correctAnswer: '10',
          numericTolerance: 0.01,
          hintSv: '|z| = √(6² + (−8)²).',
          stepBySolutionSv: '√(36 + 64) = √100 = 10.',
          relatedSectionSlug: 'komplexa-tal-och-polar-form',
        },
        {
          gradeLevel: 'E',
          questionType: 'multiple_choice',
          categorySv: 'Komplexa tal',
          promptSv: 'Vad är produkten (2 + 3i)(2 − 3i)?',
          options: ['−5', '13', '4 − 9i', '13i'],
          correctAnswer: '1',
          hintSv: 'Använd konjugatregeln och att i² = −1.',
          stepBySolutionSv: '2² − (3i)² = 4 − 9(−1) = 4 + 9 = 13.',
          relatedSectionSlug: 'komplexa-tal-och-polar-form',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Komplexa tal',
          promptSv: 'Vad blir (1 + i)² om det skrivs på formen a + bi? Ange imaginärdelen b.',
          correctAnswer: '2',
          numericTolerance: 0.01,
          hintSv: 'Utveckla med första kvadreringsregeln och använd i² = −1.',
          stepBySolutionSv: '1 + 2i + i² = 1 + 2i − 1 = 2i, så b = 2.',
          relatedSectionSlug: 'komplexa-tal-och-polar-form',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'de Moivres formel',
          promptSv: 'Om z = 2(cos 20° + i sin 20°), vad är absolutbeloppet |z⁴|?',
          correctAnswer: '16',
          numericTolerance: 0.01,
          hintSv: 'Beloppet upphöjs till n enligt de Moivres formel.',
          stepBySolutionSv: '|z⁴| = 2⁴ = 16.',
          relatedSectionSlug: 'komplexa-tal-och-polar-form',
        },
      ],
    }),
  ],
};

export const matte5Course: CourseSeed = {
  id: 'course-matte-5',
  subjectId: 'subj-matematik',
  slug: 'matte-5',
  codeGy25: 'MATF1000X',
  nameSv: 'Matematik 5',
  levelLabelSv: 'Fördjupning nivå 1',
  centralContentSummarySv:
    'Differentialekvationer och riktningsfält, Eulers stegmetod, kombinatorik, talföljder och matematisk induktion samt fördjupad integralkalkyl.',
  sortOrder: 10,
  chapters: [
    buildChapter('course-matte-5', {
      slug: 'differentialekvationer-och-riktningsfalt',
      chapterNumber: 1,
      titleSv: 'Differentialekvationer och riktningsfält',
      summarySv:
        'Verifiering av lösningar, homogena och inhomogena linjära differentialekvationer, riktningsfält samt Eulers stegmetod.',
      isFree: true,
      estimatedMinutes: 50,
      lessons: [
        {
          sectionSlug: 'begreppet-differentialekvation',
          titleSv: 'Differentialekvationer och prövning av lösning',
          overviewConcepts: [
            { term: 'Differentialekvation', definition: 'Ekvation som innehåller en okänd funktion y och en eller flera av dess derivator.' },
            { term: 'Begynnelsevillkor', definition: 'Givet värde som t.ex. y(0) = 3 som bestämmer den obekanta konstanten C entydigt.' },
          ],
          theoryBlocks: [
            {
              heading: 'Allmän lösning, partikulärlösning och verifiering',
              bodySv:
                'Lösningen till en differentialekvation är inte ett tal utan en funktion (eller en hel familj av funktioner med en godtycklig konstant C). För att visa att en given funktion uppfyller en differentialekvation deriverar man funktionen, sätter in uttrycken för y, y\' och eventuellt y\'\' i vänsterledet (VL) och högerledet (HL) var för sig och visar att VL = HL.',
              deepDiveSv:
                'Differentialekvationens ordning bestäms av den högsta derivata som ingår i ekvationen.',
            },
          ],
          formulas: [
            {
              nameSv: 'Proportionell tillväxt',
              latex: 'y\' = k \\cdot y \\iff y = C \\cdot e^{kx}',
              explanationSv: 'Den mest grundläggande differentialekvationen inom biologi, fysik och ekonomi.',
              variables: [
                { symbol: 'k', meaningSv: 'Proportionalitetskonstant', unit: 'Tal' },
                { symbol: 'C', meaningSv: 'Startvärde vid x = 0', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Bestämma C ur begynnelsevillkor',
              givenSv: 'y\' = 2y och y(0) = 3',
              findSv: 'Den partikulära lösningen y(x)',
              methodSv: 'Allmänna lösningen är y = C · e^(2x). Sätt in x = 0.',
              stepsSv: ['3 = C · e⁰ = C ger C = 3, alltså y(x) = 3e^(2x).'],
              answerSv: 'y(x) = 3e^(2x).',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Verifiera lösning med VL och HL',
              givenSv: 'Visa att y = 4e^(−3x) + 5 löser y\' + 3y = 15.',
              findSv: 'Bevis genom insättning',
              methodSv: 'Derivera y och beräkna VL.',
              stepsSv: [
                'y\' = −12e^(−3x).',
                'VL = −12e^(−3x) + 3(4e^(−3x) + 5) = −12e^(−3x) + 12e^(−3x) + 15 = 15 = HL.',
              ],
              answerSv: 'VL = HL för alla x, så funktionen är en lösning.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Jämviktslösning i en tillväxtmodell',
              givenSv: 'y\' = 0,5y − 2',
              findSv: 'Den konstanta jämviktslösningen',
              methodSv: 'Vid jämvikt är förändringen noll: y\' = 0.',
              stepsSv: ['0,5y − 2 = 0 ger 0,5y = 2 och y = 4.'],
              answerSv: 'y(x) = 4.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Sätta VL = HL i en ekvation i stället för att beräkna dem separat vid prövning',
              wrongApproachSv: 'Att skriva VL = HL redan på första raden innan beviset är klart.',
              rightApproachSv: 'Räkna ut VL för sig och HL för sig och konstatera först på sista raden att VL = HL.',
            },
          ],
        },
        {
          sectionSlug: 'homogena-och-inhomogena-ekvationer',
          titleSv: 'Homogena och inhomogena linjära differentialekvationer',
          overviewConcepts: [
            { term: 'Homogen ekvation', definition: 'Linjär differentialekvation där högerledet är 0.' },
            { term: 'Partikulärlösning (y_p)', definition: 'En enskild lösning som uppfyller hela den inhomogena ekvationen.' },
          ],
          theoryBlocks: [
            {
              heading: 'Strukturen y = y_h + y_p och andra ordningens ekvationer',
              bodySv:
                'Den fullständiga lösningen till en inhomogen linjär differentialekvation är alltid summan y = y_h + y_p, där y_h är den allmänna lösningen till motsvarande homogena ekvation och y_p är en valfri partikulärlösning. För andra ordningens homogena ekvationer y\'\' + ay\' + by = 0 ansätter man y = e^(rx), vilket leder till den karakteristiska ekvationen r² + ar + b = 0.',
              deepDiveSv:
                'Har r² + ar + b = 0 två olika reella rötter r₁ och r₂ blir lösningen y = C₁e^(r₁x) + C₂e^(r₂x). Komplexa rötter r = α ± βi ger svängningar med e^(αx)(A cos βx + B sin βx).',
            },
          ],
          formulas: [
            {
              nameSv: 'Inhomogen första ordningens differentialekvation',
              latex: 'y\' + ay = b \\implies y = C e^{-ax} + \\frac{b}{a}',
              explanationSv: 'Gäller när a och b är konstanter (a ≠ 0).',
              variables: [
                { symbol: 'a, b', meaningSv: 'Konstanter', unit: 'Tal' },
              ],
            },
            {
              nameSv: 'Karakteristisk ekvation',
              latex: 'y\'\' + ay\' + by = 0 \\implies r^2 + ar + b = 0',
              explanationSv: 'Bestämmer rötterna r för ansatsen y = e^(rx).',
              variables: [
                { symbol: 'r', meaningSv: 'Karakteristisk rot', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Konstant partikulärlösning',
              givenSv: 'y\' + 2y = 10',
              findSv: 'Konstant partikulärlösning y_p',
              methodSv: 'Ansätt y_p = A (konstant), vilket ger y_p\' = 0.',
              stepsSv: ['0 + 2A = 10 ger A = 5.'],
              answerSv: 'y_p = 5.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Andra ordningens homogena ekvation',
              givenSv: 'y\'\' − 5y\' + 6y = 0',
              findSv: 'Allmänna lösningen',
              methodSv: 'Lös r² − 5r + 6 = 0.',
              stepsSv: [
                '(r − 2)(r − 3) = 0 ger r₁ = 2 och r₂ = 3.',
                'y = C₁e^(2x) + C₂e^(3x).',
              ],
              answerSv: 'y = C₁e^(2x) + C₂e^(3x).',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Inhomogen ekvation med linjärt högerled',
              givenSv: 'y\' + y = 2x',
              findSv: 'Allmänna lösningen',
              methodSv: 'Ansätt y_p = ax + b, derivera och matcha koefficienter.',
              stepsSv: [
                'y_h = C · e^(−x).',
                'y_p\' + y_p = a + ax + b = 2x ger a = 2 och a + b = 0 → b = −2.',
                'y = C · e^(−x) + 2x − 2.',
              ],
              answerSv: 'y = C · e^(−x) + 2x − 2.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Sätta in y = y_p som slutsvar utan den homogena delen y_h',
              wrongApproachSv: 'Att bara svara y = 5 på y\' + 2y = 10.',
              rightApproachSv: 'Den allmänna lösningen kräver alltid y_h med konstanten C: y = C · e^(−2x) + 5.',
            },
          ],
        },
        {
          sectionSlug: 'riktningsfalt-och-tillampningar',
          titleSv: 'Riktningsfält och Eulers stegmetod',
          overviewConcepts: [
            { term: 'Riktningsfält', definition: 'Grafisk karta av små lutningsstreck med riktningskoefficienten y\'(x, y) i varje punkt.' },
            { term: 'Eulers stegmetod', definition: 'Numerisk metod som stegar framåt med y_{k+1} = y_k + h · y\'(x_k, y_k).' },
          ],
          theoryBlocks: [
            {
              heading: 'Tolka riktningsfält och stega numeriskt',
              bodySv:
                'Många verkliga differentialekvationer saknar enkel exakt formel, men deras lösningar kan ändå skissas direkt ur riktningsfältet eller approximeras med Eulers stegmetod. Vid Eulers metod följer man tangentens lutning y\' under ett kort steg h för att skatta nästa y-värde.',
              deepDiveSv:
                'Om lutningsstrecken i ett riktningsfält är identiska längs varje vågrät linje (oberoende av x) beror differentialekvationen enbart av y och kallas autonom: y\' = f(y).',
              svgDiagram: SVG_SLOPE_FIELD,
            },
          ],
          formulas: [
            {
              nameSv: 'Eulers stegmetod',
              latex: 'y_{k+1} = y_k + h \\cdot f(x_k, y_k)',
              explanationSv: 'Numerisk approximation med steglängden h för ekvationen y\' = f(x, y).',
              variables: [
                { symbol: 'h', meaningSv: 'Steglängd i x-led', unit: 'Tal' },
                { symbol: 'f(x_k, y_k)', meaningSv: 'Lutning i nuvarande punkt', unit: 'Derivata' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Läsa lutning ur differentialekvation',
              givenSv: 'y\' = x − y',
              findSv: 'Riktningsstreckets lutning i punkten (4, 1)',
              methodSv: 'Sätt in x = 4 och y = 1.',
              stepsSv: ['y\' = 4 − 1 = 3.'],
              answerSv: 'Lutningen i (4, 1) är 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Ett steg med Eulers metod',
              givenSv: 'y\' = 2x + y, y(0) = 2 och steglängd h = 0,5',
              findSv: 'Närmevärde för y(0,5)',
              methodSv: 'Beräkna lutningen i (0, 2) och ta ett steg av längd 0,5.',
              stepsSv: [
                'y\'(0, 2) = 2 · 0 + 2 = 2.',
                'y₁ = 2 + 0,5 · 2 = 3,0.',
              ],
              answerSv: 'y(0,5) ≈ 3,0.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Två steg med Eulers metod och felanalys',
              givenSv: 'Fortsätt exemplet ovan ett steg till x = 1,0 med h = 0,5.',
              findSv: 'y₂ ≈ y(1,0) och om närmevärdet underskattar en konvex lösning',
              methodSv: 'Använd (x₁, y₁) = (0,5; 3,0) i nästa steg.',
              stepsSv: [
                'y\'(0,5; 3,0) = 2 · 0,5 + 3,0 = 4,0.',
                'y₂ = 3,0 + 0,5 · 4,0 = 5,0.',
                'Eftersom lutningen växer hela tiden ligger tangentstegen under den uppåtböjda kurvan (underskattning).',
              ],
              answerSv: 'y(1,0) ≈ 5,0 (underskattning).',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma uppdatera x-koordinaten i Eulers metod',
              wrongApproachSv: 'Att behålla x₀ = 0 i alla steg när x ingår i högerledet.',
              rightApproachSv: 'Öka x med +h i varje steg: x₁ = x₀ + h, x₂ = x₀ + 2h.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'multiple_choice',
          categorySv: 'Differentialekvationer',
          promptSv: 'Vilken är den allmänna lösningen till differentialekvationen y\' = 3y?',
          options: ['y = 3x + C', 'y = C · e^(3x)', 'y = 3e^x', 'y = C · e^(−3x)'],
          correctAnswer: '1',
          hintSv: 'y\' = ky har lösningen y = C · e^(kx).',
          stepBySolutionSv: 'Deriveras y = C · e^(3x) fås y\' = 3 · C · e^(3x) = 3y.',
          relatedSectionSlug: 'begreppet-differentialekvation',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Begynnelsevillkor',
          promptSv: 'Funktionen y = C · e^(2x) löser y\' = 2y med begynnelsevillkoret y(0) = 3. Vad är konstanten C?',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Sätt in x = 0 och y = 3.',
          stepBySolutionSv: '3 = C · e⁰ = C · 1 ger C = 3.',
          relatedSectionSlug: 'begreppet-differentialekvation',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Jämvikt',
          promptSv: 'Differentialekvationen y\' = 0,5y − 2 har en konstant jämviktslösning där y\' = 0. Vilket värde har denna lösning y?',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: 'Lös 0,5y − 2 = 0.',
          stepBySolutionSv: '0,5y = 2 ger y = 4.',
          relatedSectionSlug: 'begreppet-differentialekvation',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Andra ordningen',
          promptSv: 'Vilken karakteristisk ekvation hör till y\'\' − 5y\' + 6y = 0?',
          options: ['r² + 5r + 6 = 0', 'r² − 5r + 6 = 0', 'r² − 6r + 5 = 0', '2r − 5 = 0'],
          correctAnswer: '1',
          hintSv: 'Ansätt y = e^(rx) så att y\' = re^(rx) och y\'\' = r²e^(rx).',
          stepBySolutionSv: 'Division med e^(rx) ger r² − 5r + 6 = 0.',
          relatedSectionSlug: 'homogena-och-inhomogena-ekvationer',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Numerisk metod',
          promptSv: 'Använd Eulers stegmetod med steglängden h = 0,5 på y\' = 2x + y och startvärdet y(0) = 2. Vad blir närmevärdet för y(0,5)?',
          correctAnswer: '3',
          numericTolerance: 0.05,
          hintSv: 'y₁ = y₀ + h · y\'(0, 2).',
          stepBySolutionSv: 'y\'(0, 2) = 2 · 0 + 2 = 2, så y₁ = 2 + 0,5 · 2 = 3.',
          relatedSectionSlug: 'riktningsfalt-och-tillampningar',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Inhomogen ekvation',
          promptSv: 'Den inhomogena differentialekvationen y\' + 2y = 10 har en konstant partikulärlösning y_p. Vad är y_p?',
          correctAnswer: '5',
          numericTolerance: 0.01,
          hintSv: 'För en konstant är derivatan y_p\' = 0.',
          stepBySolutionSv: '0 + 2y_p = 10 ger y_p = 5.',
          relatedSectionSlug: 'homogena-och-inhomogena-ekvationer',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Riktningsfält',
          promptSv: 'I ett riktningsfält har alla streck längs varje horisontell linje exakt samma lutning oavsett x-koordinat. Vad säger detta om differentialekvationen?',
          options: [
            'Att den saknar lösningar',
            'Att högerledet y\' endast beror av y (inte av x)',
            'Att lösningen alltid är en rät linje',
            'Att y\' alltid är noll',
          ],
          correctAnswer: '1',
          hintSv: 'Om x inte påverkar lutningen saknas variabeln x i uttrycket för y\'.',
          stepBySolutionSv: 'Konstant lutning längs y = konstant innebär en autonom ekvation y\' = f(y).',
          relatedSectionSlug: 'riktningsfalt-och-tillampningar',
        },
      ],
    }),
    buildChapter('course-matte-5', {
      slug: 'kombinatorik-och-talfoljder',
      chapterNumber: 2,
      titleSv: 'Kombinatorik, talföljder och induktion',
      summarySv: 'Permutationer, kombinationer, binomialsatsen, aritmetiska och geometriska talföljder samt induktionsbevis.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'kombinatorik-och-induktion',
          titleSv: 'Kombinationer, talföljder och induktionsbevis',
          overviewConcepts: [
            { term: 'Kombination C(n, k)', definition: 'Antalet sätt att välja k element ur n utan hänsyn till ordning.' },
            { term: 'Matematisk induktion', definition: 'Bevismetod i tre steg: basfall, induktionsantagande och induktionssteg.' },
          ],
          theoryBlocks: [
            {
              heading: 'Ordning spelar roll eller ej, samt talföljder',
              bodySv:
                'Vid permutationer spelar ordningen roll, medan kombinationer C(n, k) = n! / (k!(n − k)!) räknar antalet oordnade urval. För en geometrisk summa med kvot k ≠ 1 gäller S_n = a₁(k^n − 1) / (k − 1).',
              deepDiveSv:
                'Induktionsbevis bevisar påståenden P(n) för alla heltal n ≥ n₀ genom att visa P(n₀) samt implikationen P(p) ⇒ P(p + 1).',
            },
          ],
          formulas: [
            {
              nameSv: 'Kombinationer och geometrisk summa',
              latex: '\\binom{n}{k} = \\frac{n!}{k!(n - k)!}, \\quad S_n = \\frac{a_1(k^n - 1)}{k - 1}',
              explanationSv: 'Används vid urval utan ordning respektive summor med konstant kvot k.',
              variables: [
                { symbol: 'n', meaningSv: 'Totalmängd eller antal termer', unit: 'Heltal ≥ 1' },
                { symbol: 'k', meaningSv: 'Antal valda eller kvot', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Välja en kommitté',
              givenSv: '3 elever ska väljas ur 6 utan inbördes ordning.',
              findSv: 'Antalet olika kommittéer',
              methodSv: 'Beräkna C(6, 3).',
              stepsSv: ['(6 · 5 · 4) / (3 · 2 · 1) = 120 / 6 = 20.'],
              answerSv: '20 sätt.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Aritmetisk summa',
              givenSv: 'Summan 3 + 7 + 11 + ... + 39 (10 termer)',
              findSv: 'Summan',
              methodSv: 'S_n = n(a₁ + a_n) / 2.',
              stepsSv: ['S₁₀ = 10(3 + 39) / 2 = 210.'],
              answerSv: '210.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Induktionssteget för summan av udda tal',
              givenSv: 'Antag att 1 + 3 + ... + (2p − 1) = p².',
              findSv: 'Visa formeln för p + 1',
              methodSv: 'Addera nästa udda tal (2p + 1) till båda sidor.',
              stepsSv: ['p² + (2p + 1) = (p + 1)², vilket stämmer med formeln för n = p + 1.'],
              answerSv: 'Påståendet är bevisat för alla heltal n ≥ 1.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Förväxla permutationer med kombinationer',
              wrongApproachSv: 'Att använda 6 · 5 · 4 = 120 när ordningen saknar betydelse.',
              rightApproachSv: 'Dela alltid med k! när ett urval sker utan inbördes ordning.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Kombinatorik',
          promptSv: 'På hur många sätt kan man välja 2 personer ur en grupp på 6 personer utan hänsyn till ordning?',
          latexFormula: '\\binom{6}{2}',
          correctAnswer: '15',
          numericTolerance: 0.01,
          hintSv: 'Beräkna (6 · 5) / 2.',
          stepBySolutionSv: 'C(6, 2) = 30 / 2 = 15.',
          relatedSectionSlug: 'kombinatorik-och-induktion',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Talföljder',
          promptSv: 'Beräkna den geometriska summan 2 + 4 + 8 + 16 + 32.',
          correctAnswer: '62',
          numericTolerance: 0.01,
          hintSv: 'S₅ = 2(2⁵ − 1) / (2 − 1).',
          stepBySolutionSv: '2(32 − 1) / 1 = 62.',
          relatedSectionSlug: 'kombinatorik-och-induktion',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Induktion',
          promptSv: 'Vad görs i det tredje steget (induktionssteget) av ett induktionsbevis?',
          options: [
            'Man kontrollerar formeln för n = 1, 2 och 3',
            'Man visar att om påståendet gäller för n = p, så gäller det även för n = p + 1',
            'Man löser ekvationen p = 0',
            'Man integrerar funktionen',
          ],
          correctAnswer: '1',
          hintSv: 'Kedjeeffekten kräver steget från p till p + 1.',
          stepBySolutionSv: 'Man bevisar implikationen P(p) ⇒ P(p + 1).',
          relatedSectionSlug: 'kombinatorik-och-induktion',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Binomialsatsen',
          promptSv: 'Vad är koefficienten framför x²-termen i utvecklingen av (x + 2)⁴?',
          correctAnswer: '24',
          numericTolerance: 0.1,
          hintSv: 'Termen är C(4, 2) · x² · 2².',
          stepBySolutionSv: 'C(4, 2) · 4 = 6 · 4 = 24.',
          relatedSectionSlug: 'kombinatorik-och-induktion',
        },
      ],
    }),
    buildChapter('course-matte-5', {
      slug: 'fordjupad-analys-och-volymintegraler',
      chapterNumber: 3,
      titleSv: 'Partiell integration, substitution och generaliserade integraler',
      summarySv: 'Avancerade integrationsmetoder, volymer kring y-axeln samt gränsvärden av oändliga intervall.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'integrationsmetoder',
          titleSv: 'Variabelsubstitution och partiell integration',
          overviewConcepts: [
            { term: 'Partiell integration', definition: 'Integrationsmotsvarighet till produktregeln: ∫ f\'g dx = fg − ∫ fg\' dx.' },
            { term: 'Generaliserad integral', definition: 'Integral med ∞ som gräns definierad som lim(b → ∞) ∫[a till b] f(x) dx.' },
          ],
          theoryBlocks: [
            {
              heading: 'Integrera produkter och obegränsade intervall',
              bodySv:
                'Produkter som x · e^x kan inte integreras termvis utan löses med partiell integration. När en integrationsgräns är ∞ ersätts den med en variabel b varefter gränsvärdet b → ∞ beräknas.',
              deepDiveSv:
                'En generaliserad integral sägs vara konvergent om gränsvärdet existerar som ett ändligt tal, annars divergent.',
            },
          ],
          formulas: [
            {
              nameSv: 'Partiell integration',
              latex: '\\int f\'(x)g(x)\\,dx = f(x)g(x) - \\int f(x)g\'(x)\\,dx',
              explanationSv: 'Välj g(x) som den faktor som blir enklare vid derivering.',
              variables: [
                { symbol: 'f\'(x), g(x)', meaningSv: 'Faktorer i integranden', unit: 'Funktioner' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Konvergent generaliserad integral',
              givenSv: '∫[1 till ∞] x⁻² dx',
              findSv: 'Värdet om den konvergerar',
              methodSv: 'Beräkna lim(b → ∞) [−1/x]₁ᵇ.',
              stepsSv: ['lim(b → ∞) (−1/b − (−1/1)) = 0 + 1 = 1.'],
              answerSv: 'Integralen konvergerar mot värdet 1.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Variabelsubstitution',
              givenSv: '∫ 2x · e^(x²) dx',
              findSv: 'Samtliga primitiva funktioner',
              methodSv: 'Substituera u = x², då du = 2x dx.',
              stepsSv: ['∫ e^u du = e^u + C = e^(x²) + C.'],
              answerSv: 'e^(x²) + C.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Partiell integration på x · cos x',
              givenSv: '∫[0 till π/2] x · cos x dx',
              findSv: 'Exakt värde',
              methodSv: 'Välj g(x) = x och f\'(x) = cos x.',
              stepsSv: ['[x sin x]₀^(π/2) − ∫[0 till π/2] sin x dx = (π/2) − [−cos x]₀^(π/2) = π/2 − 1.'],
              answerSv: 'π/2 − 1.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma byta gränser eller substituera tillbaka vid variabelbyte',
              wrongApproachSv: 'Att sätta in x-gränserna direkt i u-uttrycket.',
              rightApproachSv: 'Byt antingen till nya u-gränser direkt eller byt tillbaka från u till x före insättning.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Generaliserad integral',
          promptSv: 'Beräkna värdet av den generaliserade integralen ∫[1 till ∞] x⁻² dx.',
          latexFormula: '\\int_1^{\\infty} x^{-2}\\,dx',
          correctAnswer: '1',
          numericTolerance: 0.01,
          hintSv: 'Primitiv funktion är −1/x.',
          stepBySolutionSv: 'lim(b → ∞) (−1/b + 1) = 1.',
          relatedSectionSlug: 'integrationsmetoder',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Generaliserad integral',
          promptSv: 'Beräkna värdet av ∫[0 till ∞] 2e^(−2x) dx.',
          latexFormula: '\\int_0^{\\infty} 2e^{-2x}\\,dx',
          correctAnswer: '1',
          numericTolerance: 0.01,
          hintSv: 'Primitiv funktion är −e^(−2x).',
          stepBySolutionSv: 'lim(b → ∞) (−e^(−2b) − (−e⁰)) = 0 + 1 = 1.',
          relatedSectionSlug: 'integrationsmetoder',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Analys',
          promptSv: 'Vad gäller för den generaliserade integralen ∫[1 till ∞] (1/x) dx?',
          options: [
            'Den konvergerar mot 1',
            'Den konvergerar mot ln 2',
            'Den divergerar eftersom ln b → ∞ då b → ∞',
            'Den är lika med 0',
          ],
          correctAnswer: '2',
          hintSv: 'Primitiv funktion till 1/x är ln x.',
          stepBySolutionSv: 'ln b växer obegränsat när b → ∞, så integralen divergerar.',
          relatedSectionSlug: 'integrationsmetoder',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Partiell integration',
          promptSv: 'Vilken primitiv funktion fås för ∫ x · e^x dx via partiell integration?',
          options: ['x · e^x + C', '(x − 1)e^x + C', '(x + 1)e^x + C', 'x² · e^x / 2 + C'],
          correctAnswer: '1',
          hintSv: 'Välj g(x) = x och f\'(x) = e^x.',
          stepBySolutionSv: 'x·e^x − ∫ 1·e^x dx = x·e^x − e^x + C = (x − 1)e^x + C.',
          relatedSectionSlug: 'integrationsmetoder',
        },
      ],
    }),
  ],
};
