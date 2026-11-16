import { buildChapter } from '../helpers';
import type { CourseSeed } from '../types';

const SVG_LINEAR_INTERSECTION = `<svg viewBox="0 0 320 140" width="100%" aria-label="Två räta linjer som skär varandra i en entydig lösning">
  <line x1="30" y1="115" x2="290" y2="115" stroke="currentColor" stroke-width="1.5" />
  <line x1="55" y1="15" x2="55" y2="128" stroke="currentColor" stroke-width="1.5" />
  <line x1="40" y1="108" x2="260" y2="26" stroke="var(--accent)" stroke-width="1.5" />
  <line x1="70" y1="22" x2="245" y2="112" stroke="currentColor" stroke-width="1.5" />
  <circle cx="152" cy="66" r="4" fill="var(--accent)" />
  <text x="162" y="61" font-size="11" fill="var(--accent)">Skärningspunkt (x, y)</text>
</svg>`;

const SVG_PARABOLA_SYMMETRY = `<svg viewBox="0 0 320 150" width="100%" aria-label="Andragradsfunktion med nollställen, vertex och symmetrilinje">
  <line x1="25" y1="100" x2="295" y2="100" stroke="currentColor" stroke-width="1.5" />
  <line x1="160" y1="14" x2="160" y2="140" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" />
  <path d="M 75 24 Q 160 220 245 24" fill="none" stroke="currentColor" stroke-width="1.5" />
  <circle cx="107" cy="100" r="3.5" fill="var(--accent)" />
  <circle cx="213" cy="100" r="3.5" fill="var(--accent)" />
  <circle cx="160" cy="122" r="4" fill="var(--accent)" />
  <text x="90" y="114" font-size="11" fill="currentColor">x₁</text>
  <text x="218" y="114" font-size="11" fill="currentColor">x₂</text>
  <text x="168" y="132" font-size="11" fill="var(--accent)">Vertex (extrempunkt)</text>
  <text x="166" y="25" font-size="11" fill="var(--accent)">Symmetrilinje</text>
</svg>`;

