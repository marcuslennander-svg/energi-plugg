import { buildChapter } from '../helpers';
import type { CourseSeed } from '../types';

const SVG_SECANT_TANGENT = `<svg viewBox="0 0 340 150" width="100%" aria-label="Sekant som närmar sig tangenten när h går mot noll">
  <line x1="25" y1="125" x2="315" y2="125" stroke="currentColor" stroke-width="1.5" />
  <line x1="45" y1="15" x2="45" y2="138" stroke="currentColor" stroke-width="1.5" />
  <path d="M 55 118 Q 165 112 285 24" fill="none" stroke="currentColor" stroke-width="1.5" />
  <line x1="95" y1="122" x2="290" y2="22" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" />
  <line x1="78" y1="124" x2="250" y2="60" stroke="var(--accent)" stroke-width="1.5" />
  <circle cx="155" cy="95" r="3.5" fill="var(--accent)" />
  <circle cx="245" cy="45" r="3.5" fill="currentColor" />
  <text x="148" y="140" font-size="11" fill="currentColor">a</text>
  <text x="238" y="140" font-size="11" fill="currentColor">a + h</text>
  <text x="252" y="42" font-size="11" fill="currentColor">Sekant</text>
  <text x="198" y="88" font-size="11" fill="var(--accent)">Tangent</text>
</svg>`;

const SVG_UNIT_CIRCLE = `<svg viewBox="0 0 260 170" width="100%" aria-label="Enhetscirkeln med vinkeln v, cos v och sin v">
  <line x1="30" y1="85" x2="230" y2="85" stroke="currentColor" stroke-width="1.5" />
  <line x1="130" y1="12" x2="130" y2="158" stroke="currentColor" stroke-width="1.5" />
  <circle cx="130" cy="85" r="56" fill="none" stroke="currentColor" stroke-width="1.5" />
  <line x1="130" y1="85" x2="170" y2="45" stroke="var(--accent)" stroke-width="1.5" />
  <line x1="170" y1="45" x2="170" y2="85" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 3" />
  <circle cx="170" cy="45" r="3.5" fill="var(--accent)" />
  <text x="176" y="42" font-size="11" fill="var(--accent)">(cos v, sin v)</text>
  <text x="147" y="79" font-size="11" fill="currentColor">v</text>
</svg>`;

