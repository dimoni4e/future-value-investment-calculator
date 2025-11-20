-- Missing Home Content for Spanish (es) and Polish (pl)
-- This script adds the missing home content translations to match the English content

-- Spanish (es) home content
INSERT INTO home_content (locale, section, key, value) VALUES
-- Layout section
('es', 'layout', 'title', 'Calculadora de inversión futura'),
('es', 'layout', 'description', 'Planifica Tu Futuro Financiero'),

-- Navigation section  
('es', 'navigation', 'home', 'Inicio'),
('es', 'navigation', 'about', 'Acerca de'),
('es', 'navigation', 'contact', 'Contacto'),

-- Hero section
('es', 'hero', 'badge', 'Planificación de Inversiones Profesional'),
('es', 'hero', 'subtitle', 'Toma decisiones de inversión informadas con nuestra calculadora avanzada de interés compuesto. Visualiza escenarios de crecimiento, compara estrategias y construye confianza en tu viaje financiero.'),
('es', 'hero', 'startCalculating', 'Comenzar Cálculo'),
('es', 'hero', 'watchDemo', 'Ver Demo'),
('es', 'hero', 'compoundInterest', 'Interés Compuesto'),
('es', 'hero', 'interactiveCharts', 'Gráficos Interactivos'),
('es', 'hero', 'scenarioPlanning', 'Planificación de Escenarios'),
('es', 'hero', 'exportResults', 'Exportar Resultados'),

-- Features section
('es', 'features', 'title', 'Tu Suite Completa de Planificación Financiera'),
('es', 'features', 'subtitle', 'Herramientas avanzadas y análisis para ayudarte a tomar decisiones de inversión informadas con confianza'),
('es', 'features', 'advancedCalculator', 'Calculadora Avanzada'),
('es', 'features', 'advancedCalculatorDesc', 'Cálculos precisos de interés compuesto con parámetros personalizables para cualquier escenario de inversión'),
('es', 'features', 'visualAnalytics', 'Análisis Visual'),
('es', 'features', 'visualAnalyticsDesc', 'Gráficos interactivos que dan vida a tus proyecciones de inversión'),
('es', 'features', 'goalPlanning', 'Planificación de Objetivos'),
('es', 'features', 'goalPlanningDesc', 'Establece metas financieras y ve exactamente lo que se necesita para lograr tus objetivos de inversión');

-- Polish (pl) home content
INSERT INTO home_content (locale, section, key, value) VALUES
-- Layout section
('pl', 'layout', 'title', 'Kalkulator przyszłej inwestycji'),
('pl', 'layout', 'description', 'Zaplanuj Swoją Przyszłość Finansową'),

-- Navigation section
('pl', 'navigation', 'home', 'Strona główna'),
('pl', 'navigation', 'about', 'O nas'),
('pl', 'navigation', 'contact', 'Kontakt'),

-- Hero section
('pl', 'hero', 'badge', 'Profesjonalne Planowanie Inwestycji'),
('pl', 'hero', 'subtitle', 'Podejmuj świadome decyzje inwestycyjne dzięki naszemu zaawansowanemu kalkulatorowi odsetek składanych. Wizualizuj scenariusze wzrostu, porównuj strategie i buduj pewność w swojej podróży finansowej.'),
('pl', 'hero', 'startCalculating', 'Rozpocznij Obliczenia'),
('pl', 'hero', 'watchDemo', 'Zobacz Demo'),
('pl', 'hero', 'compoundInterest', 'Odsetki Składane'),
('pl', 'hero', 'interactiveCharts', 'Interaktywne Wykresy'),
('pl', 'hero', 'scenarioPlanning', 'Planowanie Scenariuszy'),
('pl', 'hero', 'exportResults', 'Eksport Wyników'),

-- Features section
('pl', 'features', 'title', 'Kompletny Pakiet Planowania Finansowego'),
('pl', 'features', 'subtitle', 'Zaawansowane narzędzia i analityka pomagające podejmować świadome decyzje inwestycyjne z pewnością siebie'),
('pl', 'features', 'advancedCalculator', 'Zaawansowany Kalkulator'),
('pl', 'features', 'advancedCalculatorDesc', 'Precyzyjne obliczenia odsetek składanych z konfigurowalnymi parametrami dla każdego scenariusza inwestycyjnego'),
('pl', 'features', 'visualAnalytics', 'Analityka Wizualna'),
('pl', 'features', 'visualAnalyticsDesc', 'Interaktywne wykresy i grafy, które ożywiają twoje prognozy inwestycyjne'),
('pl', 'features', 'goalPlanning', 'Planowanie Celów'),
('pl', 'features', 'goalPlanningDesc', 'Ustaw cele finansowe i zobacz dokładnie, co trzeba zrobić, aby osiągnąć swoje cele inwestycyjne');