export const matte2aCourse: CourseSeed = {
  id: 'course-matte-2a',
  subjectId: 'subj-matematik',
  slug: 'matte-2a',
  codeGy25: 'MATE2A00X',
  nameSv: 'Matematik 2a',
  levelLabelSv: 'Nivå 2a',
  centralContentSummarySv:
    'Linjära ekvationssystem, andragradsekvationer och parabler, exponentialfunktioner och tiologaritmer samt geometri och statistik.',
  sortOrder: 4,
  chapters: [
    buildChapter('course-matte-2a', {
      slug: 'linjara-ekvationssystem',
      chapterNumber: 1,
      titleSv: 'Linjära ekvationssystem och grafer',
      summarySv:
        'Grafisk lösning av ekvationssystem samt algebraisk lösning med substitutions- och additionsmetoden.',
      isFree: true,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'grafisk-losning',
          titleSv: 'Grafisk lösning och antal lösningar',
          overviewConcepts: [
            { term: 'Ekvationssystem', definition: 'Två eller flera ekvationer som ska uppfyllas samtidigt av samma variabler.' },
            { term: 'Skärningspunkt', definition: 'Den gemensamma punkt (x, y) där två linjer möts.' },
          ],
          theoryBlocks: [
            {
              heading: 'Ett, noll eller oändligt många svar',
              bodySv:
                'Varje linjär ekvation med två variabler beskriver en rät linje i koordinatsystemet. När två linjer skär varandra i en punkt har systemet exakt en lösning. Om linjerna har samma lutning k men olika m-värde är de parallella och saknar lösning. Sammanfaller båda linjerna helt finns oändligt många lösningar.',
              deepDiveSv:
                'Grafisk lösning ger god översikt, men för exakta bråksvar eller stora tal krävs algebraiska metoder.',
              svgDiagram: SVG_LINEAR_INTERSECTION,
            },
          ],
          formulas: [
            {
              nameSv: 'Jämförelse av k-form',
              latex: '\\begin{cases} y = k_1 x + m_1 \\\\ y = k_2 x + m_2 \\end{cases}',
              explanationSv: 'Olika k-värden garanterar att linjerna skär varandra i exakt en punkt.',
              variables: [
                { symbol: 'k_1, k_2', meaningSv: 'Lutningar', unit: 'Tal' },
                { symbol: 'm_1, m_2', meaningSv: 'Skärningar med y-axeln', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Två ekvationer på k-form',
              givenSv: 'y = 2x + 1 och y = x + 4',
              findSv: 'Lösningen (x, y)',
              methodSv: 'Sätt högerleden lika eftersom båda är lika med y.',
              stepsSv: ['2x + 1 = x + 4 ger x = 3.', 'y = 3 + 4 = 7.'],
              answerSv: 'x = 3, y = 7.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Avgöra antal lösningar utan att rita',
              givenSv: '2x + y = 5 och 4x + 2y = 14',
              findSv: 'Hur många lösningar systemet har',
              methodSv: 'Skriv om båda till y = kx + m.',
              stepsSv: [
                'Första linjen: y = −2x + 5.',
                'Andra linjen: y = −2x + 7.',
                'Samma lutning k = −2 men olika m-värden (5 ≠ 7) betyder parallella linjer.',
              ],
              answerSv: 'Systemet saknar lösning.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Bestämma okänt k-värde för utebliven skärning',
              givenSv: 'y = kx + 3 och 6x − 2y = 8',
              findSv: 'Vilket värde på k som gör att systemet saknar lösning',
              methodSv: 'Lös ut y i den andra ekvationen och matcha lutningen.',
              stepsSv: ['−2y = −6x + 8 ger y = 3x − 4.', 'För parallellitet krävs k = 3 (och m-värdena 3 ≠ −4 stämmer).'],
              answerSv: 'k = 3.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma ange båda koordinaterna x och y',
              wrongApproachSv: 'Att stanna när man hittat x = 3.',
              rightApproachSv: 'Ett system i två variabler kräver alltid både x och y i svaret.',
            },
          ],
        },
        {
          sectionSlug: 'substitutionsmetoden',
          titleSv: 'Substitutionsmetoden',
          overviewConcepts: [
            { term: 'Substitution', definition: 'Att lösa ut en variabel ur den ena ekvationen och ersätta den i den andra.' },
          ],
          theoryBlocks: [
            {
              heading: 'Stegvis utbyte av variabel',
              bodySv:
                'Substitutionsmetoden är särskilt smidig när en variabel redan står ensam eller har koefficienten 1. Du löser ut den variabeln och sätter in uttrycket (inom parentes) i den andra ekvationen så att bara en obekant återstår.',
              deepDiveSv:
                'Kontrollera alltid lösningen genom insättning i båda originalekvationerna.',
            },
          ],
          formulas: [
            {
              nameSv: 'Substitutionsprincipen',
              latex: 'y = f(x) \\implies ax + b \\cdot f(x) = c',
              explanationSv: 'Minskar antalet variabler från två till en.',
              variables: [
                { symbol: 'x, y', meaningSv: 'Okända variabler', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'En variabel redan utlöst',
              givenSv: 'y = 3x och 2x + y = 25',
              findSv: '(x, y)',
              methodSv: 'Ersätt y med 3x i den andra ekvationen.',
              stepsSv: ['2x + 3x = 25 ger 5x = 25 och x = 5.', 'y = 3 · 5 = 15.'],
              answerSv: 'x = 5, y = 15.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Textuppgift om biljettpriser',
              givenSv: '2v + 3b = 460 och v + b = 190',
              findSv: 'Pris för vuxenbiljett v och barnbiljett b',
              methodSv: 'Lös ut b = 190 − v och sätt in i den första ekvationen.',
              stepsSv: [
                '2v + 3(190 − v) = 460.',
                '2v + 570 − 3v = 460 ger −v = −110 och v = 110 kr.',
                'b = 190 − 110 = 80 kr.',
              ],
              answerSv: 'En vuxenbiljett kostar 110 kr och en barnbiljett 80 kr.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Blandningsproblem i procent',
              givenSv: 'Två saftkoncentrat (10 % och 40 % socker) blandas till 6,0 liter med 20 % sockerhalt.',
              findSv: 'Volymerna x och y av varje sort',
              methodSv: 'Ställ upp en ekvation för totalvolym och en för sockermängd.',
              stepsSv: [
                'x + y = 6 och 0,10x + 0,40y = 0,20 · 6 = 1,2.',
                'x = 6 − y ger 0,10(6 − y) + 0,40y = 1,2, alltså 0,30y = 0,6 och y = 2,0 liter.',
                'x = 4,0 liter.',
              ],
              answerSv: '4,0 liter av 10 %-sorten och 2,0 liter av 40 %-sorten.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Sätta in uttrycket i samma ekvation som det kom ifrån',
              wrongApproachSv: 'Att lösa ut y ur ekvation 1 och sätta tillbaka i ekvation 1, vilket ger 0 = 0.',
              rightApproachSv: 'Sätt alltid in det utlösta uttrycket i den andra ekvationen.',
            },
          ],
        },
        {
          sectionSlug: 'additionsmetoden',
          titleSv: 'Additionsmetoden',
          overviewConcepts: [
            { term: 'Additionsmetoden', definition: 'Att addera eller subtrahera två ekvationer ledvis så att en variabel försvinner.' },
          ],
          theoryBlocks: [
            {
              heading: 'Eliminera en variabel direkt',
              bodySv:
                'Additionsmetoden passar bäst när variablerna står rakt under varandra på formen ax + by = c. Genom att multiplicera en eller båda ekvationerna så att en variabel får motsatta koefficienter (+b och −b) tar den variabeln ut sig själv vid addition.',
              deepDiveSv:
                'Metoden minskar risken för bråkräkning tidigt i lösningen.',
            },
          ],
          formulas: [
            {
              nameSv: 'Ledvis addition',
              latex: '(a_1 x + b y) + (a_2 x - b y) = c_1 + c_2 \\implies (a_1 + a_2)x = c_1 + c_2',
              explanationSv: 'Motsatta koefficienter eliminerar y i ett enda steg.',
              variables: [
                { symbol: 'a_1, a_2, b', meaningSv: 'Koefficienter', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Direkt elimination',
              givenSv: 'x + y = 10 och x − y = 4',
              findSv: 'x och y',
              methodSv: 'Addera ekvationerna rakt ner.',
              stepsSv: ['2x = 14 ger x = 7.', '7 + y = 10 ger y = 3.'],
              answerSv: 'x = 7, y = 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Multiplicera en ekvation före addition',
              givenSv: '3x + y = 11 och 2x + y = 8',
              findSv: 'x och y',
              methodSv: 'Multiplicera den andra ekvationen med −1 och addera.',
              stepsSv: [
                '3x + y = 11 plus −2x − y = −8 ger x = 3.',
                '2(3) + y = 8 ger y = 2.',
              ],
              answerSv: 'x = 3, y = 2.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Skala båda ekvationerna',
              givenSv: '3x + 2y = 19 och 5x − 3y = 19',
              findSv: 'x och y',
              methodSv: 'Skala så y-termerna blir +6y och −6y.',
              stepsSv: [
                'Första · 3: 9x + 6y = 57. Andra · 2: 10x − 6y = 38.',
                'Addera: 19x = 95 ger x = 5.',
                '3(5) + 2y = 19 ger 2y = 4 och y = 2.',
              ],
              answerSv: 'x = 5, y = 2.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma multiplicera högerledet vid skalning',
              wrongApproachSv: 'Att bara multiplicera vänsterledet med −1 eller 2.',
              rightApproachSv: 'Varje term i både vänster- och högerledet måste multipliceras med samma tal.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'multiple_choice',
          categorySv: 'Begrepp',
          promptSv: 'Vad motsvarar skärningspunkten mellan graferna till två linjära ekvationer i ett koordinatsystem?',
          options: [
            'Linjernas medelvärde',
            'Den lösning (x, y) som uppfyller båda ekvationerna samtidigt',
            'Linjernas m-värde',
            'Ett tecken på att lösning saknas',
          ],
          correctAnswer: '1',
          hintSv: 'Punkten ligger på båda linjerna samtidigt.',
          stepBySolutionSv: 'En punkt på båda linjerna gör båda likheterna sanna samtidigt.',
          relatedSectionSlug: 'grafisk-losning',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Ekvationssystem',
          promptSv: 'Lös ekvationssystemet y = 2x + 1 och y = x + 4. Ange x.',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Sätt 2x + 1 = x + 4.',
          stepBySolutionSv: '2x + 1 = x + 4 ger x = 3 (och y = 7).',
          relatedSectionSlug: 'grafisk-losning',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Ekvationssystem',
          promptSv: 'Lös ekvationssystemet x + y = 10 och x − y = 4. Ange x.',
          correctAnswer: '7',
          numericTolerance: 0.01,
          hintSv: 'Addera de båda ekvationerna ledvis.',
          stepBySolutionSv: '2x = 14 ger x = 7 (och y = 3).',
          relatedSectionSlug: 'additionsmetoden',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Ekvationssystem',
          promptSv: 'Lös ekvationssystemet 3x + y = 11 och 2x + y = 8. Ange y.',
          correctAnswer: '2',
          numericTolerance: 0.01,
          hintSv: 'Subtrahera den andra ekvationen från den första för att få x först.',
          stepBySolutionSv: 'x = 3 ger 2·3 + y = 8, alltså y = 2.',
          relatedSectionSlug: 'additionsmetoden',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Analys',
          promptSv: 'När saknar ett system av två räta linjer helt lösning?',
          options: [
            'När linjerna har olika k-värden',
            'När linjerna har samma k-värde men olika m-värden',
            'När båda linjerna går genom origo',
            'När produkten av k-värdena är −1',
          ],
          correctAnswer: '1',
          hintSv: 'Parallella linjer som inte ligger på varandra skär aldrig varandra.',
          stepBySolutionSv: 'Samma k-värde ger parallella linjer, och olika m-värden gör att de aldrig möts.',
          relatedSectionSlug: 'grafisk-losning',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Problemlösning',
          promptSv: 'Två vuxenbiljetter och tre barnbiljetter kostar tillsammans 460 kr. En vuxen- och en barnbiljett kostar 190 kr. Vad kostar en vuxenbiljett i kronor?',
          correctAnswer: '110',
          numericTolerance: 0.5,
          unitSv: 'kr',
          hintSv: 'Ställ upp 2v + 3b = 460 och v + b = 190.',
          stepBySolutionSv: 'b = 190 − v ger 2v + 3(190 − v) = 460, alltså −v = −110 och v = 110 kr.',
          relatedSectionSlug: 'substitutionsmetoden',
        },
      ],
    }),
    buildChapter('course-matte-2a', {
      slug: 'andragradsekvationer-och-funktioner',
      chapterNumber: 2,
      titleSv: 'Andragradsekvationer och parabler',
      summarySv: 'Nollproduktmetoden, pq-formeln och andragradsfunktionens vertex.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'pq-formeln-och-nollproduct',
          titleSv: 'Nollproduktmetoden och pq-formeln',
          overviewConcepts: [
            { term: 'Andragradsekvation', definition: 'Ekvation där den högsta exponenten på x är 2.' },
            { term: 'Nollproduktmetoden', definition: 'Om a · b = 0 måste antingen a = 0 eller b = 0.' },
          ],
          theoryBlocks: [
            {
              heading: 'Lösa andragradsekvationer i standardform',
              bodySv:
                'Innan pq-formeln kan användas måste koefficienten framför x² vara 1 och högerledet vara 0: x² + px + q = 0. Därefter ges rötterna av x = −p/2 ± √((p/2)² − q).',
              deepDiveSv:
                'Saknas konstantterm (x² + px = 0) är faktorisering x(x + p) = 0 snabbare och säkrare än pq-formeln.',
            },
          ],
          formulas: [
            {
              nameSv: 'pq-formeln',
              latex: 'x^2 + px + q = 0 \\implies x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}',
              explanationSv: 'Kräver att x² står ensamt med koefficienten 1.',
              variables: [
                { symbol: 'p, q', meaningSv: 'Koefficienter i normalform', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Faktorisering utan konstantterm',
              givenSv: 'x² − 7x = 0',
              findSv: 'Rötterna',
              methodSv: 'Bryt ut x.',
              stepsSv: ['x(x − 7) = 0 ger x₁ = 0 och x₂ = 7.'],
              answerSv: 'x₁ = 0, x₂ = 7.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'pq-formeln efter division',
              givenSv: '2x² − 12x + 16 = 0',
              findSv: 'Rötterna',
              methodSv: 'Dividera med 2 så x² blir fritt.',
              stepsSv: ['x² − 6x + 8 = 0 ger x = 3 ± √(9 − 8) = 3 ± 1.'],
              answerSv: 'x₁ = 2, x₂ = 4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Kastparabel och maxhöjd',
              givenSv: 'h(t) = 12t − 5t²',
              findSv: 'När höjden är störst och vilken maxhöjden är',
              methodSv: 'Hitta nollställena och ta medelvärdet för symmetrilinjen.',
              stepsSv: ['t(12 − 5t) = 0 ger t₁ = 0 och t₂ = 2,4 s. Symmetri vid t = 1,2 s ger h_max = 12(1,2) − 5(1,44) = 7,2 m.'],
              answerSv: 'Maxhöjden 7,2 m nås efter 1,2 s.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma dividera bort koefficienten framför x²',
              wrongApproachSv: 'Att läsa av p = −12 i 2x² − 12x + 16 = 0.',
              rightApproachSv: 'Dividera alla termer med 2 först så att x²-termen har koefficienten 1.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsekvation',
          promptSv: 'Lös ekvationen x² − 10x + 21 = 0. Ange den största roten.',
          correctAnswer: '7',
          numericTolerance: 0.01,
          hintSv: 'x = 5 ± √(25 − 21).',
          stepBySolutionSv: 'x = 5 ± √4 = 5 ± 2 ger rötterna 3 och 7.',
          relatedSectionSlug: 'pq-formeln-och-nollproduct',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Andragradsekvation',
          promptSv: 'Lös ekvationen 3x² − 18x = 0. Ange den positiva roten.',
          correctAnswer: '6',
          numericTolerance: 0.01,
          hintSv: 'Bryt ut 3x.',
          stepBySolutionSv: '3x(x − 6) = 0 ger x = 0 eller x = 6.',
          relatedSectionSlug: 'pq-formeln-och-nollproduct',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Begrepp',
          promptSv: 'Vad måste göras först innan pq-formeln tillämpas på 4x² + 8x − 12 = 0?',
          options: [
            'Ta kvadratroten ur hela ekvationen',
            'Dividera samtliga termer med 4',
            'Flytta 8x till högerledet',
            'Sätta x = 0',
          ],
          correctAnswer: '1',
          hintSv: 'Koefficienten framför x² måste bli 1.',
          stepBySolutionSv: 'Division med 4 ger normalformen x² + 2x − 3 = 0.',
          relatedSectionSlug: 'pq-formeln-och-nollproduct',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Andragradsfunktion',
          promptSv: 'En boll följer höjdkurvan h(t) = 20t − 5t² där t är tid i sekunder. Efter hur många sekunder når bollen sin högsta höjd?',
          correctAnswer: '2',
          numericTolerance: 0.05,
          unitSv: 's',
          hintSv: 'Hitta nollställena t₁ och t₂ och ta mitten mellan dem.',
          stepBySolutionSv: '5t(4 − t) = 0 ger nollställena 0 och 4. Symmetrilinjen ligger vid t = 2 s.',
          relatedSectionSlug: 'pq-formeln-och-nollproduct',
        },
      ],
    }),
    buildChapter('course-matte-2a', {
      slug: 'exponentialfunktioner-och-logaritmer',
      chapterNumber: 3,
      titleSv: 'Exponentialfunktioner och tiologaritmer',
      summarySv: 'Potensekvationer, exponentialekvationer och lösning med tiologaritm (lg).',
      isFree: false,
      estimatedMinutes: 30,
      lessons: [
        {
          sectionSlug: 'tiologaritmer',
          titleSv: 'Tiologaritmer och logaritmlagar',
          overviewConcepts: [
            { term: 'Tiologaritm (lg x)', definition: 'Den exponent som 10 måste upphöjas till för att ge x.' },
          ],
          theoryBlocks: [
            {
              heading: 'Lösa ut obekant i exponenten',
              bodySv:
                'För varje positivt tal x gäller x = 10^(lg x). Med logaritmlagen lg(a^x) = x · lg a kan exponenter flyttas ner framför logaritmen så att exponentialekvationer löses exakt.',
              deepDiveSv:
                'Logaritmer är endast definierade för strikt positiva tal (x > 0).',
            },
          ],
          formulas: [
            {
              nameSv: 'Logaritmlagen för potens',
              latex: '\\lg(a^x) = x \\cdot \\lg a',
              explanationSv: 'Flyttar ner en obekant exponent till en vanlig faktor.',
              variables: [
                { symbol: 'a', meaningSv: 'Positiv bas', unit: 'Tal > 0' },
                { symbol: 'x', meaningSv: 'Exponent', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Enkel tiologaritm',
              givenSv: 'lg x = 3',
              findSv: 'x',
              methodSv: 'Skriv om i potensform: x = 10³.',
              stepsSv: ['x = 10³ = 1 000.'],
              answerSv: 'x = 1 000.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Exponentialekvation',
              givenSv: '2^x = 16',
              findSv: 'x',
              methodSv: 'Logaritmera båda sidor eller jämför med 2⁴.',
              stepsSv: ['x = lg 16 / lg 2 = 4.'],
              answerSv: 'x = 4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Fördubblingstid vid 8 % tillväxt',
              givenSv: '1,08^t = 2',
              findSv: 't med en decimal',
              methodSv: 't · lg 1,08 = lg 2.',
              stepsSv: ['t = lg 2 / lg 1,08 ≈ 9,0 år.'],
              answerSv: 'Fördubblingstiden är 9,0 år.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Dela 2 med 1,08 innan logaritmen',
              wrongApproachSv: 'Att skriva t = lg(2 / 1,08).',
              rightApproachSv: 'Det är en kvot av två logaritmer: t = (lg 2) / (lg 1,08).',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Vad är lg 10 000?',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: '10 000 = 10⁴.',
          stepBySolutionSv: 'lg(10⁴) = 4.',
          relatedSectionSlug: 'tiologaritmer',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Lös ekvationen lg x = 2. Ange x.',
          correctAnswer: '100',
          numericTolerance: 0.1,
          hintSv: 'x = 10².',
          stepBySolutionSv: '10² = 100.',
          relatedSectionSlug: 'tiologaritmer',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Potensekvationer',
          promptSv: 'Lös ekvationen x³ = 125. Ange x.',
          correctAnswer: '5',
          numericTolerance: 0.01,
          hintSv: 'Ta tredjeroten ur 125.',
          stepBySolutionSv: '125^(1/3) = 5 eftersom 5³ = 125.',
          relatedSectionSlug: 'tiologaritmer',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Logaritmer',
          promptSv: 'Vilket uttryck ger den exakta lösningen till 5 · 1,2^x = 30?',
          options: ['x = lg 6 / lg 1,2', 'x = lg(6 / 1,2)', 'x = lg 30 / lg 6', 'x = 6 / 1,2'],
          correctAnswer: '0',
          hintSv: 'Dividera först med 5 så att 1,2^x = 6.',
          stepBySolutionSv: '1,2^x = 6 ger x · lg 1,2 = lg 6, alltså x = lg 6 / lg 1,2.',
          relatedSectionSlug: 'tiologaritmer',
        },
      ],
    }),
    buildChapter('course-matte-2a', {
      slug: 'geometri-och-statistik',
      chapterNumber: 4,
      titleSv: 'Likformighet och statistiska mått',
      summarySv: 'Kordasatsen, bisektriser samt standardavvikelse och normalfördelning.',
      isFree: false,
      estimatedMinutes: 30,
      lessons: [
        {
          sectionSlug: 'standardavvikelse',
          titleSv: 'Standardavvikelse och normalfördelning',
          overviewConcepts: [
            { term: 'Standardavvikelse (s)', definition: 'Mått på hur mycket värdena i genomsnitt avviker från medelvärdet.' },
          ],
          theoryBlocks: [
            {
              heading: 'Tumregler i normalfördelningen',
              bodySv:
                'I en normalfördelad datamängd är fördelningen symmetrisk kring medelvärdet. Cirka 68 % av alla värden ligger inom ±1 standardavvikelse från medelvärdet och cirka 95 % inom ±2 standardavvikelser.',
              deepDiveSv:
                'Tack vare symmetrin ligger exakt 50 % över medelvärdet och 50 % under medelvärdet.',
            },
          ],
          formulas: [
            {
              nameSv: '68-95-regeln',
              latex: 'P(\\mu - \\sigma \\le X \\le \\mu + \\sigma) \\approx 0{,}68',
              explanationSv: 'Ungefär 68 % ryms inom en standardavvikelse kring medelvärdet μ.',
              variables: [
                { symbol: '\\mu', meaningSv: 'Medelvärde', unit: 'Datans enhet' },
                { symbol: '\\sigma', meaningSv: 'Standardavvikelse', unit: 'Datans enhet' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Andel inom en standardavvikelse',
              givenSv: 'Medelvärde 175 cm, standardavvikelse 6 cm (normalfördelat)',
              findSv: 'Andelen mellan 169 cm och 181 cm',
              methodSv: '169 = 175 − 6 och 181 = 175 + 6.',
              stepsSv: ['Intervallet är ±1 standardavvikelse, vilket rymmer cirka 68 %.'],
              answerSv: 'Cirka 68 %.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Andel i ena svansen',
              givenSv: 'μ = 500 g, σ = 20 g',
              findSv: 'Andelen som väger över 520 g',
              methodSv: 'Utanför ±1σ finns 32 %, hälften över och hälften under.',
              stepsSv: ['(100 % − 68 %) / 2 = 16 %.'],
              answerSv: 'Cirka 16 %.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Kombinera intervall i normalfördelning',
              givenSv: 'μ = 100, σ = 15',
              findSv: 'Andelen mellan 85 och 130',
              methodSv: 'Summera vänstra halvan (34 %) och högra delen upp till +2σ (47,5 %).',
              stepsSv: ['34 % + 47,5 % = 81,5 %.'],
              answerSv: 'Cirka 81,5 %.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma halvera resten vid ensidig svans',
              wrongApproachSv: 'Att svara 32 % över μ + σ.',
              rightApproachSv: 'De 32 % delas lika mellan den övre och den undre svansen: 16 % på varje sida.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Statistik',
          promptSv: 'En normalfördelad storhet har medelvärdet 80 och standardavvikelsen 5. Ungefär hur många procent av värdena ligger mellan 75 och 85?',
          correctAnswer: '68',
          numericTolerance: 1,
          unitSv: '%',
          hintSv: '75 till 85 är ±1 standardavvikelse.',
          stepBySolutionSv: 'Cirka 68 % ligger inom ±1 standardavvikelse.',
          relatedSectionSlug: 'standardavvikelse',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Statistik',
          promptSv: 'Medelvärdet är 100 och standardavvikelsen 10. Ungefär hur många procent av värdena överstiger 110?',
          correctAnswer: '16',
          numericTolerance: 1,
          unitSv: '%',
          hintSv: 'Ta (100 − 68) / 2.',
          stepBySolutionSv: 'Utanför ±1 standardavvikelse finns 32 %, varav hälften (16 %) ligger ovanför +1 standardavvikelse.',
          relatedSectionSlug: 'standardavvikelse',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Statistik',
          promptSv: 'Vad säger en mindre standardavvikelse om en mätserie?',
          options: [
            'Att medelvärdet alltid är lägre',
            'Att mätvärdena ligger tätare samlade kring medelvärdet',
            'Att datamängden har fler mätpunkter',
            'Att medianen är noll',
          ],
          correctAnswer: '1',
          hintSv: 'Standardavvikelse är ett spridningsmått.',
          stepBySolutionSv: 'Liten standardavvikelse betyder låg spridning runt medelvärdet.',
          relatedSectionSlug: 'standardavvikelse',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Statistik',
          promptSv: 'I en normalfördelning med μ = 50 och σ = 4, ungefär hur många procent ligger mellan 46 och 58?',
          correctAnswer: '81.5',
          numericTolerance: 1,
          unitSv: '%',
          hintSv: 'Addera 34 % (från 46 till 50) och 47,5 % (från 50 till 58).',
          stepBySolutionSv: '68/2 + 95/2 = 34 + 47,5 = 81,5 %.',
          relatedSectionSlug: 'standardavvikelse',
        },
      ],
    }),
  ],
};

export const matte2bCourse: CourseSeed = {
  id: 'course-matte-2b',
  subjectId: 'subj-matematik',
  slug: 'matte-2b',
  codeGy25: 'MATE2B00X',
  nameSv: 'Matematik 2b',
  levelLabelSv: 'Nivå 2b',
  centralContentSummarySv:
    'Linjära ekvationssystem, kvadrerings- och konjugatreglerna, andragradsekvationer och funktioner, exponentialfunktioner och logaritmer samt regression och normalfördelning.',
  sortOrder: 5,
  chapters: [
    buildChapter('course-matte-2b', {
      slug: 'linjara-system-och-andragradsekvationer',
      chapterNumber: 1,
      titleSv: 'Linjära ekvationssystem och andragradsekvationer',
      summarySv:
        'Algebraiska metoder för ekvationssystem, kvadreringsreglerna, konjugatregeln samt lösning av andragradsekvationer med pq-formeln.',
      isFree: true,
      estimatedMinutes: 45,
      lessons: [
        {
          sectionSlug: 'linjara-ekvationssystem',
          titleSv: 'Linjära ekvationssystem med två obekanta',
          overviewConcepts: [
            { term: 'Substitutionsmetoden', definition: 'Att lösa ut en variabel och sätta in i den andra ekvationen.' },
            { term: 'Additionsmetoden', definition: 'Att eliminera en variabel genom att addera skalade ekvationer.' },
          ],
          theoryBlocks: [
            {
              heading: 'Välja smidigaste lösningsmetod',
              bodySv:
                'Ett linjärt ekvationssystem kan lösas med substitution när en variabel är lätt att lösa ut, eller med addition när koefficienterna framför x eller y enkelt kan göras lika stora med motsatta tecken.',
              deepDiveSv:
                'Ekonomiska brytpunkter och utbuds-/efterfrågemodeller leder ofta till linjära system där skärningspunkten visar jämviktspris och jämviktskvantitet.',
            },
          ],
          formulas: [
            {
              nameSv: 'Allmänt linjärt system',
              latex: '\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}',
              explanationSv: 'System i två variabler med tre möjliga utfall: en, noll eller oändligt många lösningar.',
              variables: [
                { symbol: 'x, y', meaningSv: 'Okända variabler', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Lösning med additionsmetoden',
              givenSv: 'x + 2y = 14 och x − 2y = 2',
              findSv: 'x och y',
              methodSv: 'Addera ekvationerna direkt.',
              stepsSv: ['2x = 16 ger x = 8.', '8 + 2y = 14 ger y = 3.'],
              answerSv: 'x = 8, y = 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Skalning före addition',
              givenSv: '2x + 3y = 19 och 4x − 3y = 11',
              findSv: 'x och y',
              methodSv: 'Addera direkt eftersom +3y och −3y tar ut varandra.',
              stepsSv: ['6x = 30 ger x = 5.', '2(5) + 3y = 19 ger 3y = 9 och y = 3.'],
              answerSv: 'x = 5, y = 3.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Jämviktspris mellan utbud och efterfrågan',
              givenSv: 'Efterfrågan: p = 500 − 2q. Utbud: p = 100 + 3q.',
              findSv: 'Jämviktskvantitet q och jämviktspris p',
              methodSv: 'Sätt p lika och lös ut q.',
              stepsSv: ['500 − 2q = 100 + 3q ger 400 = 5q, alltså q = 80.', 'p = 100 + 3(80) = 340 kr.'],
              answerSv: 'Jämviktspriset är 340 kr vid kvantiteten 80 enheter.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Sluta efter att x har beräknats',
              wrongApproachSv: 'Att endast skriva x = 5 som slutsvar.',
              rightApproachSv: 'Sätt alltid in x i en av ekvationerna för att även ange y.',
            },
          ],
        },
        {
          sectionSlug: 'kvadreringsregler-och-faktorisering',
          titleSv: 'Kvadreringsreglerna, konjugatregeln och faktorisering',
          overviewConcepts: [
            { term: 'Första kvadreringsregeln', definition: '(a + b)² = a² + 2ab + b².' },
            { term: 'Andra kvadreringsregeln', definition: '(a − b)² = a² − 2ab + b².' },
            { term: 'Konjugatregeln', definition: '(a + b)(a − b) = a² − b².' },
          ],
          theoryBlocks: [
            {
              heading: 'Utveckla och faktorisera snabbare',
              bodySv:
                'Kvadreringsreglerna och konjugatregeln sparar tid både när parenteser ska utvecklas och när andragradsuttryck ska faktoriseras baklänges. Den vanligaste fällan är att glömma den dubbla produkten 2ab i mitten av en kvadrerad parentes.',
              deepDiveSv:
                'Konjugatregeln baklänges gör det enkelt att lösa ekvationer som x² − 64 = (x + 8)(x − 8) = 0 och att förenkla bråk med kvadratuttryck.',
            },
          ],
          formulas: [
            {
              nameSv: 'Kvadreringsreglerna och konjugatregeln',
              latex: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2, \\quad (a + b)(a - b) = a^2 - b^2',
              explanationSv: 'De tre viktigaste omskrivningsreglerna i gymnasiets algebra.',
              variables: [
                { symbol: 'a, b', meaningSv: 'Termer', unit: 'Tal eller variabler' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Utveckla en kvadrat',
              givenSv: '(x + 5)²',
              findSv: 'Utvecklat uttryck',
              methodSv: 'Tillämpa första kvadreringsregeln med a = x och b = 5.',
              stepsSv: ['x² + 2 · x · 5 + 5² = x² + 10x + 25.'],
              answerSv: 'x² + 10x + 25.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Kombinera konjugatregeln med förenkling',
              givenSv: '(x + 3)(x − 3) − x²',
              findSv: 'Förenklat värde',
              methodSv: 'Utveckla med konjugatregeln först.',
              stepsSv: ['(x² − 9) − x² = −9.'],
              answerSv: '−9.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Förenkla rationellt uttryck',
              givenSv: '(x² − 25) / (x² + 10x + 25) för x ≠ −5',
              findSv: 'Förkortat uttryck',
              methodSv: 'Faktorisera täljaren med konjugatregeln och nämnaren med första kvadreringsregeln.',
              stepsSv: ['((x + 5)(x − 5)) / (x + 5)² = (x − 5) / (x + 5).'],
              answerSv: '(x − 5) / (x + 5).',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma mellantermen 2ab',
              wrongApproachSv: 'Att skriva (x + 5)² = x² + 25.',
              rightApproachSv: '(x + 5)² = (x + 5)(x + 5) = x² + 10x + 25.',
            },
          ],
        },
        {
          sectionSlug: 'pq-formeln',
          titleSv: 'Andragradsekvationer och pq-formeln',
          overviewConcepts: [
            { term: 'Diskriminant', definition: 'Uttrycket (p/2)² − q under rottecknet som avgör antalet reella rötter.' },
            { term: 'Dubbelrot', definition: 'Uppstår när diskriminanten är exakt 0 så att ekvationen får en enda reell lösning.' },
          ],
          theoryBlocks: [
            {
              heading: 'Antalet lösningar via diskriminanten',
              bodySv:
                'När en andragradsekvation skrivits på normalformen x² + px + q = 0 avgör tecknet på uttrycket under rottecknet i pq-formeln hur många reella lösningar som finns. Är det positivt finns två lösningar, är det noll finns en lösning (dubbelrot) och är det negativt saknas reella lösningar.',
              deepDiveSv:
                'pq-formeln härleds genom kvadratkomplettering: (x + p/2)² = (p/2)² − q.',
            },
          ],
          formulas: [
            {
              nameSv: 'pq-formeln',
              latex: 'x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}',
              explanationSv: 'Löser ekvationen x² + px + q = 0.',
              variables: [
                { symbol: 'p', meaningSv: 'Koefficient framför x', unit: 'Tal' },
                { symbol: 'q', meaningSv: 'Konstantterm', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Rötter ur x² − 64 = 0',
              givenSv: 'x² − 64 = 0',
              findSv: 'Båda lösningarna',
              methodSv: 'Flytta över 64 och ta roten ur (glöm inte ±).',
              stepsSv: ['x² = 64 ger x = ±8.'],
              answerSv: 'x₁ = 8 och x₂ = −8.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Lösning med pq-formeln',
              givenSv: '2x² − 12x + 16 = 0',
              findSv: 'Samtliga rötter',
              methodSv: 'Dividera med 2 och använd pq-formeln med p = −6, q = 8.',
              stepsSv: ['x² − 6x + 8 = 0 ger x = 3 ± √(9 − 8) = 3 ± 1.'],
              answerSv: 'x₁ = 2 och x₂ = 4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Bestämma parameter för dubbelrot',
              givenSv: 'x² + ax + 9 = 0 ska ha exakt en lösning.',
              findSv: 'Möjliga värden på a',
              methodSv: 'Sätt diskriminanten (a/2)² − 9 = 0.',
              stepsSv: ['(a/2)² = 9 ger a/2 = ±3, alltså a = 6 eller a = −6.'],
              answerSv: 'a = 6 eller a = −6.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma minus framför roten vid x² = 64',
              wrongApproachSv: 'Att bara svara x = 8.',
              rightApproachSv: 'Både (+8)² och (−8)² blir 64, så ekvationen har två rötter: ±8.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'multiple_choice',
          categorySv: 'Algebra',
          promptSv: 'Utveckla uttrycket (x + 5)².',
          options: ['x² + 25', 'x² + 5x + 25', 'x² + 10x + 25', 'x² + 10x + 10'],
          correctAnswer: '2',
          hintSv: 'Använd första kvadreringsregeln: a² + 2ab + b².',
          stepBySolutionSv: '(x + 5)² = x² + 2 · x · 5 + 5² = x² + 10x + 25.',
          relatedSectionSlug: 'kvadreringsregler-och-faktorisering',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsekvation',
          promptSv: 'Lös ekvationen x² − 64 = 0. Ange den positiva roten.',
          correctAnswer: '8',
          numericTolerance: 0.01,
          hintSv: 'x² = 64.',
          stepBySolutionSv: 'x = ±√64 = ±8. Den positiva roten är 8.',
          relatedSectionSlug: 'pq-formeln',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsekvation',
          promptSv: 'Lös ekvationen x² − 6x + 8 = 0. Ange den största roten.',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: 'Använd pq-formeln med p = −6 och q = 8.',
          stepBySolutionSv: 'x = 3 ± √(9 − 8) = 3 ± 1 ger x₁ = 2 och x₂ = 4.',
          relatedSectionSlug: 'pq-formeln',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Algebra',
          promptSv: 'Förenkla uttrycket (x + 3)(x − 3) − x².',
          options: ['9', '−9', '6x − 9', '−6x − 9'],
          correctAnswer: '1',
          hintSv: 'Använd konjugatregeln på (x + 3)(x − 3).',
          stepBySolutionSv: '(x² − 9) − x² = −9.',
          relatedSectionSlug: 'kvadreringsregler-och-faktorisering',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Andragradsekvation',
          promptSv: 'Lös ekvationen 2x² − 12x + 16 = 0. Ange den minsta roten.',
          correctAnswer: '2',
          numericTolerance: 0.01,
          hintSv: 'Dividera först hela ekvationen med 2.',
          stepBySolutionSv: 'x² − 6x + 8 = 0 ger rötterna 2 och 4.',
          relatedSectionSlug: 'pq-formeln',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Ekvationssystem',
          promptSv: 'Lös ekvationssystemet 2x + 3y = 19 och 4x − 3y = 11. Ange x.',
          correctAnswer: '5',
          numericTolerance: 0.01,
          hintSv: 'Addera ekvationerna direkt så att y försvinner.',
          stepBySolutionSv: '6x = 30 ger x = 5 (och y = 3).',
          relatedSectionSlug: 'linjara-ekvationssystem',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Analys',
          promptSv: 'För vilka värden på a har andragradsekvationen x² + ax + 9 = 0 exakt en reell lösning?',
          options: ['Endast a = 3', 'a = 6 eller a = −6', 'Endast a = 9', 'a = 18 eller a = −18'],
          correctAnswer: '1',
          hintSv: 'Sätt uttrycket under rottecknet i pq-formeln lika med noll: (a/2)² − 9 = 0.',
          stepBySolutionSv: '(a/2)² = 9 ger a/2 = ±3, alltså a = ±6.',
          relatedSectionSlug: 'pq-formeln',
        },
      ],
    }),
    buildChapter('course-matte-2b', {
      slug: 'andragradsfunktioner-och-symmetri',
      chapterNumber: 2,
      titleSv: 'Andragradsfunktioner, nollställen och symmetrilinje',
      summarySv: 'Parabelns form, vertex, symmetrilinje och ekonomiska optimeringsproblem.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'symmetrilinje-och-vertex',
          titleSv: 'Symmetrilinje och extrempunkt',
          overviewConcepts: [
            { term: 'Symmetrilinje', definition: 'Den lodräta linjen x = −p/2 (eller mitt emellan nollställena) som delar parabeln i två spegelhalvor.' },
            { term: 'Vertex', definition: 'Parabelns högsta eller lägsta punkt.' },
          ],
          theoryBlocks: [
            {
              heading: 'Minimipunkt eller maximipunkt',
              bodySv:
                'För f(x) = ax² + bx + c avgör tecknet på a åt vilket håll parabeln öppnar sig. Är a > 0 har grafen en minimipunkt (glad mun) och är a < 0 har den en maximipunkt (ledsen mun). Symmetrilinjen ligger alltid vid x = −b / (2a).',
              deepDiveSv:
                'Vid optimering räknar man först ut x-koordinaten för symmetrilinjen och sätter sedan in den i f(x) för att få max- eller minvärdet.',
            },
          ],
          formulas: [
            {
              nameSv: 'Symmetrilinjens x-värde',
              latex: 'x_{\\text{sym}} = -\\frac{b}{2a} = \\frac{x_1 + x_2}{2}',
              explanationSv: 'Ligger alltid mitt emellan eventuella nollställen x₁ och x₂.',
              variables: [
                { symbol: 'a, b', meaningSv: 'Koefficienter i ax² + bx + c', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Hitta symmetrilinjen',
              givenSv: 'f(x) = x² − 6x + 5',
              findSv: 'Symmetrilinjens ekvation',
              methodSv: 'x = −b / (2a).',
              stepsSv: ['x = −(−6) / (2 · 1) = 3.'],
              answerSv: 'Symmetrilinjen är x = 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Minimivärde',
              givenSv: 'f(x) = x² − 6x + 5',
              findSv: 'Funktionens minsta värde',
              methodSv: 'Sätt in x = 3 i f(x).',
              stepsSv: ['f(3) = 3² − 6 · 3 + 5 = 9 − 18 + 5 = −4.'],
              answerSv: 'Minsta värdet är −4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Maximera biljettintäkt',
              givenSv: 'En konsert säljer (200 − 2p) biljetter vid priset p kr. Intäkten är I(p) = p(200 − 2p).',
              findSv: 'Vilket pris som ger maximal intäkt',
              methodSv: 'Ta medelvärdet av nollställena p = 0 och p = 100.',
              stepsSv: ['Symmetri vid p = 50 kr ger I_max = 50 · 100 = 5 000 kr.'],
              answerSv: 'Maximal intäkt på 5 000 kr nås vid biljettpriset 50 kr.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Svara med x-värdet när frågan gäller största eller minsta värde',
              wrongApproachSv: 'Att svara x = 3 i stället för f(3) = −4.',
              rightApproachSv: 'Funktionsvärde betyder alltid y-värdet i vertex.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsfunktion',
          promptSv: 'Vad är symmetrilinjens x-värde för funktionen f(x) = x² − 10x + 16?',
          correctAnswer: '5',
          numericTolerance: 0.01,
          hintSv: 'Använd x = −b / (2a).',
          stepBySolutionSv: 'x = −(−10) / 2 = 5.',
          relatedSectionSlug: 'symmetrilinje-och-vertex',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Andragradsfunktion',
          promptSv: 'Vad är det minsta värdet funktionen f(x) = x² − 10x + 28 antar?',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Symmetrilinjen är x = 5. Beräkna f(5).',
          stepBySolutionSv: 'f(5) = 25 − 50 + 28 = 3.',
          relatedSectionSlug: 'symmetrilinje-och-vertex',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Begrepp',
          promptSv: 'Vilken egenskap har grafen till f(x) = −2x² + 8x + 1?',
          options: [
            'Den har en minimipunkt',
            'Den har en maximipunkt',
            'Den är en rät linje',
            'Den saknar symmetrilinje',
          ],
          correctAnswer: '1',
          hintSv: 'Se på tecknet framför x².',
          stepBySolutionSv: 'Koefficienten −2 < 0 betyder att parabeln är vänd nedåt och har en maximipunkt.',
          relatedSectionSlug: 'symmetrilinje-och-vertex',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Optimering',
          promptSv: 'Två tal har summan 24. Vad är det största möjliga värdet för deras produkt?',
          correctAnswer: '144',
          numericTolerance: 0.5,
          hintSv: 'Ställ upp produkten P(x) = x(24 − x) och hitta vertex.',
          stepBySolutionSv: 'Nollställena är 0 och 24, så max nås vid x = 12: 12 · 12 = 144.',
          relatedSectionSlug: 'symmetrilinje-och-vertex',
        },
      ],
    }),
    buildChapter('course-matte-2b', {
      slug: 'exponentialfunktioner-och-logaritmer',
      chapterNumber: 3,
      titleSv: 'Exponentialfunktioner, potensekvationer och logaritmer',
      summarySv: 'Logaritmlagarna, lösning av exponentialekvationer och tillämpade tillväxtmodeller.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'logaritmlagar',
          titleSv: 'Logaritmlagar och exponentialekvationer',
          overviewConcepts: [
            { term: 'Logaritmlag för produkt', definition: 'lg(a · b) = lg a + lg b för a, b > 0.' },
            { term: 'Logaritmlag för kvot', definition: 'lg(a / b) = lg a − lg b för a, b > 0.' },
          ],
          theoryBlocks: [
            {
              heading: 'Lösa ekonomiska och naturvetenskapliga ekvationer med lg',
              bodySv:
                'Med hjälp av tiologaritmen kan vi besvara frågor som "hur lång tid tar det innan kapitalet fördubblas?" eller "när har värdet halverats?". Först isoleras potensuttrycket a^x i ena ledet, därefter logaritmeras båda leden.',
              deepDiveSv:
                'Kom ihåg att alltid skilja mellan potensekvationer (x^n = c, där basen är okänd och löses med rot/upphöjt till 1/n) och exponentialekvationer (a^x = c, där exponenten är okänd och löses med logaritmer).',
            },
          ],
          formulas: [
            {
              nameSv: 'Logaritmens räknelagar',
              latex: '\\lg(ab) = \\lg a + \\lg b, \\quad \\lg\\left(\\frac{a}{b}\\right) = \\lg a - \\lg b, \\quad \\lg(a^p) = p\\lg a',
              explanationSv: 'Gäller för alla positiva reella tal a och b.',
              variables: [
                { symbol: 'a, b', meaningSv: 'Positiva tal', unit: '> 0' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Förenkla logaritmuttryck',
              givenSv: 'lg 4 + lg 25',
              findSv: 'Exakt värde',
              methodSv: 'lg 4 + lg 25 = lg(4 · 25).',
              stepsSv: ['lg(100) = 2.'],
              answerSv: '2.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Potens- kontra exponentialekvation',
              givenSv: '3 · x⁴ = 48',
              findSv: 'Positiv rot x',
              methodSv: 'Detta är en potensekvation — dividera med 3 och ta fjärderoten.',
              stepsSv: ['x⁴ = 16 ger x = 16^(1/4) = 2.'],
              answerSv: 'x = 2 (för x > 0).',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Förenkla logaritmkvot',
              givenSv: 'lg(x³) − lg(x)',
              findSv: 'Enklare form för x > 0',
              methodSv: 'Använd kvotlagen lg(x³ / x).',
              stepsSv: ['lg(x²) = 2 · lg x.'],
              answerSv: '2 lg x.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Förväxla lg(a + b) med lg a + lg b',
              wrongApproachSv: 'Att skriva lg(10 + 90) = lg 10 + lg 90.',
              rightApproachSv: 'Summan av logaritmer motsvarar produkten av argumenten, inte summan.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Beräkna det exakta värdet av lg 20 + lg 5.',
          correctAnswer: '2',
          numericTolerance: 0.01,
          hintSv: 'lg(20 · 5).',
          stepBySolutionSv: 'lg(20 · 5) = lg 100 = 2.',
          relatedSectionSlug: 'logaritmlagar',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Potensekvationer',
          promptSv: 'Lös ekvationen 2 · x³ = 54. Ange x.',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Dividera med 2 innan du tar tredjeroten.',
          stepBySolutionSv: 'x³ = 27 ger x = 3.',
          relatedSectionSlug: 'logaritmlagar',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Logaritmer',
          promptSv: 'Vilket uttryck motsvarar lg 50 − lg 5?',
          options: ['lg 45', '1', '10', 'lg 250'],
          correctAnswer: '1',
          hintSv: 'lg(50 / 5).',
          stepBySolutionSv: 'lg(50 / 5) = lg 10 = 1.',
          relatedSectionSlug: 'logaritmlagar',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Beräkna det exakta värdet av (lg 1 000) / (lg 10).',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Räkna ut täljare och nämnare var för sig.',
          stepBySolutionSv: 'lg 1 000 = 3 och lg 10 = 1, så 3 / 1 = 3.',
          relatedSectionSlug: 'logaritmlagar',
        },
      ],
    }),
    buildChapter('course-matte-2b', {
      slug: 'normalfordelning-och-regression',
      chapterNumber: 4,
      titleSv: 'Normalfördelning och linjär regression',
      summarySv: 'Anpassning av matematiska modeller till mätdata, korrelationskoefficient och normalfördelade data.',
      isFree: false,
      estimatedMinutes: 30,
      lessons: [
        {
          sectionSlug: 'regression-och-korrelation',
          titleSv: 'Linjär regression och residualer',
          overviewConcepts: [
            { term: 'Regression', definition: 'Metod för att hitta den funktion som bäst ansluter till en punktmängd.' },
            { term: 'Korrelationskoefficient (r)', definition: 'Tal mellan −1 och +1 som mäter hur starkt ett linjärt samband är.' },
          ],
          theoryBlocks: [
            {
              heading: 'Tolka korrelation och extrapolering',
              bodySv:
                'Ett r-värde nära +1 visar stark positiv linjär samvariation och nära −1 stark negativ samvariation. Att läsa av värden inom det uppmätta intervallet kallas interpolering, medan extrapolering (att gissa långt utanför mätområdet) ofta medför stor osäkerhet.',
              deepDiveSv:
                'Minsta kvadratmetoden minimerar summan av de kvadrerade lodräta avstånden (residualerna) från datapunkterna till linjen.',
            },
          ],
          formulas: [
            {
              nameSv: 'Korrelationskoefficientens intervall',
              latex: '-1 \\le r \\le 1',
              explanationSv: 'Ju närmare |r| är 1, desto tätare följer punkterna en rät linje.',
              variables: [
                { symbol: 'r', meaningSv: 'Korrelationskoefficient', unit: 'Enhetslös' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Tolka tecken och styrka på r',
              givenSv: 'r = −0,94',
              findSv: 'Vad säger detta om sambandet?',
              methodSv: 'Tecknet ger riktningen och beloppet ger styrkan.',
              stepsSv: ['Negativt tecken betyder avtagande samband; 0,94 nära 1 betyder mycket starkt linjärt samband.'],
              answerSv: 'Starkt negativt linjärt samband.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Interpolering i regressionslinje',
              givenSv: 'y = 4,5x + 120 anpassad för x mellan 10 och 50',
              findSv: 'Uppskattat värde vid x = 20',
              methodSv: 'Sätt in x = 20 (ligger inom intervallet).',
              stepsSv: ['y = 4,5 · 20 + 120 = 210.'],
              answerSv: '210.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Risk med extrapolering',
              givenSv: 'En barnlängdsmodell y = 6x + 50 för ålder 0–10 år används vid x = 50 år.',
              findSv: 'Varför blir resultatet 350 cm orimligt?',
              methodSv: 'Pröva modellens giltighetsområde.',
              stepsSv: ['Linjär tillväxt upphör i tonåren, så extrapolering långt utanför 0–10 år bryter mot verkliga villkor.'],
              answerSv: 'Modellen gäller bara i barnaåren; extrapolering ger orealistisk längd.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Tro att r = 0 betyder att inget samband alls finns',
              wrongApproachSv: 'Att avfärda alla samband när r ≈ 0.',
              rightApproachSv: 'r mäter enbart linjära samband; en parabel eller periodisk kurva kan ha starkt samband trots r ≈ 0.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'multiple_choice',
          categorySv: 'Regression',
          promptSv: 'Vilken korrelationskoefficient r visar det starkaste linjära sambandet?',
          options: ['r = 0,45', 'r = −0,92', 'r = 0,05', 'r = 0,78'],
          correctAnswer: '1',
          hintSv: 'Se på absolutbeloppet |r|, alltså avståndet till 0.',
          stepBySolutionSv: '|−0,92| = 0,92 är närmast 1, vilket ger starkast linjärt samband.',
          relatedSectionSlug: 'regression-och-korrelation',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Regression',
          promptSv: 'En anpassad regressionslinje för försäljning ges av y = 12x + 300. Vilket y-värde förutsäger modellen vid x = 25?',
          correctAnswer: '600',
          numericTolerance: 0.5,
          hintSv: 'Beräkna 12 · 25 + 300.',
          stepBySolutionSv: '12 · 25 + 300 = 300 + 300 = 600.',
          relatedSectionSlug: 'regression-och-korrelation',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Begrepp',
          promptSv: 'Vad kallas det när man använder en regressionsmodell för att beräkna ett värde utanför det uppmätta mätintervallet?',
          options: ['Interpolering', 'Extrapolering', 'Normalfördelning', 'Faktorisering'],
          correctAnswer: '1',
          hintSv: 'Extra betyder utanför.',
          stepBySolutionSv: 'Utanför det observerade intervallet kallas skattningen extrapolering.',
          relatedSectionSlug: 'regression-och-korrelation',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Analys',
          promptSv: 'Datapunkter ligger exakt på parabeln y = x² symmetriskt för x mellan −5 och 5. Vad blir korrelationskoefficienten r?',
          options: ['r = 1', 'r = −1', 'r ≈ 0', 'r = 25'],
          correctAnswer: '2',
          hintSv: 'r mäter bara rätlinjiga samband.',
          stepBySolutionSv: 'Eftersom parabeln är symmetrisk kring y-axeln finns ingen rätlinjig lutning, så r = 0.',
          relatedSectionSlug: 'regression-och-korrelation',
        },
      ],
    }),
  ],
};

export const matte2cCourse: CourseSeed = {
  id: 'course-matte-2c',
  subjectId: 'subj-matematik',
  slug: 'matte-2c',
  codeGy25: 'MATE2C00X',
  nameSv: 'Matematik 2c',
  levelLabelSv: 'Nivå 2c',
  centralContentSummarySv:
    'Linjära system, kvadratkomplettering och pq-formeln, rotekvationer, andragradsfunktioner, logaritmer samt geometri med cirkelns satser och koordinatgeometri.',
  sortOrder: 6,
  chapters: [
    buildChapter('course-matte-2c', {
      slug: 'linjara-system-och-andragradsfunktioner',
      chapterNumber: 1,
      titleSv: 'Linjära system, rotekvationer och andragradsfunktioner',
      summarySv:
        'Parametrar i ekvationssystem, kvadratkomplettering, pq-formeln med diskriminant, rotekvationer samt andragradsfunktioner och optimering.',
      isFree: true,
      estimatedMinutes: 45,
      lessons: [
        {
          sectionSlug: 'ekvationssystem-och-parametrar',
          titleSv: 'Ekvationssystem, parametrar och räta linjens skärningar',
          overviewConcepts: [
            { term: 'Parameter', definition: 'Konstant (t.ex. k eller a) som avgör antalet lösningar i ett ekvationssystem.' },
            { term: 'Vinkelräta linjer', definition: 'Linjer vars riktningskoefficienter uppfyller k₁ · k₂ = −1.' },
          ],
          theoryBlocks: [
            {
              heading: 'Villkor för entydig, ingen eller oändlig lösning',
              bodySv:
                'Genom att skriva båda ekvationerna i ett system på k-form ser man omedelbart hur linjerna förhåller sig till varandra. Vid k₁ ≠ k₂ finns alltid exakt en lösning. Om k₁ = k₂ avgör m-värdena om linjerna är parallella utan lösning (m₁ ≠ m₂) eller helt sammanfallande med oändligt många lösningar (m₁ = m₂).',
              deepDiveSv:
                'För vinkelräta linjer i koordinatsystemet är produkten av deras lutningar −1, alltså k₂ = −1 / k₁.',
            },
          ],
          formulas: [
            {
              nameSv: 'Villkor för vinkelräta linjer',
              latex: 'k_1 \\cdot k_2 = -1',
              explanationSv: 'Gäller för två räta linjer som skär varandra under 90° (om ingen är lodrät).',
              variables: [
                { symbol: 'k_1, k_2', meaningSv: 'Riktningskoefficienter', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Vinkelrät linje genom given punkt',
              givenSv: 'Linje 1: y = 2x + 3. Linje 2 är vinkelrät mot Linje 1 och går genom (4, 1).',
              findSv: 'Linje 2:s ekvation',
              methodSv: 'Bestäm k₂ = −1 / 2 = −0,5 och sätt in (4, 1).',
              stepsSv: ['1 = −0,5 · 4 + m ger 1 = −2 + m och m = 3.'],
              answerSv: 'y = −0,5x + 3.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Oändligt många lösningar via parameter',
              givenSv: 'ax + 2y = 6 och 6x + 4y = 12',
              findSv: 'Värdet på a som ger oändligt många lösningar',
              methodSv: 'Multiplicera första ekvationen med 2 och jämför termerna.',
              stepsSv: ['2ax + 4y = 12 ska vara identisk med 6x + 4y = 12, alltså 2a = 6 och a = 3.'],
              answerSv: 'a = 3.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Skärning mellan linje och parabel',
              givenSv: 'y = kx + 1 och y = x² + 5',
              findSv: 'För vilka k som graferna inte skär varandra',
              methodSv: 'Sätt uttrycken lika och kräv negativ diskriminant.',
              stepsSv: [
                'x² + 5 = kx + 1 ger x² − kx + 4 = 0.',
                'Diskriminanten (k/2)² − 4 < 0 ger k² < 16, alltså −4 < k < 4.',
              ],
              answerSv: 'För −4 < k < 4 skär graferna aldrig varandra.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma kontrollera om rötterna i en k² < 16-olikhet bildar ett inre intervall',
              wrongApproachSv: 'Att skriva k < 4 utan den undre gränsen k > −4.',
              rightApproachSv: 'Teckna en skiss av parabeln k² − 16 < 0: den är negativ mellan −4 och +4.',
            },
          ],
        },
        {
          sectionSlug: 'pq-formeln-och-diskriminant',
          titleSv: 'Kvadratkomplettering, diskriminant och rotekvationer',
          overviewConcepts: [
            { term: 'Diskriminant (D)', definition: 'D = (p/2)² − q avgör antalet reella rötter till x² + px + q = 0.' },
            { term: 'Falsk rot', definition: 'En lösning som dyker upp när båda led kvadreras men som inte gör ursprungsekvationen sann.' },
          ],
          theoryBlocks: [
            {
              heading: 'Rotekvationer och prövning av rötter',
              bodySv:
                'En rotekvation som √(x + 5) = x − 1 löses genom att isolera rotuttrycket i ena ledet och därefter kvadrera båda sidor. Eftersom kvadrering inte alltid är en ekvivalent operation — både a = b och a = −b ger samma kvadrat a² = b² — kan falska rötter uppstå. Därför är prövning i ursprungsekvationen alltid obligatorisk.',
              deepDiveSv:
                'Kom ihåg att symbolen √A per definition alltid avser det icke-negativa tal vars kvadrat är A (√9 = +3, aldrig −3).',
            },
          ],
          formulas: [
            {
              nameSv: 'Diskriminantvillkor',
              latex: 'D = \\left(\\frac{p}{2}\\right)^2 - q',
              explanationSv: 'D > 0 ger två rötter, D = 0 en dubbelrot och D < 0 inga reella rötter.',
              variables: [
                { symbol: 'D', meaningSv: 'Diskriminant', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Avgöra antal reella rötter',
              givenSv: 'x² − 4x + 5 = 0',
              findSv: 'Antalet reella lösningar',
              methodSv: 'Beräkna diskriminanten D = (−2)² − 5.',
              stepsSv: ['D = 4 − 5 = −1 < 0.'],
              answerSv: 'Ekvationen har 0 reella lösningar.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Rotekvation med falsk rot',
              givenSv: '√(x + 5) = x − 1',
              findSv: 'Samtliga giltiga rötter',
              methodSv: 'Kvadrera båda led och pröva varje kandidat i ursprungsekvationen.',
              stepsSv: [
                'x + 5 = (x − 1)² = x² − 2x + 1.',
                'x² − 3x − 4 = 0 ger x₁ = 4 och x₂ = −1.',
                'Prövning x = 4: VL = √9 = 3, HL = 4 − 1 = 3 (Gäller!).',
                'Prövning x = −1: VL = √4 = 2, HL = −1 − 1 = −2 (Falsk rot!).',
              ],
              answerSv: 'Den enda lösningen är x = 4.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Kvadratkomplettering med allmän koefficient',
              givenSv: 'x² + 6x − 7 = 0',
              findSv: 'Lös genom kvadratkomplettering utan pq-formeln',
              methodSv: 'Lägg till (6/2)² = 9 på båda sidor.',
              stepsSv: [
                'x² + 6x + 9 = 7 + 9 = 16.',
                '(x + 3)² = 16 ger x + 3 = ±4.',
                'x₁ = 1 och x₂ = −7.',
              ],
              answerSv: 'x₁ = 1, x₂ = −7.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma pröva efter kvadrering av rotekvation',
              wrongApproachSv: 'Att godta både x = 4 och x = −1 som lösningar till √(x + 5) = x − 1.',
              rightApproachSv: 'Pröva alltid i ursprungsekvationen före kvadreringen; här uppfyller endast x = 4 kravet HL ≥ 0.',
            },
          ],
        },
        {
          sectionSlug: 'andragradsfunktioner-och-max-min',
          titleSv: 'Andragradsfunktioner, vertexform och optimering',
          overviewConcepts: [
            { term: 'Faktorform', definition: 'f(x) = k(x − x₁)(x − x₂) när nollställena x₁ och x₂ är kända.' },
            { term: 'Vertexform', definition: 'f(x) = a(x − h)² + k där vertex direkt avläses som (h, k).' },
          ],
          theoryBlocks: [
            {
              heading: 'Bestämma funktionsuttryck och optimera areor',
              bodySv:
                'Om en andragradsfunktion har nollställena x₁ och x₂ kan den skrivas f(x) = k(x − x₁)(x − x₂). Med en tredje punkt på grafen kan konstanten k beräknas exakt. I geometriska optimeringsproblem tecknar man arean som en funktion av en sträcka x och söker parabelns symmetrilinje.',
              deepDiveSv:
                'Observera att symmetrilinjen x = (x₁ + x₂) / 2 alltid ger x-koordinaten för extremvärdet, även om funktionen saknar reella nollställen (då via x = −b / (2a)).',
              svgDiagram: SVG_PARABOLA_SYMMETRY,
            },
          ],
          formulas: [
            {
              nameSv: 'Andragradsfunktion på faktorform',
              latex: 'f(x) = k(x - x_1)(x - x_2)',
              explanationSv: 'Användbar när grafens skärningspunkter med x-axeln är kända.',
              variables: [
                { symbol: 'k', meaningSv: 'Skalfaktor och öppningsriktning', unit: 'Tal ≠ 0' },
                { symbol: 'x_1, x_2', meaningSv: 'Nollställen', unit: 'Tal' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Symmetrilinje och minimivärde',
              givenSv: 'f(x) = x² − 8x + 12',
              findSv: 'Vertex',
              methodSv: 'Beräkna x_sym = −(−8) / 2 = 4 och sedan f(4).',
              stepsSv: ['f(4) = 16 − 32 + 12 = −4.'],
              answerSv: 'Vertex ligger i (4, −4), som är en minimipunkt.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Skapa funktionen från nollställen och punkt',
              givenSv: 'Nollställen x₁ = 1 och x₂ = 7 samt f(0) = 7',
              findSv: 'f(4)',
              methodSv: 'Bestäm k ur f(0) = k(0 − 1)(0 − 7) = 7.',
              stepsSv: [
                '7k = 7 ger k = 1, alltså f(x) = (x − 1)(x − 7).',
                'f(4) = (4 − 1)(4 − 7) = 3 · (−3) = −9.',
              ],
              answerSv: 'f(4) = −9.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Maximal hage längs en husvägg',
              givenSv: '40 m staket ska bilda tre sidor av en rektangulär hage mot en husvägg.',
              findSv: 'Maximala arean',
              methodSv: 'Låt kortsidorna vara x; då är långsidan 40 − 2x och arean A(x) = x(40 − 2x).',
              stepsSv: [
                'Nollställena är x = 0 och x = 20, så max nås vid x = 10 m.',
                'Långsidan blir 40 − 20 = 20 m och A_max = 10 · 20 = 200 m².',
              ],
              answerSv: 'Maximala arean är 200 m².',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Sätta k = 1 automatiskt när bara nollställena är kända',
              wrongApproachSv: 'Att skriva f(x) = (x − 1)(x − 7) utan att använda den tredje punkten.',
              rightApproachSv: 'Ha alltid med faktorn k och bestäm den med hjälp av den tredje punkten på kurvan.',
            },
          ],
          interactiveWidgetType: 'graph_explorer',
          interactiveConfig: {
            mode: 'quadratic',
            a: 1,
            b: -8,
            c: 12,
          },
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsfunktion',
          promptSv: 'Vad är symmetrilinjens x-koordinat för f(x) = x² − 8x + 12?',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: 'x = −b / (2a).',
          stepBySolutionSv: 'x = −(−8) / 2 = 4.',
          relatedSectionSlug: 'andragradsfunktioner-och-max-min',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsfunktion',
          promptSv: 'Vad är minimivärdet för funktionen f(x) = x² − 8x + 12?',
          correctAnswer: '-4',
          numericTolerance: 0.01,
          hintSv: 'Beräkna f(4).',
          stepBySolutionSv: 'f(4) = 4² − 8 · 4 + 12 = 16 − 32 + 12 = −4.',
          relatedSectionSlug: 'andragradsfunktioner-och-max-min',
        },
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Andragradsekvation',
          promptSv: 'Lös ekvationen x² + 2x − 15 = 0. Ange den positiva roten.',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'x = −1 ± √(1 + 15).',
          stepBySolutionSv: 'x = −1 ± 4 ger rötterna 3 och −5.',
          relatedSectionSlug: 'pq-formeln-och-diskriminant',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Diskriminant',
          promptSv: 'Hur många reella lösningar har ekvationen x² − 4x + 5 = 0?',
          options: ['Två reella lösningar', 'En dubbelrot', 'Inga reella lösningar', 'Oändligt många lösningar'],
          correctAnswer: '2',
          hintSv: 'Beräkna uttrycket under rottecknet i pq-formeln.',
          stepBySolutionSv: 'D = (−2)² − 5 = 4 − 5 = −1 < 0, så reella lösningar saknas.',
          relatedSectionSlug: 'pq-formeln-och-diskriminant',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Andragradsfunktion',
          promptSv: 'En andragradsfunktion har nollställena x₁ = 1 och x₂ = 7 samt går genom punkten (0, 7). Beräkna funktionens extremvärde f(4).',
          correctAnswer: '-9',
          numericTolerance: 0.01,
          hintSv: 'Ställ upp f(x) = k(x − 1)(x − 7) och bestäm k från f(0) = 7.',
          stepBySolutionSv: '7 = k(−1)(−7) ger k = 1. f(4) = 1 · (4 − 1)(4 − 7) = 3 · (−3) = −9.',
          relatedSectionSlug: 'andragradsfunktioner-och-max-min',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Rotekvationer',
          promptSv: 'Lös rotekvationen √(x + 5) = x − 1. Ange den giltiga roten x.',
          correctAnswer: '4',
          numericTolerance: 0.01,
          hintSv: 'Kvadrera båda led, lös andragradsekvationen och pröva rötterna i ursprungsekvationen.',
          stepBySolutionSv: 'x + 5 = x² − 2x + 1 ger x² − 3x − 4 = 0 med kandidater 4 och −1. Vid x = −1 blir VL = 2 ≠ HL = −2 (falsk rot). Endast x = 4 gäller.',
          relatedSectionSlug: 'pq-formeln-och-diskriminant',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Analys',
          promptSv: 'För vilka värden på k skär linjen y = kx + 1 och parabeln y = x² + 5 aldrig varandra?',
          options: ['k < −4 eller k > 4', '−4 < k < 4', 'Endast k = 4', 'k > 0'],
          correctAnswer: '1',
          hintSv: 'Sätt x² + 5 = kx + 1 och kräv att diskriminanten är negativ.',
          stepBySolutionSv: 'x² − kx + 4 = 0 saknar reella lösningar då (k/2)² − 4 < 0, dvs. k² < 16 eller −4 < k < 4.',
          relatedSectionSlug: 'ekvationssystem-och-parametrar',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Optimering',
          promptSv: 'Med 40 m staket ska en rektangulär hage inhägnas mot en husvägg (staketet bildar tre av sidorna). Vad är den största möjliga arean i m²?',
          correctAnswer: '200',
          numericTolerance: 0.5,
          unitSv: 'm²',
          hintSv: 'Arean är A(x) = x(40 − 2x). Sök parabelns maximipunkt.',
          stepBySolutionSv: 'Nollställena är 0 och 20, så max sker vid x = 10 m: A(10) = 10 · 20 = 200 m².',
          relatedSectionSlug: 'andragradsfunktioner-och-max-min',
        },
      ],
    }),
    buildChapter('course-matte-2c', {
      slug: 'logaritmer-och-exponentialfunktioner',
      chapterNumber: 2,
      titleSv: 'Logaritmlagar och exponentialekvationer',
      summarySv: 'Tiologaritmer, bevis av logaritmlagar och tillämpningar inom radioaktivitet och ekonomi.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'logaritmlagar-och-bevis',
          titleSv: 'Logaritmlagar och sammansatta ekvationer',
          overviewConcepts: [
            { term: 'Logaritmdefinition', definition: 'y = lg x ⇔ 10^y = x för x > 0.' },
          ],
          theoryBlocks: [
            {
              heading: 'Härledning och förenkling',
              bodySv:
                'Eftersom 10^(lg a) = a kan produktlagen visas direkt: a · b = 10^(lg a) · 10^(lg b) = 10^(lg a + lg b), vilket ger lg(ab) = lg a + lg b.',
              deepDiveSv:
                'Logaritmekvationer som lg(x − 2) = 1 kräver kontroll av definitionsmängden x − 2 > 0.',
            },
          ],
          formulas: [
            {
              nameSv: 'Basomvandling',
              latex: '10^{\\lg x} = x \\quad (x > 0)',
              explanationSv: 'Exponentialfunktion med bas 10 och tiologaritm är varandras inverser.',
              variables: [
                { symbol: 'x', meaningSv: 'Positivt tal', unit: '> 0' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Beräkna enkel logaritmisk likhet',
              givenSv: 'lg(x + 3) = 2',
              findSv: 'x',
              methodSv: 'Upphöj 10 till båda led.',
              stepsSv: ['x + 3 = 10² = 100 ger x = 97.'],
              answerSv: 'x = 97.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Förenkla logaritmsumma',
              givenSv: 'lg 8 + lg 125',
              findSv: 'Värdet utan räknare',
              methodSv: 'lg(8 · 125) = lg 1 000.',
              stepsSv: ['lg 1 000 = 3.'],
              answerSv: '3.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Ekvation med två exponentialtermer',
              givenSv: '3 · 2^x = 6 · 5^x',
              findSv: 'x uttryckt med logaritmer',
              methodSv: 'Samla potenser med x på ena sidan och konstanter på den andra.',
              stepsSv: ['(2/5)^x = 6/3 = 2 ger 0,4^x = 2 och x = lg 2 / lg 0,4.'],
              answerSv: 'x = lg 2 / lg 0,4 ≈ −0,76.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma att lg x kräver x > 0',
              wrongApproachSv: 'Att behålla negativa rötter till lg(x²) = 2 utan kontroll om ekvationen löstes från 2 lg x = 2.',
              rightApproachSv: 'Kontrollera alltid att argumentet i ursprungsekvationens logaritmer är strikt positivt.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Lös ekvationen lg(x − 5) = 1. Ange x.',
          correctAnswer: '15',
          numericTolerance: 0.01,
          hintSv: 'x − 5 = 10¹.',
          stepBySolutionSv: 'x − 5 = 10 ger x = 15.',
          relatedSectionSlug: 'logaritmlagar-och-bevis',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Beräkna värdet av lg 8 + lg 125 utan räknare.',
          correctAnswer: '3',
          numericTolerance: 0.01,
          hintSv: 'Använd lg a + lg b = lg(a · b).',
          stepBySolutionSv: 'lg(8 · 125) = lg 1 000 = 3.',
          relatedSectionSlug: 'logaritmlagar-och-bevis',
        },
        {
          gradeLevel: 'C',
          questionType: 'multiple_choice',
          categorySv: 'Logaritmer',
          promptSv: 'Vilket uttryck motsvarar 2 lg 3 + lg 4?',
          options: ['lg 10', 'lg 36', 'lg 12', 'lg 24'],
          correctAnswer: '1',
          hintSv: '2 lg 3 = lg(3²) = lg 9.',
          stepBySolutionSv: 'lg 9 + lg 4 = lg(9 · 4) = lg 36.',
          relatedSectionSlug: 'logaritmlagar-och-bevis',
        },
        {
          gradeLevel: 'A',
          questionType: 'numeric',
          categorySv: 'Logaritmer',
          promptSv: 'Om lg a = 2,4 och lg b = 0,6, vad blir värdet av lg(a² / b)?',
          correctAnswer: '4.2',
          numericTolerance: 0.05,
          hintSv: 'Skriv om uttrycket till 2 lg a − lg b.',
          stepBySolutionSv: '2 · 2,4 − 0,6 = 4,8 − 0,6 = 4,2.',
          relatedSectionSlug: 'logaritmlagar-och-bevis',
        },
      ],
    }),
    buildChapter('course-matte-2c', {
      slug: 'geometri-satser-och-koordinatsystem',
      chapterNumber: 3,
      titleSv: 'Cirkelns satser och koordinatgeometri',
      summarySv: 'Randvinkelsatsen, kordasatsen, mittpunktsformeln, avståndsformeln och cirkelns ekvation.',
      isFree: false,
      estimatedMinutes: 35,
      lessons: [
        {
          sectionSlug: 'cirkel-och-avstandsformeln',
          titleSv: 'Randvinkelsatsen och koordinatgeometri',
          overviewConcepts: [
            { term: 'Randvinkelsatsen', definition: 'Medelpunktsvinkeln är dubbelt så stor som randvinkeln på samma cirkelbåge.' },
            { term: 'Cirkelns ekvation', definition: '(x − x₀)² + (y − y₀)² = r² med medelpunkt (x₀, y₀) och radie r.' },
          ],
          theoryBlocks: [
            {
              heading: 'Vinklar i cirklar och avstånd mellan punkter',
              bodySv:
                'Thales sats är ett specialfall av randvinkelsatsen: en randvinkel som spänner över en diameter (180° medelpunktsvinkel) är alltid 90°. I koordinatsystemet följer avståndsformeln och cirkelns ekvation direkt ur Pythagoras sats.',
              deepDiveSv:
                'För en fyrhörning inskriven i en cirkel är summan av motstående vinklar alltid 180°.',
            },
          ],
          formulas: [
            {
              nameSv: 'Avståndsformeln',
              latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
              explanationSv: 'Beräknar avståndet mellan två punkter i planet.',
              variables: [
                { symbol: 'd', meaningSv: 'Avstånd', unit: 'l.e.' },
              ],
            },
            {
              nameSv: 'Cirkelns ekvation',
              latex: '(x - x_0)^2 + (y - y_0)^2 = r^2',
              explanationSv: 'Beskriver alla punkter på avståndet r från medelpunkten (x₀, y₀).',
              variables: [
                { symbol: 'r', meaningSv: 'Radie', unit: 'l.e.' },
              ],
            },
          ],
          workedExamplesEca: [
            {
              gradeLevel: 'E',
              titleSv: 'Randvinkel från medelpunktsvinkel',
              givenSv: 'Medelpunktsvinkeln är 110°.',
              findSv: 'Randvinkeln på samma båge',
              methodSv: 'Dela med 2.',
              stepsSv: ['110° / 2 = 55°.'],
              answerSv: 'Randvinkeln är 55°.',
            },
            {
              gradeLevel: 'C',
              titleSv: 'Avstånd mellan två koordinater',
              givenSv: 'A(−1, 2) och B(5, 10)',
              findSv: 'Sträckan AB',
              methodSv: 'Använd avståndsformeln.',
              stepsSv: ['d = √((5 − (−1))² + (10 − 2)²) = √(36 + 64) = 10.'],
              answerSv: 'Avståndet är 10 l.e.',
            },
            {
              gradeLevel: 'A',
              titleSv: 'Läsa ut medelpunkt och radie ur cirkelekivation',
              givenSv: 'x² − 6x + y² + 4y = 12',
              findSv: 'Medelpunkt och radie',
              methodSv: 'Kvadratkomplettera både x- och y-termerna.',
              stepsSv: [
                '(x − 3)² − 9 + (y + 2)² − 4 = 12.',
                '(x − 3)² + (y + 2)² = 25 ger r = 5.',
              ],
              answerSv: 'Medelpunkt (3, −2) och radie 5.',
            },
          ],
          examPitfalls: [
            {
              trapTitleSv: 'Glömma ta roten ur r² i cirkelns ekvation',
              wrongApproachSv: 'Att ange radien som 25 när ekvationen slutar på = 25.',
              rightApproachSv: 'Högerledet är r², så radien är √25 = 5.',
            },
          ],
        },
      ],
      questions: [
        {
          gradeLevel: 'E',
          questionType: 'numeric',
          categorySv: 'Geometri',
          promptSv: 'En medelpunktsvinkel i en cirkel är 124°. Hur stor är randvinkeln som står på samma cirkelbåge, i grader?',
          correctAnswer: '62',
          numericTolerance: 0.1,
          unitSv: '°',
          hintSv: 'Randvinkeln är hälften av medelpunktsvinkeln.',
          stepBySolutionSv: '124° / 2 = 62°.',
          relatedSectionSlug: 'cirkel-och-avstandsformeln',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Koordinatgeometri',
          promptSv: 'Vad är radien för cirkeln (x − 2)² + (y + 5)² = 36?',
          correctAnswer: '6',
          numericTolerance: 0.01,
          hintSv: 'Högerledet i cirkelns ekvation är r².',
          stepBySolutionSv: 'r = √36 = 6.',
          relatedSectionSlug: 'cirkel-och-avstandsformeln',
        },
        {
          gradeLevel: 'C',
          questionType: 'numeric',
          categorySv: 'Koordinatgeometri',
          promptSv: 'Beräkna avståndet mellan punkterna (1, 1) och (9, 7).',
          correctAnswer: '10',
          numericTolerance: 0.05,
          hintSv: 'd = √((9 − 1)² + (7 − 1)²).',
          stepBySolutionSv: '√(8² + 6²) = √(64 + 36) = √100 = 10.',
          relatedSectionSlug: 'cirkel-och-avstandsformeln',
        },
        {
          gradeLevel: 'A',
          questionType: 'multiple_choice',
          categorySv: 'Geometri',
          promptSv: 'En triangel är inskriven i en cirkel så att en av triangelns sidor utgör cirkelns diameter. Hur stort är motstående hörn?',
          options: ['45°', '60°', '90°', '120°'],
          correctAnswer: '2',
          hintSv: 'Medelpunktsvinkeln över en diameter är 180°.',
          stepBySolutionSv: 'Enligt randvinkelsatsen (Thales sats) är vinkeln 180° / 2 = 90°.',
          relatedSectionSlug: 'cirkel-och-avstandsformeln',
        },
      ],
    }),
  ],
};