export const matte3bCourse: CourseSeed = {
  id: 'course-matte-3b',
  subjectId: 'subj-matematik',
  slug: 'matte-3b',
  codeGy25: 'MATO1B00X',
  nameSv: 'Matematik 3b',
  levelLabelSv: 'Fortsättning nivå 1b',
  centralContentSummarySv:
    'Polynom, rationella uttryck, gränsvärden, derivata och deriveringsregler, extremvärdesproblem och optimering samt primitiva funktioner och integraler.',
  sortOrder: 7,
  chapters: [
    buildChapter('course-matte-3b', {
      slug: 'polynom-rationella-uttryck-och-gransvarden',
      chapterNumber: 1,
      titleSv: 'Polynom, rationella uttryck och gränsvärden',
      summarySv:
        'Polynoms gradtal och faktorisering, förenkling av rationella uttryck samt ändringskvoter och gränsvärden.',
      isFree: true,
      estimatedMinutes: 45,
      lessons: [
        {
          sectionSlug: 'polynom-och-faktorisering',
          titleSv: 'Polynom, gradtal och faktorisering',
          overviewConcepts: [
            { term: 'Polynom', definition: 'Summa av termer på formen a · x^n där exponenterna n är icke-negativa heltal.' },
            { term: 'Gradtal', definition: 'Den högsta exponenten för variabeln x som har koefficient skild från noll.' },
          ],
          theoryBlocks: [
            {
              heading: 'Känna igen polynom och faktorisera',
              bodySv:
                'Ett uttryck som p(x) = 3x − 7x⁴ + 2x² + 9 är ett polynom av grad 4 eftersom 4 är den högsta exponenten. Uttryck med negativa exponenter (som x⁻¹ = 1/x) eller √x är inte polynom. Genom att bryta ut största gemensamma faktor eller använda kvadrerings- och konjugatreglerna kan högregradspolynom skrivas som produkter av enklare faktorer.',
              deepDiveSv:
                'Om x = a är ett nollställe till polynomet p(x) är (x − a) alltid en faktor i p(x).',
            },
          ],
          formulas: [
            {
              nameSv: 'Allmän polynomform',
              latex: 'p(x) = a_n x^n + a_{n-1} x^{n-1} + \\dots + a_1 x + a_0',
              explanationSv: 'Polynom av grad n där ledande koefficient a_n ≠ 0 och n ∈ ℕ.',
              variables: [
                { symbol: 'n', meaningSv: 'Polynomets gradtal', unit: 'Heltal ≥ 0' },
                { symbol: 'a_n', meaningSv: 'Ledande koefficient', unit: 'Reellt tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Avgöra polynomets gradtal',
              givenSv: 'p(x) = 5x + 2x³ − 8',
              findSv: 'Gradtalet och konstanttermen',
              methodSv: 'Leta upp den största exponenten oavsett termordning.',
              stepsSv: ['Största exponenten är 3 (i 2x³) och konstanttermen är −8.'],
              answerSv: 'Polynomet har grad 3 och konstantterm −8.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Faktorisera tredjegradspolynom fullständigt',
              givenSv: 'p(x) = x³ − 16x',
              findSv: 'Fullständig faktorisering och nollställen',
              methodSv: 'Bryt ut x först och använd sedan konjugatregeln.',
              stepsSv: [
                'p(x) = x(x² − 16) = x(x − 4)(x + 4).',
                'Nollställen: x = 0, x = 4 och x = −4.',
              ],
              answerSv: 'x(x − 4)(x + 4) med nollställena −4, 0 och 4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Konstruera polynom från nollställen',
              givenSv: 'Ett tredjegradspolynom har nollställena −2, 1 och 3 samt p(0) = 12.',
              findSv: 'Polynomets uttryck',
              methodSv: 'Skriv p(x) = k(x + 2)(x − 1)(x − 3) och lös ut k.',
              stepsSv: [
                'p(0) = k(2)(−1)(−3) = 6k = 12 ger k = 2.',
                'p(x) = 2(x + 2)(x − 1)(x − 3).',
              ],
              answerSv: 'p(x) = 2(x + 2)(x − 1)(x − 3).',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Ta första termens exponent som gradtal utan sortering',
              wrongApproachSv: 'Att säga att 5 + 3x − 2x⁴ har grad 0 eller 1.',
              rightApproachSv: 'Leta alltid efter den högsta exponenten i hela uttrycket (här 4).',
            },
          ],
        },
        {
          sectionSlug: 'rationella-uttryck',
          titleSv: 'Rationella uttryck och förkortning',
          overviewConcepts: [
            { term: 'Rationellt uttryck', definition: 'Kvot P(x) / Q(x) mellan två polynom där Q(x) ≠ 0.' },
            { term: 'Definitionsmängd', definition: 'Alla reella tal utom de x-värden som gör nämnaren lika med noll.' },
          ],
          theoryBlocks: [
            {
              heading: 'Faktorisera före förkortning',
              bodySv:
                'Division med noll är förbjuden i matematiken. Därför måste man alltid ta reda på för vilka x nämnaren i ett rationellt uttryck blir 0 innan man förkortar. Förkortning får bara göras med hela faktorer — aldrig med enskilda termer som adderas eller subtraheras.',
              deepDiveSv:
                'Exempel: (x² − 9) / (x − 3) kan skrivas ((x − 3)(x + 3)) / (x − 3) = x + 3 under förutsättningen att x ≠ 3.',
            },
          ],
          formulas: [
            {
              nameSv: 'Förenkling av faktor',
              latex: '\\frac{A \\cdot C}{B \\cdot C} = \\frac{A}{B} \\quad (B \\neq 0,\\ C \\neq 0)',
              explanationSv: 'Endast gemensamma faktorer får förkortas bort.',
              variables: [
                { symbol: 'A, B, C', meaningSv: 'Polynomuttryck', unit: 'Algebraisk form' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Hitta förbjudna x-värden',
              givenSv: '(x + 4) / (x − 6)',
              findSv: 'För vilket x uttrycket ej är definierat',
              methodSv: 'Sätt nämnaren lika med noll.',
              stepsSv: ['x − 6 = 0 ger x = 6.'],
              answerSv: 'Uttrycket är ej definierat för x = 6.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Förenkla kvot av polynom',
              givenSv: '(x² − 9) / (x − 3) där x ≠ 3',
              findSv: 'Förenklat uttryck',
              methodSv: 'Faktorisera täljaren med konjugatregeln.',
              stepsSv: ['((x − 3)(x + 3)) / (x − 3) = x + 3.'],
              answerSv: 'x + 3 (för x ≠ 3).',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Hela definitionsmängden ur andragradsnämnare',
              givenSv: '(x + 1) / (x² − 5x + 6)',
              findSv: 'För vilka x uttrycket saknar värde',
              methodSv: 'Lös x² − 5x + 6 = 0 med pq-formeln.',
              stepsSv: ['x = 2,5 ± √(6,25 − 6) = 2,5 ± 0,5 ger x = 2 och x = 3.'],
              answerSv: 'Ej definierat för x = 2 och x = 3.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Stryka termer i stället för faktorer',
              wrongApproachSv: 'Att förkorta bort x i (x + 4) / (x − 6) till 4 / (−6).',
              rightApproachSv: 'Man får bara stryka faktorer som multipliceras med hela täljaren och hela nämnaren.',
            },
          ],
        },
        {
          sectionSlug: 'andringskvoter-och-gransvarden',
          titleSv: 'Ändringskvoter och gränsvärden',
          overviewConcepts: [
            { term: 'Genomsnittlig ändringshastighet', definition: 'Lutningen hos sekanten mellan två punkter: (f(b) − f(a)) / (b − a).' },
            { term: 'Gränsvärde (lim)', definition: 'Det värde ett uttryck närmar sig då x eller h går mot ett bestämt tal.' },
          ],
          theoryBlocks: [
            {
              heading: 'Från sekantlutning till gränsvärde',
              bodySv:
                'En funktions genomsnittliga ändringshastighet mellan x = a och x = b beräknas exakt som lutningen hos en rät linje: Δy / Δx. När punktavståndet h går mot noll i uttrycket (f(a + h) − f(a)) / h närmar vi oss den momentana förändringshastigheten i en enda punkt — grunden för hela differentialkalkylen.',
              deepDiveSv:
                'Om insättning i ett bråk ger 0/0 (obestämt uttryck) faktoriserar och förkortar man först bort den faktor som orsakar noll i nämnaren innan gränsvärdet tas.',
            },
          ],
          formulas: [
            {
              nameSv: 'Ändringskvot (differenskvot)',
              latex: '\\frac{\\Delta y}{\\Delta x} = \\frac{f(a + h) - f(a)}{h}',
              explanationSv: 'Anger medellutningen över intervallet [a, a + h].',
              variables: [
                { symbol: 'a', meaningSv: 'Startpunkt', unit: 'Tal' },
                { symbol: 'h', meaningSv: 'Steglängd', unit: 'Tal ≠ 0' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Genomsnittlig ändringshastighet',
              givenSv: 'f(x) = x² i intervallet 1 ≤ x ≤ 5',
              findSv: 'Genomsnittliga ändringshastigheten',
              methodSv: 'Beräkna (f(5) − f(1)) / (5 − 1).',
              stepsSv: ['(25 − 1) / 4 = 24 / 4 = 6.'],
              answerSv: 'Ändringshastigheten är 6.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Gränsvärde via förkortning',
              givenSv: 'lim(x → 2) (x² − 4) / (x − 2)',
              findSv: 'Gränsvärdet',
              methodSv: 'Direkt insättning ger 0/0. Faktorisera täljaren först.',
              stepsSv: ['((x − 2)(x + 2)) / (x − 2) = x + 2 → 2 + 2 = 4 när x → 2.'],
              answerSv: 'Gränsvärdet är 4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Gränsvärde av differenskvot',
              givenSv: 'f(x) = 2x² − 1',
              findSv: 'lim(h → 0) (f(3 + h) − f(3)) / h',
              methodSv: 'Utveckla f(3 + h), förenkla täljaren, bryt ut h och förkorta.',
              stepsSv: [
                'f(3 + h) = 2(9 + 6h + h²) − 1 = 17 + 12h + 2h², och f(3) = 17.',
                '(17 + 12h + 2h² − 17) / h = (12h + 2h²) / h = 12 + 2h.',
                'Då h → 0 går 12 + 2h mot 12.',
              ],
              answerSv: 'Gränsvärdet är 12.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Avbryta med "saknar värde" när insättning ger 0/0',
              wrongApproachSv: 'Att svara att lim(x → 2) (x² − 4)/(x − 2) inte existerar.',
              rightApproachSv: '0/0 betyder att täljare och nämnare delar en nollfaktor som kan förkortas bort innan gränsen tas.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Polynom',
          promptSv: 'Vad är gradtalet för polynomet p(x) = 3x − 7x⁴ + 2x² + 9?',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: 'Sök den högsta exponenten för x.',
          stepBySolutionSv: 'Termen −7x⁴ har högst exponent, så gradtalet är 4.',
          relatedSectionSlug: 'polynom-och-faktorisering',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Rationella uttryck',
          promptSv: 'För vilket värde på x är det rationella uttrycket (x + 4) / (x − 6) inte definierat?',
          correctAnswer: '6',
          numericTolerance: 0.01,
          hintSv: 'Nämnaren får inte bli noll.',
          stepBySolutionSv: 'x − 6 = 0 ger x = 6.',
          relatedSectionSlug: 'rationella-uttryck',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Ändringskvot',
          promptSv: 'Beräkna den genomsnittliga ändringshastigheten för f(x) = x² i intervallet 1 ≤ x ≤ 5.',
          correctAnswer: '6',
          numericTolerance: 0.01,
          hintSv: 'Beräkna (f(5) − f(1)) / (5 − 1).',
          stepBySolutionSv: '(25 − 1) / (5 − 1) = 24 / 4 = 6.',
          relatedSectionSlug: 'andringskvoter-och-gransvarden',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Rationella uttryck',
          promptSv: 'Förenkla uttrycket (x² − 9) / (x − 3) så långt som möjligt för x ≠ 3.',
          options: ['x − 3', 'x + 3', 'x² + 3', '3'],
          correctAnswer: '1',
          hintSv: 'Faktorisera x² − 9 med konjugatregeln.',
          stepBySolutionSv: '((x − 3)(x + 3)) / (x − 3) = x + 3.',
          relatedSectionSlug: 'rationella-uttryck',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Gränsvärden',
          promptSv: 'Beräkna gränsvärdet lim(x → 2) (x² − 4) / (x − 2).',
          latexFormula: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: 'Faktorisera täljaren och förkorta bort (x − 2) innan du sätter in x = 2.',
          stepBySolutionSv: '((x − 2)(x + 2)) / (x − 2) = x + 2, som går mot 2 + 2 = 4.',
          relatedSectionSlug: 'andringskvoter-och-gransvarden',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Gränsvärden',
          promptSv: 'Givet f(x) = 2x² − 1. Beräkna gränsvärdet av ändringskvoten lim(h → 0) (f(3 + h) − f(3)) / h.',
          latexFormula: '\\lim_{h \\to 0} \\frac{f(3 + h) - f(3)}{h}',
          correctAnswer: '12',
          numericTolerance: 0.01,
          hintSv: 'Utveckla f(3 + h) = 2(3 + h)² − 1, förenkla och förkorta med h.',
          stepBySolutionSv: '(17 + 12h + 2h² − 17) / h = 12 + 2h → 12 då h → 0.',
          relatedSectionSlug: 'andringskvoter-och-gransvarden',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Rationella uttryck',
          promptSv: 'För vilka värden på x är uttrycket (x + 1) / (x² − 5x + 6) inte definierat?',
          options: ['x = −1', 'x = 2 och x = 3', 'x = −2 och x = −3', 'x = 0 och x = 6'],
          correctAnswer: '1',
          hintSv: 'Lös x² − 5x + 6 = 0.',
          stepBySolutionSv: 'Nämnaren faktoriseras till (x − 2)(x − 3), så uttrycket saknar värde för x = 2 och x = 3.',
          relatedSectionSlug: 'rationella-uttryck',
        },
      ],
    }),
    buildChapter('course-matte-3b', {
      slug: 'derivata-och-deriveringsregler',
      chapterNumber: 2,
      titleSv: 'Derivata och deriveringsregler',
      summarySv: 'Deriveringsregler för potensfunktioner, summor, exponentialfunktioner och talet e.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'deriveringsregler',
          titleSv: 'Deriveringsregler och talet e',
          overviewConcepts: [
            { term: 'Derivata f\'(x)', definition: 'Funktionens momentana ändringshastighet och tangentens lutning i punkten x.' },
            { term: 'Talet e', definition: 'Eulers tal (e ≈ 2,718) där derivatan av e^x är e^x själv.' },
          ],
          theoryBlocks: [
            {
              heading: 'Potensregeln och kedjan med konstant faktor',
              bodySv:
                'För varje polynomterm a · x^n gäller deriveringsregeln f\'(x) = a · n · x^(n − 1). En ensam konstant har alltid derivatan 0 eftersom en horisontell linje har lutningen 0. För exponentialfunktioner med basen e gäller att derivatan av e^(kx) är k · e^(kx).',
              deepDiveSv:
                'För allmän bas a^x gäller derivatan a^x · ln a, där ln står för den naturliga logaritmen med basen e.',
            },
          ],
          formulas: [
            {
              nameSv: 'Deriveringsregler för potenser och e^kx',
              latex: 'D(x^n) = n x^{n-1}, \\quad D(e^{kx}) = k e^{kx}',
              explanationSv: 'Används termvis över summor och differenser.',
              variables: [
                { symbol: 'n, k', meaningSv: 'Konstanter', unit: 'Reella tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Derivera ett polynom',
              givenSv: 'f(x) = 3x² − 4x + 7',
              findSv: 'f\'(2)',
              methodSv: 'Derivera term för term och sätt in x = 2.',
              stepsSv: ['f\'(x) = 6x − 4.', 'f\'(2) = 6 · 2 − 4 = 8.'],
              answerSv: 'f\'(2) = 8.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Omskrivning av rot och bråk före derivering',
              givenSv: 'f(x) = 4/x + 2√x',
              findSv: 'f\'(x)',
              methodSv: 'Skriv om med negativa och bråktalsexponenter: 4x⁻¹ + 2x^(0,5).',
              stepsSv: ['f\'(x) = −4x⁻² + 2 · 0,5 · x^(−0,5) = −4/x² + 1/√x.'],
              answerSv: 'f\'(x) = −4/x² + 1/√x.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Tangentens ekvation i given punkt',
              givenSv: 'f(x) = x³ − 2x i punkten där x = 2',
              findSv: 'Tangentens ekvation y = kx + m',
              methodSv: 'Beräkna f(2) för punkten och f\'(2) för lutningen k.',
              stepsSv: [
                'f(2) = 8 − 4 = 4, så tangeringspunkten är (2, 4).',
                'f\'(x) = 3x² − 2 ger k = f\'(2) = 10.',
                '4 = 10 · 2 + m ger m = −16.',
              ],
              answerSv: 'y = 10x − 16.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma att konstanten får derivatan 0',
              wrongApproachSv: 'Att behålla +7 vid derivering av 3x² − 4x + 7.',
              rightApproachSv: 'Konstanter ändras inte med x, så D(7) = 0.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Derivata',
          promptSv: 'Givet f(x) = 3x² − 4x + 7. Beräkna f\'(2).',
          correctAnswer: '8',
          numericTolerance: 0.01,
          hintSv: 'Bestäm f\'(x) först.',
          stepBySolutionSv: 'f\'(x) = 6x − 4 ger f\'(2) = 12 − 4 = 8.',
          relatedSectionSlug: 'deriveringsregler',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Derivata',
          promptSv: 'Vad är derivatan f\'(x) av funktionen f(x) = 5e^(2x)?',
          options: ['5e^(2x)', '10e^(2x)', '2e^(2x)', '10x e^(2x)'],
          correctAnswer: '1',
          hintSv: 'Använd regeln D(e^(kx)) = k · e^(kx).',
          stepBySolutionSv: 'f\'(x) = 5 · 2 · e^(2x) = 10e^(2x).',
          relatedSectionSlug: 'deriveringsregler',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Derivata',
          promptSv: 'För vilket positivt värde på x har f(x) = x³ − 12x derivatan 0?',
          correctAnswer: '2',
          numericTolerance: 0.01,
          hintSv: 'Lös 3x² − 12 = 0.',
          stepBySolutionSv: '3x² = 12 ger x² = 4 och x = 2 (för x > 0).',
          relatedSectionSlug: 'deriveringsregler',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Tangent',
          promptSv: 'Tangenten till f(x) = x² + 3x i punkten där x = 1 skrivs på formen y = kx + m. Vad blir m-värdet?',
          correctAnswer: '-1',
          numericTolerance: 0.01,
          hintSv: 'Hitta f(1) och k = f\'(1), och sätt in i y = kx + m.',
          stepBySolutionSv: 'f(1) = 4, f\'(x) = 2x + 3 ger k = 5. 4 = 5 · 1 + m ger m = −1.',
          relatedSectionSlug: 'deriveringsregler',
        },
      ],
    }),
    buildChapter('course-matte-3b', {
      slug: 'extremvarden-och-integraler',
      chapterNumber: 3,
      titleSv: 'Extremvärden, optimering och integraler',
      summarySv: 'Teckentabell, andraderivatan, optimeringsproblem samt primitiva funktioner och bestämda integraler.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'extremvarden-och-integraler',
          titleSv: 'Extrempunkter och bestämda integraler',
          overviewConcepts: [
            { term: 'Stationär punkt', definition: 'Punkt där f\'(x) = 0 (horisontell tangent).' },
            { term: 'Bestämd integral', definition: 'Area med tecken under grafen beräknad med F(b) − F(a).' },
          ],
          theoryBlocks: [
            {
              heading: 'Klassificera extrempunkter och beräkna integraler',
              bodySv:
                'Där f\'(x) = 0 kan kurvan ha en maximipunkt, minimipunkt eller terrasspunkt. Med teckentabell för f\'(x) eller andraderivatan f\'\'(x) avgör man karaktären (f\'\'(a) < 0 ger lokalt maximum, f\'\'(a) > 0 ger lokalt minimum). För primitiva funktioner gäller F\'(x) = f(x).',
              deepDiveSv:
                'Integralkalkylens fundamentalsats säger att ∫[a till b] f(x) dx = F(b) − F(a), där F är en primitiv funktion till f.',
            },
          ],
          formulas: [
            {
              nameSv: 'Integralkalkylens fundamentalsats',
              latex: '\\int_a^b f(x)\\,dx = \\left[F(x)\\right]_a^b = F(b) - F(a)',
              explanationSv: 'Sambandet mellan bestämd integral och primitiv funktion F.',
              variables: [
                { symbol: 'a, b', meaningSv: 'Integrationsgränser', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Bestämd integral av x²',
              givenSv: '∫[0 till 2] 3x² dx',
              findSv: 'Integralens värde',
              methodSv: 'En primitiv funktion till 3x² är x³.',
              stepsSv: ['[x³]₀² = 2³ − 0³ = 8.'],
              answerSv: '8.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Bestämma extrempunkter till tredjegradsfunktion',
              givenSv: 'f(x) = x³ − 3x',
              findSv: 'Lokalt maximum och minimum',
              methodSv: 'Lös f\'(x) = 0 och använd f\'\'(x) = 6x.',
              stepsSv: [
                'f\'(x) = 3x² − 3 = 0 ger x = ±1.',
                'f\'\'(−1) = −6 < 0 ger max i (−1, 2); f\'\'(1) = 6 > 0 ger min i (1, −2).',
              ],
              answerSv: 'Lokalt max (−1, 2) och lokalt min (1, −2).',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Största värde på slutet intervall',
              givenSv: 'f(x) = x³ − 3x på intervallet [0, 3]',
              findSv: 'Globala max- och minvärdet',
              methodSv: 'Jämför stationära punkter i intervallet med ändpunkterna x = 0 och x = 3.',
              stepsSv: [
                'f(0) = 0, f(1) = −2, f(3) = 27 − 9 = 18.',
              ],
              answerSv: 'Största värdet är 18 (vid x = 3) och minsta är −2 (vid x = 1).',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma pröva ändpunkterna vid max/min på slutet intervall',
              wrongApproachSv: 'Att bara titta på f\'(x) = 0.',
              rightApproachSv: 'Det största eller minsta värdet i ett begränsat intervall kan ligga i ändpunkterna.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Integraler',
          promptSv: 'Beräkna den bestämda integralen ∫[0 till 2] 3x² dx.',
          latexFormula: '\\int_0^2 3x^2\\,dx',
          correctAnswer: '8',
          numericTolerance: 0.01,
          hintSv: 'Primitiv funktion till 3x² är x³.',
          stepBySolutionSv: '2³ − 0³ = 8.',
          relatedSectionSlug: 'extremvarden-och-integraler',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Extremvärden',
          promptSv: 'För en funktion gäller att f\'(4) = 0 och f\'\'(4) = −6. Vad har kurvan vid x = 4?',
          options: ['En minimipunkt', 'En maximipunkt', 'En terrasspunkt', 'Ett nollställe'],
          correctAnswer: '1',
          hintSv: 'Negativ andraderivata betyder att grafen är konkav nedåt.',
          stepBySolutionSv: 'f\'(4) = 0 och f\'\'(4) < 0 ger en lokal maximipunkt.',
          relatedSectionSlug: 'extremvarden-och-integraler',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Integraler',
          promptSv: 'Beräkna ∫[1 till 3] (2x + 1) dx.',
          latexFormula: '\\int_1^3 (2x + 1)\\,dx',
          correctAnswer: '10',
          numericTolerance: 0.05,
          hintSv: 'Primitiv funktion är x² + x.',
          stepBySolutionSv: '(3² + 3) − (1² + 1) = 12 − 2 = 10.',
          relatedSectionSlug: 'extremvarden-och-integraler',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Optimering',
          promptSv: 'Vad är det största värdet som f(x) = x³ − 3x antar på det slutna intervallet 0 ≤ x ≤ 3?',
          correctAnswer: '18',
          numericTolerance: 0.1,
          hintSv: 'Testa ändpunkterna x = 0 och x = 3 samt eventuella extrempunkter i intervallet.',
          stepBySolutionSv: 'f(0) = 0, f(1) = −2 och f(3) = 27 − 9 = 18. Största värdet är 18.',
          relatedSectionSlug: 'extremvarden-och-integraler',
        },
      ],
    }),
  ],
};

export const matte3cCourse: CourseSeed = {
  id: 'course-matte-3c',
  subjectId: 'subj-matematik',
  slug: 'matte-3c',
  codeGy25: 'MATO1C00X',
  nameSv: 'Matematik 3c',
  levelLabelSv: 'Fortsättning nivå 1c',
  centralContentSummarySv:
    'Polynom, rationella uttryck, absolutbelopp, gränsvärden, derivatans definition och regler, integraler samt enhetscirkeln, areasatsen, sinussatsen och cosinussatsen.',
  sortOrder: 8,
  chapters: [
    buildChapter('course-matte-3c', {
      slug: 'polynom-rationella-uttryck-och-gransvarden',
      chapterNumber: 1,
      titleSv: 'Polynom, absolutbelopp, gränsvärden och derivatans grund',
      summarySv:
        'Rationella uttryck, absolutbeloppsekvationer, gränsvärden mot ändliga tal och oändligheten samt derivatans definition.',
      isFree: true,
      estimatedMinutes: 50,
      lessons: [
        {
          sectionSlug: 'polynom-och-rationella-uttryck',
          titleSv: 'Polynom och rationella uttryck',
          overviewConcepts: [
            { term: 'Faktorisering', definition: 'Att skriva ett polynom som en produkt av faktorer med lägre gradtal.' },
            { term: 'Rationell ekvation', definition: 'Ekvation där obekanta förekommer i nämnaren och potentiella falska rötter måste kontrolleras.' },
          ],
          theoryBlocks: [
            {
              heading: 'Faktorisering och förkortning av högregradspolynom',
              bodySv:
                'Genom att kombinera utbrytning av gemensamma faktorer med konjugatregeln och kvadreringsreglerna kan även tredjegradspolynom förenklas snabbt. När du arbetar med rationella uttryck måste du alltid hålla reda på definitionsmängden innan faktorer förkortas bort.',
              deepDiveSv:
                'Om ett rationellt uttryck ska vara lika med noll krävs att täljaren är noll medan nämnaren samtidigt är skild från noll.',
            },
          ],
          formulas: [
            {
              nameSv: 'Nollställe till rationellt uttryck',
              latex: '\\frac{P(x)}{Q(x)} = 0 \\iff P(x) = 0 \\text{ och } Q(x) \\neq 0',
              explanationSv: 'En kvot blir noll när täljaren är noll och nämnaren ej är noll.',
              variables: [
                { symbol: 'P(x)', meaningSv: 'Täljarpolynom', unit: 'Polynom' },
                { symbol: 'Q(x)', meaningSv: 'Nämnarpolynom', unit: 'Polynom' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Definitionsmängd för rationellt uttryck',
              givenSv: '(2x + 1) / (3x − 15)',
              findSv: 'Förbjudet värde på x',
              methodSv: 'Sätt nämnaren lika med noll.',
              stepsSv: ['3x − 15 = 0 ger x = 5.'],
              answerSv: 'x ≠ 5.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Förenkla tredjegradskvot',
              givenSv: '(x³ − 4x) / (x² − 2x) för x ≠ 0 och x ≠ 2',
              findSv: 'Förenklat uttryck',
              methodSv: 'Faktorisera både täljare och nämnare fullständigt.',
              stepsSv: [
                'Täljare: x(x² − 4) = x(x − 2)(x + 2).',
                'Nämnare: x(x − 2).',
                'Förkorta x(x − 2): kvar blir x + 2.',
              ],
              answerSv: 'x + 2 (för x ≠ 0, x ≠ 2).',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Lösa rationell ekvation utan falska rötter',
              givenSv: '(x² − 9) / (x − 3) = 5',
              findSv: 'Eventuella lösningar',
              methodSv: 'Kontrollera x ≠ 3, förenkla vänsterledet och lös.',
              stepsSv: ['x + 3 = 5 ger x = 2 (vilket uppfyller x ≠ 3).'],
              answerSv: 'x = 2.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma att nollställen i nämnaren aldrig kan vara rötter',
              wrongApproachSv: 'Att godta x = 3 om x² − 9 = 0 löstes i en ekvation med (x − 3) i nämnaren.',
              rightApproachSv: 'Pröva alltid i nämnaren så att ingen lösning ger division med noll.',
            },
          ],
        },
        {
          sectionSlug: 'absolutbelopp-och-gransvarden',
          titleSv: 'Absolutbelopp och gränsvärden',
          overviewConcepts: [
            { term: 'Absolutbelopp (|x|)', definition: 'Talets avstånd till 0 på tallinjen, alltid ≥ 0.' },
            { term: 'Gränsvärde mot oändligheten', definition: 'Beteendet hos ett uttryck när x → ∞.' },
          ],
          theoryBlocks: [
            {
              heading: 'Absolutbelopp och oändlighetsgränser',
              bodySv:
                'Absolutbeloppet |a| är a om a ≥ 0 och −a om a < 0. Ekvationen |ax + b| = c (med c ≥ 0) har därför två fall: ax + b = c eller ax + b = −c. Vid gränsvärden där x → ∞ för en rationell funktion divideras varje term i täljare och nämnare med den högsta x-potensen i nämnaren.',
              deepDiveSv:
                'När x → ∞ går termer som 5/x och 3/x² mot 0, så kvoten mellan två andragradspolynom bestäms helt av kvoten mellan deras ledande koefficienter.',
            },
          ],
          formulas: [
            {
              nameSv: 'Absolutbeloppets definition',
              latex: '|a| = \\begin{cases} a, & a \\ge 0 \\\\ -a, & a < 0 \\end{cases}',
              explanationSv: 'Anger det icke-negativa avståndet till origo.',
              variables: [
                { symbol: 'a', meaningSv: 'Reellt tal', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Beräkna uttryck med absolutbelopp',
              givenSv: '|3 − 10| + |−4|',
              findSv: 'Värdet',
              methodSv: 'Beräkna inuti varje beloppstecken först.',
              stepsSv: ['|−7| + |−4| = 7 + 4 = 11.'],
              answerSv: '11.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Absolutbeloppsekvation',
              givenSv: '|2x − 4| = 10',
              findSv: 'Alla lösningar',
              methodSv: 'Dela upp i fallen 2x − 4 = 10 och 2x − 4 = −10.',
              stepsSv: [
                'Fall 1: 2x − 4 = 10 ger 2x = 14 och x = 7.',
                'Fall 2: 2x − 4 = −10 ger 2x = −6 och x = −3.',
              ],
              answerSv: 'x₁ = 7 och x₂ = −3.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Gränsvärde när x går mot oändligheten',
              givenSv: 'lim(x → ∞) (6x² + 5x) / (2x² − 3)',
              findSv: 'Gränsvärdet',
              methodSv: 'Förkorta med den högsta potensen x².',
              stepsSv: [
                'Dividera varje term med x²: (6 + 5/x) / (2 − 3/x²).',
                'Då x → ∞ går 5/x → 0 och 3/x² → 0, vilket ger 6 / 2 = 3.',
              ],
              answerSv: 'Gränsvärdet är 3.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Byta tecken på alla minustecken inuti absolutbelopp',
              wrongApproachSv: 'Att skriva |3 − 10| = 3 + 10 = 13.',
              rightApproachSv: 'Räkna först ut värdet inuti beloppet (3 − 10 = −7) och gör sedan resultatet positivt (7).',
            },
          ],
        },
        {
          sectionSlug: 'andringskvoter-och-derivatans-definition',
          titleSv: 'Sekanter, tangenter och derivatans definition',
          overviewConcepts: [
            { term: 'Sekant', definition: 'Rät linje som skär en kurva i två punkter (a, f(a)) och (a + h, f(a + h)).' },
            { term: 'Tangent', definition: 'Gränsläget för sekanten när h → 0, som anger lutningen i en punkt.' },
          ],
          theoryBlocks: [
            {
              heading: 'Derivatans definition',
              bodySv:
                'Derivatan i punkten x definieras som gränsvärdet av ändringskvoten när intervallängden h går mot noll: f\'(x) = lim(h → 0) (f(x + h) − f(x)) / h. Geometriskt motsvarar f\'(a) riktningskoefficienten för tangenten till kurvan i punkten (a, f(a)).',
              deepDiveSv:
                'Med hjälp av derivatans definition går det att härleda samtliga deriveringsregler, exempelvis varför derivatan av x² alltid blir 2x.',
              svgDiagram: SVG_SECANT_TANGENT,
            },
          ],
          formulas: [
            {
              nameSv: 'Derivatans definition',
              latex: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}',
              explanationSv: 'Definierar derivatan som sekantlutningens gränsvärde då h → 0.',
              variables: [
                { symbol: 'f\'(x)', meaningSv: 'Derivata', unit: 'Lutning' },
                { symbol: 'h', meaningSv: 'Steg i x-led', unit: 'Går mot 0' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Sekantlutning för kubisk funktion',
              givenSv: 'f(x) = x³ i intervallet [1, 3]',
              findSv: 'Sekantens lutning',
              methodSv: 'Beräkna (f(3) − f(1)) / (3 − 1).',
              stepsSv: ['(27 − 1) / 2 = 26 / 2 = 13.'],
              answerSv: 'Sekantens lutning är 13.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Ställa upp differenskvot för f(x) = x² + 3x',
              givenSv: 'f(x) = x² + 3x vid x = 2',
              findSv: 'Förenklad differenskvot före gränsvärde',
              methodSv: 'Beräkna f(2 + h) − f(2) och dela med h.',
              stepsSv: [
                'f(2) = 4 + 6 = 10.',
                'f(2 + h) = (2 + h)² + 3(2 + h) = 4 + 4h + h² + 6 + 3h = 10 + 7h + h².',
                '(10 + 7h + h² − 10) / h = 7 + h.',
              ],
              answerSv: 'Differenskvoten är 7 + h.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Slutföra gränsvärdet till f\'(2)',
              givenSv: 'Differenskvoten 7 + h för f(x) = x² + 3x',
              findSv: 'f\'(2)',
              methodSv: 'Låt h → 0.',
              stepsSv: ['lim(h → 0) (7 + h) = 7.'],
              answerSv: 'f\'(2) = 7.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma parentes runt f(x) vid subtraktionen −f(x)',
              wrongApproachSv: 'Att skriva f(x + h) − x² + 3x i stället för −(x² + 3x).',
              rightApproachSv: 'Subtrahera hela f(x) inom parentes så att samtliga konstanttermer utan h tar ut varandra.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Absolutbelopp',
          promptSv: 'Beräkna värdet av |3 − 10| + |−4|.',
          correctAnswer: '11',
          numericTolerance: 0.01,
          hintSv: 'Räkna ut varje absolutbelopp för sig: |−7| = 7.',
          stepBySolutionSv: '7 + 4 = 11.',
          relatedSectionSlug: 'absolutbelopp-och-gransvarden',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Rationella uttryck',
          promptSv: 'För vilket värde på x är uttrycket (2x + 1) / (3x − 15) inte definierat?',
          correctAnswer: '5',
          numericTolerance: 0.01,
          hintSv: 'Sätt nämnaren 3x − 15 = 0.',
          stepBySolutionSv: '3x = 15 ger x = 5.',
          relatedSectionSlug: 'polynom-och-rationella-uttryck',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Ändringskvot',
          promptSv: 'Beräkna den genomsnittliga ändringshastigheten för f(x) = x³ på intervallet 1 ≤ x ≤ 3.',
          correctAnswer: '13',
          numericTolerance: 0.01,
          hintSv: '(f(3) − f(1)) / (3 − 1).',
          stepBySolutionSv: '(27 − 1) / 2 = 26 / 2 = 13.',
          relatedSectionSlug: 'andringskvoter-och-derivatans-definition',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Absolutbelopp',
          promptSv: 'Vilka lösningar har ekvationen |2x − 4| = 10?',
          options: ['Endast x = 7', 'x = 7 och x = −3', 'x = −7 och x = 3', 'x = 5 och x = −5'],
          correctAnswer: '1',
          hintSv: 'Pröva både 2x − 4 = 10 och 2x − 4 = −10.',
          stepBySolutionSv: '2x = 14 ger x = 7, och 2x = −6 ger x = −3.',
          relatedSectionSlug: 'absolutbelopp-och-gransvarden',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Gränsvärden',
          promptSv: 'Beräkna gränsvärdet lim(x → ∞) (6x² + 5x) / (2x² − 3).',
          latexFormula: '\\lim_{x \\to \\infty} \\frac{6x^2 + 5x}{2x^2 - 3}',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Dividera täljare och nämnare med x².',
          stepBySolutionSv: '(6 + 5/x) / (2 − 3/x²) → 6 / 2 = 3 när x → ∞.',
          relatedSectionSlug: 'absolutbelopp-och-gransvarden',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Rationella uttryck',
          promptSv: 'Förenkla (x³ − 4x) / (x² − 2x) då x ≠ 0 och x ≠ 2.',
          options: ['x − 2', 'x + 2', 'x² + 2', '2x'],
          correctAnswer: '1',
          hintSv: 'Bryt ut x i både täljare och nämnare och använd konjugatregeln.',
          stepBySolutionSv: '(x(x − 2)(x + 2)) / (x(x − 2)) = x + 2.',
          relatedSectionSlug: 'polynom-och-rationella-uttryck',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Derivatans definition',
          promptSv: 'Använd derivatans definition på f(x) = x² + 3x för att beräkna f\'(2).',
          latexFormula: 'f\'(2) = \\lim_{h \\to 0} \\frac{f(2 + h) - f(2)}{h}',
          correctAnswer: '7',
          numericTolerance: 0.01,
          hintSv: 'Förenkla (f(2 + h) − f(2)) / h till 7 + h.',
          stepBySolutionSv: '((10 + 7h + h²) − 10) / h = 7 + h → 7 då h → 0.',
          relatedSectionSlug: 'andringskvoter-och-derivatans-definition',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Begrepp',
          promptSv: 'Vad beskriver uttrycket lim(h → 0) (f(a + h) − f(a)) / h geometriskt?',
          options: [
            'Arean under kurvan upp till x = a',
            'Riktningskoefficienten för tangenten till kurvan i punkten (a, f(a))',
            'Medelvärdet av f på intervallet [0, a]',
            'Skärningen med y-axeln',
          ],
          correctAnswer: '1',
          hintSv: 'När h går mot noll övergår sekanten till tangenten i punkten a.',
          stepBySolutionSv: 'Gränsvärdet ger tangentens lutning i punkten (a, f(a)).',
          relatedSectionSlug: 'andringskvoter-och-derivatans-definition',
        },
      ],
    }),
    buildChapter('course-matte-3c', {
      slug: 'deriveringsregler-och-kurvanalys',
      chapterNumber: 2,
      titleSv: 'Deriveringsregler, talet e och extremvärdesproblem',
      summarySv: 'Derivering av polynom, exponentialfunktioner och naturvetenskapliga extremvärdesmodeller.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'kurvanalys-och-talet-e',
          titleSv: 'Derivering och kurvanalys',
          overviewConcepts: [
            { term: 'Naturliga logaritmen (ln)', definition: 'Logaritmen med basen e: ln(e^x) = x.' },
          ],
          theoryBlocks: [
            {
              heading: 'Bestämma asymptoter och extremvärden',
              bodySv:
                'Genom att kombinera förstaderivatan (var kurvan vänder) med andraderivatan (konkavitet) får man en komplett bild av en funktions utseende. För a^x gäller derivatan a^x · ln a.',
              deepDiveSv:
                'Vid optimering i Matte 3c måste du alltid motivera med teckentabell eller andraderivatan att punkten verkligen är ett maximum eller minimum.',
            },
          ],
          formulas: [
            {
              nameSv: 'Derivata av allmän exponentialfunktion',
              latex: 'D(a^x) = a^x \\cdot \\ln a',
              explanationSv: 'Specialfallet a = e ger ln e = 1 och alltså D(e^x) = e^x.',
              variables: [
                { symbol: 'a', meaningSv: 'Positiv bas', unit: '> 0' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Derivata med e^x',
              givenSv: 'f(x) = 4e^(3x)',
              findSv: 'f\'(0)',
              methodSv: 'f\'(x) = 12e^(3x).',
              stepsSv: ['f\'(0) = 12 · e⁰ = 12.'],
              answerSv: 'f\'(0) = 12.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Lösning med naturlig logaritm',
              givenSv: 'e^(0,5x) = 7',
              findSv: 'Exakta lösningen x',
              methodSv: 'Tag ln på båda sidor.',
              stepsSv: ['0,5x = ln 7 ger x = 2 · ln 7.'],
              answerSv: 'x = 2 ln 7.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Maximal volym av öppen låda',
              givenSv: 'En kvadratisk plåt med sidan 12 cm får lika stora kvadrater med sidan x bortklippta i hörnen och viks till en öppen låda.',
              findSv: 'Det x som ger störst volym',
              methodSv: 'V(x) = x(12 − 2x)² på (0, 6). Derivera V(x) = 4x³ − 48x² + 144x.',
              stepsSv: ['V\'(x) = 12x² − 96x + 144 = 0 ger x² − 8x + 12 = 0, alltså x = 2 (x = 6 ger V = 0).'],
              answerSv: 'Maximal volym (128 cm³) fås då x = 2 cm.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma den inre faktorn k när e^(kx) deriveras',
              wrongApproachSv: 'Att skriva D(e^(3x)) = e^(3x).',
              rightApproachSv: 'Multiplicera alltid med exponentens koefficient: D(e^(3x)) = 3e^(3x).',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Derivata',
          promptSv: 'Givet f(x) = 4e^(3x). Vad är f\'(0)?',
          correctAnswer: '12',
          numericTolerance: 0.01,
          hintSv: 'f\'(x) = 12e^(3x) och e⁰ = 1.',
          stepBySolutionSv: 'f\'(0) = 12 · e⁰ = 12.',
          relatedSectionSlug: 'kurvanalys-och-talet-e',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Derivata',
          promptSv: 'Vad är derivatan av f(x) = 2^x?',
          options: ['x · 2^(x−1)', '2^x', '2^x · ln 2', 'ln 2'],
          correctAnswer: '2',
          hintSv: 'Använd regeln D(a^x) = a^x · ln a.',
          stepBySolutionSv: 'D(2^x) = 2^x · ln 2.',
          relatedSectionSlug: 'kurvanalys-och-talet-e',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Extremvärden',
          promptSv: 'Bestäm x-koordinaten för den lokala extrempunkten till f(x) = x² − 6x + 10.',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Sätt f\'(x) = 0.',
          stepBySolutionSv: '2x − 6 = 0 ger x = 3.',
          relatedSectionSlug: 'kurvanalys-och-talet-e',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Optimering',
          promptSv: 'En öppen låda viks ur en kvadratisk pappbit med sidan 12 cm genom att klippa bort kvadrater med sidan x cm i varje hörn. För vilket x (i cm) blir lådans volym som störst?',
          correctAnswer: '2',
          numericTolerance: 0.05,
          unitSv: 'cm',
          hintSv: 'Ställ upp V(x) = x(12 − 2x)² = 4x³ − 48x² + 144x och lös V\'(x) = 0 i intervallet 0 < x < 6.',
          stepBySolutionSv: 'V\'(x) = 12(x² − 8x + 12) = 0 ger x = 2 cm (x = 6 ligger på randen med volym 0).',
          relatedSectionSlug: 'kurvanalys-och-talet-e',
        },
      ],
    }),
    buildChapter('course-matte-3c', {
      slug: 'integraler-och-primitiva-funktioner',
      chapterNumber: 3,
      titleSv: 'Primitiva funktioner och bestämda integraler',
      summarySv: 'Antiderivator med konstant C, areaberäkning mellan kurvor och förändringshastighetens integral.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'area-mellan-kurvor',
          titleSv: 'Areaberäkning mellan två kurvor',
          overviewConcepts: [
            { term: 'Primitiv funktion', definition: 'F(x) kallas primitiv funktion till f(x) om F\'(x) = f(x).' },
          ],
          theoryBlocks: [
            {
              heading: 'Övre funktion minus undre funktion',
              bodySv:
                'Arean av ett område som uppåt begränsas av y = f(x) och nedåt av y = g(x) mellan skärningspunkterna a och b ges av ∫[a till b] (f(x) − g(x)) dx. Detta gäller oavsett om kurvorna ligger ovanför eller under x-axeln.',
              deepDiveSv:
                'När en funktion skär x-axeln mitt i ett intervall måste integralen delas upp om den geometriska arean (alltid positiv) efterfrågas.',
            },
          ],
          formulas: [
            {
              nameSv: 'Area mellan två grafer',
              latex: 'A = \\int_a^b \\left(f(x) - g(x)\\right)\\,dx',
              explanationSv: 'Där f(x) ≥ g(x) på hela intervallet [a, b].',
              variables: [
                { symbol: 'f(x)', meaningSv: 'Övre kurva', unit: 'Funktion' },
                { symbol: 'g(x)', meaningSv: 'Undre kurva', unit: 'Funktion' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Bestäm en primitiv funktion med villkor',
              givenSv: 'f(x) = 4x och F(1) = 5',
              findSv: 'F(x)',
              methodSv: 'F(x) = 2x² + C och använd F(1) = 5.',
              stepsSv: ['2(1)² + C = 5 ger C = 3, alltså F(x) = 2x² + 3.'],
              answerSv: 'F(x) = 2x² + 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Integral av exponentialfunktion',
              givenSv: '∫[0 till 1] 2e^(2x) dx',
              findSv: 'Exakt värde',
              methodSv: 'Primitiv funktion till 2e^(2x) är e^(2x).',
              stepsSv: ['[e^(2x)]₀¹ = e² − e⁰ = e² − 1.'],
              answerSv: 'e² − 1.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Area mellan rät linje och parabel',
              givenSv: 'y = x + 2 och y = x²',
              findSv: 'Arean av området mellan kurvorna',
              methodSv: 'Hitta skärningspunkterna och integrera (övre − undre).',
              stepsSv: [
                'x² = x + 2 ger x² − x − 2 = 0, alltså x₁ = −1 och x₂ = 2.',
                '∫[−1 till 2] (x + 2 − x²) dx = [x²/2 + 2x − x³/3]₋₁² = (2 + 4 − 8/3) − (1/2 − 2 + 1/3) = 4,5.',
              ],
              answerSv: 'Arean är 4,5 a.e.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma att a.e. (area) alltid är positiv även när kurvan ligger under x-axeln',
              wrongApproachSv: 'Att ange ett negativt tal som geometrisk area.',
              rightApproachSv: 'Integrera (0 − f(x)) för delar under x-axeln eller ta absolutbeloppet av delintegralen.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Primitiv funktion',
          promptSv: 'F(x) är en primitiv funktion till f(x) = 6x med villkoret F(2) = 15. Vad är F(0)?',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'F(x) = 3x² + C.',
          stepBySolutionSv: '3 · 2² + C = 15 ger C = 3, så F(0) = 3.',
          relatedSectionSlug: 'area-mellan-kurvor',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Integraler',
          promptSv: 'Beräkna arean mellan x-axeln och f(x) = 4 − x² mellan nollställena x = −2 och x = 2, avrundad till en decimal (eller bråk 32/3 ≈ 10,7). Ange med en decimal.',
          correctAnswer: '10.7',
          numericTolerance: 0.15,
          unitSv: 'a.e.',
          hintSv: 'Primitiv funktion är 4x − x³/3.',
          stepBySolutionSv: '(8 − 8/3) − (−8 + 8/3) = 32/3 ≈ 10,7 a.e.',
          relatedSectionSlug: 'area-mellan-kurvor',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Primitiv funktion',
          promptSv: 'Vilken av följande är en primitiv funktion till f(x) = e^(3x)?',
          options: ['3e^(3x)', 'e^(3x)', 'e^(3x) / 3', '3x · e^(3x)'],
          correctAnswer: '2',
          hintSv: 'Derivera alternativen för att se vilket som ger e^(3x).',
          stepBySolutionSv: 'D(e^(3x) / 3) = (3e^(3x)) / 3 = e^(3x).',
          relatedSectionSlug: 'area-mellan-kurvor',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Area',
          promptSv: 'Beräkna arean mellan linjen y = x + 2 och parabeln y = x² från x = −1 till x = 2.',
          correctAnswer: '4.5',
          numericTolerance: 0.05,
          unitSv: 'a.e.',
          hintSv: 'Integrera (x + 2 − x²) mellan −1 och 2.',
          stepBySolutionSv: '[x²/2 + 2x − x³/3]₋₁² = (10/3) − (−7/6) = 27/6 = 4,5 a.e.',
          relatedSectionSlug: 'area-mellan-kurvor',
        },
      ],
    }),
    buildChapter('course-matte-3c', {
      slug: 'trigonometri-i-godtyckliga-trianglar',
      chapterNumber: 4,
      titleSv: 'Enhetscirkeln, areasatsen, sinussatsen och cosinussatsen',
      summarySv: 'Trigonometri för trubbiga vinklar, triangelns areasats, sinussatsen samt cosinussatsen.',
      isFree: false,
      estimatedMinutes: 40,
      lessons: [
        {
          sectionSlug: 'enhetscirkel-och-triangelsatser',
          titleSv: 'Enhetscirkeln och triangelsatserna',
          overviewConcepts: [
            { term: 'Enhetscirkeln', definition: 'Cirkel med radie 1 och medelpunkt i origo där cos v är x-koordinaten och sin v är y-koordinaten.' },
            { term: 'Supplementvinkel', definition: 'sin(180° − v) = sin v medan cos(180° − v) = −cos v.' },
          ],
          theoryBlocks: [
            {
              heading: 'Lösa godtyckliga trianglar',
              bodySv:
                'I trianglar som saknar rät vinkel används areasatsen, sinussatsen och cosinussatsen. Eftersom två supplementvinklar v och 180° − v har exakt samma sinusvärde kan sinussatsen ibland ge två möjliga trianglar (ett spetsigt och ett trubbigt svar), vilket alltid måste kontrolleras mot triangelns vinkelsumma 180°.',
              deepDiveSv:
                'Cosinussatsen är en generalisering av Pythagoras sats: vid C = 90° är cos 90° = 0 och formeln reduceras till c² = a² + b².',
              svgDiagram: SVG_UNIT_CIRCLE,
            },
          ],
          formulas: [
            {
              nameSv: 'Areasatsen och sinussatsen',
              latex: 'A = \\frac{1}{2} ab\\sin C, \\quad \\frac{\\sin A}{a} = \\frac{\\sin B}{b} = \\frac{\\sin C}{c}',
              explanationSv: 'Gäller i alla trianglar med sidor a, b, c och motstående vinklar A, B, C.',
              variables: [
                { symbol: 'a, b, c', meaningSv: 'Triangelns sidor', unit: 'l.e.' },
                { symbol: 'A, B, C', meaningSv: 'Motstående vinklar', unit: '°' },
              ],
            },
            {
              nameSv: 'Cosinussatsen',
              latex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
              explanationSv: 'Kopplar samman alla tre sidorna och en mellanliggande vinkel.',
              variables: [
                { symbol: 'C', meaningSv: 'Vinkel mellan sidorna a och b', unit: '°' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Area med mellanliggande vinkel',
              givenSv: 'a = 8,0 cm, b = 5,0 cm, mellanliggande vinkel C = 30°',
              findSv: 'Triangelns area',
              methodSv: 'A = ½ · a · b · sin C.',
              stepsSv: ['A = 0,5 · 8,0 · 5,0 · sin 30° = 20 · 0,5 = 10 cm².'],
              answerSv: 'Arean är 10 cm².',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Tredje sidan med cosinussatsen',
              givenSv: 'a = 5,0 cm, b = 8,0 cm, C = 60°',
              findSv: 'Sidan c',
              methodSv: 'cos 60° = 0,5.',
              stepsSv: ['c² = 25 + 64 − 2 · 5 · 8 · 0,5 = 89 − 40 = 49 ger c = 7,0 cm.'],
              answerSv: 'Sidan c är 7,0 cm.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Bestämma största vinkeln när alla tre sidor är kända',
              givenSv: 'Sidor 3, 5 och 7 cm',
              findSv: 'Vinkeln mittemot den längsta sidan (7 cm)',
              methodSv: 'Lös ut cos C ur cosinussatsen.',
              stepsSv: [
                '7² = 3² + 5² − 2 · 3 · 5 · cos C.',
                '49 = 34 − 30 cos C ger cos C = −15 / 30 = −0,5 och C = 120°.',
              ],
              answerSv: 'Vinkeln är 120° (trubbig triangel).',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Missa det trubbiga alternativet i sinussatsen',
              wrongApproachSv: 'Att bara ta räknarens arcsin-värde utan att pröva 180° − v.',
              rightApproachSv: 'Pröva alltid om även supplementvinkeln 180° − v får plats inom vinkelsumman 180°.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Areasatsen',
          promptSv: 'En triangel har två sidor med längderna 10 cm och 6 cm samt mellanliggande vinkel 30°. Vad är arean i cm²?',
          latexFormula: 'A = \\frac{1}{2} a b \\sin C',
          correctAnswer: '15',
          numericTolerance: 0.1,
          unitSv: 'cm²',
          hintSv: 'sin 30° = 0,5.',
          stepBySolutionSv: 'A = 0,5 · 10 · 6 · 0,5 = 15 cm².',
          relatedSectionSlug: 'enhetscirkel-och-triangelsatser',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Cosinussatsen',
          promptSv: 'I en triangel är a = 5 cm, b = 8 cm och mellanliggande vinkel C = 60°. Hur lång är sidan c i cm?',
          latexFormula: 'c^2 = a^2 + b^2 - 2ab\\cos C',
          correctAnswer: '7',
          numericTolerance: 0.05,
          unitSv: 'cm',
          hintSv: 'cos 60° = 0,5.',
          stepBySolutionSv: 'c² = 25 + 64 − 2 · 5 · 8 · 0,5 = 49 ger c = 7 cm.',
          relatedSectionSlug: 'enhetscirkel-och-triangelsatser',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Enhetscirkeln',
          promptSv: 'Vilket värde har cos 120°?',
          options: ['0,5', '−0,5', '0,866', '−0,866'],
          correctAnswer: '1',
          hintSv: 'cos(180° − v) = −cos v och cos 60° = 0,5.',
          stepBySolutionSv: 'cos 120° = −cos 60° = −0,5.',
          relatedSectionSlug: 'enhetscirkel-och-triangelsatser',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Cosinussatsen',
          promptSv: 'En triangel har sidorna 3 cm, 5 cm och 7 cm. Hur stor är vinkeln mittemot den längsta sidan i grader?',
          correctAnswer: '120',
          numericTolerance: 0.5,
          unitSv: '°',
          hintSv: 'Lös ut cos C ur 7² = 3² + 5² − 2 · 3 · 5 · cos C.',
          stepBySolutionSv: '49 = 34 − 30 cos C ger cos C = −0,5 och C = 120°.',
          relatedSectionSlug: 'enhetscirkel-och-triangelsatser',
        },
      ],
    }),
  ],
};
